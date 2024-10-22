import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // カテゴリのシード
  const categories = [
    { name: "個人" },
    { name: "法人" },
    { name: "その他" }
  ];

  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: category.name }
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: category
      });
      console.log(`カテゴリ "${category.name}" が作成されました。`);
    } else {
      console.log(`カテゴリ "${category.name}" は既に存在します。`);
    }
  }

  // タグのシード
  const tags = [
    { name: "制作会社" },
    { name: "プロダクション" },
    { name: "レーベル" },
    { name: "出版社" },
    { name: "作曲" },
    { name: "編曲" },
    { name: "作詞" },
    { name: "Mix" },
    { name: "Rec" },
    { name: "Mastering" },
    { name: "ミュージシャン" },
    { name: "MIDI制作" },
    { name: "事務" },
    { name: "スタジオ" },
    { name: "楽器テック" },
    { name: "その他" }
  ];

  for (const tag of tags) {
    const existingTag = await prisma.tag.findUnique({
      where: { name: tag.name }
    });

    if (!existingTag) {
      await prisma.tag.create({
        data: tag
      });
      console.log(`タグ "${tag.name}" が作成されました。`);
    } else {
      console.log(`タグ "${tag.name}" は既に存在します。`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("エラー発生:", e);
    await prisma.$disconnect();
    throw e; // エラーを再スローしてプログラムを終了させる
  });

export { main };