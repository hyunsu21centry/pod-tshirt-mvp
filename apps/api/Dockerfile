FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --filter api... --frozen-lockfile=false
COPY . .
RUN pnpm --filter api prisma:generate && pnpm --filter api build
EXPOSE 4000
CMD ["sh", "-c", "pnpm --filter api prisma:migrate && pnpm --filter api prisma:seed && pnpm --filter api start"]
