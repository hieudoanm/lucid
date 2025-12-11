FROM node:24.12.0 AS build

LABEL author=hieudoanm

ENV PORT=3000

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY . /home/node/app

RUN pnpm install
RUN pnpm build

FROM node:24.12.0-alpine

USER node

COPY --from=build /home/node/app ./

EXPOSE $PORT

CMD ["yarn", "start"]
