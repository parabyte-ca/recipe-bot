#!/bin/bash
set -e

PROJECT="recipe-bot"
CONTAINER_NAME=recipe-bot
INPUT_DIR="/mnt/shared_vol/home/amoote/recipe-bot/input"
OUTPUT_DIR="/mnt/shared_vol/home/amoote/recipe-bot/output"

echo "Updating $PROJECT..."

git pull

docker build -t parabyte-ca/$PROJECT:latest .

docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME

docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  --env-file .env \
  -v "$INPUT_DIR:/data/input" \
  -v "$OUTPUT_DIR:/data/output" \
  parabyte-ca/$PROJECT:latest

echo "Update complete. Logs: docker logs -f $CONTAINER_NAME"
