// Mock data + cost engine for Mercotrace – Retail Platform prototype
export type Role = "agglomerate_admin" | "store_admin" | "employee" | "customer";

export interface Store {
  id: string;
  code: string;
  name: string;
  city: string;
  agglomeration: string;
  status: "active" | "pending" | "suspended";
  owner: string;
  phone: string;
}

export interface SKU {
  id: string;
  code: string; // CCC-TTT-GGG-PPP-000
  name: string;
  category: string;
  hsn: string;
  gst: number;
  unit: string;
  active: boolean;
  basePrice: number;
}

export interface Lot {
  id: string;
  skuId: string;
  skuCode: string;
  storeId: string;
  qty: number;
  remaining: number;
  costPrice: number;
  sellPrice: number;
  purchaseDate: string; // ISO
  expiryDate: string; // ISO
  supplier: string;
  invoiceNo: string;
}

export interface Sale {
  id: string;
  billNo: string;
  storeId: string;
  date: string;
  items: { skuCode: string; qty: number; price: number }[];
  total: number;
  gst: number;
  payment: "cash" | "upi" | "card";
}

export const stores: Store[] = [
  { id: "s1", code: "BLR", name: "Mercotrace Indiranagar", city: "Bengaluru", agglomeration: "South Cluster", status: "active", owner: "R. Iyer", phone: "+91 98800 10001" },
  { id: "s2", code: "MUM", name: "Mercotrace Andheri", city: "Mumbai", agglomeration: "West Cluster", status: "active", owner: "P. Shah", phone: "+91 98800 10002" },
  { id: "s3", code: "DEL", name: "Mercotrace Saket", city: "New Delhi", agglomeration: "North Cluster", status: "pending", owner: "A. Khanna", phone: "+91 98800 10003" },
  { id: "s4", code: "HYD", name: "Mercotrace Jubilee", city: "Hyderabad", agglomeration: "South Cluster", status: "active", owner: "S. Reddy", phone: "+91 98800 10004" },
  { id: "s5", code: "PUN", name: "Mercotrace Koregaon", city: "Pune", agglomeration: "West Cluster", status: "suspended", owner: "M. Joshi", phone: "+91 98800 10005" },
];

export const skus: SKU[] = [
  { id: "k1", code: "FMC-BEV-COL-500-001", name: "Cola 500ml", category: "Beverage", hsn: "2202", gst: 28, unit: "btl", active: true, basePrice: 40 },
  { id: "k2", code: "FMC-SNK-CHP-100-002", name: "Potato Chips 100g", category: "Snack", hsn: "1905", gst: 18, unit: "pkt", active: true, basePrice: 30 },
  { id: "k3", code: "DRY-RIC-BAS-1KG-003", name: "Basmati Rice 1Kg", category: "Grocery", hsn: "1006", gst: 5, unit: "kg", active: true, basePrice: 145 },
  { id: "k4", code: "PER-MLK-FCM-1LT-004", name: "Full Cream Milk 1L", category: "Dairy", hsn: "0401", gst: 0, unit: "ltr", active: true, basePrice: 68 },
  { id: "k5", code: "HOM-DET-LIQ-1LT-005", name: "Liquid Detergent 1L", category: "Home Care", hsn: "3402", gst: 18, unit: "btl", active: true, basePrice: 220 },
  { id: "k6", code: "PER-BRD-WHT-400-006", name: "Whole Wheat Bread 400g", category: "Bakery", hsn: "1905", gst: 5, unit: "pkt", active: false, basePrice: 55 },
];

const today = new Date();
const addDays = (d: number) => new Date(today.getTime() + d * 86400000).toISOString();

export const lots: Lot[] = [
  { id: "l1", skuId: "k1", skuCode: "FMC-BEV-COL-500-001", storeId: "s1", qty: 240, remaining: 180, costPrice: 28, sellPrice: 40, purchaseDate: addDays(-20), expiryDate: addDays(120), supplier: "AquaDist", invoiceNo: "INV-1001" },
  { id: "l2", skuId: "k2", skuCode: "FMC-SNK-CHP-100-002", storeId: "s1", qty: 120, remaining: 28, costPrice: 18, sellPrice: 30, purchaseDate: addDays(-45), expiryDate: addDays(20), supplier: "CrunchCo", invoiceNo: "INV-1002" },
  { id: "l3", skuId: "k3", skuCode: "DRY-RIC-BAS-1KG-003", storeId: "s2", qty: 80, remaining: 75, costPrice: 110, sellPrice: 145, purchaseDate: addDays(-10), expiryDate: addDays(300), supplier: "GrainHub", invoiceNo: "INV-1003" },
  { id: "l4", skuId: "k4", skuCode: "PER-MLK-FCM-1LT-004", storeId: "s1", qty: 60, remaining: 14, costPrice: 52, sellPrice: 68, purchaseDate: addDays(-3), expiryDate: addDays(2), supplier: "DairyBest", invoiceNo: "INV-1004" },
  { id: "l5", skuId: "k5", skuCode: "HOM-DET-LIQ-1LT-005", storeId: "s4", qty: 36, remaining: 30, costPrice: 165, sellPrice: 220, purchaseDate: addDays(-60), expiryDate: addDays(540), supplier: "CleanMax", invoiceNo: "INV-1005" },
  { id: "l6", skuId: "k2", skuCode: "FMC-SNK-CHP-100-002", storeId: "s2", qty: 200, remaining: 200, costPrice: 17, sellPrice: 30, purchaseDate: addDays(-1), expiryDate: addDays(85), supplier: "CrunchCo", invoiceNo: "INV-1006" },
];

export const sales: Sale[] = [
  { id: "b1", billNo: "BILL-2401", storeId: "s1", date: addDays(-1), items: [{ skuCode: "FMC-BEV-COL-500-001", qty: 2, price: 40 }, { skuCode: "FMC-SNK-CHP-100-002", qty: 1, price: 30 }], total: 110, gst: 21.4, payment: "upi" },
  { id: "b2", billNo: "BILL-2402", storeId: "s2", date: addDays(0), items: [{ skuCode: "DRY-RIC-BAS-1KG-003", qty: 3, price: 145 }], total: 435, gst: 21.75, payment: "cash" },
  { id: "b3", billNo: "BILL-2403", storeId: "s1", date: addDays(0), items: [{ skuCode: "PER-MLK-FCM-1LT-004", qty: 4, price: 68 }], total: 272, gst: 0, payment: "card" },
];

// === Cost engine ===
// Interest Cost = CP * Q * (R/365) * D
export function interestCost(cp: number, q: number, ratePct: number, days: number) {
  return cp * q * (ratePct / 100 / 365) * days;
}
// Wastage Cost = CP * Q * (D/E) where D = days held, E = expiry window from purchase
export function wastageCost(cp: number, q: number, daysHeld: number, expiryWindow: number) {
  if (expiryWindow <= 0) return cp * q;
  return cp * q * Math.min(1, daysHeld / expiryWindow);
}
export function effectiveCost(cp: number, q: number, ratePct: number, daysHeld: number, expiryWindow: number) {
  return cp * q + interestCost(cp, q, ratePct, daysHeld) + wastageCost(cp, q, daysHeld, expiryWindow);
}
export function effectiveMargin(revenue: number, effCost: number) {
  if (revenue <= 0) return 0;
  return (revenue - effCost) / revenue;
}
export function daysBetween(a: string | Date, b: string | Date) {
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
  return Math.max(0, Math.round(d));
}
export function healthForLot(lot: Lot, ratePct = 12): { tone: "green" | "yellow" | "red"; margin: number; effCost: number; daysHeld: number; daysToExpiry: number } {
  const daysHeld = daysBetween(lot.purchaseDate, new Date());
  const daysToExpiry = daysBetween(new Date(), lot.expiryDate);
  const expiryWindow = daysBetween(lot.purchaseDate, lot.expiryDate);
  const effCost = effectiveCost(lot.costPrice, lot.remaining, ratePct, daysHeld, expiryWindow);
  const revenue = lot.sellPrice * lot.remaining;
  const margin = effectiveMargin(revenue, effCost);
  let tone: "green" | "yellow" | "red" = "green";
  if (margin < 0 || daysToExpiry <= 7) tone = "red";
  else if (margin < 0.15 || daysToExpiry <= 30) tone = "yellow";
  return { tone, margin, effCost, daysHeld, daysToExpiry };
}

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
