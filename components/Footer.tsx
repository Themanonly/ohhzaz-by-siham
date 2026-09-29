import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import ContactAction from './ContactAction';
import HomeLink from './HomeLink';
import {business} from '../data/business';

export default function Footer({locale,page}:{locale:'fr'|'ar';page:string}) {
  const ar=locale==='ar';
  const url=(path='')=>`/${locale}${path?'/'+path:''}`;
  const links=ar
    ? [['','الرئيسية'],['mariee','العروس'],['prestations','الخدمات والأسعار'],['produits','المنتجات'],['le-salon','الصالون'],['contact','التواصل معنا']]
    : [['','Accueil'],['mariee','La mariée'],['prestations','Prestations & tarifs'],['produits','Les produits'],['le-salon','Le salon'],['contact','Nous contacter']];
  return <footer className="site-footer" data-scroll-key="footer">
    <div className="footer-invitation">
      <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0C22 14 26 18 40 20C26 22 22 26 20 40C18 26 14 22 0 20C14 18 18 14 20 0Z" fill="currentColor"/></svg>
      <p className="eyebrow">OHH ZAZ · CASABLANCA</p>
      <h2>{page==='contact'?(ar?'الخدمات والأسعار، قبل زيارتكِ.':'La carte du salon, avant votre visite.'):(ar?'خدمة، موعد أو سؤال؟':'Une prestation, une date, une question ?')}</h2>
      <Link className="button light" href={url(page==='contact'?'prestations':'contact')}>{page==='contact'?(ar?'استعراض الأسعار':'Consulter les tarifs'):(ar?'تواصلي مع الصالون':'Contacter le salon')}<ArrowUpRight size={17}/></Link>
    </div>
    <div className="footer-directory">
      <div className="footer-identity">
        <HomeLink className="brand" href={url()} aria-label={ar?'OHH ZAZ — الرئيسية':'OHH ZAZ — Accueil'}><span>OHH ZAZ</span><small>SALON · by SIHAM</small></HomeLink>
        <address><span dir="ltr">{business.street}</span><br/>{ar?'الدار البيضاء، المغرب':'Casablanca, Maroc'}</address>
        <a className="footer-map" href={business.mapUrl} target="_blank" rel="noopener noreferrer">{ar?'الاتجاهات إلى الصالون':'Venir au salon'}<ArrowUpRight size={14}/></a>
      </div>
      <nav className="footer-navigation" aria-label={ar?'روابط أسفل الصفحة':'Navigation du pied de page'}>{links.map(([path,label])=><HomeLink key={path} href={url(path)} aria-current={page===path?'page':undefined}>{label}</HomeLink>)}</nav>
      <div className="footer-networks"><p className="eyebrow">{ar?'نبقاو على تواصل':'RESTONS EN LIEN'}</p><ContactAction platform="instagram" locale={locale} className="footer-account">Instagram</ContactAction><ContactAction platform="tiktok" locale={locale} className="footer-account">TikTok</ContactAction><ContactAction platform="whatsapp" locale={locale} className="footer-account">WhatsApp</ContactAction></div>
    </div>
    <div className="footer-colophon"><p>© {new Date().getFullYear()} {business.name}<br/>{ar?'جميع الحقوق محفوظة.':'Tous droits réservés.'}</p><Link href={url('mentions-legales')}>{ar?'الخصوصية وحقوق الموقع':'Confidentialité & droits du site'}</Link><p>{ar?'تطوير':'Développement'}<br/><bdi>{business.developer}</bdi></p></div>
  </footer>;
}
