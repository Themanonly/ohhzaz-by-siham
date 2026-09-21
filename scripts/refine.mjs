import fs from 'node:fs';
const p='components/Salon.tsx';
let s=fs.readFileSync(p,'utf8');
s=s.replace('L’ART DE LA BEAUTÉ · BY SIHAM</span>',`{ar ? 'فنّ الجمال · سهام' : 'L’ART DE LA BEAUTÉ · BY SIHAM'}</span>`);
s=s.replace('Pour les instants qui restent.</span>',`{ar ? 'للحظات تبقى في الذاكرة.' : 'Pour les instants qui restent.'}</span>`);
fs.writeFileSync(p,s);
