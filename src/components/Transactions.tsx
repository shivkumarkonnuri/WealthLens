import { useState } from 'react';
import { Search, Download, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Calendar, ChevronDown } from 'lucide-react';
import { transactions, accounts } from '../data/mockData';
import { format } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(value));
};

const allTransactions = [
  ...transactions,
  { id: '9', accountId: '1', amount: -65.00, type: 'expense' as const, category: 'Transportation', description: 'Uber rides', date: new Date('2024-01-08') },
  { id: '10', accountId: '1', amount: -320.00, type: 'expense' as const, category: 'Shopping', description: 'Amazon Purchase', date: new Date('2024-01-07') },
  { id: '11', accountId: '2', amount: 500.00, type: 'income' as const, category: 'Transfer', description: 'Savings Transfer', date: new Date('2024-01-06') },
  { id: '12', accountId: '1', amount: -42.50, type: 'expense' as const, category: 'Food', description: 'DoorDash', date: new Date('2024-01-05') },
  { id: '13', accountId: '1', amount: -89.99, type: 'expense' as const, category: 'Subscriptions', description: 'Adobe Creative Cloud', date: new Date('2024-01-04') },
  { id: '14', accountId: '3', amount: 1500.00, type: 'income' as const, category: 'Investment', description: 'Stock Dividend', date: new Date('2024-01-03') },
  { id: '15', accountId: '1', amount: -28.00, type: 'expense' as const, category: 'Entertainment', description: 'Movie tickets', date: new Date('2024-01-02') },
].sort((a, b) => b.date.getTime() - a.date.getTime());

const categories = ['All', 'Income', 'Expense', 'Transfer'];
const categoryColors: Record<string, string> = {
  'Salary': '#10B981',
  'Rent': '#EF4444',
  'Groceries': '#F59E0B',
  'Utilities': '#8B5CF6',
  'Subscriptions': '#EC4899',
  'Dividends': '#3B82F6',
  'Dining': '#F97316',
  'Crypto Gains': '#14B8A6',
  'Transportation': '#6366F1',
  'Shopping': '#F43F5E',
  'Transfer': '#06B6D4',
  'Food': '#84CC16',
  'Investment': '#8B5CF6',
  'Entertainment': '#A855F7',
};

export function Transactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTransactions = allTransactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                            (selectedCategory === 'Income' && t.type === 'income') ||
                            (selectedCategory === 'Expense' && t.type === 'expense') ||
                            (selectedCategory === 'Transfer' && t.type === 'transfer');
    return matchesSearch && matchesCategory;
  });

  const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = Math.abs(allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Transactions</h1>
          <p className="text-slate-500 mt-1">View and manage all your transactions</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl text-sm font-medium text-white transition-colors shadow-lg shadow-emerald-500/25">
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Income</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-100">
              <ArrowDownRight className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Expenses</p>
              <p className="text-xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100">
              <ArrowLeftRight className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Net Cash Flow</p>
              <p className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {totalIncome - totalExpense >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalIncome - totalExpense))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
            <Calendar className="w-4 h-4" />
            This Month
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Transaction</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Account</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => {
                const account = accounts.find(a => a.id === transaction.accountId);
                return (
                  <tr 
                    key={transaction.id} 
                    className={`hover:bg-slate-50 transition-colors ${index !== filteredTransactions.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{transaction.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${categoryColors[transaction.category] || '#6B7280'}15`,
                          color: categoryColors[transaction.category] || '#6B7280'
                        }}
                      >
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{account?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">{format(transaction.date, 'MMM d, yyyy')}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">Showing {filteredTransactions.length} transactions</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium text-white transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
