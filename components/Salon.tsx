'use client';
import Link from 'next/link';
import {copy} from '../data/copy';
import HomeLink from './HomeLink';
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
import { ArrowUpRight, Camera as Instagram, MapPin, Plus, Minus } from 'lucide-react';
type Locale='fr'|'ar';
function Star({className=''}:{className?:string}){return <svg className={className} viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0C22 14 26 18 40 20C26 22 22 26 20 40C18 26 14 22 0 20C14 18 18 14 20 0Z" fill="currentColor"/></svg>}
export default function Salon({locale,page}:{locale:Locale;page:string}){useEffect(()=>{if(!location.hash&&!sessionStorage.getItem('ohhzaz-language-position'))window.scrollTo({top:0,behavior:'instant'})},[page]);const t=copy[locale],ar=locale==='ar';const [faq,setFaq]=useState<number|null>(null);useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=ar?'rtl':'ltr';},[locale,ar]);const url=(p='')=>`/${locale}${p?'/'+p:''}`;const button=(label:string,p:string,light=false)=><Link className={`button ${light?'light':''}`} href={url(p)}>{label}<ArrowUpRight size={17}/></Link>;
return <><a className="skip" href="#main">{ar?'إلى المحتوى':'Aller au contenu'}</a><Header locale={locale} page={page}/>
<main id="main" tabIndex={-1}>{!page&&<><VideoHero locale={locale}/><section className="intro section" id="maison" data-scroll-key="maison"><Star/><p className="eyebrow">{t.note}</p><h2>{t.welcome}</h2><p>{t.body}</p><span className="signature">Siham</span></section></>}
{(page===''||page==='prestations')&&<ServiceDiscovery locale={locale} compact={page==='prestations'}/>}
{page==='prestations'&&<><Suspense><PriceMenu locale={locale}/></Suspense><Products locale={locale} teaser/></>}
{page==='produits'&&<Products locale={locale}/>}
{(page===''||page==='mariee')&&<BridalExperience locale={locale} full={page==='mariee'}/>}
{!page&&<section className="section gallery" data-scroll-key="gallery"><div className="section-heading"><div><p className="eyebrow">{t.galleryTag}</p><h2>{t.gallery}</h2></div><a className="text-link" href="https://www.instagram.com/ohh_zaz/" target="_blank" rel="noopener noreferrer">@ohh_zaz <Instagram size={17}/></a></div><Gallery locale={locale}/></section>}
{(page===''||page==='le-salon')&&<SalonInterior locale={locale} full={page==='le-salon'}/>}
{page==='contact'&&<section className="contact section page-start" data-scroll-key="contact"><p className="eyebrow">OHH ZAZ · BY SIHAM</p><h1>{t.contactTitle}</h1><p>{t.contactBody}</p><a className="button" href="https://www.instagram.com/ohh_zaz/" target="_blank" rel="noopener noreferrer">{t.contactCta}<Instagram size={18}/></a><div className="contact-location"><MapPin/><span dir="ltr">n°24, Bd Sidi Mohamed Ben Abdellah<br/>Casablanca 20330</span></div><a className="text-link directions-link" href="https://www.google.com/maps/place/Ohh+Zaz+institut+de+beaut%C3%A9+casablanca/@33.5961518,-7.6422909,18z/data=!3m1!4b1!4m6!3m5!1s0xda7d3d70a24e7cd:0x9b3faa8d65b67eee!8m2!3d33.5961518!4d-7.6411606!16s%2Fg%2F11m9y2kxh9" target="_blank" rel="noopener noreferrer">{ar?'الاتجاهات إلى الصالون':'Itinéraire vers le salon'}<ArrowUpRight size={16}/></a><OpeningHours locale={locale}/></section>}
{(page==='contact'||page==='mariee')&&<section className="section faq" data-scroll-key="faq"><p className="eyebrow">{t.faq}</p>{t.questions.map((q,i)=>(page==='mariee'&&i!==1)?null:<div className="faq-item" key={q}><button onClick={()=>setFaq(faq===i?null:i)} aria-expanded={faq===i} aria-controls={`faq-${i}`}>{q}{faq===i?<Minus size={18}/>:<Plus size={18}/>}</button><div id={`faq-${i}`} hidden={faq!==i}><p>{t.answers[i]}</p></div></div>)}</section>}
</main><footer data-scroll-key="footer"><div className="footer-invite"><Star/><h2>{page==='contact'?(ar?'الخدمات والأسعار، قبل زيارتكِ.':'La carte du salon, avant votre visite.') : t.footer}</h2>{button(page==='contact'?(ar?'استعراض الأسعار':'Consulter les tarifs'):t.footerCta,page==='contact'?'prestations':'contact',true)}</div><nav className="footer-links" aria-label={ar?'روابط أسفل الصفحة':'Navigation du pied de page'}>{[[t.home,''],[t.nav[0],'mariee'],[ar?'الخدمات والأسعار':'Prestations & tarifs','prestations'],[ar?'المنتجات':'Les produits','produits'],[t.nav[2],'le-salon'],[t.book,'contact']].map(([label,path])=><HomeLink key={label} href={url(path)}>{label}</HomeLink>)}</nav><div className="footer-bottom"><HomeLink className="brand" href={url()}><span>OHH ZAZ</span><small>by SIHAM</small></HomeLink><span>{t.address}</span><a href="https://www.instagram.com/ohh_zaz/" target="_blank" rel="noopener noreferrer">INSTAGRAM <ArrowUpRight size={13}/></a><span>© {new Date().getFullYear()} OHH ZAZ by SIHAM<br/>{ar?'تطوير':'Développement'} · Naoufal Laamouri</span></div></footer></>}






