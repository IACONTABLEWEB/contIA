FROM node:20-bookworm-slim

# canvas necesita estas libs nativas para compilar/correr
RUN apt-get update && apt-get install -y \
    libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

EXPOSE 4000
CMD ["node", "src/server.js"]
