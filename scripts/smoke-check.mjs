import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:3016';
const origin=process.env.SITE_URL||'https://ohhzaz-by-siham.netlify.app';
const routes=['','mariee','prestations','produits','le-salon','contact'];
const assets=new Set(['/brand/favicon-32.png','/brand/favicon-192.png','/brand/apple-touch-icon.png','/brand/social-sharing.jpg','/media/salon-wash-24.webp','/media/salon-colour-29.webp','/media/bridal-makeup-stock.webp','/media/bridal-details-stock.webp']);
for(const locale of ['fr','ar'])for(const route of routes){
 const path=`/${locale}${route?'/'+route:''}`;
 const res=await fetch(base+path);assert.equal(res.status,200,path);
 const html=await res.text();assert.match(html,/OHH ZAZ/,path+' wrong project');
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,path+' h1');
 assert.match(html,new RegExp(`lang="${locale}"`));
 assert.match(html,/property="og:image"/);assert.match(html,/name="twitter:card"/);assert.match(html,/rel="canonical"/);
 assert.ok(html.includes(`rel="canonical" href="${origin}${path}"`),path+' canonical origin');
 assert.ok(html.includes(`property="og:image" content="${origin}/brand/social-sharing.jpg"`),path+' sharing origin');
 assert.doesNotMatch(html,/(?:href|content)="https?:\/\/(?:localhost|127\.0\.0\.1)/,path+' local address leaked');
 assert.equal(res.headers.get('x-content-type-options'),'nosniff');
 for(const match of html.matchAll(/(?:src|poster)="(\/media\/[^"?]+)"/g))assets.add(match[1]);
 console.log('PASS',path);
}
for(const path of assets){const r=await fetch(base+path,{method:'HEAD'});assert.equal(r.status,200,path);assert.ok(Number(r.headers.get('content-length'))>0,path);}
const missing=await fetch(base+'/fr/not-a-real-page');assert.equal(missing.status,404);
const robots=await (await fetch(base+'/robots.txt')).text();if(process.env.SITE_INDEXABLE==='true'){assert.match(robots,/Allow: \//);const xml=await (await fetch(base+'/sitemap.xml')).text();assert.equal((xml.match(/<url>/g)||[]).length,12);assert.ok(xml.includes(origin+'/fr'));assert.ok(xml.includes('ar-MA'));}else assert.match(robots,/Disallow: \//);
const video=await fetch(base+'/media/salon-film.mp4',{headers:{Range:'bytes=0-1023'}});assert.equal(video.status,206);assert.equal((await video.arrayBuffer()).byteLength,1024);
console.log(`PASS ${assets.size} media URLs, real 404, preview robots and video range requests`);

const verification=await fetch(base+'/googlefce80ae6cd05ff8d.html');assert.equal(verification.status,200);assert.equal((await verification.text()).trim(),'google-site-verification: googlefce80ae6cd05ff8d.html');
const admin=await (await fetch(base+'/admin')).text();assert.match(admin,/noindex/);
const bridal=await fetch(base+'/media/bridal-film.mp4',{headers:{Range:'bytes=0-1023'}});assert.equal(bridal.status,206);assert.equal((await bridal.arrayBuffer()).byteLength,1024);
console.log('PASS verification file, admin noindex, bridal video range');
