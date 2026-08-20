// QuickBooks Online integration: OAuth connection lifecycle + the handful of
// Accounting API calls Coolit Pro needs (find/create customer, find/create
// service item, create invoice). Every write is logged by the caller
// (see actions/quickbooks.ts) so there's always a record of what was sent
// and what QuickBooks said back — never a silent "hope it worked."

import { one, run } from "./db";

const AUTHORIZE_URL = "https://appcenter.intuit.com/connect/oauth2";
const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

export type QboEnvironment = "sandbox" | "production";

export interface QboConnectionRow {
  id: number;
  realm_id: string;
  environment: QboEnvironment;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  company_name: string | null;
  connected_by: number | null;
  connected_at: string;
  updated_at: string;
}

interface QboTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
}

interface QboErrorDetail {
  Message?: string;
  Detail?: string;
}

interface QboFaultResponse {
  Fault?: { Error?: QboErrorDetail[] };
}

interface QboCustomer {
  Id: string;
  DisplayName?: string;
}

interface QboItem {
  Id: string;
  Name?: string;
}

interface QboInvoice {
  Id: string;
  DocNumber?: string;
}

interface QboAccount {
  Id: string;
}

interface QboQueryResponse {
  QueryResponse?: {
    Customer?: QboCustomer[];
    Item?: QboItem[];
    Invoice?: QboInvoice[];
    Account?: QboAccount[];
  };
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}. Set it in Settings / your hosting provider's environment variables.`);
  return v;
}

function environmentFromEnv(): QboEnvironment {
  return process.env.QBO_ENVIRONMENT === "production" ? "production" : "sandbox";
}

export function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
  return `${base.replace(/\/$/, "")}/api/quickbooks/callback`;
}

export function getAuthorizeUrl(state: string): string {
  const clientId = requireEnv("QBO_CLIENT_ID");
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "com.intuit.quickbooks.accounting",
    redirect_uri: getRedirectUri(),
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

function basicAuthHeader(): string {
  const clientId = requireEnv("QBO_CLIENT_ID");
  const clientSecret = requireEnv("QBO_CLIENT_SECRET");
  return "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

function apiBaseUrl(environment: QboEnvironment): string {
  return environment === "production"
    ? "https://quickbooks.api.intuit.com"
    : "https://sandbox-quickbooks.api.intuit.com";
}

function qboInvoiceLink(environment: QboEnvironment, qboInvoiceId: string): string {
  const host = environment === "production" ? "https://app.qbo.intuit.com" : "https://app.sandbox.qbo.intuit.com";
  return `${host}/app/invoice?txnId=${qboInvoiceId}`;
}

function escapeQboString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// ---------- Connection storage ----------

export function getConnection(): QboConnectionRow | undefined {
  return one<QboConnectionRow>("SELECT * FROM qbo_connection WHERE id = 1");
}

export function isConnected(): boolean {
  return !!getConnection();
}

/** Reconstructs the "view in QuickBooks" link for an already-synced invoice, without an API call. */
export function buildQboInvoiceLink(qboInvoiceId: string): string | null {
  const conn = getConnection();
  if (!conn) return null;
  return qboInvoiceLink(conn.environment, qboInvoiceId);
}

function saveConnection(fields: {
  realm_id: string;
  environment?: QboEnvironment;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  company_name?: string | null;
  connected_by?: number | null;
}) {
  const existing = getConnection();
  if (existing) {
    run(
      `UPDATE qbo_connection SET
        realm_id = ?, environment = ?, access_token = ?, refresh_token = ?,
        access_token_expires_at = ?, refresh_token_expires_at = ?,
        company_name = COALESCE(?, company_name), updated_at = datetime('now')
       WHERE id = 1`,
      [
        fields.realm_id,
        fields.environment ?? existing.environment,
        fields.access_token,
        fields.refresh_token,
        fields.access_token_expires_at,
        fields.refresh_token_expires_at,
        fields.company_name ?? null,
      ]
    );
  } else {
    run(
      `INSERT INTO qbo_connection (id, realm_id, environment, access_token, refresh_token, access_token_expires_at, refresh_token_expires_at, company_name, connected_by)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fields.realm_id,
        fields.environment ?? "sandbox",
        fields.access_token,
        fields.refresh_token,
        fields.access_token_expires_at,
        fields.refresh_token_expires_at,
        fields.company_name ?? null,
        fields.connected_by ?? null,
      ]
    );
  }
}

export function disconnectQuickBooks() {
  run("DELETE FROM qbo_connection WHERE id = 1");
  run("DELETE FROM qbo_service_items");
}

// ---------- OAuth ----------

export async function exchangeCodeForTokens(code: string, realmId: string, connectedByUserId: number | null) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: getRedirectUri() }),
  });
  if (!res.ok) throw new Error(`QuickBooks token exchange failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as QboTokenResponse;
  const now = Date.now();
  const environment = environmentFromEnv();

  let companyName: string | null = null;
  try {
    companyName = await fetchCompanyName(data.access_token, realmId, environment);
  } catch {
    // cosmetic only — don't fail the connection over it
  }

  saveConnection({
    realm_id: realmId,
    environment,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    access_token_expires_at: new Date(now + data.expires_in * 1000).toISOString(),
    refresh_token_expires_at: new Date(now + data.x_refresh_token_expires_in * 1000).toISOString(),
    company_name: companyName,
    connected_by: connectedByUserId,
  });
}

async function refreshTokens(conn: QboConnectionRow): Promise<QboConnectionRow> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: conn.refresh_token }),
  });
  if (!res.ok) {
    throw new Error(
      `QuickBooks connection needs to be reconnected (token refresh failed, ${res.status}). Go to Settings and click Connect QuickBooks again.`
    );
  }
  const data = (await res.json()) as QboTokenResponse;
  const now = Date.now();
  saveConnection({
    realm_id: conn.realm_id,
    environment: conn.environment,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    access_token_expires_at: new Date(now + data.expires_in * 1000).toISOString(),
    refresh_token_expires_at: new Date(now + data.x_refresh_token_expires_in * 1000).toISOString(),
  });
  const updated = getConnection();
  if (!updated) throw new Error("Lost QuickBooks connection during token refresh.");
  return updated;
}

async function getValidConnection(): Promise<QboConnectionRow> {
  const conn = getConnection();
  if (!conn) throw new Error("QuickBooks is not connected. Go to Settings to connect it.");
  const expiresAt = new Date(conn.access_token_expires_at).getTime();
  if (expiresAt - Date.now() < 5 * 60 * 1000) {
    return refreshTokens(conn);
  }
  return conn;
}

// ---------- Low-level API call ----------

async function qboFetch<T>(conn: QboConnectionRow, path: string, init: RequestInit = {}): Promise<T> {
  const url = `${apiBaseUrl(conn.environment)}/v3/company/${conn.realm_id}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${conn.access_token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // leave json null; we'll fall back to raw text below
  }
  if (!res.ok) {
    const fault = json as QboFaultResponse | null;
    const message = fault?.Fault?.Error?.[0]?.Message || fault?.Fault?.Error?.[0]?.Detail || text || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return json as T;
}

async function fetchCompanyName(accessToken: string, realmId: string, environment: QboEnvironment): Promise<string | null> {
  const res = await fetch(`${apiBaseUrl(environment)}/v3/company/${realmId}/companyinfo/${realmId}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { CompanyInfo?: { CompanyName?: string } };
  return data?.CompanyInfo?.CompanyName ?? null;
}

// ---------- Customers ----------

export interface CustomerForSync {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  qbo_customer_id?: string | null;
}

export async function findOrCreateQboCustomer(customer: CustomerForSync): Promise<string> {
  if (customer.qbo_customer_id) return customer.qbo_customer_id;
  const conn = await getValidConnection();

  if (customer.email) {
    const q = `SELECT * FROM Customer WHERE PrimaryEmailAddr = '${escapeQboString(customer.email)}'`;
    const found = await qboFetch<QboQueryResponse>(conn, `/query?query=${encodeURIComponent(q)}`);
    const match = found?.QueryResponse?.Customer?.[0];
    if (match) {
      run("UPDATE customers SET qbo_customer_id = ? WHERE id = ?", [match.Id, customer.id]);
      return match.Id;
    }
  }

  const nameQuery = `SELECT * FROM Customer WHERE DisplayName = '${escapeQboString(customer.name)}'`;
  const foundByName = await qboFetch<QboQueryResponse>(conn, `/query?query=${encodeURIComponent(nameQuery)}`);
  const nameMatch = foundByName?.QueryResponse?.Customer?.[0];
  if (nameMatch) {
    run("UPDATE customers SET qbo_customer_id = ? WHERE id = ?", [nameMatch.Id, customer.id]);
    return nameMatch.Id;
  }

  const payload: Record<string, unknown> = { DisplayName: customer.name };
  if (customer.email) payload.PrimaryEmailAddr = { Address: customer.email };
  if (customer.phone) payload.PrimaryPhone = { FreeFormNumber: customer.phone };
  if (customer.address) {
    payload.BillAddr = {
      Line1: customer.address,
      City: customer.city || undefined,
      CountrySubDivisionCode: customer.state || undefined,
      PostalCode: customer.zip || undefined,
    };
  }
  const created = await qboFetch<{ Customer?: QboCustomer }>(conn, "/customer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const qboId = created?.Customer?.Id;
  if (!qboId) throw new Error("QuickBooks did not return a customer ID.");
  run("UPDATE customers SET qbo_customer_id = ? WHERE id = ?", [qboId, customer.id]);
  return qboId;
}

// ---------- Service items ----------

async function getDefaultIncomeAccountId(conn: QboConnectionRow): Promise<string> {
  const q = `SELECT * FROM Account WHERE AccountType = 'Income' MAXRESULTS 1`;
  const found = await qboFetch<QboQueryResponse>(conn, `/query?query=${encodeURIComponent(q)}`);
  const acct = found?.QueryResponse?.Account?.[0];
  if (!acct) {
    throw new Error(
      "No income account found in QuickBooks to attach new services to. Add an income account in QuickBooks (Accounting > Chart of Accounts) and try again."
    );
  }
  return acct.Id;
}

export async function findOrCreateQboItem(serviceName: string): Promise<string> {
  const cached = one<{ qbo_item_id: string }>("SELECT qbo_item_id FROM qbo_service_items WHERE service = ?", [serviceName]);
  if (cached) return cached.qbo_item_id;

  const conn = await getValidConnection();
  const q = `SELECT * FROM Item WHERE Name = '${escapeQboString(serviceName)}'`;
  const found = await qboFetch<QboQueryResponse>(conn, `/query?query=${encodeURIComponent(q)}`);
  const match = found?.QueryResponse?.Item?.[0];
  if (match) {
    run("INSERT OR REPLACE INTO qbo_service_items (service, qbo_item_id) VALUES (?, ?)", [serviceName, match.Id]);
    return match.Id;
  }

  const incomeAccountId = await getDefaultIncomeAccountId(conn);
  const created = await qboFetch<{ Item?: QboItem }>(conn, "/item", {
    method: "POST",
    body: JSON.stringify({ Name: serviceName, Type: "Service", IncomeAccountRef: { value: incomeAccountId } }),
  });
  const qboId = created?.Item?.Id;
  if (!qboId) throw new Error("QuickBooks did not return an item ID.");
  run("INSERT OR REPLACE INTO qbo_service_items (service, qbo_item_id) VALUES (?, ?)", [serviceName, qboId]);
  return qboId;
}

// ---------- Invoices ----------

export interface QboInvoiceLineInput {
  service: string;
  description: string;
  quantity: number;
  unitPriceDollars: number;
}

export async function createQboInvoice(params: {
  qboCustomerId: string;
  docNumber: string;
  lines: QboInvoiceLineInput[];
  dueDate?: string | null;
}): Promise<{ qboInvoiceId: string; qboLink: string }> {
  const conn = await getValidConnection();

  // Idempotency guard: if an invoice with this DocNumber already exists in QuickBooks
  // (e.g. a retried request after a network blip on the first attempt), link to it
  // instead of creating a duplicate.
  const existingQuery = `SELECT * FROM Invoice WHERE DocNumber = '${escapeQboString(params.docNumber)}'`;
  const existing = await qboFetch<QboQueryResponse>(conn, `/query?query=${encodeURIComponent(existingQuery)}`);
  const existingMatch = existing?.QueryResponse?.Invoice?.[0];
  if (existingMatch) {
    return { qboInvoiceId: existingMatch.Id, qboLink: qboInvoiceLink(conn.environment, existingMatch.Id) };
  }

  const lineItems = await Promise.all(
    params.lines.map(async (line) => ({
      DetailType: "SalesItemLineDetail",
      Amount: Math.round(line.quantity * line.unitPriceDollars * 100) / 100,
      Description: line.description,
      SalesItemLineDetail: {
        ItemRef: { value: await findOrCreateQboItem(line.service) },
        Qty: line.quantity,
        UnitPrice: line.unitPriceDollars,
      },
    }))
  );

  const payload: Record<string, unknown> = {
    CustomerRef: { value: params.qboCustomerId },
    DocNumber: params.docNumber,
    Line: lineItems,
  };
  if (params.dueDate) payload.DueDate = params.dueDate;

  const created = await qboFetch<{ Invoice?: QboInvoice }>(conn, "/invoice", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const qboId = created?.Invoice?.Id;
  if (!qboId) throw new Error("QuickBooks did not return an invoice ID.");
  return { qboInvoiceId: qboId, qboLink: qboInvoiceLink(conn.environment, qboId) };
}
