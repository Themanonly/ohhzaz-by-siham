import assert from 'node:assert/strict';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {Pool} from 'pg';
import sharp from 'sharp';
import {databaseOptions} from '../lib/database-options.mjs';

// Explicit opt-in only: creates an invisible draft and a short-lived test session.
// Never publishes a test, changes staff credentials or alters existing products.
assert(process.argv.includes('--allow-private-fixtures'),'Private fixture opt-in is required');
const base=process.argv.find(a=>a.startsWith('--base='))?.slice(7);
assert(['https://ohhzaz.com','http://127.0.0.1:3083'].includes(base),'Use the approved production or local QA origin');
const db=new Pool(databaseOptions());
const id=randomUUID(),marker='TEST PRIVÉ — '+id;
const token=randomBytes(32).toString('hex'),hash=createHash('sha256').update(token).digest('hex');
const cookie='ohhzaz_session='+token;
const headers={Cookie:cookie,Origin:base};
const request=(path,method='GET',body,extra={})=>fetch(base+'/api/admin/'+path,{method,headers:{...headers,...(body?{'Content-Type':'application/json'}:{}),...extra},body:body?JSON.stringify(body):undefined});
let baseline=[];
try{
 baseline=(await db.query('SELECT * FROM products ORDER BY id')).rows;
 const owner=(await db.query("SELECT id FROM salon_staff WHERE active AND role='admin' LIMIT 1")).rows[0];assert(owner);
 await db.query("INSERT INTO salon_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '10 minutes')",[hash,owner.id]);
 assert.equal((await request('auth/session')).status,200);
 assert.equal((await fetch(base+'/api/admin/data/products')).status,401);
 const categories=await (await request('data/product_categories')).json();assert(categories.length);
 const photo=await sharp({create:{width:2000,height:1500,channels:3,background:'#e4d4bb'}}).jpeg({quality:90}).toBuffer();
 const upload=await fetch(base+'/api/admin/uploads',{method:'POST',headers:{...headers,'Content-Type':'image/jpeg'},body:photo});
 assert.equal(upload.status,200,'A real JPEG must upload');const image=(await upload.json()).url;
 assert.equal((await fetch(base+image)).status,404,'Unattached media must be private');
 const privatePhoto=await fetch(base+image,{headers:{Cookie:cookie}});assert.equal(privatePhoto.status,200);
 const meta=await sharp(Buffer.from(await privatePhoto.arrayBuffer())).metadata();assert.equal(meta.width,1600);assert.equal(meta.height,1200);
 const extraUpload=await fetch(base+'/api/admin/uploads',{method:'POST',headers:{...headers,'Content-Type':'image/jpeg'},body:photo});
 assert.equal(extraUpload.status,200);const extraImage=(await extraUpload.json()).url;
 const product={category_id:categories[0].id,image,images:[image,extraImage],name:{fr:marker,ar:'اختبار خاص'},description:{fr:'Contrôle privé, jamais publié.',ar:''},price:299.90,status:'draft'};
 const key={'Idempotency-Key':id};
 const first=await request('data/products','POST',product,key);assert.equal(first.status,200);assert.equal((await first.json())[0].id,id);
 // Simulate retries after a successful insert whose response was lost.
 const repeats=await Promise.all([request('data/products','POST',product,key),request('data/products','POST',product,key)]);
 for(const repeat of repeats){assert.equal(repeat.status,200);assert.equal((await repeat.json())[0].id,id);}
 assert.equal((await db.query('SELECT count(*)::int AS n FROM products WHERE id=$1 OR name->>\'fr\'=$2',[id,marker])).rows[0].n,1);
 assert.equal((await request('data/products','POST',{...product,price:7},key)).status,409,'A replay cannot overwrite different data');
 assert.equal((await request('data/products','POST',product,{'Idempotency-Key':'invalid'})).status,400);
 let listed=await (await request('data/products')).json();assert.equal(listed.find(p=>p.id===id)?.price,299.90);
 const edited={...product,image:extraImage,images:[extraImage,image],price:319.50,description:{fr:'Description modifiée.',ar:'وصف معدّل'}};
 assert.equal((await request('data/products?id=eq.'+id,'PATCH',edited)).status,200);
 listed=await (await request('data/products')).json();assert.equal(listed.find(p=>p.id===id)?.price,319.50);
 assert.deepEqual(listed.find(p=>p.id===id)?.images,[extraImage,image]);
 assert.equal((await fetch(base+extraImage)).status,404,'Extra draft image must remain private');
 const legacy={...edited};delete legacy.images;
 assert.equal((await request('data/products?id=eq.'+id,'PATCH',legacy)).status,200);
 listed=await (await request('data/products')).json();assert.deepEqual(listed.find(p=>p.id===id)?.images,[extraImage,image],'An older client must preserve the gallery');
 assert.equal((await request('data/products?id=eq.'+id,'PATCH',{...edited,images:[extraImage]})).status,200);
 for(const invalid of [[],Array(9).fill(extraImage),[image,extraImage],['https://example.com/photo.jpg']])assert.equal((await request('data/products?id=eq.'+id,'PATCH',{...edited,images:invalid})).status,400);
 assert.equal((await fetch(base+image)).status,404,'Draft image must remain private after editing');
 assert.equal((await request('data/products?id=eq.'+id,'DELETE')).status,200);
 assert.equal((await (await request('data/products')).json()).some(p=>p.id===id),false);
 assert.equal((await request('auth/logout','POST')).status,200);
 assert.equal((await request('auth/session')).status,401);
 console.log('PASS: real JPEG upload/resizing, authenticated create, repeated and concurrent retry deduplication, conflict protection, fresh GET persistence, editing, private image access, draft deletion and logout.');
}finally{
 await db.query("DELETE FROM products WHERE name->>'fr'=$1 AND status='draft'",[marker]);
 await db.query('DELETE FROM salon_sessions WHERE token_hash=$1',[hash]);
 try{
  for(const original of baseline){const current=(await db.query('SELECT * FROM products WHERE id=$1',[original.id])).rows[0];assert.deepEqual(current,original,'Existing product changed during the test');}
  console.log('Existing products preserved; temporary product and session removed. Uploaded test media remains private under restricted runtime permissions.');
 }finally{await db.end();}
}
