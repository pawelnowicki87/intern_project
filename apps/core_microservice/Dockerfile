FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npx turbo run build --filter=core_microservice

CMD ["node", "apps/core_microservice/dist/apps/core_microservice/src/main.js"]
