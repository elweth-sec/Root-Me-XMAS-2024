FROM node:20-slim

WORKDIR /app

COPY app/ .

RUN npm install && npm install typescript -g

EXPOSE 3000

CMD ["npm", "start"]