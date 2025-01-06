FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN corepack enable
RUN ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3
RUN apk upgrade --no-cache --available \
    && apk add --no-cache chromium-swiftshader ttf-freefont font-noto-emoji

FROM base AS prod
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN HUSKY=0 PUPPETEER_SKIP_DOWNLOAD=true pnpm install --frozen-lockfile
RUN pnpm prisma generate
COPY . .
RUN pnpm run tailwind:build
RUN pnpm run build

FROM base AS runner
WORKDIR /app
COPY --from=prod /app/dist ./dist
COPY --from=prod /app/prisma ./prisma
COPY --from=prod /app/static ./static
COPY --from=prod /app/package.json ./package.json
COPY --from=prod /app/pnpm-lock.yaml ./pnpm-lock.yaml

ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/

RUN HUSKY=0 PUPPETEER_SKIP_DOWNLOAD=true pnpm install --prod --frozen-lockfile \
    && pnpm prisma generate

USER node
CMD ["pnpm", "run", "start:migrate:prod"]