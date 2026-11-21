FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY sql ./sql
COPY src ./src
EXPOSE 3000
CMD ["npx", "tsx", "src/main.ts"]
