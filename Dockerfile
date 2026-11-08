# syntax = docker/dockerfile:1

# Plain node:http, no framework — the one runtime dependency (marked, for
# /readme/ and /manual/) is installed from the committed lockfile so the
# image matches what pnpm resolved locally. fly.toml fixes the rest of the
# shape: one machine, one volume at /data, HTTP on 0.0.0.0:$PORT.
# scripts/ ships too: scripts/audit-log.ts is run against the deployed
# volume over `fly ssh console`, not just locally (see docs/USER_MANUAL.md).
FROM node:24-slim

WORKDIR /app

# Install deps before copying source so this layer only rebuilds when
# package.json/the lockfile change, not on every code edit.
COPY package.json pnpm-lock.yaml ./
RUN npm install --global pnpm@11.17.0 \
    && pnpm install --frozen-lockfile --prod

COPY src ./src
COPY scripts ./scripts
COPY README.md ./
COPY docs ./docs

ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/server.ts"]
