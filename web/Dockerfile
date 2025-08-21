
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --prefer-offline --no-audit --progress=false || (echo 'lockfile missing' && npm install)
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app .
EXPOSE 3000
CMD ["npm", "start"]
