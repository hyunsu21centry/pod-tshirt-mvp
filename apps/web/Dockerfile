FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --filter web... --frozen-lockfile=false
COPY . .
RUN pnpm --filter web build
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]
