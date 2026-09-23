-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('SPENDABLE', 'EMERGENCY', 'VEHICLE', 'TAX', 'INVESTED');

-- CreateEnum
CREATE TYPE "EntryKind" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('AUTO_SAVE', 'TAX_RESERVE', 'INVESTMENT_RECOMMENDATION', 'SYSTEM_ALERT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "occupation" TEXT NOT NULL DEFAULT 'Delivery Partner',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "minimumBalance" INTEGER NOT NULL DEFAULT 5000,
    "monthlySavingsTarget" INTEGER NOT NULL DEFAULT 5000,
    "emergencyFundTarget" INTEGER NOT NULL DEFAULT 25000,
    "autoSaveActive" BOOLEAN NOT NULL DEFAULT true,
    "pausedToday" BOOLEAN NOT NULL DEFAULT false,
    "skipToday" BOOLEAN NOT NULL DEFAULT false,
    "maxMonthlyCap" INTEGER NOT NULL DEFAULT 8000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavingsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "estimatedAnnualIncome" INTEGER NOT NULL DEFAULT 342000,
    "taxAlreadyReserved" INTEGER NOT NULL DEFAULT 0,
    "mockTaxRate" INTEGER NOT NULL DEFAULT 10,
    "quarterlyDueDate" TEXT NOT NULL DEFAULT 'March 15, 2027',
    "quarterlyDaysRemaining" INTEGER NOT NULL DEFAULT 24,
    "readinessPercentage" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'Balanced',
    "score" INTEGER NOT NULL DEFAULT 68,
    "savingConsistency" INTEGER NOT NULL DEFAULT 84,
    "incomeVolatility" TEXT NOT NULL DEFAULT 'Moderate',
    "emergencyFundProgress" INTEGER NOT NULL DEFAULT 42,
    "withdrawalFrequency" TEXT NOT NULL DEFAULT 'Low',
    "goalHorizonMonths" INTEGER NOT NULL DEFAULT 18,
    "explanation" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeSource" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Gig Platform',
    "connected" BOOLEAN NOT NULL DEFAULT true,
    "monthlyTotal" INTEGER NOT NULL DEFAULT 0,
    "lastPayoutDate" TIMESTAMP(3),
    "payoutFrequency" TEXT NOT NULL DEFAULT 'Daily / Weekly',
    "color" TEXT NOT NULL DEFAULT '#64748B',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncomeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Received',
    "autoSavedAmount" INTEGER,
    "taxReservedAmount" INTEGER,
    "investRecommendedAmount" INTEGER,
    "spendableAmount" INTEGER,
    "kind" TEXT NOT NULL DEFAULT 'payout',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "receiptStatus" TEXT NOT NULL DEFAULT 'manual',
    "receiptPath" TEXT,
    "receiptMime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" INTEGER NOT NULL,
    "currentAmount" INTEGER NOT NULL DEFAULT 0,
    "deadline" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "category" TEXT NOT NULL DEFAULT 'General',
    "icon" TEXT NOT NULL DEFAULT 'Target',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LedgerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "kind" "EntryKind" NOT NULL,
    "description" TEXT NOT NULL,
    "payoutRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "saveAmount" INTEGER NOT NULL,
    "taxReserveAmount" INTEGER NOT NULL,
    "investRecommendAmount" INTEGER NOT NULL,
    "spendableAmount" INTEGER NOT NULL,
    "avgDailyIncome" INTEGER NOT NULL,
    "ratio" DOUBLE PRECISION NOT NULL,
    "tier" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "explanationDetails" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayoutRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "canUndo" BOOLEAN NOT NULL DEFAULT false,
    "undone" BOOLEAN NOT NULL DEFAULT false,
    "payoutRunId" TEXT,
    "payoutAmount" INTEGER,
    "spendableRemaining" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "chips" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SavingsSettings_userId_key" ON "SavingsSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxProfile_userId_key" ON "TaxProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentProfile_userId_key" ON "InvestmentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerAccount_userId_type_key" ON "LedgerAccount"("userId", "type");

-- AddForeignKey
ALTER TABLE "SavingsSettings" ADD CONSTRAINT "SavingsSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxProfile" ADD CONSTRAINT "TaxProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentProfile" ADD CONSTRAINT "InvestmentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeSource" ADD CONSTRAINT "IncomeSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsGoal" ADD CONSTRAINT "SavingsGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerAccount" ADD CONSTRAINT "LedgerAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LedgerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_payoutRunId_fkey" FOREIGN KEY ("payoutRunId") REFERENCES "PayoutRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRun" ADD CONSTRAINT "PayoutRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationLog" ADD CONSTRAINT "AutomationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationLog" ADD CONSTRAINT "AutomationLog_payoutRunId_fkey" FOREIGN KEY ("payoutRunId") REFERENCES "PayoutRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
