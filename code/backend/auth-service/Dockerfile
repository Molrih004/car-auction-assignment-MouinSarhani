# Debian (glibc) instead of Alpine (musl): better-sqlite3 and Prisma's schema engine
# both ship prebuilt glibc binaries, so no compiler toolchain or patching is needed.
FROM node:24-bookworm-slim AS build

WORKDIR /app

# Prisma config + schema must be present before install: postinstall runs `prisma generate`
COPY package*.json prisma.config.ts ./
COPY prisma/ ./prisma/
RUN DATABASE_URL=file:/tmp/build.sqlite npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Drop devDependencies but keep the prisma CLI (for `migrate deploy`) and tsx (for the optional seed),
# which entrypoint.sh needs at runtime
RUN npm prune --omit=dev --ignore-scripts && npm install --no-save --ignore-scripts \
    prisma@$(node -p "require('./package-lock.json').packages['node_modules/prisma'].version") \
    tsx@$(node -p "require('./package-lock.json').packages['node_modules/tsx'].version")

FROM node:24-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/prisma.config.ts ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
# prisma/seed.ts imports the generated client source
COPY --from=build /app/src/generated ./src/generated
COPY entrypoint.sh ./
# Remove Windows line endings (CRLF), otherwise Linux can't run the script
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh && mkdir -p /data

EXPOSE 4001
ENTRYPOINT ["./entrypoint.sh"]
