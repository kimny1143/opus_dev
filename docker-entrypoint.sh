#!/bin/sh

# データベースマイグレーションを実行
npx prisma migrate deploy

# シードデータを投入
npx prisma db seed

# 開発サーバーを起動
npm run dev