// These non-secret values are resolved once in next.config.ts and embedded in
// the build so static sitemaps and server-rendered metadata cannot disagree.
export const siteUrl = new URL(process.env.SITE_URL || 'https://ohhzaz.com');
export const indexable = process.env.SITE_INDEXABLE === 'true';
export const routes = ['', 'mariee', 'prestations', 'produits', 'le-salon', 'contact', 'mentions-legales'];
export const pathFor = (locale:string, route:string) => `/${locale}${route ? '/' + route : ''}`;
