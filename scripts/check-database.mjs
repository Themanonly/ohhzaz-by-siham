import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {Pool} from 'pg';
import {databaseOptions} from '../lib/database-options.mjs';
import {passwordHash,digest} from '../lib/password.ts';

// Temporary identities are never displayed, and are removed in finally.
const db=new Pool(databaseOptions());
const base='http://127.0.0.1:3031';
const ids=[randomUUID(),randomUUID()];
const emails=ids.map(id=>`qa-${id}@example.invalid`);
const password=randomBytes(24).toString('hex');
let categoryId, server;
const request=(path,method='GET',body,cookie,origin=base)=>fetch(base+'/api/admin/'+path,{method,headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
try {
  assert.equal((await db.query('SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()')).rows[0].ssl,true);
  for(let i=0;i<2;i++) await db.query('INSERT INTO salon_staff(id,email,password_hash,role) VALUES($1,$2,$3,$4)',[ids[i],emails[i],passwordHash(password),i?'manager':'admin']);
  server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3031'],{stdio:'ignore'});
  let ready=false;
  for(let i=0;i<40;i++){try{if((await request('auth/session')).status===401){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}
  assert(ready,'Server not ready');
  assert.equal((await request('data/products')).status,401);
  assert.equal((await request('auth/login','POST',{email:emails[0],password},undefined,'https://untrusted.invalid')).status,403);
  const login=async i=>{const response=await request('auth/login','POST',{email:emails[i],password});assert.equal(response.status,200);const header=response.headers.get('set-cookie');assert.match(header,/HttpOnly/i);assert.match(header,/Secure/i);assert.match(header,/SameSite=strict/i);return header.split(';')[0];};
  const admin=await login(0),manager=await login(1);
  assert.equal((await (await request('auth/session','GET',undefined,manager)).json()).role,'manager');
  assert.equal((await request('data/social_links','POST',{platform:'tiktok',url:'https://www.tiktok.com/@test'},manager)).status,403);
  assert.equal((await request('data/salon_staff','GET',undefined,admin)).status,404);
  const created=await request('data/product_categories','POST',{name:{fr:'Temporary QA category',ar:'اختبار مؤقت'}},manager);
  assert.equal(created.status,200);categoryId=(await created.json())[0].id;
  assert.equal((await db.query('SELECT count(*)::int AS n FROM product_categories WHERE id=$1',[categoryId])).rows[0].n,1);
  assert.equal((await request('auth/logout','POST',undefined,manager)).status,200);
  assert.equal((await request('data/products','GET',undefined,manager)).status,401);
  console.log('PASS: verified TLS, anonymous denial, CSRF, secure cookies, roles, persistent manager write, staff isolation and logout.');
} finally {
  if(server)server.kill();
  if(categoryId)await db.query('DELETE FROM product_categories WHERE id=$1',[categoryId]);
  await db.query('DELETE FROM salon_staff WHERE id=ANY($1::uuid[])',[ids]);
  await db.query('DELETE FROM salon_login_limits WHERE key=ANY($1::text[])',[emails.map(digest)]);
  await db.end();
}
