export interface User {
  id: string;
  email: string;
  displayName: string | null;
  locale: string;
  currency: string;
  tier: 'free' | 'premium';
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  month: string;
  label: string | null;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  nameRu: string | null;
  icon: string | null;
  type: 'fixed' | 'variable';
  isDefault: boolean;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  category?: Category;
  currency: string;
  description: string | null;
  expenseDate: string;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  categories: {
    categoryId: string;
    categoryName: string;
    total: number;
    percentage: number;
  }[];
  totalFixed: number;
  totalVariable: number;
  grandTotal: number;
}

export interface CostOfLiving {
  monthly: number;
  daily: number;
  hourly: number;
  currency: string;
  disposableIncome: number;
}

export interface Insight {
  type: string;
  title: string;
  description: string;
  percentage: number;
  amount: number;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currency: string;
  savedAmount: number;
  deadline: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProjection {
  monthsRemaining: number;
  monthlyContribution: number;
}

export interface BreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryNameRu: string | null;
  total: number;
  percentage: number;
}
