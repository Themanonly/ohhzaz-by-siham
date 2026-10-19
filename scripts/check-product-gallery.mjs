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
 await build({entryPoints:['components/ProductDetail.tsx'],outfile:resolve(dir,'gallery.mjs'),bundle:true,format:'esm',platform:'node',packages:'external',plugins:[{name:'adapters',setup(b){
 b.onResolve({filter:/^(next\/link|\.\/ContactAction)$/},a=>({path:a.path,namespace:'test'}));
 b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:"import React from 'react';export default function Link({children,locale,platform,message,...p}){return React.createElement('a',p,children)}",loader:'js',resolveDir:process.cwd()}));
 }}]});
 const {default:React,act}=await import('react');const {createRoot}=await import('react-dom/client');
 const {default:Products}=await import(pathToFileURL(resolve(dir,'gallery.mjs')));
 const root=createRoot(document.getElementById('root'));
 const images=['/api/media/00000000-0000-4000-8000-000000000001','/api/media/00000000-0000-4000-8000-000000000002'];
 const product={id:'test',category_id:'cosmetiques',name:{fr:'Produit',ar:'منتج'},price:99,status:'published',image:images[0],images};
 for(const locale of ['fr','ar']){
  await act(async()=>{root.render(React.createElement(Products,{key:locale,locale,product,categories:[]}));});
  assert.equal(document.querySelectorAll('.pdp-thumbnails button').length,2);
  await act(async()=>{document.querySelectorAll('.pdp-thumbnails button')[1].click();});
  assert.equal(document.querySelector('.pdp-stage img').getAttribute('src'),images[1]);
  assert.equal(document.querySelectorAll('.pdp-thumbnails button')[1].getAttribute('aria-pressed'),'true');
  await act(async()=>{document.querySelector('.pdp-gallery').dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:locale==='ar'?'ArrowLeft':'ArrowRight',bubbles:true}));});
  assert.equal(document.querySelector('.pdp-stage img').getAttribute('src'),images[0]);
  const swipeEvent=(type,x)=>{const e=new dom.window.Event(type,{bubbles:true});Object.defineProperty(e,type==='touchstart'?'touches':'changedTouches',{value:[{clientX:x,clientY:100}]});document.querySelector('.pdp-stage').dispatchEvent(e)};
  await act(async()=>{swipeEvent('touchstart',200);swipeEvent('touchend',locale==='ar'?280:100)});
  assert.equal(document.querySelector('.pdp-stage img').getAttribute('src'),images[1]);
  await act(async()=>{document.querySelector('.pdp-open-image').click();});
  assert.equal(document.querySelector('.pdp-lightbox-photo img').getAttribute('src'),images[1]);
  assert.equal(document.body.style.overflow,'hidden');
  await act(async()=>{document.querySelector('.pdp-magnify').click();});
  assert.ok(document.querySelector('.pdp-lightbox-photo.is-magnified'));
  await act(async()=>{document.querySelector('.pdp-magnify').click();});
  assert.equal(document.querySelector('.pdp-lightbox-photo.is-magnified'),null);
  await act(async()=>{document.querySelector('.pdp-lightbox-close').click();});
  assert.equal(document.body.style.overflow,'');
  assert.equal(document.querySelector('.pdp-stage img').getAttribute('src'),images[1]);
  await act(async()=>{document.querySelector('.pdp-photo-controls button').click();});
  assert.equal(document.querySelector('.pdp-stage img').getAttribute('src'),images[0]);
 }
 await act(async()=>{root.unmount();});
 console.log('PASS: French and Arabic thumbnails, keyboard, swipe, arrows, fullscreen image and scroll restoration.');
}finally{dom.window.close();await rm(dir,{recursive:true,force:true});}
