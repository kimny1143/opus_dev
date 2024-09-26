import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ユーザーのシード
  const existingUser = await prisma.user.findUnique({
    where: { email: "tanaka@example.com" }
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: "田中 太郎",
        companyName: "株式会社サンプル",
        email: "tanaka@example.com",
        password: "password123",
        address: "東京都千代田区1-1-1",
        phone: "090-1234-5678",
        registrationNumber: "1234567890",
      }
    });
    console.log("ユーザーが作成されました。");
  } else {
    console.log("ユーザーは既に存在します。");
  }

  // クライアントのシード
  const existingClient = await prisma.client.findUnique({
    where: { contactEmail: "client@example.com" }
  });

  if (!existingClient) {
    await prisma.client.create({
      data: {
        companyName: "クライアント株式会社",
        address: "大阪府大阪市1-1-1",
        contactName: "佐藤 花子",
        contactEmail: "client@example.com",
        contactPhone: "080-1234-5678",
        registrationNumber: "0987654321",
      }
    });
    console.log("クライアントが作成されました。");
  } else {
    console.log("クライアントは既に存在します。");
  }
}

main()
  .catch(e => {
    console.error("エラー発生:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { main };