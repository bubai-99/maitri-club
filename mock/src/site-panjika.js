// Website: Panjika page and the "today" strip on the home page.
import { lang, applyLang, refreshIcons } from './shared.js';
import { bnNum } from './site-ui.js';
import { events, panjikaDates, panjikaSource } from './data.js';
import {
  PLACE, BN_MONTHS, WEEKDAYS, NAKSHATRA, PAKSHA, tithiName,
  panjikaDay, tithiAt, todayKey, addDays, parseKey, keyOf, istHM,
} from './panjika.js';

const $ = (s) => document.querySelector(s);
const L = (en, bn) => (lang === 'bn' ? bn : en);
const N = (v) => (lang === 'bn' ? bnNum(v) : String(v));
const G_MONTHS = [
  ['January', 'জানুয়ারি'], ['February', 'ফেব্রুয়ারি'], ['March', 'মার্চ'], ['April', 'এপ্রিল'], ['May', 'মে'], ['June', 'জুন'],
  ['July', 'জুলাই'], ['August', 'আগস্ট'], ['September', 'সেপ্টেম্বর'], ['October', 'অক্টোবর'], ['November', 'নভেম্বর'], ['December', 'ডিসেম্বর'],
];
const WD_SHORT = [['Sun', 'রবি'], ['Mon', 'সোম'], ['Tue', 'মঙ্গল'], ['Wed', 'বুধ'], ['Thu', 'বৃহঃ'], ['Fri', 'শুক্র'], ['Sat', 'শনি']];

/* ---------- Formatting ---------- */
/** "6:06 am" or "সকাল ৬:০৬" */
export function clock(date) {
  if (!date) return '–';
  const [h, m] = istHM(date);
  const h12 = ((h + 11) % 12) + 1;
  const mm = String(m).padStart(2, '0');
  if (lang !== 'bn') return `${h12}:${mm} ${h < 12 ? 'am' : 'pm'}`;
  const part = h < 4 ? 'রাত' : h < 6 ? 'ভোর' : h < 12 ? 'সকাল' : h < 15 ? 'দুপুর' : h < 17 ? 'বিকেল' : h < 19 ? 'সন্ধ্যা' : 'রাত';
  return `${part} ${bnNum(`${h12}:${mm}`)}`;
}
/** "16 Nov" / "১৬ নভেম্বর"; with weekday if asked */
function gDate(k, { year = false, weekday = false, short = true } = {}) {
  const { y, m, d } = parseKey(k);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const mon = lang === 'bn' ? G_MONTHS[m - 1][1] : short ? G_MONTHS[m - 1][0].slice(0, 3) : G_MONTHS[m - 1][0];
  const s = `${N(d)} ${mon}${year ? ` ${N(y)}` : ''}`;
  return weekday ? `${L(...WEEKDAYS[wd])}, ${s}` : s;
}
const bDate = (b, year = true) => `${N(b.day)} ${L(...BN_MONTHS[b.month])}${year ? ` ${N(b.year)}` : ''}`;
/** A time, with the date when it falls on a different day */
const when = (date, k) => (date ? (keyOf(date) === k ? clock(date) : `${gDate(keyOf(date))}, ${clock(date)}`) : '–');

/* ---------- Moon drawing: lit fraction and side ---------- */
let moonSeq = 0;
export function moonSVG(lit, waxing, { glow = true } = {}) {
  const gid = `pjm${++moonSeq}`;
  const r = 46, cx = 50, cy = 50;
  const rx = Math.abs(1 - 2 * lit) * r;
  const crescent = lit < 0.5;
  // Lit limb (right when waxing), then the terminator back to the top
  const limb = waxing ? 1 : 0;
  const term = waxing ? (crescent ? 0 : 1) : (crescent ? 1 : 0);
  const d = lit < 0.01 ? '' : lit > 0.99 ? `M${cx} ${cy - r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}Z`
    : `M${cx} ${cy - r}A${r} ${r} 0 0 ${limb} ${cx} ${cy + r}A${rx.toFixed(2)} ${r} 0 0 ${term} ${cx} ${cy - r}Z`;
  return `<svg viewBox="0 0 100 100" class="w-full h-full" aria-hidden="true">
    <defs><radialGradient id="${gid}" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#fff7e0"/><stop offset=".7" stop-color="#f4dfa6"/><stop offset="1" stop-color="#d9bd78"/></radialGradient></defs>
    ${glow ? `<circle cx="${cx}" cy="${cy}" r="${r + 3}" fill="rgba(255,226,168,${0.08 + lit * 0.18})"/>` : ''}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#2b3150" stroke="rgba(255,255,255,.18)" stroke-width=".8"/>
    ${d ? `<path d="${d}" fill="url(#${gid})"/>` : ''}
  </svg>`;
}

/* ---------- What happens on a day (committee dates + club events) ---------- */
const marksOn = (k) => [
  ...panjikaDates.filter((p) => p.date === k),
  ...events.filter((e) => e.date === k).map((e) => ({ kind: 'event', en: e.title, bn: e.titleBn, event: e.id })),
];
const tithiTag = (i) => (i === 14 ? 'purnima' : i === 29 ? 'amavasya' : i % 15 === 10 ? 'ekadashi' : '');

/* ---------- Page state ---------- */
let sel = null; // selected day key
let view = null; // { y, m } month shown

function pick(k, { keepMonth = false } = {}) {
  sel = k;
  const { y, m } = parseKey(k);
  if (!keepMonth || !view) view = { y, m };
  history.replaceState(null, '', `#panjika/${k}`);
  draw();
}

function drawBanner(p) {
  const b = p.bengali;
  $('#pj-eyebrow').innerHTML = `${L('Panjika', 'পঞ্জিকা')} · ${L(PLACE.en, PLACE.bn)}${sel === todayKey() ? ` · ${L('Today', 'আজ')}` : ''}`;
  $('#pj-title').textContent = bDate(b);
  $('#pj-sub').textContent = `${L(...WEEKDAYS[p.weekday])} · ${gDate(sel, { year: true, short: false })}`;
  $('#pj-moon').innerHTML = moonSVG(p.moon.lit, p.moon.waxing);
  $('#pj-moon-cap').innerHTML = `${L(`${Math.round(p.moon.lit * 100)}% of the moon lit`, `চাঁদের ${bnNum(Math.round(p.moon.lit * 100))}% আলোকিত`)}<br>${L(p.moon.waxing ? 'Waxing' : 'Waning', p.moon.waxing ? 'শুক্লপক্ষ' : 'কৃষ্ণপক্ষ')}`;
  $('#pj-date').value = sel;
  $('#pj-prev').setAttribute('aria-label', L('Previous day', 'আগের দিন'));
  $('#pj-next').setAttribute('aria-label', L('Next day', 'পরের দিন'));
}

function drawDay(p) {
  const tile = (icon, label, main, sub) => `<div class="card p-4 sm:p-5 min-w-0">
      <p class="flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-3"><i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i>${label}</p>
      <p class="mt-2 font-display text-[1.3rem] sm:text-[1.7rem] leading-tight break-words">${main}</p>
      <p class="mt-1 text-[13px] sm:text-[14.5px] text-ink-2">${sub}</p>
    </div>`;
  const tn = tithiName(p.tithi.i);
  const nx = p.nextTithi;
  const tithiSub = `${L(...PAKSHA[p.paksha])} · ${L('till', 'শেষ')} ${when(p.tithi.end, sel)}`
    + (nx && p.sun.rise && nx.end && keyOf(nx.end) === sel ? `<br>${L('then', 'তারপর')} ${L(...tithiName(nx.i))}` : '');
  const nk = NAKSHATRA[p.nakshatra.i];
  $('#pj-day').innerHTML = [
    tile('moon-star', L('Tithi', 'তিথি'), L(...tn), tithiSub),
    tile('sparkles', L('Nakshatra', 'নক্ষত্র'), L(...nk), `${L('till', 'শেষ')} ${when(p.nakshatra.end, sel)}`),
    tile('sunrise', L('Sunrise', 'সূর্যোদয়'), clock(p.sun.rise), `${L('Sunset', 'সূর্যাস্ত')} ${clock(p.sun.set)}`),
    tile('calendar', L('Bengali date', 'বাংলা তারিখ'), bDate(p.bengali, false), `${N(p.bengali.year)} ${L('Bangabda', 'বঙ্গাব্দ')} · ${L(...WEEKDAYS[p.weekday])}`),
  ].join('');
  const on = marksOn(sel);
  $('#pj-on-day').innerHTML = on.length ? `<ul class="mt-4 flex flex-wrap gap-2">${on.map((x) => { const tag = x.event || x.kind === 'wedding' ? 'a' : 'span'; const href = x.event ? `#event/${x.event}` : '#catering-quote'; return `<li><${tag}${tag === 'a' ? ` href="${href}"` : ''} class="chip h-9 px-3.5 ${chipCls(x.kind)}"><i data-lucide="${kindIcon(x.kind)}" class="w-4 h-4"></i>${L(x.en, x.bn)}${x.lagna ? ` · ${L(...x.lagna)}` : ''}${tag === 'a' ? '<i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>' : ''}</${tag}></li>`; }).join('')}</ul>` : '';
}
const kindIcon = (k) => ({ puja: 'flame', parbon: 'sun', wedding: 'heart', event: 'calendar-check' }[k] || 'dot');
const chipCls = (k) => ({ puja: 'bg-sindoor text-white', parbon: 'bg-marigold text-ink', wedding: 'bg-turmeric-wash text-ink border border-turmeric/40', event: 'bg-ink text-white' }[k]);
const dotCls = (k) => ({ puja: 'bg-sindoor', parbon: 'bg-marigold', wedding: 'bg-turmeric ring-2 ring-turmeric/30', event: 'bg-ink' }[k]);

function drawMonth() {
  const { y, m } = view;
  const first = `${y}-${String(m).padStart(2, '0')}-01`;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const today = todayKey();
  const bFirst = panjikaDay(first).bengali;
  const bLast = panjikaDay(addDays(first, days - 1)).bengali;
  $('#pj-month-title').textContent = `${L(...G_MONTHS[m - 1])} ${N(y)}`;
  $('#pj-month-bn').textContent = bFirst.month === bLast.month ? `${L(...BN_MONTHS[bFirst.month])} ${N(bFirst.year)}`
    : `${L(...BN_MONTHS[bFirst.month])} – ${L(...BN_MONTHS[bLast.month])} ${N(bLast.year)}`;
  $('#pj-mprev').setAttribute('aria-label', L('Previous month', 'আগের মাস'));
  $('#pj-mnext').setAttribute('aria-label', L('Next month', 'পরের মাস'));
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push('<div class="pj-cell is-empty" aria-hidden="true"></div>');
  for (let d = 1; d <= days; d++) {
    const k = addDays(first, d - 1);
    const p = panjikaDay(k);
    const tag = tithiTag(p.tithi.i);
    const marks = marksOn(k);
    const label = `${gDate(k, { weekday: true, short: false })}, ${bDate(p.bengali)}, ${L(...tithiName(p.tithi.i))}${marks.length ? `, ${marks.map((x) => L(x.en, x.bn)).join(', ')}` : ''}`;
    cells.push(`<button type="button" class="pj-cell${k === sel ? ' is-sel' : ''}${k === today ? ' is-today' : ''}${p.bengali.firstDay ? ' is-bfirst' : ''}" data-pj-day="${k}" aria-pressed="${k === sel}" aria-label="${label}">
      <span class="flex items-start justify-between gap-1">
        <span class="pj-g num">${N(d)}</span>
        <span class="pj-b num">${p.bengali.firstDay ? `${N(1)} ${L(BN_MONTHS[p.bengali.month][0].slice(0, 3), BN_MONTHS[p.bengali.month][1])}` : N(p.bengali.day)}</span>
      </span>
      <span class="pj-t">${tag === 'purnima' ? '<span class="pj-moon-full"></span>' : tag === 'amavasya' ? '<span class="pj-moon-new"></span>' : ''}<span class="truncate">${L(...tithiName(p.tithi.i))}</span></span>
      ${marks.length ? `<span class="pj-dots">${marks.map((x) => `<span class="${dotCls(x.kind)}"></span>`).join('')}</span>` : ''}
    </button>`);
  }
  $('#pj-cal').innerHTML = `<div class="pj-head">${WD_SHORT.map((w) => `<span>${L(...w)}</span>`).join('')}</div><div class="pj-grid">${cells.join('')}</div>`;
  $('#pj-legend').innerHTML = [
    ['<span class="pj-moon-full"></span>', L('Purnima', 'পূর্ণিমা')],
    ['<span class="pj-moon-new"></span>', L('Amavasya', 'অমাবস্যা')],
    ['<span class="w-2.5 h-2.5 rounded-full bg-sindoor"></span>', L('Puja', 'পূজা')],
    ['<span class="w-2.5 h-2.5 rounded-full bg-marigold"></span>', L('Parbon, sankranti', 'পার্বণ, সংক্রান্তি')],
    ['<span class="w-2.5 h-2.5 rounded-full bg-turmeric"></span>', L('Wedding day', 'বিয়ের দিন')],
    ['<span class="w-2.5 h-2.5 rounded-full bg-ink"></span>', L('Club event', 'ক্লাবের অনুষ্ঠান')],
  ].map(([i, s]) => `<li class="flex items-center gap-2">${i}${s}</li>`).join('');
}

function drawLists() {
  const today = todayKey();
  const pujas = panjikaDates.filter((p) => p.kind !== 'wedding' && p.date >= today).slice(0, 6);
  $('#pj-pujas').innerHTML = pujas.map((p) => {
    const d = panjikaDay(p.date);
    let times = '';
    if (p.tithi !== undefined) {
      const span = d.tithi.i === p.tithi ? d.tithi : tithiAt(new Date(Date.parse(`${p.date}T12:00:00+05:30`)));
      times = `${L(...tithiName(p.tithi))}: ${L('begins', 'শুরু')} ${gDate(keyOf(span.start))}, ${clock(span.start)} · ${L('ends', 'শেষ')} ${gDate(keyOf(span.end))}, ${clock(span.end)}`;
    } else {
      times = `${L('Sunrise', 'সূর্যোদয়')} ${clock(d.sun.rise)} · ${L('Sunset', 'সূর্যাস্ত')} ${clock(d.sun.set)}`;
    }
    return `<li class="border-b gz-hair">
      <button type="button" data-pj-day="${p.date}" class="w-full text-left py-4 grid grid-cols-[64px_1fr_auto] gap-4 items-center hover:bg-paper-2/60 -mx-2 px-2 rounded-lg">
        <span class="text-center leading-none"><span class="block font-display text-[2rem] num">${N(parseKey(p.date).d)}</span><span class="block mt-1 text-[12.5px] font-semibold uppercase">${L(G_MONTHS[parseKey(p.date).m - 1][0].slice(0, 3), G_MONTHS[parseKey(p.date).m - 1][1])}</span></span>
        <span class="min-w-0"><span class="block font-semibold text-[17px] leading-snug">${L(p.en, p.bn)}</span><span class="block text-[14px] text-ink-2">${bDate(d.bengali)} · ${L(...WEEKDAYS[d.weekday])}</span><span class="block mt-0.5 text-[13.5px] text-ink-3">${times}</span></span>
        <span class="w-3 h-3 rounded-full ${dotCls(p.kind)}" aria-hidden="true"></span>
      </button>
    </li>`;
  }).join('');
  const weds = panjikaDates.filter((p) => p.kind === 'wedding' && p.date >= today).slice(0, 6);
  $('#pj-weddings').innerHTML = weds.map((w) => {
    const d = panjikaDay(w.date);
    return `<li><button type="button" data-pj-day="${w.date}" class="w-full text-left flex items-center gap-3 rounded-xl bg-white/80 hover:bg-white px-4 py-3">
      <i data-lucide="heart" class="w-4 h-4 text-turmeric shrink-0"></i>
      <span class="min-w-0 flex-1"><span class="block font-semibold">${gDate(w.date, { weekday: true })}</span><span class="block text-[13.5px] text-ink-2">${bDate(d.bengali, false)} · ${L('Lagna', 'লগ্ন')} ${L(...w.lagna)}</span></span>
    </button></li>`;
  }).join('');
  $('#pj-note').innerHTML = `<p>${L(`Tithi, nakshatra, sunrise, sunset and the Bengali date are worked out from the positions of the sun and moon for ${PLACE.en}. A day’s tithi is the one at sunrise.`, `তিথি, নক্ষত্র, সূর্যোদয়, সূর্যাস্ত ও বাংলা তারিখ ${PLACE.bn}-র জন্য সূর্য ও চাঁদের অবস্থান থেকে হিসাব করা। দিনের তিথি মানে সূর্যোদয়ের সময়ের তিথি।`)}</p>
    <p>${L(`Puja dates, wedding days and lagna come from ${panjikaSource.en}, entered by the committee. Panjikas can differ by a day; for a puja, the committee’s notice is final.`, `পূজার দিন, বিয়ের দিন ও লগ্ন ${panjikaSource.bn} থেকে কমিটি দেয়। পঞ্জিকাভেদে এক দিন এদিক-ওদিক হতে পারে; পূজার ব্যাপারে কমিটির নোটিসই শেষ কথা।`)}</p>
    <p class="text-ink-3">${L('Prototype: the puja dates, wedding days and lagna times are samples.', 'প্রোটোটাইপ: পূজার দিন, বিয়ের দিন ও লগ্নের সময় নমুনা।')}</p>`;
}

function draw() {
  const p = panjikaDay(sel);
  drawBanner(p); drawDay(p); drawMonth(); drawLists();
  applyLang($('[data-screen="panjika"]')); refreshIcons();
}

let wired = false;
export function renderPanjika(param) {
  const k = /^\d{4}-\d{2}-\d{2}$/.test(param || '') ? param : todayKey();
  sel = k; view = { y: parseKey(k).y, m: parseKey(k).m };
  draw();
  if (wired) return;
  wired = true;
  const root = $('[data-screen="panjika"]');
  root.addEventListener('click', (e) => {
    const day = e.target.closest('[data-pj-day]');
    if (day) {
      const fromList = !day.classList.contains('pj-cell');
      pick(day.dataset.pjDay, { keepMonth: !fromList });
      if (fromList) $('#pj-title').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      else $(`[data-pj-day="${sel}"].pj-cell`)?.focus();
      return;
    }
    const step = e.target.closest('[data-pj-step]');
    if (step) pick(addDays(sel, Number(step.dataset.pjStep)));
  });
  $('#pj-today').addEventListener('click', () => pick(todayKey()));
  const dateIn = $('#pj-date');
  dateIn.addEventListener('click', () => { try { dateIn.showPicker(); } catch { /* older browsers */ } });
  dateIn.addEventListener('change', () => { if (dateIn.value) pick(dateIn.value); });
  const month = (n) => { let { y, m } = view; m += n; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } view = { y, m }; drawMonth(); applyLang($('#pj-cal')); };
  $('#pj-mprev').addEventListener('click', () => month(-1));
  $('#pj-mnext').addEventListener('click', () => month(1));
  // Arrow keys move the selected day inside the calendar
  $('#pj-cal').addEventListener('keydown', (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step || !e.target.closest('.pj-cell')) return;
    e.preventDefault();
    pick(addDays(sel, step));
    $(`[data-pj-day="${sel}"].pj-cell`)?.focus();
  });
  document.addEventListener('langchange', () => { if (root.classList.contains('is-active')) draw(); });
}

/* ---------- Home: today's tithi strip ---------- */
export function renderTodayStrip(sel0 = '#home-tithi', { href = '#panjika', live = true, day } = {}) {
  const el = typeof sel0 === 'string' ? $(sel0) : sel0;
  if (!el) return;
  const draw0 = () => {
    const k = day || todayKey();
    const p = panjikaDay(k);
    const next = panjikaDates.filter((x) => x.kind !== 'wedding' && x.date >= k)[0];
    const ticks = Array.from({ length: 27 }, (_, i) => {
      const ang = (i / 27) * Math.PI * 2, r1 = 46, r2 = i % 3 ? 43.5 : 41.5;
      return `<line x1="${(50 + r1 * Math.cos(ang)).toFixed(2)}" y1="${(50 + r1 * Math.sin(ang)).toFixed(2)}" x2="${(50 + r2 * Math.cos(ang)).toFixed(2)}" y2="${(50 + r2 * Math.sin(ang)).toFixed(2)}"/>`;
    }).join('');
    const nk = NAKSHATRA[p.nakshatra.i];
    el.innerHTML = `<a href="${href}" class="pj-cosmos group">
      <span class="pj-sky" aria-hidden="true"><span class="pj-nebula"></span><span class="pj-stars pj-s1"></span><span class="pj-stars pj-s2"></span><span class="pj-shoot"></span></span>
      <span class="pj-orbit" aria-hidden="true">
        <svg viewBox="0 0 100 100" class="pj-ring"><circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.22)" stroke-width=".6"/><circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,226,168,.3)" stroke-width=".5" stroke-dasharray="1.5 2.5"/><g stroke="rgba(255,255,255,.45)" stroke-width=".7" stroke-linecap="round">${ticks}</g><circle cx="96" cy="50" r="1.8" fill="#ffd27a"/></svg>
        <span class="pj-orbit-moon">${moonSVG(p.moon.lit, p.moon.waxing)}</span>
      </span>
      <span class="relative min-w-0 flex-1">
        <span class="block text-[12px] font-semibold uppercase tracking-[0.14em] text-marigold">${L('Today’s panjika', 'আজকের পঞ্জিকা')} · ${L(...WEEKDAYS[p.weekday])}</span>
        <span class="block mt-1 font-display text-white leading-tight text-[clamp(1.5rem,3.2vw,2rem)]">${bDate(p.bengali)}</span>
        <span class="mt-2.5 flex flex-wrap gap-1.5 text-[13px]">
          <span class="pj-pill"><i data-lucide="moon-star" class="w-3.5 h-3.5"></i>${L(...tithiName(p.tithi.i))} ${L('till', 'শেষ')} ${when(p.tithi.end, k)}</span>
          <span class="pj-pill"><i data-lucide="sparkles" class="w-3.5 h-3.5"></i>${L(...nk)}</span>
          <span class="pj-pill"><i data-lucide="sunrise" class="w-3.5 h-3.5"></i>${clock(p.sun.rise)}<span class="opacity-50">·</span><i data-lucide="sunset" class="w-3.5 h-3.5"></i>${clock(p.sun.set)}</span>
        </span>
        ${next ? `<span class="block mt-2.5 text-[13.5px] text-white/70">${L('Next', 'সামনে')}: <span class="text-white font-semibold">${L(next.en, next.bn)}</span>, ${gDate(next.date)}</span>` : ''}
      </span>
      <span class="relative hidden md:inline-flex btn btn-glass h-11 px-5 shrink-0">${L('Open panjika', 'পঞ্জিকা দেখুন')}<i data-lucide="arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-0.5"></i></span>
    </a>`;
    refreshIcons();
  };
  draw0();
  if (live) document.addEventListener('langchange', draw0);
}
