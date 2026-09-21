import {NextRequest,NextResponse} from 'next/server';
export function proxy(request:NextRequest){const headers=new Headers(request.headers);headers.set('x-site-locale',request.nextUrl.pathname.startsWith('/ar')?'ar':'fr');return NextResponse.next({request:{headers}})}
export const config={matcher:['/','/fr/:path*','/ar/:path*']};
