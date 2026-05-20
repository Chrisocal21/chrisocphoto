const BASE = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.CLOUDFLARE_D1_DATABASE_ID}`;

async function d1Fetch(sql: string, params: (string | number | null)[] = []) {
  const res = await fetch(`${BASE}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`D1 HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json() as {
    success: boolean;
    result: Array<{ results: unknown[] }>;
    errors: Array<{ message: string }>;
  };
  if (!json.success) throw new Error(`D1: ${json.errors?.map((e) => e.message).join(', ')}`);
  return json;
}

export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = [],
): Promise<T[]> {
  const json = await d1Fetch(sql, params);
  return (json.result[0]?.results ?? []) as T[];
}

export async function d1Run(
  sql: string,
  params: (string | number | null)[] = [],
): Promise<void> {
  await d1Fetch(sql, params);
}
