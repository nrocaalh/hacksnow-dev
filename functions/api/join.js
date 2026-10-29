// Cloudflare Pages Function · POST /api/join
// Stores the application in D1 and sends a confirmation email via Resend.
// Bindings expected in `env`:
//   env.DB              → D1 database (binding name "DB")
//   env.RESEND_API_KEY  → secret (wrangler pages secret put RESEND_API_KEY)
//   env.MAIL_FROM       → e.g. "Hacker House <contact@hacksnow.dev>"
//   env.MAIL_REPLY_TO   → e.g. "contact@hacksnow.dev"
//   env.NOTIFY_EMAIL    → (optional) get a heads-up copy for each signup

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

const copy = {
  es: {
    subject: 'Confirmación · Hacker House, Snow Edition',
    title: 'Hemos recibido tu inscripción',
    line: (n) => `Hola ${n}, tenemos tu inscripción para la Snow Edition.`,
    details: 'Cuando tengamos más información, te la haremos saber.',
    greet: 'Nos vemos en la montaña,',
  },
  en: {
    subject: 'Confirmation · Hacker House, Snow Edition',
    title: "We've received your application",
    line: (n) => `Hi ${n}, we have your application for the Snow Edition.`,
    details: "When we have more information, we'll let you know.",
    greet: 'See you on the mountain,',
  },
};

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderEmail(entry) {
  const c = copy[entry.locale] || copy.en;
  return `<!doctype html>
<html lang="${entry.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(c.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#16281e;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#16281e;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#f3ecda;border-collapse:collapse;">
          <tr>
            <td style="padding:28px 24px;font-family:Georgia,'Times New Roman',serif;color:#1c1c1c;">
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#7a1f2b;">Hacker House · Snow Edition</p>
              <h1 style="margin:0 0 14px;font-size:22px;line-height:1.25;color:#1c1c1c;">${esc(c.title)}</h1>
              <p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:#1c1c1c;word-break:break-word;">${esc(c.line(entry.name))}</p>
              <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#1c1c1c;">${esc(c.details)}</p>
              <hr style="border:0;border-top:1px solid #b99a5b;margin:20px 0;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#1c1c1c;">${esc(c.greet)}<br>The Hack Snow Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendEmail({ env, to, subject, html }) {
  if (!env.RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY not set' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.MAIL_FROM || 'Hacker House <onboarding@resend.dev>',
      to: [to],
      reply_to: env.MAIL_REPLY_TO || undefined,
      subject,
      html,
    }),
  });
  const body = await res.text();
  if (!res.ok) return { ok: false, error: `resend ${res.status}: ${body}` };
  return { ok: true };
}

const SKI_LEVELS = new Set(['beginner', 'intermediate', 'advanced', 'expert', 'none']);
const ROLES = new Set(['engineer', 'founder', 'designer', 'data-ai', 'student', 'other']);
const MAX = { name: 80, email: 254, github: 39, x: 15, web: 200, roleOther: 60, project: 500 };
const MAX_BODY = 8000;

const fail = (error, status = 400) =>
  Response.json({ ok: false, error }, { status });

// best-effort rate limit: per-isolate memory, 5 requests / 10 min / IP.
// It resets on deploy and is per-instance; for hard guarantees add a
// Cloudflare WAF rate-limiting rule or Turnstile on the form.
const RATE_WINDOW = 10 * 60 * 1000;
const RATE_MAX = 5;
const recent = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) {          // prune so the map can't grow forever
    for (const [k, v] of recent) {
      if (v.every((t) => now - t >= RATE_WINDOW)) recent.delete(k);
    }
  }
  return hits.length > RATE_MAX;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // only our own page may submit: same-host Origin and JSON content type
  // (a cross-site form can forge JSON as text/plain without a preflight)
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) return fail('bad_origin', 403);
    } catch {
      return fail('bad_origin', 403);
    }
  }
  const ctype = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (ctype !== 'application/json') return fail('bad_content_type', 415);

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (isRateLimited(ip)) return fail('rate_limited', 429);

  const raw = await request.text().catch(() => '');
  if (raw.length > MAX_BODY) return fail('too_large', 413);

  let json;
  try { json = JSON.parse(raw); } catch { return fail('invalid_json'); }
  if (!json || typeof json !== 'object' || Array.isArray(json)) return fail('invalid_json');

  const nameS = String(json.name ?? '').trim();
  const emailS = String(json.email ?? '').trim().toLowerCase();
  const projectS = String(json.aiProject ?? '').trim();
  const githubS = json.github ? String(json.github).trim() : '';
  const xS = json.x ? String(json.x).trim() : '';
  const webS = json.web ? String(json.web).trim() : '';
  const roleS = String(json.role ?? '').trim();
  const roleOtherS = json.roleOther ? String(json.roleOther).trim() : '';
  const ageN = Number(json.age);
  const locale = json.locale === 'es' ? 'es' : 'en';

  if (nameS.length < 2 || nameS.length > MAX.name) return fail('name');
  if (!Number.isInteger(ageN) || ageN < 18 || ageN > 99) return fail('age');
  if (!EMAIL_RE.test(emailS) || emailS.length > MAX.email) return fail('email');
  if (!ROLES.has(roleS)) return fail('role');
  if (roleS === 'other' && (roleOtherS.length < 2 || roleOtherS.length > MAX.roleOther)) return fail('role');
  if (!SKI_LEVELS.has(String(json.skiLevel))) return fail('ski');
  if (projectS.length < 10 || projectS.length > MAX.project) return fail('project');
  if (githubS.length > MAX.github || xS.length > MAX.x || webS.length > MAX.web) return fail('social');
  if (json.gdprConsent !== true) return fail('rgpd');          // consent is mandatory
  if (String(json.hp ?? '').trim() !== '') return fail('spam'); // honeypot

  // 1) persist to D1 (UNIQUE(email) enforces one seat per person)
  let lastId;
  try {
    const { success, meta } = await env.DB.prepare(
      `INSERT INTO applications (email, name, age, role, role_other, github, x, web, ski_level, ai_project, locale, gdpr_consent, consent_ts)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      emailS, nameS, ageN, roleS, roleS === 'other' ? roleOtherS : null,
      githubS || null, xS || null, webS || null,
      String(json.skiLevel), projectS, locale, 1, new Date().toISOString()   // consent timestamp is server-side
    ).run();
    if (!success) throw new Error('insert failed');
    lastId = Number(meta?.last_row_id ?? meta?.last_rowid);
  } catch (e) {
    const dup = /UNIQUE constraint failed: applications\.email/i.test(String(e?.message || e));
    if (dup) return fail('duplicate', 409);
    console.error('D1 insert error', e?.message || e);
    return fail('db', 500);
  }

  const position = Number.isFinite(lastId) ? lastId : null;
  const entry = { name: nameS, locale };

  // 2) confirmation email to the applicant
  const c = copy[entry.locale];
  const mailed = await sendEmail({
    env, to: emailS, subject: c.subject, html: renderEmail(entry),
  });
  if (!mailed.ok) console.error('confirmation email failed', mailed.error);

  // 3) optional organizer heads-up. waitUntil keeps the isolate alive after the
  // response, so the fetch actually completes instead of being cut off.
  if (env.NOTIFY_EMAIL && env.RESEND_API_KEY) {
    const ref = position != null ? ` (#${position})` : '';
    context.waitUntil(
      sendEmail({
        env, to: env.NOTIFY_EMAIL,
        subject: `Nueva solicitud · ${nameS.replace(/[\r\n]+/g, ' ')}${ref}`,
        html: `<p><b>${esc(nameS)}</b> · ${esc(emailS)}<br>${esc(roleS === 'other' && roleOtherS ? roleOtherS : roleS)} · ${esc(json.skiLevel)}<br><i>${esc(projectS)}</i></p>`,
      }).then(
        (r) => { if (!r.ok) console.error('organizer email failed', r.error); },
        (e) => console.error('organizer email failed', e?.message || e)
      )
    );
  }

  return Response.json({ ok: true, position, emailSent: mailed.ok });
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
