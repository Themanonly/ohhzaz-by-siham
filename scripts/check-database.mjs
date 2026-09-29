import assert from 'node:assert/strict';
import {randomUUID,randomBytes,scryptSync} from 'node:crypto';
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
let categoryId, productId, mediaId, server;
const request=(path,method='GET',body,cookie,origin=base)=>fetch(base+'/api/admin/'+path,{method,headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
try {
  assert.equal((await db.query('SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()')).rows[0].ssl,true);
  const legacySalt=randomBytes(16).toString('hex');
  const legacyHash=legacySalt+':'+scryptSync(password,legacySalt,64,{N:16384,r:8,p:1}).toString('hex');
  for(let i=0;i<2;i++) await db.query('INSERT INTO salon_staff(id,email,password_hash,role) VALUES($1,$2,$3,$4)',[ids[i],emails[i],i?passwordHash(password):legacyHash,i?'manager':'admin']);
  server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3031'],{stdio:'ignore'});
  let ready=false;
  for(let i=0;i<40;i++){try{if((await request('auth/session')).status===401){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}
  assert(ready,'Server not ready');
  assert.equal((await request('data/products')).status,401);
  assert.equal((await request('auth/login','POST',{email:emails[0],password},undefined,'https://untrusted.invalid')).status,403);
  const login=async i=>{const response=await request('auth/login','POST',{email:emails[i],password});assert.equal(response.status,200);const header=response.headers.get('set-cookie');assert.match(header,/HttpOnly/i);assert.match(header,/Secure/i);assert.match(header,/SameSite=strict/i);return header.split(';')[0];};
  const admin=await login(0),manager=await login(1);
  assert.equal((await db.query("SELECT password_hash LIKE 'scrypt-v2:%' AS upgraded FROM salon_staff WHERE id=$1",[ids[0]])).rows[0].upgraded,true);
  await login(0); // The upgraded hash must work on the next login too.
  assert.equal((await (await request('auth/session','GET',undefined,manager)).json()).role,'manager');
  assert.equal((await request('data/social_links','POST',{platform:'tiktok',url:'https://www.tiktok.com/@test'},manager)).status,403);
  assert.equal((await request('data/salon_staff','GET',undefined,admin)).status,404);
  const created=await request('data/product_categories','POST',{name:{fr:'Temporary QA category',ar:'اختبار مؤقت'}},manager);
  assert.equal(created.status,200);categoryId=(await created.json())[0].id;
  assert.equal((await db.query('SELECT count(*)::int AS n FROM product_categories WHERE id=$1',[categoryId])).rows[0].n,1);

  const sharp=(await import('sharp')).default;
  const image=await sharp({create:{width:2,height:2,channels:3,background:'#e4d4bb'}}).png().toBuffer();
  const upload=await fetch(base+'/api/admin/uploads',{method:'POST',headers:{Origin:base,Cookie:manager,'Content-Type':'image/png'},body:image});
  assert.equal(upload.status,200);const mediaUrl=(await upload.json()).url;mediaId=mediaUrl.split('/').at(-1);
  assert.equal((await fetch(base+mediaUrl)).status,404);
  assert.equal((await fetch(base+mediaUrl,{headers:{Cookie:manager}})).status,200);
  const product={name:{fr:'Temporary QA product',ar:'اختبار مؤقت'},price:10,category_id:categoryId,image:mediaUrl,status:'published'};
  assert.equal((await request('data/products','POST',{...product,image:'/api/media/'+randomUUID()},manager)).status,400);
  const createdProduct=await request('data/products','POST',product,manager);assert.equal(createdProduct.status,200);productId=(await createdProduct.json())[0].id;
  assert.equal((await fetch(base+mediaUrl)).status,200);
  assert.equal((await request('data/products?id='+productId,'PATCH',{...product,status:'draft'},manager)).status,200);
  assert.equal((await fetch(base+mediaUrl)).status,404);
  assert.equal((await request('auth/logout','POST',undefined,manager)).status,200);
  assert.equal((await request('data/products','GET',undefined,manager)).status,401);
  console.log('PASS: verified TLS, password upgrade and repeat login, anonymous denial, CSRF, secure cookies, roles, persistent manager write, staff isolation, upload visibility, unpublishing and logout.');
} finally {
  if(server)server.kill();
  if(productId)await db.query('DELETE FROM products WHERE id=$1',[productId]);
  if(mediaId)await db.query('DELETE FROM salon_media WHERE id=$1',[mediaId]);
  if(categoryId)await db.query('DELETE FROM product_categories WHERE id=$1',[categoryId]);
  await db.query('DELETE FROM salon_staff WHERE id=ANY($1::uuid[])',[ids]);
  await db.query('DELETE FROM salon_login_limits WHERE key=ANY($1::text[])',[emails.map(digest)]);
  await db.end();
}
