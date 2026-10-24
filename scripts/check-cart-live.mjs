import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:3085';
const send=body=>fetch(base+'/api/cart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const id='bcded9d3-d9de-444f-934c-af36c543a990';
const valid=await send([{id,quantity:2,price:0}]);assert.equal(valid.status,200);const data=await valid.json();assert.equal(data.items[0].quantity,2);assert.ok(data.items[0].price>0);assert.equal(valid.headers.get('cache-control'),'no-store');
for(const body of [[],null,[{id,quantity:0}],[{id,quantity:100}],[{id,quantity:1.5}],[{id:'------------------------------------',quantity:1}],[{id,quantity:1},{id,quantity:2}],Array.from({length:21},()=>({id,quantity:1}))])assert.equal((await send(body)).status,400);
const missing=await send([{id:'00000000-0000-4000-8000-000000000099',quantity:1}]);assert.equal(missing.status,200);assert.deepEqual((await missing.json()).items,[{id:'00000000-0000-4000-8000-000000000099',quantity:1,unavailable:true}]);
console.log('PASS cart API authoritative prices, quantities, validation, missing products and no-store.');
