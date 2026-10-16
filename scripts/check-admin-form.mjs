import assert from 'node:assert/strict';
import {mkdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import {productFormErrors,photoError,MAX_PHOTO_BYTES} from '../lib/product-form.ts';
import {backend,AdminApiError} from '../lib/admin-api.ts';

const valid={name:'Produit',nameAr:'',price:'299,90',category:'category',description:'',descriptionAr:'',photo:null,existingImage:'/api/media/example'};
assert.deepEqual(productFormErrors(valid,['category']),{});
for(const price of ['','-1','1.001','Infinity','1e4','99999999.99'])assert.ok(productFormErrors({...valid,price},['category']).price);
assert.ok(productFormErrors({...valid,existingImage:undefined},['category']).photo);
assert.ok(productFormErrors(valid,[]).category);
assert.ok(photoError({type:'image/heic',size:100}));
assert.ok(photoError({type:'image/jpeg',size:MAX_PHOTO_BYTES+1}));

// This suite uses a DOM simulation and mocked transport, never production accounts or data.
const dom=new JSDOM('<div id="root"></div>',{url:'https://ohhzaz.com/admin'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
Object.defineProperty(globalThis,'navigator',{configurable:true,value:dom.window.navigator});
window.scrollTo=()=>{};
const originalObjectURL=URL.createObjectURL,originalRevokeURL=URL.revokeObjectURL;
URL.createObjectURL=()=> 'blob:private-test-photo';URL.revokeObjectURL=()=>{};
const originalFetch=globalThis.fetch;
let records=[],calls=[],rejectCreate=false,failRefresh=false,afterSave=false,uploadFail=false;
globalThis.fetch=async(url,options={})=>{
 const path=String(url);const method=options.method||'GET';calls.push({path,method,body:options.body});
 if(path.endsWith('/auth/session'))return Response.json({role:'admin'});
 if(path.endsWith('/uploads'))return uploadFail?Response.json({error:'Failed'},{status:500}):Response.json({url:'/api/media/test-photo'});
 if(path.includes('/data/products')){
  if(method==='POST'||method==='PATCH'){
   if(rejectCreate)return Response.json({error:'Rejected'},{status:400});
   const p={...JSON.parse(options.body),id:'new-product'};records=[p];afterSave=true;return Response.json([p]);
  }
  if(afterSave&&failRefresh)throw new TypeError('Network failure');
  return Response.json(records);
 }
 if(path.includes('/data/product_categories'))return Response.json([{id:'category',name:{fr:'Soins',ar:'عناية'}}]);
 return Response.json([]);
};
const dir=resolve('work/admin-form-test');await mkdir(dir,{recursive:true});
try{
 // Bundle the real component. Only navigation and image encoding are replaced;
 // field validation, events, save requests, errors and reconciliation remain real.
 await build({entryPoints:['components/AdminPanel.tsx'],outfile:resolve(dir,'panel.mjs'),bundle:true,format:'esm',platform:'node',packages:'external',plugins:[{
  name:'dom-test-adapters',setup(b){
   b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'test'}));
   b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:"import React from 'react';export default function Link({children,...p}){return React.createElement('a',p,children)}",loader:'js',resolveDir:process.cwd()}));
   b.onLoad({filter:/product-form\.ts$/},async args=>{const {readFile}=await import('node:fs/promises');let s=await readFile(args.path,'utf8');s=s.slice(0,s.indexOf('export async function prepareProductPhoto'))+"export async function prepareProductPhoto(file:File){return new Blob(['photo'],{type:'image/webp'});}";return {contents:s,loader:'ts'};});
  }
 }]});
 const {default:React,act}=await import('react');const {createRoot}=await import('react-dom/client');
 const {default:AdminPanel}=await import(pathToFileURL(resolve(dir,'panel.mjs')));
 const root=createRoot(document.getElementById('root'));
 await act(async()=>{root.render(React.createElement(AdminPanel,{backendReady:true}));});
 const form=()=>document.querySelector('.admin-product-form');
 const submit=()=>act(async()=>{form().dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));});
 const setValue=async(field,value)=>act(async()=>{const input=document.querySelector(`[data-product-field="${field}"]`);Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new window.Event('input',{bubbles:true}));});
 const selectPhoto=async()=>act(async()=>{const input=document.querySelector('[data-product-field="photo"]');Object.defineProperty(input,'files',{configurable:true,value:[new window.File(['image'],'photo.png',{type:'image/png'})]});input.dispatchEvent(new window.Event('change',{bubbles:true}));});
 assert.ok(form());assert.equal(form().noValidate,true);
 await submit();assert.match(document.querySelector('.admin-product-feedback').textContent,/Corrigez/);assert.equal(calls.filter(c=>c.method==='POST').length,0);assert.equal(document.activeElement.dataset.productField,'photo');
 await selectPhoto();await setValue('name','Produit test');await setValue('price','299,90');
 uploadFail=true;await submit();assert.equal(document.querySelector('[data-product-field="name"]').value,'Produit test');assert.equal(document.querySelector('.admin-product-feedback').getAttribute('role'),'alert');assert.equal(records.length,0);
 uploadFail=false;rejectCreate=true;await submit();assert.equal(document.querySelector('[data-product-field="price"]').value,'299,90');assert.match(document.querySelector('.admin-product-feedback').textContent,/refusés/);
 const uploadCount=calls.filter(c=>c.path.endsWith('/uploads')).length;
 rejectCreate=false;failRefresh=true;await submit();
 assert.equal(calls.filter(c=>c.path.endsWith('/uploads')).length,uploadCount,'Retry must reuse a successfully uploaded photo');
 assert.equal(records[0].price,299.90);assert.equal(records[0].status,'draft');
 assert.equal(document.querySelector('[data-product-field="name"]').value,'');
 assert.match(document.querySelector('.admin-product-feedback').textContent,/Brouillon enregistré/);
 assert.match(document.querySelector('.admin-list').textContent,/Produit test/);
 await act(async()=>{document.querySelector('.admin-row button').click();});
 await act(async()=>{document.querySelector('.admin-product-fields input[type=checkbox]').click();});
 const before=calls.filter(c=>c.method==='PATCH').length;
 await act(async()=>{for(let i=0;i<2;i++)form().dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));});
 assert.equal(calls.filter(c=>c.method==='PATCH').length,before+1,'Repeated clicks must not send duplicate mutations');
 assert.equal(records[0].status,'published');assert.match(document.querySelector('.admin-product-feedback').textContent,/visible sur le site/);
 assert.equal(document.querySelector('.admin-product-fields').disabled,false);
 // Reopening the component reads persisted records instead of losing them.
 failRefresh=false;await act(async()=>{root.unmount();});
 const reloaded=createRoot(document.getElementById('root'));await act(async()=>{reloaded.render(React.createElement(AdminPanel,{backendReady:true}));});
 assert.match(document.querySelector('.admin-list').textContent,/Produit test/);
 await act(async()=>{reloaded.unmount();});
 // Old mobile browsers without AbortSignal.timeout must still send requests.
 const timeout=AbortSignal.timeout;AbortSignal.timeout=undefined;
 try{assert.equal((await backend('/auth/session',null)).role,'admin');}finally{AbortSignal.timeout=timeout;}
 globalThis.fetch=async()=>new Response('',{status:413});await assert.rejects(backend('/uploads',null),e=>e instanceof AdminApiError&&/volumineuse/.test(e.message));
 console.log('PASS: real admin form events, visible validation, decimal comma prices, upload/save failures preserve input, upload retry reuse, confirmed save survives refresh failure, persisted reload, older browser transport and oversized upload feedback.');
}finally{globalThis.fetch=originalFetch;URL.createObjectURL=originalObjectURL;URL.revokeObjectURL=originalRevokeURL;dom.window.close();await rm(dir,{recursive:true,force:true});}
