import type { Lot, Sale, SKU, Store } from "@/lib/mock-data";
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

export type ApiSkuDTO = {
  id: number;
  code: string;
  name: string;
  category: string | null;
  hsn: string | null;
  gst: number | null;
  unit: string | null;
  active: boolean | null;
  basePrice: number;
};

function mapApiSkuToSku(dto: ApiSkuDTO): SKU {
  return {
    id: String(dto.id),
    code: dto.code,
    name: dto.name,
    category: dto.category ?? "",
    hsn: dto.hsn ?? "",
    gst: dto.gst ?? 0,
    unit: dto.unit ?? "unit",
    active: dto.active ?? true,
    basePrice: Number(dto.basePrice ?? 0),
  };
}

export async function fetchSkus(token: string): Promise<SKU[]> {
  const res = await fetch(
    requestUrl("/api/skus?size=500&sort=id,desc"),
    apiFetchInit({
      headers: { Authorization: `Bearer ${token}` },
    }),
  );
  if (!res.ok) {
    throw new Error(`SKUs request failed (${res.status})`);
  }
  const list = (await res.json()) as ApiSkuDTO[];
  return list.map(mapApiSkuToSku);
}

export async function createSkuApi(
  token: string,
  payload: {
    code: string;
    name: string;
    category: string;
    hsn: string;
    gst: number;
    unit: string;
    basePrice: number;
  },
): Promise<SKU> {
  const res = await fetch(
    requestUrl("/api/skus"),
    apiFetchInit({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...payload,
        active: true,
      }),
    }),
  );
  if (!res.ok) {
    throw new Error((await res.text()) || `Create SKU failed (${res.status})`);
  }
  return mapApiSkuToSku((await res.json()) as ApiSkuDTO);
}

export async function updateSkuApi(
  token: string,
  sku: SKU,
): Promise<SKU> {
  const res = await fetch(
    requestUrl(`/api/skus/${encodeURIComponent(sku.id)}`),
    apiFetchInit({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: Number(sku.id),
        code: sku.code,
        name: sku.name,
        category: sku.category,
        hsn: sku.hsn,
        gst: sku.gst,
        unit: sku.unit,
        active: sku.active,
        basePrice: sku.basePrice,
      }),
    }),
  );
  if (!res.ok) {
    throw new Error((await res.text()) || `Update SKU failed (${res.status})`);
  }
  return mapApiSkuToSku((await res.json()) as ApiSkuDTO);
}

export type ApiInventoryLotDTO = {
  id: number;
  qty: number;
  remaining: number;
  costPrice: number;
  sellPrice: number;
  purchaseDate: string;
  expiryDate: string;
  supplier: string | null;
  invoiceNo: string | null;
  sku: ApiSkuDTO;
  store: ApiStoreDTO;
};

function mapApiInventoryLotToLot(dto: ApiInventoryLotDTO): Lot {
  return {
    id: String(dto.id),
    skuId: String(dto.sku.id),
    skuCode: dto.sku.code,
    storeId: String(dto.store.id),
    qty: dto.qty,
    remaining: dto.remaining,
    costPrice: Number(dto.costPrice),
    sellPrice: Number(dto.sellPrice),
    purchaseDate: dto.purchaseDate,
    expiryDate: dto.expiryDate,
    supplier: dto.supplier ?? "",
    invoiceNo: dto.invoiceNo ?? "",
  };
}

export async function fetchInventoryLots(token: string): Promise<Lot[]> {
  const res = await fetch(
    requestUrl("/api/inventory-lots?size=2000&sort=id,desc"),
    apiFetchInit({
      headers: { Authorization: `Bearer ${token}` },
    }),
  );
  if (!res.ok) {
    throw new Error(`Inventory lots request failed (${res.status})`);
  }
  const list = (await res.json()) as ApiInventoryLotDTO[];
  return list.map(mapApiInventoryLotToLot);
}

export async function createInventoryLotApi(
  token: string,
  payload: {
    qty: number;
    remaining: number;
    costPrice: number;
    sellPrice: number;
    purchaseDate: string;
    expiryDate: string;
    supplier: string;
    invoiceNo: string;
    skuId: number;
    storeId: number;
  },
): Promise<Lot> {
  const res = await fetch(
    requestUrl("/api/inventory-lots"),
    apiFetchInit({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        qty: payload.qty,
        remaining: payload.remaining,
        costPrice: payload.costPrice,
        sellPrice: payload.sellPrice,
        purchaseDate: payload.purchaseDate,
        expiryDate: payload.expiryDate,
        supplier: payload.supplier,
        invoiceNo: payload.invoiceNo,
        sku: { id: payload.skuId },
        store: { id: payload.storeId },
      }),
    }),
  );
  if (!res.ok) {
    throw new Error((await res.text()) || `Create inventory lot failed (${res.status})`);
  }
  return mapApiInventoryLotToLot((await res.json()) as ApiInventoryLotDTO);
}

export async function updateInventoryLotApi(
  token: string,
  lot: Lot,
): Promise<Lot> {
  const res = await fetch(
    requestUrl(`/api/inventory-lots/${encodeURIComponent(lot.id)}`),
    apiFetchInit({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: Number(lot.id),
        qty: lot.qty,
        remaining: lot.remaining,
        costPrice: lot.costPrice,
        sellPrice: lot.sellPrice,
        purchaseDate: lot.purchaseDate,
        expiryDate: lot.expiryDate,
        supplier: lot.supplier,
        invoiceNo: lot.invoiceNo,
        sku: { id: Number(lot.skuId) },
        store: { id: Number(lot.storeId) },
      }),
    }),
  );
  if (!res.ok) {
    throw new Error((await res.text()) || `Update inventory lot failed (${res.status})`);
  }
  return mapApiInventoryLotToLot((await res.json()) as ApiInventoryLotDTO);
}

export type ApiSaleDTO = {
  id: number;
  billNo: string;
  date: string;
  total: number;
  gst: number;
  payment: "CASH" | "UPI" | "CARD";
  store: ApiStoreDTO;
};

export type ApiSaleLineDTO = {
  id: number;
  qty: number;
  price: number;
  sale: ApiSaleDTO;
  sku: ApiSkuDTO;
};

function mapApiSaleToSale(dto: ApiSaleDTO): Sale {
  return {
    id: String(dto.id),
    billNo: dto.billNo,
    storeId: String(dto.store.id),
    date: dto.date,
    items: [],
    total: Number(dto.total),
    gst: Number(dto.gst),
    payment: dto.payment.toLowerCase() as Sale["payment"],
  };
}

export async function fetchSales(token: string): Promise<Sale[]> {
  const res = await fetch(
    requestUrl("/api/sales?size=1000&sort=id,desc"),
    apiFetchInit({
      headers: { Authorization: `Bearer ${token}` },
    }),
  );
  if (!res.ok) {
    throw new Error(`Sales request failed (${res.status})`);
  }
  const list = (await res.json()) as ApiSaleDTO[];
  return list.map(mapApiSaleToSale);
}

export async function fetchSaleLines(token: string): Promise<ApiSaleLineDTO[]> {
  const res = await fetch(
    requestUrl("/api/sale-lines?size=5000&sort=id,desc"),
    apiFetchInit({
      headers: { Authorization: `Bearer ${token}` },
    }),
  );
  if (!res.ok) {
    throw new Error(`Sale lines request failed (${res.status})`);
  }
  return (await res.json()) as ApiSaleLineDTO[];
}

export async function createSaleApi(
  token: string,
  payload: {
    billNo: string;
    date: string;
    total: number;
    gst: number;
    payment: "CASH" | "UPI" | "CARD";
    storeId: number;
  },
): Promise<Sale> {
  const res = await fetch(
    requestUrl("/api/sales"),
    apiFetchInit({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        billNo: payload.billNo,
        date: payload.date,
        total: payload.total,
        gst: payload.gst,
        payment: payload.payment,
        store: { id: payload.storeId },
      }),
    }),
  );
  if (!res.ok) {
    throw new Error((await res.text()) || `Create sale failed (${res.status})`);
  }
  return mapApiSaleToSale((await res.json()) as ApiSaleDTO);
}

export async function createSaleLineApi(
  token: string,
  payload: {
    qty: number;
    price: number;
    saleId: number;
    skuId: number;
  },
): Promise<ApiSaleLineDTO> {
  const res = await fetch(
    requestUrl("/api/sale-lines"),
    apiFetchInit({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        qty: payload.qty,
        price: payload.price,
        sale: { id: payload.saleId },
        sku: { id: payload.skuId },
      }),
    }),
  );
  if (!res.ok) {
    throw new Error((await res.text()) || `Create sale line failed (${res.status})`);
  }
  return (await res.json()) as ApiSaleLineDTO;
}
