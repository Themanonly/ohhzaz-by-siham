import type {SocialLink} from '../data/catalogue';
export function contactIdentity(link:SocialLink){
 try{const u=new URL(link.url);if(u.protocol!=='https:'||u.username||u.password||u.port)return null;
 const host=u.hostname.toLowerCase().replace(/^www\./,'');
 if(link.platform==='whatsapp'&&host==='wa.me'&&/^\/[1-9]\d{7,14}\/?$/.test(u.pathname))return '+'+u.pathname.replace(/\//g,'');
 if(link.platform==='instagram'&&host==='instagram.com'&&/^\/[A-Za-z0-9_.]+\/?$/.test(u.pathname))return '@'+u.pathname.split('/')[1];
 if(link.platform==='tiktok'&&host==='tiktok.com'&&/^\/@[A-Za-z0-9_.]+\/?$/.test(u.pathname))return u.pathname.split('/')[1];
 }catch{}return null;
}
export function contactHref(link:SocialLink,message?:string){if(!contactIdentity(link))return '#';const u=new URL(link.url);u.search='';u.hash='';if(link.platform==='whatsapp'&&message)u.searchParams.set('text',message);return u.href;}
