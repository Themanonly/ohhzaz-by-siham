import {validProduct,validCategory,validServices} from './catalogue-validation';
import {products,productCategories,socialLinks,type SocialLink} from '../data/catalogue';
import {categories as serviceGroups,type Category} from '../data/services';
import {contactIdentity} from './contacts';
import {database,databaseReady} from './db';
export async function getCatalogue(){
 if(!databaseReady())return {items:products,categories:productCategories,contacts:socialLinks,serviceGroups};
 try{
 const [p,c,l,g]=await Promise.all([database().query("SELECT * FROM products WHERE status='published' ORDER BY created_at DESC"),database().query('SELECT * FROM product_categories ORDER BY created_at'),database().query('SELECT * FROM social_links ORDER BY created_at'),database().query('SELECT * FROM service_groups ORDER BY created_at')]);
 const items=p.rows.map(v=>({...v,price:Number(v.price)})).filter(validProduct);const categories=c.rows.filter(validCategory);const services=g.rows.filter(validServices);
 return {items:items.length?items:products,categories:items.length?categories:productCategories,contacts:(l.rows as SocialLink[]).filter(v=>contactIdentity(v)),serviceGroups:serviceGroups.map(v=>services.find((s:Category)=>s.id===v.id)||v)};
 }catch{console.error('Catalogue database unavailable');return {items:products,categories:productCategories,contacts:[],serviceGroups};}
}
