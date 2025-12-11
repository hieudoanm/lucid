FROM node:24.12.0 AS build

LABEL author hieudoanm

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY . /home/node/app

RUN pnpm install & pnpm build

FROM node:24.12.0-alpine

# Update system packages to reduce vulnerabilities
RUN apk update && apk upgrade

USER node

COPY --from=build /home/node/app ./

ENV PORT=5000

EXPOSE $PORT

CMD ["yarn", "start"]
