FROM node:22-alpine3.20 AS base
ENV DIR /app
WORKDIR $DIR

FROM base AS build
RUN apk update && apk add --no-cache dumb-init=1.2.5-r3
COPY package*.json ./
COPY prisma ./prisma/
COPY static ./static/
RUN npm ci
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src
COPY libs ./libs

# Generar el cliente de Prisma
RUN npx prisma generate

# Construir Tailwind si lo usas
RUN npm run tailwind:build || true

# Construir la aplicación
RUN npm run build && \
    npm prune --production

FROM base AS production
ENV NODE_ENV=production
ENV USER=node
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build $DIR/package*.json ./
COPY --from=build $DIR/node_modules ./node_modules
COPY --from=build $DIR/dist ./dist
COPY --from=build $DIR/prisma ./prisma
COPY --from=build $DIR/static ./static
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh && \
    chown node:node docker-entrypoint.sh
USER $USER
EXPOSE $PORT

ENTRYPOINT ["./docker-entrypoint.sh"]



