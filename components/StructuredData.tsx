import {siteUrl,pathFor} from '../lib/site';
import {headers} from 'next/headers';
import {contactIdentity} from '../lib/contacts';
import type {SocialLink} from '../data/catalogue';
export default async function StructuredData({locale,page,contacts}:{locale:'fr'|'ar';page:string;contacts:SocialLink[]}){
 const nonce=(await headers()).get('x-nonce')||undefined;
 const origin=siteUrl.origin;const ar=locale==='ar';const labels:Record<string,string>=ar?{mariee:'العروس',prestations:'الخدمات والأسعار',produits:'المنتجات', 'le-salon':'الصالون',contact:'التواصل'}:{mariee:'La mariée',prestations:'Prestations & tarifs',produits:'Produits','le-salon':'Le salon',contact:'Contact'};
 const data={'@context':'https://schema.org','@graph':[
 {'@type':'BeautySalon','@id':origin+'/#salon',name:'OHH ZAZ by SIHAM',url:origin+'/fr',image:origin+'/media/salon-wash-24.webp',address:{'@type':'PostalAddress',streetAddress:'n°24, Bd Sidi Mohamed Ben Abdellah',addressLocality:'Casablanca',postalCode:'20330',addressCountry:'MA'},geo:{'@type':'GeoCoordinates',latitude:33.5961518,longitude:-7.6411606},sameAs:contacts.filter(c=>c.platform!=='whatsapp'&&contactIdentity(c)).map(c=>c.url),contactPoint:contacts.filter(c=>c.platform==='whatsapp'&&contactIdentity(c)).map(c=>({'@type':'ContactPoint',contactType:'customer service',url:c.url,availableLanguage:['French','Arabic']})),openingHoursSpecification:[{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday'],opens:'09:30',closes:'19:30'},{'@type':'OpeningHoursSpecification',dayOfWeek:['Thursday','Friday','Saturday'],opens:'09:30',closes:'20:00'}]},
 {'@type':'WebSite','@id':origin+'/#website',url:origin,name:'OHH ZAZ by SIHAM',inLanguage:['fr-MA','ar-MA'],publisher:{'@id':origin+'/#salon'}},
 {'@type':'WebPage','@id':origin+pathFor(locale,page),url:origin+pathFor(locale,page),inLanguage:ar?'ar-MA':'fr-MA',isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#salon'}},
 ...(page?[{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:ar?'الرئيسية':'Accueil',item:origin+'/'+locale},{'@type':'ListItem',position:2,name:labels[page],item:origin+pathFor(locale,page)}]}]:[])
 ]};
 return <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}}/>;
}
