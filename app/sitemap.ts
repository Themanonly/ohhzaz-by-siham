import type {MetadataRoute} from 'next';
import {indexable,siteUrl,routes,pathFor} from '../lib/site';
export default function sitemap():MetadataRoute.Sitemap {if(!indexable)return [];return routes.flatMap(route=>['fr','ar'].map(locale=>({url:new URL(pathFor(locale,route),siteUrl).href,alternates:{languages:{fr:new URL(pathFor('fr',route),siteUrl).href,ar:new URL(pathFor('ar',route),siteUrl).href,'x-default':new URL(pathFor('fr',route),siteUrl).href}}})))}
