const BASE = process.env.EXPO_PUBLIC_API || "http://localhost:4000";

export async function api(path, opts={}) {
  const res = await fetch(${BASE}${path}, {
    headers: { "Content-Type": "application/json" },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}
