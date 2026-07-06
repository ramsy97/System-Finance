FROM node:20-alpine AS builder

WORKDIR /app

COPY Backend/package.json Backend/tsconfig.json ./
RUN npm install

COPY Backend/prisma ./prisma
RUN npx prisma generate

COPY Backend/src ./src
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY Backend/package.json ./
COPY Backend/.env ./

RUN mkdir -p ./uploads ./backups

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
