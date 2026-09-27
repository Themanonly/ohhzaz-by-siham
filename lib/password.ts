import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
export const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
export function passwordHash(password:string){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64,{N:16384,r:8,p:1}).toString('hex');}
export function passwordMatches(password:string,stored:string){const [salt,hash]=stored.split(':');if(!salt||!hash)return false;const expected=Buffer.from(hash,'hex');const actual=scryptSync(password,salt,64,{N:16384,r:8,p:1});return expected.length===actual.length&&timingSafeEqual(expected,actual);}
