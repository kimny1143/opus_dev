FROM node:18-slim

# 必要なパッケージのインストール
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    bash \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリの設定
WORKDIR /workspace

# グローバルに Prisma CLI をインストール
RUN npm install -g prisma

# node ユーザーに切り替え
USER node

# コンテナ起動時は無限にスリープ（DevContainer 用）
CMD ["sleep", "infinity"]