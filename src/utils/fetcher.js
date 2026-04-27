import fetch from 'node-fetch';
import { log } from './logger.js';

const TIMEOUT_MS = 15000;
const MAX_CHARS  = 40000; // keep context manageable

/**
 * Fetch a URL and return its text content, stripped of heavy HTML noise.
 */
export async function fetchUrl(url) {
  log('info', `Fetching: ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; recipe-bot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,*/*',
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);

    const html = await res.text();

    // Strip scripts, styles, nav boilerplate — keep body text
    const clean = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return clean.length > MAX_CHARS ? clean.slice(0, MAX_CHARS) + '\n[CONTENT TRUNCATED]' : clean;
  } finally {
    clearTimeout(timeout);
  }
}
