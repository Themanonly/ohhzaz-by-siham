import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const source='C:/Users/naouf/OneDrive/Desktop/WEBSITES IMAGES/OHHZAZ BY SIHAM';
const names=JSON.parse(await fs.readFile('work/refresh/index.json','utf8'));
const additions=[];
for(const [index,name] of [[114,'bridal-updo'],[102,'bridal-occasion'],[1,'bridal-waves']]){
const file=path.join(source,names[index]);const meta=await sharp(file).metadata();
await sharp(file).rotate().resize({width:1000,withoutEnlargement:true}).webp({quality:90}).toFile(`public/media/${name}.webp`);
additions.push({name,source:names[index],width:meta.width,height:meta.height,usage:'local-preview',publicationConsent:'pending'});
}
await sharp('work/refresh/interior-12.png').webp({quality:96}).toFile('public/media/salon-interior-12.webp');
additions.push({name:'salon-interior-12',source:'owner salon video at 00:12',width:1280,height:720,usage:'local-preview'});
const manifest=JSON.parse(await fs.readFile('docs/media-manifest.json','utf8'));
await fs.writeFile('docs/media-manifest.json',JSON.stringify([...manifest,...additions],null,2));
console.log(additions);
