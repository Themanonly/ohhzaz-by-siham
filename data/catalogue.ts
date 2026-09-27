export type Localized = {fr:string;ar:string};
export type ProductCategory = {id:string;name:Localized};
export type Product = {id:string;category_id:string;name:Localized;description?:Localized;price:number|null;image:string|null;status:'placeholder'|'published'|'draft'};
export const productCategories:ProductCategory[]=[
 {id:'cosmetiques',name:{fr:'Cosmétiques',ar:'مستحضرات التجميل'}},
 {id:'cheveux',name:{fr:'Soins capillaires',ar:'العناية بالشعر'}},
 {id:'brosses',name:{fr:'Brosses & accessoires',ar:'الفرش والإكسسوارات'}},
 {id:'appareils',name:{fr:'Sèche-cheveux & appareils',ar:'مجففات وأجهزة الشعر'}}
];
export const products:Product[]=productCategories.map(c=>({id:c.id+'-apercu',category_id:c.id,name:c.name,price:null,image:null,status:'placeholder'}));
export type Platform='instagram'|'tiktok'|'whatsapp';
export type SocialLink={id:string;platform:Platform;url:string};
export const socialLinks:SocialLink[]=[
 {id:'instagram-main',platform:'instagram',url:'https://www.instagram.com/ohh_zaz/'},
 {id:'tiktok-main',platform:'tiktok',url:'https://www.tiktok.com/@sihamelhallaoui'},
 {id:'whatsapp-main',platform:'whatsapp',url:'https://wa.me/212775355346'}
];
