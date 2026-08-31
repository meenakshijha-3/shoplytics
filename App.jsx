import React, { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  LayoutDashboard, TrendingUp, Users, Package, ShoppingCart, Boxes, Lightbulb,
  Upload, Settings as SettingsIcon, Search, Bell, Moon, Sun, ChevronDown, Menu, X,
  ArrowUpRight, ArrowDownRight, LogOut, User, Check, AlertTriangle, AlertCircle,
  Download, Filter, Trash2, Eye, EyeOff, ChevronRight, ChevronLeft, RefreshCw,
  CheckCircle2, XCircle, Info, FileSpreadsheet, DatabaseZap, ArrowRight, Sparkles,
  BarChart3, PieChart as PieChartIcon, Wallet, CreditCard, MapPin, Clock, Zap
} from "lucide-react";

/* =========================================================================
   SHOPLYTICS — E-Commerce Sales Analytics & Management Platform
   Single-file React application.

   NOTE ON BACKEND: this project ships with a browser localStorage-backed
   data layer so it runs entirely client-side and deploys cleanly to
   GitHub Pages with zero backend setup. Every feature is fully wired to
   this real, dynamic data layer — nothing is hardcoded. The storage
   layer (storeGet/storeSet/storeDelete below) is intentionally isolated
   so it can be swapped for real Supabase calls later without touching
   any other part of the app.
   ========================================================================= */

/* -------------------------------------------------------------------------
   THEME TOKENS
   Palette: Ink #0B1220 (dark bg) / Paper #F7F8FA (light bg) / Signal Indigo
   #4F46E5 (brand) / Mint #10B981 (positive) / Amber #F59E0B (warning) /
   Coral #EF4444 (negative). Display face: Space Grotesk. Body: Inter.
   Data face: JetBrains Mono (KPI figures, table numerics).
------------------------------------------------------------------------- */
const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
:root{
  --font-display:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;
  --font-body:'Inter',ui-sans-serif,system-ui,sans-serif;
  --font-mono:'JetBrains Mono',ui-monospace,monospace;
}
.font-display{font-family:var(--font-display);}
.font-body{font-family:var(--font-body);}
.font-mono{font-family:var(--font-mono);}
* { scrollbar-width: thin; }
::-webkit-scrollbar{width:8px;height:8px;}
::-webkit-scrollbar-thumb{background:rgba(148,163,184,0.35);border-radius:8px;}
::-webkit-scrollbar-track{background:transparent;}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
.animate-fadeUp{animation:fadeUp .35s ease both;}
@keyframes tickerIn{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}
`;

const BRAND = {
  indigo: "#4F46E5",
  indigoSoft: "#EEF2FF",
  mint: "#10B981",
  mintSoft: "#ECFDF5",
  amber: "#F59E0B",
  amberSoft: "#FFFBEB",
  coral: "#EF4444",
  coralSoft: "#FEF2F2",
  ink: "#0B1220",
};

const CHART_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#8B5CF6", "#EC4899", "#84CC16"];

/* -------------------------------------------------------------------------
   SEEDED RNG — deterministic "realistic" demo data (not random noise on
   every reload, so the presentation looks the same every run).
------------------------------------------------------------------------- */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(87231);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
const randFloat = (min, max, dp = 2) => parseFloat((rng() * (max - min) + min).toFixed(dp));

/* -------------------------------------------------------------------------
   DATA LAYER — demo catalogue
------------------------------------------------------------------------- */
const CATEGORIES = ["Electronics", "Apparel", "Home & Kitchen", "Beauty", "Sports & Outdoors", "Toys & Games", "Office Supplies", "Grocery"];
const REGIONS = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East"];
const PAYMENT_METHODS = ["Credit Card", "Debit Card", "PayPal", "UPI", "Wallet", "Cash on Delivery"];
const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const STATUS_WEIGHTS = [0.06, 0.08, 0.14, 0.65, 0.07];

const PRODUCT_CATALOGUE = [
  { name: "Aria Wireless Earbuds", category: "Electronics", price: 89.99, cost: 41.0 },
  { name: "Pulse Smartwatch SE", category: "Electronics", price: 149.0, cost: 72.0 },
  { name: "Lumen Desk Lamp", category: "Home & Kitchen", price: 34.5, cost: 14.0 },
  { name: "NimbleFit Yoga Mat", category: "Sports & Outdoors", price: 28.0, cost: 9.5 },
  { name: "CrestPeak Hiking Backpack 40L", category: "Sports & Outdoors", price: 112.0, cost: 55.0 },
  { name: "Velour Cotton Hoodie", category: "Apparel", price: 45.0, cost: 18.0 },
  { name: "Solstice Denim Jacket", category: "Apparel", price: 78.0, cost: 33.0 },
  { name: "GlowLab Vitamin C Serum", category: "Beauty", price: 24.99, cost: 7.5 },
  { name: "Matte Finish Lip Set", category: "Beauty", price: 19.99, cost: 6.0 },
  { name: "Cascade 12-Cup Coffee Maker", category: "Home & Kitchen", price: 64.0, cost: 29.0 },
  { name: "IronGrip Cast Skillet 10in", category: "Home & Kitchen", price: 39.0, cost: 15.0 },
  { name: "BrightBlox Building Set 500pc", category: "Toys & Games", price: 42.0, cost: 17.0 },
  { name: "Voyager RC Racer", category: "Toys & Games", price: 55.0, cost: 24.0 },
  { name: "EcoLine Bamboo Notebook Set", category: "Office Supplies", price: 16.5, cost: 5.5 },
  { name: "ClickPro Mechanical Keyboard", category: "Electronics", price: 99.0, cost: 46.0 },
  { name: "OptiView 27in Monitor", category: "Electronics", price: 219.0, cost: 128.0 },
  { name: "TrailBlaze Running Shoes", category: "Sports & Outdoors", price: 87.0, cost: 38.0 },
  { name: "PureBrew Organic Coffee 1kg", category: "Grocery", price: 22.0, cost: 9.0 },
  { name: "GoldenHarvest Trail Mix 900g", category: "Grocery", price: 14.0, cost: 5.0 },
  { name: "DeskMate Standing Desk Converter", category: "Office Supplies", price: 138.0, cost: 71.0 },
  { name: "SilkTouch Bedsheet Set Queen", category: "Home & Kitchen", price: 58.0, cost: 22.0 },
  { name: "AeroFlex Resistance Bands", category: "Sports & Outdoors", price: 21.0, cost: 7.0 },
  { name: "NightGlow Skincare Kit", category: "Beauty", price: 49.0, cost: 19.0 },
  { name: "Chroma Graphic Tee", category: "Apparel", price: 22.0, cost: 8.0 },
  { name: "Wanderer Canvas Sneakers", category: "Apparel", price: 64.0, cost: 27.0 },
];

const FIRST_NAMES = ["Olivia","Liam","Emma","Noah","Ava","Ethan","Sophia","Mason","Isabella","Lucas","Mia","Aiden","Amelia","Elijah","Harper","James","Evelyn","Benjamin","Abigail","Logan","Ella","Alexander","Scarlett","Henry","Grace","Jack","Chloe","Owen","Zoey","Sebastian","Riley","Wyatt","Nora","Leo","Hannah","Julian","Layla","Levi","Aria","Isaac"];
const LAST_NAMES = ["Carter","Reyes","Nguyen","Patel","Kim","Johnson","Garcia","Müller","Rossi","Dubois","Silva","Kowalski","Andersen","Yamamoto","Chen","Okafor","Novak","Petrov","Haddad","Larsen"];

function genCustomers(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const first = pick(FIRST_NAMES), last = pick(LAST_NAMES);
    out.push({
      id: `CUST-${1000 + i}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1,99)}@mailbox.com`,
      region: pick(REGIONS),
      joined: daysAgoISO(randInt(30, 730)),
    });
  }
  return out;
}

function genProducts() {
  return PRODUCT_CATALOGUE.map((p, i) => ({
    id: `PROD-${100 + i}`,
    name: p.name,
    category: p.category,
    price: p.price,
    cost: p.cost,
    stock: randInt(0, 260),
    reorderLevel: randInt(20, 50),
  }));
}

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function genOrders(n, customers, products) {
  const out = [];
  // seasonal weighting so charts have a visible, presentable trend
  const monthBoost = { 0: 0.9, 1: 0.85, 2: 0.95, 3: 1.0, 4: 1.05, 5: 1.1, 6: 1.05, 7: 1.0, 8: 1.1, 9: 1.2, 10: 1.35, 11: 1.5 };
  let idCounter = 500000;
  for (let i = 0; i < n; i++) {
    const daysBack = Math.floor(rng() * rng() * 400); // skew recent-ish but 13mo range
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    const boost = monthBoost[date.getMonth()] ?? 1;
    if (rng() > boost / 1.5 && boost < 1) { i--; continue; } // thin out slow months a bit
    const product = pick(products);
    const customer = pick(customers);
    const qty = randInt(1, 5);
    const unitPrice = product.price * randFloat(0.92, 1.08, 3); // slight price variance/discounts
    const sales = parseFloat((unitPrice * qty).toFixed(2));
    const unitCost = product.cost * randFloat(0.97, 1.05, 3);
    const profit = parseFloat((sales - unitCost * qty).toFixed(2));
    let statusRoll = rng(), cum = 0, status = ORDER_STATUSES[ORDER_STATUSES.length - 1];
    for (let s = 0; s < ORDER_STATUSES.length; s++) { cum += STATUS_WEIGHTS[s]; if (statusRoll <= cum) { status = ORDER_STATUSES[s]; break; } }
    if (daysBack < 3 && (status === "Delivered")) status = pick(["Pending", "Processing", "Shipped"]);
    out.push({
      id: `ORD-${idCounter++}`,
      customerId: customer.id,
      customerName: customer.name,
      productId: product.id,
      productName: product.name,
      category: product.category,
      quantity: qty,
      sales,
      profit,
      orderDate: date.toISOString().slice(0, 10),
      region: customer.region,
      paymentMethod: pick(PAYMENT_METHODS),
      status,
      source: "demo",
    });
  }
  out.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  return out;
}

function buildDemoDataset() {
  const customers = genCustomers(180);
  const products = genProducts();
  const orders = genOrders(1450, customers, products);
  return { customers, products, orders };
}

/* -------------------------------------------------------------------------
   PERSISTENT STORAGE LAYER (stands in for Supabase in this environment)
   Backed by the browser's localStorage. Kept as async functions so the
   rest of the app (which awaits these calls) needs no changes if this
   is later swapped for real Supabase calls.
------------------------------------------------------------------------- */
async function storeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("storage set failed", e);
    return false;
  }
}
async function storeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
async function storeDelete(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    /* noop */
  }
}

/* -------------------------------------------------------------------------
   CALCULATION / AGGREGATION UTILITIES
   Every metric in the app is derived here from the raw orders array —
   nothing is hardcoded.
------------------------------------------------------------------------- */
const fmtCurrency = (n, currency = "USD") => {
  const symbols = { USD: "$", EUR: "€", GBP: "£", INR: "₹" };
  const sym = symbols[currency] || "$";
  const val = Number(n || 0);
  return `${sym}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};
const fmtCurrencyPrecise = (n, currency = "USD") => {
  const symbols = { USD: "$", EUR: "€", GBP: "£", INR: "₹" };
  const sym = symbols[currency] || "$";
  return `${sym}${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const fmtNum = (n) => Number(n || 0).toLocaleString();
const fmtPct = (n) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

function inRange(dateStr, start, end) {
  const t = new Date(dateStr).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function applyFilters(orders, filters) {
  const { start, end, category, region, productId, customerId } = filters;
  return orders.filter((o) => {
    if (start && end && !inRange(o.orderDate, start, end)) return false;
    if (category && category !== "All" && o.category !== category) return false;
    if (region && region !== "All" && o.region !== region) return false;
    if (productId && productId !== "All" && o.productId !== productId) return false;
    if (customerId && customerId !== "All" && o.customerId !== customerId) return false;
    return true;
  });
}

function previousPeriodRange(start, end) {
  const spanMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 24 * 3600 * 1000);
  const prevStart = new Date(prevEnd.getTime() - spanMs);
  return { prevStart, prevEnd };
}

function growthPct(curr, prev) {
  if (!prev || prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

function computeKPIs(orders, allOrders, filters) {
  const validOrders = orders.filter((o) => o.status !== "Cancelled");
  const revenue = validOrders.reduce((s, o) => s + o.sales, 0);
  const profit = validOrders.reduce((s, o) => s + o.profit, 0);
  const orderCount = orders.length;
  const customers = new Set(validOrders.map((o) => o.customerId));
  const aov = orderCount ? revenue / orderCount : 0;
  const margin = revenue ? (profit / revenue) * 100 : 0;

  let prevRevenue = 0, prevProfit = 0, prevOrders = 0, prevCustomers = 0, prevAov = 0, prevMargin = 0;
  if (filters.start && filters.end) {
    const { prevStart, prevEnd } = previousPeriodRange(filters.start, filters.end);
    const prevFiltered = applyFilters(allOrders, { ...filters, start: prevStart, end: prevEnd });
    const prevValid = prevFiltered.filter((o) => o.status !== "Cancelled");
    prevRevenue = prevValid.reduce((s, o) => s + o.sales, 0);
    prevProfit = prevValid.reduce((s, o) => s + o.profit, 0);
    prevOrders = prevFiltered.length;
    prevCustomers = new Set(prevValid.map((o) => o.customerId)).size;
    prevAov = prevOrders ? prevRevenue / prevOrders : 0;
    prevMargin = prevRevenue ? (prevProfit / prevRevenue) * 100 : 0;
  }

  return {
    revenue, profit, orderCount, customerCount: customers.size, aov, margin,
    revenueGrowth: growthPct(revenue, prevRevenue),
    profitGrowth: growthPct(profit, prevProfit),
    orderGrowth: growthPct(orderCount, prevOrders),
    customerGrowth: growthPct(customers.size, prevCustomers),
    aovGrowth: growthPct(aov, prevAov),
    marginGrowth: margin - prevMargin,
  };
}

function groupByDate(orders, granularity = "month") {
  const map = new Map();
  orders.forEach((o) => {
    if (o.status === "Cancelled") return;
    const d = new Date(o.orderDate);
    let key;
    if (granularity === "day") key = o.orderDate;
    else if (granularity === "week") {
      const onejan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
      key = `${d.getFullYear()}-W${week}`;
    } else key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, { key, revenue: 0, profit: 0, orders: 0 });
    const rec = map.get(key);
    rec.revenue += o.sales; rec.profit += o.profit; rec.orders += 1;
  });
  return Array.from(map.values()).sort((a, b) => (a.key > b.key ? 1 : -1));
}

function groupBy(orders, keyFn) {
  const map = new Map();
  orders.forEach((o) => {
    if (o.status === "Cancelled") return;
    const key = keyFn(o);
    if (!map.has(key)) map.set(key, { key, revenue: 0, profit: 0, orders: 0, qty: 0 });
    const rec = map.get(key);
    rec.revenue += o.sales; rec.profit += o.profit; rec.orders += 1; rec.qty += o.quantity;
  });
  return Array.from(map.values());
}

function topProducts(orders, n = 10, by = "revenue") {
  const grouped = groupBy(orders, (o) => o.productName);
  return grouped.sort((a, b) => b[by] - a[by]).slice(0, n);
}

function customerSegments(orders, customers) {
  const spend = new Map();
  orders.forEach((o) => {
    if (o.status === "Cancelled") return;
    spend.set(o.customerId, (spend.get(o.customerId) || 0) + o.sales);
  });
  const values = Array.from(spend.values());
  const sorted = [...values].sort((a, b) => a - b);
  const q = (p) => sorted.length ? sorted[Math.floor(p * (sorted.length - 1))] : 0;
  const highT = q(0.85), regT = q(0.55), occT = q(0.25);
  const segmentOf = (v) => (v >= highT ? "High Value" : v >= regT ? "Regular" : v >= occT ? "Occasional" : "At Risk");
  return { spend, segmentOf, highT, regT, occT };
}

/* -------------------------------------------------------------------------
   AUTOMATED INSIGHTS ENGINE — every insight below is computed from the
   real filtered dataset, never randomly generated.
------------------------------------------------------------------------- */
function generateInsights(orders, customers, products) {
  const valid = orders.filter((o) => o.status !== "Cancelled");
  const insights = [];
  if (!valid.length) return insights;

  // Highest performing category
  const byCat = groupBy(valid, (o) => o.category).sort((a, b) => b.revenue - a.revenue);
  if (byCat[0]) {
    insights.push({
      icon: BarChart3, tone: "positive", title: "High-Performing Category",
      body: `${byCat[0].key} generated ${fmtCurrency(byCat[0].revenue)} in revenue across ${byCat[0].orders} orders, the strongest of any category in the selected period.`,
      metric: `${fmtCurrency(byCat[0].revenue)} revenue`,
      recommendation: `Increase inventory allocation and promotional spend for ${byCat[0].key} to capitalize on demand.`,
    });
  }

  // Fastest growing category (compare first half vs second half of range present in data)
  const dates = valid.map((o) => new Date(o.orderDate).getTime());
  if (dates.length > 10) {
    const mid = (Math.min(...dates) + Math.max(...dates)) / 2;
    const early = valid.filter((o) => new Date(o.orderDate).getTime() < mid);
    const late = valid.filter((o) => new Date(o.orderDate).getTime() >= mid);
    const earlyByCat = groupBy(early, (o) => o.category);
    const lateByCat = groupBy(late, (o) => o.category);
    let best = null, bestGrowth = -Infinity;
    lateByCat.forEach((l) => {
      const e = earlyByCat.find((x) => x.key === l.key);
      const g = growthPct(l.revenue, e ? e.revenue : 0);
      if (g > bestGrowth && l.revenue > 0) { bestGrowth = g; best = l; }
    });
    if (best && isFinite(bestGrowth)) {
      insights.push({
        icon: TrendingUp, tone: "positive", title: "Fastest-Growing Category",
        body: `${best.key} revenue grew ${fmtPct(bestGrowth)} between the first and second half of the selected period, outpacing every other category.`,
        metric: fmtPct(bestGrowth),
        recommendation: `Monitor supply for ${best.key} closely — growth at this rate can outrun current stock levels.`,
      });
    }
  }

  // Highest revenue region
  const byRegion = groupBy(valid, (o) => o.region).sort((a, b) => b.revenue - a.revenue);
  if (byRegion[0]) {
    insights.push({
      icon: MapPin, tone: "neutral", title: "Top-Performing Region",
      body: `${byRegion[0].key} leads all regions with ${fmtCurrency(byRegion[0].revenue)} in revenue from ${byRegion[0].orders} orders.`,
      metric: `${fmtCurrency(byRegion[0].revenue)}`,
      recommendation: `Consider region-specific campaigns or localized fulfillment in ${byRegion[0].key} to defend this lead.`,
    });
  }

  // Most profitable product
  const byProduct = groupBy(valid, (o) => o.productName).sort((a, b) => b.profit - a.profit);
  if (byProduct[0]) {
    insights.push({
      icon: Sparkles, tone: "positive", title: "Most Profitable Product",
      body: `${byProduct[0].key} produced ${fmtCurrency(byProduct[0].profit)} in profit, the highest margin contribution of any product.`,
      metric: `${fmtCurrency(byProduct[0].profit)} profit`,
      recommendation: `Feature ${byProduct[0].key} in upsell placements — it converts revenue to profit more efficiently than the catalogue average.`,
    });
  }

  // Highest value customer
  const custSpend = new Map();
  valid.forEach((o) => custSpend.set(o.customerName, (custSpend.get(o.customerName) || 0) + o.sales));
  const topCust = Array.from(custSpend.entries()).sort((a, b) => b[1] - a[1])[0];
  if (topCust) {
    insights.push({
      icon: Users, tone: "neutral", title: "Highest-Value Customer",
      body: `${topCust[0]} has spent ${fmtCurrency(topCust[1])} in the selected period, making them the top individual account.`,
      metric: fmtCurrency(topCust[1]),
      recommendation: `Enroll top-spending accounts like this one in a loyalty or VIP program to protect retention.`,
    });
  }

  // Month with highest / lowest revenue
  const byMonth = groupByDate(valid, "month");
  if (byMonth.length > 1) {
    const best = [...byMonth].sort((a, b) => b.revenue - a.revenue)[0];
    const worst = [...byMonth].sort((a, b) => a.revenue - b.revenue)[0];
    insights.push({
      icon: ArrowUpRight, tone: "positive", title: "Best Month by Revenue",
      body: `${monthLabel(best.key)} was the strongest month in the selected range, closing at ${fmtCurrency(best.revenue)} in revenue.`,
      metric: fmtCurrency(best.revenue),
      recommendation: `Review what drove ${monthLabel(best.key)}'s performance (promotions, seasonality) and replicate the pattern.`,
    });
    insights.push({
      icon: ArrowDownRight, tone: "warning", title: "Weakest Month by Revenue",
      body: `${monthLabel(worst.key)} recorded the lowest revenue of the period at ${fmtCurrency(worst.revenue)}.`,
      metric: fmtCurrency(worst.revenue),
      recommendation: `Investigate demand or fulfillment issues around ${monthLabel(worst.key)} and plan a targeted promotion for that window next cycle.`,
    });
  }

  // High sales / low margin products
  const marginByProduct = byProduct.map((p) => ({ ...p, margin: p.revenue ? (p.profit / p.revenue) * 100 : 0 }));
  const avgMargin = marginByProduct.reduce((s, p) => s + p.margin, 0) / (marginByProduct.length || 1);
  const highSalesLowMargin = [...marginByProduct].sort((a, b) => b.revenue - a.revenue).slice(0, 8).filter((p) => p.margin < avgMargin - 5);
  if (highSalesLowMargin.length) {
    insights.push({
      icon: AlertTriangle, tone: "warning", title: "High Revenue, Low Margin",
      body: `${highSalesLowMargin[0].key} generates strong revenue (${fmtCurrency(highSalesLowMargin[0].revenue)}) but converts at only ${highSalesLowMargin[0].margin.toFixed(1)}% margin, well below the ${avgMargin.toFixed(1)}% catalogue average.`,
      metric: `${highSalesLowMargin[0].margin.toFixed(1)}% margin`,
      recommendation: `Revisit sourcing cost or pricing for ${highSalesLowMargin[0].key} — volume is strong but profitability is being left on the table.`,
    });
  }

  // Declining products (early vs late half)
  if (dates.length > 10) {
    const mid = (Math.min(...dates) + Math.max(...dates)) / 2;
    const early = groupBy(valid.filter((o) => new Date(o.orderDate).getTime() < mid), (o) => o.productName);
    const late = groupBy(valid.filter((o) => new Date(o.orderDate).getTime() >= mid), (o) => o.productName);
    let worstDecline = null, worstG = Infinity;
    early.forEach((e) => {
      const l = late.find((x) => x.key === e.key);
      const lateRev = l ? l.revenue : 0;
      const g = growthPct(lateRev, e.revenue);
      if (e.revenue > 200 && g < worstG) { worstG = g; worstDecline = e; }
    });
    if (worstDecline && worstG < -10) {
      insights.push({
        icon: ArrowDownRight, tone: "negative", title: "Declining Product Performance",
        body: `${worstDecline.key} revenue fell ${fmtPct(worstG)} from the first half to the second half of the selected period.`,
        metric: fmtPct(worstG),
        recommendation: `Evaluate whether ${worstDecline.key} needs a refresh, repricing, or replacement in the catalogue.`,
      });
    }
  }

  // Low stock category attention
  const lowStock = products.filter((p) => p.stock <= p.reorderLevel);
  if (lowStock.length) {
    const cats = [...new Set(lowStock.map((p) => p.category))];
    insights.push({
      icon: Boxes, tone: "warning", title: "Categories Requiring Attention",
      body: `${lowStock.length} product${lowStock.length > 1 ? "s are" : " is"} at or below reorder level, spanning ${cats.length} categor${cats.length > 1 ? "ies" : "y"} (${cats.slice(0, 3).join(", ")}${cats.length > 3 ? "…" : ""}).`,
      metric: `${lowStock.length} low-stock SKUs`,
      recommendation: `Place restock orders for these SKUs before they go out of stock and interrupt sales.`,
    });
  }

  return insights;
}

function monthLabel(key) {
  if (!key || !key.includes("-")) return key;
  const [y, m] = key.split("-");
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

/* -------------------------------------------------------------------------
   TOAST SYSTEM
------------------------------------------------------------------------- */
const ToastContext = createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tone: "info", ...toast }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  const toneStyles = {
    success: { icon: CheckCircle2, cls: "border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900", iconCls: "text-emerald-500" },
    error: { icon: XCircle, cls: "border-red-200 dark:border-red-900 bg-white dark:bg-slate-900", iconCls: "text-red-500" },
    warning: { icon: AlertTriangle, cls: "border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900", iconCls: "text-amber-500" },
    info: { icon: Info, cls: "border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900", iconCls: "text-indigo-500" },
  };
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => {
          const s = toneStyles[t.tone] || toneStyles.info;
          const Icon = s.icon;
          return (
            <div key={t.id} className={`animate-fadeUp flex items-start gap-3 rounded-xl border ${s.cls} shadow-lg shadow-black/5 p-3.5`}>
              <Icon size={18} className={`${s.iconCls} mt-0.5 shrink-0`} />
              <div className="flex-1 min-w-0">
                {t.title && <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-body">{t.title}</p>}
                {t.message && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-body">{t.message}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
const useToast = () => useContext(ToastContext);

/* -------------------------------------------------------------------------
   UI PRIMITIVES
------------------------------------------------------------------------- */
function Card({ className = "", children, ...rest }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm shadow-slate-900/[0.02] ${className}`} {...rest}>
      {children}
    </div>
  );
}

function Button({ variant = "primary", size = "md", className = "", children, ...rest }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold font-body rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500";
  const sizes = { sm: "text-xs px-3 py-1.5", md: "text-sm px-4 py-2.5", lg: "text-base px-6 py-3.5" };
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/20",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700",
    outline: "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800",
    ghost: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger: "bg-red-600 text-white hover:bg-red-500 shadow-sm shadow-red-600/20",
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>{children}</button>;
}

function Badge({ tone = "neutral", children, className = "" }) {
  const tones = {
    neutral: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    positive: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    negative: "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",
    indigo: "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  };
  return <span className={`inline-flex items-center gap-1 text-xs font-semibold font-body px-2 py-0.5 rounded-full ${tones[tone]} ${className}`}>{children}</span>;
}

function StatusBadge({ status }) {
  const map = {
    Pending: "warning", Processing: "indigo", Shipped: "neutral", Delivered: "positive", Cancelled: "negative",
    "In Stock": "positive", "Low Stock": "warning", Critical: "negative", "Out of Stock": "negative",
  };
  return <Badge tone={map[status] || "neutral"}>{status}</Badge>;
}

function Modal({ open, onClose, title, children, footer, size = "md" }) {
  if (!open) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fadeUp" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-fadeUp max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 dark:border-slate-800">{footer}</div>}
      </div>
    </div>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </>}>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-body">{message}</p>
    </Modal>
  );
}

function EmptyState({ icon: Icon = DatabaseZap, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon size={24} className="text-slate-400" />
      </div>
      <h4 className="font-display font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
      <p className="text-sm text-slate-400 mt-1 max-w-sm font-body">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-xs text-slate-400 font-body">{label}…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <h4 className="font-display font-semibold text-slate-700 dark:text-slate-200">Something went wrong</h4>
      <p className="text-sm text-slate-400 mt-1 max-w-sm font-body">{message || "We couldn't load this data. Please try again."}</p>
      {onRetry && <Button variant="outline" className="mt-4" onClick={onRetry}><RefreshCw size={14} /> Retry</Button>}
    </div>
  );
}

function ChangeIndicator({ value, suffix = "%" }) {
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold font-mono ${positive ? "text-emerald-500" : "text-red-500"}`}>
      {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}

/* -------------------------------------------------------------------------
   AUTH CONTEXT — Sign up / login / logout / password reset, backed by
   the persistent storage layer. Passwords are never stored in plaintext
   in a real backend; here we simulate the same *shape* of flow.
------------------------------------------------------------------------- */
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await storeGet("shoplytics:session");
      if (session?.email) {
        const profile = await storeGet(`shoplytics:user:${session.email}`);
        if (profile) setUser(profile);
      }
      setAuthLoading(false);
      setAuthChecked(true);
    })();
  }, []);

  const signUp = useCallback(async ({ name, email, password }) => {
    const key = `shoplytics:user:${email.toLowerCase()}`;
    const existing = await storeGet(key);
    if (existing) throw new Error("An account with this email already exists.");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    const profile = { name, email: email.toLowerCase(), password, createdAt: new Date().toISOString(), currency: "USD", dateFormat: "MM/DD/YYYY", avatar: null };
    await storeSet(key, profile);
    await storeSet("shoplytics:session", { email: profile.email });
    setUser(profile);
    return profile;
  }, []);

  const logIn = useCallback(async ({ email, password }) => {
    const key = `shoplytics:user:${email.toLowerCase()}`;
    const profile = await storeGet(key);
    if (!profile || profile.password !== password) throw new Error("Invalid email or password.");
    await storeSet("shoplytics:session", { email: profile.email });
    setUser(profile);
    return profile;
  }, []);

  const logOut = useCallback(async () => {
    await storeDelete("shoplytics:session");
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    const key = `shoplytics:user:${email.toLowerCase()}`;
    const profile = await storeGet(key);
    if (!profile) throw new Error("No account found with this email.");
    const token = Math.random().toString(36).slice(2, 8).toUpperCase();
    await storeSet(`shoplytics:reset:${email.toLowerCase()}`, { token, issuedAt: Date.now() });
    return token; // in production this is emailed, not returned
  }, []);

  const resetPassword = useCallback(async ({ email, token, newPassword }) => {
    const resetKey = `shoplytics:reset:${email.toLowerCase()}`;
    const record = await storeGet(resetKey);
    if (!record || record.token !== token) throw new Error("Invalid or expired reset code.");
    if (newPassword.length < 8) throw new Error("Password must be at least 8 characters.");
    const userKey = `shoplytics:user:${email.toLowerCase()}`;
    const profile = await storeGet(userKey);
    profile.password = newPassword;
    await storeSet(userKey, profile);
    await storeDelete(resetKey);
    return true;
  }, []);

  const updateProfile = useCallback(async (patch) => {
    if (!user) return;
    const updated = { ...user, ...patch };
    await storeSet(`shoplytics:user:${user.email}`, updated);
    setUser(updated);
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    await storeDelete(`shoplytics:user:${user.email}`);
    await storeDelete(`shoplytics:orders:${user.email}`);
    await storeDelete(`shoplytics:products:${user.email}`);
    await storeDelete(`shoplytics:customers:${user.email}`);
    await storeDelete("shoplytics:session");
    setUser(null);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, authLoading, authChecked, signUp, logIn, logOut, requestPasswordReset, resetPassword, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}
const useAuth = () => useContext(AuthContext);

/* -------------------------------------------------------------------------
   APP DATA CONTEXT — per-user orders / products / customers, demo data
   loading, CSV import/export, notifications.
------------------------------------------------------------------------- */
const DataContext = createContext(null);
function DataProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDemoData, setHasDemoData] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const scope = user ? user.email : null;

  const load = useCallback(async () => {
    if (!scope) { setOrders([]); setProducts([]); setCustomers([]); setLoading(false); return; }
    setLoading(true);
    const [o, p, c] = await Promise.all([
      storeGet(`shoplytics:orders:${scope}`),
      storeGet(`shoplytics:products:${scope}`),
      storeGet(`shoplytics:customers:${scope}`),
    ]);
    setOrders(o || []);
    setProducts(p || []);
    setCustomers(c || []);
    setHasDemoData(!!(o && o.length));
    setLoading(false);
  }, [scope]);

  useEffect(() => { load(); }, [load]);

  const persist = useCallback(async (nextOrders, nextProducts, nextCustomers) => {
    if (!scope) return;
    await Promise.all([
      storeSet(`shoplytics:orders:${scope}`, nextOrders),
      storeSet(`shoplytics:products:${scope}`, nextProducts),
      storeSet(`shoplytics:customers:${scope}`, nextCustomers),
    ]);
  }, [scope]);

  const pushNotification = useCallback((n) => {
    setNotifications((list) => [{ id: Math.random().toString(36).slice(2), read: false, time: new Date().toISOString(), ...n }, ...list].slice(0, 30));
  }, []);

  const loadDemoData = useCallback(async () => {
    const demo = buildDemoDataset();
    setOrders(demo.orders); setProducts(demo.products); setCustomers(demo.customers);
    setHasDemoData(true);
    await persist(demo.orders, demo.products, demo.customers);
    const lowStock = demo.products.filter((p) => p.stock <= p.reorderLevel);
    pushNotification({ type: "info", title: "Demo data loaded", message: `${demo.orders.length.toLocaleString()} orders across ${demo.products.length} products loaded successfully.` });
    if (lowStock.length) pushNotification({ type: "warning", title: "Low stock detected", message: `${lowStock.length} products are at or below their reorder level.` });
    toast?.push({ tone: "success", title: "Demo data loaded", message: `${demo.orders.length.toLocaleString()} orders generated.` });
  }, [persist, pushNotification, toast]);

  const clearData = useCallback(async () => {
    setOrders([]); setProducts([]); setCustomers([]); setHasDemoData(false);
    await persist([], [], []);
    toast?.push({ tone: "info", title: "Data cleared" });
  }, [persist, toast]);

  const importOrders = useCallback(async (newOrders, newCustomers, newProducts) => {
    const mergedCustomers = [...customers];
    newCustomers.forEach((nc) => { if (!mergedCustomers.find((c) => c.id === nc.id)) mergedCustomers.push(nc); });
    const mergedProducts = [...products];
    newProducts.forEach((np) => { if (!mergedProducts.find((p) => p.id === np.id)) mergedProducts.push(np); });
    const mergedOrders = [...newOrders.map((o) => ({ ...o, source: "imported" })), ...orders];
    setOrders(mergedOrders); setCustomers(mergedCustomers); setProducts(mergedProducts);
    setHasDemoData(true);
    await persist(mergedOrders, mergedProducts, mergedCustomers);
    pushNotification({ type: "success", title: "Import completed", message: `${newOrders.length} orders imported successfully.` });
    toast?.push({ tone: "success", title: "Import complete", message: `${newOrders.length} orders added.` });
  }, [orders, products, customers, persist, pushNotification, toast]);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    const next = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(next);
    await storeSet(`shoplytics:orders:${scope}`, next);
  }, [orders, scope]);

  const deleteOrder = useCallback(async (orderId) => {
    const next = orders.filter((o) => o.id !== orderId);
    setOrders(next);
    await storeSet(`shoplytics:orders:${scope}`, next);
    toast?.push({ tone: "info", title: "Order deleted" });
  }, [orders, scope, toast]);

  const updateProductStock = useCallback(async (productId, stock) => {
    const next = products.map((p) => (p.id === productId ? { ...p, stock } : p));
    setProducts(next);
    await storeSet(`shoplytics:products:${scope}`, next);
  }, [products, scope]);

  return (
    <DataContext.Provider value={{
      orders, products, customers, loading, hasDemoData,
      notifications, pushNotification, setNotifications,
      loadDemoData, clearData, importOrders, updateOrderStatus, deleteOrder, updateProductStock, reload: load,
    }}>
      {children}
    </DataContext.Provider>
  );
}
const useData = () => useContext(DataContext);

/* -------------------------------------------------------------------------
   CSV HELPERS
------------------------------------------------------------------------- */
const CSV_TEMPLATE_HEADERS = ["Order ID","Order Date","Customer ID","Customer Name","Product","Category","Quantity","Sales","Profit","Region","Payment Method","Status"];

function generateSampleCSV() {
  const rows = [CSV_TEMPLATE_HEADERS.join(",")];
  const sample = [
    ["ORD-900001","2026-06-01","CUST-2001","Jordan Blake","Aria Wireless Earbuds","Electronics","2","179.98","81.20","North America","Credit Card","Delivered"],
    ["ORD-900002","2026-06-03","CUST-2002","Sam Rivera","Velour Cotton Hoodie","Apparel","1","45.00","27.00","Europe","PayPal","Shipped"],
  ];
  sample.forEach((r) => rows.push(r.join(",")));
  return rows.join("\n");
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return { headers: [], rows: [] };
  const splitLine = (line) => {
    const out = []; let cur = ""; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { out.push(cur); cur = ""; continue; }
      cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const headers = splitLine(lines[0]);
  const rows = lines.slice(1).map(splitLine);
  return { headers, rows };
}

function validateAndTransformCSV(headers, rows) {
  const required = ["Order ID","Order Date","Customer Name","Product","Category","Quantity","Sales","Profit","Region","Payment Method"];
  const missing = required.filter((r) => !headers.includes(r));
  const errors = [];
  if (missing.length) errors.push(`Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
  if (missing.length) return { errors, validOrders: [], invalidRows: [], newCustomers: [], newProducts: [] };

  const idx = (h) => headers.indexOf(h);
  const validOrders = []; const invalidRows = [];
  const custMap = new Map(); const prodMap = new Map();

  rows.forEach((r, i) => {
    const rowErrors = [];
    const orderId = r[idx("Order ID")] || `IMP-${Date.now()}-${i}`;
    const orderDate = r[idx("Order Date")];
    const customerName = r[idx("Customer Name")];
    const customerId = idx("Customer ID") >= 0 ? r[idx("Customer ID")] : `CUST-IMP-${i}`;
    const product = r[idx("Product")];
    const category = r[idx("Category")];
    const quantity = parseFloat(r[idx("Quantity")]);
    const sales = parseFloat(r[idx("Sales")]);
    const profit = parseFloat(r[idx("Profit")]);
    const region = r[idx("Region")];
    const paymentMethod = r[idx("Payment Method")];
    const status = idx("Status") >= 0 && r[idx("Status")] ? r[idx("Status")] : "Delivered";

    if (!orderDate || isNaN(new Date(orderDate).getTime())) rowErrors.push("invalid order date");
    if (!customerName) rowErrors.push("missing customer name");
    if (!product) rowErrors.push("missing product");
    if (!category) rowErrors.push("missing category");
    if (isNaN(quantity) || quantity <= 0) rowErrors.push("invalid quantity");
    if (isNaN(sales) || sales < 0) rowErrors.push("invalid sales value");
    if (isNaN(profit)) rowErrors.push("invalid profit value");
    if (!ORDER_STATUSES.includes(status)) rowErrors.push(`unrecognized status "${status}"`);

    if (rowErrors.length) { invalidRows.push({ row: i + 2, issues: rowErrors, raw: r }); return; }

    if (!custMap.has(customerId)) custMap.set(customerId, { id: customerId, name: customerName, region: region || "North America", email: "", joined: orderDate });
    const productId = `PROD-IMP-${product.replace(/\s+/g, "").slice(0, 12)}`;
    if (!prodMap.has(productId)) prodMap.set(productId, { id: productId, name: product, category, price: sales / quantity, cost: (sales - profit) / quantity, stock: 100, reorderLevel: 25 });

    validOrders.push({
      id: orderId, customerId, customerName, productId, productName: product, category,
      quantity, sales, profit, orderDate, region: region || "North America", paymentMethod: paymentMethod || "Credit Card", status,
    });
  });

  return { errors, validOrders, invalidRows, newCustomers: Array.from(custMap.values()), newProducts: Array.from(prodMap.values()) };
}

function downloadCSV(filename, rows, headers) {
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* -------------------------------------------------------------------------
   DATE PRESETS + GLOBAL FILTER BAR
------------------------------------------------------------------------- */
function presetRange(preset) {
  const now = new Date(); now.setHours(23, 59, 59, 999);
  const start = new Date();
  switch (preset) {
    case "Today": start.setHours(0, 0, 0, 0); break;
    case "This week": start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0); break;
    case "This month": start.setDate(1); start.setHours(0,0,0,0); break;
    case "Last month": {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0, 23,59,59,999);
      return { start: s, end: e };
    }
    case "Last 3 months": start.setMonth(now.getMonth() - 3); break;
    case "Last 6 months": start.setMonth(now.getMonth() - 6); break;
    case "This year": start.setMonth(0,1); start.setHours(0,0,0,0); break;
    default: start.setMonth(now.getMonth() - 12);
  }
  return { start, end: now };
}
const DATE_PRESETS = ["Today","This week","This month","Last month","Last 3 months","Last 6 months","This year","All time"];

function FilterBar({ filters, setFilters, products, customers, compact = false }) {
  const [open, setOpen] = useState(false);
  const applyPreset = (preset) => {
    if (preset === "All time") { setFilters((f) => ({ ...f, preset, start: null, end: null })); return; }
    const { start, end } = presetRange(preset);
    setFilters((f) => ({ ...f, preset, start, end }));
  };
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 sm:hidden mb-2">
        <span className="text-xs font-semibold text-slate-500 font-body flex items-center gap-1.5"><Filter size={14}/> Filters</span>
        <button onClick={() => setOpen((o) => !o)} className="text-xs text-indigo-600 font-semibold">{open ? "Hide" : "Show"}</button>
      </div>
      <div className={`${open ? "flex" : "hidden"} sm:flex flex-wrap items-center gap-2`}>
        <select value={filters.preset} onChange={(e) => applyPreset(e.target.value)}
          className="text-xs sm:text-sm font-body bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {DATE_PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          className="text-xs sm:text-sm font-body bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.region} onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
          className="text-xs sm:text-sm font-body bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="All">All regions</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {products?.length > 0 && (
          <select value={filters.productId} onChange={(e) => setFilters((f) => ({ ...f, productId: e.target.value }))}
            className="text-xs sm:text-sm font-body bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[160px]">
            <option value="All">All products</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
        {customers?.length > 0 && (
          <select value={filters.customerId} onChange={(e) => setFilters((f) => ({ ...f, customerId: e.target.value }))}
            className="text-xs sm:text-sm font-body bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[160px]">
            <option value="All">All customers</option>
            {customers.slice(0, 100).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {(filters.category !== "All" || filters.region !== "All" || filters.productId !== "All" || filters.customerId !== "All" || filters.preset !== "Last 6 months") && (
          <button onClick={() => setFilters({ preset: "Last 6 months", ...presetRange("Last 6 months"), category: "All", region: "All", productId: "All", customerId: "All" })}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 font-body px-2">Reset</button>
        )}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------
   KPI CARD
------------------------------------------------------------------------- */
function KPICard({ label, value, growth, icon: Icon, description, tone = "indigo" }) {
  const tones = {
    indigo: "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
    mint: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    coral: "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",
  };
  return (
    <Card className="p-4 sm:p-5 animate-fadeUp">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tones[tone]}`}>
          <Icon size={17} />
        </div>
        {growth !== undefined && <ChangeIndicator value={growth} />}
      </div>
      <p className="text-2xl sm:text-[1.7rem] font-mono font-semibold text-slate-800 dark:text-slate-50 tracking-tight tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-body mt-1">{label}</p>
      {description && <p className="text-[11px] text-slate-400 dark:text-slate-500 font-body mt-1.5">{description}</p>}
    </Card>
  );
}

/* -------------------------------------------------------------------------
   CHART CARD WRAPPERS
------------------------------------------------------------------------- */
function ChartCard({ title, subtitle, action, children, height = 280 }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 font-body mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div style={{ width: "100%", height }}>{children}</div>
    </Card>
  );
}

const tooltipStyle = {
  contentStyle: { borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, fontFamily: "Inter, sans-serif", boxShadow: "0 8px 24px rgba(15,23,42,0.08)" },
  labelStyle: { fontWeight: 600, color: "#334155" },
};

function RevenueAreaChart({ data, dataKeyX = "key", currency }) {
  if (!data.length) return <EmptyState title="No data in this range" message="Adjust your filters or load demo data to see trends." />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND.indigo} stopOpacity={0.35} />
            <stop offset="100%" stopColor={BRAND.indigo} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey={dataKeyX} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => (v.length > 7 ? monthLabel(v).slice(0,3)+" "+v.slice(2,4) : v)} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => fmtCurrency(v, currency)} width={64} />
        <Tooltip {...tooltipStyle} formatter={(v) => fmtCurrency(v, currency)} />
        <Area type="monotone" dataKey="revenue" stroke={BRAND.indigo} strokeWidth={2.5} fill="url(#revGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ProfitLineChart({ data, currency }) {
  if (!data.length) return <EmptyState title="No data in this range" message="Adjust your filters to see profit trends." />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="key" tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => fmtCurrency(v, currency)} width={64} />
        <Tooltip {...tooltipStyle} formatter={(v) => fmtCurrency(v, currency)} />
        <Line type="monotone" dataKey="profit" stroke={BRAND.mint} strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CategoryBarChart({ data, currency }) {
  if (!data.length) return <EmptyState title="No data" message="No category sales in this range." />;
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sorted} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="key" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={0} angle={-20} textAnchor="end" height={55} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => fmtCurrency(v, currency)} width={64} />
        <Tooltip {...tooltipStyle} formatter={(v) => fmtCurrency(v, currency)} />
        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
          {sorted.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function RegionPieChart({ data, currency }) {
  if (!data.length) return <EmptyState title="No data" message="No regional sales in this range." />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="revenue" nameKey="key" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(v) => fmtCurrency(v, currency)} />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* -------------------------------------------------------------------------
   APP SHELL — Sidebar + Topbar
------------------------------------------------------------------------- */
const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "sales", label: "Sales Analytics", icon: TrendingUp },
  { key: "customers", label: "Customer Analytics", icon: Users },
  { key: "products", label: "Product Analytics", icon: Package },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "insights", label: "Insights", icon: Lightbulb },
  { key: "import", label: "Data Import", icon: Upload },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
        <BarChart3 size={17} className="text-white" />
      </div>
      <span className="font-display font-bold text-[17px] tracking-tight text-slate-800 dark:text-white">Shoplytics</span>
    </div>
  );
}

function Sidebar({ page, setPage, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { logOut, user } = useAuth();
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200
        ${collapsed ? "lg:w-[76px]" : "lg:w-64"} w-64 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0">
          {!collapsed && <Logo />}
          {collapsed && <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center mx-auto"><BarChart3 size={17} className="text-white" /></div>}
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400"><X size={18} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = page === item.key;
            return (
              <button key={item.key} onClick={() => { setPage(item.key); setMobileOpen(false); }}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-body transition-colors
                  ${active ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"}`}>
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button onClick={() => setCollapsed((c) => !c)} className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-body">
            <ChevronLeft size={18} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button onClick={logOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 font-body">
            <LogOut size={18} />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function GlobalSearch({ orders, products, customers, onNavigate }) {
  const [q, setQ] = useState(""); const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    if (q.trim().length < 2) return { orders: [], products: [], customers: [] };
    const lower = q.toLowerCase();
    return {
      orders: orders.filter((o) => o.id.toLowerCase().includes(lower) || o.customerName.toLowerCase().includes(lower)).slice(0, 4),
      products: products.filter((p) => p.name.toLowerCase().includes(lower)).slice(0, 4),
      customers: customers.filter((c) => c.name.toLowerCase().includes(lower)).slice(0, 4),
    };
  }, [q, orders, products, customers]);
  const hasResults = results.orders.length || results.products.length || results.customers.length;
  return (
    <div className="relative flex-1 max-w-md">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search orders, products, customers…"
        className="w-full pl-9 pr-3 py-2 text-sm font-body bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-indigo-300 focus:bg-white dark:focus:bg-slate-900 focus:outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
      {open && q.trim().length >= 2 && (
        <div className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-80 overflow-y-auto z-50">
          {!hasResults && <p className="text-xs text-slate-400 p-4 font-body">No results for "{q}"</p>}
          {results.orders.length > 0 && <SearchGroup label="Orders" items={results.orders.map((o) => ({ id: o.id, label: `${o.id} · ${o.customerName}`, sub: fmtCurrency(o.sales) }))} onSelect={() => { onNavigate("orders"); setOpen(false); }} />}
          {results.products.length > 0 && <SearchGroup label="Products" items={results.products.map((p) => ({ id: p.id, label: p.name, sub: p.category }))} onSelect={() => { onNavigate("products"); setOpen(false); }} />}
          {results.customers.length > 0 && <SearchGroup label="Customers" items={results.customers.map((c) => ({ id: c.id, label: c.name, sub: c.region }))} onSelect={() => { onNavigate("customers"); setOpen(false); }} />}
        </div>
      )}
    </div>
  );
}
function SearchGroup({ label, items, onSelect }) {
  return (
    <div className="p-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 px-2 py-1 font-body">{label}</p>
      {items.map((item) => (
        <button key={item.id} onMouseDown={onSelect} className="w-full text-left px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between">
          <span className="text-sm text-slate-700 dark:text-slate-200 font-body truncate">{item.label}</span>
          <span className="text-xs text-slate-400 font-body shrink-0 ml-2">{item.sub}</span>
        </button>
      ))}
    </div>
  );
}

function NotificationDropdown() {
  const { notifications, setNotifications } = useData();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const toneIcon = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle };
  const toneColor = { info: "text-indigo-500", success: "text-emerald-500", warning: "text-amber-500", error: "text-red-500" };
  return (
    <div className="relative">
      <button onClick={() => { setOpen((o) => !o); if (!open) setNotifications((ns) => ns.map((n) => ({ ...n, read: true }))); }}
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300">
        <Bell size={18} />
        {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100">Notifications</h4>
          </div>
          {notifications.length === 0 && <p className="text-xs text-slate-400 p-4 font-body">You're all caught up.</p>}
          {notifications.map((n) => {
            const Icon = toneIcon[n.type] || Info;
            return (
              <div key={n.id} className="flex gap-3 px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                <Icon size={16} className={`mt-0.5 shrink-0 ${toneColor[n.type]}`} />
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 font-body">{n.title}</p>
                  <p className="text-xs text-slate-400 font-body mt-0.5">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProfileMenu({ setPage, theme, setTheme }) {
  const { user, logOut } = useAuth();
  const [open, setOpen] = useState(false);
  const initials = (user?.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold font-body flex items-center justify-center">{initials}</div>
        <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-1.5">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-body truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 font-body truncate">{user?.email}</p>
          </div>
          <button onClick={() => { setPage("settings"); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-body"><User size={15}/> Profile</button>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-body">
            {theme === "dark" ? <Sun size={15}/> : <Moon size={15}/>} {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button onClick={logOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 font-body"><LogOut size={15}/> Log out</button>
        </div>
      )}
    </div>
  );
}

function Topbar({ setPage, setMobileOpen, theme, setTheme }) {
  const { orders, products, customers } = useData();
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 px-4 sm:px-6">
      <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-500"><Menu size={20} /></button>
      <GlobalSearch orders={orders} products={products} customers={customers} onNavigate={setPage} />
      <div className="flex-1" />
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="hidden sm:flex p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300">
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <NotificationDropdown />
      <ProfileMenu setPage={setPage} theme={theme} setTheme={setTheme} />
    </header>
  );
}

/* -------------------------------------------------------------------------
   LANDING PAGE
------------------------------------------------------------------------- */
const LANDING_TREND = [42,45,41,48,52,50,58,63,60,68,74,71,80,86,83,92,98,101,110,118];

function MiniSparkArea() {
  const w = 560, h = 220;
  const max = Math.max(...LANDING_TREND), min = Math.min(...LANDING_TREND);
  const pts = LANDING_TREND.map((v, i) => {
    const x = (i / (LANDING_TREND.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * (h - 30) - 10;
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const areaPath = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <defs>
        <linearGradient id="landingGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#landingGrad)" />
      <path d={path} fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => i === pts.length - 1 && <circle key={i} cx={p[0]} cy={p[1]} r="5" fill="#4F46E5" />)}
    </svg>
  );
}

function LandingPage({ onExplore, onGetStarted }) {
  const features = [
    { icon: TrendingUp, title: "Sales Analytics", desc: "Track revenue, profit, and growth across any date range, category, or region — updated the moment your data changes." },
    { icon: Users, title: "Customer Intelligence", desc: "Segment customers by value, spot who's at risk of churning, and see spending patterns as they form." },
    { icon: Package, title: "Product Performance", desc: "Know which products drive revenue, which drive profit, and which are quietly underperforming." },
    { icon: Boxes, title: "Inventory Monitoring", desc: "Live stock levels, reorder alerts, and inventory valuation so nothing runs out unnoticed." },
    { icon: Lightbulb, title: "Automated Insights", desc: "Plain-language findings calculated straight from your dataset — no dashboards to interpret by hand." },
    { icon: Upload, title: "Data Import & Export", desc: "Bring in orders from CSV with built-in validation, and export any filtered view back out in seconds." },
  ];
  const steps = [
    { n: "Import data", d: "Upload your order history as CSV, or start instantly with realistic demo data." },
    { n: "Analyze performance", d: "Explore revenue, customers, products, and inventory through interactive dashboards." },
    { n: "Discover insights", d: "Shoplytics surfaces the patterns worth knowing — automatically, from your real numbers." },
    { n: "Make better decisions", d: "Act on clear recommendations instead of digging through raw spreadsheets." },
  ];
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-body">
      <style>{FONT_IMPORT}</style>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={onExplore} className="hidden sm:inline-flex">Explore Dashboard</Button>
            <Button variant="primary" size="sm" onClick={onGetStarted}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-10 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <Badge tone="indigo" className="mb-5"><Sparkles size={12}/> Analytics built for e-commerce teams</Badge>
          <h1 className="font-display font-bold text-[2.3rem] leading-[1.08] sm:text-5xl sm:leading-[1.05] text-slate-900 dark:text-white tracking-tight">
            Turn E-Commerce Data Into Smarter Decisions
          </h1>
          <p className="mt-5 text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg">
            Shoplytics helps businesses understand sales, customers, products, and inventory through interactive analytics — so every decision is backed by the numbers, not a guess.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" onClick={onExplore}>Explore Dashboard <ArrowRight size={17}/></Button>
            <Button variant="outline" size="lg" onClick={onGetStarted}>Get Started</Button>
          </div>
          <div className="mt-9 flex items-center gap-6 text-xs text-slate-400 font-body">
            <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500"/> No credit card required</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500"/> Demo data included</span>
          </div>
        </div>
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 font-body">Revenue — trailing weeks</p>
              <p className="font-mono font-semibold text-2xl text-slate-800 dark:text-slate-100 mt-1">$118,420</p>
            </div>
            <ChangeIndicator value={24.6} />
          </div>
          <MiniSparkArea />
        </Card>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white text-center">Everything a modern commerce team needs</h2>
        <p className="text-slate-400 text-center mt-2 max-w-lg mx-auto">One workspace for the metrics that actually drive the business.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3.5">
                  <Icon size={19} />
                </div>
                <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100">{f.title}</h3>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-20 border-y border-slate-100 dark:border-slate-900">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white text-center">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="font-mono text-xs font-semibold text-indigo-500 mb-2">STEP {i + 1}</div>
                <h4 className="font-display font-semibold text-slate-800 dark:text-slate-100">{s.n}</h4>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{s.d}</p>
                {i < steps.length - 1 && <ArrowRight size={16} className="hidden lg:block absolute -right-6 top-1 text-slate-300" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">A dashboard that actually tells you something</h2>
          <p className="text-slate-400 mt-2">Real KPIs, real trends, real recommendations — generated from your data.</p>
        </div>
        <Card className="p-4 sm:p-6 overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { l: "Total Revenue", v: "$482,910", g: 18.2, tone: "indigo" },
              { l: "Total Profit", v: "$196,340", g: 12.4, tone: "mint" },
              { l: "Total Orders", v: "5,214", g: 9.1, tone: "amber" },
              { l: "Total Customers", v: "1,842", g: 6.5, tone: "coral" },
            ].map((k) => (
              <div key={k.l} className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <p className="text-[11px] text-slate-400 font-body">{k.l}</p>
                <p className="font-mono font-semibold text-lg text-slate-800 dark:text-slate-100 mt-1">{k.v}</p>
                <ChangeIndicator value={k.g} />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
            <MiniSparkArea />
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        <Card className="p-8 sm:p-12 text-center bg-indigo-600 border-0">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">See your store's story, all in one place</h2>
          <p className="text-indigo-100 mt-2 max-w-md mx-auto">Load realistic demo data in one click, or import your own — either way, you're looking at real analytics in under a minute.</p>
          <Button variant="secondary" size="lg" className="mt-6 bg-white text-indigo-600 hover:bg-indigo-50" onClick={onGetStarted}>Get Started Free</Button>
        </Card>
      </section>

      <footer className="border-t border-slate-100 dark:border-slate-900 py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo />
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-body">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">About</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Features</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Documentation</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">GitHub</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Contact</span>
          </div>
          <p className="text-xs text-slate-300 font-body">© 2026 Shoplytics</p>
        </div>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------
   AUTH PAGES
------------------------------------------------------------------------- */
function AuthShell({ children, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-10 font-body">
      <style>{FONT_IMPORT}</style>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6"><Logo /></div>
        {subtitle && <p className="text-center text-sm text-slate-400 mb-6 -mt-3">{subtitle}</p>}
        <Card className="p-6 sm:p-7">{children}</Card>
      </div>
    </div>
  );
}

function TextField({ label, error, ...rest }) {
  return (
    <label className="block mb-4">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-body">{label}</span>
      <input {...rest}
        className={`mt-1.5 w-full px-3.5 py-2.5 text-sm font-body rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${error ? "border-red-300" : "border-slate-200 dark:border-slate-700"}`} />
      {error && <span className="text-xs text-red-500 font-body mt-1 block">{error}</span>}
    </label>
  );
}

function PasswordField({ label, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block mb-4">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-body">{label}</span>
      <div className="relative mt-1.5">
        <input type={show ? "text" : "password"} value={value} onChange={onChange}
          className={`w-full px-3.5 py-2.5 pr-10 text-sm font-body rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${error ? "border-red-300" : "border-slate-200 dark:border-slate-700"}`} />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {show ? <EyeOff size={16}/> : <Eye size={16}/>}
        </button>
      </div>
      {error && <span className="text-xs text-red-500 font-body mt-1 block">{error}</span>}
    </label>
  );
}

function LoginPage({ goTo }) {
  const { logIn } = useAuth();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await logIn({ email, password }); toast?.push({ tone: "success", title: "Welcome back" }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return (
    <AuthShell subtitle="Log in to your Shoplytics workspace">
      <form onSubmit={submit}>
        <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        <PasswordField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-xs text-red-500 font-body mb-3 flex items-center gap-1.5"><AlertCircle size={13}/>{error}</p>}
        <div className="flex justify-end mb-4">
          <button type="button" onClick={() => goTo("forgot")} className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 font-body">Forgot password?</button>
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>{loading ? "Logging in…" : "Log in"}</Button>
      </form>
      <p className="text-center text-sm text-slate-400 font-body mt-5">Don't have an account? <button onClick={() => goTo("signup")} className="text-indigo-600 font-semibold">Sign up</button></p>
      <button onClick={() => goTo("landing")} className="w-full text-center text-xs text-slate-400 font-body mt-4">← Back to homepage</button>
    </AuthShell>
  );
}

function SignupPage({ goTo }) {
  const { signUp } = useAuth();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await signUp({ name, email, password }); toast?.push({ tone: "success", title: "Account created", message: "Welcome to Shoplytics!" }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return (
    <AuthShell subtitle="Create your Shoplytics account">
      <form onSubmit={submit}>
        <TextField label="Full name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Blake" />
        <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        <PasswordField label="Password (min. 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-xs text-red-500 font-body mb-3 flex items-center gap-1.5"><AlertCircle size={13}/>{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>{loading ? "Creating account…" : "Create account"}</Button>
      </form>
      <p className="text-center text-sm text-slate-400 font-body mt-5">Already have an account? <button onClick={() => goTo("login")} className="text-indigo-600 font-semibold">Log in</button></p>
      <button onClick={() => goTo("landing")} className="w-full text-center text-xs text-slate-400 font-body mt-4">← Back to homepage</button>
    </AuthShell>
  );
}

function ForgotPasswordPage({ goTo }) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState(""); const [error, setError] = useState(""); const [sent, setSent] = useState(null); const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { const token = await requestPasswordReset(email); setSent(token); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  if (sent) {
    return (
      <AuthShell subtitle="Check your reset code">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-3"><CheckCircle2 size={22} className="text-emerald-500"/></div>
          <p className="text-sm text-slate-500 font-body mb-1">In production this code is emailed to you. For this demo, here it is:</p>
          <p className="font-mono text-2xl font-bold text-indigo-600 tracking-widest my-3">{sent}</p>
          <Button variant="primary" className="w-full" onClick={() => goTo("reset", { email })}>Continue to reset</Button>
        </div>
      </AuthShell>
    );
  }
  return (
    <AuthShell subtitle="We'll send you a reset code">
      <form onSubmit={submit}>
        <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        {error && <p className="text-xs text-red-500 font-body mb-3 flex items-center gap-1.5"><AlertCircle size={13}/>{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>{loading ? "Sending…" : "Send reset code"}</Button>
      </form>
      <button onClick={() => goTo("login")} className="w-full text-center text-xs text-slate-400 font-body mt-4">← Back to login</button>
    </AuthShell>
  );
}

function ResetPasswordPage({ goTo, prefillEmail }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(prefillEmail || ""); const [token, setToken] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await resetPassword({ email, token, newPassword: password }); toast?.push({ tone: "success", title: "Password reset", message: "You can now log in." }); goTo("login"); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return (
    <AuthShell subtitle="Set a new password">
      <form onSubmit={submit}>
        <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Reset code" required value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} placeholder="6-character code" />
        <PasswordField label="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-xs text-red-500 font-body mb-3 flex items-center gap-1.5"><AlertCircle size={13}/>{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>{loading ? "Resetting…" : "Reset password"}</Button>
      </form>
      <button onClick={() => goTo("login")} className="w-full text-center text-xs text-slate-400 font-body mt-4">← Back to login</button>
    </AuthShell>
  );
}

/* -------------------------------------------------------------------------
   OVERVIEW DASHBOARD
------------------------------------------------------------------------- */
function OverviewPage({ filters, setFilters }) {
  const { orders, products, customers, loading, hasDemoData, loadDemoData } = useData();
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const filtered = useMemo(() => applyFilters(orders, filters), [orders, filters]);
  const kpis = useMemo(() => computeKPIs(filtered, orders, filters), [filtered, orders, filters]);
  const monthly = useMemo(() => groupByDate(filtered, "month"), [filtered]);
  const byCategory = useMemo(() => groupBy(filtered.filter(o=>o.status!=="Cancelled"), (o) => o.category), [filtered]);
  const byRegion = useMemo(() => groupBy(filtered.filter(o=>o.status!=="Cancelled"), (o) => o.region), [filtered]);
  const top = useMemo(() => topProducts(filtered, 5), [filtered]);
  const recent = useMemo(() => [...orders].sort((a,b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 6), [orders]);

  if (loading) return <LoadingSpinner label="Loading your dashboard" />;
  if (!hasDemoData) {
    return (
      <EmptyState icon={DatabaseZap} title="No data yet"
        message="Load realistic demo data to explore every feature instantly, or head to Data Import to bring in your own orders."
        action={<div className="flex gap-2"><Button onClick={loadDemoData}><Sparkles size={15}/> Load Demo Data</Button></div>} />
    );
  }

  return (
    <div className="space-y-5">
      <FilterBar filters={filters} setFilters={setFilters} products={products} customers={customers} />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <KPICard label="Total Revenue" value={fmtCurrency(kpis.revenue, currency)} growth={kpis.revenueGrowth} icon={Wallet} tone="indigo" description="vs. previous period" />
        <KPICard label="Total Orders" value={fmtNum(kpis.orderCount)} growth={kpis.orderGrowth} icon={ShoppingCart} tone="amber" description="vs. previous period" />
        <KPICard label="Total Profit" value={fmtCurrency(kpis.profit, currency)} growth={kpis.profitGrowth} icon={TrendingUp} tone="mint" description="vs. previous period" />
        <KPICard label="Total Customers" value={fmtNum(kpis.customerCount)} growth={kpis.customerGrowth} icon={Users} tone="coral" description="unique buyers" />
        <KPICard label="Avg. Order Value" value={fmtCurrencyPrecise(kpis.aov, currency)} growth={kpis.aovGrowth} icon={CreditCard} tone="indigo" description="per order" />
        <KPICard label="Profit Margin" value={`${kpis.margin.toFixed(1)}%`} growth={kpis.marginGrowth} icon={PieChartIcon} tone="mint" description="of revenue" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><ChartCard title="Revenue Trend" subtitle="Monthly revenue across the selected range"><RevenueAreaChart data={monthly} currency={currency} /></ChartCard></div>
        <ChartCard title="Sales by Region"><RegionPieChart data={byRegion} currency={currency} /></ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Profit Trend" subtitle="Monthly profit"><ProfitLineChart data={monthly} currency={currency} /></ChartCard>
        <ChartCard title="Sales by Category"><CategoryBarChart data={byCategory} currency={currency} /></ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100 mb-4">Top Products</h3>
          <div className="space-y-3">
            {top.map((p, i) => (
              <div key={p.key} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold text-slate-500 flex items-center justify-center shrink-0">{i+1}</span>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate font-body">{p.key}</p></div>
                <p className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-200">{fmtCurrency(p.revenue, currency)}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100">Recent Orders</h3>
            <button className="text-xs font-semibold text-indigo-600 font-body">View All</button>
          </div>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs font-body">
              <thead><tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-2 px-1 font-medium">Order</th><th className="pb-2 px-1 font-medium">Customer</th><th className="pb-2 px-1 font-medium">Amount</th><th className="pb-2 px-1 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <td className="py-2 px-1 font-mono text-slate-500">{o.id}</td>
                    <td className="py-2 px-1 text-slate-600 dark:text-slate-300 truncate max-w-[100px]">{o.customerName}</td>
                    <td className="py-2 px-1 font-mono text-slate-700 dark:text-slate-200">{fmtCurrency(o.sales, currency)}</td>
                    <td className="py-2 px-1"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   SALES ANALYTICS PAGE
------------------------------------------------------------------------- */
function SalesAnalyticsPage({ filters, setFilters }) {
  const { orders, products, customers, loading, hasDemoData, loadDemoData } = useData();
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const [granularity, setGranularity] = useState("month");
  const filtered = useMemo(() => applyFilters(orders, filters), [orders, filters]);
  const kpis = useMemo(() => computeKPIs(filtered, orders, filters), [filtered, orders, filters]);
  const trend = useMemo(() => groupByDate(filtered, granularity), [filtered, granularity]);
  const byCategory = useMemo(() => groupBy(filtered.filter(o=>o.status!=="Cancelled"), (o) => o.category), [filtered]);
  const byRegion = useMemo(() => groupBy(filtered.filter(o=>o.status!=="Cancelled"), (o) => o.region), [filtered]);
  const byPayment = useMemo(() => groupBy(filtered.filter(o=>o.status!=="Cancelled"), (o) => o.paymentMethod), [filtered]);

  if (loading) return <LoadingSpinner label="Loading sales analytics" />;
  if (!hasDemoData) return <EmptyState title="No sales data yet" message="Load demo data to explore sales analytics." action={<Button onClick={loadDemoData}><Sparkles size={15}/> Load Demo Data</Button>} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">Sales Analytics</h1><p className="text-sm text-slate-400 font-body">Revenue, profit, and order performance for the selected period.</p></div>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} products={products} customers={customers} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <KPICard label="Revenue" value={fmtCurrency(kpis.revenue, currency)} growth={kpis.revenueGrowth} icon={Wallet} tone="indigo" />
        <KPICard label="Profit" value={fmtCurrency(kpis.profit, currency)} growth={kpis.profitGrowth} icon={TrendingUp} tone="mint" />
        <KPICard label="Orders" value={fmtNum(kpis.orderCount)} growth={kpis.orderGrowth} icon={ShoppingCart} tone="amber" />
        <KPICard label="Avg. Order Value" value={fmtCurrencyPrecise(kpis.aov, currency)} growth={kpis.aovGrowth} icon={CreditCard} tone="indigo" />
        <KPICard label="Growth Rate" value={fmtPct(kpis.revenueGrowth)} icon={Zap} tone="mint" description="revenue vs. prior period" />
      </div>

      <ChartCard title="Sales Over Time" subtitle="Toggle granularity to compare daily, weekly, or monthly performance"
        action={<div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {["day","week","month"].map((g) => (
            <button key={g} onClick={() => setGranularity(g)} className={`px-2.5 py-1 rounded-md text-xs font-semibold font-body capitalize ${granularity===g ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-400"}`}>{g}</button>
          ))}
        </div>} height={300}>
        <RevenueAreaChart data={trend} currency={currency} />
      </ChartCard>

      <ChartCard title="Revenue vs Profit" subtitle="Monthly comparison" height={300}>
        {trend.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="key" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => fmtCurrency(v, currency)} width={64} />
              <Tooltip {...tooltipStyle} formatter={(v) => fmtCurrency(v, currency)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" name="Revenue" fill={BRAND.indigo} radius={[6,6,0,0]} />
              <Bar dataKey="profit" name="Profit" fill={BRAND.mint} radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState title="No data" message="No sales in this range." />}
      </ChartCard>

      <div className="grid lg:grid-cols-3 gap-4">
        <ChartCard title="Sales by Category"><CategoryBarChart data={byCategory} currency={currency} /></ChartCard>
        <ChartCard title="Sales by Region"><RegionPieChart data={byRegion} currency={currency} /></ChartCard>
        <ChartCard title="Sales by Payment Method">
          {byPayment.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPayment.sort((a,b)=>b.revenue-a.revenue)} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v)=>fmtCurrency(v,currency)} />
                <YAxis type="category" dataKey="key" tick={{ fontSize: 10, fill: "#94a3b8" }} width={90} />
                <Tooltip {...tooltipStyle} formatter={(v) => fmtCurrency(v, currency)} />
                <Bar dataKey="revenue" radius={[0,6,6,0]}>
                  {byPayment.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No data" message="No payment data in range." />}
        </ChartCard>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   CUSTOMER ANALYTICS PAGE
------------------------------------------------------------------------- */
function CustomerAnalyticsPage({ filters, setFilters }) {
  const { orders, products, customers, loading, hasDemoData, loadDemoData } = useData();
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const filtered = useMemo(() => applyFilters(orders, filters), [orders, filters]);
  const valid = useMemo(() => filtered.filter((o) => o.status !== "Cancelled"), [filtered]);

  const { spend, segmentOf } = useMemo(() => customerSegments(valid, customers), [valid, customers]);
  const uniqueCustomerIds = useMemo(() => new Set(valid.map((o) => o.customerId)), [valid]);
  const monthly = useMemo(() => groupByDate(valid, "month"), [valid]);

  const newVsReturning = useMemo(() => {
    const firstOrder = new Map();
    [...orders].sort((a,b)=>new Date(a.orderDate)-new Date(b.orderDate)).forEach((o) => { if (!firstOrder.has(o.customerId)) firstOrder.set(o.customerId, o.orderDate); });
    let newC = 0, returning = 0;
    uniqueCustomerIds.forEach((cid) => {
      const custOrdersInRange = valid.filter((o) => o.customerId === cid);
      const isNew = custOrdersInRange.some((o) => o.orderDate === firstOrder.get(cid));
      if (isNew) newC++; else returning++;
    });
    return [{ key: "New", revenue: newC }, { key: "Returning", revenue: returning }];
  }, [orders, valid, uniqueCustomerIds]);

  const regionDist = useMemo(() => groupBy(valid, (o) => o.region), [valid]);

  const spendBuckets = useMemo(() => {
    const buckets = [{ key: "$0-50", revenue: 0 }, { key: "$50-150", revenue: 0 }, { key: "$150-300", revenue: 0 }, { key: "$300-600", revenue: 0 }, { key: "$600+", revenue: 0 }];
    spend.forEach((v) => {
      if (v < 50) buckets[0].revenue++; else if (v < 150) buckets[1].revenue++; else if (v < 300) buckets[2].revenue++; else if (v < 600) buckets[3].revenue++; else buckets[4].revenue++;
    });
    return buckets;
  }, [spend]);

  const customerTable = useMemo(() => {
    const map = new Map();
    valid.forEach((o) => {
      if (!map.has(o.customerId)) map.set(o.customerId, { id: o.customerId, name: o.customerName, orders: 0, spend: 0, lastPurchase: o.orderDate });
      const r = map.get(o.customerId);
      r.orders += 1; r.spend += o.sales;
      if (new Date(o.orderDate) > new Date(r.lastPurchase)) r.lastPurchase = o.orderDate;
    });
    return Array.from(map.values()).map((c) => ({ ...c, aov: c.spend / c.orders, segment: segmentOf(c.spend) })).sort((a,b) => b.spend - a.spend);
  }, [valid, segmentOf]);

  const [sortKey, setSortKey] = useState("spend");
  const [segmentFilter, setSegmentFilter] = useState("All");
  const displayed = useMemo(() => {
    let rows = [...customerTable];
    if (segmentFilter !== "All") rows = rows.filter((r) => r.segment === segmentFilter);
    rows.sort((a,b) => b[sortKey] - a[sortKey]);
    return rows.slice(0, 50);
  }, [customerTable, sortKey, segmentFilter]);

  const avgSpend = valid.length ? valid.reduce((s,o)=>s+o.sales,0) / (uniqueCustomerIds.size || 1) : 0;
  const avgFrequency = uniqueCustomerIds.size ? valid.length / uniqueCustomerIds.size : 0;
  const segmentTone = { "High Value": "positive", Regular: "indigo", Occasional: "warning", "At Risk": "negative" };

  if (loading) return <LoadingSpinner label="Loading customer analytics" />;
  if (!hasDemoData) return <EmptyState title="No customer data yet" message="Load demo data to explore customer analytics." action={<Button onClick={loadDemoData}><Sparkles size={15}/> Load Demo Data</Button>} />;

  return (
    <div className="space-y-5">
      <div><h1 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">Customer Analytics</h1><p className="text-sm text-slate-400 font-body">Who's buying, how often, and how much they're worth.</p></div>
      <FilterBar filters={filters} setFilters={setFilters} products={products} customers={customers} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <KPICard label="Total Customers" value={fmtNum(uniqueCustomerIds.size)} icon={Users} tone="indigo" />
        <KPICard label="New Customers" value={fmtNum(newVsReturning[0].revenue)} icon={Sparkles} tone="mint" />
        <KPICard label="Returning Customers" value={fmtNum(newVsReturning[1].revenue)} icon={RefreshCw} tone="amber" />
        <KPICard label="Avg. Customer Value" value={fmtCurrencyPrecise(avgSpend, currency)} icon={Wallet} tone="indigo" />
        <KPICard label="Avg. Order Frequency" value={avgFrequency.toFixed(1)} icon={ShoppingCart} tone="mint" description="orders / customer" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <ChartCard title="New vs Returning">
          {(newVsReturning[0].revenue + newVsReturning[1].revenue) > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={newVsReturning} dataKey="revenue" nameKey="key" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={2}>
                  {newVsReturning.map((_, i) => <Cell key={i} fill={[BRAND.indigo, BRAND.mint][i]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No data" message="No customers in range." />}
        </ChartCard>
        <ChartCard title="Spending Distribution" subtitle="Customers by lifetime spend bucket">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendBuckets} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="key" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} width={30} />
              <Tooltip {...tooltipStyle} formatter={(v)=>`${v} customers`} />
              <Bar dataKey="revenue" fill={BRAND.indigo} radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Regional Distribution"><RegionPieChart data={regionDist} currency={currency} /></ChartCard>
      </div>

      <ChartCard title="Customer Growth Over Time" subtitle="New unique customers per month" height={260}>
        {monthly.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="key" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} width={30} />
              <Tooltip {...tooltipStyle} formatter={(v)=>`${v} orders`} />
              <Line type="monotone" dataKey="orders" stroke={BRAND.indigo} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyState title="No data" message="No trend data in range." />}
      </ChartCard>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100">Customers</h3>
          <div className="flex gap-2">
            <select value={segmentFilter} onChange={(e)=>setSegmentFilter(e.target.value)} className="text-xs font-body bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
              <option value="All">All segments</option>
              {["High Value","Regular","Occasional","At Risk"].map((s)=><option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sortKey} onChange={(e)=>setSortKey(e.target.value)} className="text-xs font-body bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
              <option value="spend">Sort: Total spend</option>
              <option value="orders">Sort: Orders</option>
              <option value="aov">Sort: Avg. order value</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[600px]">
            <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="pb-2 font-medium">Customer</th><th className="pb-2 font-medium">Orders</th><th className="pb-2 font-medium">Total Spending</th><th className="pb-2 font-medium">Avg. Order Value</th><th className="pb-2 font-medium">Last Purchase</th><th className="pb-2 font-medium">Segment</th>
            </tr></thead>
            <tbody>
              {displayed.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                  <td className="py-2.5 text-slate-700 dark:text-slate-200">{c.name}</td>
                  <td className="py-2.5 font-mono text-slate-500">{c.orders}</td>
                  <td className="py-2.5 font-mono text-slate-700 dark:text-slate-200">{fmtCurrency(c.spend, currency)}</td>
                  <td className="py-2.5 font-mono text-slate-500">{fmtCurrencyPrecise(c.aov, currency)}</td>
                  <td className="py-2.5 text-slate-500">{c.lastPurchase}</td>
                  <td className="py-2.5"><Badge tone={segmentTone[c.segment]}>{c.segment}</Badge></td>
                </tr>
              ))}
              {!displayed.length && <tr><td colSpan={6}><EmptyState title="No customers" message="No customers match this filter." /></td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------
   PRODUCT ANALYTICS PAGE
------------------------------------------------------------------------- */
function ProductAnalyticsPage({ filters, setFilters }) {
  const { orders, products, customers, loading, hasDemoData, loadDemoData } = useData();
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const filtered = useMemo(() => applyFilters(orders, filters), [orders, filters]);
  const valid = useMemo(() => filtered.filter((o) => o.status !== "Cancelled"), [filtered]);
  const [sortKey, setSortKey] = useState("revenue");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const byProduct = useMemo(() => {
    let rows = groupBy(valid, (o) => o.productName).map((p) => {
      const sampleOrder = valid.find((o) => o.productName === p.key);
      return { ...p, category: sampleOrder?.category || "—", margin: p.revenue ? (p.profit / p.revenue) * 100 : 0 };
    });
    if (categoryFilter !== "All") rows = rows.filter((r) => r.category === categoryFilter);
    return rows;
  }, [valid, categoryFilter]);

  const sorted = useMemo(() => [...byProduct].sort((a,b) => b[sortKey] - a[sortKey]), [byProduct, sortKey]);
  const top10Revenue = sorted.slice(0, 10);
  const top10Profit = useMemo(() => [...byProduct].sort((a,b)=>b.profit-a.profit).slice(0,10), [byProduct]);
  const categoryPerf = useMemo(() => groupBy(valid, (o) => o.category), [valid]);
  const avgMargin = byProduct.length ? byProduct.reduce((s,p)=>s+p.margin,0)/byProduct.length : 0;

  const best = sorted[0];
  const mostProfitable = top10Profit[0];
  const lowest = [...byProduct].sort((a,b) => a.revenue - b.revenue)[0];

  if (loading) return <LoadingSpinner label="Loading product analytics" />;
  if (!hasDemoData) return <EmptyState title="No product data yet" message="Load demo data to explore product analytics." action={<Button onClick={loadDemoData}><Sparkles size={15}/> Load Demo Data</Button>} />;

  return (
    <div className="space-y-5">
      <div><h1 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">Product Analytics</h1><p className="text-sm text-slate-400 font-body">Performance and profitability across the catalogue.</p></div>
      <FilterBar filters={filters} setFilters={setFilters} products={products} customers={customers} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard label="Total Products" value={fmtNum(products.length)} icon={Package} tone="indigo" />
        <KPICard label="Best-Selling Product" value={best?.key || "—"} icon={TrendingUp} tone="mint" description={best ? fmtCurrency(best.revenue, currency) : ""} />
        <KPICard label="Most Profitable" value={mostProfitable?.key || "—"} icon={Sparkles} tone="amber" description={mostProfitable ? fmtCurrency(mostProfitable.profit, currency) : ""} />
        <KPICard label="Lowest-Performing" value={lowest?.key || "—"} icon={AlertTriangle} tone="coral" description={lowest ? fmtCurrency(lowest.revenue, currency) : ""} />
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)} className="text-xs font-body bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
          <option value="All">All categories</option>
          {CATEGORIES.map((c)=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sortKey} onChange={(e)=>setSortKey(e.target.value)} className="text-xs font-body bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
          <option value="revenue">Sort: Revenue</option>
          <option value="profit">Sort: Profit</option>
          <option value="qty">Sort: Quantity sold</option>
          <option value="margin">Sort: Profit margin</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Top 10 Products by Revenue">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10Revenue} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v)=>fmtCurrency(v,currency)} />
              <YAxis type="category" dataKey="key" tick={{ fontSize: 9, fill: "#94a3b8" }} width={130} />
              <Tooltip {...tooltipStyle} formatter={(v)=>fmtCurrency(v,currency)} />
              <Bar dataKey="revenue" fill={BRAND.indigo} radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Top 10 Products by Profit">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10Profit} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v)=>fmtCurrency(v,currency)} />
              <YAxis type="category" dataKey="key" tick={{ fontSize: 9, fill: "#94a3b8" }} width={130} />
              <Tooltip {...tooltipStyle} formatter={(v)=>fmtCurrency(v,currency)} />
              <Bar dataKey="profit" fill={BRAND.mint} radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Category Performance"><CategoryBarChart data={categoryPerf} currency={currency} /></ChartCard>
        <ChartCard title="Profit Margin by Product" subtitle={`Catalogue average: ${avgMargin.toFixed(1)}%`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sorted.slice(0,10)} margin={{ top: 5, right: 5, left: -15, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="key" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v)=>`${v}%`} width={40} />
              <Tooltip {...tooltipStyle} formatter={(v)=>`${v.toFixed(1)}%`} />
              <Bar dataKey="margin" radius={[6,6,0,0]}>
                {sorted.slice(0,10).map((p, i) => <Cell key={i} fill={p.margin < avgMargin - 5 ? BRAND.coral : p.margin > avgMargin + 5 ? BRAND.mint : BRAND.amber} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="p-5">
        <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100 mb-4">Product Performance Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[700px]">
            <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Category</th><th className="pb-2 font-medium">Revenue</th><th className="pb-2 font-medium">Profit</th><th className="pb-2 font-medium">Margin</th><th className="pb-2 font-medium">Units Sold</th><th className="pb-2 font-medium">Signal</th>
            </tr></thead>
            <tbody>
              {sorted.slice(0, 15).map((p) => {
                let signal = { label: "Healthy", tone: "positive" };
                if (p.revenue > (sorted[0]?.revenue || 0) * 0.4 && p.margin < avgMargin - 5) signal = { label: "High rev, low margin", tone: "warning" };
                else if (p.revenue < (sorted[0]?.revenue || 1) * 0.1) signal = { label: "Low performer", tone: "negative" };
                return (
                  <tr key={p.key} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <td className="py-2.5 text-slate-700 dark:text-slate-200">{p.key}</td>
                    <td className="py-2.5 text-slate-500">{p.category}</td>
                    <td className="py-2.5 font-mono text-slate-700 dark:text-slate-200">{fmtCurrency(p.revenue, currency)}</td>
                    <td className="py-2.5 font-mono text-slate-500">{fmtCurrency(p.profit, currency)}</td>
                    <td className="py-2.5 font-mono text-slate-500">{p.margin.toFixed(1)}%</td>
                    <td className="py-2.5 font-mono text-slate-500">{p.qty}</td>
                    <td className="py-2.5"><Badge tone={signal.tone}>{signal.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------
   ORDERS PAGE
------------------------------------------------------------------------- */
function OrderDetailsModal({ order, onClose, currency, onStatusChange }) {
  if (!order) return null;
  return (
    <Modal open={!!order} onClose={onClose} title={`Order ${order.id}`} size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-slate-400 font-body">Customer</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-body">{order.customerName}</p></div>
          <div><p className="text-xs text-slate-400 font-body">Product</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-body">{order.productName}</p></div>
          <div><p className="text-xs text-slate-400 font-body">Category</p><p className="text-sm text-slate-600 dark:text-slate-300 font-body">{order.category}</p></div>
          <div><p className="text-xs text-slate-400 font-body">Quantity</p><p className="text-sm font-mono text-slate-600 dark:text-slate-300">{order.quantity}</p></div>
          <div><p className="text-xs text-slate-400 font-body">Revenue</p><p className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-200">{fmtCurrency(order.sales, currency)}</p></div>
          <div><p className="text-xs text-slate-400 font-body">Profit</p><p className="text-sm font-mono font-semibold text-emerald-600">{fmtCurrency(order.profit, currency)}</p></div>
          <div><p className="text-xs text-slate-400 font-body">Order Date</p><p className="text-sm text-slate-600 dark:text-slate-300 font-body">{order.orderDate}</p></div>
          <div><p className="text-xs text-slate-400 font-body">Payment Method</p><p className="text-sm text-slate-600 dark:text-slate-300 font-body">{order.paymentMethod}</p></div>
          <div><p className="text-xs text-slate-400 font-body">Region</p><p className="text-sm text-slate-600 dark:text-slate-300 font-body">{order.region}</p></div>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-body mb-1.5">Status</p>
          <select value={order.status} onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="text-sm font-body bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 w-full">
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}

function OrdersPage({ filters, setFilters }) {
  const { orders, products, customers, loading, hasDemoData, loadDemoData, updateOrderStatus, deleteOrder } = useData();
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 12;

  const filtered = useMemo(() => {
    let rows = applyFilters(orders, filters);
    if (statusFilter !== "All") rows = rows.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.productName.toLowerCase().includes(q));
    }
    return rows;
  }, [orders, filters, statusFilter, search]);

  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const exportOrders = () => {
    downloadCSV("shoplytics-orders.csv", filtered, ["id","customerName","productName","category","quantity","sales","profit","orderDate","paymentMethod","status"]);
    toast?.push({ tone: "success", title: "Export ready", message: `${filtered.length} orders exported.` });
  };

  if (loading) return <LoadingSpinner label="Loading orders" />;
  if (!hasDemoData) return <EmptyState title="No orders yet" message="Load demo data or import orders to get started." action={<Button onClick={loadDemoData}><Sparkles size={15}/> Load Demo Data</Button>} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">Orders</h1><p className="text-sm text-slate-400 font-body">{fmtNum(filtered.length)} orders match your filters.</p></div>
        <Button variant="outline" onClick={exportOrders}><Download size={15}/> Export CSV</Button>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} products={products} customers={customers} />

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search order ID, customer, product…"
              className="w-full pl-8 pr-3 py-2 text-sm font-body bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="text-sm font-body bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
            <option value="All">All statuses</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[760px]">
            <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="pb-2 font-medium">Order ID</th><th className="pb-2 font-medium">Customer</th><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Category</th><th className="pb-2 font-medium">Qty</th><th className="pb-2 font-medium">Revenue</th><th className="pb-2 font-medium">Profit</th><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Payment</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium"></th>
            </tr></thead>
            <tbody>
              {pageRows.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 font-mono text-xs text-slate-500">{o.id}</td>
                  <td className="py-2.5 text-slate-700 dark:text-slate-200 max-w-[130px] truncate">{o.customerName}</td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300 max-w-[150px] truncate">{o.productName}</td>
                  <td className="py-2.5 text-slate-500">{o.category}</td>
                  <td className="py-2.5 font-mono text-slate-500">{o.quantity}</td>
                  <td className="py-2.5 font-mono text-slate-700 dark:text-slate-200">{fmtCurrency(o.sales, currency)}</td>
                  <td className="py-2.5 font-mono text-slate-500">{fmtCurrency(o.profit, currency)}</td>
                  <td className="py-2.5 text-slate-500">{o.orderDate}</td>
                  <td className="py-2.5 text-slate-500">{o.paymentMethod}</td>
                  <td className="py-2.5"><StatusBadge status={o.status} /></td>
                  <td className="py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => setSelected(o)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><Eye size={14}/></button>
                      <button onClick={() => setToDelete(o)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!pageRows.length && <tr><td colSpan={11}><EmptyState title="No orders found" message="Try adjusting your search or filters." /></td></tr>}
            </tbody>
          </table>
        </div>

        {filtered.length > perPage && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 font-body">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14}/></Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14}/></Button>
            </div>
          </div>
        )}
      </Card>

      <OrderDetailsModal order={selected} onClose={() => setSelected(null)} currency={currency} onStatusChange={updateOrderStatus} />
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => deleteOrder(toDelete.id)}
        title="Delete this order?" message={`This will permanently remove order ${toDelete?.id}. This action cannot be undone.`} />
    </div>
  );
}

/* -------------------------------------------------------------------------
   INVENTORY PAGE
------------------------------------------------------------------------- */
function inventoryStatus(p) {
  if (p.stock === 0) return "Out of Stock";
  if (p.stock <= p.reorderLevel * 0.5) return "Critical";
  if (p.stock <= p.reorderLevel) return "Low Stock";
  return "In Stock";
}

function InventoryPage() {
  const { products, loading, hasDemoData, loadDemoData, updateProductStock } = useData();
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [newStock, setNewStock] = useState("");

  const rows = useMemo(() => products.map((p) => ({ ...p, status: inventoryStatus(p), value: p.stock * p.price })), [products]);
  const totalValue = rows.reduce((s, p) => s + p.value, 0);
  const lowStock = rows.filter((p) => p.status === "Low Stock" || p.status === "Critical");
  const outOfStock = rows.filter((p) => p.status === "Out of Stock");

  const saveStock = async () => {
    const val = parseInt(newStock, 10);
    if (isNaN(val) || val < 0) { toast?.push({ tone: "error", title: "Invalid value", message: "Stock must be a non-negative number." }); return; }
    await updateProductStock(editing.id, val);
    toast?.push({ tone: "success", title: "Stock updated", message: `${editing.name} set to ${val} units.` });
    setEditing(null);
  };

  if (loading) return <LoadingSpinner label="Loading inventory" />;
  if (!hasDemoData) return <EmptyState title="No inventory yet" message="Load demo data to see inventory levels." action={<Button onClick={loadDemoData}><Sparkles size={15}/> Load Demo Data</Button>} />;

  return (
    <div className="space-y-5">
      <div><h1 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">Inventory</h1><p className="text-sm text-slate-400 font-body">Stock levels and valuation across the catalogue.</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard label="Total Products" value={fmtNum(products.length)} icon={Package} tone="indigo" />
        <KPICard label="Total Inventory Value" value={fmtCurrency(totalValue, currency)} icon={Wallet} tone="mint" />
        <KPICard label="Low-Stock Products" value={fmtNum(lowStock.length)} icon={AlertTriangle} tone="amber" />
        <KPICard label="Out-of-Stock Products" value={fmtNum(outOfStock.length)} icon={AlertCircle} tone="coral" />
      </div>

      {lowStock.length > 0 && (
        <Card className="p-4 sm:p-5 border-amber-200 dark:border-amber-900">
          <h3 className="font-display font-semibold text-sm text-amber-600 flex items-center gap-2 mb-3"><AlertTriangle size={16}/> Low Stock Alerts</h3>
          <div className="flex flex-wrap gap-2">
            {lowStock.slice(0, 10).map((p) => (
              <span key={p.id} className="text-xs font-body px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400">{p.name} — {p.stock} left</span>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100 mb-4">Inventory Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[700px]">
            <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Category</th><th className="pb-2 font-medium">Stock</th><th className="pb-2 font-medium">Reorder Level</th><th className="pb-2 font-medium">Unit Price</th><th className="pb-2 font-medium">Inventory Value</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium"></th>
            </tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                  <td className="py-2.5 text-slate-700 dark:text-slate-200">{p.name}</td>
                  <td className="py-2.5 text-slate-500">{p.category}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${p.status==="Out of Stock"?"bg-red-500":p.status==="Critical"?"bg-red-400":p.status==="Low Stock"?"bg-amber-400":"bg-emerald-500"}`} style={{ width: `${Math.min(100,(p.stock/(p.reorderLevel*3))*100)}%` }} />
                      </div>
                      <span className="font-mono text-slate-600 dark:text-slate-300">{p.stock}</span>
                    </div>
                  </td>
                  <td className="py-2.5 font-mono text-slate-500">{p.reorderLevel}</td>
                  <td className="py-2.5 font-mono text-slate-500">{fmtCurrencyPrecise(p.price, currency)}</td>
                  <td className="py-2.5 font-mono text-slate-700 dark:text-slate-200">{fmtCurrency(p.value, currency)}</td>
                  <td className="py-2.5"><StatusBadge status={p.status} /></td>
                  <td className="py-2.5"><button onClick={() => { setEditing(p); setNewStock(String(p.stock)); }} className="text-xs font-semibold text-indigo-600 font-body">Adjust</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Adjust Stock — ${editing?.name || ""}`} size="sm"
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveStock}>Save</Button></>}>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-body">New stock quantity</span>
          <input type="number" min="0" value={newStock} onChange={(e) => setNewStock(e.target.value)}
            className="mt-1.5 w-full px-3.5 py-2.5 text-sm font-body rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </label>
      </Modal>
    </div>
  );
}

/* -------------------------------------------------------------------------
   INSIGHTS PAGE
------------------------------------------------------------------------- */
function InsightsPage({ filters, setFilters }) {
  const { orders, products, customers, loading, hasDemoData, loadDemoData } = useData();
  const filtered = useMemo(() => applyFilters(orders, filters), [orders, filters]);
  const insights = useMemo(() => generateInsights(filtered, customers, products), [filtered, customers, products]);
  const toneStyles = {
    positive: { bg: "bg-emerald-50 dark:bg-emerald-950", icon: "text-emerald-600 dark:text-emerald-400", badge: "positive" },
    warning: { bg: "bg-amber-50 dark:bg-amber-950", icon: "text-amber-600 dark:text-amber-400", badge: "warning" },
    negative: { bg: "bg-red-50 dark:bg-red-950", icon: "text-red-600 dark:text-red-400", badge: "negative" },
    neutral: { bg: "bg-indigo-50 dark:bg-indigo-950", icon: "text-indigo-600 dark:text-indigo-400", badge: "indigo" },
  };

  if (loading) return <LoadingSpinner label="Analyzing your data" />;
  if (!hasDemoData) return <EmptyState title="No data to analyze yet" message="Load demo data so Shoplytics can generate insights from real numbers." action={<Button onClick={loadDemoData}><Sparkles size={15}/> Load Demo Data</Button>} />;

  return (
    <div className="space-y-5">
      <div><h1 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2"><Lightbulb size={20} className="text-amber-500"/> Automated Insights</h1><p className="text-sm text-slate-400 font-body">Findings calculated directly from your dataset for the selected period.</p></div>
      <FilterBar filters={filters} setFilters={setFilters} products={products} customers={customers} />

      {!insights.length && <EmptyState title="Not enough data" message="Widen your date range or filters so Shoplytics has enough orders to analyze." />}

      <div className="grid md:grid-cols-2 gap-4">
        {insights.map((ins, i) => {
          const Icon = ins.icon;
          const t = toneStyles[ins.tone] || toneStyles.neutral;
          return (
            <Card key={i} className="p-5 animate-fadeUp">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.bg}`}><Icon size={18} className={t.icon} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-[15px]">{ins.title}</h3>
                    <Badge tone={t.badge}>{ins.metric}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-body">{ins.body}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2">
                    <Zap size={13} className="text-indigo-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-body"><span className="font-semibold text-slate-600 dark:text-slate-300">Recommendation:</span> {ins.recommendation}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   DATA IMPORT PAGE
------------------------------------------------------------------------- */
function DataImportPage() {
  const { importOrders, pushNotification } = useData();
  const toast = useToast();
  const [stage, setStage] = useState("upload"); // upload -> preview -> done
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState(null);
  const [validation, setValidation] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast?.push({ tone: "error", title: "Unsupported file", message: "Please upload a .csv file." });
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { headers, rows } = parseCSV(text);
      const result = validateAndTransformCSV(headers, rows);
      setParsed({ headers, rows });
      setValidation(result);
      setStage("preview");
    };
    reader.onerror = () => toast?.push({ tone: "error", title: "Read failed", message: "Could not read this file." });
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (!validation?.validOrders?.length) return;
    setImporting(true); setProgress(0);
    const total = validation.validOrders.length;
    for (let i = 0; i <= 10; i++) { await new Promise((r) => setTimeout(r, 40)); setProgress(Math.round((i / 10) * 100)); }
    try {
      await importOrders(validation.validOrders, validation.newCustomers, validation.newProducts);
      setStage("done");
    } catch (e) {
      pushNotification({ type: "error", title: "Import failed", message: "Something went wrong while saving your data." });
      toast?.push({ tone: "error", title: "Import failed", message: "Please try again." });
    } finally { setImporting(false); }
  };

  const reset = () => { setStage("upload"); setFileName(""); setParsed(null); setValidation(null); setProgress(0); };

  const downloadTemplate = () => {
    const blob = new Blob([generateSampleCSV()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "shoplytics-sample-template.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div><h1 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">Data Import</h1><p className="text-sm text-slate-400 font-body">Upload order history as CSV — Shoplytics validates and previews it before anything is saved.</p></div>

      <Card className="p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center"><FileSpreadsheet size={18} className="text-indigo-600" /></div>
          <div><p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-body">Need a starting point?</p><p className="text-xs text-slate-400 font-body">Download a sample CSV with the expected columns.</p></div>
        </div>
        <Button variant="outline" size="sm" onClick={downloadTemplate}><Download size={14}/> Sample Template</Button>
      </Card>

      {stage === "upload" && (
        <Card className="p-8 sm:p-12 border-dashed border-2 border-slate-200 dark:border-slate-700 text-center"
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}>
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4"><Upload size={24} className="text-slate-400" /></div>
          <p className="font-display font-semibold text-slate-700 dark:text-slate-200">Drag and drop your CSV here</p>
          <p className="text-sm text-slate-400 font-body mt-1">or click below to browse your files</p>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          <Button className="mt-5" onClick={() => fileRef.current?.click()}>Choose File</Button>
          <p className="text-xs text-slate-400 font-body mt-4">Required columns: {CSV_TEMPLATE_HEADERS.filter(h=>h!=="Customer ID").join(", ")}</p>
        </Card>
      )}

      {stage === "preview" && validation && (
        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet size={16} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-body">{fileName}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950"><p className="text-xs text-emerald-600 font-body">Valid rows</p><p className="font-mono font-semibold text-lg text-emerald-700 dark:text-emerald-400">{validation.validOrders.length}</p></div>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950"><p className="text-xs text-red-600 font-body">Invalid rows</p><p className="font-mono font-semibold text-lg text-red-700 dark:text-red-400">{validation.invalidRows.length}</p></div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><p className="text-xs text-slate-500 font-body">Total rows</p><p className="font-mono font-semibold text-lg text-slate-700 dark:text-slate-200">{parsed.rows.length}</p></div>
            </div>
          </Card>

          {validation.errors.length > 0 && (
            <Card className="p-4 sm:p-5 border-red-200 dark:border-red-900">
              <p className="text-sm font-semibold text-red-600 font-body flex items-center gap-2"><AlertCircle size={15}/> This file can't be imported</p>
              {validation.errors.map((e, i) => <p key={i} className="text-xs text-red-500 font-body mt-1.5">{e}</p>)}
              <Button variant="outline" size="sm" className="mt-3" onClick={reset}>Try another file</Button>
            </Card>
          )}

          {validation.errors.length === 0 && (
            <>
              {validation.invalidRows.length > 0 && (
                <Card className="p-4 sm:p-5 border-amber-200 dark:border-amber-900">
                  <p className="text-sm font-semibold text-amber-600 font-body flex items-center gap-2 mb-2"><AlertTriangle size={15}/> {validation.invalidRows.length} row(s) will be skipped</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {validation.invalidRows.slice(0, 8).map((r, i) => <p key={i} className="text-xs text-amber-600 font-body">Row {r.row}: {r.issues.join(", ")}</p>)}
                  </div>
                </Card>
              )}

              <Card className="p-4 sm:p-5">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-body mb-3">Preview (first 8 valid rows)</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-body min-w-[600px]">
                    <thead><tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-2 pr-3">Order ID</th><th className="pb-2 pr-3">Customer</th><th className="pb-2 pr-3">Product</th><th className="pb-2 pr-3">Sales</th><th className="pb-2 pr-3">Profit</th><th className="pb-2">Date</th>
                    </tr></thead>
                    <tbody>
                      {validation.validOrders.slice(0,8).map((o,i) => (
                        <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                          <td className="py-2 pr-3 font-mono text-slate-500">{o.id}</td><td className="py-2 pr-3 text-slate-600 dark:text-slate-300">{o.customerName}</td>
                          <td className="py-2 pr-3 text-slate-600 dark:text-slate-300">{o.productName}</td><td className="py-2 pr-3 font-mono text-slate-600 dark:text-slate-300">{fmtCurrencyPrecise(o.sales)}</td>
                          <td className="py-2 pr-3 font-mono text-slate-600 dark:text-slate-300">{fmtCurrencyPrecise(o.profit)}</td><td className="py-2 text-slate-500">{o.orderDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {importing ? (
                <Card className="p-5">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-body mb-2">Importing {validation.validOrders.length} orders…</p>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-150" style={{ width: `${progress}%` }} />
                  </div>
                </Card>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={reset}>Cancel</Button>
                  <Button onClick={confirmImport} disabled={!validation.validOrders.length}><Upload size={15}/> Confirm Import ({validation.validOrders.length} rows)</Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {stage === "done" && (
        <Card className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={26} className="text-emerald-500" /></div>
          <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100">Import complete</h3>
          <p className="text-sm text-slate-400 font-body mt-1">{validation?.validOrders.length} orders were added to your account.</p>
          <Button className="mt-5" onClick={reset}>Import Another File</Button>
        </Card>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   SETTINGS PAGE
------------------------------------------------------------------------- */
function SettingsPage({ theme, setTheme }) {
  const { user, updateProfile, deleteAccount, logOut } = useAuth();
  const { clearData, loadDemoData, orders } = useData();
  const toast = useToast();
  const [name, setName] = useState(user?.name || "");
  const [currency, setCurrency] = useState(user?.currency || "USD");
  const [dateFormat, setDateFormat] = useState(user?.dateFormat || "MM/DD/YYYY");
  const [tab, setTab] = useState("profile");
  const [oldPw, setOldPw] = useState(""); const [newPw, setNewPw] = useState(""); const [pwError, setPwError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const saveProfile = async () => { await updateProfile({ name }); toast?.push({ tone: "success", title: "Profile updated" }); };
  const savePreferences = async () => { await updateProfile({ currency, dateFormat }); toast?.push({ tone: "success", title: "Preferences saved" }); };
  const changePassword = async () => {
    setPwError("");
    if (oldPw !== user.password) { setPwError("Current password is incorrect."); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    await updateProfile({ password: newPw });
    setOldPw(""); setNewPw("");
    toast?.push({ tone: "success", title: "Password changed" });
  };

  const tabs = [{ key: "profile", label: "Profile" }, { key: "preferences", label: "Preferences" }, { key: "account", label: "Account" }];

  return (
    <div className="space-y-5 max-w-2xl">
      <div><h1 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">Settings</h1><p className="text-sm text-slate-400 font-body">Manage your profile, preferences, and account.</p></div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-semibold font-body ${tab===t.key ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-400"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "profile" && (
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white text-xl font-bold font-body flex items-center justify-center">{(name||"U").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}</div>
            <div><p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-body">Profile picture</p><p className="text-xs text-slate-400 font-body">Generated automatically from your name</p></div>
          </div>
          <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Email" value={user?.email} disabled className="opacity-70" />
          <Button onClick={saveProfile}>Save Changes</Button>
        </Card>
      )}

      {tab === "preferences" && (
        <Card className="p-5 sm:p-6 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-body">Currency</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1.5 w-full px-3.5 py-2.5 text-sm font-body rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              {["USD","EUR","GBP","INR"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-body">Date format</span>
            <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="mt-1.5 w-full px-3.5 py-2.5 text-sm font-body rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              {["MM/DD/YYYY","DD/MM/YYYY","YYYY-MM-DD"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-body">Theme</span>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex items-center gap-2 text-sm font-body px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {theme === "dark" ? <Moon size={15}/> : <Sun size={15}/>} {theme === "dark" ? "Dark" : "Light"}
            </button>
          </label>
          <Button onClick={savePreferences}>Save Preferences</Button>
        </Card>
      )}

      {tab === "account" && (
        <div className="space-y-4">
          <Card className="p-5 sm:p-6 space-y-4">
            <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100">Change password</h3>
            <TextField label="Current password" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} />
            <TextField label="New password" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
            {pwError && <p className="text-xs text-red-500 font-body">{pwError}</p>}
            <Button onClick={changePassword}>Update Password</Button>
          </Card>
          <Card className="p-5 sm:p-6 space-y-3">
            <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100">Data</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={loadDemoData}><Sparkles size={15}/> Reload Demo Data</Button>
              <Button variant="outline" onClick={() => setConfirmClear(true)}><Trash2 size={15}/> Clear All Data</Button>
            </div>
            <p className="text-xs text-slate-400 font-body">You currently have {orders.length.toLocaleString()} orders stored.</p>
          </Card>
          <Card className="p-5 sm:p-6 border-red-200 dark:border-red-900">
            <h3 className="font-display font-semibold text-sm text-red-600">Danger zone</h3>
            <p className="text-xs text-slate-400 font-body mt-1 mb-3">Deleting your account permanently removes your profile and all associated data.</p>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete Account</Button>
          </Card>
        </div>
      )}

      <ConfirmDialog open={confirmClear} onClose={() => setConfirmClear(false)} onConfirm={clearData} title="Clear all data?" message="This removes every order, product, and customer record from your account. This cannot be undone." confirmLabel="Clear Data" />
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={deleteAccount} title="Delete your account?" message="This permanently deletes your profile and all data. This cannot be undone." confirmLabel="Delete Account" />
    </div>
  );
}

/* -------------------------------------------------------------------------
   DASHBOARD SHELL — wires sidebar/topbar to the active page
------------------------------------------------------------------------- */
function DashboardShell({ theme, setTheme }) {
  const [page, setPage] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filters, setFilters] = useState(() => ({ preset: "Last 6 months", ...presetRange("Last 6 months"), category: "All", region: "All", productId: "All", customerId: "All" }));

  const pages = {
    overview: <OverviewPage filters={filters} setFilters={setFilters} />,
    sales: <SalesAnalyticsPage filters={filters} setFilters={setFilters} />,
    customers: <CustomerAnalyticsPage filters={filters} setFilters={setFilters} />,
    products: <ProductAnalyticsPage filters={filters} setFilters={setFilters} />,
    orders: <OrdersPage filters={filters} setFilters={setFilters} />,
    inventory: <InventoryPage />,
    insights: <InsightsPage filters={filters} setFilters={setFilters} />,
    import: <DataImportPage />,
    settings: <SettingsPage theme={theme} setTheme={setTheme} />,
  };

  const pageTitle = NAV_ITEMS.find((n) => n.key === page)?.label || "Overview";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-body">
      <style>{FONT_IMPORT}</style>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar setPage={setPage} setMobileOpen={setMobileOpen} theme={theme} setTheme={setTheme} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
          {pages[page]}
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   ROOT APP — auth-gated routing between landing, auth, and dashboard
------------------------------------------------------------------------- */
function AppInner() {
  const { user, authLoading } = useAuth();
  const [route, setRoute] = useState("landing"); // landing | login | signup | forgot | reset | app
  const [resetEmail, setResetEmail] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => { if (user) setRoute("app"); }, [user]);

  const goTo = (r, opts = {}) => {
    if (opts.email) setResetEmail(opts.email);
    setRoute(r);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950"><LoadingSpinner label="Loading Shoplytics" /></div>;
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="bg-white dark:bg-slate-950 min-h-screen">
        {!user && route === "landing" && <LandingPage onExplore={() => goTo("signup")} onGetStarted={() => goTo("signup")} />}
        {!user && route === "login" && <LoginPage goTo={goTo} />}
        {!user && route === "signup" && <SignupPage goTo={goTo} />}
        {!user && route === "forgot" && <ForgotPasswordPage goTo={goTo} />}
        {!user && route === "reset" && <ResetPasswordPage goTo={goTo} prefillEmail={resetEmail} />}
        {user && <DataProvider><DashboardShell theme={theme} setTheme={setTheme} /></DataProvider>}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ToastProvider>
  );
}
