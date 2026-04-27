# Changelog

## [1.0.0] - 2026-04-26
### Added
- Folder watcher: drop recipe files (txt, pdf, jpg, png, webp, md) → auto-generates full blog draft
- Scheduled URL crawler: reads urls.txt daily (configurable cron) → processes each URL
- Claude API integration with recipe-blog skill prompt
- Outputs: draft.md, seo.md, social.md, checklist.md, meta.json per recipe
- Telegram notifications on completion or error
- Processed files moved to input/processed/ to avoid re-triggering
- docker-compose.yml for TrueNAS deployment
- setup.sh and update.sh following dev-sop standards
