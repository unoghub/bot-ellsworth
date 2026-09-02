FROM node:26-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

EXPOSE 5303

CMD ["npm", "start"]
