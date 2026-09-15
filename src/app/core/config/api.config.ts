import { environment } from '../../../environments/environment';

/**
 * Base API URL — reads from environment file.
 * Dev: '' (proxied to localhost:8082 via proxy.conf.json)
 * Prod: full Railway URL set in environment.prod.ts
 */
export const API_BASE = environment.apiBase;
