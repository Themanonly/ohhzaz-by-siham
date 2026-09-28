const configured = process.env.SITE_URL?.trim();
// Public metadata must remain stable in builds, previews and server runtimes.
export const siteUrl = new URL(new URL(configured || 'https://ohhzaz.com').origin);
export const indexable = !!configured && siteUrl.protocol === 'https:' && (!process.env.CONTEXT || process.env.CONTEXT === 'production');
export const routes = ['', 'mariee', 'prestations', 'produits', 'le-salon', 'contact'];
export const pathFor = (locale:string, route:string) => `/${locale}${route ? '/' + route : ''}`;
