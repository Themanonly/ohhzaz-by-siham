import assert from 'node:assert/strict';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {Pool} from 'pg';
import {databaseOptions} from '../lib/database-options.mjs';
import {validReview} from '../lib/review-validation.ts';
const base=process.env.REVIEW_TEST_URL||'http://127.0.0.1:3062';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw new Error('Use local server for review fixtures');
const value={name:'QA '+randomUUID().slice(0,8),rating:4,comment:'Automated review workflow fixture. Not a customer testimonial.',locale:'fr',consent:true,website:''};
assert(validReview(value));for(const change of [{rating:0},{rating:6},{rating:2.5},{consent:false},{comment:'short'},{name:'a'},{website:'spam'},{locale:'en'}])assert(!validReview({...value,...change}));
const db=new Pool(databaseOptions()),staffId=randomUUID(),token=randomBytes(32).toString('hex');
const digest=s=>createHash('sha256').update(s).digest('hex');
let reviewId;
const send=(path,body,extra={})=>fetch(base+path,{method:'POST',headers:{Origin:base,'Content-Type':'application/json',...extra},body:JSON.stringify(body)});
try{
 assert.equal((await send('/api/reviews',value,{Origin:'https://invalid.example'})).status,403);
 assert.equal((await send('/api/reviews',{...value,rating:6})).status,400);
 assert.equal((await send('/api/reviews',value)).status,202);
 const row=(await db.query('SELECT id,status FROM salon_reviews WHERE name=$1',[value.name])).rows[0];reviewId=row.id;assert.equal(row.status,'pending');
 assert(!(await (await fetch(base+'/api/reviews')).json()).reviews.some(r=>r.id===reviewId));
 assert.equal((await fetch(base+'/api/admin/reviews')).status,401);
 await db.query(`INSERT INTO salon_staff(id,email,password_hash,role) VALUES($1,$2,'unused','manager')`,[staffId,staffId+'@example.invalid']);
 await db.query(`INSERT INTO salon_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '5 minutes')`,[digest(token),staffId]);
 const headers={Origin:base,'Content-Type':'application/json',Cookie:'ohhzaz_session='+token};
 assert.equal((await fetch(base+'/api/admin/reviews',{headers})).status,403);
 await db.query("UPDATE salon_staff SET role='admin' WHERE id=$1",[staffId]);
 assert.equal((await fetch(base+'/api/admin/reviews',{headers})).status,200);
 for(const status of ['published','hidden']){assert.equal((await fetch(base+'/api/admin/reviews',{method:'PATCH',headers,body:JSON.stringify({id:reviewId,status})})).status,200);const publicData=await (await fetch(base+'/api/reviews')).json();assert.equal(publicData.reviews.some(r=>r.id===reviewId),status==='published');if(status==='published')assert(publicData.count>=1)}
 assert.equal((await fetch(base+'/api/admin/reviews?id='+reviewId,{method:'DELETE',headers})).status,200);
 console.log('PASS review validation, consent, origin protection, pending privacy, manager denial, owner moderation, public visibility and deletion');
}finally{
 await db.query('DELETE FROM salon_reviews WHERE name=$1',[value.name]);await db.query('DELETE FROM salon_staff WHERE id=$1',[staffId]);await db.query('DELETE FROM salon_review_limits WHERE key=$1',['name:'+digest(value.name.toLowerCase())]);await db.end();
}
