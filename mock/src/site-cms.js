/* Applies the committee's edits from the console's Website screen (the CMS) to this website.
   Imported by site.js before anything is drawn: lists (notices, committee, values) and photos are changed in place,
   and page text marked with data-cms="key" is swapped in both languages.
   ?cms-preview=1 is the console's live preview: it shows the entry being edited, unpublished, on top of what is live. */
import { siteContent, SITE_CONTENT_KEY, applyLang } from './shared.js';
import { committee } from './data.js';
import { publicNotices, SEO_PAGES } from './site-data.js';
import { PHOTOS } from './photos.js';

export const PREVIEW_KEY = 'maitri-site-preview';
const isPreview = new URLSearchParams(location.search).has('cms-preview');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lines = (s) => esc(s).replace(/\n/g, '<br>');

/** What the website shows: the published content, or in preview the console's unpublished version. */
function content() {
  const c = siteContent.get();
  if (!isPreview) return c;
  try { return JSON.parse(localStorage.getItem(PREVIEW_KEY)) || c; } catch { return c; }
}

/** Website notices after the committee's edits: edited text in, hidden ones dropped, added ones in, pinned first, newest first. */
export function noticesWithEdits(base, c = content()) {
  const hidden = new Set(c.notices?.hidden || []);
  const edited = c.notices?.edited || {};
  return [...(c.notices?.added || []), ...base.map((n) => (edited[n.id] ? { ...n, ...edited[n.id] } : n))]
    .filter((n) => !hidden.has(n.id))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.iso).localeCompare(String(a.iso)));
}

const c = content();

if (c.notices) publicNotices.splice(0, publicNotices.length, ...noticesWithEdits(publicNotices, c));
if (Array.isArray(c.committee) && c.committee.length) committee.splice(0, committee.length, ...c.committee);
if (c.photos?.group) { const url = c.photos.group; PHOTOS.group = { ...PHOTOS.group, src: () => url, by: 'Gede Maitree Club', page: '#committee' }; }

/* Menus: the committee can reorder, rename, hide and add items (Website › Menus).
   Item: { label: {en, bn}, href, show: 'all' | 'phone' | 'hidden' }. */
const navId = (href) => (String(href || '').startsWith('#') ? href.slice(1) : '');
const safeHref = (h) => (/^(https:\/\/|#|tel:|mailto:|[a-z-]+\.html)/i.test(String(h || '').trim()) ? String(h).trim() : '#home');
function renderMenus(menu) {
  if (!menu) return;
  // A link to the committee's own page shows only while that page is published
  const live = new Set((c.pages || []).filter((p) => !p.hidden).map((p) => `#page/${p.slug}`));
  const ok = (i) => !String(i.href).startsWith('#page/') || live.has(i.href);
  menu = Object.fromEntries(Object.entries(menu).map(([k, list]) => [k, (list || []).filter(ok)]));
  const ext = (h) => (/^https:/.test(h) ? ' target="_blank" rel="noopener"' : '');
  const desk = document.querySelector('nav[aria-label="Main"]');
  if (desk && menu.main) desk.innerHTML = menu.main.filter((i) => i.show === 'all').map((i) => { const h = safeHref(i.href); const id = navId(h); return `<a href="${esc(h)}"${ext(h)} data-nav="${esc(id)}" class="nav-link nav-${esc(id.split('/')[0])}" title="${esc(i.label.en)}"><span data-bn="${esc(i.label.bn || i.label.en)}">${esc(i.label.en)}</span></a>`; }).join('');
  const mob = document.querySelector('#mobile-nav ul');
  if (mob && menu.main) mob.innerHTML = menu.main.filter((i) => i.show !== 'hidden').map((i) => { const h = safeHref(i.href); return `<li><a href="${esc(h)}"${ext(h)} data-nav="${esc(navId(h))}" class="mnav-link" data-bn="${esc(i.label.bn || i.label.en)}">${esc(i.label.en)}</a></li>`; }).join('');
  [['footer1', 'Footer: club'], ['footer2', 'Footer: services and members']].forEach(([k, label]) => {
    const ul = document.querySelector(`nav[aria-label="${label}"] ul`);
    if (ul && menu[k]) ul.innerHTML = menu[k].filter((i) => i.show !== 'hidden').map((i) => { const h = safeHref(i.href); return `<li><a href="${esc(h)}"${ext(h)} class="hover:text-white" data-bn="${esc(i.label.bn || i.label.en)}">${esc(i.label.en)}</a></li>`; }).join('');
  });
}
renderMenus(c.menu);

function renderValues(list, root) {
  const ul = root.querySelector('#about-values');
  if (!ul || !Array.isArray(list) || !list.length) return;
  ul.innerHTML = list.map((v) => `<li class="rounded-2xl border border-rule p-5"><i data-lucide="${esc(v.icon || 'sparkles')}" class="w-6 h-6 text-sindoor"></i>`
    + `<h3 class="mt-3 font-semibold text-[17px]" data-bn="${lines(v.title?.bn || v.title?.en)}">${lines(v.title?.en)}</h3>`
    + `<p class="mt-1 text-[15px] text-ink-2" data-bn="${lines(v.text?.bn || v.text?.en)}">${lines(v.text?.en)}</p></li>`).join('');
}

/* ---------- Search & sharing: title, description, share image, indexing, links ---------- */
const SITE = 'https://gedemaitreeclub.org/'; // placeholder domain, as in index.html
const DEF_IMAGE = `${SITE}og-image.png`;
function meta(attr, name, value) {
  let m = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (value == null) { m?.remove(); return; }
  if (!m) { m = document.createElement('meta'); m.setAttribute(attr, name); document.head.append(m); }
  m.setAttribute('content', value);
}
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : s; };

/** Called by the website router on every page change. extra: { title, desc } for detail pages; fallback: [en, bn] title. */
export function applySeo(screen, lang, { title, desc, fallback } = {}) {
  const seo = content().seo || {};
  const bn = lang === 'bn';
  const def = SEO_PAGES.find((p) => p[0] === screen);
  const own = seo.pages?.[screen];
  const pick = (f, i) => (bn ? own?.[f]?.bn || own?.[f]?.en : own?.[f]?.en) || (def ? def[bn ? i + 1 : i] : null);
  const site = bn ? 'গেদে মৈত্রী ক্লাব' : 'Gede Maitree Club';
  const page = title || pick('title', 3) || fallback?.[bn ? 1 : 0] || site;
  const full = screen === 'home' && !title ? page : `${page} · ${site}`;
  const home = SEO_PAGES[0];
  const description = clip(desc || pick('desc', 5) || (bn ? seo.pages?.home?.desc?.bn || home[6] : seo.pages?.home?.desc?.en || home[5]), 160);
  const url = screen === 'home' ? SITE : `${SITE}#${screen}`;
  const image = seo.image || DEF_IMAGE;
  document.title = full;
  meta('name', 'description', description);
  meta('property', 'og:title', full);
  meta('property', 'og:description', description);
  meta('property', 'og:url', url);
  meta('property', 'og:image', image);
  meta('property', 'og:locale', bn ? 'bn_IN' : 'en_IN');
  meta('property', 'og:locale:alternate', bn ? 'en_IN' : 'bn_IN');
  meta('name', 'twitter:title', full);
  meta('name', 'twitter:description', description);
  meta('name', 'twitter:image', image);
  meta('name', 'robots', seo.index === false || screen === 'notfound' ? 'noindex, nofollow' : null);
  // Club links (Facebook, Instagram, YouTube) go into the organisation details search engines read
  const ld = [...document.head.querySelectorAll('script[type="application/ld+json"]')].find((x) => x.textContent.includes('"NGO"'));
  if (ld) { try { const o = JSON.parse(ld.textContent); const same = Object.values(seo.social || {}).filter(Boolean); if (same.length) o.sameAs = same; else delete o.sameAs; ld.textContent = JSON.stringify(o, null, 2); } catch { /* leave as is */ } }
}

export function applyCmsText(root = document) {
  const cc = content();
  const text = cc.text || {};
  root.querySelectorAll('[data-cms]').forEach((el) => {
    const v = text[el.dataset.cms];
    if (!v) return;
    if (v.en) el.dataset.en = lines(v.en);
    if (v.bn) el.dataset.bn = lines(v.bn);
  });
  renderValues(cc.values, root);
  applyLang(root);
}
applyCmsText();

// Saved in the console in another tab of this browser: show it here straight away
addEventListener('storage', (e) => { if (e.key === SITE_CONTENT_KEY && !isPreview) location.reload(); });

if (isPreview) {
  // Live preview: the console rewrites the preview copy as you type; reload and keep the scroll position
  addEventListener('storage', (e) => {
    if (e.key !== PREVIEW_KEY) return;
    try { sessionStorage.setItem('cms-preview-y', String(scrollY)); } catch { /* blocked */ }
    location.reload();
  });
  addEventListener('load', () => {
    let y = 0; try { y = Number(sessionStorage.getItem('cms-preview-y')) || 0; sessionStorage.removeItem('cms-preview-y'); } catch { /* blocked */ }
    if (y) setTimeout(() => scrollTo(0, y), 250);
    const tag = document.createElement('div');
    tag.className = 'fixed left-3 bottom-3 z-[90] rounded-full bg-ink text-white text-[13px] font-semibold px-3 py-1.5 shadow-lg pointer-events-none';
    tag.innerHTML = '<span data-bn="প্রিভিউ · এখনও প্রকাশ হয়নি">Preview · not published yet</span>';
    document.body.append(tag); applyLang(tag);
  });
}
