# ---------- Build ----------
FROM node:22.18.0-bookworm-slim AS builder
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
 && apt-get -y upgrade \
 && apt-get install -y --no-install-recommends \
      ca-certificates git python3 build-essential \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM node:22.18.0-bookworm-slim AS runtime
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
 && apt-get -y upgrade \
 && apt-get install -y --no-install-recommends \
      ca-certificates dumb-init tzdata \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATABASE_DIR=/data \
    DATABASE_FILE=app.db \
    TZ=America/Lima

# usuario no-root + dirs
RUN useradd -m -u 10001 appuser \
 && mkdir -p /app /data \
 && chown -R appuser:appuser /app /data

WORKDIR /app
COPY --chown=appuser:appuser package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# artefactos
COPY --from=builder --chown=appuser:appuser /app/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/public ./public

USER appuser
EXPOSE 3000
ENTRYPOINT ["dumb-init","--"]
CMD ["node","./dist/server/entry.mjs"]
