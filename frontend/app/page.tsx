"use client";

import { useEffect, useState } from "react";
import UploadCSV from "@/components/UploadCSV";

const BASE_URL = "http://127.0.0.1:8000";

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) fetchData(selectedMonth);
  }, [selectedMonth]);

  const fetchMonths = async () => {
    const res = await fetch(`${BASE_URL}/transactions/available-months`);
    const data = await res.json();

    setAvailableMonths(data);

    if (data.length > 0) setSelectedMonth(data[0]);
  };

  const fetchData = async (month: string) => {
    setLoading(true);

    const summaryRes = await fetch(
      `${BASE_URL}/transactions/generate-summary/${month}`,
      { method: "POST" }
    );

    const summaryData = await summaryRes.json();

    const aiRes = await fetch(`${BASE_URL}/transactions/generate-ai/${month}`, {
      method: "POST",
    });

    const aiData = await aiRes.json();

    setSummary(summaryData);
    setAiInsight(aiData);

    setLoading(false);
  };

  if (loading || !summary || !aiInsight) {
    return (
      <main className="min-h-screen flex items-center justify-center text-slate-300">
        Loading WealthLens...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-10 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-bold">
              WL
            </div>

            <h1 className="text-xl font-semibold tracking-wide">WealthLens</h1>
          </div>

          <div className="flex gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <input
              type="month"
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-10 py-10">
        <UploadCSV />

        {/* STATS */}

        <div className="grid md:grid-cols-3 gap-8 mt-10 mb-12">
          <StatCard
            title="Total Income"
            value={`₹ ${summary.total_income}`}
            color="text-green-400"
          />

          <StatCard
            title="Total Expense"
            value={`₹ ${summary.total_expense}`}
            color="text-red-400"
          />

          <StatCard
            title="Weekend Spend"
            value={`₹ ${summary.weekend_spend}`}
            color="text-orange-400"
          />
        </div>

        {/* RISK */}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 mb-12 text-center">
          <p className="text-sm text-slate-400 mb-4">Financial Risk Level</p>

          <div
            className={`inline-block px-8 py-3 rounded-full font-semibold text-lg
          ${
            aiInsight.risk_level === "Low"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : aiInsight.risk_level === "Medium"
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
          >
            {aiInsight.risk_level}
          </div>
        </div>

        {/* AI INSIGHT */}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-10">
          <h2 className="text-lg font-semibold mb-4">AI Financial Insight</h2>

          <p className="text-slate-300 leading-relaxed">{aiInsight.summary}</p>
        </div>

        {/* SUGGESTIONS */}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
          <h2 className="text-lg font-semibold mb-6">Actionable Suggestions</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {aiInsight.actionable_suggestions.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-6 hover:border-indigo-500/40 transition"
                >
                  <p className="font-medium text-slate-100 mb-2">
                    {item.action || item.description || item}
                  </p>

                  {item.description && (
                    <p className="text-sm text-slate-400">{item.description}</p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition">
      <p className="text-sm text-slate-400 mb-2">{title}</p>

      <p className={`text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
