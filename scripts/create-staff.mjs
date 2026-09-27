import {randomUUID} from 'node:crypto';
import {Pool} from 'pg';
import {databaseOptions} from '../lib/database-options.mjs';
import {passwordHash} from '../lib/password.ts';
const {DATABASE_URL,STAFF_EMAIL,STAFF_PASSWORD,STAFF_ROLE}=process.env;
if(!DATABASE_URL||!STAFF_EMAIL||!STAFF_PASSWORD||STAFF_PASSWORD.length<14||!['admin','manager'].includes(STAFF_ROLE))throw new Error('Set DATABASE_URL, STAFF_EMAIL, STAFF_PASSWORD (14+ characters), STAFF_ROLE securely.');
const db=new Pool({...databaseOptions(),max:1});
try{await db.query('INSERT INTO salon_staff(id,email,password_hash,role) VALUES($1,$2,$3,$4)',[randomUUID(),STAFF_EMAIL.trim().toLowerCase(),passwordHash(STAFF_PASSWORD),STAFF_ROLE]);console.log('Staff account created. No credentials printed.');}finally{await db.end();}
