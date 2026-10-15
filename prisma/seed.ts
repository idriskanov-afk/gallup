import { PrismaClient } from "@prisma/client";
import { TALENTS_DATA } from "./seed-talents";
import { QUESTIONS_DATA } from "./seed-questions";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Clear existing data
  await prisma.response.deleteMany();
  await prisma.testSession.deleteMany();
  await prisma.question.deleteMany();
  await prisma.talent.deleteMany();

  console.log("Seeding 34 talents...");
  for (const t of TALENTS_DATA) {
    await prisma.talent.create({
      data: {
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

  console.log(`Seeding ${QUESTIONS_DATA.length} multi-context paired questions...`);
  for (const q of QUESTIONS_DATA) {
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
