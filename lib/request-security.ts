// Mutation origins must not be derived from a client-provided Host header.
export function trustedOrigin(origin: string | null, requestUrl: string, configured?: string) {
 if (!origin) return false;
 try {
  const request = new URL(requestUrl);
  const allowed = new URL(configured || 'https://ohhzaz.com').origin;
  if (origin === allowed) return true;
  const source=new URL(origin);
  const loopback=['127.0.0.1','localhost'];
  // Next may normalize its bound 127.0.0.1 host to localhost internally.
  return loopback.includes(request.hostname)&&loopback.includes(source.hostname)
    &&request.protocol==='http:'&&source.protocol==='http:'&&request.port===source.port;
 } catch { return false; }
}
