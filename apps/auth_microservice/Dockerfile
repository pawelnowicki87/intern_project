FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install
RUN npx turbo run build --filter=auth_microservice

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/auth_microservice/dist ./dist
COPY package*.json ./

EXPOSE 3002
CMD ["node", "dist/main.js"]
