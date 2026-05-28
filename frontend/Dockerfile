FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]
EOF && git add frontend/Dockerfile && GIT_AUTHOR_NAME='fortezzalaboratory' GIT_AUTHOR_EMAIL='fortezzalabs@gmail.com' GIT_COMMITTER_NAME='fortezzalaboratory' GIT_COMMITTER_EMAIL='fortezzalabs@gmail.com' git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "chore(devops): scaffold frontend container image" -m "Adds baseline frontend Dockerfile to prepare health validation work for #521."