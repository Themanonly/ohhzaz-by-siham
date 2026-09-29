// Public build settings only. Never pass database or authentication secrets here.
export function resolveSiteConfig(env) {
  const url = new URL(env.SITE_URL?.trim() || 'https://ohhzaz.com');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('SITE_URL must be an HTTP(S) origin without credentials');
  }
  const context = env.CONTEXT?.trim();
  const enabled = env.SITE_INDEXABLE === 'true';
  return {
    origin: url.origin,
    indexable: enabled && url.protocol === 'https:' && (!context || context === 'production'),
  };
}
