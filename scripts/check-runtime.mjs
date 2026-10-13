import assert from 'node:assert/strict';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {Pool} from 'pg';
import {readFileSync} from 'node:fs';
import {databaseOptions} from '../lib/database-options.mjs';

// Tests the actual restricted connection with uniquely named temporary records.
// Existing products, contacts, prices, passwords and staff roles are never modified.
const db=new Pool(databaseOptions());
const base='http://127.0.0.1:3082';
const categoryId=randomUUID(),productId=randomUUID();
const token=randomBytes(32).toString('hex'),tokenHash=createHash('sha256').update(token).digest('hex');
const cookie='ohhzaz_session='+token;
let server,fixtures=false;
const request=(path,method='GET',body,authenticated=true,origin=base)=>fetch(base+'/api/admin/'+path,{method,headers:{Origin:origin,...(authenticated?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
try{
 assert(JSON.parse(readFileSync('docs/SUPABASE-MIGRATION-RESULT.json','utf8')).liveCutoverPending===true,'Run this migration QA only before cutover, while Supabase is isolated from the live website');
 const connection=await db.connect();
 try{assert.equal(connection.connection.stream.encrypted,true);assert.equal(connection.connection.stream.authorized,true);}finally{connection.release();}
 const permissions=(await db.query("SELECT rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls,has_schema_privilege(current_user,'public','CREATE') AS schema_create,has_table_privilege(current_user,'salon_staff','INSERT') AS staff_insert,has_column_privilege(current_user,'salon_staff','role','UPDATE') AS role_update FROM pg_roles WHERE rolname=current_user")).rows[0];
 assert(Object.values(permissions).every(v=>v===false),'Runtime must not have owner powers');
 const owner=(await db.query("SELECT id FROM salon_staff WHERE active AND role='admin' LIMIT 1")).rows[0];assert(owner,'Existing active owner required');
 await db.query("INSERT INTO salon_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '5 minutes')",[tokenHash,owner.id]);
 fixtures=true;
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3082'],{stdio:'ignore'});
 let ready=false;
 for(let i=0;i<40;i++){try{if((await request('auth/session','GET',undefined,false)).status===401){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}
 assert(ready,'Server must start');
 assert.equal((await request('data/products','GET',undefined,false)).status,401);
 assert.equal((await request('auth/session')).status,200);
 assert.equal((await request('data/salon_staff')).status,404);
 const privateImage=(await db.query("SELECT m.id FROM salon_media m WHERE NOT EXISTS(SELECT 1 FROM products p WHERE p.image='/api/media/'||m.id AND p.status='published') LIMIT 1")).rows[0];
 assert(privateImage,'A migrated private image is required for the isolated privacy test');
 const mediaId=privateImage.id;
 await db.query('INSERT INTO product_categories(id,name) VALUES($1,$2)',[categoryId,{fr:'Private migration QA',ar:'اختبار خاص'}]);
 const product={name:{fr:'Private migration QA',ar:'اختبار خاص'},description:{fr:'',ar:''},price:10,category_id:categoryId,image:'/api/media/'+mediaId,status:'draft'};
 await db.query('INSERT INTO products(id,category_id,name,description,price,image,status) VALUES($1,$2,$3,$4,$5,$6,$7)',[productId,categoryId,product.name,product.description,10,product.image,'draft']);
 assert.equal((await fetch(base+product.image)).status,404);
 assert.equal((await fetch(base+product.image,{headers:{Cookie:cookie}})).status,200);
 assert.equal((await request('data/products?id='+productId,'PATCH',{...product,status:'published'},true,'https://untrusted.invalid')).status,403);
 assert.equal((await request('data/products?id='+productId,'PATCH',{...product,status:'published'})).status,200);
 const variant=await fetch(base+product.image+'?w=320');assert.equal(variant.status,200);assert.equal(variant.headers.get('content-type'),'image/webp');
 const tag=variant.headers.get('etag');assert.ok(tag);
 assert.equal((await fetch(base+product.image+'?w=320',{headers:{'If-None-Match':tag}})).status,304);
 assert.equal((await fetch(base+product.image+'?w=9999')).status,400);
 assert.equal((await request('data/products?id='+productId,'DELETE')).status,409);
 assert.equal((await request('data/products?id='+productId,'PATCH',product)).status,200);
 assert.equal((await fetch(base+product.image+'?w=320',{headers:{'If-None-Match':tag}})).status,404);
 assert.equal((await request('data/products?id='+productId,'DELETE',undefined,false)).status,401);
 assert.equal((await request('data/products?id='+productId,'DELETE')).status,200);
 assert.equal((await db.query('SELECT 1 FROM products WHERE id=$1',[productId])).rowCount,0);
 assert.equal((await request('data/products?id='+productId,'DELETE')).status,409);
 assert.equal((await request('auth/logout','POST')).status,200);
 assert.equal((await request('auth/session')).status,401);
 console.log('PASS: Supabase verified TLS, restricted role, session, CSRF, staff isolation, product mutations, private/public media, image variants/ETags, protected published products, draft deletion and logout.');
}finally{
 server?.kill();
 if(fixtures){
  await db.query('DELETE FROM products WHERE id=$1',[productId]);
  await db.query('DELETE FROM product_categories WHERE id=$1',[categoryId]);
  await db.query('DELETE FROM salon_sessions WHERE token_hash=$1',[tokenHash]);
 }
 await db.end();
}
