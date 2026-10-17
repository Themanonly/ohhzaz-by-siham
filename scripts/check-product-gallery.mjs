import assert from 'node:assert/strict';
import {mkdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<div id="root"></div>',{url:'https://ohhzaz.com/fr/produits'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
Object.defineProperty(globalThis,'navigator',{configurable:true,value:dom.window.navigator});
dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true};
dom.window.HTMLDialogElement.prototype.close=function(){this.open=false};
const dir=resolve('work/gallery-ui-test');await mkdir(dir,{recursive:true});
try{
 await build({entryPoints:['components/Products.tsx'],outfile:resolve(dir,'gallery.mjs'),bundle:true,format:'esm',platform:'node',packages:'external',plugins:[{name:'adapters',setup(b){
 b.onResolve({filter:/^(next\/link|\.\/ContactAction)$/},a=>({path:a.path,namespace:'test'}));
 b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:"import React from 'react';export default function Link({children,locale,platform,message,...p}){return React.createElement('a',p,children)}",loader:'js',resolveDir:process.cwd()}));
 }}]});
 const {default:React,act}=await import('react');const {createRoot}=await import('react-dom/client');
 const {default:Products}=await import(pathToFileURL(resolve(dir,'gallery.mjs')));
 const root=createRoot(document.getElementById('root'));
 const images=['/api/media/00000000-0000-4000-8000-000000000001','/api/media/00000000-0000-4000-8000-000000000002'];
 const product={id:'test',category_id:'cosmetiques',name:{fr:'Produit',ar:'منتج'},price:99,status:'published',image:images[0],images};
 for(const locale of ['fr','ar']){
  await act(async()=>{root.render(React.createElement(Products,{locale,items:[product]}));});
  await act(async()=>{document.querySelector('.catalogue-card').click();});
  assert.equal(document.querySelectorAll('.product-gallery-picker button').length,2);
  await act(async()=>{document.querySelectorAll('.product-gallery-picker button')[1].click();});
  assert.equal(document.querySelector('.product-gallery-stage img').getAttribute('src'),images[1]);
  assert.equal(document.querySelectorAll('.product-gallery-picker button')[1].getAttribute('aria-pressed'),'true');
  await act(async()=>{document.querySelector('.product-image-zoom').click();});
  assert.equal(document.querySelector('.product-gallery-stage img').getAttribute('src'),images[1]);
  await act(async()=>{document.querySelector('.dialog-close').click();});
  await act(async()=>{document.querySelector('.catalogue-card').click();});
  assert.equal(document.querySelector('.product-gallery-stage img').getAttribute('src'),images[0]);
  await act(async()=>{document.querySelector('.dialog-close').click();});
 }
 await act(async()=>{root.unmount();});
 console.log('PASS: French and Arabic gallery thumbnails, photo selection, selected state, zoom and reset on reopen.');
}finally{dom.window.close();await rm(dir,{recursive:true,force:true});}
