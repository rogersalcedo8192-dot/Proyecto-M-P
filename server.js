import { createServer } from "node:http";
import { mkdir, readFile, stat, appendFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 3000);
const publicRoot = __dirname;
const dataDir = path.join(__dirname, "data");
const leadsFile = path.join(dataDir, "leads.jsonl");

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
  return {
    fullName: sanitizeText(payload.fullName, 120),
    corporateEmail: sanitizeText(payload.corporateEmail, 160).toLowerCase(),
    whatsapp: sanitizeText(payload.whatsapp, 60),
    companyName: sanitizeText(payload.companyName, 140),
    website: sanitizeText(payload.website, 220),
    companySize: sanitizeText(payload.companySize, 20),
    challenge: sanitizeText(payload.challenge, 60),
    budget: sanitizeText(payload.budget, 40),
    timeline: sanitizeText(payload.timeline, 60),
    consent: payload.consent === true
  };
}

function validateLead(lead) {
  const requiredFields = [
    "fullName",
    "corporateEmail",
    "whatsapp",
    "companyName",
    "companySize",
    "challenge",
    "budget",
    "timeline"
  ];

  for (const field of requiredFields) {
    if (!lead[field]) return `Falta el campo ${field}.`;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.corporateEmail)) {
    return "Ingresa un correo válido.";
  }

  const domain = lead.corporateEmail.split("@").pop();
  if (genericEmailDomains.has(domain)) {
    return "Usa un correo corporativo para enviar la solicitud.";
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

async function persistLead(lead) {
  await mkdir(dataDir, { recursive: true });
  const record = {
    ...lead,
    source: "landing-mp",
    createdAt: new Date().toISOString()
  };
  await appendFile(leadsFile, `${JSON.stringify(record)}\n`, "utf8");
  return record;
}

async function notifyWithResend(lead) {
  if (!process.env.RESEND_API_KEY || !process.env.LEADS_NOTIFY_TO) return;

  const from = process.env.RESEND_FROM || "M&P Leads <onboarding@resend.dev>";
  const subject = `Nuevo lead M&P: ${lead.companyName}`;
  const rows = [
    ["Nombre", lead.fullName],
    ["Correo", lead.corporateEmail],
    ["WhatsApp", lead.whatsapp],
    ["Empresa", lead.companyName],
    ["Sitio web", lead.website || "No informado"],
    ["Tamaño", lead.companySize],
    ["Desafío", lead.challenge],
    ["Presupuesto", lead.budget],
    ["Inicio", lead.timeline]
  ];

  const html = `
    <h2>Nuevo lead desde M&P</h2>
    <table cellpadding="8" cellspacing="0" style="border-collapse:collapse">
      ${rows.map(([key, value]) => `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`).join("")}
    </table>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: process.env.LEADS_NOTIFY_TO,
      subject,
      html
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("Resend notification failed:", body);
  }
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

    const savedLead = await persistLead(lead);
    await notifyWithResend(savedLead);
    sendJson(res, 201, { ok: true });
  } catch (error) {
    console.error("Lead submission failed:", error);
    sendJson(res, 500, { ok: false, error: "No pudimos guardar la solicitud." });
  }
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
      "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=3600"
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
    sendJson(res, 200, { ok: true });
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
