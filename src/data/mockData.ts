import { Account, Transaction, Goal, NetWorthHistory, AssetAllocation } from '../types';

export const accounts: Account[] = [
  {
    id: '1',
    name: 'Main Checking',
    type: 'bank',
    balance: 12450.32,
    currency: 'USD',
    institution: 'Chase Bank',
    lastUpdated: new Date(),
    color: '#3B82F6'
  },
  {
    id: '2',
    name: 'High Yield Savings',
    type: 'bank',
    balance: 45000.00,
    currency: 'USD',
    institution: 'Marcus',
    lastUpdated: new Date(),
    color: '#10B981'
  },
  {
    id: '3',
    name: 'Investment Portfolio',
    type: 'investment',
    balance: 156780.45,
    currency: 'USD',
    institution: 'Fidelity',
    lastUpdated: new Date(),
    color: '#8B5CF6'
  },
  {
    id: '4',
    name: '401(k)',
    type: 'retirement',
    balance: 89500.00,
    currency: 'USD',
    institution: 'Vanguard',
    lastUpdated: new Date(),
    color: '#F59E0B'
  },
  {
    id: '5',
    name: 'Crypto Wallet',
    type: 'crypto',
    balance: 23450.78,
    currency: 'USD',
    institution: 'Coinbase',
    lastUpdated: new Date(),
    color: '#EC4899'
  },
  {
    id: '6',
    name: 'Credit Card',
    type: 'credit',
    balance: -2340.50,
    currency: 'USD',
    institution: 'Amex',
    lastUpdated: new Date(),
    color: '#EF4444'
  }
];

export const transactions: Transaction[] = [
  { id: '1', accountId: '1', amount: 5200, type: 'income', category: 'Salary', description: 'Monthly Salary', date: new Date('2024-01-15') },
  { id: '2', accountId: '1', amount: -1500, type: 'expense', category: 'Rent', description: 'Monthly Rent', date: new Date('2024-01-01') },
  { id: '3', accountId: '1', amount: -85.50, type: 'expense', category: 'Groceries', description: 'Whole Foods', date: new Date('2024-01-14') },
  { id: '4', accountId: '1', amount: -120, type: 'expense', category: 'Utilities', description: 'Electric Bill', date: new Date('2024-01-10') },
  { id: '5', accountId: '1', amount: -45.99, type: 'expense', category: 'Subscriptions', description: 'Netflix + Spotify', date: new Date('2024-01-05') },
  { id: '6', accountId: '3', amount: 2500, type: 'income', category: 'Dividends', description: 'Q4 Dividends', date: new Date('2024-01-12') },
  { id: '7', accountId: '1', amount: -250, type: 'expense', category: 'Dining', description: 'Restaurant Week', date: new Date('2024-01-13') },
  { id: '8', accountId: '5', amount: 1200, type: 'income', category: 'Crypto Gains', description: 'BTC Appreciation', date: new Date('2024-01-11') },
];

export const goals: Goal[] = [
  { id: '1', name: 'Emergency Fund', targetAmount: 50000, currentAmount: 45000, deadline: new Date('2024-06-01'), color: '#10B981' },
  { id: '2', name: 'House Down Payment', targetAmount: 100000, currentAmount: 45000, deadline: new Date('2025-12-01'), color: '#3B82F6' },
  { id: '3', name: 'Vacation Fund', targetAmount: 8000, currentAmount: 3200, deadline: new Date('2024-08-01'), color: '#F59E0B' },
  { id: '4', name: 'New Car', targetAmount: 35000, currentAmount: 12000, deadline: new Date('2025-06-01'), color: '#8B5CF6' },
];

export const netWorthHistory: NetWorthHistory[] = [
  { date: 'Jan 2023', value: 245000 },
  { date: 'Feb 2023', value: 252000 },
  { date: 'Mar 2023', value: 248000 },
  { date: 'Apr 2023', value: 261000 },
  { date: 'May 2023', value: 275000 },
  { date: 'Jun 2023', value: 282000 },
  { date: 'Jul 2023', value: 295000 },
  { date: 'Aug 2023', value: 288000 },
  { date: 'Sep 2023', value: 302000 },
  { date: 'Oct 2023', value: 310000 },
  { date: 'Nov 2023', value: 318000 },
  { date: 'Dec 2023', value: 324841 },
];

export const assetAllocation: AssetAllocation[] = [
  { name: 'Stocks', value: 45, color: '#3B82F6' },
  { name: 'Bonds', value: 15, color: '#10B981' },
  { name: 'Real Estate', value: 20, color: '#F59E0B' },
  { name: 'Crypto', value: 10, color: '#EC4899' },
  { name: 'Cash', value: 10, color: '#6B7280' },
];

export const monthlySpending = [
  { category: 'Housing', amount: 1500, color: '#3B82F6' },
  { category: 'Food', amount: 650, color: '#10B981' },
  { category: 'Transportation', amount: 350, color: '#F59E0B' },
  { category: 'Entertainment', amount: 200, color: '#EC4899' },
  { category: 'Utilities', amount: 180, color: '#8B5CF6' },
  { category: 'Shopping', amount: 300, color: '#EF4444' },
  { category: 'Healthcare', amount: 150, color: '#06B6D4' },
  { category: 'Other', amount: 170, color: '#6B7280' },
];

export const incomeVsExpense = [
  { month: 'Jul', income: 6200, expense: 3800 },
  { month: 'Aug', income: 6500, expense: 4100 },
  { month: 'Sep', income: 6200, expense: 3600 },
  { month: 'Oct', income: 7100, expense: 4200 },
  { month: 'Nov', income: 6800, expense: 4500 },
  { month: 'Dec', income: 8200, expense: 5100 },
];
