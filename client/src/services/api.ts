import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

export const apiOrigin = baseURL.replace(/\/api\/v1\/?$/, "");

export const api = axios.create({ baseURL, withCredentials: true });

// Appels publics (réservation, portail patient) : ni session cabinet, ni rafraîchissement de token.
export const publicApi = axios.create({ baseURL });

const SCOPE_KEY = "scopeTenantId";
export const getScopeTenant = () => localStorage.getItem(SCOPE_KEY) ?? "";
export function setScopeTenant(id: string) {
  if (id) localStorage.setItem(SCOPE_KEY, id);
  else localStorage.removeItem(SCOPE_KEY);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Super admin : toutes les requêtes ciblent le cabinet choisi dans la barre du haut.
  const scope = getScopeTenant();
  if (scope && !config.url?.startsWith("/tenants") && !config.url?.startsWith("/auth")) {
    config.params = { tenantId: scope, ...config.params };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original?._retry && !["/auth/login", "/auth/register", "/auth/refresh-token"].includes(original?.url ?? "")) {
      original._retry = true;
      const { data } = await api.post("/auth/refresh-token");
      localStorage.setItem("accessToken", data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);

export async function downloadFile(client: typeof api, url: string, filename: string, token?: string) {
  const { data } = await client.get(url, { responseType: "blob", headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  const href = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}
