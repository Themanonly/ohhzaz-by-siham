import {validProduct,validCategory,validServices} from './catalogue-validation';
import {products,productCategories,socialLinks,type SocialLink} from '../data/catalogue';
import {categories as serviceGroups,type Category} from '../data/services';
import {contactIdentity} from './contacts';
import {database,databaseReady} from './db';
import {unstable_cache,revalidateTag} from 'next/cache';
import {createHash} from 'node:crypto';
export const CATALOGUE_TAG='salon-public-catalogue';
export function invalidateCatalogue(){revalidateTag(CATALOGUE_TAG,{expire:0});}
const readCatalogue=unstable_cache(async(_databaseIdentity:string)=>{
 const [p,c,l,g]=await Promise.all([database().query("SELECT id,category_id,name,description,price,image,images,status FROM products WHERE status='published' ORDER BY created_at DESC"),database().query('SELECT id,name FROM product_categories ORDER BY created_at'),database().query('SELECT id,platform,url FROM social_links ORDER BY created_at'),database().query('SELECT id,fr,ar,items FROM service_groups ORDER BY created_at')]);
 const items=p.rows.map(v=>({...v,price:Number(v.price)})).filter(validProduct);const categories=c.rows.filter(validCategory);const services=g.rows.filter(validServices);
 return {items:items.length?items:products,categories:categories.length?categories:productCategories,contacts:(l.rows as SocialLink[]).filter(v=>contactIdentity(v)),serviceGroups:serviceGroups.map(v=>services.find((s:Category)=>s.id===v.id)||v)};
},['salon-catalogue-v2'],{tags:[CATALOGUE_TAG],revalidate:60});
export async function getCatalogue(){
 if(!databaseReady())return {items:products,categories:productCategories,contacts:socialLinks,serviceGroups};
 try{return await readCatalogue(createHash('sha256').update(process.env.DATABASE_URL!).digest('hex'));}
 catch{console.error('Catalogue database unavailable');return {items:products,categories:productCategories,contacts:[],serviceGroups};}
}

// Product URLs must never resolve to private drafts or catalogue placeholders.
export async function getPublishedProduct(id:string){
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)||!databaseReady())return null;
 const catalogue=await readCatalogue(createHash('sha256').update(process.env.DATABASE_URL!).digest('hex'));
 const product=catalogue.items.find(p=>p.id===id&&p.status==='published');
 return product?{product,catalogue}:null;
}
