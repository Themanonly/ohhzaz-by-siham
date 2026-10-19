'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import AdminReviews from './AdminReviews';
import {ArrowUpRight,LogOut,Package,Layers,Scissors,Link2,ShieldCheck,Trash2} from 'lucide-react';
import {AdminApiError,backend} from '../lib/admin-api';
import {prepareProductPhoto,photoError,productFormErrors,productRequestId,type ProductErrors,type ProductField} from '../lib/product-form';
import {contactIdentity} from '../lib/contacts';
import {productImages,type Product,type ProductCategory,type SocialLink,type Platform} from '../data/catalogue';
import {categories as initialServices,type Category} from '../data/services';
export default function AdminPanel({backendReady=false}:{backendReady?:boolean}){
 const [session,setSession]=useState<{token:string;role:string}|null>(null),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[tab,setTab]=useState('products');
 const [items,setItems]=useState<Product[]>([]),[cats,setCats]=useState<ProductCategory[]>([]),[links,setLinks]=useState<SocialLink[]>([]),[groups,setGroups]=useState<Category[]>(initialServices);
 const [edit,setEdit]=useState<Product|null>(null),[name,setName]=useState(''),[nameAr,setNameAr]=useState(''),[price,setPrice]=useState(''),[cat,setCat]=useState(''),[description,setDescription]=useState(''),[descriptionAr,setDescriptionAr]=useState(''),[photos,setPhotos]=useState<(File|string)[]>([]),[published,setPublished]=useState(false);
 const [categoryEdit,setCategoryEdit]=useState<ProductCategory|null>(null),[categoryName,setCategoryName]=useState(''),[categoryAr,setCategoryAr]=useState('');
 const [linkEdit,setLinkEdit]=useState<SocialLink|null>(null),[platform,setPlatform]=useState<Platform>('whatsapp'),[address,setAddress]=useState('');
 const load=async(token:string)=>{const [p,c,l,g]=await Promise.all(['products?order=created_at.desc','product_categories?order=created_at.asc','social_links?order=created_at.asc','service_groups?order=created_at.asc'].map(t=>backend('/data/'+t,token)));setItems(p);setCats(c);setLinks(l);setGroups(initialServices.map(group=>g.find((v:Category)=>v.id===group.id)||group));};
 const run=async(action:()=>Promise<void>,success='Enregistré. Le site public affichera la modification à son prochain chargement.')=>{setBusy(true);setNotice('');try{await action();setNotice(success)}catch(e){if(e instanceof AdminApiError&&e.status===401){setSession(null);setPassword('')}setNotice(e instanceof Error?e.message:'Une erreur est survenue.') }finally{setBusy(false)}};
 const save=async(table:string,id:string|null,value:unknown)=>{
  if(!session)throw new Error('Connexion requise.');
  const headers:Record<string,string>={Prefer:'return=representation'};
  if(table==='products'&&!id)headers['Idempotency-Key']=creationKey.current??=productRequestId();
  const result=await backend('/data/'+table+(id?'?id=eq.'+encodeURIComponent(id):''),session.token,{method:id?'PATCH':'POST',headers,body:JSON.stringify(value)});
  if(!result?.length)throw new Error('Modification refusée ou élément introuvable.');return result;
 };
 const [uploadVersion,setUploadVersion]=useState(0);
 const [checking,setChecking]=useState(backendReady);
 const [previews,setPreviews]=useState<string[]>([]);
 const [discard,setDiscard]=useState<Product|null>(null);
 const [productErrors,setProductErrors]=useState<ProductErrors>({});
 const [productFeedback,setProductFeedback]=useState<{kind:'progress'|'error'|'success';text:string}|null>(null);
 const productSaving=useRef(false),uploadedPhotos=useRef(new Map<File,string>());
 const creationKey=useRef<string|null>(null);
 const [resumeProduct,setResumeProduct]=useState(false);
 const productForm=useRef<HTMLFormElement>(null);
 const fieldError=(field:ProductField)=>productErrors[field]?<small id={'product-error-'+field} className="admin-field-error">{productErrors[field]}</small>:null;
 const fieldProps=(field:ProductField)=>({'aria-invalid':!!productErrors[field],'aria-describedby':productErrors[field]?'product-error-'+field:undefined});
 const discardDraft=()=>{if(!session||!discard)return;const id=discard.id;void run(async()=>{await backend('/data/products?id=eq.'+encodeURIComponent(id),session.token,{method:'DELETE'});if(edit?.id===id)resetProduct();setDiscard(null);await load(session.token)},'Brouillon supprimé. Le produit ne figure plus dans votre catalogue.');};
 useEffect(()=>{const urls=photos.map(photo=>typeof photo==='string'?photo:URL.createObjectURL(photo));setPreviews(urls);return()=>urls.forEach((url,i)=>{if(typeof photos[i]!=='string')URL.revokeObjectURL(url)})},[photos]);
 useEffect(()=>{if(!backendReady)return;let mounted=true;void backend('/auth/session',null).then(async result=>{await load('session');if(mounted)setSession({token:'session',role:result.role});}).catch(e=>{if(mounted&&!(e instanceof AdminApiError&&e.status===401))setNotice('Connexion au serveur indisponible. Rechargez la page pour réessayer.');}).finally(()=>{if(mounted)setChecking(false)});return()=>{mounted=false};},[backendReady]);
 const resetProduct=()=>{creationKey.current=null;uploadedPhotos.current.clear();setProductErrors({});setUploadVersion(v=>v+1);setEdit(null);setName('');setNameAr('');setPrice('');setDescription('');setDescriptionAr('');setPhotos([]);setPublished(false);setCat('')};
 const openProduct=(p:Product)=>{creationKey.current=null;uploadedPhotos.current.clear();setProductErrors({});setProductFeedback(null);setEdit(p);setName(p.name.fr);setNameAr(p.name.ar);setPrice(String(p.price??''));setDescription(p.description?.fr||'');setDescriptionAr(p.description?.ar||'');setPhotos(productImages(p));setPublished(p.status==='published');setCat(p.category_id);window.scrollTo({top:0,behavior:'smooth'})};
 const submitProduct=async(e:FormEvent)=>{
  e.preventDefault();if(productSaving.current||busy)return;
  const category=cat||cats[0]?.id||'';
  const errors=productFormErrors({name,nameAr,price,category,description,descriptionAr,photo:photos[0]&&typeof photos[0]!=='string'?photos[0]:null,existingImage:typeof photos[0]==='string'?photos[0]:undefined},cats.map(c=>c.id));
  for(const photo of photos){if(typeof photo!=='string'){const problem=photoError(photo);if(problem)errors.photo=problem;}}
  setProductErrors(errors);setNotice('');
  if(Object.keys(errors).length){
   setProductFeedback({kind:'error',text:'Le produit n’a pas été enregistré. Corrigez les champs indiqués.'});
   const first=productForm.current?.querySelector<HTMLElement>('[data-product-field="'+Object.keys(errors)[0]+'"]');
   const details=first?.closest('details');if(details)details.open=true;
   first?.focus();return;
  }
  productSaving.current=true;setBusy(true);
  try{
   if(!session)throw new Error('Votre session a expiré. Reconnectez-vous pour enregistrer ce produit.');
   const sources:string[]=[];
   for(const [index,entry] of photos.entries()){
    if(typeof entry==='string'){sources.push(entry);continue;}
    let src=uploadedPhotos.current.get(entry);
    if(!src){
     setProductFeedback({kind:'progress',text:`Préparation et envoi de la photo ${index+1} sur ${photos.length}…`});
     const photo=await prepareProductPhoto(entry);
     const uploaded=await backend('/uploads',session.token,{method:'POST',headers:{'Content-Type':photo.type},body:photo});
     src=String(uploaded.url);uploadedPhotos.current.set(entry,src);
    }
    sources.push(src);
   }
   setProductFeedback({kind:'progress',text:'Enregistrement du produit…'});
   const [saved]=await save('products',edit?.id||null,{name:{fr:name.trim(),ar:nameAr.trim()||name.trim()},price:Number(price.trim().replace(',','.')),category_id:category,description:{fr:description.trim(),ar:descriptionAr.trim()},image:sources[0],images:sources,status:published?'published':'draft'});
   const confirmation=published?'Produit enregistré et visible sur le site.':'Brouillon enregistré dans votre catalogue. Activez « Afficher sur le site » pour le publier.';
   // A failed list refresh must never turn a confirmed save into a failed save.
   setItems(all=>[saved,...all.filter(p=>p.id!==saved.id)]);resetProduct();
   setProductFeedback({kind:'success',text:confirmation});
   try{setItems(await backend('/data/products',session.token));}
   catch{setProductFeedback({kind:'success',text:confirmation+' La liste complète sera actualisée au prochain chargement.'});}
  }catch(error){
   if(error instanceof AdminApiError&&error.status===401){setResumeProduct(true);setSession(null);setPassword('');setNotice('Votre session a expiré. Connectez-vous pour retrouver votre fiche et sa photo, sans recharger la page.');}
   setProductFeedback({kind:'error',text:error instanceof Error?error.message:'Enregistrement impossible. Vos champs sont conservés.'});
  }
  finally{productSaving.current=false;setBusy(false);}
 };
 if(checking)return <main className="admin-panel admin-login" aria-busy="true"><p className="eyebrow">OHH ZAZ · STUDIO</p><h1>Votre espace salon.</h1><p role="status">Vérification de votre session…</p></main>;
 if(!backendReady)return <main className="admin-panel"><Link href="/fr">← OHH ZAZ</Link><h1>Administration</h1><p className="admin-notice">La connexion sécurisée au serveur est indisponible. Contactez le propriétaire du site.</p></main>;
 if(!session)return <main className="admin-panel admin-login"><Link href="/fr">← OHH ZAZ</Link><h1>Votre espace salon.</h1><p>Connexion réservée aux comptes invités par le propriétaire.</p><form onSubmit={e=>{e.preventDefault();void run(async()=>{const result=await backend('/auth/login',null,{method:'POST',body:JSON.stringify({email,password})});setPassword('');await load('session');setSession({token:'session',role:result.role});if(resumeProduct){setResumeProduct(false);setProductFeedback({kind:'success',text:'Session rétablie. Votre fiche et sa photo ont été conservées. Cliquez sur le bouton d’enregistrement pour continuer.'});}},'Connexion établie.')}}><label>E-mail<input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Mot de passe<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy} className="button">{busy?'Connexion…':'Se connecter'}</button></form><p role="status">{notice}</p></main>;
 return <main className="admin-panel"><header className="admin-heading"><div className="admin-topline"><span className="eyebrow">OHH ZAZ · STUDIO</span><Link href="/fr">Voir le site <ArrowUpRight size={16}/></Link></div><h1>Le salon, à jour.</h1><p className="admin-session"><ShieldCheck size={16}/>{session.role==='admin'?'Administrateur':'Manager'} · Session sécurisée de 8 heures. Déconnectez-vous sur un appareil partagé.</p><button className="text-link admin-logout" onClick={()=>void run(async()=>{await backend('/auth/logout',session.token,{method:'POST'});setSession(null);setItems([]);setCats([]);setLinks([]);resetProduct()},'Déconnexion effectuée.')}><LogOut size={16}/>Se déconnecter</button></header><div className="admin-overview"><div><Package size={20}/><strong>{items.filter(p=>p.status==='published').length}</strong><span>Produits visibles</span></div><div><Layers size={20}/><strong>{items.filter(p=>p.status==='draft').length}</strong><span>Brouillons</span></div><div><Scissors size={20}/><strong>{groups.reduce((n,g)=>n+g.items.length,0)}</strong><span>Prestations</span></div></div><div className="admin-tabs">{[['products','Produits'],['categories','Catégories'],['services','Tarifs'],...(session.role==='admin'?[['contacts','Contacts & réseaux'],['reviews','Avis']]:[])].map(([id,label])=><button key={id} aria-pressed={tab===id} disabled={busy} onClick={()=>{setTab(id);setNotice('')}}>{id==='products'?<Package size={17}/>:id==='categories'?<Layers size={17}/>:id==='services'?<Scissors size={17}/>:<Link2 size={17}/>} {label}</button>)}</div><p role="status" className="admin-status">{busy?'Enregistrement en cours…':notice}</p>
 {tab==='reviews'&&session.role==='admin'&&<AdminReviews/>}
 {tab==='products'&&<><h2>{edit?'Modifier le produit':'Créer un produit'}</h2>
 <form ref={productForm} onSubmit={submitProduct} noValidate aria-busy={busy} className="admin-product-form">
  <fieldset disabled={busy} className="admin-product-fields">
   <legend className="sr-only">Fiche produit</legend>
   <p className="admin-form-intro">Une photo, un nom, un prix. Le produit reste en brouillon tant que vous n’activez pas sa publication.</p>
   <label>Photos du produit · {photos.length}/8
    <input data-product-field="photo" {...fieldProps('photo')} key={(edit?.id||'new')+'-'+uploadVersion} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e=>{
     const files=Array.from(e.target.files||[]);e.target.value='';
     if(photos.length+files.length>8){setProductErrors(all=>({...all,photo:'Vous pouvez ajouter jusqu’à 8 photos.'}));return;}
     const problem=files.map(photoError).find(Boolean);
     if(problem){setProductErrors(all=>({...all,photo:problem}));return;}
     setPhotos(all=>[...all,...files]);setProductErrors(all=>({...all,photo:undefined}));setProductFeedback(null);
    }}/>
    <small>La première photo est la couverture. Ajoutez jusqu’à 8 photos JPG, PNG ou WebP, 20 Mo chacune. Optimisation automatique.</small>{fieldError('photo')}
   </label>
   <ol className="admin-photo-gallery">{photos.map((photo,index)=><li key={typeof photo==='string'?photo:`${photo.name}-${index}`}>
    <img src={previews[index]} alt={`Photo ${index+1} du produit`}/><span>{index===0?'Couverture':`Photo ${index+1}`}</span>{typeof photo!=='string'&&<small className="admin-photo-name">{photo.name}</small>}
    <div><button type="button" disabled={index===0} aria-label={`Avancer la photo ${index+1}`} onClick={()=>setPhotos(all=>{const next=[...all];[next[index-1],next[index]]=[next[index],next[index-1]];return next;})}>←</button>
    <button type="button" disabled={index===photos.length-1} aria-label={`Reculer la photo ${index+1}`} onClick={()=>setPhotos(all=>{const next=[...all];[next[index+1],next[index]]=[next[index],next[index+1]];return next;})}>→</button>
    <button type="button" aria-label={`Retirer la photo ${index+1}`} onClick={()=>setPhotos(all=>all.filter((_,i)=>i!==index))}><Trash2 size={16}/></button></div>
   </li>)}</ol>
   <div className="admin-pair">
    <label>Nom<input data-product-field="name" {...fieldProps('name')} required maxLength={160} value={name} onChange={e=>setName(e.target.value)}/>{fieldError('name')}</label>
    <label>Nom arabe (facultatif)<input data-product-field="nameAr" {...fieldProps('nameAr')} dir="rtl" maxLength={160} value={nameAr} onChange={e=>setNameAr(e.target.value)}/>{fieldError('nameAr')}</label>
   </div>
   <div className="admin-pair">
    <label>Prix en DH<input data-product-field="price" {...fieldProps('price')} required type="text" inputMode="decimal" placeholder="299,90" value={price} onChange={e=>setPrice(e.target.value)}/>{fieldError('price')}</label>
    <label>Catégorie<select data-product-field="category" {...fieldProps('category')} required value={cat||cats[0]?.id||''} onChange={e=>setCat(e.target.value)}>{!cats.length&&<option value="">Aucune catégorie disponible</option>}{cats.map(c=><option key={c.id} value={c.id}>{c.name.fr}</option>)}</select>{fieldError('category')}</label>
   </div>
   <details><summary>Ajouter une description (facultatif)</summary>
    <label>Description française<textarea data-product-field="description" {...fieldProps('description')} maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)}/>{fieldError('description')}</label>
    <label>Description arabe<textarea data-product-field="descriptionAr" {...fieldProps('descriptionAr')} dir="rtl" maxLength={2000} value={descriptionAr} onChange={e=>setDescriptionAr(e.target.value)}/>{fieldError('descriptionAr')}</label>
   </details>
   <label className="inline-field"><input type="checkbox" checked={published} onChange={e=>setPublished(e.target.checked)}/>Afficher sur le site</label>
  </fieldset>
  {!cats.length&&<p className="admin-field-error">Créez une catégorie dans l’onglet « Catégories » avant d’enregistrer votre produit.</p>}
  <div className="admin-save-actions">
   <button type="submit" disabled={busy} className="button">{busy?'Enregistrement…':edit?'Enregistrer les modifications':published?'Créer et publier le produit':'Créer le produit'}</button>
   {edit&&<button type="button" disabled={busy} onClick={()=>{resetProduct();setProductFeedback(null)}}>Annuler</button>}
  </div>
  <div className="admin-product-feedback" data-kind={productFeedback?.kind} role={productFeedback?.kind==='error'?'alert':'status'} aria-live={productFeedback?.kind==='error'?'assertive':'polite'} aria-atomic="true">{productFeedback?.text}</div>
 </form>
 <h2>Votre catalogue</h2>{!items.length&&<p className="admin-empty">Votre premier produit apparaîtra ici. Les brouillons restent privés jusqu’à leur publication.</p>}
 {discard&&<div className="admin-discard" role="alert"><div><strong>Supprimer ce brouillon ?</strong><p>{discard.name.fr}</p><small>Cette fiche sera supprimée. Les autres produits restent disponibles.</small></div><div><button type="button" disabled={busy} onClick={()=>setDiscard(null)}>Conserver</button><button type="button" className="admin-delete" disabled={busy} onClick={discardDraft}><Trash2 size={16}/>Supprimer le brouillon</button></div></div>}
 <div className="admin-list">{items.map(p=><div className="admin-row" key={p.id}>{p.image&&<img className="admin-product-thumb" src={p.image} alt="" loading="lazy"/>}<span>{p.name.fr} · {p.price} DH · {p.status==='published'?'Visible':'Brouillon'}</span><button disabled={busy} onClick={()=>openProduct(p)}>Modifier</button>{p.status==='published'&&<a href={`/fr/produits/${p.id}`} target="_blank" rel="noopener noreferrer">Voir le produit ↗</a>}{p.status==='draft'&&<button type="button" disabled={busy} className="admin-delete" aria-label={'Supprimer le brouillon '+p.name.fr} onClick={()=>setDiscard(p)}><Trash2 size={16}/>Supprimer</button>}</div>)}</div></>}
 {tab==='categories'&&<><h2>{categoryEdit?'Modifier la catégorie':'Nouvelle catégorie'}</h2><form onSubmit={e=>{e.preventDefault();void run(async()=>{await save('product_categories',categoryEdit?.id||null,{name:{fr:categoryName.trim(),ar:categoryAr.trim()||categoryName.trim()}});await load(session.token);setCategoryEdit(null);setCategoryName('');setCategoryAr('')})}}><label>Nom<input required value={categoryName} onChange={e=>setCategoryName(e.target.value)}/></label><label>Nom arabe (facultatif)<input value={categoryAr} onChange={e=>setCategoryAr(e.target.value)}/></label><button className="button" disabled={busy}>Enregistrer la catégorie</button></form><div className="admin-list">{cats.map(c=><div className="admin-row" key={c.id}><span>{c.name.fr} / {c.name.ar}</span><button onClick={()=>{setCategoryEdit(c);setCategoryName(c.name.fr);setCategoryAr(c.name.ar)}}>Modifier</button></div>)}</div></>}
 {tab==='contacts'&&session.role==='admin'&&<><h2>{linkEdit?'Modifier le compte':'Ajouter un compte'}</h2><p>Un compte ouvre directement son lien. Plusieurs comptes ouvrent un choix avec leurs identifiants.</p><form onSubmit={e=>{e.preventDefault();void run(async()=>{let url=address.trim();if(platform==='whatsapp'&&!url.startsWith('https://')){let digits=url.replace(/\D/g,'');if(digits.startsWith('0'))digits='212'+digits.slice(1);url='https://wa.me/'+digits;}const link={id:'new',platform,url};if(!contactIdentity(link))throw new Error('Lien de profil invalide. Utilisez un profil Instagram/TikTok HTTPS, ou un numéro WhatsApp international.');const clean=new URL(url);clean.search='';clean.hash='';await save('social_links',linkEdit?.id||null,{platform,url:clean.href});await load(session.token);setLinkEdit(null);setAddress('')})}}><label>Plateforme<select value={platform} onChange={e=>setPlatform(e.target.value as Platform)}><option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option><option value="tiktok">TikTok</option></select></label><label>Lien du profil ou numéro WhatsApp<input required value={address} onChange={e=>setAddress(e.target.value)}/></label><button className="button" disabled={busy}>Enregistrer le compte</button></form><div className="admin-list">{links.map(l=><div className="admin-row" key={l.id}><span>{l.platform} · {contactIdentity(l)}</span><button onClick={()=>{setLinkEdit(l);setPlatform(l.platform);setAddress(l.url)}}>Modifier</button><button disabled={busy} onClick={()=>{if(confirm('Retirer ce compte des liens publics ?'))void run(async()=>{await backend('/data/social_links?id=eq.'+encodeURIComponent(l.id),session.token,{method:'DELETE',headers:{Prefer:'return=representation'}});await load(session.token)})}}>Retirer</button></div>)}</div></>}
 {tab==='services'&&<><h2>Services & tarifs</h2><p>Modifiez les prix et les intitulés, puis enregistrez la catégorie. Activez « À partir de » pour les prestations dont le tarif varie.</p>{groups.map((g,gi)=><details className="admin-service-group" key={g.id} open={gi===0}><summary>{g.fr}<span>{g.items.length} prestations</span></summary><form onSubmit={e=>{e.preventDefault();void run(async()=>{await backend('/data/service_groups',session.token,{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(g)});await load(session.token)})}}>{g.items.map((service,si)=><div key={si} className="admin-pair"><label>Service<input required value={service.fr} onChange={e=>setGroups(all=>all.map((v,i)=>i!==gi?v:{...v,items:v.items.map((s,j)=>j!==si?s:{...s,fr:e.target.value})}))}/></label><label>العربية<input required dir="rtl" value={service.ar} onChange={e=>setGroups(all=>all.map((v,i)=>i!==gi?v:{...v,items:v.items.map((s,j)=>j!==si?s:{...s,ar:e.target.value})}))}/></label><label>Prix (DH)<input type="number" required min="0" step="0.01" value={service.price} onChange={e=>setGroups(all=>all.map((v,i)=>i!==gi?v:{...v,items:v.items.map((s,j)=>j!==si?s:{...s,price:Number(e.target.value)})}))}/></label><label className="inline-field"><input type="checkbox" checked={!!service.from} onChange={e=>setGroups(all=>all.map((v,i)=>i!==gi?v:{...v,items:v.items.map((s,j)=>j!==si?s:{...s,from:e.target.checked})}))}/>À partir de</label></div>)}<button type="button" onClick={()=>setGroups(all=>all.map((v,i)=>i!==gi?v:{...v,items:[...v.items,{fr:'',ar:'',price:0}]}))}>Ajouter une prestation</button><button disabled={busy} className="button">Enregistrer {g.fr}</button></form></details>)}</>}
 </main>;
}
