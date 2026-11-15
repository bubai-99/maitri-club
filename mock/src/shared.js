import './styles.css';
import { createIcons, icons } from 'lucide';
import QRCode from 'qrcode';

/* ---------- Language ---------- */
const LS_KEY = 'maitri-lang';
export let lang = (() => {
  try { return localStorage.getItem(LS_KEY) || 'en'; } catch { return 'en'; }
})();

/** Bilingual inline text. English is the source; Bengali swaps in. */
export const t = (en, bn) => `<span data-bn="${bn.replace(/"/g, '&quot;')}">${en}</span>`;

const bnDigits = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

/** Indian-grouped rupee amount that follows the language toggle. */
export const inr = (n, { plain = false } = {}) =>
  `<span class="num" data-n="${n}" data-fmt="${plain ? 'n' : 'inr'}">${fmtNum(n, plain ? 'n' : 'inr')}</span>`;
/** Any number / date-ish string whose digits localise. */
export const dn = (s) => `<span class="num" data-d="${s}">${lang === 'bn' ? bnDigits(s) : s}</span>`;

function fmtNum(n, fmt) {
  const s = Number(n).toLocaleString('en-IN');
  const out = fmt === 'inr' ? `₹${s}` : s;
  return lang === 'bn' ? bnDigits(out) : out;
}

export function applyLang(root = document) {
  document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  document.documentElement.dataset.lang = lang;
  root.querySelectorAll('[data-bn]').forEach((el) => {
    if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
    el.innerHTML = lang === 'bn' ? el.dataset.bn : el.dataset.en;
  });
  root.querySelectorAll('[data-bn-ph]').forEach((el) => {
    if (el.dataset.enPh === undefined) el.dataset.enPh = el.placeholder;
    el.placeholder = lang === 'bn' ? el.dataset.bnPh : el.dataset.enPh;
  });
  root.querySelectorAll('[data-alt-bn]').forEach((el) => {
    if (el.dataset.altEn === undefined) el.dataset.altEn = el.alt;
    el.alt = lang === 'bn' ? el.dataset.altBn : el.dataset.altEn;
  });
  root.querySelectorAll('[data-n]').forEach((el) => {
    el.textContent = fmtNum(el.dataset.n, el.dataset.fmt);
  });
  root.querySelectorAll('[data-d]').forEach((el) => {
    el.textContent = lang === 'bn' ? bnDigits(el.dataset.d) : el.dataset.d;
  });
  document.querySelectorAll('[data-lang-btn]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.langBtn === lang));
  });
}

export function setLang(l) {
  lang = l;
  try { localStorage.setItem(LS_KEY, l); } catch { /* private mode */ }
  applyLang();
  document.dispatchEvent(new CustomEvent('langchange'));
}

/* ---------- Icons ---------- */
export const refreshIcons = () => createIcons({ icons, attrs: { 'stroke-width': 1.75 } });

/* ---------- Seal (club rubber stamp) ---------- */
let sealId = 0;
export function seal({ size = 96, color = 'var(--color-sindoor)', rotate = -8, className = '', estd = true } = {}) {
  const id = `seal-${++sealId}`;
  const ring = estd ? 'GEDE MAITREE CLUB  •  NETAJI PARA  •  ESTD 1972  •  ' : 'GEDE MAITREE CLUB  •  NETAJI PARA  •  ';
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="Gede Maitree Club seal" style="transform:rotate(${rotate}deg);color:${color}">
    <defs><path id="${id}" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/></defs>
    <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="5"/>
    <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <text font-family="Anek Bangla Variable, sans-serif" font-weight="700" font-size="13.5" letter-spacing="1.2" fill="currentColor">
      <textPath href="#${id}" textLength="462" lengthAdjust="spacing">${ring}</textPath>
    </text>
    <text x="100" y="110" text-anchor="middle" font-family="DM Serif Display, Tiro Bangla, serif" font-size="${lang === 'bn' ? 40 : 29}" fill="currentColor" data-bn="মৈত্রী">Maitree</text>
    <text x="100" y="134" text-anchor="middle" font-family="Anek Bangla Variable, sans-serif" font-weight="600" font-size="11" letter-spacing="3" fill="currentColor" data-bn="ক্লাব">CLUB</text>
  </svg>`;
}

/* ---------- QR ---------- */
export async function qr(el, text, { dark = '#2b2f36', light = '#00000000', margin = 0 } = {}) {
  el.innerHTML = await QRCode.toString(text, { type: 'svg', margin, color: { dark, light }, errorCorrectionLevel: 'M' });
  const svg = el.querySelector('svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
}

/* ---------- Hash router for [data-screen] sections ---------- */
export function router(defaultScreen, onChange) {
  const go = () => {
    const raw = location.hash.replace('#', '') || defaultScreen;
    const [name, param] = raw.split('/');
    const exists = document.querySelector(`[data-screen="${name}"]`);
    const screen = exists ? name : defaultScreen;
    document.querySelectorAll('[data-screen]').forEach((s) => s.classList.toggle('is-active', s.dataset.screen === screen));
    document.querySelectorAll('[data-nav]').forEach((a) => {
      const on = a.dataset.nav === screen;
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    onChange?.(screen, param);
    if (!location.hash.includes('/')) window.scrollTo({ top: 0 });
    document.querySelectorAll('[data-scroll-top]').forEach((el) => (el.scrollTop = 0));
  };
  window.addEventListener('hashchange', go);
  go();
}

/* ---------- Toast ---------- */
export function toast(html, { tone = 'ink' } = {}) {
  let host = document.getElementById('toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast-host';
    host.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-md';
    host.setAttribute('role', 'status');
    document.body.append(host);
  }
  const el = document.createElement('div');
  const bg = 'bg-ink'; // status never borrows a book colour
  el.className = `${bg} text-paper rounded-xl px-4 py-3 text-[15px] shadow-lg rise flex items-center gap-2.5`;
  el.innerHTML = html;
  host.append(el);
  applyLang(el);
  refreshIcons();
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; }, 2600);
  setTimeout(() => el.remove(), 3000);
}

/* ---------- Prototype bar ---------- */
const SURFACES = [
  { href: '/index.html', key: 'site', en: 'Website', bn: 'ওয়েবসাইট', icon: 'globe' },
  { href: '/login.html', key: 'login', en: 'Member login', bn: 'সদস্য লগইন', icon: 'log-in' },
  { href: '/app.html', key: 'app', en: 'Member app', bn: 'সদস্য অ্যাপ', icon: 'smartphone' },
  { href: '/admin-login.html', key: 'admin-login', en: 'Committee login', bn: 'কমিটি লগইন', icon: 'key-round' },
  { href: '/console.html', key: 'console', en: 'Committee console', bn: 'কমিটি কনসোল', icon: 'book-open' },
  { href: '/scan.html', key: 'scan', en: 'Gate scanner', bn: 'গেট স্ক্যানার', icon: 'scan-line' },
];

export function protoBar(current, { dark = false } = {}) {
  const bar = document.createElement('div');
  bar.className = `proto-bar ${dark ? 'bg-black/60 border-b border-white/10' : 'bg-ink'} text-paper/80 text-[13px] relative z-50`;
  bar.innerHTML = `
    <div class="mx-auto max-w-[1400px] px-4 h-10 flex items-center gap-1">
      <span class="hidden md:inline font-semibold text-paper mr-3 tracking-wide">Prototype</span>
      <nav class="flex items-center gap-0.5 overflow-x-auto no-scrollbar -mx-1 px-1" aria-label="Prototype surfaces">
        ${SURFACES.map((s) => `<a href="${s.href}" ${s.key === current ? 'aria-current="page"' : ''} class="flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-7 hover:text-paper hover:bg-white/10 transition-colors"><i data-lucide="${s.icon}" class="w-3.5 h-3.5"></i>${t(s.en, s.bn)}</a>`).join('')}
      </nav>
      <div class="ml-auto flex items-center rounded-md bg-white/10 p-0.5" role="group" aria-label="Language">
        <button data-lang-btn="en" class="px-2 h-6 rounded aria-pressed:bg-paper aria-pressed:text-ink font-semibold">EN</button>
        <button data-lang-btn="bn" class="px-2 h-6 rounded aria-pressed:bg-paper aria-pressed:text-ink font-semibold">বাং</button>
      </div>
    </div>`;
  document.body.prepend(bar);
  bar.querySelectorAll('[data-lang-btn]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.langBtn)));
}

export function boot(current, opts) {
  protoBar(current, opts);
  applyLang();
  refreshIcons();
}
