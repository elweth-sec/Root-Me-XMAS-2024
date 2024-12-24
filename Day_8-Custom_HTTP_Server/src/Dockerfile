FROM node:18

RUN apt-get update && apt-get install -y \
    libx11-xcb1 \
    libxrandr2 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxfixes3 \
    libxi6 \
    libgtk-3-0 \
    libatk1.0-0 \
    libasound2 \
    libdbus-1-3 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY app/package*.json ./

RUN npm install --production

RUN npx playwright install firefox --with-deps

COPY app/. .

EXPOSE 3000

CMD ["npm", "start"]