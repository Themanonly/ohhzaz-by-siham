import type { Metadata } from 'next';
import {siteUrl,indexable} from '../lib/site';
import { headers } from 'next/headers';
import './globals.css';
import './experience.css';
import './atelier.css';
export const metadata: Metadata = { title: 'OHH ZAZ by SIHAM — Maison de beauté à Casablanca', description: 'Coiffure, beauté et inspiration mariée. Découvrez l’univers OHH ZAZ by SIHAM à Casablanca.', metadataBase:siteUrl, verification:process.env.GOOGLE_SITE_VERIFICATION?{google:process.env.GOOGLE_SITE_VERIFICATION}:undefined, robots:{index:indexable,follow:indexable}, icons:{icon:[{url:'/brand/favicon-32.png',sizes:'32x32',type:'image/png'},{url:'/brand/favicon-192.png',sizes:'192x192',type:'image/png'}],apple:'/brand/apple-touch-icon.png'}, openGraph:{type:'website',siteName:'OHH ZAZ by SIHAM',images:[{url:'/brand/social-sharing.jpg',width:1200,height:630,alt:'OHH ZAZ by SIHAM — Casablanca'}]},twitter:{card:'summary_large_image',images:['/brand/social-sharing.jpg']}  };
export default async function Layout({children}: {children: React.ReactNode}) { const locale=(await headers()).get('x-site-locale')==='ar'?'ar':'fr'; return <html lang={locale} dir={locale==='ar'?'rtl':'ltr'}><body>{children}</body></html>; }


import './release.css';
import './finishing.css';
import './footer.css';
