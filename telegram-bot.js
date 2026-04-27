import { Telegraf } from 'telegraf';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { processFile } from './processor.js';
import { crawlUrlList } from './crawler.js';
import { log } from '../utils/logger.js';
import { notify } from '../utils/telegram.js';

const ALLOWED_CHAT_IDS = process.env.TELEGRAM_ALLOWED_CHATS
  ? process.env.TELEGRAM_ALLOWED_CHATS.split(',').map(id => id.trim())
  : [];

function isAllowed(ctx) {
  if (ALLOWED_CHAT_IDS.length === 0) return true;
  return ALLOWED_CHAT_IDS.includes(String(ctx.chat?.id));
}

async function handleResult(ctx, result) {
  await ctx.reply(
    `Draft ready: ${result.title}\n` +
    `${result.verifyCount} items flagged for verification.\n` +
    `Check WP drafts: ${process.env.WP_URL}/wp-admin`
  );
}

export function startTelegramBot(outputDir) {
  const bot = new Telegraf(process.env.TELEGRAM_RECIPE_BOT_TOKEN);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  bot.use(async (ctx, next) => {
    if (!isAllowed(ctx)) {
      log('warn', `Blocked unauthorized chat: ${ctx.chat?.id}`);
      return;
    }
    return next();
  });

  // ── /start ──────────────────────────────────────────────────────────────────
  bot.command('start', (ctx) => {
    ctx.reply(
      'recipe-bot ready.\n\n' +
      'Send me any of:\n' +
      '- A recipe URL\n' +
      '- A photo of a recipe\n' +
      '- A PDF or text file\n' +
      '- Recipe notes as text\n\n' +
      'I\'ll generate a full blog draft and push it to WordPress.'
    );
  });

  // ── /help ───────────────────────────────────────────────────────────────────
  bot.command('help', (ctx) => {
    ctx.reply(
      'Commands:\n' +
      '/start — show this intro\n' +
      '/status — check bot status\n\n' +
      'Just send a URL, file, photo, or recipe text — no command needed.'
    );
  });

  // ── /status ─────────────────────────────────────────────────────────────────
  bot.command('status', (ctx) => {
    ctx.reply(`recipe-bot v2.0.0 running.\nWordPress: ${process.env.WP_URL}`);
  });

  // ── URL or plain text ────────────────────────────────────────────────────────
  bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();

    if (/^https?:\/\//i.test(text)) {
      await ctx.reply(`Got it. Fetching and processing: ${text}`);
      try {
        const result = await crawlUrlList(text, outputDir);
        await handleResult(ctx, result);
      } catch (err) {
        log('error', `Telegram URL error: ${err.message}`);
        await ctx.reply(`Processing failed: ${err.message}`);
      }
    } else {
      // Treat as recipe notes
      await ctx.reply('Got your notes. Generating draft...');
      const tmpFile = path.join(outputDir, `tg-notes-${Date.now()}.txt`);
      try {
        await fs.writeFile(tmpFile, text);
        const result = await processFile(tmpFile, outputDir);
        await fs.unlink(tmpFile).catch(() => {});
        await handleResult(ctx, result);
      } catch (err) {
        log('error', `Telegram text error: ${err.message}`);
        await ctx.reply(`Processing failed: ${err.message}`);
        await fs.unlink(tmpFile).catch(() => {});
      }
    }
  });

  // ── Photo ────────────────────────────────────────────────────────────────────
  bot.on('photo', async (ctx) => {
    await ctx.reply('Photo received. Processing...');
    try {
      const photo = ctx.message.photo.at(-1); // largest size
      const fileUrl = await ctx.telegram.getFileLink(photo.file_id);
      const tmpFile = path.join(outputDir, `tg-photo-${Date.now()}.jpg`);
      await downloadFile(fileUrl.href, tmpFile);
      const result = await processFile(tmpFile, outputDir);
      await fs.unlink(tmpFile).catch(() => {});
      await handleResult(ctx, result);
    } catch (err) {
      log('error', `Telegram photo error: ${err.message}`);
      await ctx.reply(`Processing failed: ${err.message}`);
    }
  });

  // ── Document (PDF, txt, etc.) ────────────────────────────────────────────────
  bot.on('document', async (ctx) => {
    const doc = ctx.message.document;
    const ext = path.extname(doc.file_name || '').toLowerCase();
    const allowed = new Set(['.pdf', '.txt', '.md', '.jpg', '.jpeg', '.png', '.webp']);

    if (!allowed.has(ext)) {
      await ctx.reply(`File type ${ext} not supported. Send a PDF, text, or image file.`);
      return;
    }

    await ctx.reply(`File received (${doc.file_name}). Processing...`);
    try {
      const fileUrl = await ctx.telegram.getFileLink(doc.file_id);
      const tmpFile = path.join(outputDir, `tg-doc-${Date.now()}${ext}`);
      await downloadFile(fileUrl.href, tmpFile);
      const result = await processFile(tmpFile, outputDir);
      await fs.unlink(tmpFile).catch(() => {});
      await handleResult(ctx, result);
    } catch (err) {
      log('error', `Telegram document error: ${err.message}`);
      await ctx.reply(`Processing failed: ${err.message}`);
    }
  });

  // ── Error handler ────────────────────────────────────────────────────────────
  bot.catch((err, ctx) => {
    log('error', `Telegram bot error for ${ctx.updateType}: ${err.message}`);
  });

  // ── Launch with long polling ─────────────────────────────────────────────────
  bot.launch({ dropPendingUpdates: true });
  log('info', 'Telegram recipe bot started (long polling).');

  process.once('SIGINT',  () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  await fs.writeFile(dest, Buffer.from(buffer));
}
