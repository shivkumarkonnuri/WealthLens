import { Plus, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';


const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
};

const budgets = [
  { category: 'Housing', budget: 1600, spent: 1500, color: '#3B82F6' },
  { category: 'Food & Dining', budget: 600, spent: 650, color: '#10B981' },
  { category: 'Transportation', budget: 400, spent: 350, color: '#F59E0B' },
  { category: 'Entertainment', budget: 200, spent: 200, color: '#EC4899' },
  { category: 'Utilities', budget: 200, spent: 180, color: '#8B5CF6' },
  { category: 'Shopping', budget: 300, spent: 300, color: '#EF4444' },
  { category: 'Healthcare', budget: 200, spent: 150, color: '#06B6D4' },
  { category: 'Personal Care', budget: 100, spent: 85, color: '#84CC16' },
];

const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
const remainingBudget = totalBudget - totalSpent;

export function Budgets() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Budgets</h1>
          <p className="text-slate-500 mt-1">Track your spending against budgets</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl text-sm font-medium text-white transition-colors shadow-lg shadow-emerald-500/25">
          <Plus className="w-4 h-4" />
          Create Budget
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Total Budget</p>
          <p className="text-3xl font-bold text-slate-800">{formatCurrency(totalBudget)}</p>
          <p className="text-sm text-slate-500 mt-2">Monthly allocation</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Total Spent</p>
          <p className="text-3xl font-bold text-slate-800">{formatCurrency(totalSpent)}</p>
          <div className="mt-2">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${totalSpent > totalBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Remaining</p>
          <p className={`text-3xl font-bold ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatCurrency(Math.abs(remainingBudget))}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {remainingBudget >= 0 ? 'Still available' : 'Over budget'}
          </p>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Budget Categories</h2>
          <span className="text-sm text-slate-500">January 2024</span>
        </div>
        
        <div className="space-y-6">
          {budgets.map((budget, index) => {
            const percentage = (budget.spent / budget.budget) * 100;
            const isOverBudget = budget.spent > budget.budget;
            const isNearLimit = percentage >= 90 && !isOverBudget;
            
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: budget.color }}
                    ></div>
                    <span className="font-medium text-slate-700">{budget.category}</span>
                    {isOverBudget && (
                      <span className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Over budget
                      </span>
                    )}
                    {isNearLimit && (
                      <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Near limit
                      </span>
                    )}
                    {!isOverBudget && !isNearLimit && budget.spent < budget.budget * 0.8 && (
                      <span className="flex items-center gap-1 text-xs text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        On track
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${isOverBudget ? 'text-red-500' : 'text-slate-800'}`}>
                      {formatCurrency(budget.spent)}
                    </span>
                    <span className="text-slate-400"> / {formatCurrency(budget.budget)}</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : ''
                    }`}
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: !isOverBudget && !isNearLimit ? budget.color : undefined
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-500">{percentage.toFixed(0)}% used</span>
                  <span className="text-xs text-slate-500">
                    {isOverBudget 
                      ? `${formatCurrency(budget.spent - budget.budget)} over` 
                      : `${formatCurrency(budget.budget - budget.spent)} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-red-800">Budget Alert</h3>
          </div>
          <p className="text-sm text-red-700 mb-3">
            You've exceeded your Food & Dining budget by $50 this month.
          </p>
          <button className="text-sm font-medium text-red-600 hover:text-red-700">
            Adjust budget →
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-emerald-800">Savings Tip</h3>
          </div>
          <p className="text-sm text-emerald-700 mb-3">
            You could save $200 more this month by reducing entertainment spending.
          </p>
          <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            View suggestions →
          </button>
        </div>
      </div>
    </div>
  );
}
