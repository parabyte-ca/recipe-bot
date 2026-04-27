#!/bin/bash
set -e

PROJECT="recipe-bot"
VERSION=$(cat VERSION || echo "1.0.0")
PORT=8181
CONTAINER_NAME=recipe-bot
INPUT_DIR="/mnt/shared_vol/recipe-bot/input"
OUTPUT_DIR="/mnt/shared_vol/recipe-bot/output"

echo "Setting up $PROJECT v$VERSION..."

# Ensure data dirs exist on TrueNAS
mkdir -p "$INPUT_DIR/processed"
mkdir -p "$OUTPUT_DIR"

# Copy skill file into place
mkdir -p skill
cp /path/to/recipe-blog.skill skill/SKILL.md 2>/dev/null || true
# OR: place the SKILL.md manually in ./skill/SKILL.md before running setup

# Ensure .env exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  .env created from .env.example — fill in ANTHROPIC_API_KEY before continuing"
  exit 1
fi

# Build image
docker build -t parabyte-ca/$PROJECT:$VERSION -t parabyte-ca/$PROJECT:latest .

# Stop and remove existing container if present
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Run
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  --env-file .env \
  -v "$INPUT_DIR:/data/input" \
  -v "$OUTPUT_DIR:/data/output" \
  parabyte-ca/$PROJECT:latest

echo "$PROJECT v$VERSION is running."
echo "Input:  $INPUT_DIR"
echo "Output: $OUTPUT_DIR"
echo "Logs:   docker logs -f $CONTAINER_NAME"
