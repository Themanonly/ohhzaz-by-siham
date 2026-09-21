import fs from 'node:fs/promises';
const png=await fs.readFile('public/brand/favicon-32.png');
const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header[6]=32;header[7]=32;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
await fs.writeFile('public/favicon.ico',Buffer.concat([header,png]));
