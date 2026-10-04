'use client';
import Link from 'next/link';
import {categories as defaultServices,type Category} from '../data/services';
import ContactAction,{ContactsContext} from './ContactAction';
import {products,productCategories,socialLinks,type Product,type ProductCategory,type SocialLink} from '../data/catalogue';
import {copy} from '../data/copy';
import Footer from './Footer';
import Reviews from './Reviews';
import SiteInformation from './SiteInformation';
import {business} from '../data/business';
import VideoHero from './VideoHero';
import ServiceDiscovery from './ServiceDiscovery';
import SalonInterior from './SalonInterior';
import Header from './Header';
import BridalExperience from './BridalExperience';
import Products from './Products';
import Gallery from './Gallery';
import PriceMenu from './PriceMenu';
import OpeningHours from './OpeningHours';
import { Suspense, useEffect, useState } from 'react';
import { ArrowUpRight, MapPin, Plus, Minus } from 'lucide-react';
type Locale='fr'|'ar';
function Star({className=''}:{className?:string}){return <svg className={className} viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0C22 14 26 18 40 20C26 22 22 26 20 40C18 26 14 22 0 20C14 18 18 14 20 0Z" fill="currentColor"/></svg>}
export default function Salon({locale,page,items=products,categories=productCategories,contacts=socialLinks,serviceGroups=defaultServices}:{locale:Locale;page:string;items?:Product[];categories?:ProductCategory[];contacts?:SocialLink[];serviceGroups?:Category[]}){useEffect(()=>{let restoring=false;try{restoring=!!sessionStorage.getItem('ohhzaz-language-position')}catch{}if(!location.hash&&!restoring)window.scrollTo({top:0,behavior:'instant'})},[page]);const t=copy[locale],ar=locale==='ar';const [faq,setFaq]=useState<number|null>(null);useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=ar?'rtl':'ltr';},[locale,ar]);const url=(p='')=>`/${locale}${p?'/'+p:''}`;
return <ContactsContext.Provider value={contacts}><a className="skip" href="#main">{ar?'إلى المحتوى':'Aller au contenu'}</a><Header locale={locale} page={page}/>
<main id="main" tabIndex={-1}>{!page&&<><VideoHero locale={locale}/><section className="intro section" id="maison" data-scroll-key="maison"><Star/><p className="eyebrow">{t.note}</p><h2>{t.welcome}</h2><p>{t.body}</p><span className="signature">Siham</span></section></>}
{(page===''||page==='prestations')&&<ServiceDiscovery categories={serviceGroups} locale={locale} compact={page==='prestations'}/>}
{page==='prestations'&&<><Suspense><PriceMenu categories={serviceGroups} locale={locale}/></Suspense><Products items={items} categories={categories} locale={locale} teaser/></>}
{page==='produits'&&<Products items={items} categories={categories} locale={locale}/>}
{(page===''||page==='mariee')&&<BridalExperience locale={locale} full={page==='mariee'}/>}
{!page&&<section className="section gallery" data-scroll-key="gallery"><div className="section-heading"><div><p className="eyebrow">{t.galleryTag}</p><h2>{t.gallery}</h2></div><ContactAction platform="instagram" locale={locale}>Instagram</ContactAction></div><Gallery locale={locale}/></section>}
{(page===''||page==='le-salon')&&<SalonInterior locale={locale} full={page==='le-salon'}/>}
{page==='contact'&&<section className="contact section page-start" data-scroll-key="contact"><p className="eyebrow">OHH ZAZ · BY SIHAM</p><h1>{t.contactTitle}</h1><p>{t.contactBody}</p><div className="contact-platforms"><ContactAction platform="whatsapp" locale={locale} className="button">WhatsApp</ContactAction><ContactAction platform="instagram" locale={locale}>Instagram</ContactAction><ContactAction platform="tiktok" locale={locale}>TikTok</ContactAction></div><div className="contact-location"><MapPin/><span dir="ltr">n°24, Bd Sidi Mohamed Ben Abdellah<br/>Casablanca 20330</span></div><a className="text-link directions-link" href={business.mapUrl} target="_blank" rel="noopener noreferrer">{ar?'الاتجاهات إلى الصالون':'Itinéraire vers le salon'}<ArrowUpRight size={16}/></a><OpeningHours locale={locale}/></section>}
{(page==='contact'||page==='mariee')&&<section className="section faq" data-scroll-key="faq"><p className="eyebrow">{t.faq}</p>{t.questions.map((q,i)=>(page==='mariee'&&i!==1)?null:<div className="faq-item" key={q}><button onClick={()=>setFaq(faq===i?null:i)} aria-expanded={faq===i} aria-controls={`faq-${i}`}>{q}{faq===i?<Minus size={18}/>:<Plus size={18}/>}</button><div id={`faq-${i}`} hidden={faq!==i}><p>{t.answers[i]}</p></div></div>)}</section>}
{(page===''||page==='le-salon')&&<Reviews locale={locale}/>}
{page==='mentions-legales'&&<SiteInformation locale={locale}/>}</main><Footer locale={locale} page={page}/></ContactsContext.Provider>}






