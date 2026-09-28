import {database,databaseReady} from '../../../../lib/db';
import {cookies} from 'next/headers';
import {digest} from '../../../../lib/password';
export const runtime='nodejs';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
 if(!databaseReady()||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id))return new Response(null,{status:404,headers});
 try{
  const db=database();
  const published=(await db.query("SELECT 1 FROM products WHERE image=$1 AND status='published' LIMIT 1",['/api/media/'+id])).rowCount;
  if(!published){
   const token=(await cookies()).get('ohhzaz_session')?.value;
   const allowed=token&&(await db.query("SELECT 1 FROM salon_sessions t JOIN salon_staff s ON s.id=t.user_id WHERE t.token_hash=$1 AND t.expires_at>now() AND s.active=true AND s.role IN ('admin','manager')",[digest(token)])).rowCount;
   if(!allowed)return new Response(null,{status:404,headers});
  }
  const row=(await db.query('SELECT bytes,content_type FROM salon_media WHERE id=$1',[id])).rows[0];
  if(!row)return new Response(null,{status:404,headers});
  return new Response(new Uint8Array(row.bytes),{headers:{...headers,'Content-Type':row.content_type}});
 }catch{return new Response(null,{status:503,headers});}
}
