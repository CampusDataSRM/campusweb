/**
 * Preview-only API pass-through (e.g. a tunnel link for the team).
 *
 * The browser calls this site at /api-proxy/* and the request is forwarded
 * server-side to API_PROXY_TARGET, so the API's CORS allow-list doesn't need
 * the preview origin. Only the headers the API reads are forwarded - never
 * cookies: forwarding the browser's cookies (our session cookie plus whatever
 * else lives on localhost) pushed requests past the API's 4 KB header limit
 * (HTTP 431). Returns 404 unless API_PROXY_TARGET is set.
 */

import type { NextRequest } from "next/server";

const FORWARD = new Set(["accept", "authorization", "content-type", "x-csrf-token", "x-net-id", "x-demo-token"]);
const DROP_RESPONSE = new Set(["content-encoding", "content-length", "transfer-encoding", "connection", "set-cookie"]);

async function forward(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const target = process.env.API_PROXY_TARGET;
  if (!target) return new Response(null, { status: 404 });

  const { path } = await params;
  const url = `${target.replace(/\/$/, "")}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (FORWARD.has(key.toLowerCase())) headers.set(key, value);
  });

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const upstream = await fetch(url, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!DROP_RESPONSE.has(key.toLowerCase())) responseHeaders.set(key, value);
  });
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const dynamic = "force-dynamic";
