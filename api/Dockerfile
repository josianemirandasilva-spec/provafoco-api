
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --prefer-offline --no-audit --progress=false ||     (echo 'If lockfile missing, installing anyway' && npm install)
COPY . .
RUN npx prisma generate || true
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/index.js"]
