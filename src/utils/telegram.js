import fetch from 'node-fetch';
import { log } from './logger.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

export async function notify(message) {
  if (!BOT_TOKEN || !CHAT_ID) {
    log('warn', 'Telegram not configured — skipping notification');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      log('warn', `Telegram send failed: ${err}`);
    }
  } catch (err) {
    log('warn', `Telegram error: ${err.message}`);
  }
}
