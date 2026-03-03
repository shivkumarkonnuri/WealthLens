"use client";

import { useEffect, useState } from "react";

const BASE_URL = "http://127.0.0.1:8000";

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState("2026-06");
  const [summary, setSummary] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth]);

  const fetchData = async (month: string) => {
    setLoading(true);

    try {
      const summaryRes = await fetch(
        `${BASE_URL}/transactions/generate-summary/${month}`,
        { method: "POST" }
      );
      const summaryData = await summaryRes.json();

      const aiRes = await fetch(
        `${BASE_URL}/transactions/generate-ai/${month}`,
        { method: "POST" }
      );
      const aiData = await aiRes.json();

      setSummary(summaryData);
      setAiInsight(aiData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    setLoading(false);
  };

  if (loading || !summary || !aiInsight) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Loading WealthLens...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-lg shadow">
              WL
            </div>
            <h1 className="text-2xl font-bold text-gray-800">WealthLens</h1>
          </div>

          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="
              border border-gray-300
              rounded-xl
              px-4 py-2
              bg-white
              text-gray-800
              shadow-sm
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              cursor-pointer
            "
          >
            <option value="2026-03">March 2026</option>
            <option value="2026-04">April 2026</option>
            <option value="2026-05">May 2026</option>
            <option value="2026-06">June 2026</option>
          </select>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-10">
        {/* Financial Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card
            title="Total Income"
            value={`₹ ${summary.total_income}`}
            color="text-green-600"
          />
          <Card
            title="Total Expense"
            value={`₹ ${summary.total_expense}`}
            color="text-red-600"
          />
          <Card
            title="Weekend Spend"
            value={`₹ ${summary.weekend_spend}`}
            color="text-orange-500"
          />
        </div>

        {/* Risk Section */}
        <div
          className={`rounded-2xl p-10 mb-12 text-center border ${
            aiInsight.risk_level === "Low"
              ? "bg-green-100 text-green-800 border-green-300"
              : aiInsight.risk_level === "Medium"
              ? "bg-orange-100 text-orange-800 border-orange-300"
              : "bg-red-100 text-red-800 border-red-300"
          }`}
        >
          <h2 className="text-lg font-semibold mb-4 uppercase tracking-wide">
            Risk Assessment
          </h2>
          <p className="text-5xl font-extrabold">{aiInsight.risk_level}</p>
        </div>

        {/* AI Insight */}
        <div className="bg-white rounded-2xl shadow p-8 mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            AI Financial Insight
          </h2>
          <p className="text-gray-600 leading-relaxed">{aiInsight.summary}</p>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Actionable Suggestions
          </h2>
          <ul className="space-y-3">
            {aiInsight.actionable_suggestions.map(
              (item: string, index: number) => (
                <li
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg text-gray-700 border border-gray-100"
                >
                  {item}
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <h3 className="text-gray-500 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
