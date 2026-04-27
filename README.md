# recipe-bot
> AI-powered recipe blog post generator — drop a file or URL, get a complete draft.

![Version](https://img.shields.io/badge/version-1.0.0-blue)

## Overview

recipe-bot watches an input folder on TrueNAS for dropped recipe files (text, PDF, image) and crawls a configurable URL list on a daily schedule. For each input it calls the Claude API with the recipe-blog skill prompt and writes a complete blog package to the output folder. A Telegram notification fires on completion or error.

## Features

- **Folder watch** — drop any of: `.txt` (URL or notes), `.pdf`, `.jpg`, `.png`, `.webp`, `.md`
- **Scheduled URL crawl** — daily (configurable cron), reads `input/urls.txt`
- **Full blog package** per recipe: `draft.md`, `seo.md`, `social.md`, `checklist.md`, `meta.json`
- **⚠️ VERIFY flags** counted and surfaced in Telegram — unconfirmed quantities always flagged
- **[INSERT] placeholders** — personal anecdotes never fabricated; prompts left for you to fill
- **Telegram notifications** — draft ready / crawl complete / error alerts
- **Processed files** moved to `input/processed/` — no re-triggering

## Requirements

- Docker
- Anthropic API key
- Telegram bot token + chat ID (optional, for notifications)

## Setup

```bash
git clone git@github.com:parabyte-ca/recipe-bot.git
cd recipe-bot

# Place your recipe-blog SKILL.md in ./skill/SKILL.md
mkdir -p skill
cp /path/to/recipe-blog.skill skill/SKILL.md

# Configure
cp .env.example .env
# Edit .env — add ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

chmod +x setup.sh update.sh
./setup.sh
```

## Update

```bash
./update.sh
```

## Usage

### Drop-in (folder watch)
Drop any supported file into the SMB-mapped input folder:
```
\\truenas\amoote\recipe-bot\input\
```
Supported: `.txt` (one URL per line, or recipe notes), `.pdf`, `.jpg`, `.jpeg`, `.png`, `.webp`, `.md`

### URL list (scheduled crawl)
Edit `input/urls.txt` — one URL per line, `#` for comments:
```
# Recipe pages to process daily
https://www.seriouseats.com/some-recipe
https://www.recipetineats.com/some-recipe
```
Crawl runs at 08:00 daily by default. Adjust `CRAWL_CRON` in `.env`.

### Output structure
```
output/
└── 2026-04-26-pan-seared-salmon/
    ├── draft.md       ← full blog post (all sections)
    ├── seo.md         ← title, meta, slug, keywords, alt text
    ├── social.md      ← Pinterest ×3, IG caption, TikTok script, email subjects
    ├── checklist.md   ← pre-publish checklist
    └── meta.json      ← source, timestamp, ⚠️ VERIFY count
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Required |
| `TELEGRAM_BOT_TOKEN` | — | Optional |
| `TELEGRAM_CHAT_ID` | — | Optional |
| `INPUT_DIR` | `/data/input` | Input folder (inside container) |
| `OUTPUT_DIR` | `/data/output` | Output folder (inside container) |
| `URL_LIST` | `/data/input/urls.txt` | URL list file |
| `CRAWL_CRON` | `0 8 * * *` | Cron schedule for URL crawl |

## Changelog
See [CHANGELOG.md](CHANGELOG.md)

## License
Private — parabyte-ca
