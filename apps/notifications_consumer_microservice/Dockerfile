# ===== BUILDER =====
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install --workspaces --include-workspace-root
RUN npx turbo run build --filter=notifications_consumer_microservice

# ===== RUNTIME =====
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/notifications_consumer_microservice/dist ./dist
COPY package*.json ./

CMD ["node", "dist/main.js"]
