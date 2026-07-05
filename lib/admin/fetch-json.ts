/** Parse admin API responses without throwing on empty or non-JSON bodies. */
export async function readApiJson<T = Record<string, unknown>>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Server returned an invalid response (${res.status})`);
  }
}
