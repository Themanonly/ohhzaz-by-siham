import {Pool} from 'pg';
import {databaseOptions} from './database-options.mjs';
const globalDb=globalThis as unknown as {ohhPool?:Pool};
export const databaseReady=()=>Boolean(process.env.DATABASE_URL);
export function database(){
 if(!databaseReady())throw new Error('Database is not configured');
 return globalDb.ohhPool??=new Pool(databaseOptions());
}
