import mongoose from 'mongoose';
import FinancialRecord from '../models/FinancialRecord.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Helper function to get month summary
// userId is optional — omit to get company-wide totals
const getMonthSummary = async (startDate, endDate, userId = null) => {
  const matchStage = {
    isDeleted: false,
    date: { $gte: startDate, $lte: endDate }
  };
  if (userId) matchStage.user = new mongoose.Types.ObjectId(userId);

  const result = await FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const income = result.find(r => r._id === 'income')?.total || 0;
  const expenses = result.find(r => r._id === 'expense')?.total || 0;

  return {
    income,
    expenses,
    savings: income - expenses,
    incomeCount: result.find(r => r._id === 'income')?.count || 0,
    expenseCount: result.find(r => r._id === 'expense')?.count || 0
  };
};

// Helper function to calculate percentage change
const calculateChange = (oldValue, newValue) => {
  if (oldValue === 0) {
    return newValue > 0 ? { value: 100, direction: 'up' } : { value: 0, direction: 'same' };
  }

  const percentChange = ((newValue - oldValue) / oldValue) * 100;
  return {
    value: Math.abs(percentChange).toFixed(2),
    direction: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'same'
  };
};

// Helper function to format monthly trends
const formatMonthlyTrends = (trends) => {
  const formatted = {};

  trends.forEach(trend => {
    const key = `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`;
    if (!formatted[key]) {
      formatted[key] = { month: key, income: 0, expense: 0 };
    }
    formatted[key][trend._id.type] = trend.total;
  });

  return Object.values(formatted).map(item => ({
    ...item,
    net: item.income - item.expense,
    savingsRate: item.income > 0 ? (((item.income - item.expense) / item.income) * 100).toFixed(2) : 0
  }));
};

// Get dashboard summary
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const now = new Date();
  const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const start = startDate ? new Date(startDate) : defaultStartDate;
  const end = endDate ? new Date(endDate) : defaultEndDate;

  // Company-wide dashboard: no user filter.
  // Admin can optionally drill into a specific user's data via ?userId=
  const filterUserId = req.user.role === 'admin' && req.query.userId
    ? req.query.userId
    : null;

  const matchStage = { isDeleted: false };
  if (filterUserId) matchStage.user = new mongoose.Types.ObjectId(filterUserId);

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = start;
    if (endDate) matchStage.date.$lte = end;
  }

  const summary = await FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: '$type',
              total: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          }
        ],
        byCategory: [
          {
            $group: {
              _id: { type: '$type', category: '$category' },
              total: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { total: -1 } }
        ],
        recentTransactions: [
          { $sort: { date: -1 } },
          { $limit: 10 },
          {
            $project: {
              amount: 1,
              type: 1,
              category: 1,
              description: 1,
              date: 1
            }
          }
        ],
        monthlyTrends: [
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                type: '$type'
              },
              total: { $sum: '$amount' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]
      }
    }
  ]);

  const totals = summary[0].totals.reduce((acc, item) => {
    acc[item._id] = { total: item.total, count: item.count };
    return acc;
  }, {});

  const income = totals.income?.total || 0;
  const expenses = totals.expense?.total || 0;

  const categoryBreakdown = {
    income: summary[0].byCategory
      .filter(c => c._id.type === 'income')
      .map(c => ({ category: c._id.category, total: c.total, count: c.count })),
    expense: summary[0].byCategory
      .filter(c => c._id.type === 'expense')
      .map(c => ({ category: c._id.category, total: c.total, count: c.count }))
  };

  const monthlyTrends = formatMonthlyTrends(summary[0].monthlyTrends);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        netBalance: income - expenses,
        savingsRate: income > 0 ? (((income - expenses) / income) * 100).toFixed(2) : 0,
        transactionCount: {
          income: totals.income?.count || 0,
          expense: totals.expense?.count || 0,
          total: (totals.income?.count || 0) + (totals.expense?.count || 0)
        }
      },
      categoryBreakdown,
      recentTransactions: summary[0].recentTransactions,
      monthlyTrends,
      period: { start, end }
    }
  });
});

// Get spending insights
export const getSpendingInsights = asyncHandler(async (req, res) => {
  // Company-wide insights. Admin can filter by ?userId=
  const filterUserId = req.user.role === 'admin' && req.query.userId
    ? req.query.userId
    : null;

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const expenseQuery = {
    type: 'expense',
    isDeleted: false,
    date: { $gte: ninetyDaysAgo }
  };
  if (filterUserId) expenseQuery.user = filterUserId;

  const expenses = await FinancialRecord.find(expenseQuery).sort({ date: -1 });

  if (expenses.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        message: 'No expense data available for insights',
        topCategories: [],
        averages: null,
        unusualTransactions: []
      }
    });
  }

  const categoryTotals = expenses.reduce((acc, record) => {
    acc[record.category] = (acc[record.category] || 0) + record.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: ((amount / expenses.reduce((s, e) => s + e.amount, 0)) * 100).toFixed(2)
    }));

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgPerTransaction = totalExpense / expenses.length;
  const avgPerDay = totalExpense / 90;
  const avgPerWeek = avgPerDay * 7;
  const avgPerMonth = avgPerDay * 30;

  const unusualTransactions = expenses
    .filter(e => e.amount > avgPerTransaction * 2)
    .slice(0, 5)
    .map(e => ({
      id: e._id,
      amount: e.amount,
      category: e.category,
      date: e.date,
      description: e.description
    }));

  res.status(200).json({
    success: true,
    data: {
      topCategories,
      averages: {
        perTransaction: avgPerTransaction.toFixed(2),
        perDay: avgPerDay.toFixed(2),
        perWeek: avgPerWeek.toFixed(2),
        perMonth: avgPerMonth.toFixed(2)
      },
      unusualTransactions,
      totalTransactionsAnalyzed: expenses.length
    }
  });
});

// Get comparative analysis
export const getComparativeAnalysis = asyncHandler(async (req, res) => {
  // Company-wide comparison. Admin can filter by ?userId=
  const filterUserId = req.user.role === 'admin' && req.query.userId
    ? req.query.userId
    : null;

  const now = new Date();

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = now;

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [thisMonthData, lastMonthData] = await Promise.all([
    getMonthSummary(thisMonthStart, thisMonthEnd, filterUserId),
    getMonthSummary(lastMonthStart, lastMonthEnd, filterUserId)
  ]);

  const changes = {
    income: calculateChange(lastMonthData.income, thisMonthData.income),
    expenses: calculateChange(lastMonthData.expenses, thisMonthData.expenses),
    savings: calculateChange(lastMonthData.savings, thisMonthData.savings)
  };

  res.status(200).json({
    success: true,
    data: {
      currentMonth: {
        period: { start: thisMonthStart, end: thisMonthEnd },
        ...thisMonthData
      },
      previousMonth: {
        period: { start: lastMonthStart, end: lastMonthEnd },
        ...lastMonthData
      },
      changes
    }
  });
});