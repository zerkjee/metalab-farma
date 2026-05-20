const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.detail || error.message || "Erro desconhecido");
  }
  return res.json();
}

export const api = {
  listings: {
    list: (params?: { page?: number; page_size?: number; status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.page_size) qs.set("page_size", String(params.page_size));
      if (params?.status) qs.set("status", params.status);
      return request(`/listings?${qs}`);
    },
    get: (id: number) => request(`/listings/${id}`),
    analyze: (id: number) =>
      request(`/listings/${id}/analyze`, { method: "POST" }),
  },
  approvals: {
    list: (params?: { status?: string; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.page) qs.set("page", String(params.page));
      return request(`/approvals?${qs}`);
    },
    approve: (id: number, reviewed_by = "admin", notes?: string) =>
      request(`/approvals/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ reviewed_by, notes }),
      }),
    reject: (id: number, reviewed_by = "admin", rejection_reason = "") =>
      request(`/approvals/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reviewed_by, rejection_reason }),
      }),
    history: (params?: { listing_id?: number; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.listing_id) qs.set("listing_id", String(params.listing_id));
      if (params?.page) qs.set("page", String(params.page));
      return request(`/approvals/history?${qs}`);
    },
  },
  health: () => request("/health"),
};
