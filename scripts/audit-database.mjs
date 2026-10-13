import {Pool} from 'pg';
import {databaseOptions} from '../lib/database-options.mjs';
const db=new Pool({...databaseOptions(),max:1});
try{
 const tables=(await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows;
 for(const {tablename} of tables){
  if(!/^[a-z_]+$/.test(tablename))throw new Error('Unexpected table name');
  const {rows}=await db.query(`SELECT count(*)::int AS rows FROM "${tablename}"`);
  console.log(JSON.stringify({table:tablename,rows:rows[0].rows}));
 }
 const connection=await db.connect();
 try{console.log(JSON.stringify({verifiedClientTls:connection.connection.stream.encrypted===true&&connection.connection.stream.authorized===true}));}
 finally{connection.release();}
}catch(error){console.error('Database audit failed:',error.code||'connection');process.exitCode=1;}finally{await db.end();}
