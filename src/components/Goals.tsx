import { } from 'react';
import { Plus, Target, Calendar, TrendingUp, Edit3, Trash2 } from 'lucide-react';
import { goals } from '../data/mockData';
import { format, differenceInDays } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
};

export function Goals() {
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Financial Goals</h1>
          <p className="text-slate-500 mt-1">Track and achieve your financial targets</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl text-sm font-medium text-white transition-colors shadow-lg shadow-emerald-500/25">
          <Plus className="w-4 h-4" />
          Create Goal
        </button>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-violet-200 text-sm font-medium mb-1">Overall Progress</p>
            <p className="text-4xl font-bold">{overallProgress.toFixed(1)}%</p>
            <p className="text-violet-200 mt-2">
              {formatCurrency(totalSaved)} saved of {formatCurrency(totalTarget)} total
            </p>
          </div>
          <div className="flex-1 max-w-md">
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-violet-200">
              <span>{goals.length} active goals</span>
              <span>{formatCurrency(totalTarget - totalSaved)} remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const daysRemaining = differenceInDays(goal.deadline, new Date());
          const monthlyNeeded = daysRemaining > 0 
            ? (goal.targetAmount - goal.currentAmount) / (daysRemaining / 30)
            : 0;

          return (
            <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${goal.color}15` }}
                  >
                    <Target className="w-6 h-6" style={{ color: goal.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{goal.name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(goal.deadline, 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4 text-slate-400" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-slate-800">{formatCurrency(goal.currentAmount)}</span>
                  <span className="text-sm text-slate-500">of {formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: goal.color
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Progress</p>
                  <p className="font-semibold" style={{ color: goal.color }}>{progress.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Days Left</p>
                  <p className={`font-semibold ${daysRemaining < 30 ? 'text-red-500' : 'text-slate-800'}`}>
                    {daysRemaining > 0 ? daysRemaining : 'Overdue'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Monthly</p>
                  <p className="font-semibold text-slate-800">{formatCurrency(monthlyNeeded)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-100">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Tips to Reach Your Goals Faster</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Set up automatic transfers to your savings accounts
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Review and cut unnecessary subscriptions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Consider a side income to accelerate savings
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
