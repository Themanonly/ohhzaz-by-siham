import assert from 'node:assert/strict';
import sharp from 'sharp';
const base=process.argv[2]||'http://127.0.0.1:3080';
const html=await (await fetch(base+'/fr/produits')).text();
const ids=[...new Set([...html.matchAll(/\/api\/media\/([0-9a-f-]{36})/g)].map(m=>m[1]))];
assert(ids.length,'No published image found');
for(const id of ids){
 const response=await fetch(base+'/api/media/'+id+'?w=320');assert.equal(response.status,200);
 const bytes=Buffer.from(await response.arrayBuffer());const info=await sharp(bytes).metadata();
 assert(info.width<=320);assert.equal(info.format,'webp');
 const again=await fetch(base+'/api/media/'+id+'?w=320',{headers:{'If-None-Match':response.headers.get('etag')}});
 assert.equal(again.status,304);assert.match(again.headers.get('cache-control'),/private/);
 assert.equal((await fetch(base+'/api/media/'+id+'?w=50000')).status,400);
}
console.log('PASS published responsive media, bounded dimensions, conditional requests, private browser caching and invalid-width rejection.');
