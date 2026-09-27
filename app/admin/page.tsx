import type {Metadata} from 'next';
import {databaseReady} from '../../lib/db';
import AdminPanel from '../../components/AdminPanel';
export const metadata:Metadata={title:'Administration — OHH ZAZ',robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default function Page(){return <AdminPanel backendReady={databaseReady()}/>}
