import {validProduct,validCategory,validServices} from './catalogue-validation';
import {products,productCategories,socialLinks,type Product,type ProductCategory,type SocialLink} from '../data/catalogue';
import {categories as serviceGroups,type Category} from '../data/services';
import {contactIdentity} from './contacts';
export async function getCatalogue(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return {items:products,categories:productCategories,contacts:socialLinks,serviceGroups};
 const read=async(path:string)=>{const res=await fetch(`${url}/rest/v1/${path}`,{headers:{apikey:key},cache:'no-store',signal:AbortSignal.timeout(6000)});if(!res.ok)throw new Error('Catalogue unavailable');return res.json()};
 try{const [items,categories,contacts,services]=await Promise.all([read('products?status=eq.published&order=created_at.desc'),read('product_categories?order=created_at.asc'),read('social_links?order=created_at.asc'),read('service_groups?order=created_at.asc')]);
 if(![items,categories,contacts,services].every(Array.isArray))throw new Error('Invalid catalogue response');
 const safeItems=items.filter(validProduct);const safeCategories=categories.filter(validCategory);const safeServices=services.filter(validServices);
 return {items:safeItems.length?safeItems:products,categories:safeItems.length?safeCategories:productCategories,contacts:(contacts as SocialLink[]).filter(c=>c&&contactIdentity(c)),serviceGroups:serviceGroups.map(g=>safeServices.find((s:Category)=>s.id===g.id)||g)};
 }catch{console.error('Public catalogue unavailable; showing clearly labelled preview selection.');return {items:products,categories:productCategories,contacts:[],serviceGroups};}
}
