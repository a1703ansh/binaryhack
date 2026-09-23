import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createUserWithOnboardData } from '../src/services/seed.service.js';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@earnwise.app';
  const password = 'demo1234';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Demo user already exists (${email}). Re-seeding data.`);
    await prisma.$transaction(async (tx) => {
      await tx.ledgerEntry.deleteMany({ where: { userId: existing.id } });
      await tx.ledgerAccount.deleteMany({ where: { userId: existing.id } });
      await tx.payoutRun.deleteMany({ where: { userId: existing.id } });
      await tx.automationLog.deleteMany({ where: { userId: existing.id } });
      await tx.chatMessage.deleteMany({ where: { userId: existing.id } });
      await tx.transaction.deleteMany({ where: { userId: existing.id } });
      await tx.expense.deleteMany({ where: { userId: existing.id } });
      await tx.savingsGoal.deleteMany({ where: { userId: existing.id } });
      await tx.incomeSource.deleteMany({ where: { userId: existing.id } });
      await tx.savingsSettings.deleteMany({ where: { userId: existing.id } });
      await tx.taxProfile.deleteMany({ where: { userId: existing.id } });
      await tx.investmentProfile.deleteMany({ where: { userId: existing.id } });
    });
    await createUserWithOnboardData(prisma, existing.id);
    console.log('Demo user data refreshed.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: 'Rahul', email, passwordHash, occupation: 'Delivery Partner' }
    });
    await createUserWithOnboardData(tx, user.id);
  });

  console.log(`Created demo user: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());