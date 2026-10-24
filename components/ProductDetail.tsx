'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ChevronLeft,ChevronRight,ZoomIn,ZoomOut,X,Link as LinkIcon,Check} from 'lucide-react';
import {productImages,type Product,type ProductCategory} from '../data/catalogue';
import {siteUrl} from '../lib/site';
import {productPath} from '../lib/product-links';
import ContactAction from './ContactAction';
import {AddToCart} from './CartProvider';

export default function ProductDetail({product,categories,locale}:{product:Product;categories:ProductCategory[];locale:'fr'|'ar'}){
 const ar=locale==='ar',images=productImages(product),name=product.name[locale]||product.name.fr;
 const [index,setIndex]=useState(0),[zoom,setZoom]=useState(false),[copied,setCopied]=useState(false),[copyError,setCopyError]=useState(false),[magnified,setMagnified]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLButtonElement>(null),touch=useRef<{x:number;y:number}|null>(null);
 useEffect(()=>{setMagnified(false)},[index,zoom]);
 const active=images[index],path=productPath(locale,product.id);
 const category=categories.find(c=>c.id===product.category_id)?.name;
 const description=product.description?.[locale]||product.description?.fr;
 const price=product.price===null?'':new Intl.NumberFormat(ar?'ar-MA':'fr-MA',{style:'currency',currency:'MAD'}).format(product.price);
 const move=(delta:number)=>setIndex(i=>(i+delta+images.length)%images.length);
 useEffect(()=>{if(!zoom)return;const el=dialog.current;el?.showModal();const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{el?.close();document.body.style.overflow=before;opener.current?.focus();};},[zoom]);
 useEffect(()=>{if(!copied)return;const timer=setTimeout(()=>setCopied(false),3000);return()=>clearTimeout(timer)},[copied]);
 const copyLink=async()=>{try{await navigator.clipboard.writeText(new URL(path,window.location.origin).href);setCopied(true);setCopyError(false)}catch{setCopyError(true)}};
 const keyboard=(e:React.KeyboardEvent)=>{if(images.length<2)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move((e.key==='ArrowRight'?1:-1)*(ar?-1:1))}};
 const swipe={onTouchStart:(e:React.TouchEvent)=>{touch.current=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},onTouchEnd:(e:React.TouchEvent)=>{const start=touch.current;touch.current=null;if(!start||!e.changedTouches.length||images.length<2)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)move((dx<0?1:-1)*(ar?-1:1))},onTouchCancel:()=>{touch.current=null}};
 const photo=(expanded=false)=><img key={active} src={active} srcSet={active?.startsWith('/api/media/')?`${active}?w=640 640w, ${active}?w=960 960w, ${active}?w=1600 1600w`:undefined} sizes={expanded?'95vw':'(max-width: 800px) 100vw, 60vw'} alt={`${name} — ${ar?'الصورة':'photo'} ${index+1}`} width={1000} height={1000} fetchPriority="high" decoding="async" draggable={false}/>;
 const controls=<div className="pdp-photo-controls"><button type="button" onClick={()=>move(-1)} aria-label={ar?'الصورة السابقة':'Photo précédente'}>{ar?<ChevronRight/>:<ChevronLeft/>}</button><span aria-live="polite" aria-atomic="true">{index+1} / {images.length}</span><button type="button" onClick={()=>move(1)} aria-label={ar?'الصورة التالية':'Photo suivante'}>{ar?<ChevronLeft/>:<ChevronRight/>}</button></div>;
 const orderMessage=ar?`مرحباً، أود طلب ${name}${price?`، بالسعر المعروض ${price}`:''}. هل هو متوفّر؟\n${new URL(path,siteUrl).href}`:`Bonjour, je souhaite commander ${name}${price?` au prix affiché de ${price}`:''}. Est-il disponible ?\n${new URL(path,siteUrl).href}`;
 return <article className="pdp" data-scroll-key="product-detail">
  <nav className="pdp-breadcrumb" aria-label={ar?'مسار الصفحة':'Fil d’Ariane'}><Link href={`/${locale}/produits`}>{ar?<ArrowRight size={16}/>:<ArrowLeft size={16}/>} {ar?'جميع المنتجات':'Tous les produits'}</Link><span aria-hidden="true">/</span><span>{category?.[locale]||category?.fr}</span></nav>
  <div className="pdp-layout">
   <section className="pdp-gallery" aria-label={ar?'صور المنتج':'Photos du produit'} onKeyDown={keyboard}>
    <div className="pdp-stage" {...swipe}><button className="pdp-open-image" ref={opener} type="button" onClick={()=>setZoom(true)} aria-label={ar?'تكبير صورة المنتج':'Agrandir la photo du produit'}>{photo()}<span className="pdp-zoom-label"><ZoomIn size={18}/>{ar?'تكبير':'Agrandir'}</span></button>{images.length>1&&controls}</div>
    {images.length>1&&<div className="pdp-thumbnails" role="group" aria-label={ar?'اختيار صورة':'Choisir une photo'}>{images.map((src,i)=><button key={src} type="button" aria-pressed={i===index} aria-label={ar?`الصورة ${i+1}`:`Photo ${i+1}`} onClick={()=>setIndex(i)}><img src={src.startsWith('/api/media/')?`${src}?w=320`:src} width={80} height={80} alt="" loading="lazy"/></button>)}</div>}
   </section>
   <div className="pdp-information"><p className="eyebrow">{category?.[locale]||category?.fr||'OHH ZAZ'}</p><h1 dir="auto">{name}</h1><p className="pdp-price"><bdi>{price}</bdi></p>
    <div className="pdp-purchase"><AddToCart id={product.id} locale={locale}/><ContactAction platform="whatsapp" locale={locale} message={orderMessage} className="text-link cart-direct">{ar?'اطلبي عبر واتساب':'Commander sur WhatsApp'}</ContactAction><p>{ar?'التوفّر والاستلام يتم تأكيدهما مع الصالون.':'Disponibilité et retrait à confirmer avec le salon.'}</p></div>
    {description&&<div className="pdp-description"><h2>{ar?'عن المنتج':'À propos de ce produit'}</h2><p dir="auto">{description}</p></div>}
    <button type="button" className="text-link pdp-share" onClick={()=>void copyLink()}>{copied?<Check size={17}/>:<LinkIcon size={17}/>}<span aria-live="polite">{copied?(ar?'تم نسخ الرابط':'Lien copié'):(ar?'نسخ رابط المنتج':'Copier le lien du produit')}</span></button>{copyError&&<p role="status">{ar?'يمكنك نسخ الرابط من شريط العنوان.':'Vous pouvez copier le lien dans la barre d’adresse.'}</p>}
   </div>
  </div>
  <dialog className="pdp-lightbox" ref={dialog} onCancel={()=>setZoom(false)} aria-label={ar?'صورة المنتج المكبّرة':'Photo du produit agrandie'} onKeyDown={keyboard}>
   <button autoFocus type="button" className="pdp-lightbox-close" onClick={()=>setZoom(false)} aria-label={ar?'إغلاق الصورة':'Fermer la photo'}><X/></button><button type="button" className="pdp-magnify" aria-pressed={magnified} onClick={()=>setMagnified(v=>!v)}>{magnified?<ZoomOut size={18}/>:<ZoomIn size={18}/>} {magnified?(ar?'عرض كامل':'Vue entière'):(ar?'تكبير ×2':'Zoom ×2')}</button><div className={`pdp-lightbox-photo${magnified?' is-magnified':''}`} {...(magnified?{}:swipe)}>{zoom&&photo(true)}</div>{images.length>1&&controls}
  </dialog>
 </article>
}
