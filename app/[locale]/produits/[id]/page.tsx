import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {cache} from 'react';
import {headers} from 'next/headers';
import Salon from '../../../../components/Salon';
import {getPublishedProduct} from '../../../../lib/catalogue-server';
import {productPath} from '../../../../lib/product-links';
import {siteUrl} from '../../../../lib/site';
import {productImages} from '../../../../data/catalogue';
const read=cache(getPublishedProduct);
type Params={params:Promise<{locale:string;id:string}>};
export async function generateMetadata({params}:Params):Promise<Metadata>{
 const {locale,id}=await params;if(locale!=='fr'&&locale!=='ar')notFound();
 const data=await read(id);if(!data)notFound();const {product}=data;
 const title=product.name[locale]||product.name.fr;
 const description=(product.description?.[locale]||product.description?.fr||title).slice(0,180);
 const images=productImages(product).map(url=>({url:new URL(url,siteUrl).href,alt:title}));
 return {title:`${title} — OHH ZAZ`,description,alternates:{canonical:productPath(locale,id),languages:{'fr-MA':productPath('fr',id),'ar-MA':productPath('ar',id),'x-default':productPath('fr',id)}},openGraph:{type:'website',title,description,url:productPath(locale,id),locale:locale==='ar'?'ar_MA':'fr_MA',images},twitter:{card:'summary_large_image',title,description,images:images.map(i=>i.url)}};
}
export default async function ProductPage({params}:Params){
 const {locale,id}=await params;if(locale!=='fr'&&locale!=='ar')notFound();
 const data=await read(id);if(!data)notFound();const {product,catalogue}=data;
 const url=new URL(productPath(locale,id),siteUrl).href;
 const structured={'@context':'https://schema.org','@type':'Product',name:product.name[locale]||product.name.fr,description:product.description?.[locale]||product.description?.fr,image:productImages(product).map(p=>new URL(p,siteUrl).href),url,sku:product.id,...(product.price!==null?{offers:{'@type':'Offer',url,price:product.price,priceCurrency:'MAD',seller:{'@type':'BeautySalon',name:'OHH ZAZ by SIHAM'}}}:{})};
 const nonce=(await headers()).get('x-nonce')||undefined;
 return <><script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g,'\\u003c')}}/><Salon locale={locale} page={`produits/${id}`} product={product} {...catalogue}/></>;
}
