# https://bun.sh/guides/ecosystem/docker
# https://qwik.dev/docs/cookbook/node-docker-deploy/

FROM imbios/bun-node AS base
WORKDIR /usr/src/app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Build the application
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
ENV ORIGIN=localhost:3000

# Build the application (modified build command)
RUN bun run build

FROM base AS release
COPY --from=install /temp/prod/node_modules ./node_modules
COPY --from=prerelease /usr/src/app/dist ./dist
COPY --from=prerelease /usr/src/app/server ./server
COPY --from=prerelease /usr/src/app/package.json .

USER bun
EXPOSE 3000/tcp

ENTRYPOINT ["bun", "run", "serve"]
