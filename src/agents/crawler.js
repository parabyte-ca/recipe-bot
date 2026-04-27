import fs from 'fs/promises';
import path from 'path';
import { fetchUrl } from '../utils/fetcher.js';
import { log } from '../utils/logger.js';
import Anthropic from '@anthropic-ai/sdk';
import { parseResponse } from '../utils/parser.js';
import { writeOutputs } from '../utils/writer.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_PATH = path.join(__dirname, '../../skill/SKILL.md');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let skillPrompt = null;
async function getSkillPrompt() {
  if (skillPrompt) return skillPrompt;
  skillPrompt = await fs.readFile(SKILL_PATH, 'utf8');
  return skillPrompt;
}

export async function crawlUrlList(url, outputDir) {
  log('info', `Crawling: ${url}`);

  const content = await fetchUrl(url);
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

  const userMessage = `MODE A — Crawled URL: ${url}

Fetched content:
${content}

Generate the complete blog post package for this recipe.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const raw = response.content[0].text;
  const parsed = parseResponse(raw);
  const outputPath = await writeOutputs(parsed, outputDir, url);

  return {
    title: parsed.title,
    verifyCount: parsed.verifyCount,
    outputDir: outputPath,
  };
}
