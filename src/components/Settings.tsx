import { User, Bell, Shield, Palette, Download, Trash2, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true,
    monthly: false,
    alerts: true,
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">Profile</h2>
        </div>
        
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            JD
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  defaultValue="John"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  defaultValue="Doe"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                defaultValue="john.doe@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
            <button className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
            { key: 'push', label: 'Push Notifications', description: 'Receive push notifications on your device' },
            { key: 'weekly', label: 'Weekly Summary', description: 'Get a weekly summary of your finances' },
            { key: 'monthly', label: 'Monthly Report', description: 'Receive detailed monthly financial reports' },
            { key: 'alerts', label: 'Budget Alerts', description: 'Get notified when you exceed budgets' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div>
                <p className="font-medium text-slate-800">{item.label}</p>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications] ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  notifications[item.key as keyof typeof notifications] ? 'translate-x-7' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">Security</h2>
        </div>
        
        <div className="space-y-3">
          {[
            { label: 'Change Password', description: 'Update your account password' },
            { label: 'Two-Factor Authentication', description: 'Add an extra layer of security' },
            { label: 'Connected Devices', description: 'Manage devices with access to your account' },
            { label: 'Login History', description: 'View recent login activity' },
          ].map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="text-left">
                <p className="font-medium text-slate-800">{item.label}</p>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Currency</p>
              <p className="text-sm text-slate-500">Select your default currency</p>
            </div>
            <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>INR (₹)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Language</p>
              <p className="text-sm text-slate-500">Select your preferred language</p>
            </div>
            <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Date Format</p>
              <p className="text-sm text-slate-500">Choose how dates are displayed</p>
            </div>
            <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <Download className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">Data & Privacy</h2>
        </div>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="text-left">
              <p className="font-medium text-slate-800">Export Data</p>
              <p className="text-sm text-slate-500">Download all your financial data</p>
            </div>
            <Download className="w-5 h-5 text-slate-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 transition-colors group">
            <div className="text-left">
              <p className="font-medium text-red-600">Delete Account</p>
              <p className="text-sm text-red-400">Permanently delete your account and all data</p>
            </div>
            <Trash2 className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
