import {Pool} from 'pg';
const globalDb=globalThis as unknown as {ohhPool?:Pool};
export const databaseReady=()=>Boolean(process.env.DATABASE_URL);
export function database(){
 if(!databaseReady())throw new Error('Database is not configured');
 return globalDb.ohhPool??=new Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:8000,idleTimeoutMillis:30000});
}
