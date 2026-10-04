'use client';
import {useEffect,useState} from 'react';
import {backend} from '../lib/admin-api';
type Review={id:string;name:string;rating:number;comment:string;status:string;created_at:string};
export default function AdminReviews(){
 const [rows,setRows]=useState<Review[]>([]),[notice,setNotice]=useState('Chargement…'),[busy,setBusy]=useState(false);
 const load=async()=>{setRows(await backend('/reviews',null));setNotice('')};
 useEffect(()=>{void load().catch(()=>setNotice('Chargement impossible. Rechargez la page.'))},[]);
 async function update(id:string,status:string){setBusy(true);try{await backend('/reviews',null,{method:'PATCH',body:JSON.stringify({id,status})});await load();setNotice('Statut enregistré.')}catch(e){setNotice(e instanceof Error?e.message:'Enregistrement impossible.')}finally{setBusy(false)}}
 async function remove(id:string){if(!confirm('Supprimer définitivement cet avis et son texte ?'))return;setBusy(true);try{await backend('/reviews?id='+encodeURIComponent(id),null,{method:'DELETE'});await load();setNotice('Avis supprimé.')}catch(e){setNotice(e instanceof Error?e.message:'Suppression impossible.')}finally{setBusy(false)}}
 return <section className="admin-reviews"><h2>Les mots des clientes</h2><p>Les 100 avis les plus récents, avec les avis en attente en premier. Publiez les expériences positives comme négatives ; masquez les abus, publicités et données privées. Le texte et la note restent ceux de la cliente.</p><p role="status">{notice}</p>{!rows.length&&!notice&&<p>Aucun avis reçu pour le moment.</p>}{rows.map(r=><article key={r.id} className="admin-review-card"><div><strong dir="auto">{r.name}</strong><span>{r.rating} / 5 · {r.status==='pending'?'En attente':r.status==='published'?'Publié':'Masqué'}</span></div><p dir="auto">{r.comment}</p><time dateTime={r.created_at}>{new Date(r.created_at).toLocaleDateString('fr-MA')}</time><div className="admin-review-actions"><button disabled={busy||r.status==='published'} onClick={()=>void update(r.id,'published')}>Publier</button><button disabled={busy||r.status==='hidden'} onClick={()=>void update(r.id,'hidden')}>Masquer</button><button disabled={busy||r.status==='pending'} onClick={()=>void update(r.id,'pending')}>Remettre en attente</button><button disabled={busy} onClick={()=>void remove(r.id)}>Supprimer</button></div></article>)}</section>
}
