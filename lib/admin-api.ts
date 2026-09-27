export const backendUrl=process.env.NEXT_PUBLIC_SUPABASE_URL||'';
const publicKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'';
export const backendReady=Boolean(backendUrl&&publicKey);
export async function backend(path:string,token:string|null,options:RequestInit={}){
 const headers=new Headers(options.headers);headers.set('apikey',publicKey);if(token)headers.set('Authorization',`Bearer ${token}`);
 if(typeof options.body==='string')headers.set('Content-Type','application/json');
 const res=await fetch(`${backendUrl}${path}`,{...options,headers,signal:AbortSignal.timeout(20000)});
 if(!res.ok)throw new Error(res.status===401?'Session expirée. Reconnectez-vous.':res.status===403?'Votre rôle ne permet pas cette action.':res.status===409?'Cet élément est encore utilisé ou existe déjà.':'Enregistrement impossible. Vérifiez les champs et la connexion, puis réessayez.');
 return res.status===204?null:res.json();
}
