export interface Transaction {
  id: string;
  date: string;
  description: string;
  merchant: string;
  amount: number;
  category: string;
  originalData: Record<string, any>;
}

export interface Category {
  name: string;
  total: number;
  count: number;
  color: string;
  icon: string;
  budget: number;
}

export interface BudgetAlert {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  severity: 'warning' | 'danger';
}