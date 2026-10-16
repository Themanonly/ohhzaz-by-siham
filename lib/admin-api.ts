export class AdminApiError extends Error {
 public status:number;
 constructor(status:number,message:string){super(message);this.status=status;this.name='AdminApiError';}
}
export async function backend(path:string,_token:string|null,options:RequestInit={}){
 const headers=new Headers(options.headers);if(typeof options.body==='string')headers.set('Content-Type','application/json');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
 try {
  const res=await fetch(`/api/admin${path}`,{...options,headers,credentials:'same-origin',signal:controller.signal});
  if(!res.ok)throw new AdminApiError(res.status,res.status===401?'Connexion refusée ou session expirée. Reconnectez-vous avant de réessayer.':res.status===429?'Trop de tentatives. Réessayez dans 15 minutes.':res.status===403?'Cette action est refusée. Vérifiez votre connexion et votre rôle.':res.status===409?'Cet élément est encore utilisé ou existe déjà.':res.status===413?'La photo est trop volumineuse. Choisissez une version plus légère.':res.status===400||res.status===415?'Le fichier ou les champs ont été refusés. Vérifiez la photo, le nom, le prix et la catégorie.':'Enregistrement impossible pour le moment. Vos champs sont conservés. Réessayez dans un instant.');
  return res.status===204?null:await res.json();
 }catch(error){
  if(error instanceof AdminApiError)throw error;
  throw new Error(controller.signal.aborted?'Le serveur met trop de temps à répondre. Vérifiez le catalogue avant de réessayer pour éviter un doublon.':'La connexion a été interrompue. Vos champs sont conservés. Vérifiez le catalogue avant de réessayer.');
 }finally{clearTimeout(timer);}
}
