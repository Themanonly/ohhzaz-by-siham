import {getCatalogue} from '../lib/catalogue-server';
export const revalidate=60;
import type {MetadataRoute} from 'next';
import {indexable,siteUrl,routes,pathFor} from '../lib/site';
export default async function sitemap():Promise<MetadataRoute.Sitemap> {if(!indexable)return [];const {items}=await getCatalogue();const paths=[...routes,...items.filter(p=>p.status==='published').map(p=>`produits/${p.id}`)];return paths.flatMap(route=>['fr','ar'].map(locale=>({url:new URL(pathFor(locale,route),siteUrl).href,alternates:{languages:{'fr-MA':new URL(pathFor('fr',route),siteUrl).href,'ar-MA':new URL(pathFor('ar',route),siteUrl).href,'x-default':new URL(pathFor('fr',route),siteUrl).href}}})))}
