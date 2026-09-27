import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {checkServerIdentity} from 'node:tls';

// This public CA belongs to the salon's Railway database. No private key is shipped.
export function databaseOptions() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Database is not configured');
  const url = new URL(connectionString);
  // URL SSL options can override pg's verified TLS configuration.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(key);
  return {
    connectionString: url.toString(),
    max: 5,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 30000,
    statement_timeout: 10000,
    application_name: 'ohhzaz-website',
    ssl: {
      ca: readFileSync(join(process.cwd(), 'db/certs/railway-root.crt'), 'utf8'),
      rejectUnauthorized: true,
      checkServerIdentity: (_host, certificate) => checkServerIdentity('postgres.railway.internal', certificate),
    },
  };
}
