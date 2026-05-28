FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["npm", "run", "start:prod"]
EOF && git add backend/Dockerfile && GIT_AUTHOR_NAME='fortezzalaboratory' GIT_AUTHOR_EMAIL='fortezzalabs@gmail.com' GIT_COMMITTER_NAME='fortezzalaboratory' GIT_COMMITTER_EMAIL='fortezzalabs@gmail.com' git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -F - <<'MSG'
feat(devops): add backend container health probe

Adds Docker HEALTHCHECK for backend service to satisfy #521 runtime validation requirement.
MSG