# ---------- Build ----------
FROM node:22-alpine AS builder

# deps para compilar addons nativos (better-sqlite3, sharp)
RUN apk add --no-cache \
  python3 make g++ pkgconfig autoconf automake libtool \
  vips-dev libc6-compat git

WORKDIR /app

# instala TODAS las deps (dev + prod) para poder build
COPY package*.json ./
RUN npm ci

# copia código y build
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM node:22-alpine AS runtime

# deps runtime (sharp necesita vips) + signals
RUN apk add --no-cache vips libc6-compat dumb-init tzdata

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATABASE_DIR=/data \
    DATABASE_FILE=app.db \
    TZ=America/Lima

# usuario no-root
RUN addgroup -g 1001 -S app && adduser -S astro -u 1001 -G app \
 && mkdir -p /app /data && chown -R astro:app /app /data

WORKDIR /app

# instala SOLO prod deps en runtime (no copiar node_modules del builder)
COPY --chown=astro:app package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# copia artefactos de build
COPY --from=builder --chown=astro:app /app/dist ./dist
COPY --from=builder --chown=astro:app /app/public ./public

# ¡No copies database.sqlite! La DB va en /data (montada como volumen)
# Si guardas uploads, también apúntalos a /data o crea otro volumen

USER astro
EXPOSE 3000

ENTRYPOINT ["dumb-init","--"]
CMD ["node", "./dist/server/entry.mjs"]
