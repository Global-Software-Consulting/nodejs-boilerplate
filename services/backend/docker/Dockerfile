FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json pnpm-lock.yaml ./

USER node

RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

EXPOSE 3000
