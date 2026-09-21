import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const source='C:/Users/naouf/OneDrive/Desktop/WEBSITES IMAGES/OHHZAZ BY SIHAM';
const assets={texture:'BACKGROUND','texture-mobile':'MOBILE BACKGROUND',bridal:'ohh_zaz_1703590747_3266278382856800649_44080976396.jpg',hair:'ohh_zaz_1672671843_3006911818542759018_44080976396.webp',nails:'ohh_zaz_1673696529_3015507509422632347_44080976396.webp',makeup:'ohh_zaz_1672405105_3004674261142565640_44080976396.webp','hair-detail':'ohh_zaz_1684532125_3106403078005634521_44080976396.jpg','nails-detail':'ohh_zaz_1672913975_3008942973639103879_44080976396.webp',occasion:'ohh_zaz_1672404271_3004667264691332198_44080976396.webp'};
await mkdir('public/media',{recursive:true});
const manifest=[];
for(const [name,file] of Object.entries(assets)){const input=path.join(source,file);await sharp(input).rotate().resize({width:name.includes('texture')?1672:1000,withoutEnlargement:true}).webp({quality:85}).toFile(`public/media/${name}.webp`);manifest.push({name,source:file,publicationConsent:'pending',usage:'local-preview'});}
await writeFile('docs/media-manifest.json',JSON.stringify(manifest,null,2));
console.log('Prepared '+manifest.length+' local derivatives. Original assets unchanged.');
