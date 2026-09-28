import {cookies} from 'next/headers';
import {randomBytes,randomUUID} from 'node:crypto';
import sharp from 'sharp';
import {database,databaseReady} from '../../../../lib/db';
import {digest,passwordMatches,needsPasswordUpgrade,upgradedPasswordHash} from '../../../../lib/password';
import {contactIdentity,contactHref} from '../../../../lib/contacts';
import {validServices} from '../../../../lib/catalogue-validation';
import {trustedOrigin} from '../../../../lib/request-security';
import type {SocialLink} from '../../../../data/catalogue';
export const runtime='nodejs';
const COOKIE='ohhzaz_session';
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
async function bytes(req:Request,max:number){if(Number(req.headers.get('content-length'))>max)throw new Error('size');const reader=req.body?.getReader();if(!reader)return Buffer.alloc(0);const chunks:Uint8Array[]=[];let size=0;while(true){const item=await reader.read();if(item.done)break;size+=item.value.length;if(size>max){await reader.cancel();throw new Error('size');}chunks.push(item.value);}return Buffer.concat(chunks);}
async function handle(req:Request,{params}:{params:Promise<{path:string[]}>}){
 if(!databaseReady())return json({error:'Database not configured'},503);
 const path=(await params).path.join('/');const url=new URL(req.url);const mutation=req.method!=='GET';
 const origin=req.headers.get('origin');
 if(mutation&&!trustedOrigin(origin,req.url,process.env.SITE_URL))return json({error:'Origin rejected'},403);
 if(mutation&&path!=='uploads'&&path!=='auth/logout'&&!(req.headers.get('content-type')||'').startsWith('application/json'))return json({error:'JSON required'},415);
 const db=database();const jar=await cookies();
 try{
 if(path==='auth/login'&&req.method==='POST'){
  const b=JSON.parse((await bytes(req,4096)).toString());if(!b||typeof b!=='object'||Array.isArray(b))return json({error:'Invalid login'},401);const email=String(b.email||'').trim().toLowerCase();const password=String(b.password||'');if(!email||email.length>254||password.length>256)return json({error:'Invalid login'},401);
  for(const [key,max] of [[digest(email),8],['global',150]] as const){const limit=await db.query(`INSERT INTO salon_login_limits(key,attempts,reset_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN salon_login_limits.reset_at<now() THEN 1 ELSE salon_login_limits.attempts+1 END, reset_at=CASE WHEN salon_login_limits.reset_at<now() THEN now()+interval '15 minutes' ELSE salon_login_limits.reset_at END RETURNING attempts`,[key]);if(limit.rows[0].attempts>max)return json({error:'Try again later'},429);}
  const staff=(await db.query('SELECT id,password_hash,role FROM salon_staff WHERE email=$1 AND active=true',[email])).rows[0];
  const valid=await passwordMatches(password,staff?.password_hash||'scrypt-v2:00000000000000000000000000000000:'+ '00'.repeat(64));if(!staff||!valid||!['admin','manager'].includes(staff.role))return json({error:'Invalid login'},401);
  if(needsPasswordUpgrade(staff.password_hash))await db.query('UPDATE salon_staff SET password_hash=$1 WHERE id=$2 AND password_hash=$3',[await upgradedPasswordHash(password),staff.id,staff.password_hash]);
  const token=randomBytes(32).toString('hex');await db.query('DELETE FROM salon_sessions WHERE expires_at<now()');await db.query("INSERT INTO salon_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '8 hours')",[digest(token),staff.id]);
  jar.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:28800});return json({role:staff.role});
 }
 const token=jar.get(COOKIE)?.value;const staff=token?(await db.query('SELECT s.id,s.role FROM salon_sessions t JOIN salon_staff s ON s.id=t.user_id WHERE t.token_hash=$1 AND t.expires_at>now() AND s.active=true',[digest(token)])).rows[0]:null;
 if(!staff||!['admin','manager'].includes(staff.role))return json({error:'Authentication required'},401);
 if(path==='auth/logout'&&req.method==='POST'){await db.query('DELETE FROM salon_sessions WHERE token_hash=$1',[digest(token!)]);jar.delete(COOKIE);return json({ok:true});}
 if(path==='auth/session'&&req.method==='GET')return json({role:staff.role});
 if(path==='uploads'&&req.method==='POST'){
  if(!['image/jpeg','image/png','image/webp'].includes(req.headers.get('content-type')||''))return json({error:'Unsupported image'},400);
  const input=await bytes(req,5*1024*1024);const output=await sharp(input,{limitInputPixels:40000000}).rotate().resize(1600,1600,{fit:'inside',withoutEnlargement:true}).webp({quality:84}).toBuffer();if(output.length>2*1024*1024)return json({error:'Image too large'},400);
  const id=randomUUID();await db.query('INSERT INTO salon_media(id,bytes,content_type) VALUES($1,$2,$3)',[id,output,'image/webp']);return json({url:'/api/media/'+id});
 }
 const tables=['products','product_categories','social_links','service_groups'];const table=path.startsWith('data/')?path.slice(5):'';if(!tables.includes(table))return json({error:'Not found'},404);
 if(table==='social_links'&&mutation&&staff.role!=='admin')return json({error:'Administrator required'},403);
 if(req.method==='GET'){const result=await db.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);return json(result.rows.map(r=>table==='products'?{...r,price:Number(r.price)}:r));}
 const id=url.searchParams.get('id')?.replace(/^eq\./,'');
 if(req.method==='DELETE'){if(table!=='social_links'||!id)return json({error:'Unsupported deletion'},400);await db.query('DELETE FROM social_links WHERE id=$1',[id]);return json({ok:true});}
 if(!['POST','PATCH'].includes(req.method))return json({error:'Method not allowed'},405);
 const b=JSON.parse((await bytes(req,100000)).toString());if(!b||typeof b!=='object'||Array.isArray(b))return json({error:'Invalid request'},400);const loc=(v:unknown)=>!!v&&typeof v==='object'&&['fr','ar'].every(l=>typeof (v as Record<string,unknown>)[l]==='string'&&String((v as Record<string,unknown>)[l]).trim().length>0&&String((v as Record<string,unknown>)[l]).length<=160);
 let values:Record<string,unknown>;
 if(table==='products'){
  if(!loc(b.name)||!Number.isFinite(b.price)||b.price<0||b.price>99999999||!['draft','published'].includes(b.status)||typeof b.category_id!=='string'||!/^\/api\/media\/[0-9a-f-]{36}$/.test(b.image))return json({error:'Invalid product'},400);
  if(b.description!=null&&(!['fr','ar'].every(l=>typeof b.description[l]==='string'&&b.description[l].length<=2000)))return json({error:'Invalid description'},400);
  values={name:b.name,description:b.description||{fr:'',ar:''},price:b.price,category_id:b.category_id,image:b.image,status:b.status};
 }else if(table==='product_categories'){if(!loc(b.name))return json({error:'Invalid category'},400);values={name:b.name};}
 else if(table==='social_links'){if(!contactIdentity(b as SocialLink))return json({error:'Invalid contact'},400);values={platform:b.platform,url:contactHref(b)};}
 else{if(!validServices(b)||!['coiffure','onglerie','maquillage','epilation','soins'].includes(b.id))return json({error:'Invalid services'},400);values={fr:b.fr,ar:b.ar,items:JSON.stringify(b.items)};}
 const fields=Object.keys(values);const args=Object.values(values);let result;
 if(req.method==='PATCH'){if(!id)return json({error:'Missing ID'},400);result=await db.query(`UPDATE ${table} SET ${fields.map((f,i)=>`${f}=$${i+1}`).join(',')} WHERE id=$${args.length+1} RETURNING *`,[...args,id]);}
 else{const recordId=table==='service_groups'?b.id:randomUUID();result=await db.query(`INSERT INTO ${table}(id,${fields.join(',')}) VALUES($1,${fields.map((_,i)=>'$'+(i+2)).join(',')}) ${table==='service_groups'?`ON CONFLICT(id) DO UPDATE SET ${fields.map(f=>`${f}=EXCLUDED.${f}`).join(',')}`:''} RETURNING *`,[recordId,...args]);}
 return json(result.rows);
 }catch(e){const code=(e as {code?:string}).code;if(code==='23503'||code==='23505')return json({error:'Conflict'},409);if(e instanceof SyntaxError||e instanceof Error&&e.message==='size')return json({error:'Invalid request'},400);console.error('Admin request failed',code||'request');return json({error:'Request failed'},500);}
}
export {handle as GET,handle as POST,handle as PATCH,handle as DELETE};
