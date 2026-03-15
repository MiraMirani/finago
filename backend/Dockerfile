FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npm run prisma:generate

EXPOSE 4000

CMD ["npm", "run", "dev"]