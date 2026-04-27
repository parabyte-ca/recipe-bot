import 'dotenv/config';
import chokidar from 'chokidar';
import cron from 'node-cron';
import path from 'path';
import fs from 'fs/promises';
import { processFile } from './agents/processor.js';
import { crawlUrlList } from './agents/crawler.js';
import { startTelegramBot } from './agents/telegram-bot.js';
import { log } from './utils/logger.js';
import { notify } from './utils/telegram.js';

const INPUT_DIR  = process.env.INPUT_DIR  || '/data/input';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/data/output';
const URL_LIST   = process.env.URL_LIST   || '/data/input/urls.txt';
const CRAWL_CRON = process.env.CRAWL_CRON || '0 8 * * *';

const SUPPORTED_EXT = new Set(['.txt', '.pdf', '.jpg', '.jpeg', '.png', '.webp', '.md']);

async function ensureDirs() {
  await fs.mkdir(INPUT_DIR,  { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(path.join(INPUT_DIR, 'processed'), { recursive: true });
}

function startWatcher() {
  log('info', `Watching ${INPUT_DIR} for new files...`);
  const watcher = chokidar.watch(INPUT_DIR, {
    ignored: [/(^|[/\\])\.\./, '**/urls.txt', '**/crawl-sources.txt', '**/processed/**'],
    persistent: true,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 500 },
  });

  watcher.on('add', async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_EXT.has(ext)) return;
    log('info', `New file: ${filePath}`);
    try {
      const result = await processFile(filePath, OUTPUT_DIR);
      await notify(
        `✅ *Draft ready:* ${result.title}\n` +
        `⚠️ ${result.verifyCount} items need verification\n` +
        `📝 WP draft: ${process.env.WP_URL}/wp-admin`
      );
      const doneDir = path.join(INPUT_DIR, 'processed');
      await fs.rename(filePath, path.join(doneDir, path.basename(filePath)));
    } catch (err) {
      log('error', `Failed: ${filePath}: ${err.message}`);
      await notify(`❌ recipe-bot error (file): ${path.basename(filePath)}\n${err.message}`);
    }
  });

  watcher.on('error', (err) => log('error', `Watcher error: ${err}`));
}

async function runCrawl() {
  log('info', 'Starting scheduled URL crawl...');
  let urls = [];
  try {
    const raw = await fs.readFile(URL_LIST, 'utf8');
    urls = raw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  } catch {
    log('warn', `No urls.txt at ${URL_LIST} — skipping`);
    return;
  }
  if (urls.length === 0) return;
  log('info', `Crawling ${urls.length} URL(s)...`);
  for (const url of urls) {
    try {
      const result = await crawlUrlList(url, OUTPUT_DIR);
      await notify(
        `✅ *Crawl draft:* ${result.title}\n` +
        `⚠️ ${result.verifyCount} items need verification\n` +
        `📝 WP draft: ${process.env.WP_URL}/wp-admin`
      );
    } catch (err) {
      log('error', `Crawl failed for ${url}: ${err.message}`);
      await notify(`❌ recipe-bot crawl error: ${url}\n${err.message}`);
    }
  }
  log('info', 'Crawl complete.');
}

async function main() {
  log('info', 'recipe-bot v2.0.0 starting...');
  await ensureDirs();
  startWatcher();
  if (process.env.TELEGRAM_RECIPE_BOT_TOKEN) {
    startTelegramBot(OUTPUT_DIR);
  } else {
    log('warn', 'TELEGRAM_RECIPE_BOT_TOKEN not set — Telegram input disabled');
  }
  await runCrawl();
  cron.schedule(CRAWL_CRON, runCrawl);
  log('info', `Crawl schedule: ${CRAWL_CRON}`);
  log('info', 'recipe-bot ready.');
  await notify('🤖 recipe-bot v2.0.0 started — folder watch, Telegram, and URL crawler active.');
}

main().catch(async (err) => {
  log('error', `Fatal: ${err.message}`);
  await notify(`💀 recipe-bot crashed: ${err.message}`);
  process.exit(1);
});
