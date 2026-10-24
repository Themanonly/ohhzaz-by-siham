export type CartLine={id:string;quantity:number};
export const CART_KEY='ohhzaz-cart-v1';
export function cleanCart(value:unknown):CartLine[]{
 if(!Array.isArray(value))return [];
 const result:CartLine[]=[];
 for(const row of value){if(result.length>=20)break;if(!row||typeof row.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id)||!Number.isInteger(row.quantity)||row.quantity<1||row.quantity>99||result.some(v=>v.id===row.id))continue;result.push({id:row.id,quantity:row.quantity});}
 return result;
}
