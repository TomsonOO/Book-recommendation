FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "dist/main.js"] 