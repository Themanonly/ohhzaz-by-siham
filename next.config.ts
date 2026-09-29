import type { NextConfig } from 'next';
import {resolveSiteConfig} from './lib/site-config.mjs';
const site = resolveSiteConfig(process.env);
const config: NextConfig = { env: {SITE_URL:site.origin,SITE_INDEXABLE:String(site.indexable)}, outputFileTracingIncludes: {'/*':['./db/certs/railway-root.crt']}, poweredByHeader: false, devIndicators: false, async headers(){return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},{key:'Strict-Transport-Security',value:'max-age=31536000'}]},{source:'/api/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'}]}]} };
export default config;
