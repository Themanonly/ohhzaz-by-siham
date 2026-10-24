'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {ShoppingBag} from 'lucide-react';
import {CART_KEY,cleanCart,type CartLine} from '../lib/cart';
const Context=createContext({lines:[] as CartLine[],open:false,ready:false,setOpen:(_v:boolean)=>{},add:(_id:string)=>{},quantity:(_id:string,_n:number)=>{}});
export const useCart=()=>useContext(Context);
export function CartProvider({children}:{children:ReactNode}){
 const [lines,setLines]=useState<CartLine[]>([]),[open,setOpen]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{try{setLines(cleanCart(JSON.parse(localStorage.getItem(CART_KEY)||'[]')))}catch{}setReady(true);const sync=(e:StorageEvent)=>{if(e.key===CART_KEY)try{setLines(cleanCart(JSON.parse(e.newValue||'[]')))}catch{}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(CART_KEY,JSON.stringify(lines))}catch{}},[lines,ready]);
 const add=(id:string)=>{setLines(previous=>{const existing=previous.find(p=>p.id===id);return cleanCart(existing?previous.map(p=>p.id===id?{...p,quantity:Math.min(99,p.quantity+1)}:p):[...previous,{id,quantity:1}])});setOpen(true)};
 const quantity=(id:string,n:number)=>setLines(previous=>n===0?previous.filter(p=>p.id!==id):cleanCart(previous.map(p=>p.id===id?{...p,quantity:n}:p)));
 return <Context.Provider value={{lines,open,ready,setOpen,add,quantity}}>{children}</Context.Provider>
}
export function CartButton({locale}:{locale:'fr'|'ar'}){const c=useCart(),n=c.lines.reduce((s,p)=>s+p.quantity,0);return <button type="button" className="cart-trigger" onClick={()=>c.setOpen(true)} aria-label={`${locale==='ar'?'السلة':'Panier'} (${n})`} aria-haspopup="dialog"><ShoppingBag size={20}/>{n>0&&<span>{n}</span>}</button>}
export function AddToCart({id,locale}:{id:string;locale:'fr'|'ar'}){const c=useCart();return <button type="button" className="button cart-add" disabled={!c.ready||(!c.lines.some(p=>p.id===id)&&c.lines.length>=20)||c.lines.some(p=>p.id===id&&p.quantity>=99)} onClick={()=>c.add(id)}><ShoppingBag size={18}/>{locale==='ar'?'أضيفي إلى السلة':'Ajouter au panier'}</button>}
