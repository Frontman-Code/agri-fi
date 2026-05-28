FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["/bin/sh", "-c", "wget -q --spider http://127.0.0.1:3000/health || exit 1"]

CMD ["npm", "run", "start:prod"]