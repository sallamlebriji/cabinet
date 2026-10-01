import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { apiError } from "../lib/format";

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!url) return;
    try {
      const response = await api.get<T>(url);
      setData(response.data);
      setError("");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    setLoading(Boolean(url));
    void reload();
  }, [reload, url]);

  return { data, loading, error, reload };
}
