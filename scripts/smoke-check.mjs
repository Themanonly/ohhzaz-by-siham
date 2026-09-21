import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:3016';
const routes=['','mariee','prestations','produits','le-salon','contact'];
const assets=new Set(['/brand/favicon-32.png','/brand/favicon-192.png','/brand/apple-touch-icon.png','/brand/social-sharing.jpg','/media/salon-wash-24.webp','/media/salon-colour-29.webp','/media/bridal-makeup-stock.webp','/media/bridal-details-stock.webp']);
for(const locale of ['fr','ar'])for(const route of routes){
 const path=`/${locale}${route?'/'+route:''}`;
 const res=await fetch(base+path);assert.equal(res.status,200,path);
 const html=await res.text();assert.match(html,/OHH ZAZ/,path+' wrong project');
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,path+' h1');
 assert.match(html,new RegExp(`lang="${locale}"`));
 assert.match(html,/property="og:image"/);assert.match(html,/name="twitter:card"/);assert.match(html,/rel="canonical"/);
 assert.equal(res.headers.get('x-content-type-options'),'nosniff');
 for(const match of html.matchAll(/(?:src|poster)="(\/media\/[^"?]+)"/g))assets.add(match[1]);
 console.log('PASS',path);
}
for(const path of assets){const r=await fetch(base+path,{method:'HEAD'});assert.equal(r.status,200,path);assert.ok(Number(r.headers.get('content-length'))>0,path);}
const missing=await fetch(base+'/fr/not-a-real-page');assert.equal(missing.status,404);
const robots=await (await fetch(base+'/robots.txt')).text();assert.match(robots,/Disallow: \//);
const video=await fetch(base+'/media/salon-film.mp4',{headers:{Range:'bytes=0-1023'}});assert.equal(video.status,206);assert.equal((await video.arrayBuffer()).byteLength,1024);
console.log(`PASS ${assets.size} media URLs, real 404, preview robots and video range requests`);
