const configured = process.env.SITE_URL?.trim();
const deployment = process.env.CONTEXT === 'production' ? process.env.URL : process.env.DEPLOY_PRIME_URL;
export const siteUrl = new URL(configured || deployment || 'http://localhost:3015');
export const indexable = process.env.SITE_INDEXABLE === 'true' && !!configured && siteUrl.protocol === 'https:' && (!process.env.CONTEXT || process.env.CONTEXT === 'production');
export const routes = ['', 'mariee', 'prestations', 'produits', 'le-salon', 'contact'];
export const pathFor = (locale:string, route:string) => `/${locale}${route ? '/' + route : ''}`;
