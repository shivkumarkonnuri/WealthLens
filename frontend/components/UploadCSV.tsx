"use client";

import { useState } from "react";

const BASE_URL = "http://127.0.0.1:8000";

export default function UploadCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BASE_URL}/transactions/upload-csv`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setMessage(`Uploaded ${data.rows_inserted} transactions`);
    } catch (err) {
      setMessage("Upload failed");
    }
  };

  return (
    <div className="bg-[#121826] border border-[#1e293b] rounded-xl p-8 mt-6">
      <h2 className="text-lg font-semibold mb-6 text-white">
        Upload Transactions
      </h2>

      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2 text-sm"
        />

        <button
          onClick={handleUpload}
          className="bg-indigo-600 hover:bg-indigo-500 transition px-5 py-2 rounded-lg text-white font-medium"
        >
          Upload
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-green-400">{message}</p>}
    </div>
  );
}
