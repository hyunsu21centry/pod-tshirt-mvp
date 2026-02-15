export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  return res.json();
}
