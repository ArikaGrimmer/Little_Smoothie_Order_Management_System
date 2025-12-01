# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS base

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

WORKDIR /app

ARG NPM_REGISTRY="https://registry.npmjs.org/"
RUN npm config set registry ${NPM_REGISTRY}

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV SOCKET_PORT=4001

ARG NPM_REGISTRY="https://registry.npmjs.org/"

WORKDIR /app

RUN apk add --no-cache libc6-compat

RUN npm config set registry ${NPM_REGISTRY}

COPY --from=base /app/.output ./.output
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/seed-database.js ./seed-database.js

EXPOSE 3000 4001

CMD ["node", ".output/server/index.mjs"]
