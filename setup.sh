#!/bin/bash
set -e

PROJECT="recipe-bot"
VERSION=$(cat VERSION || echo "2.0.0")

echo "Setting up $PROJECT v$VERSION..."

# Ensure SMB-accessible data dirs exist
mkdir -p "${INPUT_HOST_DIR:-/mnt/shared_vol/home/amoote/recipe-bot/input}/processed"
mkdir -p "${OUTPUT_HOST_DIR:-/mnt/shared_vol/home/amoote/recipe-bot/output}"

# Ensure skill file is in place
if [ ! -f skill/SKILL.md ]; then
  echo "ERROR: skill/SKILL.md not found. Copy recipe-blog.skill content to skill/SKILL.md before running setup."
  exit 1
fi

# Ensure .env exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  .env created from .env.example."
  echo "    Fill in ANTHROPIC_API_KEY, DB passwords, and WP credentials before re-running."
  exit 1
fi

# Build recipe-bot image
docker build -t parabyte-ca/$PROJECT:$VERSION -t parabyte-ca/$PROJECT:latest .

# Start all services
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d

echo ""
echo "$PROJECT v$VERSION is running."
echo "WordPress:  http://$(hostname -I | awk '{print $1}'):8083"
echo "Input dir:  ${INPUT_HOST_DIR:-/mnt/shared_vol/home/amoote/recipe-bot/input}"
echo "Output dir: ${OUTPUT_HOST_DIR:-/mnt/shared_vol/home/amoote/recipe-bot/output}"
echo "Logs:       docker compose logs -f recipe-bot"
echo ""
echo "Next steps:"
echo "  1. Open WordPress at the URL above and complete the 5-minute setup wizard"
echo "  2. Go to Users > Profile > Application Passwords, generate a password"
echo "  3. Add it as WP_APP_PASSWORD in .env, then run: docker compose restart recipe-bot"
echo "  4. Add recipe-bot Cloudflare tunnel hostname for blog.moot.es -> localhost:8083"
