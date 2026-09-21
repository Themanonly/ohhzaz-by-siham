import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const source='C:/Users/naouf/OneDrive/Desktop/WEBSITES IMAGES/OHHZAZ BY SIHAM';
const names=(await fs.readdir(source)).filter(n=>/\.(jpe?g|webp)$/i.test(n)).sort();
await fs.mkdir('work/refresh',{recursive:true});
await fs.writeFile('work/refresh/index.json',JSON.stringify(names,null,2));
for(let start=0;start<names.length;start+=30){
 const cells=[];
 for(let i=start;i<Math.min(start+30,names.length);i++){
  const thumb=await sharp(path.join(source,names[i])).rotate().resize(190,190,{fit:'inside'}).extend({top:0,bottom:0,left:0,right:0}).toBuffer();
  const m=await sharp(thumb).metadata();const col=(i-start)%6,row=Math.floor((i-start)/6);
  cells.push({input:thumb,left:col*200+Math.floor((200-m.width)/2),top:row*220});
  cells.push({input:Buffer.from(`<svg width="200" height="25"><rect width="200" height="25" fill="#eee6da"/><text x="10" y="18" font-size="15">${i}</text></svg>`),left:col*200,top:row*220+190});
 }
 await sharp({create:{width:1200,height:1100,channels:3,background:'#eee6da'}}).composite(cells).jpeg({quality:85}).toFile(`work/refresh/sheet-${start/30}.jpg`);
}
console.log(`Inspected inventory: ${names.length} images`);
