FROM node:18-alpine

RUN apk update && apk add --no-cache wget curl netcat-openbsd
RUN addgroup -S santa && adduser -S santa -G santa

WORKDIR /usr/app

COPY ./src/package.json ./
RUN npm install
COPY ./src/ ./

COPY flag.txt /flag.txt
RUN chown santa:santa /flag.txt

USER santa

CMD ["npm", "start"]