import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8000";

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${BACKEND_URL}/${pathStr}${req.nextUrl.search}`;

  // Build forwarded headers — start with an empty set.
  // Do NOT default to "Content-Type: application/json" here because that
  // overwrites the multipart/form-data boundary on file uploads, causing 422.
  const headers: HeadersInit = {};

  // Forward Content-Type exactly as the browser sent it (preserves multipart boundary).
  // For JSON requests the browser sets application/json; for file uploads it sets
  // multipart/form-data; boundary=...). Both must be passed through unchanged.
  const contentType = req.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  // Forward the auth token if present.
  const authHeader = req.headers.get("authorization");
  if (authHeader) headers["Authorization"] = authHeader;

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  // For non-GET requests, stream the raw body bytes through unchanged.
  // Using req.text() would corrupt binary/multipart payloads.
  // Using req.arrayBuffer() preserves all bytes exactly.
  if (req.method !== "GET" && req.method !== "HEAD") {
    fetchOptions.body = await req.arrayBuffer();
  }

  const backendRes = await fetch(url, fetchOptions);
  const data = await backendRes.arrayBuffer();

  // Forward the backend's actual Content-Type back to the browser.
  const responseContentType = backendRes.headers.get("content-type") ?? "application/json";

  return new NextResponse(data, {
    status: backendRes.status,
    headers: { "Content-Type": responseContentType },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
