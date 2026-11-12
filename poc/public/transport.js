// 개발용 화면이 Node 서버 API를 부른다.
export const runtime = "server";

export async function request(path, body, role) {
  const r = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", "X-Role": role },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

export const iconUrl = (i) => (i.file ? `/ds/icons/${i.file}` : `/api/icons/${encodeURIComponent(i.name)}`);
export const tokensStyle = () => `<link rel="stylesheet" href="/api/tokens.css">`;
export const docsUrl = (key) => `/ds/${key ? `#${key}` : ""}`;
