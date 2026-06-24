FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 3001

COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
