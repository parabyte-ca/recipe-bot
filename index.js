import 'dotenv/config';
import chokidar from 'chokidar';
import cron from 'node-cron';
import path from 'path';
import fs from 'fs/promises';
import { processFile } from './agents/processor.js';
import { crawlUrlList } from './agents/crawler.js';
import { log } from './utils/logger.js';
import { notify } from './utils/telegram.js';

const INPUT_DIR  = process.env.INPUT_DIR  || '/data/input';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/data/output';
const URL_LIST   = process.env.URL_LIST   || '/data/input/urls.txt';
const CRAWL_CRON = process.env.CRAWL_CRON || '0 8 * * *'; // 08:00 daily

// Supported drop-in file types
const SUPPORTED_EXT = new Set(['.txt', '.pdf', '.jpg', '.jpeg', '.png', '.webp', '.md']);

async function ensureDirs() {
  await fs.mkdir(INPUT_DIR,  { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

// ─── FOLDER WATCHER ──────────────────────────────────────────────────────────

function startWatcher() {
  log('info', `Watching ${INPUT_DIR} for new files...`);

  const watcher = chokidar.watch(INPUT_DIR, {
    ignored: [
      /(^|[/\\])\../,           // dotfiles
      '**/urls.txt',             // url list handled by crawler
      '**/crawl-sources.txt',    // same
    ],
    persistent: true,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 500 },
  });

  watcher.on('add', async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_EXT.has(ext)) return;

    log('info', `New file detected: ${filePath}`);

    try {
      const result = await processFile(filePath, OUTPUT_DIR);
      await notify(`✅ Draft ready: *${result.title}*\n⚠️ ${result.verifyCount} items need verification\nOutput: \`${result.outputDir}\``);

      // Move processed file to avoid re-triggering
      const doneDir = path.join(INPUT_DIR, 'processed');
      await fs.mkdir(doneDir, { recursive: true });
      await fs.rename(filePath, path.join(doneDir, path.basename(filePath)));
    } catch (err) {
      log('error', `Failed to process ${filePath}: ${err.message}`);
      await notify(`❌ recipe-bot error: ${path.basename(filePath)}\n${err.message}`);
    }
  });

  watcher.on('error', (err) => log('error', `Watcher error: ${err}`));
}

// ─── SCHEDULED URL CRAWLER ───────────────────────────────────────────────────

async function runCrawl() {
  log('info', 'Starting scheduled URL crawl...');

  let urls = [];

  // Read urls.txt
  try {
    const raw = await fs.readFile(URL_LIST, 'utf8');
    urls = raw
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'));
  } catch {
    log('warn', `No urls.txt found at ${URL_LIST} — skipping crawl`);
    return;
  }

  if (urls.length === 0) {
    log('info', 'urls.txt is empty — nothing to crawl');
    return;
  }

  log('info', `Crawling ${urls.length} URL(s)...`);

  for (const url of urls) {
    try {
      const result = await crawlUrlList(url, OUTPUT_DIR);
      await notify(`✅ Crawl draft: *${result.title}*\n⚠️ ${result.verifyCount} items need verification\nSource: ${url}`);
    } catch (err) {
      log('error', `Crawl failed for ${url}: ${err.message}`);
      await notify(`❌ Crawl error: ${url}\n${err.message}`);
    }
  }

  log('info', 'Crawl complete.');
}

// ─── BOOT ────────────────────────────────────────────────────────────────────

async function main() {
  log('info', 'recipe-bot v1.0.0 starting...');
  await ensureDirs();

  startWatcher();

  // Run crawl once on start (catches any pending URLs), then on schedule
  await runCrawl();
  cron.schedule(CRAWL_CRON, runCrawl);

  log('info', `Crawl schedule: ${CRAWL_CRON}`);
  log('info', 'recipe-bot ready.');
  await notify('🤖 recipe-bot started and watching for inputs.');
}

main().catch(async (err) => {
  log('error', `Fatal: ${err.message}`);
  await notify(`💀 recipe-bot crashed: ${err.message}`);
  process.exit(1);
});
