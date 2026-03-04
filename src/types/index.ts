export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'investment' | 'crypto' | 'retirement' | 'credit';
  balance: number;
  currency: string;
  institution: string;
  lastUpdated: Date;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description: string;
  date: Date;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  color: string;
}

export interface NetWorthHistory {
  date: string;
  value: number;
}

export interface AssetAllocation {
  name: string;
  value: number;
  color: string;
}
