type FetchOptions = {
  method?: "GET" | "POST";
  body?: any;
  headers?: Record<string, string>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

const getAdminToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_access_token");
};

export async function api(path: string, opts: FetchOptions = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    credentials: "include",
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.detail || JSON.stringify(data);
      if (detail.includes("Account disabled")) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
        }
      }
    } catch (_) {
      const text = await res.text();
      detail = text || res.statusText;
    }
    throw new Error(detail || res.statusText);
  }
  return res.json();
}

export async function adminApi(path: string, opts: FetchOptions = {}) {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    credentials: "include",
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}
