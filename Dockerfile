FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install --omit=dev

# Copy source
COPY src/ ./src/
COPY skill/ ./skill/

# Data directories created at runtime via volumes
VOLUME ["/data/input", "/data/output"]

CMD ["node", "src/index.js"]
