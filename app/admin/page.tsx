import type {Metadata} from 'next';
import AdminPanel from '../../components/AdminPanel';
export const metadata:Metadata={title:'Administration — OHH ZAZ',robots:{index:false,follow:false}};
export default function Page(){return <AdminPanel/>}
