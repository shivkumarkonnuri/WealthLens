import { Plus, Wallet, TrendingUp, Building, Bitcoin, CreditCard, MoreVertical, RefreshCw } from 'lucide-react';
import { accounts } from '../data/mockData';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

const getAccountIcon = (type: string) => {
  switch (type) {
    case 'bank': return Wallet;
    case 'investment': return TrendingUp;
    case 'retirement': return Building;
    case 'crypto': return Bitcoin;
    case 'credit': return CreditCard;
    default: return Wallet;
  }
};

const totalAssets = accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
const totalLiabilities = Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0));

export function Accounts() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Accounts</h1>
          <p className="text-slate-500 mt-1">Manage all your financial accounts</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Sync All
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl text-sm font-medium text-white transition-colors shadow-lg shadow-emerald-500/25">
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <p className="text-emerald-100 text-sm font-medium">Total Assets</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(totalAssets)}</p>
          <p className="text-emerald-100 text-sm mt-2">Across {accounts.filter(a => a.balance > 0).length} accounts</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 text-white">
          <p className="text-rose-100 text-sm font-medium">Total Liabilities</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(totalLiabilities)}</p>
          <p className="text-rose-100 text-sm mt-2">Across {accounts.filter(a => a.balance < 0).length} accounts</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm font-medium">Net Worth</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(totalAssets - totalLiabilities)}</p>
          <p className="text-blue-100 text-sm mt-2">+12.5% from last month</p>
        </div>
      </div>

      {/* Account Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banking */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-blue-100">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Banking</h2>
              <p className="text-sm text-slate-500">Checking & Savings</p>
            </div>
          </div>
          <div className="space-y-3">
            {accounts.filter(a => a.type === 'bank').map((account) => {
              const Icon = getAccountIcon(account.type);
              return (
                <div key={account.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${account.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: account.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{account.name}</p>
                    <p className="text-sm text-slate-500">{account.institution}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{formatCurrency(account.balance)}</p>
                  </div>
                  <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Investments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-purple-100">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Investments</h2>
              <p className="text-sm text-slate-500">Stocks, Bonds & Funds</p>
            </div>
          </div>
          <div className="space-y-3">
            {accounts.filter(a => a.type === 'investment' || a.type === 'retirement').map((account) => {
              const Icon = getAccountIcon(account.type);
              return (
                <div key={account.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${account.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: account.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{account.name}</p>
                    <p className="text-sm text-slate-500">{account.institution}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{formatCurrency(account.balance)}</p>
                    <p className="text-xs text-emerald-500">+5.2%</p>
                  </div>
                  <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Crypto */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-orange-100">
              <Bitcoin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Cryptocurrency</h2>
              <p className="text-sm text-slate-500">Digital Assets</p>
            </div>
          </div>
          <div className="space-y-3">
            {accounts.filter(a => a.type === 'crypto').map((account) => {
              const Icon = getAccountIcon(account.type);
              return (
                <div key={account.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${account.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: account.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{account.name}</p>
                    <p className="text-sm text-slate-500">{account.institution}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{formatCurrency(account.balance)}</p>
                    <p className="text-xs text-emerald-500">+12.8%</p>
                  </div>
                  <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Credit */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-red-100">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Credit Cards</h2>
              <p className="text-sm text-slate-500">Outstanding Balances</p>
            </div>
          </div>
          <div className="space-y-3">
            {accounts.filter(a => a.type === 'credit').map((account) => {
              const Icon = getAccountIcon(account.type);
              return (
                <div key={account.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${account.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: account.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{account.name}</p>
                    <p className="text-sm text-slate-500">{account.institution}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-500">{formatCurrency(account.balance)}</p>
                    <p className="text-xs text-slate-500">Due in 15 days</p>
                  </div>
                  <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
