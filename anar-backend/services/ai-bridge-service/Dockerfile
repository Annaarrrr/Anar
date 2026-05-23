FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY dist ./dist
EXPOSE 3004
CMD ["npm", "run", "start:prod"]
