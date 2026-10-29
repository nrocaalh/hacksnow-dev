// Hacker House — Snow Edition v2 · the Alpine Circle application form

// Backend on Cloudflare Pages; static hosts (GitHub Pages, preview, local
// http.server) have no /api/join, so fall back to localStorage demo mode.
(() => {
  const h = location.hostname;
  const devPreview = location.port === '8573';   // dev-server.py = demo
  const hosted = h && !/github\.io$|^localhost$|^127\.|\[::1\]/.test(h);
  if (hosted && !devPreview) window.WAITLIST_ENDPOINT = '/api/join';
})();

// ---- i18n: EN / ES, no build step ----
const ES = {
  page_title: 'Hacker House · Snow Edition · Dic 2026',
  invite: 'Estás invitado a unirte a',
  edition: 'Snow Edition',
  cell_hack_p: 'Trae una idea. Vuelve con algo construido. Equipos y demos.',
  cell_ski_h3: 'Esquí y snowboard',
  cell_ski_p: 'De principiante a experto. Pistas o solo après. Todos los niveles.',
  cell_comm_h3: 'Comunidad',
  cell_comm_p: 'Gente que construye cosas. Comparte ideas y feedback con otros builders.',
  cell_sponsor_h3: 'Patrocinadores',
  cell_sponsor_p: 'Pendiente. Para más información, contacta en ',
  cta: 'Únete a la Hacker Snow',
  form_title: 'Solicitud · Snow Edition',
  l_name: 'Nombre y apellido',
  l_age: 'Edad',
  l_email: 'Email',
  opt: 'opcional',
  l_role: 'Rol / perfil',
  role1: 'Ingeniero',
  role2: 'Founder',
  role3: 'Diseño',
  role4: 'Estudiante',
  role5: 'Otro',
  l_ski: 'Esquí y snowboard',
  ski1_b: 'Principiante',
  ski1_i: 'Desde cero, necesito clases',
  ski2_b: 'Intermedio',
  ski2_i: 'Pistas verdes, azules y algunas rojas',
  ski3_b: 'Avanzado',
  ski3_i: 'Todas las pistas, algunas negras incluidas',
  ski4_b: 'Experto',
  ski4_i: 'Nos guías tú. Clases al revés',
  ski5_b: 'No quiero esquiar',
  ski5_i: 'Vengo por el código y por la nieve',
  l_project: 'Cuéntanos qué estás construyendo estos días',
  rgpd_pre: 'Acepto que tratemos mis datos para evaluar esta solicitud (RGPD). Los usamos solo para Hacker House: nada de cesiones ni listas de marketing. ',
  privacy_link: 'Aviso de privacidad',
  rgpd_post: ' · Puedes pedir que los borremos cuando quieras.',
  priv_b: 'Aviso de privacidad (art. 13 RGPD).',
  priv_rest: 'Responsable: Hacker House, Snow Edition. Finalidad: evaluar tu solicitud y organizar la estancia. Datos: nombre, edad, email, rol, GitHub y X (opcionales), web o LinkedIn (opcional), nivel de esquí y tu proyecto. Base legal: tu consentimiento. Conservación: hasta el fin de la edición o hasta que lo retires. Derechos: acceso, rectificación, supresión y oposición: escríbenos a contact@hacksnow.dev. Tus datos no se venden ni se ceden con fines comerciales; solo los tratan los proveedores necesarios (Cloudflare para hosting y base de datos, Resend para el envío de emails).',
  submit: 'Enviar solicitud',
  date_pending: 'Fecha · por confirmar',
  click_hint: 'Haz clic para abrir',
  ok_greet: 'Gracias',
  ok_fine: 'Tu solicitud está enviada. Te enviaremos un correo de confirmación y te haremos saber más detalles en cuanto los tengamos. Nos vemos en la montaña.',
  ok_email: 'Tu solicitud está enviada. Te enviaremos un correo de confirmación y te haremos saber más detalles en cuanto los tengamos. Nos vemos en la montaña.',
  err_name: 'Dinos tu nombre, por favor.',
  err_age: 'Hay que tener 18 años o más.',
  err_age_max: 'La edad máxima es 99 años.',
  err_email: 'El email no es válido, revísalo.',
  err_role: 'Elige el perfil con el que más te identifiques, por favor.',
  err_role_other: 'Cuéntanos tu perfil con unas palabras, por favor.',
  err_ski: 'Elige tu nivel: todos son bienvenidos.',
  err_project: 'Cuéntanos en un par de frases qué estás construyendo, por favor.',
  err_rgpd: 'Necesitamos tu consentimiento (RGPD) para poder guardar tus datos.',
  err_dup: 'Tu nombre ya está en la lista. À bientôt sur la montagne.',
  err_fail: 'Un pequeño imprevisto, inténtalo de nuevo.',
};
const EN_MSGS = {
  err_name: 'Kindly tell us your name.',
  err_age: 'Age must be 18 or above.',
  err_age_max: 'Maximum age is 99.',
  err_email: 'Invalid email, kindly try again.',
  err_role: 'Pick the profile that fits you best, please.',
  err_role_other: 'Tell us your profile in a word or two, please.',
  err_ski: 'Choose your Ski & Snow preference: all are welcome.',
  err_project: 'Tell us in a sentence or two what you are building, please.',
  err_rgpd: 'We need your consent (GDPR) before we can keep your data.',
  err_dup: 'Your name is already on the list. À bientôt sur la montagne.',
  err_fail: 'A momentary inconvenience, please try again.',
  ok_greet: 'Thank you',
  ok_email: "Your application is in. We’ll send you a confirmation email and let you know more details as soon as we have them. See you on the mountain.",
};

// EN fallback = whatever the DOM ships with (plus hardcoded message strings)
const EN_TEXT = {};
document.querySelectorAll('[data-i18n]').forEach(el => { EN_TEXT[el.dataset.i18n] = el.textContent; });

let lang = localStorage.getItem('hh_snow_v2_lang')
  || ((navigator.language || 'en').startsWith('es') ? 'es' : 'en');

function t(key) {
  if (lang === 'es' && ES[key] != null) return ES[key];
  return EN_TEXT[key] ?? EN_MSGS[key] ?? '';
}

function applyLang(next) {
  lang = next;
  document.documentElement.lang = lang;
  localStorage.setItem('hh_snow_v2_lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('lang-active', b.dataset.lang === lang));
  fitSheet();
}

// ---- the envelope: opens when the visitor clicks it ----
const intro = document.getElementById('intro');
if (intro) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let introDone = false;
  const finishIntro = () => {
    if (introDone) return;
    introDone = true;
    document.body.classList.remove('intro-lock');
    intro.classList.add('open', 'done');
    setTimeout(() => { intro.hidden = true; }, 1100);
  };
  if (reduceMotion) {
    intro.hidden = true;
  } else {
    document.body.classList.add('intro-lock');
    let opened = false;
    const openEnvelope = () => {
      if (opened || introDone) return;
      opened = true;
      intro.classList.add('open');
      // let the flap + letter animation play, then dissolve to the page
      setTimeout(finishIntro, 2300);
    };
    intro.addEventListener('click', (e) => {
      // only the envelope itself opens; the green desk throws snow
      if (e.target.closest('.envelope') || e.target.closest('.env-hint')) openEnvelope();
      else snowBurst(e.clientX, e.clientY);
    });
    document.addEventListener('keydown', (e) => {
      if (intro.hidden) return;
      if (e.key === 'Escape') { finishIntro(); }
      else if (e.key === 'Enter' || e.key === ' ') { openEnvelope(); }
    });
  }
}

const joinBtn = document.getElementById('join-btn');
const modal = document.getElementById('join-modal');
const form = document.getElementById('waitlist-form');
const msg = document.getElementById('form-msg');
const success = document.getElementById('success');

document.querySelectorAll('.lang-btn').forEach(b => {
  b.addEventListener('click', () => applyLang(b.dataset.lang));
});

// ---- open / close the application modal ----
function openModal() {
  modal.hidden = false;
  modal.style.bottom = '';
  document.body.classList.add('modal-open');
  document.getElementById('f-name').focus();
}
function closeModal() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
}
joinBtn.addEventListener('click', openModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

// ---- keyboard-aware modal (phones) ----
// iOS keeps `innerHeight` full when the keyboard opens, so the bottom of the
// form ends up unreachable. Track the visual viewport: lift the modal's
// bottom edge by the keyboard height so the card (capped at 100% of the
// modal) re-scrolls within the space that is actually visible.
if (window.visualViewport) {
  const vv = window.visualViewport;
  const fitModal = () => {
    if (modal.hidden) return;
    const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    modal.style.bottom = covered + 'px';
  };
  vv.addEventListener('resize', fitModal);
  vv.addEventListener('scroll', fitModal);
}
// keep the focused field comfortably in view on the card's own scroll
form.addEventListener('focusin', (e) => {
  if (e.target.matches('input, textarea')) {
    setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
  }
});

// expandable privacy notice (GDPR art. 13)
document.getElementById('privacy-link').addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();   // the link sits inside the consent <label>: don't toggle the checkbox
  const note = document.getElementById('privacy-note');
  note.hidden = !note.hidden;
  if (!note.hidden) note.scrollIntoView({ block: 'nearest' });
});

// "Other" role: reveal a free-text field for the actual profile
const roleOther = document.getElementById('f-role-other');
form.querySelectorAll('input[name="role"]').forEach(r => {
  r.addEventListener('change', () => {
    roleOther.hidden = r.value !== 'other';
    if (!roleOther.hidden) roleOther.focus();
  });
});

function storedEntries() {
  try { return JSON.parse(localStorage.getItem('hh_snow_v2_waitlist') || '[]'); }
  catch { return []; }
}

// ---- submit the application ----
// Demo persistence via localStorage. To wire a real backend, set
// window.WAITLIST_ENDPOINT before this script (see README).
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('f-name').value.trim();
  const age = parseInt(document.getElementById('f-age').value, 10);
  const email = document.getElementById('f-email').value.trim();
  const role = form.querySelector('input[name="role"]:checked');
  const github = document.getElementById('f-gh').value.trim();
  const xHandle = document.getElementById('f-x').value.trim();
  const web = document.getElementById('f-web').value.trim();
  const hp = document.getElementById('f-hp').value.trim();
  const ski = form.querySelector('input[name="ski"]:checked');
  const project = document.getElementById('f-project').value.trim();
  const rgpd = document.getElementById('f-rgpd');

  if (name.length < 2) { msg.textContent = t('err_name'); return; }
  if (!(age >= 18)) { msg.textContent = t('err_age'); return; }
  if (age > 99) { msg.textContent = t('err_age_max'); return; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    msg.textContent = t('err_email');
    return;
  }
  if (!role) { msg.textContent = t('err_role'); return; }
  const roleOtherVal = roleOther.value.trim();
  if (role.value === 'other' && roleOtherVal.length < 2) {
    msg.textContent = t('err_role_other');
    return;
  }
  if (!ski) { msg.textContent = t('err_ski'); return; }
  if (project.length < 10) { msg.textContent = t('err_project'); return; }
  if (!rgpd.checked) {
    msg.textContent = t('err_rgpd');
    return;
  }

  const emails = storedEntries();
  if (emails.some(x => x.email === email)) {
    msg.textContent = t('err_dup');
    return;
  }

  msg.textContent = '…';
  const entry = {
    name, age, email,
    role: role.value,
    roleOther: role.value === 'other' ? roleOtherVal : null,
    github: github || null,
    x: xHandle || null,
    web: web || null,
    skiLevel: ski.value,
    aiProject: project,
    locale: lang,
    gdprConsent: true,
    hp,
    consentTs: new Date().toISOString(),
    ts: new Date().toISOString(),
  };

  let position = null;
  let emailSent = false;
  let usedBackend = false;
  if (window.WAITLIST_ENDPOINT) {
    let res;
    try {
      res = await fetch(window.WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch {
      msg.textContent = t('err_fail');
      return;
    }
    if (res.status === 409) {
      msg.textContent = t('err_dup');
      return;
    }
    let data = {};
    try { data = await res.json(); } catch { /* keep defaults */ }
    if (!res.ok || !data.ok) {
      msg.textContent = t('err_fail');
      return;
    }
    usedBackend = true;
    position = typeof data.position === 'number' ? data.position : null;
    emailSent = !!data.emailSent;
  }

  // demo/no-backend fallback: keep the entry locally and number the seat.
  // With a real backend the record lives in D1 — don't duplicate PII in the browser.
  if (!usedBackend) {
    position = emails.length + 1;
    emails.push(entry);
    localStorage.setItem('hh_snow_v2_waitlist', JSON.stringify(emails));
  }

  msg.textContent = '';
  form.hidden = true;
  const prettyName = name.charAt(0).toUpperCase() + name.slice(1);
  document.getElementById('success-title').textContent = `${t('ok_greet')} ${prettyName}`;
  document.querySelector('#success .fine').textContent = emailSent ? t('ok_email') : t('ok_fine');
  success.hidden = false;
});

// ---- fit-to-viewport: the page never scrolls, on any screen ----
// CSS clamps compact the layout to the window; if the sheet is still
// taller than the viewport (small laptop, tiny phone), we scale the
// whole sheet down like stepping back from a poster. No scrollbars,
// nothing clipped, proportions preserved.
const sheet = document.querySelector('.sheet');
function fitSheet() {
  sheet.style.transform = '';
  /* fit the whole sheet to the screen on every device, phones included */
  const availH = document.documentElement.clientHeight;
  const availW = document.documentElement.clientWidth;
  const r = sheet.getBoundingClientRect();
  const scale = Math.min(1, (availH - 8) / r.height, (availW - 8) / r.width);
  if (scale < 1) sheet.style.transform = `scale(${scale})`;
}
addEventListener('resize', fitSheet);
addEventListener('orientationchange', fitSheet);
window.addEventListener('load', fitSheet);
document.fonts && document.fonts.ready.then(fitSheet);
fitSheet();

// ---- gentle snowfall, ivory against the green room ----
const canvas = document.getElementById('snow');
const ctx = canvas.getContext('2d');
let flakes = [];
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
resize(); addEventListener('resize', resize);
for (let i = 0; i < Math.min(150, Math.floor(innerWidth / 9)); i++) {
  flakes.push({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 2.2 + .55,
    d: Math.random() * .55 + .22,
    o: Math.random() * .5 + .22,
  });
}
let vy = 0;
// snow bursts: a clap on the green desk throws flakes from the click point
const bursts = [];
function snowBurst(x, y) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 46; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = Math.random() * 5.5 + 2;
    bursts.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 2,
      r: Math.random() * 2.6 + .8,
      o: 1,
      decay: Math.random() * .018 + .012,
    });
  }
}
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      ctx.fillStyle = `rgba(250, 252, 248, ${Math.max(b.o, 0)})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2, true);
      ctx.fill();
      b.x += b.vx;
      b.y += b.vy;
      b.vy += .12;              // gravity pulls the burst back down
      b.vx *= .99;
      b.o -= b.decay;
      if (b.o <= 0) bursts.splice(i, 1);
    }
    for (const f of flakes) {
      ctx.fillStyle = `rgba(250, 252, 248, ${f.o})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
      ctx.fill();
      if (f.r > 1.5) {                       /* soft halo on big flakes */
        ctx.fillStyle = `rgba(255, 255, 255, ${f.o * .3})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 2, 0, Math.PI * 2, true);
        ctx.fill();
      }
      f.y += f.d + vy;
      f.x += Math.sin(f.y / 90) * .3;
      if (f.y > canvas.height) { f.y = -4; f.x = Math.random() * canvas.width; }
    }
    vy = Math.min(vy + .004, .4);
    requestAnimationFrame(loop);
  })();
}

// apply stored/detected language on load
if (lang !== 'en') applyLang(lang);
else document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('lang-active', b.dataset.lang === 'en'));
