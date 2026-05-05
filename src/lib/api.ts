import type { Store } from "@/lib/mock-data";
import type { Role } from "@/lib/mock-data";

const FALLBACK_DIRECT_API = "http://localhost:8090";

/** In dev, when true, the browser calls `/api` on the Vite origin and Vite proxies to Spring (see vite.config.ts). */
const useDevProxy =
  import.meta.env.DEV &&
  (import.meta.env.VITE_API_PROXY === "true" || import.meta.env.VITE_API_PROXY === "1");

const envBase =
  typeof import.meta.env.VITE_API_BASE_URL === "string"
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
    : "";

function directApiBase(): string {
  return envBase || FALLBACK_DIRECT_API;
}

/** Absolute base URL for SSR or when not using the dev proxy. */
function serverSideBase(): string {
  return directApiBase();
}

/** Build request URL: same-origin `/api/...` in dev+proxy (browser), else full URL to Spring. */
function requestUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined" && useDevProxy) {
    return p;
  }
  const base = typeof window === "undefined" ? serverSideBase() : directApiBase();
  return `${base}${p}`;
}

/** Standard fetch options: no-store + Accept (helps avoid stale auth). */
function apiFetchInit(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  return { ...init, cache: "no-store", headers };
}

/** For UI copy: in dev+proxy, API is reached via the current origin. */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && useDevProxy) {
    return window.location.origin;
  }
  return directApiBase();
}

export type ApiStoreDTO = {
  id: number;
  code: string;
  name: string;
  city: string | null;
  agglomeration: string | null;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  owner: string | null;
  phone: string | null;
};

export type JhipsterAccount = {
  login: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  authorities: string[];
};

export function mapApiStoreToStore(dto: ApiStoreDTO): Store {
  const statusMap: Record<ApiStoreDTO["status"], Store["status"]> = {
    ACTIVE: "active",
    PENDING: "pending",
    SUSPENDED: "suspended",
  };
  return {
    id: String(dto.id),
    code: dto.code,
    name: dto.name,
    city: dto.city ?? "",
    agglomeration: dto.agglomeration ?? "",
    status: statusMap[dto.status],
    owner: dto.owner ?? "",
    phone: dto.phone ?? "",
  };
}

export function mapAuthoritiesToRole(authorities: string[] | undefined): Role {
  const list = authorities ?? [];
  if (list.includes("ROLE_ADMIN")) return "agglomerate_admin";
  return "store_admin";
}

export async function authenticate(username: string, password: string): Promise<string> {
  const res = await fetch(
    requestUrl("/api/authenticate"),
    apiFetchInit({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, rememberMe: true }),
    }),
  );
  if (!res.ok) {
    throw new Error("Invalid username or password");
  }
  const bearer = res.headers.get("Authorization");
  if (bearer?.toLowerCase().startsWith("bearer ")) {
    return bearer.slice(7).trim();
  }
  const data = (await res.json()) as { id_token?: string };
  if (data.id_token) return data.id_token;
  throw new Error("No token returned from server");
}

export async function fetchAccount(token: string): Promise<JhipsterAccount> {
  const res = await fetch(
    requestUrl("/api/account"),
    apiFetchInit({
      headers: { Authorization: `Bearer ${token}` },
    }),
  );
  if (!res.ok) {
    throw new Error("Could not load account");
  }
  return res.json() as Promise<JhipsterAccount>;
}

export async function fetchStores(token: string): Promise<Store[]> {
  const res = await fetch(
    requestUrl("/api/stores?size=500&sort=id,asc"),
    apiFetchInit({
      headers: { Authorization: `Bearer ${token}` },
    }),
  );
  if (!res.ok) {
    throw new Error(`Stores request failed (${res.status})`);
  }
  const list = (await res.json()) as ApiStoreDTO[];
  return list.map(mapApiStoreToStore);
}

export async function createStoreApi(
  token: string,
  payload: {
    code: string;
    name: string;
    city: string;
    agglomeration: string;
    owner: string;
    phone: string;
  },
): Promise<Store> {
  const res = await fetch(
    requestUrl("/api/stores"),
    apiFetchInit({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code: payload.code,
        name: payload.name,
        city: payload.city,
        agglomeration: payload.agglomeration,
        status: "PENDING",
        owner: payload.owner,
        phone: payload.phone,
      }),
    }),
  );
  if (!res.ok) {
    throw new Error((await res.text()) || `Create store failed (${res.status})`);
  }
  const dto = (await res.json()) as ApiStoreDTO;
  return mapApiStoreToStore(dto);
}

export type ApiAdminUserDTO = {
  id: number;
  login: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  authorities: string[];
};

export type UiEmployee = {
  id: string;
  name: string;
  phone: string;
  role: "store_admin" | "employee";
  login: string;
};

function mapAdminUserToEmployee(dto: ApiAdminUserDTO): UiEmployee {
  const name = [dto.firstName ?? "", dto.lastName ?? ""].join(" ").trim() || dto.login;
  return {
    id: String(dto.id),
    name,
    phone: dto.login,
    role: dto.authorities.includes("ROLE_ADMIN") ? "store_admin" : "employee",
    login: dto.login,
  };
}

export async function fetchAdminUsers(token: string): Promise<UiEmployee[]> {
  const res = await fetch(
    requestUrl("/api/admin/users?page=0&size=200&sort=id,asc"),
    apiFetchInit({
      headers: { Authorization: `Bearer ${token}` },
    }),
  );
  if (!res.ok) {
    throw new Error(`Admin users request failed (${res.status})`);
  }
  const list = (await res.json()) as ApiAdminUserDTO[];
  return list.map(mapAdminUserToEmployee);
}

export async function createAdminUserApi(
  token: string,
  payload: { name: string; phone: string; role: "store_admin" | "employee" },
): Promise<UiEmployee> {
  const cleanPhone = payload.phone.replace(/\s+/g, "");
  const cleanDigits = cleanPhone.replace(/^\+/, "");
  const first = payload.name.trim().split(/\s+/)[0] ?? "User";
  const last = payload.name.trim().split(/\s+/).slice(1).join(" ") || "Retail";
  const login = cleanDigits.slice(0, 50).toLowerCase();
  const email = `${login}@mercotrace.local`;
  const res = await fetch(
    requestUrl("/api/admin/users"),
    apiFetchInit({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        login,
        firstName: first,
        lastName: last,
        email,
        langKey: "en",
        activated: true,
        authorities: payload.role === "store_admin" ? ["ROLE_ADMIN"] : ["ROLE_USER"],
      }),
    }),
  );
  if (!res.ok) {
    throw new Error((await res.text()) || `Create employee failed (${res.status})`);
  }
  const dto = (await res.json()) as ApiAdminUserDTO;
  return mapAdminUserToEmployee(dto);
}

export async function deleteAdminUserApi(token: string, login: string): Promise<void> {
  const res = await fetch(
    requestUrl(`/api/admin/users/${encodeURIComponent(login)}`),
    apiFetchInit({
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  );
  if (!res.ok) {
    throw new Error((await res.text()) || `Delete employee failed (${res.status})`);
  }
}
