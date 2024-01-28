ARG NODE_VERSION=20.11.0-alpine3.19

FROM node:${NODE_VERSION} as base 
WORKDIR /usr/src/app
ENV YARN_VERSION 4.0.2

RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs fastify-build 

EXPOSE 3000

# development stage
FROM base as dev 
ENV NODE_ENV=development

COPY .yarnrc.docker.yml .yarnrc.yml
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --immutable

RUN chown -R fastify-build:nodejs /usr/src/app

USER fastify-build 
COPY . .

CMD yarn dev

# production stage
FROM base as prod 
ENV NODE_ENV=production

COPY .yarnrc.docker.yml .yarnrc.yml
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --immutable

RUN chown -R fastify-build:nodejs /usr/src/app
USER fastify-build 
COPY . .
RUN yarn build:ts

USER fastify-app 
CMD yarn start 

