import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8000";

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;  // ← await params
  const pathStr = path.join("/");
  const url = `${BACKEND_URL}/${pathStr}${req.nextUrl.search}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const authHeader = req.headers.get("authorization");
  if (authHeader) headers["Authorization"] = authHeader;

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    fetchOptions.body = await req.text();
  }

  const backendRes = await fetch(url, fetchOptions);
  const data = await backendRes.text();

  return new NextResponse(data, {
    status: backendRes.status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
