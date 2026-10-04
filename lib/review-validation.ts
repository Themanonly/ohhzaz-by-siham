export function validReview(value: unknown): value is {name:string;rating:number;comment:string;locale:'fr'|'ar';consent:true;website?:string} {
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const v=value as Record<string,unknown>;
 return typeof v.name==='string'&&v.name.trim().length>=2&&v.name.trim().length<=60
 &&typeof v.comment==='string'&&v.comment.trim().length>=20&&v.comment.trim().length<=1500
 &&Number.isInteger(v.rating)&&Number(v.rating)>=1&&Number(v.rating)<=5
 &&['fr','ar'].includes(String(v.locale))&&v.consent===true
 &&(v.website===undefined||v.website==='');
}
