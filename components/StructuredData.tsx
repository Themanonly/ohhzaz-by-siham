import {siteUrl,pathFor} from '../lib/site';
import {headers} from 'next/headers';
import {contactIdentity} from '../lib/contacts';
import {business} from '../data/business';
import type {Category} from '../data/services';
import type {SocialLink} from '../data/catalogue';
export default async function StructuredData({locale,page,contacts,serviceGroups}:{locale:'fr'|'ar';page:string;contacts:SocialLink[];serviceGroups:Category[]}){
 const nonce=(await headers()).get('x-nonce')||undefined;
 const origin=siteUrl.origin;const ar=locale==='ar';const labels:Record<string,string>=ar?{mariee:'العروس',prestations:'الخدمات والأسعار',produits:'المنتجات', 'le-salon':'الصالون',contact:'التواصل','mentions-legales':'الخصوصية وحقوق الموقع'}:{mariee:'La mariée',prestations:'Prestations & tarifs',produits:'Produits','le-salon':'Le salon',contact:'Contact','mentions-legales':'Confidentialité & droits du site'};
 const data={'@context':'https://schema.org','@graph':[
 {'@type':'BeautySalon','@id':origin+'/#salon',name:business.name,alternateName:['OHH ZAZ Salon','صالون سهام'],url:origin+'/fr',hasMap:business.mapUrl,areaServed:{'@type':'City',name:'Casablanca'},description:ar?'صالون الشعر والصبغات والأظافر والمكياج والعناية بالوجه في الدار البيضاء.':'Salon de coiffure, coloration, onglerie, maquillage et soins du visage à Casablanca.',image:origin+'/media/salon-wash-24.webp',address:{'@type':'PostalAddress',streetAddress:business.street,addressLocality:'Casablanca',postalCode:'20330',addressCountry:'MA'},geo:{'@type':'GeoCoordinates',latitude:business.latitude,longitude:business.longitude},sameAs:contacts.filter(c=>c.platform!=='whatsapp'&&contactIdentity(c)).map(c=>c.url),contactPoint:contacts.filter(c=>c.platform==='whatsapp'&&contactIdentity(c)).map(c=>({'@type':'ContactPoint',contactType:'customer service',url:c.url,availableLanguage:['French','Arabic']})),openingHoursSpecification:[{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday'],opens:'09:30',closes:'19:30'},{'@type':'OpeningHoursSpecification',dayOfWeek:['Thursday','Friday','Saturday'],opens:'09:30',closes:'20:00'}]},
 {'@type':'WebSite','@id':origin+'/#website',url:origin,name:'OHH ZAZ by SIHAM',inLanguage:['fr-MA','ar-MA'],publisher:{'@id':origin+'/#salon'},copyrightYear:2026,copyrightHolder:[{'@id':origin+'/#salon'},{'@type':'Person',name:business.developer}],creator:{'@type':'Person',name:business.developer}},
 {'@type':'WebPage','@id':origin+pathFor(locale,page),url:origin+pathFor(locale,page),inLanguage:ar?'ar-MA':'fr-MA',isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#salon'}},
 ...(page==='prestations'?[{'@type':'OfferCatalog',name:ar?'الخدمات والأسعار':'Prestations & tarifs',itemListElement:serviceGroups.map(group=>({'@type':'OfferCatalog',name:group[locale],itemListElement:group.items.map(service=>({'@type':'Offer',url:origin+pathFor(locale,page)+'?category='+group.id+'#tarifs',priceCurrency:'MAD',...(service.from?{priceSpecification:{'@type':'PriceSpecification',minPrice:service.price,priceCurrency:'MAD'}}:{price:service.price}),itemOffered:{'@type':'Service',name:service[locale],provider:{'@id':origin+'/#salon'}}}))}))}]:[]),
 ...(page?[{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:ar?'الرئيسية':'Accueil',item:origin+'/'+locale},{'@type':'ListItem',position:2,name:labels[page],item:origin+pathFor(locale,page)}]}]:[])
 ]};
 return <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}}/>;
}
