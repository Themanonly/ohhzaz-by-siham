'use client';
import Link from 'next/link';
import type {ComponentProps} from 'react';

export default function HomeLink(props:ComponentProps<typeof Link>){
  return <Link {...props} scroll={false} onNavigate={()=>{
    try{sessionStorage.removeItem('ohhzaz-language-position')}catch{}
    window.scrollTo({top:0,left:0,behavior:'instant'});
  }}/>;
}
