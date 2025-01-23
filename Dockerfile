FROM node:20-alpine

WORKDIR /usr/src/app

# Add build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install
RUN npm rebuild bcrypt --build-from-source

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"] 