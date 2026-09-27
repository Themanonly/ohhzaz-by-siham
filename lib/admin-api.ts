export async function backend(path:string,_token:string|null,options:RequestInit={}){
 const headers=new Headers(options.headers);if(typeof options.body==='string')headers.set('Content-Type','application/json');
 const res=await fetch(`/api/admin${path}`,{...options,headers,credentials:'same-origin',signal:AbortSignal.timeout(20000)});
 if(!res.ok)throw new Error(res.status===401?'Connexion refusée ou session expirée.':res.status===429?'Trop de tentatives. Réessayez dans 15 minutes.':res.status===403?'Votre rôle ne permet pas cette action.':res.status===409?'Cet élément est encore utilisé ou existe déjà.':'Enregistrement impossible. Vérifiez les champs et la connexion.');
 return res.status===204?null:res.json();
}
