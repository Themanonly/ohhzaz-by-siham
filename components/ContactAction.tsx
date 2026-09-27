'use client';
import {createContext,useContext,useRef,useEffect,useState,type ReactNode} from 'react';
import {ArrowUpRight,X} from 'lucide-react';
import {socialLinks,type SocialLink,type Platform} from '../data/catalogue';
import {contactIdentity,contactHref} from '../lib/contacts';
export const ContactsContext=createContext<SocialLink[]>(socialLinks);
export default function ContactAction({platform,locale,message,children,className='text-link'}:{platform:Platform;locale:'fr'|'ar';message?:string;children:ReactNode;className?:string}){
 const links=useContext(ContactsContext).filter(l=>l.platform===platform&&contactIdentity(l));const dialog=useRef<HTMLDialogElement>(null);const [open,setOpen]=useState(false);
 useEffect(()=>{if(!open)return;const el=dialog.current;el?.showModal();const prior=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{el?.close();document.body.style.overflow=prior}},[open]);
 if(!links.length)return null;
 if(links.length===1)return <a className={className} href={contactHref(links[0],message)} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={16}/></a>;
 return <><button type="button" className={className} onClick={()=>setOpen(true)} aria-haspopup="dialog">{children}<ArrowUpRight size={16}/></button><dialog ref={dialog} className="contact-dialog" aria-label={locale==='ar'?'اختاري الحساب':'Choisissez le compte'} onCancel={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget)setOpen(false)}}><button type="button" className="dialog-close" onClick={()=>setOpen(false)} aria-label={locale==='ar'?'إغلاق':'Fermer'}><X/></button><p className="eyebrow">OHH ZAZ · {platform}</p><h2>{locale==='ar'?'اختاري الحساب':'Choisissez le compte'}</h2><div className="contact-accounts">{links.map(l=><a key={l.id} href={contactHref(l,message)} target="_blank" rel="noopener noreferrer"><bdi>{contactIdentity(l)}</bdi><ArrowUpRight size={18}/></a>)}</div></dialog></>;
}
