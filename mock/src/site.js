import { boot, t, inr, dn, seal, router, applyLang, refreshIcons, toast, lang, setLang, demo } from './shared.js';
import { PHOTOS, ALBUMS, GALLERY, photo, credit } from './photos.js';
import { serversFor, memberRate, events, pastEvents, cateringPackages, plants, plantCats, committee, club } from './data.js';
import { publicNotices, askAbout, pastWhenBn, pastAlbum, eventInfo, plantInfo, pujaSpend } from './site-data.js';
import { mountReviews } from './site-reviews.js';
import { renderPanjika, renderTodayStrip } from './site-panjika.js';
import { renderVolunteer, initVolunteerForm } from './site-volunteer.js';
import { validate, enhanceForm, confirmPanel, ref, bnNum, initials, daysUntil } from './site-ui.js';
import {
  kindLabel, ics, eventTime, renderNotices, renderNoticeDetail, renderEventDetail, renderPujaBreakdown,
  renderChanda, initChandaForm, renderContact, initContactForm, initSearch,
} from './site-pages.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Seals */
$('#logo-seal').innerHTML = seal({ size: innerWidth < 640 ? 38 : 44, rotate: -6 });
$('#join-seal').innerHTML = seal({ size: 320, color: '#fff', rotate: 12 });
document.getElementById('hero-seal') && ($('#hero-seal').innerHTML = seal({ size: innerWidth < 640 ? 104 : 138, rotate: -12, className: 'stamp-in' }));
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
let newsVia = 'wa';
const newsTabs = [...waForm.querySelectorAll('[data-news-via]')];
const setNewsVia = (via) => {
  newsVia = via;
  const wa = via === 'wa';
  const inp = $('#wa-phone');
  newsTabs.forEach((x) => { const on = x.dataset.newsVia === via; x.setAttribute('aria-checked', String(on)); x.tabIndex = on ? 0 : -1; });
  inp.value = ''; inp.removeAttribute('aria-invalid'); inp.removeAttribute('aria-describedby'); delete inp.dataset.errId;
  waForm.querySelectorAll('.field-error').forEach((p) => p.remove());
  inp.type = wa ? 'tel' : 'email';
  inp.inputMode = wa ? 'tel' : 'email';
  inp.autocomplete = wa ? 'tel' : 'email';
  inp.placeholder = wa ? '98300 00000' : 'name@example.com';
  inp.classList.toggle('num', wa);
  inp.classList.toggle('pl-5', !wa);
  if (wa) inp.dataset.phone = ''; else delete inp.dataset.phone;
  $('#news-prefix').hidden = !wa;
  // These elements carry their own data-bn, so set both languages on them (applyLang picks one)
  const say = (el, en, bn) => { el.dataset.en = en; el.dataset.bn = bn; };
  if (wa) { say($('#news-label'), 'Mobile number', 'মোবাইল নম্বর'); say($('#news-note'), 'Reply STOP any time to leave.', 'যেকোনো সময় STOP লিখে বন্ধ করুন।'); }
  else { say($('#news-label'), 'Email address', 'ইমেল ঠিকানা'); say($('#news-note'), 'Every email has a one-click unsubscribe link.', 'প্রতিটি ইমেলে এক ক্লিকে বন্ধ করার লিঙ্ক থাকে।'); }
  applyLang(waForm);
};
newsTabs.forEach((x) => x.addEventListener('click', () => { setNewsVia(x.dataset.newsVia); x.focus(); }));
waForm.querySelector('[role="radiogroup"]').addEventListener('keydown', (e) => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  e.preventDefault();
  const next = newsVia === 'wa' ? 'email' : 'wa';
  setNewsVia(next);
  waForm.querySelector(`[data-news-via="${next}"]`).focus();
});
waForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate(waForm)) return;
  waForm.reset();
  toast(newsVia === 'wa'
    ? `<i data-lucide="check-circle-2"></i>${t('Done. You’ll get club notices on WhatsApp. Reply STOP to leave.', 'হয়ে গেছে। ক্লাবের নোটিস হোয়াটসঅ্যাপে পাবেন। বন্ধ করতে STOP লিখুন।')}`
    : `<i data-lucide="check-circle-2"></i>${t('Done. Club news will come to your inbox. Unsubscribe any time.', 'হয়ে গেছে। ক্লাবের খবর ইমেলে পাবেন। যেকোনো সময় বন্ধ করতে পারেন।')}`);
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-focus-wa]')) return;
  $('#wa-form').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' });
  setTimeout(() => $('#wa-phone').focus({ preventScroll: true }), reduceMotion() ? 0 : 450);
});

/* Photos */
document.getElementById('hero-photo').innerHTML = photo('pujaNight', { cls: 'w-full h-full object-cover', eager: true, w: 1800 });
document.getElementById('hero-credit').innerHTML = `${t('Video', 'ভিডিও')}: <a href="https://www.pexels.com/@debasish-bose-1630780/" target="_blank" rel="noopener" class="hover:underline">Debasish Bose / Pexels</a>`;
/* Home banner video: plays muted on loop; still photo for reduced motion or data saver; pause button */
{
  const v = document.getElementById('hero-video');
  const btn = document.getElementById('hero-play');
  // Smallest file that looks sharp under the dark shade: 2.6 MB on phones, 7.3 MB on most screens, 12 MB only on very wide ones
  const size = matchMedia('(max-width: 767px)').matches ? 'sd_640_360_30fps' : matchMedia('(min-width: 1600px)').matches ? 'hd_1280_720_30fps' : 'sd_960_540_30fps';
  // Still image for reduced motion, data saver and phones; the play button still loads the video
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData || matchMedia('(max-width: 767px)').matches;
  v.preload = calm ? 'none' : 'metadata';
  v.src = `https://videos.pexels.com/video-files/5697994/5697994-${size}.mp4`;
  const show = (on) => { btn.innerHTML = `<i data-lucide="${on ? 'pause' : 'play'}" class="w-4 h-4"></i>`; btn.setAttribute('aria-label', on ? (lang === 'bn' ? 'ভিডিও থামান' : 'Pause the video') : (lang === 'bn' ? 'ভিডিও চালান' : 'Play the video')); refreshIcons(); };
  const play = () => v.play().then(() => show(true)).catch(() => show(false));
  if (calm) show(false); else play();
  btn.addEventListener('click', () => { if (v.paused) play(); else { v.pause(); show(false); } });
  // Pause when the home page is not showing or the tab is hidden
  const sync = () => { const onHome = document.querySelector('[data-screen="home"]').classList.contains('is-active'); if (!onHome || document.hidden) v.pause(); else if (!calm && btn.getAttribute('aria-label')?.match(/Pause|থামান/)) v.play().catch(() => {}); };
  addEventListener('hashchange', () => setTimeout(sync, 0));
  document.addEventListener('visibilitychange', sync);
}
document.querySelectorAll('[data-photo]').forEach((el) => { el.innerHTML = photo(el.dataset.photo, { cls: 'w-full h-full object-cover', sizes: '(min-width: 768px) 570px, 100vw' }); });
document.querySelectorAll('[data-credit]').forEach((el) => { el.innerHTML = credit(el.dataset.credit); });

/* ---------- Home: khata ledger of Durga Puja spending ---------- */
function renderHomeLedger() {
  const total = pujaSpend.reduce((x, y) => x + y.v, 0);
  // Largest-remainder rounding so the shares add up to exactly ₹100
  const raw = pujaSpend.map((p) => (p.v / total) * 100);
  const share = raw.map(Math.floor);
  raw.map((r, i) => [r - share[i], i]).sort((x, y) => y[0] - x[0]).slice(0, 100 - share.reduce((x, y) => x + y, 0)).forEach(([, i]) => { share[i] += 1; });
  $('#home-ledger').innerHTML = pujaSpend.map((p, i) => `<li class="flex items-center gap-3 text-[15.5px]"><span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${p.c}" aria-hidden="true"></span><span class="flex-1 min-w-0">${t(p.en, p.bn)}</span><span class="hidden sm:block w-28 h-1.5 rounded-full bg-ink/10 overflow-hidden" aria-hidden="true"><span class="block h-full" style="width:${share[i] * 2.5}%;background:${p.c}"></span></span><span class="w-14 text-right font-semibold num">${dn(`₹${share[i]}`)}</span></li>`).join('')
    + `<li class="flex items-center gap-3 font-semibold border-t-2 border-ink/70"><span class="flex-1">${t('Total', 'মোট')}</span><span class="w-14 text-right text-sindoor num">${dn('₹100')}</span></li>`;
  applyLang($('#home-ledger'));
}
renderHomeLedger();
document.addEventListener('langchange', renderHomeLedger);

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
  // Rendered twice so the strip can loop without a seam; the copy is hidden from screen readers and tabbing.
  const tiles = (copy) => ['sindoor', 'feast2', 'pujaCrowd', 'marigold', 'runners', 'diyas', 'nurseryTable'].map((k, i) => `
    <a href="#gallery" ${i === 0 ? 'data-set-start' : ''} class="shrink-0 w-[210px] sm:w-[260px] aspect-[4/5] rounded-[18px] overflow-hidden group bg-paper-3" ${copy ? 'aria-hidden="true" tabindex="-1"' : `aria-label="${lang === 'bn' ? PHOTOS[k].altBn : PHOTOS[k].alt}"`}>
      ${photo(k, { w: 700, cls: 'w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]', sizes: '300px' })}
    </a>`).join('');
  strip.innerHTML = tiles(false) + (reduceMotion() ? '' : tiles(true));
  autoScroll(strip);
  const cm = document.getElementById('home-committee');
  if (!cm) { applyLang(nb); applyLang(strip); refreshIcons(); return; }
  cm.innerHTML = committee.slice(0, 4).map((c) => `
    <li class="card p-5 flex items-center gap-4">
      <span class="w-12 h-12 shrink-0 rounded-full bg-sindoor-wash text-sindoor-deep grid place-items-center font-semibold" aria-hidden="true">${initials(c)}</span>
      <span class="min-w-0">
        <span class="block font-semibold leading-snug">${t(c.name, c.nameBn)}</span>
        <span class="block text-[14px] text-ink-2">${t(c.role, c.roleBn)}</span>
      </span>
    </li>`).join('');
  applyLang(nb); applyLang(strip); applyLang(cm); refreshIcons();
}
/* Home photo strip drifts sideways on its own. It pauses while the pointer is over it, while it has
   focus, during a swipe and for a moment after, and when it is off screen or the tab is hidden.
   Manual scrolling still works: the drift picks up from wherever the visitor left it. */
function autoScroll(el, speed = 32 /* px per second */) {
  if (el.dataset.auto || reduceMotion()) return;
  el.dataset.auto = '1';
  let pos = el.scrollLeft, last = pos, prev = 0, hold = 0, hover = false, focus = false, seen = true;
  const loop = () => { const s = el.querySelectorAll('[data-set-start]'); return s.length > 1 ? s[1].offsetLeft - s[0].offsetLeft : 0; };
  const rest = (ms) => { hold = performance.now() + ms; };
  el.addEventListener('mouseenter', () => { hover = true; });
  el.addEventListener('mouseleave', () => { hover = false; });
  el.addEventListener('focusin', () => { focus = true; });
  el.addEventListener('focusout', () => { focus = false; });
  el.addEventListener('pointerdown', () => rest(4000), { passive: true });
  el.addEventListener('touchstart', () => rest(4000), { passive: true });
  el.addEventListener('wheel', () => rest(2500), { passive: true });
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(el);
  const tick = (now) => {
    const dt = prev ? Math.min(now - prev, 50) / 1000 : 0;
    prev = now;
    if (Math.abs(el.scrollLeft - last) > 1) pos = el.scrollLeft; // visitor moved it
    const w = loop();
    if (w && seen && !hover && !focus && now > hold && !document.hidden) {
      pos += speed * dt;
      if (pos >= w) pos -= w;
      el.scrollLeft = pos;
    } else if (w && el.scrollLeft >= w) { pos = el.scrollLeft - w; el.scrollLeft = pos; }
    last = el.scrollLeft;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

renderHomeExtras();
document.addEventListener('langchange', renderHomeExtras);

/* ---------- Gallery: albums by year, an album page, and photo / video walls ---------- */
let album = 'all';
let mediaType = 'all';
let gYear = 'all';
let gOpen = null; // album id when #gallery/<id> is open
let gIdx = 0; // which item of the open album is in the player
let gPick = null; // item chosen from a video card, applied when the album opens
const years = [...new Set(GALLERY.map((g) => g.date.slice(0, 4)))];
const isVideo = (it) => !!it.v;
const posterOf = (it) => (isVideo(it) ? it.poster : it.p);
const counts = (items) => { const v = items.filter(isVideo).length; return { p: items.length - v, v }; };
const countLine = (items) => {
  const { p, v } = counts(items);
  return [p ? t(`${p} photo${p === 1 ? '' : 's'}`, `${bnNum(p)}টি ছবি`) : '', v ? t(`${v} video${v === 1 ? '' : 's'}`, `${bnNum(v)}টি ভিডিও`) : ''].filter(Boolean).join(' · ');
};
const albumOf = (g) => ALBUMS.find((x) => x.key === g.album);
const coverOf = (g) => posterOf(g.items.find((it) => !isVideo(it)) || g.items[0]);
const altOf = (k) => (lang === 'bn' ? PHOTOS[k].altBn : PHOTOS[k].alt);
const countChips = (items) => {
  const { p, v } = counts(items);
  return `<span class="absolute left-3 bottom-3 flex gap-1.5">
    ${p ? `<span class="chip h-7 px-2.5 bg-black/70 text-white"><i data-lucide="image"></i><span class="num">${dn(String(p))}</span></span>` : ''}
    ${v ? `<span class="chip h-7 px-2.5 bg-black/70 text-white"><i data-lucide="play"></i><span class="num">${dn(String(v))}</span></span>` : ''}</span>`;
};
const playBadge = (size = 'w-14 h-14', icon = 'w-6 h-6') => `<span class="absolute inset-0 grid place-items-center"><span class="${size} rounded-full bg-white/95 text-ink grid place-items-center shadow-lg transition-transform group-hover:scale-105"><i data-lucide="play" class="${icon} ml-0.5 fill-current"></i></span></span>`;

/* One tile: photo or video, square by default. `i` indexes into the lightbox list. */
function tile(it, i, { cls = 'aspect-square', sizes = '(min-width: 1024px) 280px, 50vw', w = 700 } = {}) {
  const k = posterOf(it);
  const label = isVideo(it) ? `${lang === 'bn' ? 'ভিডিও চালান' : 'Play video'}: ${lang === 'bn' ? it.vBn : it.v}` : `${lang === 'bn' ? 'ছবি খুলুন' : 'Open photo'}: ${altOf(k)}`;
  return `<button type="button" data-zoom="${i}" class="group relative block w-full ${cls} rounded-xl overflow-hidden bg-paper-2 focus-visible:outline-offset-4" aria-label="${label}">
    ${photo(k, { w, cls: 'absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]', sizes })}
    ${isVideo(it) ? `<span class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></span>${playBadge()}
      <span class="absolute left-2.5 bottom-2.5 chip h-6 px-2 bg-black/70 text-white text-[12px]"><span class="num">${dn(it.dur)}</span></span>` : '<span class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></span>'}
  </button>`;
}

/* YouTube-style pieces: the club as the "channel", 16:9 thumbnails, title under the picture. */
const clubName = () => t('Gede Maitree Club', 'গেদে মৈত্রী ক্লাব');
const avatar = (sz = 'w-9 h-9', px = 32) => `<span class="${sz} shrink-0 rounded-full bg-card ring-1 ring-rule grid place-items-center overflow-hidden" aria-hidden="true">${seal({ size: px, rotate: 0, estd: false })}</span>`;
const itemTitle = (it, g) => (isVideo(it) ? t(it.v, it.vBn) : `<span data-alt-title>${altOf(posterOf(it))}</span>`);
const thumbSizes = '(min-width: 1280px) 280px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';
const durBadge = (it) => `<span class="absolute right-1.5 bottom-1.5 rounded-md bg-black/80 text-white text-[12px] font-semibold px-1.5 py-0.5 num">${dn(it.dur)}</span>`;

function cardMeta(title, line) {
  return `<div class="mt-3 flex gap-3">
    ${avatar()}
    <div class="min-w-0">
      <h3 class="font-semibold text-[15.5px] leading-snug line-clamp-2 group-hover:text-sindoor transition-colors">${title}</h3>
      <p class="mt-1 text-[13.5px] text-ink-3">${clubName()}</p>
      <p class="text-[13.5px] text-ink-3 num">${line}</p>
    </div>
  </div>`;
}

/* An album shown like a playlist: stacked edges above the thumbnail and an item count on it. */
function albumCard(g) {
  const a = albumOf(g);
  return `<a href="#gallery/${g.id}" class="group block" aria-label="${lang === 'bn' ? g.bn : g.en}">
    <div class="mx-4 h-1 rounded-t-md bg-ink/15"></div><div class="mx-2 h-1 rounded-t-md bg-ink/30"></div>
    <div class="relative aspect-video rounded-xl overflow-hidden bg-paper-2">
      ${photo(coverOf(g), { w: 800, cls: 'absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]', sizes: thumbSizes })}
      <span class="absolute right-1.5 bottom-1.5 rounded-md bg-black/80 text-white text-[12px] font-semibold px-1.5 py-0.5 flex items-center gap-1"><i data-lucide="list-video" class="w-3.5 h-3.5"></i><span class="num">${dn(String(g.items.length))}</span></span>
      <span class="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center text-white text-[14px] font-semibold"><span class="flex items-center gap-1.5"><i data-lucide="play" class="w-4 h-4 fill-current"></i>${t('Open album', 'অ্যালবাম খুলুন')}</span></span>
    </div>
    ${cardMeta(t(g.en, g.bn), `${t(a.en, a.bn)} · ${t(g.when, g.whenBn)}`)}
  </a>`;
}

/* A single video from an album; opens the watch page on that item. */
function videoCard(it, g) {
  const n = g.items.indexOf(it);
  return `<a href="#gallery/${g.id}" data-pick-item="${n}" class="group block" aria-label="${lang === 'bn' ? it.vBn : it.v}">
    <div class="relative aspect-video rounded-xl overflow-hidden bg-paper-2">
      ${photo(posterOf(it), { w: 800, cls: 'absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]', sizes: thumbSizes })}
      ${durBadge(it)}
    </div>
    ${cardMeta(t(it.v, it.vBn), `${t(g.en, g.bn)} · ${t(g.when, g.whenBn)}`)}
  </a>`;
}

const chipCls = 'shrink-0 h-8 px-3 rounded-lg text-[14px] font-medium whitespace-nowrap bg-paper-2 text-ink hover:bg-ink/10 aria-pressed:bg-ink aria-pressed:text-white';

function galleryIndex() {
  const types = [['all', 'All', 'সব'], ['video', 'Videos', 'ভিডিও'], ['photo', 'Photos', 'ছবি']];
  const list = GALLERY.filter((g) => (album === 'all' || g.album === album) && (gYear === 'all' || g.date.startsWith(gYear)));
  const all = list.flatMap((g) => g.items);
  let body = '';
  let flat = [];
  const grid = 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-9';
  if (!list.length) {
    body = `<div class="py-20 text-center"><i data-lucide="image-off" class="w-8 h-8 mx-auto text-ink-3"></i>
      <p class="mt-3 font-semibold">${t('Nothing here for this choice', 'এই বাছাইয়ে কিছু নেই')}</p>
      <p class="mt-1 text-ink-2">${t('Try another album or year.', 'অন্য অ্যালবাম বা বছর দেখুন।')}</p>
      <button type="button" class="btn btn-line btn-sm mt-4" data-g-reset>${t('Show everything', 'সব দেখান')}</button></div>`;
  } else if (mediaType === 'photo') {
    flat = list.flatMap((g) => g.items.filter((it) => !isVideo(it)).map((it) => ({ it, g })));
    body = `<div class="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">${flat.map(({ it }, i) => tile(it, i)).join('')}</div>`;
  } else if (mediaType === 'video') {
    const vids = list.flatMap((g) => g.items.filter(isVideo).map((it) => videoCard(it, g)));
    body = vids.length ? `<div class="mt-6 ${grid}">${vids.join('')}</div>`
      : `<p class="py-16 text-center text-ink-2">${t('No videos in this choice yet.', 'এই বাছাইয়ে এখনো ভিডিও নেই।')}</p>`;
  } else {
    const vids = list.flatMap((g) => g.items.filter(isVideo).map((it) => videoCard(it, g)));
    const byYear = years.map((y) => [y, list.filter((g) => g.date.startsWith(y))]).filter(([, gs]) => gs.length);
    body = `${vids.length ? `
      <section class="mt-8" aria-label="${lang === 'bn' ? 'ভিডিও' : 'Videos'}">
        <div class="flex items-center gap-2 mb-4"><i data-lucide="clapperboard" class="w-5 h-5 text-sindoor"></i><h2 class="text-[1.25rem] font-bold">${t('Videos', 'ভিডিও')}</h2>
          <button type="button" data-mt="video" class="ml-auto text-[14px] font-semibold text-sindoor hover:underline">${t('See all', 'সব দেখুন')}</button></div>
        <div class="flex gap-4 overflow-x-auto no-scrollbar snap-x -mx-5 px-5 pb-1">${vids.map((v) => `<div class="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[31%] xl:w-[23.5%]">${v}</div>`).join('')}</div>
      </section>` : ''}
      ${byYear.map(([y, gs]) => `
        <section class="mt-12" aria-label="${lang === 'bn' ? bnNum(y) : y}">
          <div class="flex items-baseline gap-3 mb-4 pt-6 border-t border-rule"><h2 class="text-[1.25rem] font-bold num">${dn(y)}</h2><span class="text-[14px] text-ink-3">${t(`${gs.length} album${gs.length === 1 ? '' : 's'}`, `${bnNum(gs.length)}টি অ্যালবাম`)}</span></div>
          <div class="${grid}">${gs.map((g) => albumCard(g)).join('')}</div>
        </section>`).join('')}`;
  }
  const { p: np, v: nv } = counts(all);
  return { flat, html: `
    <div class="sticky top-[65px] z-20 -mx-5 px-5 py-3 bg-paper/95 backdrop-blur border-b border-rule">
      <div class="flex items-center gap-2">
        <div class="flex gap-2 overflow-x-auto no-scrollbar flex-1 min-w-0" role="group" aria-label="${lang === 'bn' ? 'দেখান' : 'Show'}">
          ${types.map(([k, en, bn]) => `<button type="button" data-mt="${k}" aria-pressed="${mediaType === k}" class="${chipCls}">${t(en, bn)}</button>`).join('')}
          <span class="shrink-0 w-px my-1 bg-rule" aria-hidden="true"></span>
          ${[{ key: 'all', en: 'Every album', bn: 'সব অ্যালবাম' }, ...ALBUMS].map((a) => `<button type="button" data-album="${a.key}" aria-pressed="${album === a.key}" class="${chipCls}">${t(a.en, a.bn)}</button>`).join('')}
        </div>
        <label class="shrink-0"><span class="sr-only">${lang === 'bn' ? 'বছর' : 'Year'}</span><select id="g-year" class="field h-8 w-auto pr-8 text-[14px] py-0">${[['all', lang === 'bn' ? 'সব বছর' : 'All years'], ...years.map((y) => [y, lang === 'bn' ? bnNum(y) : y])].map(([v, l]) => `<option value="${v}" ${gYear === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
    </div>
    <div class="mt-5 flex items-center gap-3">
      ${avatar('w-12 h-12', 44)}
      <div class="min-w-0"><p class="font-bold text-[17px] leading-tight">${clubName()}</p>
        <p class="text-[13.5px] text-ink-3" aria-live="polite">${t(`${list.length} album${list.length === 1 ? '' : 's'} · ${np} photo${np === 1 ? '' : 's'} · ${nv} video${nv === 1 ? '' : 's'}`, `${bnNum(list.length)}টি অ্যালবাম · ${bnNum(np)}টি ছবি · ${bnNum(nv)}টি ভিডিও`)}</p></div>
    </div>
    ${body}` };
}

const noVideoYet = () => `<div class="absolute inset-0 grid place-items-center p-6 text-center bg-black/60"><div class="max-w-md text-white">
  <i data-lucide="clapperboard" class="w-10 h-10 mx-auto text-marigold"></i>
  <p class="mt-3 font-semibold text-lg">${t('The club’s video plays here', 'এখানে ক্লাবের ভিডিও চলবে')}</p>
  <p class="mt-1 text-white/80 text-[15px]">${t('Prototype: no video file yet. The committee uploads a video or pastes a YouTube link, and it plays in this player.', 'প্রোটোটাইপ: এখনো ভিডিও নেই। কমিটি ভিডিও আপলোড করবে বা ইউটিউব লিঙ্ক দেবে, এখানেই চলবে।')}</p></div></div>`;

/* Album as a watch page: the player on the left, the album as a playlist on the right. */
function galleryAlbum(g) {
  const a = albumOf(g);
  const flat = g.items.map((it) => ({ it, g }));
  const n = Math.min(gIdx, g.items.length - 1);
  const it = g.items[n];
  const k = posterOf(it);
  const i0 = GALLERY.indexOf(g);
  const more = GALLERY.filter((x) => x !== g).sort((x, y) => Math.abs(GALLERY.indexOf(x) - i0) - Math.abs(GALLERY.indexOf(y) - i0)).slice(0, 4);
  const share = `https://wa.me/?text=${encodeURIComponent(`${g.en} · Gede Maitree Club gallery\n${location.origin}${location.pathname}#gallery/${g.id}`)}`;
  const ctl = 'w-11 h-11 grid place-items-center rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition';
  const player = `
    <div class="relative aspect-video bg-black rounded-xl overflow-hidden group/player" data-player>
      ${isVideo(it) ? `
        <img src="${PHOTOS[k].src(1600)}" alt="" class="absolute inset-0 w-full h-full object-cover opacity-75" />
        <button type="button" data-play class="absolute inset-0 grid place-items-center group" aria-label="${lang === 'bn' ? 'চালান' : 'Play'}: ${lang === 'bn' ? it.vBn : it.v}">
          <span class="w-[68px] h-12 rounded-2xl bg-sindoor text-white grid place-items-center shadow-2xl group-hover:scale-105 transition-transform"><i data-lucide="play" class="w-7 h-7 ml-0.5 fill-current"></i></span></button>
        <div class="absolute inset-x-0 bottom-0 px-3 pb-2 pt-6 bg-gradient-to-t from-black/80 to-transparent text-white text-[13px] pointer-events-none">
          <div class="h-1 rounded-full bg-white/30"><div class="h-full w-0 bg-sindoor rounded-full"></div></div>
          <div class="mt-2 flex items-center gap-3"><i data-lucide="play" class="w-4 h-4 fill-current"></i><i data-lucide="volume-2" class="w-4 h-4"></i><span class="num">0:00 / ${dn(it.dur)}</span><i data-lucide="maximize" class="w-4 h-4 ml-auto"></i></div>
        </div>`
      : `<img src="${PHOTOS[k].src(1600)}" alt="${altOf(k)}" class="absolute inset-0 w-full h-full object-contain" />`}
      <span class="absolute left-3 top-3 rounded-md bg-black/60 text-white text-[12.5px] font-semibold px-2 py-0.5 num">${dn(`${n + 1} / ${g.items.length}`)}</span>
      <button type="button" data-zoom="${n}" class="${ctl} absolute right-3 top-3 !w-9 !h-9" aria-label="${lang === 'bn' ? 'পুরো পর্দায় দেখুন' : 'View full screen'}"><i data-lucide="expand" class="w-4 h-4"></i></button>
      ${g.items.length > 1 ? `
      <button type="button" data-step="-1" class="${ctl} absolute left-3 top-1/2 -translate-y-1/2 sm:opacity-0 sm:group-hover/player:opacity-100 focus-visible:opacity-100" aria-label="${lang === 'bn' ? 'আগের' : 'Previous'}"><i data-lucide="chevron-left"></i></button>
      <button type="button" data-step="1" class="${ctl} absolute right-3 top-1/2 -translate-y-1/2 sm:opacity-0 sm:group-hover/player:opacity-100 focus-visible:opacity-100" aria-label="${lang === 'bn' ? 'পরের' : 'Next'}"><i data-lucide="chevron-right"></i></button>` : ''}
    </div>`;
  const playlist = `
    <div class="rounded-xl border border-rule bg-card overflow-hidden">
      <div class="px-4 py-3 bg-paper-2">
        <p class="font-bold leading-snug">${t(g.en, g.bn)}</p>
        <p class="text-[13px] text-ink-3 mt-0.5"><span>${clubName()}</span> · <span class="num">${dn(`${n + 1} / ${g.items.length}`)}</span></p>
      </div>
      <ol class="max-h-[420px] overflow-y-auto py-1">
        ${g.items.map((x, j) => `<li><button type="button" data-pick="${j}" aria-current="${j === n}" class="w-full flex items-center gap-2 pl-2 pr-3 py-1.5 text-left hover:bg-paper-2 aria-[current=true]:bg-sindoor-wash">
          <span class="w-5 shrink-0 text-center text-[12px] text-ink-3 num">${j === n ? '<i data-lucide="play" class="w-3 h-3 mx-auto fill-current text-sindoor"></i>' : dn(String(j + 1))}</span>
          <span class="relative w-[112px] shrink-0 aspect-video rounded-md overflow-hidden bg-paper-2">${photo(posterOf(x), { w: 300, cls: 'absolute inset-0 w-full h-full object-cover', sizes: '112px' })}${isVideo(x) ? `<span class="absolute right-1 bottom-1 rounded bg-black/80 text-white text-[11px] font-semibold px-1 num">${dn(x.dur)}</span>` : ''}</span>
          <span class="min-w-0"><span class="block text-[14px] font-semibold leading-snug line-clamp-2">${itemTitle(x, g)}</span><span class="block text-[12.5px] text-ink-3 mt-0.5">${isVideo(x) ? t('Video', 'ভিডিও') : t('Photo', 'ছবি')}</span></span>
        </button></li>`).join('')}
      </ol>
    </div>`;
  const upNext = more.map((m) => `<a href="#gallery/${m.id}" class="group flex gap-2.5">
      <span class="relative w-[168px] shrink-0 aspect-video rounded-lg overflow-hidden bg-paper-2">${photo(coverOf(m), { w: 400, cls: 'absolute inset-0 w-full h-full object-cover', sizes: '168px' })}<span class="absolute right-1 bottom-1 rounded bg-black/80 text-white text-[11px] font-semibold px-1 flex items-center gap-0.5"><i data-lucide="list-video" class="w-3 h-3"></i><span class="num">${dn(String(m.items.length))}</span></span></span>
      <span class="min-w-0"><span class="block text-[14px] font-semibold leading-snug line-clamp-2 group-hover:text-sindoor">${t(m.en, m.bn)}</span><span class="block text-[12.5px] text-ink-3 mt-1">${clubName()}</span><span class="block text-[12.5px] text-ink-3 num">${t(m.when, m.whenBn)}</span></span>
    </a>`).join('');
  return { flat, html: `
    <a href="#gallery" class="inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink-2 hover:text-ink"><i data-lucide="arrow-left" class="w-4 h-4"></i>${t('All albums', 'সব অ্যালবাম')}</a>
    <div class="mt-4 grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 lg:gap-7 items-start">
      <div class="min-w-0">
        ${player}
        <h1 class="mt-4 text-[1.3rem] sm:text-[1.5rem] font-bold leading-snug">${isVideo(it) ? t(it.v, it.vBn) : t(g.en, g.bn)}</h1>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          ${avatar('w-10 h-10', 36)}
          <div class="min-w-0 mr-auto"><p class="font-semibold leading-tight">${clubName()}</p><p class="text-[13px] text-ink-3">${t('Netaji Para, since 2014', 'নেতাজি পাড়া, ২০১৪ থেকে')}</p></div>
          <div class="flex gap-2">
            <a href="${share}" target="_blank" rel="noopener" class="btn btn-line btn-sm rounded-full"><i data-lucide="share-2"></i>${t('Share', 'শেয়ার')}</a>
            <a href="https://wa.me/919830012345?text=${encodeURIComponent(`I have photos for the album: ${g.en}`)}" target="_blank" rel="noopener" class="btn btn-ink btn-sm rounded-full"><i data-lucide="image-plus"></i>${t('Add yours', 'আপনার ছবি দিন')}</a>
          </div>
        </div>
        <div class="mt-4 rounded-xl bg-paper-2 p-4 text-[14.5px]">
          <p class="font-semibold num">${t(g.when, g.whenBn)} · ${t(a.en, a.bn)} · ${countLine(g.items)}</p>
          <p class="mt-1.5 text-ink-2">${isVideo(it) ? t(`From the album “${g.en}”.`, `“${g.bn}” অ্যালবাম থেকে।`) : altOf(k)}</p>
          <p class="mt-3 text-[13px] text-ink-3">${isVideo(it) ? t('Cover photo', 'প্রচ্ছদ') : t('Photo', 'ছবি')}: ${credit(k)} · ${t('Sample photos, to be replaced with the club’s own.', 'নমুনা ছবি, ক্লাবের নিজের ছবি এলে বদলানো হবে।')}</p>
        </div>
      </div>
      <aside class="space-y-5" aria-label="${lang === 'bn' ? 'এই অ্যালবামে' : 'In this album'}">
        ${playlist}
        <div><h2 class="font-bold mb-3">${t('More albums', 'আরও অ্যালবাম')}</h2><div class="space-y-3">${upNext}</div></div>
      </aside>
    </div>` };
}

function renderGallery() {
  const root = $('#gallery-root');
  const g = gOpen && GALLERY.find((x) => x.id === gOpen);
  const { html, flat } = g ? galleryAlbum(g) : galleryIndex();
  root.innerHTML = html;
  // On an album, the player is the page: drop the big banner so it sits near the top, like a watch page.
  const banner = $('[data-screen="gallery"] > .banner');
  if (banner) banner.hidden = !!g;
  root.parentElement.classList.toggle('pt-10', !g);
  root.parentElement.classList.toggle('pt-6', !!g);
  applyLang(root); refreshIcons();
  root.querySelectorAll('[data-album]').forEach((b) => b.addEventListener('click', () => { album = b.dataset.album; renderGallery(); }));
  root.querySelectorAll('[data-mt]').forEach((b) => b.addEventListener('click', () => { mediaType = b.dataset.mt; renderGallery(); }));
  root.querySelector('#g-year')?.addEventListener('change', (e) => { gYear = e.target.value; renderGallery(); });
  root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => openLightbox(Number(b.dataset.zoom), flat)));
  root.querySelector('[data-g-reset]')?.addEventListener('click', () => { album = 'all'; mediaType = 'all'; gYear = 'all'; renderGallery(); });
  root.querySelectorAll('[data-pick-item]').forEach((b) => b.addEventListener('click', () => { gPick = Number(b.dataset.pickItem); }));
  if (!g) return;
  const show = (j) => {
    gIdx = (j + g.items.length) % g.items.length;
    renderGallery();
    const p = root.querySelector('[data-player]');
    if (p.getBoundingClientRect().top < 0) p.scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' });
  };
  root.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => show(Number(b.dataset.pick))));
  root.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => { show(gIdx + Number(b.dataset.step)); root.querySelector(`[data-step="${b.dataset.step}"]`)?.focus(); }));
  root.querySelector('[data-play]')?.addEventListener('click', (e) => { e.currentTarget.outerHTML = noVideoYet(); applyLang(root); refreshIcons(); });
  const cur = root.querySelector('[aria-current="true"]'); const ol = cur?.closest('ol');
  if (ol) ol.scrollTop = Math.max(0, cur.offsetTop - ol.offsetTop - 8);
}

function openLightbox(start, list) {
  let i = start;
  const back = document.activeElement;
  const box = document.createElement('div');
  box.className = 'fixed inset-0 z-[80] bg-[#0b0c0e]/[.97] flex flex-col';
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
      e.currentTarget.outerHTML = noVideoYet();
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
  const cell = (v, en, bn) => `<div class="bg-white/55 rounded-lg px-2.5 py-1.5 min-w-[56px]"><div class="font-display text-[1.6rem] leading-none">${dn(String(v).padStart(2, '0'))}</div><div class="text-[11.5px] font-semibold mt-0.5 text-ink">${t(en, bn)}</div></div>`;
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
  <li class="grid grid-cols-[56px_1fr] sm:grid-cols-[64px_1fr_auto] gap-x-4 sm:gap-x-5 gap-y-2 py-4 border-b border-rule items-center">
    <div class="row-span-2 sm:row-span-1 self-start sm:self-center w-14 sm:w-16 rounded-xl border border-rule bg-card text-center overflow-hidden">
      <div class="bg-sindoor text-white text-[11px] font-bold tracking-wide py-0.5">${t(e.mon.toUpperCase(), e.monBn)}</div>
      <div class="font-display text-[1.6rem] sm:text-[1.8rem] leading-[1.35] num">${dn(e.day)}</div>
    </div>
    <div class="min-w-0">
      <h3 class="font-display text-[1.2rem] sm:text-[1.35rem] leading-snug"><a href="#event/${e.id}" class="hover:text-sindoor">${t(e.title, e.titleBn)}</a></h3>
      <p class="text-[14.5px] text-ink-2 mt-0.5">${t(e.place, e.placeBn)} · ${eventTime(e)}</p>
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

/* ---------- Catering ---------- */
$('#packages').innerHTML = cateringPackages.map((p) => `
  <article class="relative card card-hover p-6 flex flex-col ${p.popular ? '!border-sindoor ring-1 ring-sindoor' : ''}">
    ${p.popular ? `<span class="absolute -top-3.5 left-6 chip bg-sindoor text-white">${t('Most booked', 'সবচেয়ে জনপ্রিয়')}</span>` : ''}
    <div class="relative -mx-2 -mt-2 mb-5 aspect-[16/10] rounded-xl overflow-hidden bg-paper-2">${photo({ team: 'catPlating', tableware: 'catBanana', full: 'catBuffet' }[p.id] || 'feast', { w: 700, cls: 'absolute inset-0 w-full h-full object-cover', sizes: '(min-width: 768px) 360px, 100vw' })}</div>
    <h3 class="font-display text-[1.9rem] leading-tight">${t(p.name, p.nameBn)}</h3>
    <p class="text-[15px] text-ink-2 mt-1">${t(p.for, p.forBn)}</p>
    <p class="mt-4 flex items-baseline gap-1.5"><span class="font-display text-4xl text-turmeric">${inr(p.rate)}</span><span class="text-sm text-ink-3">${t('per guest', 'অতিথি প্রতি')}</span></p>
    <ul class="mt-5 pt-5 border-t border-rule space-y-2.5 text-[15px]">
      ${p.menu.map((m, i) => `<li class="flex gap-2.5"><i data-lucide="check" class="w-[18px] h-[18px] mt-0.5 shrink-0 text-turmeric"></i><span>${t(m, p.menuBn[i])}</span></li>`).join('')}
    </ul>
    <p class="mt-4 text-sm text-ink-3">${t(`Minimum ${p.min} guests`, `ন্যূনতম ${bnNum(p.min)} জন অতিথি`)}</p>
    <button type="button" class="btn ${p.popular ? 'btn-primary' : 'btn-line'} mt-6 w-full" data-pick-pkg="${p.id}">${t('Get a quote for this', 'এটির দাম জানুন')}<i data-lucide="arrow-down"></i></button>
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
    <li class="group flex flex-col">
      <button type="button" class="relative block aspect-square rounded-2xl overflow-hidden bg-tulsi-wash text-left" data-plant="${p.id}" aria-label="${lang === 'bn' ? `${nm}: বিস্তারিত` : `${nm}: details`}">
        ${PHOTOS[p.id] ? photo(p.id, { w: 500, cls: `absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${p.stock === 0 ? 'grayscale opacity-70' : ''}`, sizes: '(min-width: 1024px) 260px, 50vw' }) : `<span class="absolute inset-0 grid place-items-center text-tulsi"><i data-lucide="${p.icon}" class="w-10 h-10"></i></span>`}
        <span class="absolute left-2.5 top-2.5 flex gap-1.5">${p.isNew ? `<span class="chip h-6 px-2 text-[12px] bg-marigold text-ink">${t('New', 'নতুন')}</span>` : ''}${p.stock === 0 ? `<span class="chip h-6 px-2 text-[12px] bg-ink text-white">${t('Out of stock', 'স্টক নেই')}</span>` : p.stock <= 10 ? `<span class="chip h-6 px-2 text-[12px] bg-white text-sindoor-deep">${t(`Only ${p.stock} left`, `মাত্র ${bnNum(p.stock)}টি`)}</span>` : ''}</span>
        <span class="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-full bg-white/95 text-ink grid place-items-center shadow opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"><i data-lucide="maximize-2" class="w-4 h-4"></i></span>
      </button>
      <div class="mt-3 flex-1">
        <button type="button" class="text-left font-semibold leading-snug hover:text-tulsi" data-plant="${p.id}">${t(p.name, p.nameBn)}</button>
        <p class="text-[13.5px] text-ink-3 mt-0.5">${t(p.pot, p.potBn)}</p>
      </div>
      <div class="mt-2.5 flex items-center justify-between gap-2">
        <span class="font-semibold text-[17px] num">${inr(p.price)}</span>
        ${p.stock === 0 ? `<span class="text-[13px] text-ink-3">${t('Back soon', 'শিগগির আসবে')}</span>` : q === 0
          ? `<button class="btn btn-sm border border-tulsi/40 text-tulsi hover:bg-tulsi-wash" data-add="${p.id}" aria-label="${lang === 'bn' ? `${nm} যোগ করুন` : `Add ${nm}`}"><i data-lucide="plus"></i>${t('Add', 'যোগ')}</button>`
          : `<div class="flex items-center rounded-lg bg-tulsi text-white" role="group" aria-label="${nm}">
               <button class="w-9 h-9 grid place-items-center" data-dec="${p.id}" aria-label="${lang === 'bn' ? 'একটি কমান' : 'Remove one'}"><i data-lucide="minus" class="w-4 h-4"></i></button>
               <span class="w-6 text-center font-semibold" aria-live="polite">${dn(String(q))}</span>
               <button class="w-9 h-9 grid place-items-center disabled:opacity-40" data-add="${p.id}" aria-label="${lang === 'bn' ? 'আরও একটি' : 'Add one'}" ${q >= p.stock ? 'disabled' : ''}><i data-lucide="plus" class="w-4 h-4"></i></button>
             </div>`}
      </div>
    </li>`;
  }).join('');
  $('#plant-list').querySelectorAll('[data-plant]').forEach((b) => b.addEventListener('click', () => openPlant(b.dataset.plant)));
  const keepFocus = (sel) => requestAnimationFrame(() => $(sel)?.focus());
  $('#plant-list').querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => { const p = plants.find((x) => x.id === b.dataset.add); basket.set(p.id, Math.min(p.stock, (basket.get(p.id) || 0) + 1)); renderPlants(); keepFocus(`#plant-list [data-add="${p.id}"]`); }));
  $('#plant-list').querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.dec; const v = (basket.get(id) || 0) - 1; if (v <= 0) basket.delete(id); else basket.set(id, v); renderPlants(); keepFocus(v > 0 ? `#plant-list [data-dec="${id}"]` : `#plant-list [data-add="${id}"]`); }));
  applyLang($('#plant-list'));
  refreshIcons();
  renderBasket();
}

/* Plant window: photo, care, price and quantity */
function openPlant(id) {
  const p = plants.find((x) => x.id === id);
  const info = plantInfo[id] || {};
  const back = document.activeElement;
  const LIGHT = { sun: ['Full sun', 'পুরো রোদ', 'sun'], part: ['Some sun', 'হালকা রোদ', 'cloud-sun'], shade: ['Indoor light', 'ঘরের আলো', 'lamp'] };
  const WATER = { often: ['Water daily', 'রোজ জল', 'droplets'], moderate: ['Every 2–3 days', '২–৩ দিন অন্তর', 'droplet'], little: ['Once a week', 'সপ্তাহে একবার', 'droplet'] };
  const facts = [LIGHT[info.light], WATER[info.water], [p.pot, p.potBn, 'ruler']].filter(Boolean);
  let qty = Math.max(1, basket.get(id) || 1);
  const wrap = document.createElement('div');
  wrap.className = 'fixed inset-0 z-[85] flex items-end sm:items-center justify-center sm:p-6';
  wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-label', lang === 'bn' ? p.nameBn : p.name);
  const draw = () => {
    const member = Math.round(p.price * 0.9);
    wrap.innerHTML = `
      <div class="absolute inset-0 bg-black/55" data-x></div>
      <div class="relative w-full sm:max-w-[820px] max-h-[92dvh] overflow-y-auto bg-paper rounded-t-3xl sm:rounded-3xl shadow-2xl grid sm:grid-cols-2 rise">
        <div class="relative aspect-[4/3] sm:aspect-auto sm:min-h-[460px] bg-tulsi-wash">
          ${PHOTOS[id] ? photo(id, { w: 900, cls: 'absolute inset-0 w-full h-full object-cover', sizes: '(min-width: 640px) 410px, 100vw', eager: true }) : ''}
          <span class="absolute left-3 bottom-3 text-[11.5px] text-white bg-black/50 px-1.5 rounded">${PHOTOS[id] ? credit(id) : ''}</span>
          <button type="button" data-x class="absolute right-3 top-3 w-10 h-10 rounded-full bg-white/95 text-ink grid place-items-center shadow sm:hidden" aria-label="${lang === 'bn' ? 'বন্ধ' : 'Close'}"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <div class="p-6 sm:p-8 flex flex-col">
          <div class="flex items-start gap-3">
            <div class="min-w-0">
              <p class="eyebrow text-tulsi">${t(plantCats[p.cat]?.en || 'Plant', plantCats[p.cat]?.bn || 'গাছ')}</p>
              <h2 class="mt-2 font-display text-[1.9rem] leading-tight">${t(p.name, p.nameBn)}</h2>
            </div>
            <button type="button" data-x class="ml-auto hidden sm:grid w-10 h-10 rounded-full hover:bg-paper-2 place-items-center shrink-0" aria-label="${lang === 'bn' ? 'বন্ধ' : 'Close'}"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>
          ${info.about ? `<p class="mt-4 text-[16px] text-ink-2 leading-relaxed">${t(...info.about)}</p>` : ''}
          <ul class="mt-5 grid grid-cols-3 gap-2">${facts.map(([en, bn, ic]) => `<li class="rounded-xl bg-paper-2 px-3 py-3 text-center"><i data-lucide="${ic}" class="w-5 h-5 mx-auto text-tulsi"></i><span class="block mt-1.5 text-[13px] font-semibold leading-tight">${t(en, bn)}</span></li>`).join('')}</ul>
          ${info.tip ? `<p class="mt-4 text-[14.5px] text-ink-2 flex gap-2"><i data-lucide="lightbulb" class="w-[18px] h-[18px] text-marigold shrink-0 mt-0.5"></i><span>${t(...info.tip)}</span></p>` : ''}
          <div class="mt-6 pt-5 border-t border-rule flex items-end justify-between gap-3">
            <div>
              <p class="font-display text-[2rem] leading-none num">${inr(p.price)}</p>
              <p class="mt-1.5 text-[13.5px] text-ink-2">${t(`Members ${inr(member)}`, `সদস্যদের ${inr(member)}`)}</p>
            </div>
            <p class="text-[13.5px] ${p.stock === 0 ? 'text-ink-3' : p.stock <= 10 ? 'text-sindoor-deep font-semibold' : 'text-tulsi font-semibold'}">${p.stock === 0 ? t('Out of stock', 'স্টক নেই') : p.stock <= 10 ? t(`Only ${p.stock} left`, `মাত্র ${bnNum(p.stock)}টি বাকি`) : t('In stock', 'স্টকে আছে')}</p>
          </div>
          ${p.stock === 0
            ? `<a href="https://wa.me/919830012345?text=${encodeURIComponent(`Please tell me when ${p.name} is back at the nursery.`)}" target="_blank" rel="noopener" class="btn btn-line h-12 mt-5"><i data-lucide="bell"></i>${t('Tell me when it is back', 'এলে জানাবেন')}</a>`
            : `<div class="mt-5 flex items-center gap-3">
                <div class="flex items-center rounded-xl border border-rule h-12" role="group" aria-label="${lang === 'bn' ? 'সংখ্যা' : 'Quantity'}">
                  <button type="button" class="w-11 h-full grid place-items-center disabled:opacity-35" data-q="-1" ${qty <= 1 ? 'disabled' : ''} aria-label="${lang === 'bn' ? 'কমান' : 'Less'}"><i data-lucide="minus" class="w-4 h-4"></i></button>
                  <span class="w-8 text-center font-semibold num" aria-live="polite">${dn(String(qty))}</span>
                  <button type="button" class="w-11 h-full grid place-items-center disabled:opacity-35" data-q="1" ${qty >= p.stock ? 'disabled' : ''} aria-label="${lang === 'bn' ? 'বাড়ান' : 'More'}"><i data-lucide="plus" class="w-4 h-4"></i></button>
                </div>
                <button type="button" class="btn flex-1 h-12 bg-tulsi text-white hover:bg-[#1f5029]" data-put><i data-lucide="shopping-basket"></i>${basket.get(id) ? t(`Update basket · ${inr(qty * p.price)}`, `ঝুড়ি বদলান · ${inr(qty * p.price)}`) : t(`Add to basket · ${inr(qty * p.price)}`, `ঝুড়িতে দিন · ${inr(qty * p.price)}`)}</button>
              </div>`}
          <p class="mt-4 text-[13px] text-ink-3">${t('Pick up at the club gate, 7–10 am and 4–7 pm. Pay at the gate in cash or UPI.', 'ক্লাবের গেট থেকে নিন, সকাল ৭–১০টা ও বিকেল ৪–৭টা। গেটে নগদ বা ইউপিআই-এ দাম দিন।')}</p>
        </div>
      </div>`;
    applyLang(wrap); refreshIcons();
    wrap.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => { qty = Math.min(p.stock, Math.max(1, qty + Number(b.dataset.q))); draw(); wrap.querySelector(`[data-q="${b.dataset.q}"]`)?.focus(); }));
    wrap.querySelector('[data-put]')?.addEventListener('click', () => { basket.set(id, qty); renderPlants(); close(); toast(`<i data-lucide="shopping-basket"></i>${t(`${qty} × ${p.name} in your basket`, `ঝুড়িতে ${bnNum(qty)} × ${p.nameBn}`)}`); });
    wrap.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', close));
  };
  const key = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { const f = [...wrap.querySelectorAll('button:not([disabled]), a[href]')]; if (!f.length) return; const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  };
  function close() { wrap.remove(); document.removeEventListener('keydown', key); document.documentElement.style.overflow = ''; back?.focus?.(); }
  document.addEventListener('keydown', key);
  document.documentElement.style.overflow = 'hidden';
  document.body.append(wrap); draw();
  (wrap.querySelector('[data-put]') || wrap.querySelector('[data-x]:not(.sm\\:hidden)') || wrap.querySelector('[data-x]'))?.focus();
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
    return `<li class="card card-hover p-6">
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
/* Join: three steps, each checked before moving on, then a review */
let joinStep = 1;
const stepEl = (n) => joinForm.querySelector(`[data-step="${n}"]`);
function showJoinStep(n, { focus = true } = {}) {
  joinStep = n;
  [1, 2, 3].forEach((k) => { stepEl(k).hidden = k !== n; });
  $('#join-step-n').textContent = lang === 'bn' ? bnNum(n) : n;
  $$('#join-steps [data-dot]').forEach((d) => {
    const k = Number(d.dataset.dot);
    d.classList.toggle('text-ink-3', k > n);
    d.firstElementChild.className = `block h-1.5 rounded-full ${k < n ? 'bg-tulsi' : k === n ? 'bg-sindoor' : 'bg-paper-3'}`;
  });
  $('#join-back').hidden = n === 1;
  $('#join-next').hidden = n === 3;
  $('#join-send').hidden = n !== 3;
  if (n === 3) renderJoinReview();
  if (focus) {
    joinForm.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    stepEl(n).querySelector('h2')?.setAttribute('tabindex', '-1');
    stepEl(n).querySelector('h2')?.focus({ preventScroll: true });
  }
}
function renderJoinReview() {
  const v = (sel) => stepEl(1).querySelector(sel)?.value?.trim() || '';
  const fam = [...$('#dependents').querySelectorAll('input')].map((i) => i.value.trim()).filter(Boolean);
  const rows = [
    [t('Name', 'নাম'), v('#join-name'), 1],
    [t('Mobile', 'মোবাইল'), stepEl(1).querySelector('input[type=tel]').value, 1],
    [t('Blood group', 'রক্তের গ্রুপ'), stepEl(1).querySelector('select').selectedOptions[0]?.textContent || '', 1],
    [t('Address', 'ঠিকানা'), stepEl(2).querySelector('textarea').value.trim(), 2],
    [t('Family on this form', 'এই ফর্মে পরিবার'), fam.length ? fam.join(', ') : t('Only you', 'শুধু আপনি'), 2],
  ];
  $('#join-review').innerHTML = rows.map(([k, val, step]) => `<div class="flex items-start gap-3 px-4 py-3"><span class="w-36 shrink-0 text-ink-2">${k}</span><span class="flex-1 min-w-0 break-words font-medium">${val || '—'}</span><button type="button" class="text-[14px] font-semibold text-sindoor hover:underline shrink-0" data-goto="${step}">${t('Edit', 'বদলান')}</button></div>`).join('');
  applyLang($('#join-review'));
  $$('#join-review [data-goto]').forEach((btn) => btn.addEventListener('click', () => showJoinStep(Number(btn.dataset.goto))));
}
$('#join-next').addEventListener('click', () => { if (validate(stepEl(joinStep))) showJoinStep(joinStep + 1); });
$('#join-back').addEventListener('click', () => showJoinStep(joinStep - 1));
joinForm.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName === 'INPUT' && joinStep < 3) { e.preventDefault(); $('#join-next').click(); }
});
joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (joinStep < 3) { $('#join-next').click(); return; }
  if (!validate(stepEl(3))) return;
  const fam = [...$('#dependents').querySelectorAll('input')].filter((i) => i.value.trim()).length;
  const s1 = stepEl(1), s2 = stepEl(2);
  demo.set({
    app: {
      id: 'AP-26-020', head: s1.querySelector('#join-name').value.trim(), phone: s1.querySelector('input[type=tel]').value.replace(/\D/g, '').slice(-10),
      lane: s2.querySelector('select').value, address: s2.querySelector('textarea').value.trim(),
      people: [...$('#dependents').querySelectorAll('input')].map((i) => i.value.trim()).filter(Boolean),
      plan: stepEl(3).querySelectorAll('input[name=plan]')[1].checked ? 'yearly' : 'monthly',
    },
    approved: null,
  });
  confirmPanel(e.currentTarget, 'Application received', 'আবেদন পেয়েছি', [
    [fam ? `Your form covers you and ${fam} family member${fam === 1 ? '' : 's'}. Each of you gets an ID card.` : 'Your form is with the committee.', fam ? `আপনার ফর্মে আপনি ও পরিবারের ${bnNum(fam)} জন। প্রত্যেকে আইডি কার্ড পাবেন।` : 'আপনার ফর্ম কমিটির কাছে।'],
    ['Bring your Aadhaar card to the club room once. The committee approves forms at the next meeting, Sunday 16 Nov, and sends you an SMS.', 'আধার কার্ড একবার ক্লাব ঘরে দেখিয়ে যাবেন। পরের সভায় (রবি ১৬ নভে) অনুমোদন হবে, এসএমএস পাবেন।'],
    ['Pay the ₹500 admission and your member card appears in the app.', '₹৫০০ ভর্তি ফি দিলে সদস্য কার্ড অ্যাপে চলে আসবে।'],
  ], ['Edit the application', 'আবেদন বদলান'], { refNo: ref('GMC-J'), onReset: () => showJoinStep(1, { focus: false }) });
});
showJoinStep(1, { focus: false });
document.addEventListener('langchange', () => { $('#join-step-n').textContent = lang === 'bn' ? bnNum(joinStep) : joinStep; if (joinStep === 3) renderJoinReview(); });

document.addEventListener('langchange', () => { renderPlants(); });

renderCats();
renderPlants();
mountReviews('#cat-reviews', 'catering', { ask: 'Namaskar, I would like to leave a review for Maitree Serving:' });
mountReviews('#nur-reviews', 'nursery', { ask: 'Namaskar, I would like to leave a review for Maitree Nursery:' });

/* ---------- New screens ---------- */
renderNotices();
renderChanda();
renderContact();
initChandaForm();
initContactForm();
renderVolunteer();
initVolunteerForm();
document.addEventListener('langchange', () => {
  renderNotices(); renderChanda(); renderContact(); renderVolunteer();
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
  nursery: ['Maitree Nursery', 'মৈত্রী নার্সারি'], gallery: ['Gallery', 'ছবি'], committee: ['About the club', 'ক্লাবের কথা'],
  chanda: ['Chanda & accounts', 'চাঁদা ও হিসাব'], contact: ['Contact & directions', 'যোগাযোগ ও পথ'],
  panjika: ['Panjika', 'পঞ্জিকা'],
  volunteer: ['Get involved', 'হাত লাগান'],
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
  if (screen === 'gallery') { const g = GALLERY.find((x) => x.id === param); gOpen = g ? g.id : null; gIdx = g ? (gPick ?? 0) : 0; gPick = null; renderGallery(); if (g) { title = () => (lang === 'bn' ? g.bn : g.en); } scrollTo({ top: 0 }); }
  if (screen === 'panjika') { renderPanjika(param); scrollTo({ top: 0 }); }
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
renderTodayStrip();
router('home', onRoute);
boot('site');
