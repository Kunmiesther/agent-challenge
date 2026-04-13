# syntax=docker/dockerfile:1
FROM node:23-slim AS base

RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  git \
  curl \
  unzip \
  && rm -rf /var/lib/apt/lists/*

# Install bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

ENV ELIZAOS_TELEMETRY_DISABLED=true
ENV DO_NOT_TRACK=1

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

RUN mkdir -p /app/data

EXPOSE 3001

ENV NODE_ENV=production
ENV SERVER_PORT=3001

CMD ["bun", "run", "start"]