import fetch from 'node-fetch';
import { marked } from 'marked';
import { log } from './logger.js';

const WP_URL      = process.env.WP_URL      || 'http://wordpress';
const WP_USER     = process.env.WP_USER     || 'admin';
const WP_APP_PASS = process.env.WP_APP_PASSWORD;

/**
 * Post a parsed recipe draft to WordPress as a draft post.
 * Returns the WP post object on success.
 */
export async function publishToWordPress(parsed) {
  if (!WP_APP_PASS) {
    log('warn', 'WP_APP_PASSWORD not set — skipping WordPress publish');
    return null;
  }

  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString('base64');
  const endpoint = `${WP_URL}/wp-json/wp/v2/posts`;

  const html = buildHtml(parsed);
  const excerpt = extractExcerpt(parsed);

  const body = {
    title:   parsed.title,
    content: html,
    excerpt,
    status:  'draft',
    meta: {
      _recipe_verify_count: String(parsed.verifyCount),
    },
  };

  log('info', `Publishing "${parsed.title}" to WordPress as draft...`);

  const res = await fetch(endpoint, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WordPress API error ${res.status}: ${err}`);
  }

  const post = await res.json();
  log('info', `WordPress draft created: ID ${post.id} — ${WP_URL}/?p=${post.id}`);
  return post;
}

// ─── Build clean HTML from parsed sections ────────────────────────────────────

function buildHtml(parsed) {
  const sections = parsed.sections;

  // Priority order: use named sections if they exist, else fall back to full raw
  const blogDraft = sections['blog_draft'] || sections['blog_post'] || sections['post'] || null;
  const recipeCard = sections['recipe_card'] || sections['recipe_card_'] || null;
  const seoPackage = sections['seo_package'] || null;

  let md = '';

  if (blogDraft) {
    md += blogDraft + '\n\n';
  } else {
    // Strip known non-content sections from raw
    md = parsed.raw
      .replace(/---\s*SECTION:\s*(SEO PACKAGE|SOCIAL PACKAGE|PRE-PUBLISH CHECKLIST)[\s\S]*?(?=---\s*SECTION:|$)/gi, '')
      .trim();
  }

  if (recipeCard) {
    md += '\n\n---\n\n' + recipeCard;
  }

  // Convert markdown to HTML
  let html = marked.parse(md);

  // Clean up common AI-output artefacts
  html = html
    .replace(/⚠️ VERIFY/g, '<mark>⚠️ VERIFY</mark>')
    .replace(/\[INSERT:[^\]]+\]/g, (match) => `<span class="recipe-bot-placeholder" style="background:#fff3cd;padding:2px 6px;border-radius:3px;">${match}</span>`);

  // Add SEO package as HTML comment (visible in editor, not on front end)
  if (seoPackage) {
    html += `\n<!-- RECIPE-BOT SEO PACKAGE\n${seoPackage}\n-->`;
  }

  return html;
}

function extractExcerpt(parsed) {
  // Pull first non-title paragraph from the blog draft section
  const blogSection = parsed.sections['blog_draft'] || parsed.sections['blog_post'] || '';
  const paragraphs = blogSection.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  const first = paragraphs[0] || '';
  return first.replace(/[*_`]/g, '').slice(0, 300);
}
