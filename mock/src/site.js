import { boot, t, inr, dn, seal, router, applyLang, refreshIcons, toast, lang, setLang } from './shared.js';
import { PHOTOS, ALBUMS, GALLERY, photo, credit } from './photos.js';
import { serversFor, memberRate, events, pastEvents, cateringPackages, plants, plantCats, committee, club } from './data.js';
import { publicNotices, askAbout, pastWhenBn, pastAlbum, eventInfo } from './site-data.js';
import { validate, enhanceForm, confirmPanel, ref, bnNum, initials, daysUntil } from './site-ui.js';
import {
  kindLabel, ics, eventTime, renderNotices, renderNoticeDetail, renderEventDetail, renderPujaBreakdown,
  renderChanda, initChandaForm, renderContact, initContactForm, initSearch,
} from './site-pages.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Seals */
$('#logo-seal').innerHTML = seal({ size: 44, rotate: -6 });
$('#join-seal').innerHTML = seal({ size: 320, color: '#fff', rotate: 12 });
$('#foot-seal').innerHTML = seal({ size: 40, color: '#fff', rotate: -4 });

/* ---------- Header: language, mobile menu, scroll state, back to top ---------- */
$$('[data-site-lang]').forEach((b) => {
  b.dataset.langBtn = b.dataset.siteLang; // shared applyLang keeps aria-pressed in sync
  b.addEventListener('click', () => setLang(b.dataset.siteLang));
});

const menuBtn = $('#menu-btn');
const mobileNav = $('#mobile-nav');
function setMenu(open, { focusBack = false } = {}) {
  mobileNav.classList.toggle('hidden', !open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
  menuBtn.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
  refreshIcons();
  if (focusBack) menuBtn.focus();
}
menuBtn.addEventListener('click', () => setMenu(mobileNav.classList.contains('hidden')));
mobileNav.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false, { focusBack: true }); });
mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

const header = $('#site-header');
const toTop = $('#to-top');
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    header.classList.toggle('is-scrolled', scrollY > 8);
    const show = scrollY > 900;
    toTop.classList.toggle('is-shown', show);
    toTop.tabIndex = show ? 0 : -1;
    ticking = false;
  });
}, { passive: true });
toTop.addEventListener('click', () => {
  scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
  $('#main').focus({ preventScroll: true });
});

/* Skip link: the hash belongs to the router, so move focus by hand */
$('#skip-link').addEventListener('click', (e) => {
  e.preventDefault();
  const h = $('[data-screen].is-active h1') || $('#main');
  if (!h.hasAttribute('tabindex')) h.tabIndex = -1;
  h.focus();
});

/* WhatsApp news form (footer) */
const waForm = $('#wa-form');
enhanceForm(waForm);
waForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate(waForm)) return;
  waForm.reset();
  toast(`<i data-lucide="check-circle-2"></i>${t('Done. You’ll get club notices on WhatsApp. Reply STOP to leave.', 'হয়ে গেছে। ক্লাবের নোটিস হোয়াটসঅ্যাপে পাবেন। বন্ধ করতে STOP লিখুন।')}`);
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-focus-wa]')) return;
  $('#wa-form').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' });
  setTimeout(() => $('#wa-phone').focus({ preventScroll: true }), reduceMotion() ? 0 : 450);
});

/* Photos */
document.getElementById('hero-photo').innerHTML = photo('pujaNight', { cls: 'w-full h-full object-cover', eager: true, w: 1800 });
document.getElementById('hero-credit').innerHTML = `${t('Photo', 'ছবি')}: ${credit('pujaNight')}`;
document.querySelectorAll('[data-photo]').forEach((el) => { el.innerHTML = photo(el.dataset.photo, { cls: 'w-full h-full object-cover', sizes: '(min-width: 768px) 570px, 100vw' }); });
document.querySelectorAll('[data-credit]').forEach((el) => { el.innerHTML = credit(el.dataset.credit); });

/* ---------- Home: notice board, photo strip, committee ---------- */
function renderHomeExtras() {
  const nb = document.getElementById('home-notices');
  nb.innerHTML = publicNotices.slice(0, 3).map((n) => `
    <li class="border-b border-ink/15 last:border-0">
      <a href="#notice/${n.id}" class="group block py-3.5">
        <span class="text-[12.5px] flex items-center gap-2"><span class="font-bold uppercase tracking-wide text-sindoor-deep">${t(n.tag, n.tagBn)}</span><span class="text-ink-2 num">${dn(n.date || '')}</span>${n.pinned ? `<i data-lucide="pin" class="w-3.5 h-3.5 text-ink-3" aria-label="Pinned"></i>` : ''}</span>
        <span class="block font-semibold leading-snug mt-1 group-hover:underline">${t(n.title, n.titleBn)}</span>
        <span class="block text-[15px] text-ink-2 mt-0.5 leading-snug">${t(n.body, n.bodyBn)}</span>
      </a>
    </li>`).join('');
  const strip = document.getElementById('home-strip');
  strip.innerHTML = ['sindoor', 'feast2', 'pujaCrowd', 'marigold', 'runners', 'diyas', 'nurseryTable'].map((k) => `
    <a href="#gallery" class="snap-start shrink-0 w-[260px] sm:w-[300px] aspect-[4/5] border-2 border-ink overflow-hidden group" aria-label="${lang === 'bn' ? PHOTOS[k].altBn : PHOTOS[k].alt}">
      ${photo(k, { w: 700, cls: 'w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]', sizes: '300px' })}
    </a>`).join('');
  const cm = document.getElementById('home-committee');
  cm.innerHTML = committee.slice(0, 4).map((c) => `
    <li class="bg-paper rounded-lg border border-rule p-5 flex items-center gap-4">
      <span class="w-12 h-12 shrink-0 rounded-full bg-sindoor-wash text-sindoor-deep grid place-items-center font-semibold" aria-hidden="true">${initials(c)}</span>
      <span class="min-w-0">
        <span class="block font-semibold leading-snug">${t(c.name, c.nameBn)}</span>
        <span class="block text-[14px] text-ink-2">${t(c.role, c.roleBn)}</span>
      </span>
    </li>`).join('');
  applyLang(nb); applyLang(strip); applyLang(cm); refreshIcons();
}
renderHomeExtras();
document.addEventListener('langchange', renderHomeExtras);

/* ---------- Gallery: date-wise, photos and videos ---------- */
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
  $('#g-year').innerHTML = [['all', lang === 'bn' ? 'সব বছর' : 'All years'], ...years.map((y) => [y, lang === 'bn' ? bnNum(y) : y])].map(([v, l]) => `<option value="${v}" ${gYear === v ? 'selected' : ''}>${l}</option>`).join('');

  const groups = GALLERY
    .filter((g) => (album === 'all' || g.album === album) && (gYear === 'all' || g.date.startsWith(gYear)))
    .map((g) => ({ ...g, shown: g.items.filter((it) => mediaType === 'all' || (mediaType === 'video') === isVideo(it)) }))
    .filter((g) => g.shown.length);
  const flat = groups.flatMap((g) => g.shown.map((it) => ({ it, g })));
  const nP = flat.filter((x) => !isVideo(x.it)).length, nV = flat.length - nP;
  $('#g-summary').innerHTML = t(`${nP} photo${nP === 1 ? '' : 's'} · ${nV} video${nV === 1 ? '' : 's'} · ${groups.length} event${groups.length === 1 ? '' : 's'}`, `${bnNum(nP)}টি ছবি · ${bnNum(nV)}টি ভিডিও · ${bnNum(groups.length)}টি অনুষ্ঠান`);

  let lastYear = '';
  let idx = 0;
  $('#gallery-grid').innerHTML = groups.length ? groups.map((g) => {
    const y = g.date.slice(0, 4);
    const yearHead = y !== lastYear ? `<h2 class="font-display text-[2.4rem] leading-none text-ink-3 num ${lastYear ? 'mt-16' : ''} mb-2">${dn(y)}</h2>` : '';
    lastYear = y;
    const a = ALBUMS.find((x) => x.key === g.album);
    const pc = g.items.filter((it) => !isVideo(it)).length, vc = g.items.length - pc;
    return `${yearHead}
      <section class="pt-6 mt-6 border-t-2 border-ink first-of-type:mt-0" aria-label="${lang === 'bn' ? g.bn : g.en}">
        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
          <p class="text-sm font-semibold text-sindoor num">${t(g.when, g.whenBn)}</p>
          <h3 class="font-display text-[1.6rem] leading-tight">${t(g.en, g.bn)}</h3>
          <p class="text-sm text-ink-3 sm:ml-auto">${t(a.en, a.bn)} · ${t(`${pc} photo${pc === 1 ? '' : 's'}`, `${bnNum(pc)}টি ছবি`)}${vc ? ` · ${t(`${vc} video${vc === 1 ? '' : 's'}`, `${bnNum(vc)}টি ভিডিও`)}` : ''}</p>
        </div>
        <div class="columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
          ${g.shown.map((it) => {
            const k = posterOf(it);
            const i = idx++;
            const label = isVideo(it) ? `${lang === 'bn' ? 'ভিডিও চালান' : 'Play video'}: ${lang === 'bn' ? it.vBn : it.v}` : `${lang === 'bn' ? 'ছবি খুলুন' : 'Open photo'}: ${lang === 'bn' ? PHOTOS[k].altBn : PHOTOS[k].alt}`;
            return `<figure class="break-inside-avoid">
              <button type="button" data-zoom="${i}" class="relative block w-full border-2 border-ink overflow-hidden group bg-paper-2" aria-label="${label}">
                ${photo(k, { w: 900, cls: `w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03] ${isVideo(it) ? 'aspect-video object-cover' : ''}`, sizes: '(min-width: 1024px) 370px, 50vw' })}
                ${isVideo(it) ? `<span class="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors"></span>
                  <span class="absolute inset-0 grid place-items-center"><span class="w-14 h-14 rounded-full bg-white/95 text-ink grid place-items-center shadow-lg group-hover:scale-105 transition-transform"><i data-lucide="play" class="w-6 h-6 ml-0.5 fill-current"></i></span></span>
                  <span class="absolute left-2 bottom-2 chip h-6 px-2 bg-black/70 text-white text-[12px]"><i data-lucide="video" class="!w-3.5 !h-3.5"></i><span class="num">${dn(it.dur)}</span></span>` : ''}
              </button>
              ${isVideo(it) ? `<figcaption class="mt-1.5 text-[14px] font-semibold leading-snug">${t(it.v, it.vBn)}</figcaption>` : ''}
            </figure>`;
          }).join('')}
        </div>
      </section>`;
  }).join('') : `<div class="py-16 text-center">
      <i data-lucide="image-off" class="w-8 h-8 mx-auto text-ink-3"></i>
      <p class="mt-3 font-semibold">${t('Nothing here for this choice', 'এই বাছাইয়ে কিছু নেই')}</p>
      <p class="mt-1 text-ink-2">${t('Try another album or year.', 'অন্য অ্যালবাম বা বছর দেখুন।')}</p>
      <button type="button" class="btn btn-line btn-sm mt-4" data-g-reset>${t('Show everything', 'সব দেখান')}</button></div>`;

  applyLang(tabsEl); applyLang($('#media-type')); applyLang($('#g-summary')); applyLang($('#gallery-grid')); refreshIcons();
  tabsEl.querySelectorAll('[data-album]').forEach((b) => b.addEventListener('click', () => { album = b.dataset.album; renderGallery(); }));
  $$('#media-type [data-mt]').forEach((b) => b.addEventListener('click', () => { mediaType = b.dataset.mt; renderGallery(); }));
  $$('#gallery-grid [data-zoom]').forEach((b) => b.addEventListener('click', () => openLightbox(Number(b.dataset.zoom), flat)));
  $('#gallery-grid [data-g-reset]')?.addEventListener('click', () => { album = 'all'; mediaType = 'all'; gYear = 'all'; renderGallery(); });
}
$('#g-year').addEventListener('change', (e) => { gYear = e.target.value; renderGallery(); });

function openLightbox(start, list) {
  let i = start;
  const back = document.activeElement;
  const box = document.createElement('div');
  box.className = 'fixed inset-0 z-[80] bg-black/90 flex flex-col';
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', lang === 'bn' ? 'ছবি দেখা' : 'Gallery viewer');
  const step = (d) => { i = (i + d + list.length) % list.length; draw(); };
  const draw = () => {
    const { it, g } = list[i];
    const k = posterOf(it);
    const caption = isVideo(it) ? t(it.v, it.vBn) : t(g.en, g.bn);
    box.innerHTML = `
      <div class="flex items-center gap-3 px-4 h-14 text-white/85 text-sm">
        <span class="num shrink-0" aria-live="polite">${dn(`${i + 1} / ${list.length}`)}</span>
        <span class="ml-2 truncate"><span class="font-semibold text-white">${caption}</span> · ${t(g.when, g.whenBn)}</span>
        <button data-x class="ml-auto w-11 h-11 grid place-items-center rounded-full hover:bg-white/10 shrink-0" aria-label="${lang === 'bn' ? 'বন্ধ' : 'Close'}"><i data-lucide="x"></i></button></div>
      <div class="flex-1 min-h-0 flex items-center justify-center gap-2 px-2 pb-4" data-stage>
        <button data-p class="w-11 h-11 grid place-items-center rounded-full text-white hover:bg-white/10 shrink-0" aria-label="${lang === 'bn' ? 'আগের' : 'Previous'}"><i data-lucide="chevron-left"></i></button>
        ${isVideo(it) ? `
        <div class="relative w-full max-w-4xl aspect-video bg-black overflow-hidden rounded" data-player>
          <img src="${PHOTOS[k].src(1600)}" alt="" class="absolute inset-0 w-full h-full object-cover opacity-70" />
          <button data-play class="absolute inset-0 grid place-items-center group" aria-label="${lang === 'bn' ? 'চালান' : 'Play'} ${lang === 'bn' ? it.vBn : it.v}">
            <span class="w-20 h-20 rounded-full bg-white text-ink grid place-items-center shadow-2xl group-hover:scale-105 transition-transform"><i data-lucide="play" class="w-9 h-9 ml-1 fill-current"></i></span></button>
          <div class="absolute inset-x-0 bottom-0 p-3 bg-black/60 flex items-center gap-3 text-white text-sm pointer-events-none">
            <i data-lucide="play" class="w-4 h-4"></i><div class="flex-1 h-1 rounded-full bg-white/30"><div class="h-full w-0 bg-sindoor rounded-full"></div></div><span class="num">0:00 / ${it.dur}</span><i data-lucide="volume-2" class="w-4 h-4"></i><i data-lucide="maximize" class="w-4 h-4"></i></div>
        </div>` : `<img src="${PHOTOS[k].src(1800)}" alt="${lang === 'bn' ? PHOTOS[k].altBn : PHOTOS[k].alt}" class="max-h-full max-w-full object-contain select-none" draggable="false" />`}
        <button data-n class="w-11 h-11 grid place-items-center rounded-full text-white hover:bg-white/10 shrink-0" aria-label="${lang === 'bn' ? 'পরের' : 'Next'}"><i data-lucide="chevron-right"></i></button>
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
  const close = () => { box.remove(); document.removeEventListener('keydown', key2); document.documentElement.style.overflow = ''; back?.focus(); };
  const key2 = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'Tab') { // trap focus inside the viewer
      const f = [...box.querySelectorAll('button, a[href]')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  box.addEventListener('click', (e) => {
    if (e.target.closest('[data-x]') || e.target === box || e.target.matches('[data-stage]')) return close();
    if (e.target.closest('[data-n]')) step(1);
    if (e.target.closest('[data-p]')) step(-1);
  });
  let x0 = null; // swipe on phones
  box.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); x0 = null; });
  document.addEventListener('keydown', key2);
  document.documentElement.style.overflow = 'hidden';
  document.body.append(box); draw();
}
renderGallery();
document.addEventListener('langchange', renderGallery);

/* ---------- Next event + countdown ---------- */
const next = events.find((e) => e.pass && daysUntil(e.date) >= 0) || events.find((e) => daysUntil(e.date) >= 0) || events[0];
const nextDate = new Date(`${next.date}T07:00:00+05:30`);
const wd = nextDate.toLocaleDateString('en-IN', { weekday: 'long' });
const wdBn = nextDate.toLocaleDateString('bn-IN', { weekday: 'long' });
const MONTH_LONG = { Nov: 'November', Dec: 'December', Jan: 'January', Feb: 'February' };
$('#next-day').innerHTML = dn(next.day);
$('#next-mon').innerHTML = t(MONTH_LONG[next.mon] || next.mon, next.monBn);
$('#next-wd').innerHTML = `${t(wd, wdBn)} · ${eventTime(next)}`;
$('#next-title').innerHTML = t(next.title, next.titleBn);
$('#next-title').href = `#event/${next.id}`;
$('#next-details').href = `#event/${next.id}`;
$('#next-place').innerHTML = t(next.place, next.placeBn);
$('#next-ask').href = `https://wa.me/${club.whatsapp}?text=${encodeURIComponent(`Namaskar, a question about ${next.title} (${next.day} ${next.mon}):`)}`;

function tick() {
  let s = Math.max(0, Math.floor((nextDate - Date.now()) / 1000));
  if (s === 0) { $('#countdown').innerHTML = `<div class="bg-white/60 rounded-[4px] px-3 py-2 font-semibold">${t('Happening today', 'আজই')}</div>`; applyLang($('#countdown')); return; }
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60);
  const cell = (v, en, bn) => `<div class="bg-white/60 rounded-[4px] px-2.5 py-1.5 min-w-[54px]"><div class="font-display text-[1.6rem] leading-none">${dn(String(v).padStart(2, '0'))}</div><div class="text-[11.5px] font-semibold mt-0.5 text-ink">${t(en, bn)}</div></div>`;
  $('#countdown').innerHTML = cell(d, 'days', 'দিন') + cell(h, 'hours', 'ঘণ্টা') + cell(m, 'minutes', 'মিনিট');
  $('#countdown').setAttribute('aria-label', lang === 'bn' ? `আর ${bnNum(d)} দিন ${bnNum(h)} ঘণ্টা` : `${d} days ${h} hours to go`);
  applyLang($('#countdown'));
}
$('#countdown').setAttribute('role', 'timer');
tick();
setInterval(tick, 30000);
document.addEventListener('langchange', tick);

/* ---------- Event rows ---------- */
const eventRow = (e) => `
  <li class="grid grid-cols-[72px_1fr] sm:grid-cols-[96px_1fr_auto] gap-x-5 gap-y-1 py-5 border-b border-rule items-center">
    <div class="row-span-2 sm:row-span-1 text-sindoor leading-none">
      <div class="font-display text-[3.2rem] num">${dn(e.day)}</div>
      <div class="text-[13px] font-semibold tracking-wide mt-1">${t(e.mon.toUpperCase(), e.monBn)}</div>
    </div>
    <div class="min-w-0">
      <h3 class="poster text-[1.75rem]"><a href="#event/${e.id}" class="hover:underline decoration-2 underline-offset-4">${t(e.title, e.titleBn)}</a></h3>
      <p class="text-[15px] text-ink-2 mt-0.5">${t(e.place, e.placeBn)} · ${eventTime(e)}</p>
    </div>
    <div class="flex items-center gap-2 sm:justify-end">
      ${e.pass ? `<span class="chip bg-sindoor-wash text-sindoor-deep"><i data-lucide="ticket"></i>${t('Pass in app', 'অ্যাপে পাস')}</span>` : `<span class="chip bg-paper-2 text-ink-2"><i data-lucide="users"></i>${t('Open to all', 'সবার জন্য')}</span>`}
    </div>
  </li>`;
const fullRow = (e) => eventRow(e).replace(/<\/li>\s*$/, `<div class="col-start-2 sm:col-span-2 sm:col-start-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
    <a href="#event/${e.id}" class="font-semibold text-sindoor hover:underline inline-flex items-center gap-1.5"><i data-lucide="arrow-right" class="w-4 h-4"></i>${t('Details & programme', 'বিস্তারিত ও সূচি')}</a>
    <a href="${ics(e)}" download="${e.id}.ics" class="font-semibold text-ink-2 hover:underline inline-flex items-center gap-1.5"><i data-lucide="calendar-plus" class="w-4 h-4"></i>${t('Add to calendar', 'ক্যালেন্ডারে রাখুন')}</a>
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
document.querySelectorAll('[data-jump]').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' }); }));
$('#past-events').innerHTML = pastEvents.map((p, i) => `
  <article>
    <div class="frame aspect-[16/9] bg-ink flex items-end p-5 isolate">
      ${photo(i ? 'diyas' : 'sindoor', { cls: 'absolute inset-0 w-full h-full object-cover -z-10', sizes: '(min-width: 768px) 560px, 100vw' })}
      <div class="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
      <span class="absolute top-3 right-3 text-[11.5px] text-white bg-black/50 px-1.5 rounded">${credit(i ? 'diyas' : 'sindoor')}</span>
      <p class="poster text-white text-4xl">${t(p.title, p.titleBn)}</p>
    </div>
    <div class="pt-4">
      <p class="text-[13px] font-semibold text-ink-3">${t(p.when, pastWhenBn[p.title] || p.when)}</p>
      <p class="mt-1 text-[17px]">${t(p.note, p.noteBn)}</p>
      ${pastAlbum[p.title] ? `<a href="#gallery" data-album-link="${pastAlbum[p.title]}" class="mt-2 inline-flex items-center gap-1.5 text-[15px] font-semibold text-sindoor hover:underline"><i data-lucide="image" class="w-4 h-4"></i>${t('See the photos', 'ছবি দেখুন')}</a>` : ''}
    </div>
  </article>`).join('');
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-album-link]');
  if (!a) return;
  album = a.dataset.albumLink; mediaType = 'all'; gYear = 'all'; renderGallery();
});

/* Puja transparency (home) */
renderPujaBreakdown('#puja-total', '#puja-bar', '#puja-legend');
document.addEventListener('langchange', () => renderPujaBreakdown('#puja-total', '#puja-bar', '#puja-legend'));

/* ---------- Catering ---------- */
$('#packages').innerHTML = cateringPackages.map((p) => `
  <article class="relative bg-card rounded-lg border-2 ${p.popular ? 'border-sindoor' : 'border-ink'} p-6 flex flex-col">
    ${p.popular ? `<span class="absolute -top-3.5 left-6 chip bg-sindoor text-white">${t('Most booked', 'সবচেয়ে জনপ্রিয়')}</span>` : ''}
    <h3 class="poster text-4xl">${t(p.name, p.nameBn)}</h3>
    <p class="text-[15px] text-ink-2 mt-1">${t(p.for, p.forBn)}</p>
    <p class="mt-4 flex items-baseline gap-1.5"><span class="font-display text-4xl text-turmeric">${inr(p.rate)}</span><span class="text-sm text-ink-3">${t('per guest', 'অতিথি প্রতি')}</span></p>
    <ul class="mt-5 text-[15px] divide-y-2 divide-dotted divide-sindoor/70 border-y-2 border-dotted border-sindoor/70">
      ${p.menu.map((m, i) => `<li class="py-2">${t(m, p.menuBn[i])}</li>`).join('')}
    </ul>
    <p class="mt-4 text-sm text-ink-3">${t(`Minimum ${p.min} guests`, `ন্যূনতম ${bnNum(p.min)} জন অতিথি`)}</p>
    <button type="button" class="btn btn-line btn-sm mt-5 self-start" data-pick-pkg="${p.id}">${t('Get a quote for this', 'এটির দাম জানুন')}<i data-lucide="arrow-down"></i></button>
  </article>`).join('');
function pkgOptions() {
  const cur = $('#pkg-select').value;
  $('#pkg-select').innerHTML = cateringPackages.map((p) => `<option value="${p.id}" ${(cur ? cur === p.id : p.popular) ? 'selected' : ''}>${lang === 'bn' ? `${p.nameBn} · অতিথি প্রতি ₹${bnNum(p.rate)}` : `${p.name} · ₹${p.rate} / guest`}</option>`).join('');
}
pkgOptions();
document.addEventListener('langchange', () => { pkgOptions(); estimate(); });
$('#packages').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pick-pkg]');
  if (!b) return;
  $('#pkg-select').value = b.dataset.pickPkg; estimate();
  $('#catering-quote').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  setTimeout(() => $('#enquiry-form input')?.focus({ preventScroll: true }), reduceMotion() ? 0 : 500);
});

function estimate() {
  const g = Number($('#guests').value) || 0;
  const p = cateringPackages.find((x) => x.id === $('#pkg-select').value) || cateringPackages[0];
  const rate = memberRate(p.rate, $('#is-member').checked);
  $('#estimate').innerHTML = inr(g * rate);
  const below = g && g < p.min;
  $('#estimate-note').innerHTML = `${dn(String(g))} × ${inr(rate)} · ${t(`${serversFor(g)} servers`, `${bnNum(serversFor(g))} জন পরিবেশনকারী`)} · ${t('advance', 'অগ্রিম')} ${inr(Math.round(g * rate * 0.2))}`
    + (below ? `<span class="block mt-1 text-sindoor-deep font-semibold">${t(`This package needs at least ${p.min} guests.`, `এই প্যাকেজে অন্তত ${bnNum(p.min)} জন অতিথি লাগে।`)}</span>` : '');
  applyLang($('#estimate-note'));
}
['#guests', '#pkg-select', '#is-member'].forEach((s) => $(s).addEventListener('input', estimate));
estimate();
const enquiryForm = $('#enquiry-form');
enhanceForm(enquiryForm);
const todayIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
enquiryForm.querySelector('input[type="date"]').min = todayIso;
enquiryForm.querySelector('input[type="date"]').required = true;
enquiryForm.querySelector('input[type="tel"]').dataset.phone = '';
enquiryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate(enquiryForm)) return;
  confirmPanel(e.currentTarget, 'Enquiry received', 'জিজ্ঞাসা পেয়েছি', [
    ['Your details are with Debashis Pal, who runs the serving team.', 'আপনার তথ্য পরিবেশন দলের দায়িত্বে থাকা দেবাশিস পালের কাছে।'],
    ['He calls you within a day to confirm the guests, timing and price.', 'এক দিনের মধ্যে ফোন করে অতিথি, সময় ও দাম ঠিক করবেন।'],
    ['A 20% advance books your date. You get a stamped receipt.', '২০% অগ্রিমে তারিখ বুক হবে। সিলমোহর দেওয়া রসিদ পাবেন।'],
  ], ['Send another enquiry', 'আরেকটি জিজ্ঞাসা'], { refNo: ref('CT') });
});

/* ---------- Nursery ---------- */
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
  if (p.stock < 10) return `<span class="text-[13px] font-semibold text-sindoor">${t(`Only ${p.stock} left`, `মাত্র ${bnNum(p.stock)}টি বাকি`)}</span>`;
  return `<span class="text-[13px] font-semibold text-tulsi">${t('In stock', 'স্টকে আছে')}</span>`;
}
function renderPlants() {
  const q0 = ($('#plant-q')?.value || '').trim().toLowerCase();
  const list = plants.filter((p) => (cat === 'all' || p.cat === cat) && (!q0 || `${p.name} ${p.nameBn}`.toLowerCase().includes(q0)));
  $('#plant-list').innerHTML = list.length ? '' : `<li class="sm:col-span-2 lg:col-span-3 py-10 text-center text-ink-3">${t('No plant matches. Ask at the gate; we may have it in the back.', 'কোনো গাছ মেলেনি। গেটে জিজ্ঞেস করুন, ভেতরে থাকতে পারে।')}</li>`;
  if (list.length) $('#plant-list').innerHTML = list.map((p) => {
    const q = basket.get(p.id) || 0;
    const nm = lang === 'bn' ? p.nameBn : p.name;
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
        ? `<button class="btn btn-line btn-sm border-tulsi/40 text-tulsi hover:bg-tulsi-wash" data-add="${p.id}" aria-label="${lang === 'bn' ? `${nm} যোগ করুন` : `Add ${nm}`}"><i data-lucide="plus"></i>${t('Add', 'যোগ')}</button>`
        : `<div class="flex items-center rounded-lg bg-tulsi text-white" role="group" aria-label="${nm}">
             <button class="w-9 h-9 grid place-items-center" data-dec="${p.id}" aria-label="${lang === 'bn' ? 'একটি কমান' : 'Remove one'}"><i data-lucide="minus" class="w-4 h-4"></i></button>
             <span class="w-6 text-center font-semibold" aria-live="polite">${dn(String(q))}</span>
             <button class="w-9 h-9 grid place-items-center disabled:opacity-40" data-add="${p.id}" aria-label="${lang === 'bn' ? 'আরও একটি' : 'Add one'}" ${q >= p.stock ? 'disabled' : ''}><i data-lucide="plus" class="w-4 h-4"></i></button>
           </div>`}
    </li>`;
  }).join('');
  const keepFocus = (sel) => requestAnimationFrame(() => $(sel)?.focus());
  $('#plant-list').querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => { const p = plants.find((x) => x.id === b.dataset.add); basket.set(p.id, Math.min(p.stock, (basket.get(p.id) || 0) + 1)); renderPlants(); keepFocus(`#plant-list [data-add="${p.id}"]`); }));
  $('#plant-list').querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.dec; const v = (basket.get(id) || 0) - 1; if (v <= 0) basket.delete(id); else basket.set(id, v); renderPlants(); keepFocus(v > 0 ? `#plant-list [data-dec="${id}"]` : `#plant-list [data-add="${id}"]`); }));
  applyLang($('#plant-list'));
  refreshIcons();
  renderBasket();
}
function renderBasket() {
  const items = [...basket.entries()].map(([id, q]) => ({ p: plants.find((x) => x.id === id), q }));
  const count = items.reduce((a, b) => a + b.q, 0);
  const sum = items.reduce((a, b) => a + b.q * b.p.price, 0);
  $('#basket').classList.toggle('translate-y-full', count === 0);
  $('#basket').setAttribute('aria-hidden', String(count === 0));
  $('#basket-wa').tabIndex = count === 0 ? -1 : 0;
  document.body.dataset.basket = count ? 'on' : 'off';
  $('#basket-count').innerHTML = t(`${count} plant${count === 1 ? '' : 's'}`, `${bnNum(count)}টি গাছ`);
  $('#basket-items').textContent = items.map(({ p, q }) => `${lang === 'bn' ? bnNum(q) : q}× ${lang === 'bn' ? p.nameBn : p.name}`).join(', ');
  $('#basket-total').innerHTML = inr(sum);
  const msg = `Namaskar, I would like to order from Maitree Nursery:\n${items.map(({ p, q }) => `• ${q} × ${p.name} (${p.pot}) — ₹${p.price * q}`).join('\n')}\nTotal ₹${sum}. I will collect from the club gate.`;
  $('#basket-wa').href = `https://wa.me/${club.whatsapp}?text=${encodeURIComponent(msg)}`;
  applyLang($('#basket'));
}

/* ---------- Committee ---------- */
function renderCommittee() {
  $('#committee-list').innerHTML = committee.map((c) => {
    const ask = askAbout[c.role] || ['', ''];
    return `<li class="rounded-lg border border-rule p-5">
      <div class="flex items-center gap-4">
        <span class="w-14 h-14 rounded-full bg-sindoor-wash text-sindoor-deep grid place-items-center font-display text-xl shrink-0" aria-hidden="true">${initials(c)}</span>
        <div class="min-w-0"><p class="font-display text-xl leading-tight">${t(c.name, c.nameBn)}</p><p class="text-[15px] text-sindoor font-semibold">${t(c.role, c.roleBn)}</p></div>
      </div>
      <p class="mt-4 text-[15px] text-ink-2"><span class="text-ink-3">${t('Ask about', 'যোগাযোগের বিষয়')}:</span> ${t(ask[0], ask[1])}</p>
      <p class="mt-1 text-sm text-ink-3">${t(`On the committee since ${c.since}`, `${bnNum(c.since)} থেকে কমিটিতে`)}</p>
    </li>`;
  }).join('');
  applyLang($('#committee-list'));
}
renderCommittee();
document.addEventListener('langchange', renderCommittee);
$('#plant-q').addEventListener('input', () => renderPlants());

/* ---------- Join ---------- */
function depRow() {
  const div = document.createElement('div');
  div.className = 'grid grid-cols-[1fr_110px_40px] sm:grid-cols-[1fr_120px_120px_40px] gap-2';
  div.innerHTML = `<input class="field col-span-1" aria-label="Name" data-bn-ph="নাম" placeholder="Name" />
    <select class="field" aria-label="Relation"><option data-bn="স্বামী/স্ত্রী">Spouse</option><option data-bn="ছেলে">Son</option><option data-bn="মেয়ে">Daughter</option><option data-bn="বাবা/মা">Parent</option><option data-bn="অন্যান্য">Other</option></select>
    <select class="field hidden sm:block" aria-label="Blood group"><option value="" data-bn="রক্তের গ্রুপ">Blood group</option><option>A+</option><option>A−</option><option>B+</option><option>B−</option><option>AB+</option><option>AB−</option><option>O+</option><option>O−</option></select>
    <button type="button" class="btn btn-ghost px-0 w-10" aria-label="Remove"><i data-lucide="x"></i></button>`;
  div.querySelector('button').addEventListener('click', () => { div.remove(); $('#add-dep').focus(); });
  $('#dependents').append(div);
  applyLang(div);
  refreshIcons();
  div.querySelector('input').focus();
}
$('#add-dep').addEventListener('click', depRow);
$('#join-photo').addEventListener('change', (e) => {
  const f = e.target.files[0]; if (!f) return;
  $('#photo-prev').src = URL.createObjectURL(f);
  $('#photo-prev').alt = lang === 'bn' ? 'আপনার বাছাই করা ছবি' : 'Your chosen photo';
  $('#photo-prev').classList.remove('hidden');
  $('#photo-hint').classList.add('invisible');
});
$('#join-name').addEventListener('input', (e) => { $('#decl-name').textContent = e.target.value.trim() || '______'; });
const aadhaar = $('#join-form [pattern]');
aadhaar.dataset.errEn = 'Enter the last 4 digits only.';
aadhaar.dataset.errBn = 'শুধু শেষ ৪টি সংখ্যা দিন।';
aadhaar.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });
const joinForm = $('#join-form');
joinForm.querySelector('input[type="tel"]').dataset.phone = '';
enhanceForm(joinForm);
joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate(joinForm)) return;
  const fam = [...$('#dependents').querySelectorAll('input')].filter((i) => i.value.trim()).length;
  confirmPanel(e.currentTarget, 'Application received', 'আবেদন পেয়েছি', [
    [fam ? `Your form covers you and ${fam} family member${fam === 1 ? '' : 's'}. Each of you gets an ID card.` : 'Your form is with the committee.', fam ? `আপনার ফর্মে আপনি ও পরিবারের ${bnNum(fam)} জন। প্রত্যেকে আইডি কার্ড পাবেন।` : 'আপনার ফর্ম কমিটির কাছে।'],
    ['Bring your Aadhaar card to the club room once. They approve the form at the next meeting, Sunday 16 Nov, and send you an SMS.', 'আধার কার্ড একবার ক্লাব ঘরে দেখিয়ে যাবেন। পরের সভায় (রবি ১৬ নভে) অনুমোদন হবে, এসএমএস পাবেন।'],
    ['Pay the ₹500 admission and your member card appears in the app.', '₹৫০০ ভর্তি ফি দিলে সদস্য কার্ড অ্যাপে চলে আসবে।'],
  ], ['Edit the application', 'আবেদন বদলান'], { refNo: ref('GMC-J') });
});

document.addEventListener('langchange', () => { renderPlants(); });

renderCats();
renderPlants();

/* ---------- New screens ---------- */
renderNotices();
renderChanda();
renderContact();
initChandaForm();
initContactForm();
document.addEventListener('langchange', () => {
  renderNotices(); renderChanda(); renderContact();
  if (current.screen === 'event') renderEventDetail(current.param);
  if (current.screen === 'notice') renderNoticeDetail(current.param);
  setTitle(current.screen, current.title());
});

const search = initSearch({
  onPick: (h) => {
    if (!h.plant) return;
    cat = 'all'; $('#plant-q').value = h.plant; renderCats(); renderPlants();
    setTimeout(() => $('#plant-list').scrollIntoView({ block: 'center' }), 0);
  },
});
$('#search-btn').addEventListener('click', () => search.open());
document.addEventListener('click', (e) => { if (e.target.closest('[data-open-search]')) search.open(); });

/* Events as structured data for search engines */
const ld = document.createElement('script');
ld.type = 'application/ld+json';
ld.textContent = JSON.stringify(events.map((e) => ({
  '@context': 'https://schema.org', '@type': 'Event', name: e.title, startDate: e.date,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', eventStatus: 'https://schema.org/EventScheduled',
  location: { '@type': 'Place', name: e.place, address: club.address },
  description: eventInfo[e.id]?.about || e.title,
  organizer: { '@type': 'Organization', name: club.name, url: 'https://gedemaitreeclub.org/' },
})));
document.head.append(ld);

/* ---------- Routing: titles, focus, detail pages, in-page anchors, 404 ---------- */
const TITLES = {
  home: ['Gede Maitree Club · Netaji Para', 'গেদে মৈত্রী ক্লাব · নেতাজি পাড়া'],
  events: ['Events', 'অনুষ্ঠান'], notices: ['Notices', 'নোটিস'], catering: ['Maitree Serving', 'মৈত্রী পরিবেশন'],
  nursery: ['Maitree Nursery', 'মৈত্রী নার্সারি'], gallery: ['Gallery', 'ছবি'], committee: ['Committee', 'কমিটি'],
  chanda: ['Chanda & accounts', 'চাঁদা ও হিসাব'], contact: ['Contact & directions', 'যোগাযোগ ও পথ'],
  join: ['Become a member', 'সদস্য হোন'], privacy: ['Privacy & terms', 'গোপনীয়তা ও শর্ত'],
  notfound: ['Page not found', 'পাতা পাওয়া যায়নি'], event: ['Event', 'অনুষ্ঠান'], notice: ['Notice', 'নোটিস'],
};
const current = { screen: 'home', param: undefined, title: () => null };
function setTitle(screen, extra) {
  if (screen === 'home') { document.title = TITLES.home[lang === 'bn' ? 1 : 0]; return; }
  const base = extra || (TITLES[screen] || TITLES.home)[lang === 'bn' ? 1 : 0];
  document.title = `${base} · ${lang === 'bn' ? 'গেদে মৈত্রী ক্লাব' : 'Gede Maitree Club'}`;
}
function activate(name) {
  $$('[data-screen]').forEach((s) => s.classList.toggle('is-active', s.dataset.screen === name));
}
function markNav(name) {
  const n = { event: 'events', notice: 'notices' }[name] || name;
  $$('[data-nav]').forEach((a) => { if (a.dataset.nav === n) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
}
let firstRoute = true;
function onRoute(screen, param) {
  const raw = decodeURIComponent(location.hash.slice(1));
  const name = raw.split('/')[0];
  if (raw && name !== screen) {
    // Not a screen: maybe an anchor inside one (#catering-quote, #faq-who, #terms, #give)
    const el = document.getElementById(name);
    const host = el?.closest('[data-screen]');
    if (host) {
      screen = host.dataset.screen;
      activate(screen); markNav(screen);
      setTimeout(() => {
        if (el.tagName === 'DETAILS') el.open = true;
        el.scrollIntoView({ block: 'start' });
        const f = el.matches('details') ? el.querySelector('summary') : el;
        if (!f.hasAttribute('tabindex') && !f.matches('summary, a, button, input, select, textarea')) f.tabIndex = -1;
        f.focus({ preventScroll: true });
      }, 0);
      Object.assign(current, { screen, param, title: () => null });
      setTitle(screen);
      firstRoute = false;
      return;
    }
    screen = 'notfound';
    activate('notfound');
  }
  let title = () => null;
  if (screen === 'event') { renderEventDetail(param); title = () => { const e = events.find((x) => x.id === param); return e ? (lang === 'bn' ? e.titleBn : e.title) : null; }; scrollTo({ top: 0 }); }
  if (screen === 'notice') { renderNoticeDetail(param); title = () => { const n = publicNotices.find((x) => x.id === param); return n ? (lang === 'bn' ? n.titleBn : n.title) : null; }; scrollTo({ top: 0 }); }
  markNav(screen);
  Object.assign(current, { screen, param, title });
  setTitle(screen, title());
  if (!firstRoute) {
    const h = $(`[data-screen="${screen}"] h1`);
    if (h) { if (!h.hasAttribute('tabindex')) h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }
  firstRoute = false;
}
router('home', onRoute);
boot('site');
