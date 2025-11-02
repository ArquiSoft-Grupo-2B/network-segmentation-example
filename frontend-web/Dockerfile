FROM node:20-alpine

WORKDIR /app

COPY package.json .

RUN npm install

RUN apk add --no-cache curl iputils


COPY . .

EXPOSE 5173

CMD ["npm", "run","dev"]