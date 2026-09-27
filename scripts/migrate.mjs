import {readFileSync} from 'node:fs';
import {Pool} from 'pg';
import {productCategories,socialLinks} from '../data/catalogue.ts';
import {categories} from '../data/services.ts';
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL securely before migration');
const db=new Pool({connectionString:process.env.DATABASE_URL,max:1});
try{await db.query(readFileSync('db/schema.sql','utf8'));for(const c of productCategories)await db.query('INSERT INTO product_categories(id,name) VALUES($1,$2) ON CONFLICT DO NOTHING',[c.id,JSON.stringify(c.name)]);for(const c of socialLinks)await db.query('INSERT INTO social_links(id,platform,url) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[c.id,c.platform,c.url]);for(const g of categories)await db.query('INSERT INTO service_groups(id,fr,ar,items) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[g.id,g.fr,g.ar,JSON.stringify(g.items)]);console.log('Schema and initial salon content ready. Existing records preserved.');}finally{await db.end();}
