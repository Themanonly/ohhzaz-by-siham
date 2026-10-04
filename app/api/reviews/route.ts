import {randomUUID,createHash} from 'node:crypto';
import {database,databaseReady} from '../../../lib/db';
import {trustedOrigin} from '../../../lib/request-security';
import {validReview} from '../../../lib/review-validation';
export const runtime='nodejs';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){
 if(!databaseReady())return json({error:'Unavailable'},503);
 try{const db=database();const result=await db.query(`SELECT id,name,rating,comment,locale,created_at FROM salon_reviews WHERE status='published' ORDER BY created_at DESC LIMIT 12`);const summary=await db.query(`SELECT count(*)::int AS count, round(avg(rating),1)::float AS average FROM salon_reviews WHERE status='published'`);return json({reviews:result.rows,...summary.rows[0]});}catch{return json({error:'Unavailable'},503)}
}
export async function POST(req:Request){
 if(!trustedOrigin(req.headers.get('origin'),req.url,process.env.SITE_URL))return json({error:'Origin rejected'},403);
 if(!(req.headers.get('content-type')||'').startsWith('application/json'))return json({error:'JSON required'},415);
 if(!databaseReady())return json({error:'Unavailable'},503);
 try{
 const reader=req.body?.getReader();if(!reader)return json({error:'Invalid review'},400);
 let size=0;const chunks:Uint8Array[]=[];
 while(true){const item=await reader.read();if(item.done)break;size+=item.value.length;if(size>8192){await reader.cancel();return json({error:'Too large'},413)}chunks.push(item.value)}
 const value=JSON.parse(Buffer.concat(chunks).toString());if(!validReview(value))return json({error:'Invalid review'},400);
 const name=value.name.trim(),comment=value.comment.trim();const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
 const db=database();
 await db.query('DELETE FROM salon_review_limits WHERE reset_at<now()');
 for(const [key,max] of [['global',40],['name:'+hash(name.normalize('NFKC').toLowerCase()),3]] as const){const limit=await db.query(`INSERT INTO salon_review_limits(key,attempts,reset_at) VALUES($1,1,now()+interval '24 hours') ON CONFLICT(key) DO UPDATE SET attempts=salon_review_limits.attempts+1 RETURNING attempts`,[key]);if(limit.rows[0].attempts>max)return json({error:'Try later'},429)}
 await db.query(`INSERT INTO salon_reviews(id,name,rating,comment,locale,fingerprint) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(fingerprint) DO NOTHING`,[randomUUID(),name,value.rating,comment,value.locale,hash(JSON.stringify([name.toLowerCase(),comment.toLowerCase(),value.rating]))]);
 return json({ok:true,status:'pending'},202);
 }catch(e){return json({error:'Unable to submit'},e instanceof SyntaxError?400:503)}
}
