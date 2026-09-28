import {NextRequest,NextResponse} from 'next/server';
export function proxy(request:NextRequest){
 const nonce=Buffer.from(crypto.randomUUID()).toString('base64');
 const dev=process.env.NODE_ENV==='development';
 const policy=["default-src 'self'",`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev?" 'unsafe-eval'":''}`,"style-src 'self' 'unsafe-inline'","img-src 'self' blob: data:","media-src 'self' blob:","font-src 'self'","connect-src 'self'"+(dev?' ws:':''),"object-src 'none'","base-uri 'self'","form-action 'self'","frame-ancestors 'none'"].join('; ');
 const headers=new Headers(request.headers);
 headers.set('x-site-locale',request.nextUrl.pathname.startsWith('/ar')?'ar':'fr');
 headers.set('x-nonce',nonce);headers.set('Content-Security-Policy',policy);
 const response=NextResponse.next({request:{headers}});
 response.headers.set('Content-Security-Policy',policy);
 response.headers.set('Cache-Control','private, no-store');
 return response;
}
export const config={matcher:['/','/fr/:path*','/ar/:path*','/admin/:path*']};
