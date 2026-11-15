import { boot, t, inr, dn, seal, router, applyLang, refreshIcons, toast, lang } from './shared.js';
import { PHOTOS, ALBUMS, GALLERY, photo, credit } from './photos.js';
import { notices } from './data.js';
import { serversFor, memberRate } from './data.js';
import { events, pastEvents, cateringPackages, plants, plantCats, committee, club } from './data.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

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
  const cm = document.getElementById('home-committee');
  const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  cm.innerHTML = committee.slice(0, 4).map((c) => `
    <li class="bg-paper rounded-lg border border-rule p-5 flex items-center gap-4">
      <span class="w-12 h-12 shrink-0 rounded-full bg-sindoor-wash text-sindoor-deep grid place-items-center font-semibold" aria-hidden="true">${lang === 'bn' ? c.nameBn[0] : initials(c.name)}</span>
      <span class="min-w-0">
        <span class="block font-semibold leading-snug">${t(c.name, c.nameBn)}</span>
        <span class="block text-[14px] text-ink-2">${t(c.role, c.roleBn)}</span>
      </span>
    </li>`).join('');
  applyLang(nb); applyLang(strip); applyLang(cm);
}
renderHomeExtras();
document.addEventListener('langchange', renderHomeExtras);

/* Gallery: date-wise, photos and videos */
let album = 'all';
let mediaType = 'all';
let gYear = 'all';
const years = [...new Set(GALLERY.map((g) => g.date.slice(0, 4)))];
const isVideo = (it) => !!it.v;
const posterOf = (it) => (isVideo(it) ? it.poster : it.p);
function renderGallery() {
  const tabs = [{ key: 'all', en: 'All albums', bn: 'সব অ্যালবাম' }, ...ALBUMS];
  const tabsEl = $('#album-tabs');
  tabsEl.innerHTML = tabs.map((a) => `<button type="button" data-album="${a.key}" aria-pressed="${album === a.key}" class="chip h-9 px-4 text-[15px] whitespace-nowrap border border-rule bg-card hover:border-ink aria-pressed:bg-ink aria-pressed:text-white aria-pressed:border-ink">${t(a.en, a.bn)}</button>`).join('');
  const types = [['all', 'All', 'সব', 'layout-grid'], ['photo', 'Photos', 'ছবি', 'image'], ['video', 'Videos', 'ভিডিও', 'play']];
  $('#media-type').innerHTML = types.map(([k, en, bn, icon]) => `<button type="button" data-mt="${k}" aria-pressed="${mediaType === k}" class="h-8 px-3.5 rounded-md text-sm font-semibold flex items-center gap-1.5 text-ink-2 aria-pressed:bg-card aria-pressed:text-ink aria-pressed:shadow-[0_1px_2px_rgba(0,0,0,.08)]"><i data-lucide="${icon}" class="w-4 h-4"></i>${t(en, bn)}</button>`).join('');
  $('#g-year').innerHTML = [['all', lang === 'bn' ? 'সব বছর' : 'All years'], ...years.map((y) => [y, lang === 'bn' ? y.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]) : y])].map(([v, l]) => `<option value="${v}" ${gYear === v ? 'selected' : ''}>${l}</option>`).join('');

  const groups = GALLERY
    .filter((g) => (album === 'all' || g.album === album) && (gYear === 'all' || g.date.startsWith(gYear)))
    .map((g) => ({ ...g, shown: g.items.filter((it) => mediaType === 'all' || (mediaType === 'video') === isVideo(it)) }))
    .filter((g) => g.shown.length);
  const flat = groups.flatMap((g) => g.shown.map((it) => ({ it, g })));
  const nP = flat.filter((x) => !isVideo(x.it)).length, nV = flat.length - nP;
  $('#g-summary').innerHTML = t(`${nP} photo${nP === 1 ? '' : 's'} · ${nV} video${nV === 1 ? '' : 's'} · ${groups.length} event${groups.length === 1 ? '' : 's'}`, `${nP}টি ছবি · ${nV}টি ভিডিও · ${groups.length}টি অনুষ্ঠান`);

  let lastYear = '';
  let idx = 0;
  $('#gallery-grid').innerHTML = groups.length ? groups.map((g) => {
    const y = g.date.slice(0, 4);
    const yearHead = y !== lastYear ? `<h2 class="font-display text-[2.4rem] leading-none text-ink-3 num ${lastYear ? 'mt-16' : ''} mb-2">${dn(y)}</h2>` : '';
    lastYear = y;
    const a = ALBUMS.find((x) => x.key === g.album);
    const pc = g.items.filter((it) => !isVideo(it)).length, vc = g.items.length - pc;
    return `${yearHead}
      <section class="pt-6 mt-6 border-t-2 border-ink first-of-type:mt-0" aria-label="${g.en}">
        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
          <p class="text-sm font-semibold text-sindoor num">${t(g.when, g.whenBn)}</p>
          <h3 class="font-display text-[1.6rem] leading-tight">${t(g.en, g.bn)}</h3>
          <p class="text-sm text-ink-3 sm:ml-auto">${t(a.en, a.bn)} · ${t(`${pc} photo${pc === 1 ? '' : 's'}`, `${pc}টি ছবি`)}${vc ? ` · ${t(`${vc} video${vc === 1 ? '' : 's'}`, `${vc}টি ভিডিও`)}` : ''}</p>
        </div>
        <div class="columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
          ${g.shown.map((it) => {
            const k = posterOf(it);
            const i = idx++;
            return `<figure class="break-inside-avoid">
              <button type="button" data-zoom="${i}" class="relative block w-full border-2 border-ink overflow-hidden group bg-paper-2" aria-label="${isVideo(it) ? `Play video: ${it.v}` : `Open photo: ${PHOTOS[k].alt}`}">
                ${photo(k, { w: 900, cls: `w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03] ${isVideo(it) ? 'aspect-video object-cover' : ''}`, sizes: '(min-width: 1024px) 370px, 50vw' })}
                ${isVideo(it) ? `<span class="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors"></span>
                  <span class="absolute inset-0 grid place-items-center"><span class="w-14 h-14 rounded-full bg-white/95 text-ink grid place-items-center shadow-lg group-hover:scale-105 transition-transform"><i data-lucide="play" class="w-6 h-6 ml-0.5 fill-current"></i></span></span>
                  <span class="absolute left-2 bottom-2 chip h-6 px-2 bg-black/70 text-white text-[12px]"><i data-lucide="video" class="!w-3.5 !h-3.5"></i><span class="num">${it.dur}</span></span>` : ''}
              </button>
              ${isVideo(it) ? `<figcaption class="mt-1.5 text-[14px] font-semibold leading-snug">${t(it.v, it.vBn)}</figcaption>` : ''}
            </figure>`;
          }).join('')}
        </div>
      </section>`;
  }).join('') : `<div class="py-16 text-center text-ink-3">${t('Nothing here for this choice. Try another album or year.', 'এই বাছাইয়ে কিছু নেই। অন্য অ্যালবাম বা বছর দেখুন।')}</div>`;

  applyLang(tabsEl); applyLang($('#media-type')); applyLang($('#g-summary')); applyLang($('#gallery-grid')); refreshIcons();
  tabsEl.querySelectorAll('[data-album]').forEach((b) => b.addEventListener('click', () => { album = b.dataset.album; renderGallery(); }));
  $$('#media-type [data-mt]').forEach((b) => b.addEventListener('click', () => { mediaType = b.dataset.mt; renderGallery(); }));
  $$('#gallery-grid [data-zoom]').forEach((b) => b.addEventListener('click', () => openLightbox(Number(b.dataset.zoom), flat)));
}
$('#g-year').addEventListener('change', (e) => { gYear = e.target.value; renderGallery(); });

function openLightbox(start, list) {
  let i = start;
  const back = document.activeElement;
  const box = document.createElement('div');
  box.className = 'fixed inset-0 z-[80] bg-black/90 flex flex-col';
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Gallery viewer');
  const draw = () => {
    const { it, g } = list[i];
    const k = posterOf(it);
    const caption = isVideo(it) ? t(it.v, it.vBn) : t(g.en, g.bn);
    box.innerHTML = `
      <div class="flex items-center gap-3 px-4 h-14 text-white/85 text-sm">
        <span class="num shrink-0">${i + 1} / ${list.length}</span>
        <span class="ml-2 truncate"><span class="font-semibold text-white">${caption}</span> · ${t(g.when, g.whenBn)}</span>
        <button data-x class="ml-auto w-11 h-11 grid place-items-center rounded-full hover:bg-white/10 shrink-0" aria-label="Close"><i data-lucide="x"></i></button></div>
      <div class="flex-1 min-h-0 flex items-center justify-center gap-2 px-2 pb-4">
        <button data-p class="w-11 h-11 grid place-items-center rounded-full text-white hover:bg-white/10 shrink-0" aria-label="Previous"><i data-lucide="chevron-left"></i></button>
        ${isVideo(it) ? `
        <div class="relative w-full max-w-4xl aspect-video bg-black overflow-hidden rounded" data-player>
          <img src="${PHOTOS[k].src(1600)}" alt="" class="absolute inset-0 w-full h-full object-cover opacity-70" />
          <button data-play class="absolute inset-0 grid place-items-center group" aria-label="Play ${it.v}">
            <span class="w-20 h-20 rounded-full bg-white text-ink grid place-items-center shadow-2xl group-hover:scale-105 transition-transform"><i data-lucide="play" class="w-9 h-9 ml-1 fill-current"></i></span></button>
          <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3 text-white text-sm pointer-events-none">
            <i data-lucide="play" class="w-4 h-4"></i><div class="flex-1 h-1 rounded-full bg-white/30"><div class="h-full w-0 bg-sindoor rounded-full"></div></div><span class="num">0:00 / ${it.dur}</span><i data-lucide="volume-2" class="w-4 h-4"></i><i data-lucide="maximize" class="w-4 h-4"></i></div>
        </div>` : `<img src="${PHOTOS[k].src(1800)}" alt="${PHOTOS[k].alt}" class="max-h-full max-w-full object-contain" />`}
        <button data-n class="w-11 h-11 grid place-items-center rounded-full text-white hover:bg-white/10 shrink-0" aria-label="Next"><i data-lucide="chevron-right"></i></button>
      </div>
      <p class="text-center text-white/70 text-[13px] pb-4 px-4">${isVideo(it) ? t('Cover photo', 'প্রচ্ছদ') + ': ' : ''}${credit(k)}</p>`;
    applyLang(box); refreshIcons();
    box.querySelector('[data-play]')?.addEventListener('click', (e) => {
      e.currentTarget.outerHTML = `<div class="absolute inset-0 grid place-items-center p-6 text-center bg-black/60"><div class="max-w-md text-white">
        <i data-lucide="clapperboard" class="w-10 h-10 mx-auto text-marigold"></i>
        <p class="mt-3 font-semibold text-lg">${t('The club’s video plays here', 'এখানে ক্লাবের ভিডিও চলবে')}</p>
        <p class="mt-1 text-white/80 text-[15px]">${t('Prototype: no video file yet. The committee uploads a video or pastes a YouTube link, and it plays in this player.', 'প্রোটোটাইপ: এখনো ভিডিও নেই। কমিটি ভিডিও আপলোড করবে বা ইউটিউব লিঙ্ক দেবে, এখানেই চলবে।')}</p></div></div>`;
      applyLang(box); refreshIcons();
    });
    box.querySelector('[data-x]').focus();
  };
  const close = () => { box.remove(); document.removeEventListener('keydown', key2); back?.focus(); };
  const key2 = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') { i = (i + 1) % list.length; draw(); } if (e.key === 'ArrowLeft') { i = (i - 1 + list.length) % list.length; draw(); } };
  box.addEventListener('click', (e) => {
    if (e.target.closest('[data-x]') || e.target === box) return close();
    if (e.target.closest('[data-n]')) { i = (i + 1) % list.length; draw(); }
    if (e.target.closest('[data-p]')) { i = (i - 1 + list.length) % list.length; draw(); }
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
      ${e.pass ? `<span class="chip bg-sindoor-wash text-sindoor-deep"><i data-lucide="ticket"></i>${t('Pass in app', 'অ্যাপে পাস')}</span>` : `<span class="chip bg-paper-2 text-ink-2"><i data-lucide="users"></i>${t('Open to all', 'সবার জন্য')}</span>`}
    </div>
  </li>`;
const ics = (e) => {
  const d = e.date.replace(/-/g, '');
  const next = new Date(`${e.date}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Gede Maitree Club//EN', 'BEGIN:VEVENT', `UID:${e.id}@gedemaitreeclub`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, '')}`, `SUMMARY:${e.title} · Gede Maitree Club`, `LOCATION:${e.place}`, `DESCRIPTION:${e.time}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
};
const fullRow = (e) => eventRow(e).replace('</li>', `<div class="col-start-2 sm:col-span-2 sm:col-start-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
    <a href="${ics(e)}" download="${e.id}.ics" class="font-semibold text-sindoor hover:underline inline-flex items-center gap-1.5"><i data-lucide="calendar-plus" class="w-4 h-4"></i>${t('Add to calendar', 'ক্যালেন্ডারে রাখুন')}</a>
    ${e.pass ? `<a href="login.html" class="font-semibold text-ink-2 hover:underline inline-flex items-center gap-1.5"><i data-lucide="ticket" class="w-4 h-4"></i>${t('Get your pass', 'পাস নিন')}</a>` : ''}
  </div></li>`);
let evFilter = 'all';
function renderEvents() {
  const kinds = [['all', 'All', 'সব'], ...Object.entries(kindLabel).map(([k, [en, bn]]) => [k, en, bn])];
  $('#event-filters').innerHTML = kinds.map(([k, en, bn]) => `<button type="button" data-ef="${k}" aria-pressed="${evFilter === k}" class="chip h-9 px-4 text-[15px] border border-rule bg-card hover:border-ink aria-pressed:bg-ink aria-pressed:text-white aria-pressed:border-ink">${t(en, bn)}</button>`).join('');
  const list = events.filter((e) => evFilter === 'all' || e.kind === evFilter);
  $('#all-events').innerHTML = list.length ? list.map(fullRow).join('') : `<li class="py-10 text-center text-ink-3">${t('Nothing of this kind coming up. Check back soon.', 'এই ধরনের কিছু আপাতত নেই।')}</li>`;
  $$('#event-filters [data-ef]').forEach((b) => b.addEventListener('click', () => { evFilter = b.dataset.ef; renderEvents(); }));
  applyLang($('#event-filters')); applyLang($('#all-events')); refreshIcons();
}
$('#home-events').innerHTML = events.slice(0, 4).map(eventRow).join('');
renderEvents();
document.addEventListener('langchange', renderEvents);

/* In-page jumps (hash is used by the router, so scroll by hand) */
document.querySelectorAll('[data-jump]').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
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
    <p class="mt-4 flex items-baseline gap-1.5"><span class="font-display text-4xl text-turmeric">${inr(p.rate)}</span><span class="text-sm text-ink-3">${t('per guest', 'অতিথি প্রতি')}</span></p>
    <ul class="mt-5 text-[15px] divide-y-2 divide-dotted divide-sindoor/70 border-y-2 border-dotted border-sindoor/70">
      ${p.menu.map((m, i) => `<li class="py-2">${t(m, p.menuBn[i])}</li>`).join('')}
    </ul>
    <p class="mt-4 text-sm text-ink-3">${t(`Minimum ${p.min} guests`, `ন্যূনতম ${String(p.min).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])} জন অতিথি`)}</p>
  </article>`).join('');
$('#pkg-select').innerHTML = cateringPackages.map((p) => `<option value="${p.id}" ${p.popular ? 'selected' : ''}>${p.name} · ₹${p.rate} / guest</option>`).join('');

function estimate() {
  const g = Number($('#guests').value) || 0;
  const p = cateringPackages.find((x) => x.id === $('#pkg-select').value);
  const rate = memberRate(p.rate, $('#is-member').checked);
  $('#estimate').innerHTML = inr(g * rate);
  $('#estimate-note').innerHTML = `${dn(String(g))} × ${inr(rate)} · ${t(`${serversFor(g)} servers`, `${serversFor(g)} জন পরিবেশনকারী`)} · ${t('advance', 'অগ্রিম')} ${inr(Math.round(g * rate * 0.2))}`;
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
    ['Your details are with Debashis Pal, who runs the serving team.', 'আপনার তথ্য পরিবেশন দলের দায়িত্বে থাকা দেবাশিস পালের কাছে।'],
    ['He calls you within a day to confirm the guests, timing and price.', 'এক দিনের মধ্যে ফোন করে অতিথি, সময় ও দাম ঠিক করবেন।'],
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
  const q0 = ($('#plant-q')?.value || '').trim().toLowerCase();
  const list = plants.filter((p) => (cat === 'all' || p.cat === cat) && (!q0 || `${p.name} ${p.nameBn}`.toLowerCase().includes(q0)));
  $('#plant-list').innerHTML = list.length ? '' : `<li class="sm:col-span-2 lg:col-span-3 py-10 text-center text-ink-3">${t('No plant matches. Ask at the gate; we may have it in the back.', 'কোনো গাছ মেলেনি। গেটে জিজ্ঞেস করুন, ভেতরে থাকতে পারে।')}</li>`;
  if (list.length) $('#plant-list').innerHTML = list.map((p) => {
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
  const msg = `Namaskar, I would like to order from Maitree Nursery:\n${items.map(({ p, q }) => `• ${q} × ${p.name} (${p.pot}) — ₹${p.price * q}`).join('\n')}\nTotal ₹${sum}. I will collect from the club gate.`;
  $('#basket-wa').href = `https://wa.me/${club.whatsapp}?text=${encodeURIComponent(msg)}`;
  applyLang($('#basket'));
}

/* Committee */
const askAbout = {
  President: ['Club direction, disputes, the AGM', 'ক্লাবের দিশা, বিবাদ, এজিএম'],
  Secretary: ['Membership, meetings, notices, privacy', 'সদস্যপদ, সভা, নোটিস, গোপনীয়তা'],
  Treasurer: ['Subscriptions, receipts, the accounts', 'চাঁদা, রসিদ, হিসাব'],
  'Puja in-charge': ['Pujas, chanda, bhog passes', 'পূজা, চাঁদা, ভোগের পাস'],
  'Catering in-charge': ['Catering quotes and bookings', 'ক্যাটারিং কোটেশন ও বুকিং'],
  'Nursery in-charge': ['Plants, orders, stock', 'গাছ, অর্ডার, স্টক'],
  'Sports secretary': ['Sports day, coaching, the ground', 'ক্রীড়া দিবস, প্রশিক্ষণ, মাঠ'],
};
function renderCommittee() {
  $('#committee-list').innerHTML = committee.map((c) => {
    const initials = (lang === 'bn' ? c.nameBn[0] : c.name.split(' ').map((w) => w[0]).join('').slice(0, 2));
    const ask = askAbout[c.role] || ['', ''];
    return `<li class="rounded-lg border border-rule p-5">
      <div class="flex items-center gap-4">
        <span class="w-14 h-14 rounded-full bg-sindoor-wash text-sindoor-deep grid place-items-center font-display text-xl shrink-0" aria-hidden="true">${initials}</span>
        <div class="min-w-0"><p class="font-display text-xl leading-tight">${t(c.name, c.nameBn)}</p><p class="text-[15px] text-sindoor font-semibold">${t(c.role, c.roleBn)}</p></div>
      </div>
      <p class="mt-4 text-[15px] text-ink-2"><span class="text-ink-3">${t('Ask about', 'যোগাযোগের বিষয়')}:</span> ${t(ask[0], ask[1])}</p>
      <p class="mt-1 text-sm text-ink-3">${t('On the committee since', 'কমিটিতে')} ${dn(String(c.since))}${lang === 'bn' ? ' থেকে' : ''}</p>
    </li>`;
  }).join('');
  applyLang($('#committee-list'));
}
renderCommittee();
document.addEventListener('langchange', renderCommittee);
$('#plant-q').addEventListener('input', () => renderPlants());

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
