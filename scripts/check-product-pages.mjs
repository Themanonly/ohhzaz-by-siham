import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const base=process.argv[2]||'http://127.0.0.1:3084';
const catalogue=await fetch(base+'/fr/produits');assert.equal(catalogue.status,200);
const doc=new JSDOM(await catalogue.text()).window.document;
const paths=[...doc.querySelectorAll('a.catalogue-card')].map(a=>a.getAttribute('href')).filter(p=>/^\/fr\/produits\//.test(p));
assert.ok(paths.length,'Published product links exist');
const sitemap=await (await fetch(base+'/sitemap.xml')).text();
for(const path of paths){
 for(const locale of ['fr','ar']){
  const local=path.replace('/fr/','/'+locale+'/');
  const response=await fetch(base+local+'?utm_source=meta&fbclid=test',{headers:{'user-agent':'facebookexternalhit/1.1'}});assert.equal(response.status,200);
  const page=new JSDOM(await response.text()).window.document;
  assert.ok(page.querySelector('h1')?.textContent);
  assert.equal(page.querySelector('link[rel=canonical]')?.getAttribute('href'),'https://ohhzaz.com'+local);
  assert.ok(page.querySelector('meta[property="og:image"]')?.content.includes('/api/media/'));
  const json=JSON.parse(page.querySelector('script[type="application/ld+json"]')?.textContent||'{}');assert.equal(json['@type'],'Product');
  assert.equal(json.url,'https://ohhzaz.com'+local);assert.ok(sitemap.includes('https://ohhzaz.com'+local));
  assert.ok(page.querySelector('.pdp-purchase a')?.href.includes(encodeURIComponent(local)));
 }
}
for(const bad of ['/fr/produits/not-a-product','/fr/produits/00000000-0000-4000-8000-000000000099','/en/produits/'+paths[0].split('/').at(-1)])assert.equal((await fetch(base+bad,{headers:{'user-agent':'facebookexternalhit/1.1'}})).status,404);
console.log(`PASS ${paths.length} product pages in French/Arabic, ad tracking, unique metadata, WhatsApp links, sitemap and missing-product 404s.`);
