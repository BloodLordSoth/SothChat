FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
COPY .env ./
COPY frontend ./
EXPOSE 3000
CMD ["node", "server.js"]