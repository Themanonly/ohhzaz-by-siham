import {database,databaseReady} from '../../../../lib/db';
import {cookies} from 'next/headers';
import {digest} from '../../../../lib/password';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
export const runtime='nodejs';
const variants=new Map<string,{bytes:Buffer;type:string;etag:string}>();
const maxVariantBytes=16*1024*1024;
let variantBytes=0;
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie'};
 if(!databaseReady()||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id))return new Response(null,{status:404,headers});
 const value=new URL(req.url).searchParams.get('w');
 if(value!==null&&!['320','640','960','1600'].includes(value))return new Response(null,{status:400,headers});
 try{
  const db=database();
  const meta=(await db.query("SELECT m.content_type,m.created_at,EXISTS(SELECT 1 FROM products p WHERE p.image=$2 AND p.status='published') AS published FROM salon_media m WHERE m.id=$1",[id,'/api/media/'+id])).rows[0];
  if(!meta)return new Response(null,{status:404,headers});
  if(!meta.published){
   const token=(await cookies()).get('ohhzaz_session')?.value;
   const allowed=token&&(await db.query("SELECT 1 FROM salon_sessions t JOIN salon_staff s ON s.id=t.user_id WHERE t.token_hash=$1 AND t.expires_at>now() AND s.active=true AND s.role IN ('admin','manager')",[digest(token)])).rowCount;
   if(!allowed)return new Response(null,{status:404,headers});
  }
  // Recheck access on every request, including cached variants and conditional requests.
  // Unpublishing takes effect immediately; no draft bytes reach a shared CDN cache.
  const key=id+':'+new Date(meta.created_at).toISOString()+':'+(value||'original');
  let image=variants.get(key);
  const responseHeaders=meta.published?{...headers,'Cache-Control':'private, no-cache'}:headers;
  if(image&&meta.published&&req.headers.get('if-none-match')===image.etag)return new Response(null,{status:304,headers:{...responseHeaders,ETag:image.etag}});
  if(!image){
   const row=(await db.query('SELECT bytes,content_type FROM salon_media WHERE id=$1',[id])).rows[0];
   if(!row)return new Response(null,{status:404,headers});
   const bytes=value?await sharp(row.bytes,{limitInputPixels:40000000}).resize({width:Number(value),withoutEnlargement:true}).webp({quality:84}).toBuffer():row.bytes as Buffer;
   image={bytes,type:value?'image/webp':row.content_type,etag:'"'+createHash('sha256').update(bytes).digest('hex')+'"'};
   while(variants.size&&variantBytes+bytes.length>maxVariantBytes){const oldest=variants.keys().next().value!;variantBytes-=variants.get(oldest)!.bytes.length;variants.delete(oldest);}
   if(bytes.length<=maxVariantBytes&&!variants.has(key)){variants.set(key,image);variantBytes+=bytes.length;}
  }
  return new Response(new Uint8Array(image.bytes),{headers:{...responseHeaders,'Content-Type':image.type,ETag:image.etag,'Content-Length':String(image.bytes.length)}});
 }catch{return new Response(null,{status:503,headers});}
}
