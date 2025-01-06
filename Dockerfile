FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm config set store-dir /pnpm/.pnpm-store
RUN ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3
RUN apk upgrade --no-cache --available
RUN apk add --no-cache chromium-swiftshader ttf-freefont font-noto-emoji

FROM base AS prod
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN HUSKY=0 pnpm install
COPY . .
RUN pnpm prisma generate
RUN pnpm run tailwind:build
RUN pnpm run build

FROM base AS runner
COPY --from=prod /pnpm /pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
COPY --from=prod /app/dist ./dist
COPY --from=prod /app/prisma ./prisma
COPY --from=prod /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prod /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=prod /app/static ./static
COPY --from=prod /app/package.json .
COPY --from=prod /app/pnpm-lock.yaml .
ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_CHROME_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_DOWNLOAD=true \
    CHROME_PATH=/usr/lib/chromium/ \
    HUSKY=0
RUN PUPPETEER_SKIP_DOWNLOAD=true pnpm i --prod --ignore-scripts
USER node
CMD ["pnpm", "run", "start:migrate:prod"]