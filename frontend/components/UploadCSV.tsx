"use client";

import { useState, useRef, DragEvent } from "react";
import { apiFetch } from "@/lib/auth";

const BASE_URL = "http://127.0.0.1:8000";

interface UploadResult {
  rows_inserted: number;
  rows_skipped: number;
  skipped_errors?: string[];
  automation_triggered_for?: string[];
}
interface Props { onSuccess?: () => void; }

export default function UploadCSV({ onSuccess }: Props) {
  const [file, setFile]         = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]     = useState<UploadResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) { setError("Only .csv files are accepted."); return; }
    setFile(f); setResult(null); setError(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError(null); setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      // apiFetch automatically attaches the Authorization header
      const res = await apiFetch(`${BASE_URL}/transactions/upload-csv`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Upload failed."); }
      else {
        setResult(data);
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        onSuccess?.();
      }
    } catch { setError("Network error — could not reach the backend."); }
    finally { setUploading(false); }
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${dragging ? "#22d3ee" : "var(--border)"}`,
      borderRadius: 13, padding: "14px 18px", marginBottom: 4, transition: "border-color .2s",
    }}>
      <p style={{ fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:10 }}>
        Upload Transactions
      </p>
      <div
        onDragOver={e=>{ e.preventDefault(); setDragging(true); }}
        onDragLeave={()=>setDragging(false)}
        onDrop={handleDrop}
        onClick={()=>inputRef.current?.click()}
        style={{
          border: `1px dashed ${dragging?"#22d3ee":"var(--border-strong)"}`,
          borderRadius:9, padding:"12px 16px", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexWrap:"wrap", gap:10,
          background: dragging ? "rgba(34,211,238,.06)" : "transparent",
          transition:"all .2s",
        }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20, color:"var(--text-muted)" }}>⬆</span>
          <div>
            <p style={{ fontSize:13, color: file ? "var(--text-primary)" : "var(--text-secondary)", margin:0 }}>
              {file ? file.name : "Drop a CSV file or click to browse"}
            </p>
            <p style={{ fontSize:11, color:"var(--text-muted)", margin:0 }}>
              {file ? `${(file.size/1024).toFixed(1)} KB` : "Required: transaction_date, amount, merchant_name, transaction_type, currency"}
            </p>
          </div>
        </div>
        <input ref={inputRef} type="file" accept=".csv" style={{ display:"none" }}
          onChange={e=>handleFile(e.target.files?.[0]??null)} />
        {file && (
          <button
            onClick={e=>{ e.stopPropagation(); handleUpload(); }}
            disabled={uploading}
            style={{
              padding:"7px 18px", borderRadius:7, fontSize:13, fontWeight:500,
              cursor: uploading?"not-allowed":"pointer",
              fontFamily:"var(--font-sans)", transition:"background .2s",
              background: uploading ? "rgba(34,211,238,.06)" : "rgba(34,211,238,.14)",
              border:"1px solid #22d3ee", color:"#22d3ee",
            }}
          >{uploading ? "Uploading…" : "Upload"}</button>
        )}
      </div>

      {result && (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:10 }}>
          <span style={{ fontSize:12, padding:"3px 10px", borderRadius:999, background:"rgba(16,185,129,.1)", color:"#10b981", border:"1px solid rgba(16,185,129,.25)" }}>
            ✓ {result.rows_inserted} rows inserted
          </span>
          {result.rows_skipped > 0 && (
            <span style={{ fontSize:12, padding:"3px 10px", borderRadius:999, background:"rgba(245,158,11,.1)", color:"#f59e0b", border:"1px solid rgba(245,158,11,.25)" }}>
              ⚠ {result.rows_skipped} rows skipped
            </span>
          )}
          {result.automation_triggered_for?.length ? (
            <span style={{ fontSize:12, padding:"3px 10px", borderRadius:999, background:"rgba(34,211,238,.08)", color:"#22d3ee", border:"1px solid rgba(34,211,238,.2)" }}>
              ◈ Processing {result.automation_triggered_for.join(", ")}
            </span>
          ) : null}
        </div>
      )}
      {error && <p style={{ marginTop:8, fontSize:12, color:"var(--red)", margin:"8px 0 0" }}>⚠ {error}</p>}
    </div>
  );
}
