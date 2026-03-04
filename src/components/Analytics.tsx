import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { netWorthHistory, monthlySpending, incomeVsExpense } from '../data/mockData';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
};

const savingsRate = [
  { month: 'Jul', rate: 32 },
  { month: 'Aug', rate: 28 },
  { month: 'Sep', rate: 35 },
  { month: 'Oct', rate: 31 },
  { month: 'Nov', rate: 25 },
  { month: 'Dec', rate: 38 },
];

const categoryTrends = [
  { month: 'Jul', Housing: 1500, Food: 600, Transport: 300, Entertainment: 180 },
  { month: 'Aug', Housing: 1500, Food: 680, Transport: 350, Entertainment: 220 },
  { month: 'Sep', Housing: 1500, Food: 550, Transport: 280, Entertainment: 150 },
  { month: 'Oct', Housing: 1500, Food: 720, Transport: 320, Entertainment: 200 },
  { month: 'Nov', Housing: 1500, Food: 800, Transport: 380, Entertainment: 250 },
  { month: 'Dec', Housing: 1500, Food: 900, Transport: 400, Entertainment: 300 },
];

export function Analytics() {
  const avgSavingsRate = savingsRate.reduce((sum, r) => sum + r.rate, 0) / savingsRate.length;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>
          <p className="text-slate-500 mt-1">Deep insights into your financial health</p>
        </div>
        <div className="flex gap-2">
          {['1M', '3M', '6M', '1Y', 'All'].map((period) => (
            <button
              key={period}
              className={`px-4 py-2 text-sm rounded-xl transition-colors ${
                period === '6M' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg. Savings Rate</p>
              <p className="text-xl font-bold text-emerald-600">{avgSavingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg. Monthly Income</p>
              <p className="text-xl font-bold text-blue-600">$6,833</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-100">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg. Monthly Expense</p>
              <p className="text-xl font-bold text-orange-600">$4,217</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Net Worth Growth</p>
              <p className="text-xl font-bold text-purple-600">+32.6%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Worth Over Time */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Net Worth Growth</h2>
            <p className="text-sm text-slate-500">Your wealth accumulation over time</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthHistory}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                  formatter={(value) => [formatCurrency(value as number), 'Net Worth']}
                />
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorNetWorth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Savings Rate</h2>
            <p className="text-sm text-slate-500">Percentage of income saved each month</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                  formatter={(value) => [`${value}%`, 'Savings Rate']}
                />
                <Bar dataKey="rate" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Categories */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Spending Breakdown</h2>
            <p className="text-sm text-slate-500">Where your money goes</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={monthlySpending}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="amount"
                >
                  {monthlySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Amount']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {monthlySpending.slice(0, 6).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-slate-600 truncate">{item.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Spending Trends by Category</h2>
            <p className="text-sm text-slate-500">How your spending changes over time</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={categoryTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                  formatter={(value) => [formatCurrency(value as number)]}
                />
                <Legend />
                <Line type="monotone" dataKey="Housing" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Food" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Transport" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Entertainment" stroke="#EC4899" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Income vs Expense Comparison */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Income vs Expenses</h2>
            <p className="text-sm text-slate-500">Monthly cash flow comparison</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-600">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-sm text-slate-600">Expenses</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeVsExpense} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                formatter={(value) => [formatCurrency(value as number)]}
              />
              <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#F43F5E" radius={[6, 6, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-emerald-800">Strong Savings</h3>
          </div>
          <p className="text-sm text-emerald-700">Your savings rate is above the recommended 20%. Keep it up!</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-amber-800">Food Spending</h3>
          </div>
          <p className="text-sm text-amber-700">Your food expenses increased by 15% this month. Consider meal planning.</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-blue-800">Net Worth Milestone</h3>
          </div>
          <p className="text-sm text-blue-700">You're on track to reach $350k net worth by Q2 2024!</p>
        </div>
      </div>
    </div>
  );
}
