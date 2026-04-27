# Changelog

## [2.0.0] - 2026-04-27
### Added
- WordPress Docker service (port 8083) with MySQL 8 backend
- docker-compose.yml replacing standalone Docker run
- Telegram recipe input bot (Telegraf, long polling) — send URL/photo/file/text directly
- WordPress REST API publisher — drafts auto-posted to WP on every run
- TELEGRAM_RECIPE_BOT_TOKEN and TELEGRAM_ALLOWED_CHATS env vars
- WP_USER and WP_APP_PASSWORD env vars for Application Password auth
- marked library for markdown-to-HTML conversion before WP post
- Cloudflare Tunnel instructions for blog.moot.es (port 8083)

### Changed
- docker-compose replaces standalone docker run
- setup.sh and update.sh updated for docker compose
- Voice rules in skill expanded with explicit anti-AI-tell list (no em dashes, no "game-changer", no hedging, natural sentence rhythm)
- system prompt in processor.js and crawler.js now includes voice rules inline

## [1.0.0] - 2026-04-26
### Added
- Folder watcher: drop recipe files (txt, pdf, jpg, png, webp, md) → auto-generates full blog draft
- Scheduled URL crawler: reads urls.txt daily (configurable cron)
- Claude API integration with recipe-blog skill prompt
- Outputs: draft.md, seo.md, social.md, checklist.md, meta.json per recipe
- Telegram notifications on completion or error
- Processed files moved to input/processed/
