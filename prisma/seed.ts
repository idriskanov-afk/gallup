import { PrismaClient } from "@prisma/client";
import { TALENTS_DATA } from "./seed-talents";
import { QUESTIONS_DATA } from "./seed-questions";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  console.log("Checking and upserting 34 talents...");
  for (const t of TALENTS_DATA) {
    await prisma.talent.upsert({
      where: { slug: t.slug },
      update: {
        nameRu: t.nameRu,
        nameEn: t.nameEn,
        domain: t.domain,
        shortDescription: t.shortDescription,
        managerGuide: JSON.stringify(t.managerGuide),
      },
      create: {
        id: t.id,
        slug: t.slug,
        nameRu: t.nameRu,
        nameEn: t.nameEn,
        domain: t.domain,
        shortDescription: t.shortDescription,
        managerGuide: JSON.stringify(t.managerGuide),
      },
    });
  }

  console.log(`Checking and syncing ${QUESTIONS_DATA.length} multi-context paired questions...`);
  for (const q of QUESTIONS_DATA) {
    const existing = await prisma.question.findFirst({
      where: { orderIndex: q.orderIndex },
    });

    if (existing) {
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          talentAId: q.talentAId,
          statementA: q.statementA,
          talentBId: q.talentBId,
          statementB: q.statementB,
        },
      });
    } else {
      await prisma.question.create({
        data: {
          orderIndex: q.orderIndex,
          talentAId: q.talentAId,
          statementA: q.statementA,
          talentBId: q.talentBId,
          statementB: q.statementB,
        },
      });
    }
  }

  const talentCount = await prisma.talent.count();
  const questionCount = await prisma.question.count();
  console.log(`Database seeded successfully! Talents: ${talentCount}, Questions: ${questionCount}`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
