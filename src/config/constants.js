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
  // Viewer: dashboard summary only — cannot browse individual records
  viewer: {
    dashboard: ['read']
  },
  // Analyst: can read records + access advanced analytics
  analyst: {
    financialRecords: ['read'],
    dashboard: ['read'],
    analytics: ['read', 'export']
  },
  // Admin: full access to everything
  admin: {
    financialRecords: ['create', 'read', 'update', 'delete'],
    dashboard: ['read'],
    analytics: ['read', 'export'],
    users: ['create', 'read', 'update', 'delete']
  }
};

export const CATEGORIES = {
  income: ['salary', 'freelance', 'investment', 'business', 'gift', 'other'],
  expense: ['food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'education', 'other']
};