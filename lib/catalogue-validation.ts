import type {Product,ProductCategory} from '../data/catalogue';
import type {Category} from '../data/services';
type RecordValue=Record<string,unknown>;
const record=(v:unknown):v is RecordValue=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=160;
const localized=(v:unknown)=>record(v)&&text(v.fr)&&text(v.ar);
export const serviceImages=new Set(['brushing','coupe','couleur','soin-cheveux','chignon','ongles','pedicure','maquillage','cils','sourcils','teinture-sourcils','epilation','visage']);
export function validProduct(v:unknown):v is Product{
 if(!record(v)||!text(v.id)||!text(v.category_id)||!localized(v.name)||v.status!=='published'||typeof v.price!=='number'||!Number.isFinite(v.price)||v.price<0||!text(v.image))return false;
 if(!/^\/api\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v.image))return false;
 return v.description==null||(record(v.description)&&typeof v.description.fr==='string'&&typeof v.description.ar==='string');
}
export const validCategory=(v:unknown):v is ProductCategory=>record(v)&&text(v.id)&&localized(v.name);
export function validServices(v:unknown):v is Category{
 const amount=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=99999999;
 return record(v)&&text(v.id)&&text(v.fr)&&text(v.ar)&&Array.isArray(v.items)&&v.items.length>0&&v.items.length<=100&&v.items.every(s=>record(s)&&text(s.fr)&&text(s.ar)&&amount(s.price)&&(s.alternative===undefined||amount(s.alternative))&&(s.minutes===undefined||typeof s.minutes==='number'&&Number.isInteger(s.minutes)&&s.minutes>0&&s.minutes<=1440)&&(s.from===undefined||typeof s.from==='boolean')&&(s.image===undefined||typeof s.image==='string'&&serviceImages.has(s.image)));
}
