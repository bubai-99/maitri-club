import { boot, t, inr, dn, seal, router, applyLang, refreshIcons, toast, lang } from './shared.js';
import { PHOTOS, ALBUMS, photo, credit } from './photos.js';
import { notices } from './data.js';
import { events, pastEvents, cateringPackages, plants, plantCats, committee, club } from './data.js';

const $ = (s) => document.querySelector(s);

/* Seals */
$('#logo-seal').innerHTML = seal({ size: 44, rotate: -6 });
$('#join-seal').innerHTML = seal({ size: 320, color: '#fff', rotate: 12 });
$('#foot-seal').innerHTML = seal({ size: 40, color: '#fff', rotate: -4 });
document.getElementById('wa-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  toast(`<i data-lucide="check-circle-2"></i>${t('Done. You’ll get club notices on WhatsApp.', 'হয়ে গেছে। ক্লাবের নোটিস হোয়াটসঅ্যাপে পাবেন।')}`);
});

/* Photos */
document.getElementById('hero-photo').innerHTML = photo('pujaNight', { cls: 'w-full h-full object-cover', eager: true, w: 1800 });
document.getElementById('hero-credit').innerHTML = `${t('Photo', 'ছবি')}: ${credit('pujaNight')}`;
document.querySelectorAll('[data-photo]').forEach((el) => { el.innerHTML = photo(el.dataset.photo, { cls: 'w-full h-full object-cover', sizes: '(min-width: 768px) 570px, 100vw' }); });
document.querySelectorAll('[data-credit]').forEach((el) => { el.innerHTML = credit(el.dataset.credit); });

/* Home: notice board + photo strip */
function renderHomeExtras() {
  const nb = document.getElementById('home-notices');
  nb.innerHTML = notices.slice(0, 3).map((n) => `
    <li class="py-3.5 border-b border-ink/15 last:border-0">
      <p class="text-[12.5px] flex items-center gap-2"><span class="font-bold uppercase tracking-wide text-sindoor-deep">${t(n.tag, n.tagBn)}</span><span class="text-ink-2 num">${dn(n.date)}</span></p>
      <p class="font-semibold leading-snug mt-1">${t(n.title, n.titleBn)}</p>
      <p class="text-[15px] text-ink-2 mt-0.5 leading-snug">${t(n.body, n.bodyBn)}</p>
    </li>`).join('');
  const strip = document.getElementById('home-strip');
  strip.innerHTML = ['sindoor', 'feast2', 'pujaCrowd', 'marigold', 'runners', 'diyas', 'nurseryTable'].map((k) => `
    <a href="#gallery" class="snap-start shrink-0 w-[260px] sm:w-[300px] aspect-[4/5] border-2 border-ink overflow-hidden group" aria-label="${PHOTOS[k].alt}">
      ${photo(k, { w: 700, cls: 'w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]', sizes: '300px' })}
    </a>`).join('');
  applyLang(nb); applyLang(strip);
}
renderHomeExtras();
document.addEventListener('langchange', renderHomeExtras);

/* Gallery */
let album = 'all';
function renderGallery() {
  const tabs = [{ key: 'all', en: 'All', bn: 'সব' }, ...ALBUMS];
  const tabsEl = document.getElementById('album-tabs');
  tabsEl.innerHTML = tabs.map((a) => `<button role="tab" data-album="${a.key}" aria-selected="${album === a.key}" class="chip h-9 px-4 text-[15px] border border-rule bg-card hover:border-ink aria-selected:bg-ink aria-selected:text-white aria-selected:border-ink">${t(a.en, a.bn)}</button>`).join('');
  const items = ALBUMS.filter((a) => album === 'all' || a.key === album).flatMap((a) => a.photos.map((k) => ({ k, a })));
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = items.map(({ k, a }) => `
    <figure class="break-inside-avoid">
      <button type="button" data-zoom="${k}" class="block w-full border-2 border-ink overflow-hidden group" aria-label="Open photo: ${PHOTOS[k].alt}">
        ${photo(k, { w: 900, cls: 'w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]', sizes: '(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw' })}
      </button>
      <figcaption class="mt-2 text-[14px] text-ink-2 flex gap-2"><span class="font-semibold text-ink">${t(a.en, a.bn)}</span><span class="ml-auto text-ink-3">${credit(k)}</span></figcaption>
    </figure>`).join('');
  applyLang(tabsEl); applyLang(grid);
  tabsEl.querySelectorAll('[data-album]').forEach((b) => b.addEventListener('click', () => { album = b.dataset.album; renderGallery(); }));
  grid.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => openLightbox(b.dataset.zoom, items.map((x) => x.k))));
}
function openLightbox(key, keys) {
  let i = keys.indexOf(key);
  const back = document.activeElement;
  const box = document.createElement('div');
  box.className = 'fixed inset-0 z-[80] bg-black/90 flex flex-col';
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Photo viewer');
  const draw = () => {
    const k = keys[i];
    box.innerHTML = `
      <div class="flex items-center gap-3 px-4 h-14 text-white/85 text-sm"><span class="num">${i + 1} / ${keys.length}</span><span class="ml-2 truncate">${PHOTOS[k].alt}</span>
        <button data-x class="ml-auto w-11 h-11 grid place-items-center rounded-full hover:bg-white/10" aria-label="Close"><i data-lucide="x"></i></button></div>
      <div class="flex-1 min-h-0 flex items-center justify-center gap-2 px-2 pb-4">
        <button data-p class="w-11 h-11 grid place-items-center rounded-full text-white hover:bg-white/10 shrink-0" aria-label="Previous"><i data-lucide="chevron-left"></i></button>
        <img src="${PHOTOS[k].src(1800)}" alt="${PHOTOS[k].alt}" class="max-h-full max-w-full object-contain" />
        <button data-n class="w-11 h-11 grid place-items-center rounded-full text-white hover:bg-white/10 shrink-0" aria-label="Next"><i data-lucide="chevron-right"></i></button>
      </div>
      <p class="text-center text-white/70 text-[13px] pb-4">${credit(k)}</p>`;
    refreshIcons();
    box.querySelector('[data-x]').focus();
  };
  const close = () => { box.remove(); document.removeEventListener('keydown', key2); back?.focus(); };
  const key2 = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') { i = (i + 1) % keys.length; draw(); } if (e.key === 'ArrowLeft') { i = (i - 1 + keys.length) % keys.length; draw(); } };
  box.addEventListener('click', (e) => {
    if (e.target.closest('[data-x]') || e.target === box) return close();
    if (e.target.closest('[data-n]')) { i = (i + 1) % keys.length; draw(); }
    if (e.target.closest('[data-p]')) { i = (i - 1 + keys.length) % keys.length; draw(); }
  });
  document.addEventListener('keydown', key2);
  document.body.append(box); draw();
}
renderGallery();
document.addEventListener('langchange', renderGallery);

/* Mobile nav */
$('#menu-btn').addEventListener('click', (e) => {
  const nav = $('#mobile-nav');
  const open = nav.classList.toggle('hidden') === false;
  e.currentTarget.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('#mobile-nav a').forEach((a) => a.addEventListener('click', () => $('#mobile-nav').classList.add('hidden')));

/* Next event + countdown */
const next = events.find((e) => e.pass) || events[0];
const nextDate = new Date(`${next.date}T07:00:00+05:30`);
const wd = nextDate.toLocaleDateString('en-IN', { weekday: 'long' });
const wdBn = nextDate.toLocaleDateString('bn-IN', { weekday: 'long' });
$('#next-day').innerHTML = dn(next.day);
$('#next-mon').innerHTML = t(next.mon === 'Dec' ? 'December' : next.mon, next.monBn);
$('#next-wd').innerHTML = `${t(wd, wdBn)} · ${t(next.time, 'সকাল ৭টা থেকে')}`;
$('#next-title').innerHTML = t(next.title, next.titleBn);
$('#next-place').innerHTML = t(next.place, next.placeBn);

function tick() {
  const now = Date.now();
  let s = Math.max(0, Math.floor((nextDate - now) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60);
  const cell = (v, en, bn) => `<div class="bg-white/60 rounded-[4px] px-2.5 py-1.5 min-w-[54px]"><div class="font-display text-[1.6rem] leading-none">${dn(String(v).padStart(2, '0'))}</div><div class="text-[11.5px] font-semibold mt-0.5 text-ink">${t(en, bn)}</div></div>`;
  $('#countdown').innerHTML = cell(d, 'days', 'দিন') + cell(h, 'hours', 'ঘণ্টা') + cell(m, 'minutes', 'মিনিট');
  applyLang($('#countdown'));
}
tick();
setInterval(tick, 30000);

/* Event rows */
const kindLabel = { service: ['Service', 'সেবা'], sports: ['Sports', 'খেলা'], social: ['Members', 'সদস্য'], puja: ['Puja', 'পূজা'] };
const eventRow = (e) => `
  <li class="grid grid-cols-[72px_1fr] sm:grid-cols-[96px_1fr_auto] gap-x-5 gap-y-1 py-5 border-b border-rule items-center">
    <div class="row-span-2 sm:row-span-1 text-sindoor leading-none">
      <div class="font-display text-[3.2rem] num">${dn(e.day)}</div>
      <div class="text-[13px] font-semibold tracking-wide mt-1">${t(e.mon.toUpperCase(), e.monBn)}</div>
    </div>
    <div>
      <h3 class="poster text-[1.75rem]">${t(e.title, e.titleBn)}</h3>
      <p class="text-[15px] text-ink-2 mt-0.5">${t(e.place, e.placeBn)} · ${t(e.time, e.time)}</p>
    </div>
    <div class="flex items-center gap-2 sm:justify-end">
      ${e.pass ? `<span class="chip bg-sindoor-wash text-sindoor-deep"><i data-lucide="ticket"></i>${t('Pass in app', 'অ্যাপে পাস')}</span>` : ''}
    </div>
  </li>`;
$('#home-events').innerHTML = events.slice(0, 4).map(eventRow).join('');
$('#all-events').innerHTML = events.map(eventRow).join('');
$('#past-events').innerHTML = pastEvents.map((p, i) => `
  <article>
    <div class="frame aspect-[16/9] bg-ink flex items-end p-5 isolate">
      ${photo(i ? 'diyas' : 'sindoor', { cls: 'absolute inset-0 w-full h-full object-cover -z-10', sizes: '(min-width: 768px) 560px, 100vw' })}
      <div class="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
      <span class="absolute top-3 right-3 text-[11.5px] text-white bg-black/50 px-1.5 rounded">${credit(i ? 'diyas' : 'sindoor')}</span>
      <p class="poster text-white text-4xl">${t(p.title, p.titleBn)}</p>
    </div>
    <div class="pt-4">
      <p class="text-[13px] font-semibold text-ink-3">${t(p.when, p.when)}</p>
      <p class="mt-1 text-[17px]">${t(p.note, p.noteBn)}</p>
    </div>
  </article>`).join('');

/* Puja transparency */
const puja = [
  { en: 'Idol & pandal', bn: 'প্রতিমা ও প্যান্ডেল', v: 168000, c: '#d21f1b' },
  { en: 'Bhog for 4,200', bn: '৪,২০০ জনের ভোগ', v: 121000, c: '#f2a516' },
  { en: 'Lights & sound', bn: 'আলো ও শব্দ', v: 64000, c: '#2b2f36' },
  { en: 'Cultural nights', bn: 'সাংস্কৃতিক সন্ধ্যা', v: 38000, c: '#2c6a3a' },
  { en: 'Puja & purohit', bn: 'পূজা ও পুরোহিত', v: 29000, c: '#9a6400' },
  { en: 'Kept for Saraswati Puja', bn: 'সরস্বতী পূজার জন্য রাখা', v: 62000, c: '#b9b2a0' },
];
const total = puja.reduce((a, b) => a + b.v, 0);
$('#puja-total').innerHTML = inr(total);
$('#puja-bar').innerHTML = puja.map((p) => `<div style="flex:${p.v};background:${p.c}" class="h-full first:rounded-l-lg last:rounded-r-lg border-r-2 border-paper last:border-r-0" title="${p.en}"></div>`).join('');
$('#puja-legend').innerHTML = puja.map((p) => `
  <li class="flex items-center gap-3 py-2.5 border-b border-rule">
    <span class="w-3 h-3 rounded-sm shrink-0" style="background:${p.c}"></span>
    <span class="text-[15px]">${t(p.en, p.bn)}</span>
    <span class="ml-auto text-[15px] font-semibold">${inr(p.v)}</span>
  </li>`).join('');

/* Catering */
$('#packages').innerHTML = cateringPackages.map((p) => `
  <article class="relative bg-card rounded-lg border-2 ${p.popular ? "border-sindoor" : "border-ink"} p-6 flex flex-col">
    ${p.popular ? `<span class="absolute -top-3.5 left-6 chip bg-sindoor text-white">${t('Most booked', 'সবচেয়ে জনপ্রিয়')}</span>` : ''}
    <h3 class="poster text-4xl">${t(p.name, p.nameBn)}</h3>
    <p class="text-[15px] text-ink-2 mt-1">${t(p.for, p.forBn)}</p>
    <p class="mt-4 flex items-baseline gap-1.5"><span class="font-display text-4xl text-turmeric">${inr(p.rate)}</span><span class="text-sm text-ink-3">${t('per plate', 'প্রতি প্লেট')}</span></p>
    <ul class="mt-5 text-[15px] divide-y-2 divide-dotted divide-sindoor/70 border-y-2 border-dotted border-sindoor/70">
      ${p.menu.map((m, i) => `<li class="py-2">${t(m, p.menuBn[i])}</li>`).join('')}
    </ul>
    <p class="mt-4 text-sm text-ink-3">${t(`Minimum ${p.min} plates`, `ন্যূনতম ${p.min} প্লেট`)}</p>
  </article>`).join('');
$('#pkg-select').innerHTML = cateringPackages.map((p) => `<option value="${p.id}" ${p.popular ? 'selected' : ''}>${p.name} · ₹${p.rate}</option>`).join('');

function estimate() {
  const g = Number($('#guests').value) || 0;
  const p = cateringPackages.find((x) => x.id === $('#pkg-select').value);
  const rate = p.rate - ($('#is-member').checked ? 20 : 0);
  $('#estimate').innerHTML = inr(g * rate);
  $('#estimate-note').innerHTML = `${dn(String(g))} × ${inr(rate)} · ${t('advance', 'অগ্রিম')} ${inr(Math.round(g * rate * 0.2))}`;
  applyLang($('#estimate-note'));
}
['#guests', '#pkg-select', '#is-member'].forEach((s) => $(s).addEventListener('input', estimate));
estimate();
const confirmPanel = (form, titleEn, titleBn, steps, resetLabel) => {
  const kids = [...form.children];
  kids.forEach((k) => (k.style.display = 'none'));
  form.insertAdjacentHTML('beforeend', `<div data-panel class="sm:col-span-2 lg:col-span-full relative border-2 border-ink rounded-lg p-6 sm:p-8 rise" role="status" tabindex="-1">
    <div class="absolute right-4 top-4 ink-stamp">${seal({ size: 96, rotate: -10, className: 'stamp-in' })}</div>
    <h3 class="poster text-[2.2rem] pr-24">${t(titleEn, titleBn)}</h3>
    <ol class="mt-5 space-y-3 text-[16px] max-w-[52ch]">${steps.map(([en, bn], i) => `<li class="flex gap-3"><span class="w-7 h-7 rounded-full ${i ? 'border-2 border-ink' : 'bg-ink text-white'} grid place-items-center shrink-0 font-semibold num">${i ? i + 1 : '<i data-lucide="check" class="w-4 h-4"></i>'}</span><span>${t(en, bn)}</span></li>`).join('')}</ol>
    <button type="button" class="btn btn-line mt-6" data-again>${t(...resetLabel)}</button></div>`);
  const panel = form.querySelector('[data-panel]');
  applyLang(panel); refreshIcons();
  panel.focus();
  panel.querySelector('[data-again]').addEventListener('click', () => { panel.remove(); kids.forEach((k) => (k.style.display = '')); });
};
$('#enquiry-form').addEventListener('submit', (e) => {
  e.preventDefault();
  confirmPanel(e.currentTarget, 'Enquiry received', 'জিজ্ঞাসা পেয়েছি', [
    ['Your details are with Debashis Pal, catering in-charge.', 'আপনার তথ্য ক্যাটারিং দায়িত্বে থাকা দেবাশিস পালের কাছে।'],
    ['He calls you within a day to settle the menu and final price.', 'এক দিনের মধ্যে ফোন করে মেনু ও দাম ঠিক করবেন।'],
    ['A 20% advance books your date. You get a stamped receipt.', '২০% অগ্রিমে তারিখ বুক হবে। সিলমোহর দেওয়া রসিদ পাবেন।'],
  ], ['Send another enquiry', 'আরেকটি জিজ্ঞাসা']);
});

/* Nursery */
let cat = 'all';
const basket = new Map();
function renderCats() {
  $('#plant-cats').innerHTML = Object.entries(plantCats).map(([k, v]) => `
    <button role="tab" aria-selected="${k === cat}" data-cat="${k}" class="chip h-9 px-4 text-[15px] whitespace-nowrap border border-rule bg-card hover:border-tulsi aria-selected:bg-tulsi aria-selected:text-white aria-selected:border-tulsi">${t(v.en, v.bn)}</button>`).join('');
  $('#plant-cats').querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => { cat = b.dataset.cat; renderCats(); renderPlants(); }));
  applyLang($('#plant-cats'));
}
function stockLabel(p) {
  if (p.stock === 0) return `<span class="text-[13px] font-semibold text-ink-3">${t('Out of stock', 'স্টকে নেই')}</span>`;
  if (p.stock < 10) return `<span class="text-[13px] font-semibold text-sindoor">${t(`Only ${p.stock} left`, `মাত্র ${p.stock}টি বাকি`)}</span>`;
  return `<span class="text-[13px] font-semibold text-tulsi">${t('In stock', 'স্টকে আছে')}</span>`;
}
function renderPlants() {
  const list = plants.filter((p) => cat === 'all' || p.cat === cat);
  $('#plant-list').innerHTML = list.map((p) => {
    const q = basket.get(p.id) || 0;
    return `
    <li class="flex items-center gap-4 py-4 border-b border-rule">
      <div class="w-16 h-16 rounded-lg bg-tulsi-wash text-tulsi grid place-items-center shrink-0 relative">
        <i data-lucide="${p.icon}" class="w-7 h-7"></i>
        ${p.isNew ? `<span class="absolute -top-1.5 -right-1.5 chip h-5 px-1.5 text-[11px] bg-marigold text-ink">${t('New', 'নতুন')}</span>` : ''}
      </div>
      <div class="min-w-0 flex-1">
        <p class="font-semibold leading-tight">${t(p.name, p.nameBn)}</p>
        <p class="text-sm text-ink-3 mt-0.5">${lang === 'bn' ? p.name : p.nameBn} · ${p.pot}</p>
        <p class="mt-1 flex items-center gap-2"><span class="font-semibold">${inr(p.price)}</span>${stockLabel(p)}</p>
      </div>
      ${p.stock === 0 ? '' : q === 0
        ? `<button class="btn btn-line btn-sm border-tulsi/40 text-tulsi hover:bg-tulsi-wash" data-add="${p.id}" aria-label="Add ${p.name}"><i data-lucide="plus"></i>${t('Add', 'যোগ')}</button>`
        : `<div class="flex items-center rounded-lg bg-tulsi text-white">
             <button class="w-9 h-9 grid place-items-center" data-dec="${p.id}" aria-label="Remove one"><i data-lucide="minus" class="w-4 h-4"></i></button>
             <span class="w-6 text-center font-semibold">${dn(String(q))}</span>
             <button class="w-9 h-9 grid place-items-center" data-add="${p.id}" aria-label="Add one"><i data-lucide="plus" class="w-4 h-4"></i></button>
           </div>`}
    </li>`;
  }).join('');
  $('#plant-list').querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => { const p = plants.find((x) => x.id === b.dataset.add); basket.set(p.id, Math.min(p.stock, (basket.get(p.id) || 0) + 1)); renderPlants(); }));
  $('#plant-list').querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', () => { const v = (basket.get(b.dataset.dec) || 0) - 1; if (v <= 0) basket.delete(b.dataset.dec); else basket.set(b.dataset.dec, v); renderPlants(); }));
  applyLang($('#plant-list'));
  refreshIcons();
  renderBasket();
}
function renderBasket() {
  const items = [...basket.entries()].map(([id, q]) => ({ p: plants.find((x) => x.id === id), q }));
  const count = items.reduce((a, b) => a + b.q, 0);
  const sum = items.reduce((a, b) => a + b.q * b.p.price, 0);
  $('#basket').classList.toggle('translate-y-full', count === 0);
  $('#basket-count').innerHTML = t(`${count} plant${count === 1 ? '' : 's'}`, `${count}টি গাছ`);
  $('#basket-items').textContent = items.map(({ p, q }) => `${q}× ${lang === 'bn' ? p.nameBn : p.name}`).join(', ');
  $('#basket-total').innerHTML = inr(sum);
  const msg = `Namaskar, I would like to order from Maitri Nursery:\n${items.map(({ p, q }) => `• ${q} × ${p.name} (${p.pot}) — ₹${p.price * q}`).join('\n')}\nTotal ₹${sum}. I will collect from the club gate.`;
  $('#basket-wa').href = `https://wa.me/${club.whatsapp}?text=${encodeURIComponent(msg)}`;
  applyLang($('#basket'));
}

/* Committee */
$('#committee-list').innerHTML = committee.map((c) => `
  <li class="grid grid-cols-[56px_1fr] sm:grid-cols-[56px_1fr_1fr_auto] gap-x-5 gap-y-0.5 py-4 border-b border-rule items-center">
    <span class="row-span-2 sm:row-span-1 w-14 h-14 rounded-full bg-sindoor-wash text-sindoor-deep grid place-items-center font-display text-xl">${(lang === 'bn' ? c.nameBn : c.name).slice(0, 1)}</span>
    <p class="font-display text-xl leading-tight">${t(c.name, c.nameBn)}</p>
    <p class="text-[15px] text-ink-2">${t(c.role, c.roleBn)}</p>
    <p class="hidden sm:block text-sm text-ink-3">${t('since', 'থেকে')} ${dn(String(c.since))}</p>
  </li>`).join('');

/* Join */
function depRow() {
  const div = document.createElement('div');
  div.className = 'grid grid-cols-[1fr_140px_40px] gap-2';
  div.innerHTML = `<input class="field" data-bn-ph="নাম" placeholder="Name" />
    <select class="field"><option>Spouse</option><option>Son</option><option>Daughter</option><option>Parent</option><option>Other</option></select>
    <button type="button" class="btn btn-ghost px-0 w-10" aria-label="Remove"><i data-lucide="x"></i></button>`;
  div.querySelector('button').addEventListener('click', () => div.remove());
  $('#dependents').append(div);
  applyLang(div);
  refreshIcons();
}
depRow(); depRow();
$('#add-dep').addEventListener('click', depRow);
$('#join-form').addEventListener('submit', (e) => {
  e.preventDefault();
  confirmPanel(e.currentTarget, 'Application received', 'আবেদন পেয়েছি', [
    ['Your family’s details are with the committee.', 'আপনার পরিবারের তথ্য কমিটির কাছে।'],
    ['They approve it at the next meeting, Sunday 16 Nov, and send you an SMS.', 'পরের সভায় (রবি ১৬ নভে) অনুমোদন হবে, এসএমএস পাবেন।'],
    ['Pay the ₹500 admission and your member card appears in the app.', '₹৫০০ ভর্তি ফি দিলে সদস্য কার্ড অ্যাপে চলে আসবে।'],
  ], ['Edit the application', 'আবেদন বদলান']);
});

document.addEventListener('langchange', () => { renderPlants(); });

renderCats();
renderPlants();
router('home');
boot('site');
