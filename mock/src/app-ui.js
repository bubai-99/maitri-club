// Small UI kit for the member app: rendering, sheets/dialogs, dates, page headers, print.
import { t, applyLang, refreshIcons, lang, toast } from './shared.js';
import { store, TODAY } from './member-data.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
/** Plain localised string, for attributes (aria-label, title, value). Screens re-render on language change. */
export const L = (en, bn) => (lang === 'bn' ? bn : en);
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function paint(el, html) {
  if (typeof el === 'string') el = $(el);
  el.innerHTML = html;
  applyLang(el);
  refreshIcons();
  return el;
}

/* ---------- Dates ---------- */
const MEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MBN = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
const DEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DBN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
export const bnD = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
const parts = (iso) => iso.split('-').map(Number);
export const fdate = (iso, { year = true, day = false } = {}) => {
  const [y, m, d] = parts(iso);
  const wd = new Date(y, m - 1, d).getDay();
  return t(`${day ? DEN[wd] + ' ' : ''}${d} ${MEN[m - 1]}${year ? ' ' + y : ''}`, `${day ? DBN[wd] + ' ' : ''}${bnD(d)} ${MBN[m - 1]}${year ? ' ' + bnD(y) : ''}`);
};
export const fmonth = (ym, { short = false } = {}) => {
  const [y, m] = parts(ym);
  return short ? t(MEN[m - 1], MBN[m - 1]) : t(`${MEN[m - 1]} ${y}`, `${MBN[m - 1]} ${bnD(y)}`);
};
export const monthPlain = (ym) => { const [y, m] = parts(ym); return `${MEN[m - 1]} ${y}`; };
export const dayMon = (iso) => { const [, m, d] = parts(iso); return { d: String(d).padStart(2, '0'), en: MEN[m - 1].toUpperCase(), bn: MBN[m - 1] }; };
export const addMonths = (ym, n) => { const [y, m] = parts(ym); const dt = new Date(y, m - 1 + n, 1); return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`; };
export const ageOn = (dob) => { const [y, m, d] = parts(dob); const [ty, tm, td] = parts(TODAY); return ty - y - (tm < m || (tm === m && td < d) ? 1 : 0); };
export const daysUntil = (iso) => Math.round((new Date(iso) - new Date(TODAY)) / 86400000);

/* ---------- Building blocks ---------- */
export const backLink = (href, en = 'Back', bn = 'ফিরে যান') =>
  `<a href="${href}" class="inline-flex items-center gap-1 h-9 text-sm font-semibold text-ink-2 hover:text-ink -ml-1 rounded"><i data-lucide="chevron-left" class="w-4 h-4"></i>${t(en, bn)}</a>`;

/** Page header used by every screen. `actions` sits right of the title on laptops, below it on phones. */
export const pageHead = ({ en, bn, subEn = '', subBn = '', back = '', actions = '', eyebrow = '' }) => `
  ${back ? `<div class="mb-1">${back}</div>` : ''}
  <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      ${eyebrow}
      <h1 class="font-display text-[1.9rem] lg:text-[2.3rem] leading-tight">${t(en, bn)}</h1>
      ${subEn ? `<p class="text-[15px] text-ink-2 mt-1 max-w-[60ch]">${t(subEn, subBn)}</p>` : ''}
    </div>
    ${actions ? `<div class="flex flex-wrap gap-2 shrink-0">${actions}</div>` : ''}
  </header>`;

export const sectionTitle = (en, bn, right = '') => `
  <div class="flex items-baseline justify-between gap-3"><h2 class="text-[13px] font-bold uppercase tracking-wide text-ink-2">${t(en, bn)}</h2>${right}</div>`;

export const empty = ({ icon, en, bn, subEn = '', subBn = '', action = '' }) => `
  <div class="rounded-lg border border-dashed border-ink/25 bg-card px-6 py-10 text-center">
    <span class="w-12 h-12 mx-auto rounded-full bg-paper-2 grid place-items-center"><i data-lucide="${icon}" class="w-6 h-6 text-ink-2"></i></span>
    <p class="font-semibold mt-3">${t(en, bn)}</p>
    ${subEn ? `<p class="text-[15px] text-ink-2 mt-1 max-w-[40ch] mx-auto">${t(subEn, subBn)}</p>` : ''}
    ${action ? `<div class="mt-4">${action}</div>` : ''}
  </div>`;

export const skeleton = (rows = 3) => `<div class="space-y-2" aria-busy="true" aria-label="${L('Loading', 'লোড হচ্ছে')}">${'<div class="h-14 rounded-lg bg-paper-2 animate-pulse"></div>'.repeat(rows)}</div>`;

/** Segmented control (tabs). */
export const segmented = (items, current, attr = 'data-seg', label = '') => `
  <div class="inline-grid grid-flow-col auto-cols-fr p-1 rounded-[7px] bg-paper-2 w-full sm:w-auto" role="tablist" ${label ? `aria-label="${label}"` : ''}>
    ${items.map(([k, en, bn, count]) => `<button type="button" role="tab" ${attr}="${k}" aria-selected="${k === current}" class="h-9 px-4 rounded-[5px] text-[14.5px] font-semibold text-ink-2 whitespace-nowrap aria-selected:bg-white aria-selected:text-ink aria-selected:shadow-[0_1px_2px_rgba(0,0,0,.12)]">${t(en, bn)}${count ? ` <span class="num text-ink-3">${bnIf(count)}</span>` : ''}</button>`).join('')}
  </div>`;
const bnIf = (n) => (lang === 'bn' ? bnD(n) : n);

/** Filter chips. */
export const chips = (items, current, attr = 'data-chip') => `
  <div class="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap" role="group">
    ${items.map(([k, en, bn]) => `<button type="button" ${attr}="${k}" aria-pressed="${k === current}" class="chip h-9 px-3.5 text-sm whitespace-nowrap border border-rule bg-card hover:border-ink/40 aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink">${t(en, bn)}</button>`).join('')}
  </div>`;

export const statusChip = (tone, en, bn, icon = '') => {
  const c = { ok: 'bg-tulsi-wash text-tulsi', due: 'bg-sindoor-wash text-sindoor-deep', wait: 'bg-marigold-wash text-turmeric', ink: 'bg-ink text-paper', muted: 'bg-paper-2 text-ink-2' }[tone];
  return `<span class="chip ${c} whitespace-nowrap">${icon ? `<i data-lucide="${icon}"></i>` : ''}${t(en, bn)}</span>`;
};

export const avatar = (p, size = 'w-10 h-10 text-base', tone = 'bg-paper-2 text-ink') => p.photoUrl
  ? `<img src="${p.photoUrl}" alt="" class="${size} rounded-full object-cover shrink-0 border border-rule" />`
  : `<span class="${size} rounded-full ${tone} grid place-items-center font-display shrink-0" aria-hidden="true">${(lang === 'bn' ? p.nameBn : p.name).slice(0, 1)}</span>`;

/* ---------- Sheet / dialog ---------- */
let lastFocus = null;
let onCloseCb = null;
export function openSheet(html, { onMount, onClose, wide = false } = {}) {
  const sheet = $('#sheet');
  const body = $('#sheet-body');
  lastFocus = document.activeElement;
  onCloseCb = onClose || null;
  body.classList.toggle('lg:max-w-[720px]', wide);
  body.classList.toggle('lg:max-w-[520px]', !wide);
  paint(body, html);
  sheet.classList.remove('hidden');
  sheet.classList.add('flex');
  document.documentElement.style.overflow = 'hidden';
  body.scrollTop = 0;
  onMount?.(body);
  const focusable = body.querySelector('[autofocus], input:not([type=hidden]):not(.sr-only), select, textarea, button:not([data-close]), a[href]') || body.querySelector('[data-close]');
  focusable?.focus({ preventScroll: true });
}
export function closeSheet() {
  const sheet = $('#sheet');
  if (sheet.classList.contains('hidden')) return;
  sheet.classList.add('hidden');
  sheet.classList.remove('flex');
  document.documentElement.style.overflow = '';
  const cb = onCloseCb; onCloseCb = null; cb?.();
  lastFocus?.focus?.({ preventScroll: true });
}
export function initSheet() {
  $('#sheet').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeSheet(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSheet();
    if (e.key === 'Tab' && !$('#sheet').classList.contains('hidden')) {
      const f = $$('#sheet-body button, #sheet-body a[href], #sheet-body input:not(.sr-only), #sheet-body select, #sheet-body textarea, #sheet-body label[tabindex]').filter((x) => !x.disabled && x.offsetParent);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

export const sheetHead = (en, bn, subEn = '', subBn = '') => `
  <div class="flex items-start gap-3">
    <div class="min-w-0 flex-1">
      <h2 id="sheet-title" class="font-display text-2xl leading-tight">${t(en, bn)}</h2>
      ${subEn ? `<p class="text-[15px] text-ink-2 mt-1">${t(subEn, subBn)}</p>` : ''}
    </div>
    <button type="button" data-close class="w-10 h-10 -mr-2 -mt-1 grid place-items-center rounded-full hover:bg-paper-2 shrink-0" aria-label="${L('Close', 'বন্ধ করুন')}"><i data-lucide="x" class="w-5 h-5"></i></button>
  </div>`;

/** Success panel shown inside the sheet after a form is "sent". */
export const donePanel = ({ icon = 'check', tone = 'ok', en, bn, subEn = '', subBn = '', ref = '', extra = '', btnEn = 'Done', btnBn = 'ঠিক আছে', href = '' }) => `
  <div class="text-center pt-2 rise">
    <div class="w-16 h-16 mx-auto rounded-full ${tone === 'ok' ? 'bg-tulsi-wash text-tulsi' : 'bg-marigold-wash text-turmeric'} grid place-items-center"><i data-lucide="${icon}" class="w-7 h-7"></i></div>
    <h2 id="sheet-title" class="font-display text-2xl mt-4">${t(en, bn)}</h2>
    ${subEn ? `<p class="text-[15px] text-ink-2 mt-2 max-w-[42ch] mx-auto">${t(subEn, subBn)}</p>` : ''}
    ${ref ? `<p class="mt-3 inline-flex items-center gap-2 rounded-md bg-paper-2 px-3 h-8 text-sm"><span class="text-ink-3">${t('Reference', 'রেফারেন্স')}</span><span class="font-semibold num">${ref}</span></p>` : ''}
    ${extra}
    ${href ? `<a href="${href}" class="btn btn-ink w-full h-12 mt-6" data-close>${t(btnEn, btnBn)}</a>` : `<button type="button" class="btn btn-ink w-full h-12 mt-6" data-close>${t(btnEn, btnBn)}</button>`}
  </div>`;

/** Yes / no confirmation. */
export function confirmSheet({ en, bn, subEn = '', subBn = '', yesEn, yesBn, danger = false, onYes }) {
  openSheet(`
    ${sheetHead(en, bn, subEn, subBn)}
    <div class="mt-6 grid grid-cols-2 gap-2">
      <button type="button" class="btn btn-line h-12" data-close>${t('Cancel', 'বাতিল')}</button>
      <button type="button" class="btn ${danger ? 'btn-primary' : 'btn-ink'} h-12" id="confirm-yes">${t(yesEn, yesBn)}</button>
    </div>`, { onMount: (b) => b.querySelector('#confirm-yes').addEventListener('click', () => onYes(b)) });
}

export const ok = (en, bn, icon = 'check-circle-2') => toast(`<i data-lucide="${icon}" class="w-5 h-5 shrink-0"></i><span>${t(en, bn)}</span>`);

/** Guard for anything that needs the network. */
export function needOnline() {
  if (!store.offline) return true;
  toast(`<i data-lucide="wifi-off" class="w-5 h-5 shrink-0"></i><span>${t('You’re offline. This needs a connection; try again in a moment.', 'আপনি অফলাইন। এর জন্য ইন্টারনেট লাগবে; একটু পরে আবার চেষ্টা করুন।')}</span>`);
  return false;
}

/** Field-level error under an input. */
export function fieldError(input, en, bn) {
  const id = `${input.id || input.name}-err`;
  let p = document.getElementById(id);
  if (!p) {
    p = document.createElement('p');
    p.id = id;
    p.setAttribute('role', 'alert');
    p.className = 'mt-1.5 text-sm font-medium text-sindoor-deep flex items-center gap-1.5';
    (input.closest('[data-field]') || input.parentElement).append(p);
  }
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', id);
  paint(p, `<i data-lucide="circle-alert" class="w-4 h-4 shrink-0"></i>${t(en, bn)}`);
  input.focus();
  input.addEventListener('input', () => { p.remove(); input.removeAttribute('aria-invalid'); }, { once: true });
  return false;
}

/* ---------- Print / download ---------- */
/** Print a document on A4 using the shared #print-sheet. "Save as PDF" in the dialog keeps a file. */
export async function printDoc(html) {
  let sheet = document.getElementById('print-sheet');
  if (!sheet) { sheet = document.createElement('div'); sheet.id = 'print-sheet'; document.body.append(sheet); }
  sheet.innerHTML = `<div style="font-family:var(--font-sans);color:#2b2f36;font-size:12pt;line-height:1.45">${html}</div>`;
  applyLang(sheet);
  await document.fonts.ready;
  window.print();
}

export function downloadText(name, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Read an image <input type=file> into an object URL (stays in this browser only). */
export const imageUrl = (input) => {
  const f = input.files?.[0];
  if (!f || !f.type.startsWith('image/')) return null;
  return URL.createObjectURL(f);
};

export const notify = () => document.dispatchEvent(new CustomEvent('store'));

/** Ask the shell to redraw the current screen (after state changes). */
export const rerender = () => document.dispatchEvent(new CustomEvent('rerender'));
