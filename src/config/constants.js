export const ROLES = {
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin'
};

export const RECORD_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

export const PERMISSIONS = {
  viewer: {
    financialRecords: ['read'],
    dashboard: ['read']
  },
  analyst: {
    financialRecords: ['read'],
    dashboard: ['read'],
    analytics: ['read', 'export']
  },
  admin: {
    financialRecords: ['create', 'read', 'update', 'delete'],
    dashboard: ['read'],
    analytics: ['read', 'export'],
    users: ['create', 'read', 'update', 'delete']
  }
};

export const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Education', 'Other']
};