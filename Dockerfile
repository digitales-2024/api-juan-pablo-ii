FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm config set store-dir /pnpm/.pnpm-store
# error en prisma con alpine
RUN ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3
# Chrome for puppeteer
RUN apk upgrade --no-cache --available
RUN apk add --no-cache chromium-swiftshader
RUN apk add --no-cache ttf-freefont 
RUN apk add --no-cache font-noto-emoji 

FROM base AS prod
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm config set store-dir /pnpm/.pnpm-store
WORKDIR /app

# Primero copiamos solo los archivos necesarios para la instalación
COPY package.json pnpm-lock.yaml ./

# Instalamos dependencias evitando husky
RUN HUSKY=0 pnpm install

# Ahora copiamos el resto del código
COPY . .

# Ejecutamos los scripts de construcción
RUN pnpm prisma generate
RUN pnpm run tailwind:build
RUN pnpm run build

FROM base AS runner
COPY --from=prod /pnpm /pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm config set store-dir /pnpm/.pnpm-store
WORKDIR /app

# Copiamos los archivos necesarios para producción
COPY --from=prod /app/dist ./dist
COPY --from=prod /app/prisma ./prisma
COPY --from=prod /app/static ./static
COPY --from=prod /app/package.json .
COPY --from=prod /app/pnpm-lock.yaml .

# Configuración de Puppeteer
ENV CHROME_BIN="/usr/bin/chromium-browser"
ENV PUPPETEER_CHROME_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV CHROME_PATH=/usr/lib/chromium/

# Instalamos solo las dependencias de producción evitando husky
ENV HUSKY=0
RUN PUPPETEER_SKIP_DOWNLOAD=true pnpm i --prod --ignore-scripts

USER node
CMD ["pnpm", "run", "start:migrate:prod"]