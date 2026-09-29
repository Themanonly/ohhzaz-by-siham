import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {categories} from '../data/services.ts';
import {contactIdentity,contactHref} from '../lib/contacts.ts';
import {validProduct,validCategory,validServices} from '../lib/catalogue-validation.ts';
assert.equal(categories.reduce((n,g)=>n+g.items.length,0),27);
for(const group of categories){assert.ok(validServices(group));for(const service of group.items){assert.ok(existsSync(`public/media/services/${service.image}-thumb.webp`));assert.ok(service.fr&&service.ar);}}
assert.deepEqual(categories.map(g=>g.items.map(s=>s.price)),[[60,200,250,300,800,800,1000,350],[70,100,30,100,200],[300,400,100,250],[40,40,40,50,50,50,70,60],[300,250]]);
const wa={id:'test',platform:'whatsapp',url:'https://wa.me/212775355346'};
const message='Bonjour Siham\n12:30 — coiffure & maquillage\nشكراً';
assert.equal(new URL(contactHref(wa,message)).searchParams.get('text'),message);
assert.equal(contactIdentity(wa),'+212775355346');
for(const url of ['javascript:alert(1)','http://wa.me/212775355346','https://wa.me.evil.test/212775355346','https://user:pass@wa.me/212775355346','https://wa.me:444/212775355346'])assert.equal(contactIdentity({...wa,url}),null);
assert.equal(contactIdentity({id:'x',platform:'tiktok',url:'https://www.tiktok.com/@sihamelhallaoui'}),'@sihamelhallaoui');
assert.equal(validCategory({id:'x',name:{fr:'Test'}}),false);
assert.equal(validProduct({id:'x',name:{fr:'x',ar:'x'},category_id:'a',price:-1,image:'https://example.com/a.jpg',status:'published'}),false);
assert.equal(validServices({...categories[0],items:[{fr:'x',ar:'x',price:20,image:'../../secret'}]}),false);
console.log('PASS 27 authoritative prices, all service thumbnails, contact safety, exact WhatsApp encoding, catalogue validation');

for(const invalid of [{minutes:-1},{alternative:'free'},{price:Infinity},{fr:'x'.repeat(161)}])assert.equal(validServices({...categories[0],items:[{...categories[0].items[0],...invalid}]}),false);
