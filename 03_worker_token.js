// Cloudflare Worker: token por lead (ManyChat → Supabase) y endpoints de la calculadora.
//
// Variables (wrangler secret put ...):
//   SUPABASE_URL          https://<proyecto>.supabase.co
//   SUPABASE_SECRET_KEY   sb_secret_...   (NUNCA en el navegador)
//   MANYCHAT_SECRET       cadena larga aleatoria; ManyChat la manda en el header X-Webhook-Secret
//   SITE_ORIGIN           https://diagnostico.tudominio.com
//
// Rutas:
//   POST /manychat/link   (lo llama ManyChat con External Request)  → { token, url }
//   POST /api/start       (lo llama la página: nombre + email + autorización)
//   POST /api/calc        (lo llama la página: entradas y resultado de la calculadora)

const TOKEN_TTL_DAYS = 14;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return cors(env, new Response(null, { status: 204 }));
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

    try {
      if (url.pathname === "/manychat/link") return await manychatLink(request, env);
      if (url.pathname === "/api/start") return cors(env, await apiStart(request, env));
      if (url.pathname === "/api/calc") return cors(env, await apiCalc(request, env));
      return json({ error: "not_found" }, 404);
    } catch (err) {
      console.error(err);
      return cors(env, json({ error: "internal" }, 500));
    }
  },
};

// ---------- ManyChat ----------

async function manychatLink(request, env) {
  if (!safeEqual(request.headers.get("X-Webhook-Secret") || "", env.MANYCHAT_SECRET)) {
    return json({ error: "unauthorized" }, 401);
  }
  const body = await request.json();
  const contactId = String(body.contact_id || "").trim();
  if (!/^\d+$/.test(contactId)) return json({ error: "bad_contact_id" }, 400);
  const igUsername = body.ig_username ? String(body.ig_username).slice(0, 60) : null;

  const [lead] = await db(env, "GET",
    `leads?manychat_contact_id=eq.${contactId}&select=id,token,token_expires_at,status`);

  // Si ya tiene un token vigente, se reutiliza: el mismo lead siempre recibe el mismo link.
  if (lead && lead.token && new Date(lead.token_expires_at) > new Date()) {
    return json({ token: lead.token, url: siteUrl(env, lead.token) });
  }

  const token = newToken();
  const expires = new Date(Date.now() + TOKEN_TTL_DAYS * 864e5).toISOString();
  const fields = { token, token_expires_at: expires, updated_at: new Date().toISOString() };
  if (igUsername) fields.ig_username = igUsername;
  // Solo avanza el estado si el lead no había pasado de aquí (no retroceder a quien ya calculó o agendó).
  if (!lead || !lead.status || lead.status === "filtrado") fields.status = "link_enviado";

  if (lead) {
    await db(env, "PATCH", `leads?id=eq.${lead.id}`, fields);
  } else {
    await db(env, "POST", "leads", { manychat_contact_id: contactId, ...fields });
  }
  return json({ token, url: siteUrl(env, token) });
}

// ---------- Página ----------

async function apiStart(request, env) {
  const body = await request.json();
  const lead = await leadFromToken(env, body.t);
  if (!lead) return json({ error: "invalid_token" }, 401);

  const name = String(body.name || "").trim().slice(0, 80);
  const email = String(body.email || "").trim().toLowerCase();
  if (!name) return json({ error: "name_required" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return json({ error: "bad_email" }, 400);
  if (body.consent !== true) return json({ error: "consent_required" }, 400);

  await db(env, "PATCH", `leads?id=eq.${lead.id}`, {
    name, email, consent_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  });
  return json({ ok: true });
}

async function apiCalc(request, env) {
  const body = await request.json();
  const lead = await leadFromToken(env, body.t);
  if (!lead) return json({ error: "invalid_token" }, 401);
  if (!lead.consent_at) return json({ error: "consent_required" }, 400);

  const inputs = body.inputs;
  if (!inputs || typeof inputs !== "object" || JSON.stringify(inputs).length > 5000) {
    return json({ error: "bad_inputs" }, 400);
  }
  // Si el resultado decide algo importante (p. ej. si puede agendar), recalcúlalo aquí
  // en vez de confiar en lo que manda el navegador.
  const result = body.result && typeof body.result === "object" ? body.result : {};

  await db(env, "POST", "calculations", { lead_id: lead.id, inputs, result });
  await db(env, "PATCH", `leads?id=eq.${lead.id}`, { status: "calculo", updated_at: new Date().toISOString() });
  return json({ ok: true });
}

// ---------- Utilidades ----------

// 9 bytes aleatorios → 12 caracteres base64url (72 bits). Ej.: "q7Rk2_Vx9LmA"
function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_");
}

async function leadFromToken(env, t) {
  if (typeof t !== "string" || !/^[A-Za-z0-9_-]{12}$/.test(t)) return null;
  const [lead] = await db(env, "GET", `leads?token=eq.${t}&select=id,token_expires_at,consent_at`);
  if (!lead || new Date(lead.token_expires_at) <= new Date()) return null;
  return lead;
}

function siteUrl(env, token) {
  return `${env.SITE_ORIGIN}/?t=${token}`;
}

// PostgREST de Supabase. La clave secreta va en el header apikey (no es un JWT).
async function db(env, method, path, body) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`supabase ${method} ${path}: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

function safeEqual(a, b) {
  if (!b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function cors(env, res) {
  const r = new Response(res.body, res);
  r.headers.set("Access-Control-Allow-Origin", env.SITE_ORIGIN);
  r.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  r.headers.set("Access-Control-Allow-Headers", "Content-Type");
  r.headers.set("Vary", "Origin");
  return r;
}
