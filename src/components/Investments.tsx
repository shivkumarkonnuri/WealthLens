import { TrendingUp, TrendingDown, PieChart as PieChartIcon, RefreshCw, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
};

const portfolioValue = 246280.45;
const portfolioChange = 12450.32;
const portfolioChangePercent = 5.32;

const holdings = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: 50, price: 185.92, value: 9296, change: 2.3, color: '#3B82F6' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 25, price: 141.80, value: 3545, change: -0.8, color: '#10B981' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 40, price: 378.91, value: 15156.40, change: 1.5, color: '#8B5CF6' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', shares: 30, price: 178.25, value: 5347.50, change: 3.2, color: '#F59E0B' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 20, price: 495.22, value: 9904.40, change: 5.8, color: '#EC4899' },
  { symbol: 'TSLA', name: 'Tesla Inc.', shares: 35, price: 248.50, value: 8697.50, change: -2.1, color: '#EF4444' },
];

const assetClasses = [
  { name: 'US Stocks', value: 45, amount: 110826, color: '#3B82F6' },
  { name: 'International', value: 15, amount: 36942, color: '#10B981' },
  { name: 'Bonds', value: 20, amount: 49256, color: '#F59E0B' },
  { name: 'Real Estate', value: 12, amount: 29554, color: '#8B5CF6' },
  { name: 'Crypto', value: 8, amount: 19702, color: '#EC4899' },
];

const performanceHistory = [
  { date: 'Jan', value: 215000 },
  { date: 'Feb', value: 218500 },
  { date: 'Mar', value: 225000 },
  { date: 'Apr', value: 221000 },
  { date: 'May', value: 232000 },
  { date: 'Jun', value: 228500 },
  { date: 'Jul', value: 235000 },
  { date: 'Aug', value: 238000 },
  { date: 'Sep', value: 241500 },
  { date: 'Oct', value: 239000 },
  { date: 'Nov', value: 243000 },
  { date: 'Dec', value: 246280 },
];

export function Investments() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Investments</h1>
          <p className="text-slate-500 mt-1">Track your investment portfolio</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl text-sm font-medium text-white transition-colors shadow-lg shadow-emerald-500/25">
            + Add Investment
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Total Portfolio Value</p>
            <p className="text-4xl font-bold">{formatCurrency(portfolioValue)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`flex items-center gap-1 text-sm ${portfolioChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {portfolioChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {portfolioChange >= 0 ? '+' : ''}{formatCurrency(portfolioChange)} ({portfolioChangePercent}%)
              </span>
              <span className="text-slate-500 text-sm">Today</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-slate-400 text-sm">Total Gain</p>
              <p className="text-xl font-semibold text-emerald-400">+{formatCurrency(31280)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Annual Return</p>
              <p className="text-xl font-semibold text-emerald-400">+14.5%</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Dividends YTD</p>
              <p className="text-xl font-semibold">{formatCurrency(3240)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Portfolio Performance</h2>
              <p className="text-sm text-slate-500">Growth over time</p>
            </div>
            <div className="flex gap-2">
              {['1M', '3M', '6M', '1Y', 'All'].map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    period === '1Y' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceHistory}>
                <defs>
                  <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                  formatter={(value) => [formatCurrency(value as number), 'Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPerformance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-800">Asset Allocation</h2>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetClasses}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {assetClasses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`]}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {assetClasses.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Holdings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Asset</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Shares</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Price</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Value</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Change</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding, index) => (
                <tr 
                  key={holding.symbol} 
                  className={`hover:bg-slate-50 transition-colors ${index !== holdings.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                        style={{ backgroundColor: holding.color }}
                      >
                        {holding.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{holding.symbol}</p>
                        <p className="text-sm text-slate-500">{holding.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-slate-800">{holding.shares}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-slate-800">${holding.price.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-slate-800">{formatCurrency(holding.value)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`flex items-center justify-end gap-1 font-medium ${holding.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {holding.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {holding.change >= 0 ? '+' : ''}{holding.change}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
