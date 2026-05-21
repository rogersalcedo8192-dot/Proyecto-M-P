import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, stat, appendFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadLocalEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!existsSync(envPath)) return;

  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    const name = key.trim();
    let value = valueParts.join("=").trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (name && process.env[name] === undefined) {
      process.env[name] = value;
    }
  }
}

loadLocalEnv();

const port = Number(process.env.PORT || 3000);
const publicRoot = __dirname;
const dataDir = path.join(__dirname, "data");
const leadsFile = path.join(dataDir, "leads.jsonl");
const databaseUrl = process.env.DATABASE_URL || "";
const pgPool = databaseUrl
  ? new pg.Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined
    })
  : null;
let leadsTableReady = false;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".webm": "video/webm",
  ".xml": "application/xml; charset=utf-8"
};

const noCacheExtensions = new Set([".html", ".css", ".js"]);
const duplicateLeadMessage =
  "¡Ya enviaste una solicitud con ese correo en las últimas 24 horas! Por favor, vuelve a intentarlo más tarde o espera un poco más la respuesta de nuestro equipo de ventas.";

const genericEmailDomains = new Set([
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "live.com",
  "msn.com"
]);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function sanitizeText(value, maxLength = 300) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeLead(payload) {
  const corporateEmail = sanitizeText(payload.corporateEmail, 160).toLowerCase();
  const emailDomain = corporateEmail.includes("@") ? corporateEmail.split("@").pop() : "";
  const inferredCompany = emailDomain && !genericEmailDomains.has(emailDomain) ? emailDomain.split(".")[0] : "";
  const projectType = sanitizeText(payload.projectType || payload.challenge, 80);

  return {
    fullName: sanitizeText(payload.fullName, 120),
    corporateEmail,
    whatsapp: sanitizeText(payload.whatsapp, 60),
    occupation: sanitizeText(payload.occupation, 80),
    companyName: sanitizeText(payload.companyName, 140) || inferredCompany || "No informado",
    website: sanitizeText(payload.website, 220),
    companySize: sanitizeText(payload.companySize, 20) || "No informado",
    challenge: projectType,
    projectType,
    budget: sanitizeText(payload.budget, 40),
    timeline: sanitizeText(payload.timeline, 60) || "No informado",
    projectDescription: sanitizeText(payload.projectDescription, 1200),
    consent: payload.consent === true
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseRecipients(value) {
  return String(value || "")
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function validateLead(lead) {
  const requiredFields = [
    "fullName",
    "corporateEmail",
    "whatsapp",
    "occupation",
    "challenge",
    "budget",
    "projectDescription"
  ];

  for (const field of requiredFields) {
    if (!lead[field]) return `Falta el campo ${field}.`;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.corporateEmail)) {
    return "Ingresa un correo válido.";
  }

  if (lead.website && !/^https?:\/\/.+\..+/i.test(lead.website)) {
    return "El sitio web debe iniciar con http:// o https://.";
  }

  if (!lead.consent) {
    return "Debes aceptar el tratamiento de datos.";
  }

  return "";
}

async function readRequestJson(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) throw new Error("Payload demasiado grande.");
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function ensureLeadsTable() {
  if (!pgPool || leadsTableReady) return;

  await pgPool.query(`
    create table if not exists leads (
      id bigserial primary key,
      full_name text not null,
      corporate_email text not null,
      whatsapp text not null,
      occupation text,
      company_name text,
      website text,
      company_size text,
      challenge text,
      project_type text,
      project_description text,
      budget text,
      timeline text,
      consent boolean not null default false,
      source text not null default 'landing-mp',
      created_at timestamptz not null default now()
    );
  `);

  await pgPool.query(`
    alter table leads
      add column if not exists full_name text,
      add column if not exists corporate_email text,
      add column if not exists whatsapp text,
      add column if not exists occupation text,
      add column if not exists company_name text,
      add column if not exists website text,
      add column if not exists company_size text,
      add column if not exists challenge text,
      add column if not exists project_type text,
      add column if not exists project_description text,
      add column if not exists budget text,
      add column if not exists timeline text,
      add column if not exists consent boolean not null default false,
      add column if not exists source text not null default 'landing-mp',
      add column if not exists created_at timestamptz not null default now();
  `);

  await pgPool.query(`
    create index if not exists idx_leads_created_at on leads (created_at desc);
  `);

  await pgPool.query(`
    create index if not exists idx_leads_corporate_email on leads (corporate_email);
  `);

  await pgPool.query(`
    create index if not exists idx_leads_email_created_at on leads (lower(corporate_email), created_at desc);
  `);

  await pgPool.query(`
    create index if not exists idx_leads_occupation on leads (occupation);
  `);

  leadsTableReady = true;
}

async function hasRecentLead(corporateEmail) {
  const normalizedEmail = sanitizeText(corporateEmail, 160).toLowerCase();
  if (!normalizedEmail) return false;

  if (pgPool) {
    await ensureLeadsTable();
    const result = await pgPool.query(
      `select 1
       from leads
       where lower(corporate_email) = $1
         and created_at >= now() - interval '24 hours'
       limit 1`,
      [normalizedEmail]
    );
    return result.rowCount > 0;
  }

  try {
    const raw = await readFile(leadsFile, "utf8");
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return raw
      .split(/\r?\n/)
      .filter(Boolean)
      .some((line) => {
        try {
          const record = JSON.parse(line);
          const createdAt = Date.parse(record.createdAt || "");
          return record.corporateEmail === normalizedEmail && Number.isFinite(createdAt) && createdAt >= cutoff;
        } catch {
          return false;
        }
      });
  } catch {
    return false;
  }
}

async function persistLead(lead) {
  const record = {
    ...lead,
    source: "landing-mp",
    createdAt: new Date().toISOString()
  };

  if (pgPool) {
    let result;
    try {
      await ensureLeadsTable();
      result = await pgPool.query(
        `insert into leads (
          full_name,
          corporate_email,
          whatsapp,
          occupation,
          company_name,
          website,
          company_size,
          challenge,
          project_type,
          project_description,
          budget,
          timeline,
          consent,
          source
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        returning id, created_at`,
        [
          lead.fullName,
          lead.corporateEmail,
          lead.whatsapp,
          lead.occupation,
          lead.companyName,
          lead.website || null,
          lead.companySize,
          lead.challenge,
          lead.projectType,
          lead.projectDescription,
          lead.budget,
          lead.timeline,
          lead.consent,
          record.source
        ]
      );
    } catch (error) {
      if (error?.code !== "42703") {
        console.error("Postgres lead insert failed:", error);
        throw new Error("No pudimos guardar la solicitud en la base de datos.");
      }

      await ensureLeadsTable();
      result = await pgPool.query(
        `insert into leads (
          full_name,
          corporate_email,
          whatsapp,
          occupation,
          company_name,
          website,
          company_size,
          challenge,
          budget,
          timeline,
          consent,
          source
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        returning id, created_at`,
        [
          lead.fullName,
          lead.corporateEmail,
          lead.whatsapp,
          lead.occupation,
          lead.companyName,
          lead.website || null,
          lead.companySize,
          lead.challenge,
          lead.budget,
          lead.timeline,
          lead.consent,
          record.source
        ]
      );
    }

    record.id = result.rows[0]?.id;
    record.createdAt = result.rows[0]?.created_at?.toISOString?.() || record.createdAt;
    record.storage = "postgres";
    return record;
  }

  await mkdir(dataDir, { recursive: true });
  record.storage = "local";
  await appendFile(leadsFile, `${JSON.stringify(record)}\n`, "utf8");
  return record;
}

async function sendResendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Resend email skipped: missing RESEND_API_KEY.");
    return { ok: false, skipped: true };
  }

  const from = process.env.RESEND_FROM || "M&P Leads <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html
      })
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("Resend email failed:", body);
      return { ok: false, skipped: false };
    }

    return { ok: true, skipped: false };
  } catch (error) {
    console.error("Resend email failed:", error);
    return { ok: false, skipped: false };
  }
}

async function notifyAdminWithResend(lead) {
  const recipients = parseRecipients(process.env.LEADS_NOTIFY_TO);
  if (!recipients.length) {
    console.warn("Admin notification skipped: missing LEADS_NOTIFY_TO.");
    return { ok: false, skipped: true };
  }

  const subject = `Nuevo lead M&P: ${lead.companyName}`;
  const rows = [
    ["Nombre", lead.fullName],
    ["Correo", lead.corporateEmail],
    ["WhatsApp", lead.whatsapp],
    ["Ocupación", lead.occupation],
    ["Empresa", lead.companyName],
    ["Sitio web", lead.website || "No informado"],
    ["Tamaño", lead.companySize],
    ["Tipo de proyecto", lead.projectType || lead.challenge],
    ["Presupuesto", lead.budget],
    ["Descripción", lead.projectDescription],
    ["Inicio", lead.timeline]
  ];

  const html = `
    <h2>Nuevo lead desde M&P</h2>
    <table cellpadding="8" cellspacing="0" style="border-collapse:collapse">
      ${rows.map(([key, value]) => `<tr><td><strong>${escapeHtml(key)}</strong></td><td>${escapeHtml(value)}</td></tr>`).join("")}
    </table>
  `;

  return sendResendEmail({ to: recipients, subject, html });
}

async function sendLeadAutoreplyWithResend(lead) {
  if (!lead.corporateEmail) {
    return { ok: false, skipped: true };
  }

  const safeName = escapeHtml(lead.fullName);
  const subject = "Recibimos tu solicitud en M&P";
  const html = `
    <h2>Hola, ${safeName}</h2>
    <p>Gracias por contactar a M&amp;P. Recibimos tu solicitud y nuestro equipo revisara los detalles para responderte pronto.</p>
    <p><strong>Tipo de proyecto:</strong> ${escapeHtml(lead.projectType || lead.challenge)}</p>
    <p><strong>Presupuesto:</strong> ${escapeHtml(lead.budget)}</p>
    <p>Si necesitas agregar informacion, responde directamente a este correo.</p>
  `;

  return sendResendEmail({ to: lead.corporateEmail, subject, html });
}

async function notifyWithResend(lead) {
  const admin = await notifyAdminWithResend(lead);
  const client = await sendLeadAutoreplyWithResend(lead);
  return { admin, client };
}

async function handleLead(req, res) {
  try {
    const payload = await readRequestJson(req);
    const lead = normalizeLead(payload);
    const error = validateLead(lead);

    if (error) {
      sendJson(res, 400, { ok: false, error });
      return;
    }

    if (await hasRecentLead(lead.corporateEmail)) {
      sendJson(res, 429, { ok: false, code: "duplicate_recent_lead", error: duplicateLeadMessage });
      return;
    }

    const savedLead = await persistLead(lead);
    console.log(`Lead persisted: id=${savedLead.id || "local"} storage=${savedLead.storage} email=${savedLead.corporateEmail}`);
    const notification = await notifyWithResend(savedLead);
    sendJson(res, 201, {
      ok: true,
      storage: savedLead.storage,
      notifications: {
        admin: notification.admin.ok ? "sent" : "not_sent",
        client: notification.client.ok ? "sent" : "not_sent"
      }
    });
  } catch (error) {
    console.error("Lead submission failed:", error);
    sendJson(res, 500, { ok: false, error: "No pudimos guardar la solicitud." });
  }
}

async function handleHealth(res) {
  let database = "missing";
  let leadsCount = null;
  let lastLeadAt = null;

  if (pgPool) {
    try {
      await ensureLeadsTable();
      const result = await pgPool.query("select count(*)::int as count, max(created_at) as last_lead_at from leads");
      database = "connected";
      leadsCount = result.rows[0]?.count ?? 0;
      lastLeadAt = result.rows[0]?.last_lead_at?.toISOString?.() || null;
    } catch (error) {
      console.error("Health database check failed:", error);
      database = "error";
    }
  }

  sendJson(res, 200, {
    ok: true,
    database,
    leadsCount,
    lastLeadAt,
    resend: {
      apiKey: Boolean(process.env.RESEND_API_KEY),
      from: Boolean(process.env.RESEND_FROM),
      adminRecipients: parseRecipients(process.env.LEADS_NOTIFY_TO).length,
      ready: Boolean(process.env.RESEND_API_KEY && parseRecipients(process.env.LEADS_NOTIFY_TO).length)
    }
  });
}

async function serveStatic(req, res) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const requestedPath = decodeURIComponent(url.pathname);
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicRoot, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(publicRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    const finalPath = fileStat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const content = await readFile(finalPath);
    const extension = path.extname(finalPath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": noCacheExtensions.has(extension) ? "no-cache, no-store, must-revalidate" : "public, max-age=3600"
    });
    res.end(content);
  } catch {
    const fallback = await readFile(path.join(publicRoot, "index.html"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fallback);
  }
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    await handleHealth(res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/leads") {
    await handleLead(req, res);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    await serveStatic(req, res);
    return;
  }

  sendJson(res, 405, { ok: false, error: "Método no permitido." });
});

server.listen(port, () => {
  console.log(`M&P landing running on http://localhost:${port}`);
});
