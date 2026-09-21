'use client';
import {useEffect,useRef,type ReactNode} from 'react';

export default function Reveal({children,className='',delay=0}:{children:ReactNode;className?:string;delay?:number}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=ref.current;if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const observer=new IntersectionObserver(([entry])=>{
   if(!entry.isIntersecting)return;
   el.animate([{opacity:.35,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay,easing:'cubic-bezier(.2,.65,.2,1)',fill:'backwards'});
   observer.disconnect();
  },{threshold:.12});observer.observe(el);return()=>observer.disconnect();
 },[delay]);
 return <div ref={ref} className={className}>{children}</div>;
}
