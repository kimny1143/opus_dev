FROM --platform=$BUILDPLATFORM node:23-slim

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

# 依存関係のインストールとbcryptの再ビルド
RUN npm install
RUN npm install --save-dev eslint
RUN npm install jspdf-autotable
RUN apt-get update && apt-get install -y python3 make g++
RUN npm rebuild bcrypt --build-from-source
RUN npm uninstall bcrypt
RUN npm install bcryptjs

COPY . .
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# プロダクションビルドを作成
RUN npm run build

# デフォルトのポート番号を設定
ENV PORT=3000

EXPOSE $PORT

CMD ["sh", "-c", "npm start"]