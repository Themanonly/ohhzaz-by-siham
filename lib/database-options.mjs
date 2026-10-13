import {readFileSync} from 'node:fs';
import {join} from 'node:path';

// Supabase only. This public CA is not a private key; credentials stay server-only.
export function databaseOptions(env = process.env) {
  const connectionString = env.DATABASE_URL;
  if (!connectionString) throw new Error('Database is not configured');
  const url = new URL(connectionString);
  // URL SSL options can override pg's verified TLS configuration.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(key);
  const supabase = url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.supabase.com');
  if (!supabase) throw new Error('Expected a Supabase database endpoint');
  const ca = readFileSync(join(process.cwd(), 'db/certs/supabase-root.crt'), 'utf8');
  return {
    connectionString: url.toString(),
    max: 3,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 30000,
    statement_timeout: 10000,
    application_name: 'ohhzaz-website',
    ssl: {rejectUnauthorized:true,ca},
  };
}
