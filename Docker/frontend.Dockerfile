FROM node:20-alpine AS builder

WORKDIR /app

COPY Frontend/package.json Frontend/tsconfig.json Frontend/tailwind.config.js Frontend/postcss.config.js Frontend/next.config.js ./
RUN npm install

COPY Frontend/src ./src
COPY Frontend/public ./public

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["npm", "start"]
