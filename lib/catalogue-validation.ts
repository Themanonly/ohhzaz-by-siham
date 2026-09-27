import type {Product,ProductCategory} from '../data/catalogue';
import type {Category} from '../data/services';
type RecordValue=Record<string,unknown>;
const record=(v:unknown):v is RecordValue=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0;
const localized=(v:unknown)=>record(v)&&text(v.fr)&&text(v.ar);
export const serviceImages=new Set(['brushing','coupe','couleur','soin-cheveux','chignon','ongles','pedicure','maquillage','cils','sourcils','teinture-sourcils','epilation','visage']);
export function validProduct(v:unknown):v is Product{
 if(!record(v)||!text(v.id)||!text(v.category_id)||!localized(v.name)||v.status!=='published'||typeof v.price!=='number'||!Number.isFinite(v.price)||v.price<0||!text(v.image))return false;
 try{const u=new URL(v.image);if(u.protocol!=='https:'||u.username||u.password)return false;}catch{return false;}
 return v.description==null||(record(v.description)&&typeof v.description.fr==='string'&&typeof v.description.ar==='string');
}
export const validCategory=(v:unknown):v is ProductCategory=>record(v)&&text(v.id)&&localized(v.name);
export function validServices(v:unknown):v is Category{
 return record(v)&&text(v.id)&&text(v.fr)&&text(v.ar)&&Array.isArray(v.items)&&v.items.length>0&&v.items.every(s=>record(s)&&text(s.fr)&&text(s.ar)&&typeof s.price==='number'&&Number.isFinite(s.price)&&s.price>=0&&(s.from===undefined||typeof s.from==='boolean')&&(s.image===undefined||typeof s.image==='string'&&serviceImages.has(s.image)));
}
