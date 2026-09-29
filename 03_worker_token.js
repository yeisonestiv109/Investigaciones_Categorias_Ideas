// Cloudflare Worker: token por lead (ManyChat → Supabase) y endpoints de la calculadora.
//
// Variables (wrangler secret put ...):
//   SUPABASE_URL          https://<proyecto>.supabase.co
//   SUPABASE_SECRET_KEY   sb_secret_...   (NUNCA en el navegador)
//   MANYCHAT_SECRET       cadena larga aleatoria; ManyChat la manda en el header X-Webhook-Secret
//   SETTER_SECRET         clave que escribe el setter en la página /setter (distinta a la de ManyChat)
//   SITE_ORIGIN           https://diagnostico.tudominio.com
//
// Rutas:
//   POST /manychat/link   (lo llama ManyChat con External Request)  → { token, url }
//   GET  /setter          página interna: el setter escribe el @ y copia el link
//   POST /setter/link     (lo llama esa página)                      → { token, url, created }
//   POST /api/start       (lo llama la página: nombre + email + autorización)
//   POST /api/calc        (lo llama la página: entradas y resultado de la calculadora)

const TOKEN_TTL_DAYS = 14;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return cors(env, new Response(null, { status: 204 }));
    if (request.method === "GET" && url.pathname === "/setter") {
      return new Response(SETTER_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

    try {
      if (url.pathname === "/manychat/link") return await manychatLink(request, env);
      if (url.pathname === "/setter/link") return await setterLink(request, env);
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
  const { token } = await issueToken(env, lead, { manychat_contact_id: contactId }, igUsername);
  return json({ token, url: siteUrl(env, token) });
}

// ---------- Setter (envío manual desde la app de Instagram) ----------

async function setterLink(request, env) {
  if (!safeEqual(request.headers.get("X-Setter-Key") || "", env.SETTER_SECRET)) {
    return json({ error: "unauthorized" }, 401);
  }
  const body = await request.json();
  const ig = normIg(body.ig_username);
  if (!ig) return json({ error: "bad_ig_username" }, 400);

  // Busca el lead que tu Worker actual guardó cuando escribió la palabra clave.
  const [lead] = await db(env, "GET",
    `leads?ig_username=eq.${ig}&select=id,token,token_expires_at,status&order=updated_at.desc&limit=1`);
  const { token, created } = await issueToken(env, lead, {}, ig);
  return json({ token, url: siteUrl(env, token), created_new_lead: !lead, token_created: created });
}

// Usuario de Instagram: sin @, en minúsculas; letras, números, punto y guion bajo, máx. 30.
function normIg(v) {
  const u = String(v || "").trim().replace(/^@+/, "").toLowerCase();
  return /^[a-z0-9._]{1,30}$/.test(u) ? u : null;
}

// ---------- Token (compartido por ManyChat y el setter) ----------

async function issueToken(env, lead, newLeadFields, igUsername) {
  // Si ya tiene un token vigente, se reutiliza: el mismo lead siempre recibe el mismo link.
  if (lead && lead.token && new Date(lead.token_expires_at) > new Date()) {
    return { token: lead.token, created: false };
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
    await db(env, "POST", "leads", { ...newLeadFields, ...fields });
  }
  return { token, created: true };
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

// ---------- Página interna del setter ----------

const SETTER_PAGE = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Generar link</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:420px;margin:32px auto;padding:0 16px;background:#fafafa;color:#111}
  input,button{width:100%;box-sizing:border-box;font-size:17px;padding:12px;margin:6px 0;border-radius:10px;border:1px solid #ccc}
  button{background:#111;color:#fff;border:0;cursor:pointer}
  #out{margin-top:16px;padding:12px;border-radius:10px;background:#fff;border:1px solid #ddd;display:none;word-break:break-all}
  .muted{color:#666;font-size:14px}
</style></head><body>
<h2>Link de diagnóstico</h2>
<input id="key" type="password" placeholder="Clave del setter" autocomplete="current-password">
<input id="ig" placeholder="@usuario del lead" autocapitalize="none" autocorrect="off">
<button id="go">Generar y copiar</button>
<div id="out"></div>
<script>
  const $ = id => document.getElementById(id);
  try { $("key").value = localStorage.getItem("setterKey") || ""; } catch (e) {}
  $("go").onclick = async () => {
    const out = $("out"); out.style.display = "block"; out.textContent = "Generando...";
    try { localStorage.setItem("setterKey", $("key").value); } catch (e) {}
    const r = await fetch("/setter/link", { method: "POST",
      headers: { "Content-Type": "application/json", "X-Setter-Key": $("key").value },
      body: JSON.stringify({ ig_username: $("ig").value }) });
    const d = await r.json();
    if (!r.ok) { out.textContent = r.status === 401 ? "Clave incorrecta" : "Revisa el @ (" + d.error + ")"; return; }
    try { await navigator.clipboard.writeText(d.url); } catch (e) {}
    out.innerHTML = "<b>Copiado:</b><br>" + d.url +
      (d.created_new_lead ? "<p class=muted>Este @ no estaba en la base; se creó el lead.</p>" : "") +
      (d.token_created ? "" : "<p class=muted>Ya tenía un link vigente; es el mismo.</p>");
  };
</script></body></html>`;
