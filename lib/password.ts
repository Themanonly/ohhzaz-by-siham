import {randomBytes,scryptSync,scrypt,timingSafeEqual,createHash} from 'node:crypto';
export const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
const current={N:32768,r:8,p:3,maxmem:64*1024*1024};
const prefix='scrypt-v2:';
export function passwordHash(password:string){const salt=randomBytes(16).toString('hex');return prefix+salt+':'+scryptSync(password,salt,64,current).toString('hex');}
export async function upgradedPasswordHash(password:string){const salt=randomBytes(16).toString('hex');const key=await new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,current,(error,key)=>error?reject(error):resolve(key)));return prefix+salt+':'+key.toString('hex');}
export const needsPasswordUpgrade=(stored:string)=>!stored.startsWith(prefix);
export async function passwordMatches(password:string,stored:string){
 const modern=stored.startsWith(prefix);
 const [salt,hash]=(modern?stored.slice(prefix.length):stored).split(':');
 if(!/^[a-f0-9]{32}$/.test(salt||'')||!/^[a-f0-9]{128}$/.test(hash||''))return false;
 const expected=Buffer.from(hash,'hex');
 const actual=await new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,modern?current:{N:16384,r:8,p:1},(error,key)=>error?reject(error):resolve(key)));
 return timingSafeEqual(expected,actual);
}
