import {NextResponse} from 'next/server';
import {database} from '../../../lib/db';
import {cleanCart} from '../../../lib/cart';
export async function POST(request:Request){
 const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
 try{
  const text=await request.text();if(text.length>5000)return reply({error:'Invalid cart'},400);
  let body;try{body=JSON.parse(text)}catch{return reply({error:'Invalid cart'},400)}
  const lines=cleanCart(body);if(!Array.isArray(body)||lines.length!==body.length||!lines.length)return reply({error:'Invalid cart'},400);
  const result=await database().query("SELECT id,name,price,image FROM products WHERE status='published' AND id=ANY($1::text[])",[lines.map(l=>l.id)]);
  return reply({items:lines.map(line=>{const p=result.rows.find(p=>p.id===line.id);return p?{id:p.id,name:p.name,price:Number(p.price),image:p.image,quantity:line.quantity}:{id:line.id,unavailable:true,quantity:line.quantity}})});
 }catch{ return reply({error:'Cart verification unavailable'},503); }
}
