import {Pool} from 'pg';
import {randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {databaseOptions} from '../lib/database-options.mjs';
const pool=new Pool({...databaseOptions(),max:1});
try {
 if(decodeURIComponent(new URL(process.env.DATABASE_URL).username)!=='ohhzaz_runtime.zseepsrowgidprvfddjd')throw new Error('Unexpected runtime identity');
 const secret=randomBytes(36).toString('hex');
 await pool.query(`ALTER ROLE ohhzaz_runtime PASSWORD '${secret}'`);
 const connection=new URL(process.env.DATABASE_URL);connection.password=secret;
 writeFileSync('.env.supabase',`DATABASE_URL=${connection.href}\nDATABASE_PROVIDER=supabase\n`,{mode:0o600});
 const local=readFileSync('.env.local','utf8').split(/\r?\n/).filter(line=>!/^\s*(DATABASE_URL|DATABASE_PROVIDER|DATABASE_CA_FILE)\s*=/.test(line));
 writeFileSync('.env.local',local.join('\n').replace(/\n+$/,'')+`\nDATABASE_URL=${connection.href}\nDATABASE_PROVIDER=supabase\n`,{mode:0o600});
 console.log('Runtime secret replaced privately. No credential printed.');
} catch(error){console.error('Private rotation failed:',error.code||'configuration');process.exitCode=1;}
finally{await pool.end();}
