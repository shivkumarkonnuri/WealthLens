import { Search, Book, MessageCircle, Mail, Phone, ExternalLink, ChevronRight, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'How do I connect my bank accounts?',
    answer: 'Go to Accounts > Add Account and follow the prompts to securely connect your bank using Plaid. Your credentials are encrypted and never stored on our servers.',
  },
  {
    question: 'Is my financial data secure?',
    answer: 'Yes! We use bank-level 256-bit encryption to protect your data. We also support two-factor authentication and never sell your personal information.',
  },
  {
    question: 'How do I create a budget?',
    answer: 'Navigate to Budgets and click "Create Budget". You can set monthly limits for different spending categories and track your progress in real-time.',
  },
  {
    question: 'Can I export my financial data?',
    answer: 'Yes, go to Settings > Data & Privacy > Export Data. You can download your transactions, accounts, and reports in CSV or PDF format.',
  },
  {
    question: 'How do I set up financial goals?',
    answer: 'Go to Goals > Create Goal. Enter your target amount, deadline, and optionally link it to a savings account to track automatic progress.',
  },
  {
    question: 'What happens if I cancel my subscription?',
    answer: 'You can continue using the free tier with limited features. Your data will be retained for 30 days, after which you can export it before deletion.',
  },
];

const resources = [
  { title: 'Getting Started Guide', description: 'Learn the basics of WealthLens', icon: Book },
  { title: 'Video Tutorials', description: 'Step-by-step video guides', icon: ExternalLink },
  { title: 'API Documentation', description: 'For developers and integrations', icon: Book },
  { title: 'Community Forum', description: 'Connect with other users', icon: MessageCircle },
];

export function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Help Center</h1>
        <p className="text-slate-500 mt-1">Find answers and get support</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg shadow-sm"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map((resource, index) => (
          <button
            key={index}
            className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all text-left"
          >
            <div className="p-2 rounded-lg bg-emerald-100">
              <resource.icon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800">{resource.title}</p>
              <p className="text-sm text-slate-500">{resource.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="border border-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-slate-800 text-left">{faq.question}</span>
                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`} />
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4">
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
        <h2 className="text-xl font-bold mb-2">Need more help?</h2>
        <p className="text-emerald-100 mb-6">Our support team is here to assist you</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <MessageCircle className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Live Chat</p>
              <p className="text-sm text-emerald-100">Available 24/7</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <Mail className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Email Support</p>
              <p className="text-sm text-emerald-100">support@wealthlens.com</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <Phone className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Phone Support</p>
              <p className="text-sm text-emerald-100">1-800-WEALTH</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
