'use client';
import Link from 'next/link';
import type {ComponentProps} from 'react';

export default function HomeLink(props:ComponentProps<typeof Link>){
  return <Link {...props} scroll={false} onNavigate={()=>{
    sessionStorage.removeItem('ohhzaz-language-position');
    window.scrollTo({top:0,left:0,behavior:'instant'});
  }}/>;
}
