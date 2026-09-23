import { Prisma } from '@prisma/client';
import {
  calculatePayoutDecision,
  calculateIncomeForecast,
  computeGoalDeltas,
  type DecisionResult
} from '@earnwise/shared';
import { prisma } from '../db.js';
import { badRequest, notFound } from '../lib/errors.js';

export const ACCOUNT_TYPES = ['SPENDABLE', 'EMERGENCY', 'VEHICLE', 'TAX', 'INVESTED'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

interface PayoutResult {
  runId: string;
  decision: DecisionResult;
  postings: { accountType: AccountType; amount: number }[];
  transactionId: string;
}

async function getOrCreateAccounts(tx: Prisma.TransactionClient, userId: string): Promise<Record<AccountType, string>> {
  const ids = {} as Record<AccountType, string>;
  for (const type of ACCOUNT_TYPES) {
    const acc = await tx.ledgerAccount.upsert({
      where: { userId_type: { userId, type } },
      create: { userId, type, balance: 0 },
      update: {}
    });
    ids[type] = acc.id;
  }
  return ids;
}

function post(
  tx: Prisma.TransactionClient,
  userId: string,
  accountId: string,
  amount: number,
  kind: 'CREDIT' | 'DEBIT',
  description: string,
  payoutRunId?: string
) {
  return tx.ledgerAccount
    .findUniqueOrThrow({ where: { id: accountId } })
    .then((acc) =>
      tx.ledgerAccount.update({
        where: { id: accountId },
        data: { balance: kind === 'CREDIT' ? acc.balance + amount : acc.balance - amount }
      })
    )
    .then(() =>
      tx.ledgerEntry.create({
        data: { userId, accountId, amount, kind, description, payoutRunId }
      })
    );
}

/** Run the decision engine and persist the payout atomically (ledger + goals + logs). */
export async function processPayout(userId: string, source: string, amount: number): Promise<PayoutResult> {
  if (!Number.isInteger(amount) || amount <= 0) throw badRequest('Payout amount must be a positive whole rupee amount');

  return prisma.$transaction(async (tx) => {
    const settings = await tx.savingsSettings.findUniqueOrThrow({ where: { userId } });
    const rawGoals = await tx.savingsGoal.findMany({ where: { userId } });
    const goals = rawGoals.map((g) => ({
      ...g,
      deadline: g.deadline ?? '',
      priority: g.priority as 'High' | 'Medium' | 'Low',
      category: g.category as 'Emergency' | 'Vehicle' | 'Festival' | 'Family' | 'General'
    }));
    const transactions = await tx.transaction.findMany({ where: { userId } });
    const accounts = await getOrCreateAccounts(tx, userId);

    const forecast = calculateIncomeForecast(
      transactions.map((t) => ({
        id: t.id,
        source: t.source as never,
        amount: t.amount,
        date: t.date.toISOString().split('T')[0],
        description: t.description,
        status: t.status as 'Received'
      }))
    );

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const runsThisMonth = await tx.payoutRun.aggregate({
      where: { userId, createdAt: { gte: monthStart } },
      _sum: { saveAmount: true }
    });
    const monthlySaved = runsThisMonth._sum.saveAmount ?? 0;

    const spendableBalance = (await tx.ledgerAccount.findUniqueOrThrow({ where: { id: accounts.SPENDABLE } })).balance;

    const decision = calculatePayoutDecision({
      dailyIncome: amount,
      averageDailyIncome: forecast.averageDailyIncome,
      currentBalance: spendableBalance,
      minimumBalance: settings.minimumBalance,
      monthlySavingsTarget: settings.monthlySavingsTarget,
      monthlySaved,
      emergencyFundProgress:
        (goals.find((g) => g.category === 'Emergency')?.currentAmount ?? 0) /
        (settings.emergencyFundTarget || 1) * 100,
      isPausedToday: settings.pausedToday,
      isSkippedToday: settings.skipToday,
      maxMonthlyCap: settings.maxMonthlyCap
    });

    // Goal waterfall (70% emergency / 30% vehicle), capacity-aware
    const deltas = computeGoalDeltas(goals, decision.saveAmount);
    const emergencyCredit = deltas.find((d) => goals.find((g) => g.id === d.goalId)?.category === 'Emergency')?.amount ?? 0;
    const vehicleCredit = deltas.find((d) => goals.find((g) => g.id === d.goalId)?.category === 'Vehicle')?.amount ?? 0;
    const leftover = Math.max(0, decision.saveAmount - emergencyCredit - vehicleCredit);

    const postings: { accountType: AccountType; amount: number }[] = [];

    const run = await tx.payoutRun.create({
      data: {
        userId,
        source,
        amount,
        saveAmount: decision.saveAmount,
        taxReserveAmount: decision.taxReserveAmount,
        investRecommendAmount: decision.investRecommendAmount,
        spendableAmount: decision.spendableAmount,
        avgDailyIncome: forecast.averageDailyIncome,
        ratio: amount / (forecast.averageDailyIncome || 1),
        tier: decision.tier,
        reason: decision.reason,
        explanationDetails: JSON.stringify(decision.explanationDetails)
      }
    });

    const postingList: [AccountType, number, string][] = [
      ['SPENDABLE', decision.spendableAmount, 'Spendable cash from payout'],
      ['TAX', decision.taxReserveAmount, 'Quarterly advance tax provision'],
      ['INVESTED', decision.investRecommendAmount, 'Micro-investment allocation'],
      ['EMERGENCY', emergencyCredit, 'Auto-save to Emergency Fund'],
      ['VEHICLE', vehicleCredit, 'Auto-save to Vehicle Maintenance'],
      ['SPENDABLE', leftover, 'Remaining unallocated auto-save (kept liquid)']
    ];

    for (const [type, amt, desc] of postingList) {
      if (amt <= 0) continue;
      await post(tx, userId, accounts[type], amt, 'CREDIT', desc, run.id);
      postings.push({ accountType: type, amount: amt });
    }

    // Goal current amounts
    for (const delta of deltas) {
      await tx.savingsGoal.update({
        where: { id: delta.goalId },
        data: { currentAmount: { increment: delta.amount } }
      });
    }

    // Income transaction record
    const txRecord = await tx.transaction.create({
      data: {
        userId,
        source,
        amount,
        date: new Date(),
        description: `${source} Instant Gig Settlement`,
        status: 'Received',
        autoSavedAmount: decision.saveAmount,
        taxReservedAmount: decision.taxReserveAmount,
        investRecommendedAmount: decision.investRecommendAmount,
        spendableAmount: decision.spendableAmount,
        kind: 'payout'
      }
    });

    // Income source aggregate
    await tx.incomeSource.updateMany({
      where: { userId, name: source },
      data: { monthlyTotal: { increment: amount }, lastPayoutDate: new Date() }
    });

    // Tax profile
    await tx.taxProfile.update({
      where: { userId },
      data: {
        taxAlreadyReserved: { increment: decision.taxReserveAmount },
        readinessPercentage: { increment: Math.min(2, 100 - decision.taxReserveAmount > 0 ? 2 : 0) }
      }
    });

    // Explainable activity logs
    const logs = [{ type: 'AUTO_SAVE', title: `Auto-Saved from ${source} Payout`, amount: decision.saveAmount, canUndo: decision.saveAmount > 0 },
      { type: 'TAX_RESERVE', title: 'Quarterly Advance Tax Reserved', amount: decision.taxReserveAmount, canUndo: false }] as const;

    await Promise.all(logs.map((log) =>
      tx.automationLog.create({
        data: {
          userId,
          type: log.type,
          title: log.title,
          amount: log.amount,
          reason: log.type === 'AUTO_SAVE' ? decision.reason : decision.explanationDetails.taxStatus,
          canUndo: log.canUndo,
          undone: false,
          payoutRunId: run.id,
          payoutAmount: amount,
          spendableRemaining: decision.spendableAmount
        }
      })
    ));

    if (decision.investRecommendAmount > 0) {
      await tx.automationLog.create({
        data: {
          userId,
          type: 'INVESTMENT_RECOMMENDATION',
          title: 'Micro-Investment Recommendation Created',
          amount: decision.investRecommendAmount,
          reason: decision.explanationDetails.investmentRationale,
          canUndo: false,
          undone: false,
          payoutRunId: run.id
        }
      });
    }

    return { runId: run.id, decision, postings, transactionId: txRecord.id };
  });
}

/** Reverse the auto-save leg of a payout run exactly (ledger-precise undo). */
export async function undoAutoSave(userId: string, logId: string) {
  return prisma.$transaction(async (tx) => {
    const log = await tx.automationLog.findFirst({ where: { id: logId, userId } });
    if (!log) throw notFound('Activity log not found');
    if (!log.canUndo || log.undone) throw badRequest('This action cannot be undone (already reversed)');
    if (!log.payoutRunId) throw badRequest('This action has no linked payout run');

    const entries = await tx.ledgerEntry.findMany({
      where: { payoutRunId: log.payoutRunId, userId, kind: 'CREDIT' },
      include: { account: true }
    });

    const reversals = entries.filter((e) => e.account.type === 'EMERGENCY' || e.account.type === 'VEHICLE');
    const totalReversed = reversals.reduce((sum, e) => sum + e.amount, 0);

    if (reversals.length === 0) {
      // Nothing was actually saved — just mark undone
      await tx.automationLog.update({ where: { id: logId }, data: { undone: true } });
      return { reversedAmount: 0, goals: await tx.savingsGoal.findMany({ where: { userId } }) };
    }

    const accounts = await getOrCreateAccounts(tx, userId);

    for (const entry of reversals) {
      await post(tx, userId, accounts[entry.account.type as AccountType], entry.amount, 'DEBIT', `Undo auto-save (${entry.description})`, log.payoutRunId);
    }
    await post(tx, userId, accounts.SPENDABLE, totalReversed, 'CREDIT', 'Reversed auto-save funds returned to spendable', log.payoutRunId);

    // Reverse goal top-ups proportionally by category
    const goals = await tx.savingsGoal.findMany({ where: { userId } });
    for (const entry of reversals) {
      const category = entry.account.type === 'EMERGENCY' ? 'Emergency' : 'Vehicle';
      const target = goals.find((g) => g.category === category);
      if (target) {
        await tx.savingsGoal.update({
          where: { id: target.id },
          data: { currentAmount: { decrement: entry.amount } }
        });
      }
    }

    await tx.automationLog.update({
      where: { id: logId },
      data: { undone: true, reason: log.reason + " (Reversed by user)" }
    });

    return { reversedAmount: totalReversed, goals: await tx.savingsGoal.findMany({ where: { userId } }) };
  });
}

/** Record a spending expense: debit the spendable account. */
export async function addExpenseRecord(
  userId: string,
  data: { amount: number; category: string; note: string; date?: Date; receiptPath?: string; receiptMime?: string }
) {
  return prisma.$transaction(async (tx) => {
    const accounts = await getOrCreateAccounts(tx, userId);
    const spendable = await tx.ledgerAccount.findUniqueOrThrow({ where: { id: accounts.SPENDABLE } });
    const spendableAmount = spendable.balance;
    if (spendableAmount < data.amount) {
      throw badRequest('Insufficient spendable balance for this expense');
    }
    await post(tx, userId, accounts.SPENDABLE, data.amount, 'DEBIT', `Expense: ${data.category} — ${data.note}`);

    const expense = await tx.expense.create({
      data: {
        userId,
        amount: data.amount,
        category: data.category,
        note: data.note,
        date: data.date ?? new Date(),
        receiptStatus: data.receiptPath ? 'verified' : 'manual',
        receiptPath: data.receiptPath,
        receiptMime: data.receiptMime
      }
    });

    await tx.automationLog.create({
      data: {
        userId,
        type: 'SYSTEM_ALERT',
        title: 'Expense Recorded',
        amount: data.amount,
        reason: `${data.category} expense of ₹${data.amount.toLocaleString('en-IN')} deducted from spendable balance and fed into your safe-spending signal.`,
        canUndo: false,
        undone: false
      }
    });

    return expense;
  });
}

/** Approve the pending micro-investment recommendation (records confirmation only — funds already earmarked). */
export async function approveInvestmentPlan(userId: string, amount: number) {
  const log = await prisma.automationLog.create({
    data: {
      userId,
      type: 'INVESTMENT_RECOMMENDATION',
      title: 'Investment Allocation Approved',
      amount,
      reason: `Allocated ₹${amount.toLocaleString('en-IN')} across Liquid Fund (40%), Index Fund (30%), Flexi RD (20%), and Digital Gold (10%) on your simulated ledger.`,
      canUndo: false,
      undone: false
    }
  });
  return log;
}

/** Top up the tax reserve manually: move money from spendable into the tax account. */
export async function reserveAdditionalTax(userId: string, additional: number) {
  if (!Number.isInteger(additional) || additional <= 0) throw badRequest('Additional reserve must be a positive whole rupee');
  return prisma.$transaction(async (tx) => {
    const accounts = await getOrCreateAccounts(tx, userId);
    const spendable = await tx.ledgerAccount.findUniqueOrThrow({ where: { id: accounts.SPENDABLE } });
    const allowable = Math.min(additional, spendable.balance);
    if (allowable <= 0) throw badRequest('No spendable balance available to reserve');

    await post(tx, userId, accounts.SPENDABLE, allowable, 'DEBIT', 'Manual tax reserve top-up');
    await post(tx, userId, accounts.TAX, allowable, 'CREDIT', 'Manual tax reserve top-up');

    const profile = await tx.taxProfile.findUniqueOrThrow({ where: { userId } });
    return tx.taxProfile.update({
      where: { userId },
      data: {
        taxAlreadyReserved: { increment: allowable },
        readinessPercentage: Math.min(100, profile.readinessPercentage + Math.round(allowable / 50))
      }
    });
  });
}