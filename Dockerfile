# Usar una versión específica y estable de Node
FROM node:22-alpine3.21 AS base

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
# error en prisma con alpine
# https://github.com/prisma/prisma/issues/25817#issuecomment-2530137579
RUN ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3

ENV DIR=/app
WORKDIR $DIR

# Definir PORT por defecto
ENV PORT=3000

# Etapa de dependencias
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY libs/*/package.json ./libs/
# Instalar dependencias incluyendo devDependencies
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
 pnpm install --frozen-lockfile 

# Etapa de build
FROM base AS builder
COPY --from=deps $DIR/node_modules ./node_modules
COPY . .

# Generar el cliente de Prisma
RUN pnpm prisma generate

# Construir Tailwind
RUN pnpm tailwind:build || true

# Construir la aplicación
RUN pnpm build

# Limpiar dependencias de desarrollo
RUN pnpm prune --prod

# Etapa de producción
FROM base AS production
ENV NODE_ENV=production
ENV USER=node

# Instalar dumb-init para mejor manejo de procesos
RUN apk add --no-cache dumb-init=1.2.5-r3

# Copiar archivos necesarios
COPY --from=builder $DIR/dist ./dist
COPY --from=builder $DIR/node_modules ./node_modules
COPY --from=builder $DIR/prisma ./prisma
COPY --from=builder $DIR/static ./static

# Copiar y configurar el entrypoint
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh && \
    chown -R node:node .

USER $USER
EXPOSE $PORT
ENTRYPOINT ["./docker-entrypoint.sh"]