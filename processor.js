import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from '../utils/logger.js';
import { fetchUrl } from '../utils/fetcher.js';
import { writeOutputs } from '../utils/writer.js';
import { parseResponse } from '../utils/parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_PATH = path.join(__dirname, '../../skill/SKILL.md');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let skillPrompt = null;

async function getSkillPrompt() {
  if (skillPrompt) return skillPrompt;
  skillPrompt = await fs.readFile(SKILL_PATH, 'utf8');
  return skillPrompt;
}

// ─── Detect mode from file content ───────────────────────────────────────────

async function buildUserMessage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);

  // Plain text — check if it's a URL or recipe notes
  if (ext === '.txt' || ext === '.md') {
    const content = await fs.readFile(filePath, 'utf8');
    const trimmed = content.trim();

    if (/^https?:\/\//i.test(trimmed)) {
      // It's a URL — fetch the page
      log('info', `Fetching URL from ${filename}: ${trimmed}`);
      const fetched = await fetchUrl(trimmed.split('\n')[0]);
      return {
        mode: 'A',
        source: trimmed,
        text: `MODE A — Source URL: ${trimmed}\n\nFetched content:\n${fetched}`,
      };
    } else {
      // Recipe notes / description
      return {
        mode: 'B',
        source: filename,
        text: `MODE B — Recipe notes from file "${filename}":\n\n${content}`,
      };
    }
  }

  // PDF
  if (ext === '.pdf') {
    const { default: pdfParse } = await import('pdf-parse');
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return {
      mode: 'B',
      source: filename,
      text: `MODE B — Recipe from PDF "${filename}":\n\n${data.text}`,
    };
  }

  // Image
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    const imageData = await fs.readFile(filePath);
    const base64 = imageData.toString('base64');
    const mediaType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    return {
      mode: 'B',
      source: filename,
      isImage: true,
      base64,
      mediaType,
      text: `MODE B — Recipe from image "${filename}". Extract any visible recipe text and generate the full blog post.`,
    };
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

// ─── Call Claude ──────────────────────────────────────────────────────────────

async function callClaude(userMessage) {
  const skill = await getSkillPrompt();

  const systemPrompt = `You are a recipe blog post generator for an "elevated weeknight cooking" blog targeting busy Toronto-based professionals.

SKILL INSTRUCTIONS:
${skill}

CRITICAL RULES:
- Follow the skill exactly. Output ALL sections: blog draft, recipe card, SEO package, social package, pre-publish checklist.
- Flag every unconfirmed quantity or time with ⚠️ VERIFY.
- Leave [INSERT] placeholders for personal anecdotes — never fabricate them.
- Use Canadian English spelling.
- No affirmations. No clichés. Technique-first voice.
- Metric first, imperial in parentheses.
- Separate each major section with: --- SECTION: [NAME] ---
- Begin your response with: TITLE: [the post title]`;

  let messages;

  if (userMessage.isImage) {
    messages = [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: userMessage.mediaType, data: userMessage.base64 } },
        { type: 'text', text: userMessage.text },
      ],
    }];
  } else {
    messages = [{ role: 'user', content: userMessage.text }];
  }

  log('info', `Calling Claude API (mode ${userMessage.mode})...`);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages,
  });

  return response.content[0].text;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function processFile(filePath, outputDir) {
  const userMessage = await buildUserMessage(filePath);
  const raw = await callClaude(userMessage);
  const parsed = parseResponse(raw);
  const outputPath = await writeOutputs(parsed, outputDir, userMessage.source);

  log('info', `Output written to ${outputPath}`);

  return {
    title: parsed.title,
    verifyCount: parsed.verifyCount,
    outputDir: outputPath,
  };
}
