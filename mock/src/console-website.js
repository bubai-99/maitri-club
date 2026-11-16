// Committee console: Website, a small CMS for the public website.
// Content types on the left (Pages, Notices, Committee, Media); each opens a list, and each entry opens an editor
// with English / Bengali tabs, sections, Save draft / Publish, revision history and a live preview of the website.
// Defaults are read from the website page itself (data-cms="key"), so there is one source for the original text.
// Prototype: published content is kept in this browser (shared.js siteContent) and the website applies it (site-cms.js);
// drafts and history are kept in a console-only store.
import { t, lang, toast, refreshIcons, siteContent } from './shared.js';
import { committee as baseCommittee, rolePerms } from './data.js';
import { viewAs } from './console-admin.js';
import { publicNotices, SEO_PAGES } from './site-data.js';
import { PHOTOS } from './photos.js';

const L = (en, bn) => (lang === 'bn' ? bn : en);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const bnD = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
const ok = (en, bn) => toast(`<i data-lucide="check-circle-2"></i>${t(en, bn)}`);
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const clone = (o) => JSON.parse(JSON.stringify(o ?? null));
const WHO = ['Tapas Mondal', 'তাপস মণ্ডল'];

/* ---------- Stores ---------- */
const WS_KEY = 'maitri-site-cms';
const PREVIEW_KEY = 'maitri-site-preview';
const ws = {
  get() { try { return { drafts: {}, history: {}, meta: {}, ...(JSON.parse(localStorage.getItem(WS_KEY)) || {}) }; } catch { return { drafts: {}, history: {}, meta: {} }; } },
  put(o) { try { localStorage.setItem(WS_KEY, JSON.stringify(o)); } catch { /* storage blocked */ } },
  edit(fn) { const o = ws.get(); fn(o); ws.put(o); },
};

/* ---------- Content model ---------- */
const BASE_NOTICES = publicNotices.map((n) => ({ ...n }));
const BASE_COMMITTEE = baseCommittee.map((c) => ({ ...c }));
const TAGS = [...new Map([...BASE_NOTICES.map((n) => [n.tag, n.tagBn]), ['Meeting', 'সভা'], ['Puja', 'পূজা'], ['Club', 'ক্লাব'], ['Service', 'সেবা'], ['Sports', 'খেলা']]).entries()];
const ICONS = ['door-open', 'book-open-check', 'vote', 'hand-heart', 'heart', 'users', 'sparkles', 'leaf', 'shield-check', 'sun', 'music', 'trophy'];

// Page sections. Field: [cms key, label EN, label BN, long?]
const PAGES = {
  home: {
    en: 'Home page', bn: 'হোম পাতা', icon: 'house', hash: '#home',
    sections: [
      { id: 'hero', en: 'Top of the page', bn: 'পাতার উপরে', hintEn: 'The first thing people see: the big title over the photo.', hintBn: 'সবার আগে যা চোখে পড়ে: ছবির ওপর বড় শিরোনাম।', fields: [
        ['hero.kicker', 'Small line above the title', 'শিরোনামের উপরের ছোট লাইন'],
        ['hero.title', 'Big title', 'বড় শিরোনাম'],
        ['hero.sub', 'Text under the title', 'শিরোনামের নিচের লেখা', true],
      ] },
    ],
  },
  about: {
    en: 'About page', bn: 'আমাদের কথা', icon: 'info', hash: '#committee',
    sections: [
      { id: 'banner', en: 'Banner', bn: 'ব্যানার', fields: [['about.title', 'Title', 'শিরোনাম'], ['about.intro', 'Text under the title', 'শিরোনামের নিচের লেখা', true]] },
      { id: 'mission', en: 'Mission', bn: 'লক্ষ্য', fields: [['about.mission', 'Mission, one or two lines', 'লক্ষ্য, এক-দুই লাইন', true]] },
      { id: 'values', en: 'Values', bn: 'মূল্যবোধ', hintEn: 'Cards next to the mission. Add, remove or reorder them.', hintBn: 'লক্ষ্যের পাশের কার্ড। যোগ করুন, সরান বা ক্রম বদলান।', repeat: 'values' },
      { id: 'story', en: 'Our story', bn: 'আমাদের কথা', fields: [['story.title', 'Title', 'শিরোনাম'], ['story.text', 'Story', 'গল্প', true]] },
      { id: 'group', en: 'Group photo', bn: 'দলগত ছবি', hintEn: 'The full-width photo at the bottom of the page.', hintBn: 'পাতার নিচের পুরো চওড়া ছবি।', image: true, fields: [['group.kicker', 'Small line', 'ছোট লাইন'], ['group.title', 'Heading', 'শিরোনাম'], ['group.caption', 'Caption', 'ক্যাপশন', true]] },
      { id: 'clubroom', en: 'Club room', bn: 'ক্লাব ঘর', fields: [['clubroom.text', 'Address and hours', 'ঠিকানা ও সময়', true]] },
    ],
  },
};
const TYPES = [
  ['pages', 'files', 'Pages', 'পাতা'],
  ['menu', 'menu', 'Menus', 'মেনু'],
  ['notices', 'megaphone', 'Notices', 'নোটিস'],
  ['committee', 'users', 'Committee', 'কমিটি'],
  ['media', 'image', 'Media', 'ছবি'],
  ['seo', 'search', 'SEO & sharing', 'এসইও ও শেয়ার'],
];
const DEF_SHARE = 'og-image.png';
const SOCIAL = [['facebook', 'Facebook page', 'ফেসবুক পেজ'], ['instagram', 'Instagram', 'ইনস্টাগ্রাম'], ['youtube', 'YouTube channel', 'ইউটিউব চ্যানেল']];

let C;
let defaults = null; // { key: {en, bn}, values: [...] } read from the website page
const view = { type: 'pages', entry: null, lmode: 'en', preview: false, device: 'desktop', open: {} };
let state = null; // the open entry: { key, data, saved }

async function loadDefaults() {
  if (defaults) return defaults;
  defaults = { values: [] };
  try {
    const html = await (await fetch('index.html', { cache: 'no-store' })).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const plain = (h) => { const d = document.createElement('div'); d.innerHTML = String(h).replace(/<br\s*\/?>/gi, '\n'); return d.textContent.replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' ').trim(); };
    doc.querySelectorAll('[data-cms]').forEach((el) => { defaults[el.dataset.cms] = { en: plain(el.innerHTML), bn: plain(el.dataset.bn || '') }; });
    defaults.values = [...doc.querySelectorAll('#about-values > li')].map((li) => {
      const h = li.querySelector('h3'); const p = li.querySelector('p');
      return { icon: li.querySelector('[data-lucide]')?.dataset.lucide || 'sparkles', title: { en: plain(h.innerHTML), bn: plain(h.dataset.bn || '') }, text: { en: plain(p.innerHTML), bn: plain(p.dataset.bn || '') } };
    });
    // Menus as they are on the website: the phone menu has every item, the desktop bar a few less
    const item = (a, show) => { const s = a.querySelector('span') || a; return { label: { en: plain(s.innerHTML), bn: plain(s.dataset.bn || '') }, href: a.getAttribute('href'), show }; };
    const desk = new Set([...doc.querySelectorAll('nav[aria-label="Main"] a')].map((a) => a.getAttribute('href')));
    defaults.menu = {
      main: [...doc.querySelectorAll('#mobile-nav ul a')].map((a) => item(a, desk.has(a.getAttribute('href')) ? 'all' : 'phone')),
      footer1: [...doc.querySelectorAll('nav[aria-label="Footer: club"] a')].map((a) => item(a, 'all')),
      footer2: [...doc.querySelectorAll('nav[aria-label="Footer: services and members"] a')].map((a) => item(a, 'all')),
    };
  } catch { /* offline: fields start empty */ }
  return defaults;
}

/* Notices: everything the CMS knows about, with its website status */
const NOTICE_FIELDS = ['title', 'titleBn', 'body', 'bodyBn', 'more', 'moreBn', 'tag', 'tagBn', 'pinned'];
const pick = (n) => Object.fromEntries(NOTICE_FIELDS.map((k) => [k, n[k] ?? (k === 'pinned' ? false : '')]));
function noticeEntries() {
  const c = siteContent.get(); const w = ws.get();
  const hidden = new Set(c.notices?.hidden || []); const edited = c.notices?.edited || {};
  const live = [...(c.notices?.added || []).map((n) => ({ ...n, mine: true })), ...BASE_NOTICES.map((n) => ({ ...n, ...(edited[n.id] || {}) }))]
    .map((n) => ({ ...n, status: hidden.has(n.id) ? 'hidden' : 'published' }));
  const fresh = Object.entries(w.drafts).filter(([k, d]) => k.startsWith('notice:') && d.data?.isNew && !live.some((n) => `notice:${n.id}` === k))
    .map(([k, d]) => ({ ...d.data, id: k.slice(7), mine: true, status: 'draft' }));
  return [...fresh, ...live].map((n) => ({ ...n, hasDraft: !!w.drafts[`notice:${n.id}`] }))
    .sort((a, b) => (a.status === 'draft' ? -1 : 0) - (b.status === 'draft' ? -1 : 0) || (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.iso).localeCompare(String(a.iso)));
}

/* Custom pages: written here, shown on the website at #page/<slug> */
const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const menuOf = (c) => clone(c.menu || defaults.menu);
function customEntries() {
  const c = siteContent.get(); const w = ws.get();
  const live = (c.pages || []).map((p) => ({ ...p, status: p.hidden ? 'hidden' : 'published' }));
  const fresh = Object.entries(w.drafts).filter(([k, d]) => k.startsWith('cpage:') && d.data?.isNew && !live.some((p) => `cpage:${p.id}` === k))
    .map(([, d]) => ({ ...d.data, status: 'draft' }));
  const inMenu = new Set(Object.values(menuOf(c)).flat().map((i) => i.href));
  return [...fresh, ...live].map((p) => ({ ...p, hasDraft: !!w.drafts[`cpage:${p.id}`], menu: inMenu.has(`#page/${p.slug}`) }));
}
const blankBlock = (type) => ({
  text: { type, heading: { en: '', bn: '' }, body: { en: '', bn: '' } },
  image: { type, url: '', caption: { en: '', bn: '' } },
  button: { type, label: { en: '', bn: '' }, href: '#join' },
  faq: { type, q: { en: '', bn: '' }, a: { en: '', bn: '' } },
  note: { type, text: { en: '', bn: '' } },
}[type]);
const BLOCKS = [['text', 'text', 'Text', 'লেখা'], ['image', 'image', 'Photo', 'ছবি'], ['button', 'mouse-pointer-click', 'Button', 'বোতাম'], ['faq', 'circle-help', 'Question & answer', 'প্রশ্ন ও উত্তর'], ['note', 'info', 'Highlight', 'জরুরি কথা']];
/** Where a menu item or button can point: the website's pages, the committee's own pages, and the logins. */
function linkTargets() {
  return [...SEO_PAGES.map(([id, en, bn]) => [id === 'home' ? '#home' : `#${id}`, L(en, bn)]), ['#panjika', L('Panjika', 'পঞ্জিকা')], ['#privacy', L('Privacy & terms', 'গোপনীয়তা ও শর্ত')],
    ...customEntries().filter((p) => p.status === 'published').map((p) => [`#page/${p.slug}`, L(p.title.en, p.title.bn || p.title.en)]),
    ['login.html', L('Member login', 'সদস্য লগইন')], ['admin-login.html', L('Committee login', 'কমিটি লগইন')]];
}

/** The published version of an entry, in the editor's shape. */
function published(key) {
  const c = siteContent.get();
  if (key === 'menu') return menuOf(c);
  if (key.startsWith('cpage:')) {
    const p = (c.pages || []).find((x) => `cpage:${x.id}` === key);
    if (!p) return null;
    const { hidden, ...rest } = p;
    return { ...clone(rest), inMenu: menuOf(c).main.some((i) => i.href === `#page/${p.slug}`), slugAuto: false, isNew: false };
  }
  if (key.startsWith('page:')) {
    const p = PAGES[key.slice(5)];
    const text = {};
    p.sections.forEach((s) => s.fields?.forEach(([k]) => { text[k] = { ...(defaults[k] || { en: '', bn: '' }), ...(c.text?.[k] || {}) }; }));
    const d = { text };
    if (p.sections.some((s) => s.repeat === 'values')) d.values = clone(c.values || defaults.values);
    if (p.sections.some((s) => s.image)) d.photo = c.photos?.group || '';
    return d;
  }
  if (key === 'committee') return { list: clone(c.committee || BASE_COMMITTEE) };
  if (key === 'seo') {
    const s = c.seo || {};
    const pages = Object.fromEntries(SEO_PAGES.map(([id, , , te, tb, de, db]) => [id, { title: { en: s.pages?.[id]?.title?.en || te, bn: s.pages?.[id]?.title?.bn || tb }, desc: { en: s.pages?.[id]?.desc?.en || de, bn: s.pages?.[id]?.desc?.bn || db } }]));
    return { pages, image: s.image || '', index: s.index !== false, social: { facebook: '', instagram: '', youtube: '', ...(s.social || {}) } };
  }
  const n = noticeEntries().find((x) => `notice:${x.id}` === key);
  return n ? { ...pick(n), date: n.date, dateBn: n.dateBn, iso: n.iso, isNew: n.status === 'draft' } : null;
}

/** Content with one entry's data applied: used to publish, and to build the live preview. */
function withEntry(content, key, data) {
  const c = clone(content) || {};
  if (key === 'menu') {
    c.menu = same(data, defaults.menu) ? null : data;
  } else if (key.startsWith('cpage:')) {
    const { inMenu, slugAuto, isNew, ...page } = data;
    const old = (c.pages || []).find((p) => p.id === page.id);
    c.pages = old ? c.pages.map((p) => (p.id === page.id ? { ...page, hidden: false } : p)) : [...(c.pages || []), { ...page, hidden: false }];
    const href = `#page/${page.slug}`; const oldHref = old && `#page/${old.slug}`;
    const menu = menuOf(c);
    if (oldHref && oldHref !== href) Object.values(menu).forEach((list) => list.forEach((i) => { if (i.href === oldHref) i.href = href; }));
    const has = menu.main.some((i) => i.href === href);
    if (inMenu && !has) menu.main.push({ label: clone(page.title), href, show: 'all' });
    if (!inMenu && has) menu.main = menu.main.filter((i) => i.href !== href);
    c.menu = same(menu, defaults.menu) ? null : menu;
  } else if (key.startsWith('page:')) {
    c.text = { ...(c.text || {}) };
    Object.entries(data.text).forEach(([k, v]) => { const d = defaults[k] || {}; if (v.en === (d.en || '') && v.bn === (d.bn || '')) delete c.text[k]; else c.text[k] = { en: v.en || d.en, bn: v.bn || d.bn }; });
    if ('values' in data) c.values = same(data.values, defaults.values) ? null : data.values;
    if ('photo' in data) c.photos = { ...(c.photos || {}), group: data.photo || '' };
  } else if (key === 'seo') {
    const pages = {};
    SEO_PAGES.forEach(([id, , , te, tb, de, db]) => { const p = data.pages[id]; const o = {}; if (p.title.en !== te || p.title.bn !== tb) o.title = p.title; if (p.desc.en !== de || p.desc.bn !== db) o.desc = p.desc; if (Object.keys(o).length) pages[id] = o; });
    c.seo = { pages, image: data.image || '', index: data.index, social: data.social };
  } else if (key === 'committee') {
    c.committee = same(data.list, BASE_COMMITTEE) ? null : data.list;
  } else {
    const id = key.slice(7);
    const n = { hidden: [], added: [], edited: {}, ...(c.notices || {}) };
    n.hidden = n.hidden.filter((x) => x !== id);
    const fields = pick(data);
    if (BASE_NOTICES.some((b) => b.id === id)) {
      const base = pick(BASE_NOTICES.find((b) => b.id === id));
      n.edited = { ...n.edited }; if (same(fields, base)) delete n.edited[id]; else n.edited[id] = fields;
    } else {
      const row = { id, date: data.date, dateBn: data.dateBn, iso: data.iso, ...fields };
      n.added = n.added.some((a) => a.id === id) ? n.added.map((a) => (a.id === id ? { ...a, ...row } : a)) : [row, ...n.added];
    }
    c.notices = n;
  }
  return c;
}

/* ---------- Small UI pieces ---------- */
const chip = (cls, en, bn, icon = '') => `<span class="chip h-6 px-2 text-[12px] whitespace-nowrap ${cls}">${icon ? `<i data-lucide="${icon}" class="w-3.5 h-3.5"></i>` : ''}${t(en, bn)}</span>`;
const STATUS = {
  published: () => chip('bg-tulsi-wash text-tulsi', 'Published', 'প্রকাশিত', 'circle-check'),
  draft: () => chip('bg-marigold-wash text-turmeric', 'Draft', 'খসড়া', 'pencil'),
  hidden: () => chip('bg-paper-2 text-ink-2', 'Unpublished', 'অপ্রকাশিত', 'eye-off'),
  changes: () => chip('bg-marigold-wash text-turmeric', 'Unpublished changes', 'অপ্রকাশিত বদল', 'pencil'),
};
const fmtWhen = (at) => { if (!at) return ['', '']; const d = new Date(at); const day = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); const hm = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }); return [`${day}, ${hm}`, bnD(`${day}, ${hm}`)]; };
const metaLine = (key) => { const m = ws.get().meta[key]; if (!m) return t('Original text', 'আসল লেখা'); const [en, bn] = fmtWhen(m.at); return t(`${en} · ${m.by[0]}`, `${bn} · ${m.by[1]}`); };
const todayParts = () => { const d = new Date(); const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]; const mBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'][d.getMonth()]; return { date: `${String(d.getDate()).padStart(2, '0')} ${m}`, dateBn: `${bnD(d.getDate())} ${mBn}`, iso: d.toISOString().slice(0, 10) }; };

function confirmBox(titleEn, titleBn, textEn, textBn, goEn, goBn, onGo, { danger = false } = {}) {
  document.querySelector('[data-cms-confirm]')?.remove();
  const box = document.createElement('div');
  box.dataset.cmsConfirm = '';
  box.className = 'fixed inset-0 z-[80] grid place-items-center bg-black/40 p-4';
  box.innerHTML = `<div role="alertdialog" aria-modal="true" class="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
    <h2 class="font-display text-[1.45rem] leading-tight">${t(titleEn, titleBn)}</h2>
    <p class="mt-2 text-[15px] text-ink-2">${t(textEn, textBn)}</p>
    <div class="mt-5 grid grid-cols-2 gap-2"><button type="button" class="btn btn-line" data-no>${t('Cancel', 'বাতিল')}</button>
      <button type="button" class="btn ${danger ? 'btn-ink' : 'btn-primary'}" data-yes>${t(goEn, goBn)}</button></div></div>`;
  document.body.append(box);
  C.paint(box, box.innerHTML);
  const close = () => { box.remove(); removeEventListener('keydown', esc1); };
  const esc1 = (e) => { if (e.key === 'Escape') close(); };
  addEventListener('keydown', esc1);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  box.querySelector('[data-no]').addEventListener('click', close);
  box.querySelector('[data-yes]').addEventListener('click', () => { close(); onGo(); });
  box.querySelector('[data-yes]').focus();
}

/* ---------- Lists ---------- */
function sideNav() {
  const w = ws.get(); const drafts = Object.keys(w.drafts);
  const count = { pages: Object.keys(PAGES).length + customEntries().length, menu: menuOf(siteContent.get()).main.length, notices: noticeEntries().length, committee: (siteContent.get().committee || BASE_COMMITTEE).length, media: mediaItems().length, seo: SEO_PAGES.length };
  const dot = { pages: drafts.some((k) => k.startsWith('page:') || k.startsWith('cpage:')), menu: drafts.includes('menu'), notices: drafts.some((k) => k.startsWith('notice:')), committee: drafts.includes('committee'), seo: drafts.includes('seo') };
  return `<nav class="paper-card p-2 lg:sticky lg:top-20" aria-label="${L('Content types', 'কনটেন্টের ধরন')}">
    <p class="px-3 pt-2 pb-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-ink-3">${t('Content', 'কনটেন্ট')}</p>
    <ul class="flex lg:block gap-1 overflow-x-auto">${TYPES.map(([k, icon, en, bn]) => `<li><button type="button" data-cms-type="${k}" ${view.type === k ? 'aria-current="page"' : ''}
      class="w-full flex items-center gap-2.5 rounded-lg px-3 h-10 text-[14.5px] whitespace-nowrap hover:bg-paper-2 aria-[current=page]:bg-ink aria-[current=page]:text-paper">
      <i data-lucide="${icon}" class="w-4 h-4"></i><span class="font-semibold">${t(en, bn)}</span>
      ${dot[k] ? `<span class="w-2 h-2 rounded-full bg-marigold" title="${L('Has drafts', 'খসড়া আছে')}"></span>` : ''}
      <span class="ml-auto text-[12.5px] num opacity-70">${lang === 'bn' ? bnD(count[k]) : count[k]}</span></button></li>`).join('')}</ul>
    <div class="hidden lg:block mt-2 border-t border-rule px-3 py-3 text-[12.5px] text-ink-3 leading-snug">
      <p class="flex items-center gap-1.5 font-semibold text-ink-2"><i data-lucide="circle-help" class="w-3.5 h-3.5"></i>${t('How it works', 'কীভাবে কাজ করে')}</p>
      <p class="mt-1">${t('Save draft keeps your work private. Publish puts it on the website. Every publish can be undone from History.', 'খসড়া সেভ শুধু আপনার কাছে থাকে। প্রকাশ চাপলে ওয়েবসাইটে যায়। প্রতিটি প্রকাশ ইতিহাস থেকে ফেরানো যায়।')}</p></div>
  </nav>`;
}

const listHead = (en, bn, subEn, subBn, actions = '') => `<div class="px-5 pt-4 pb-3 border-b border-rule flex flex-wrap items-center gap-3">
  <div class="min-w-0"><h2 class="font-display text-xl">${t(en, bn)}</h2><p class="text-sm text-ink-3">${t(subEn, subBn)}</p></div>
  <div class="ml-auto flex flex-wrap gap-2">${actions}</div></div>`;

function pagesList() {
  const w = ws.get();
  return `<div class="paper-card overflow-hidden">${listHead('Pages', 'পাতা', 'The fixed pages of the website. Open one to edit its sections.', 'ওয়েবসাইটের স্থায়ী পাতা। খুলে প্রতিটি অংশ বদলান।')}
    <table class="w-full text-left text-[14.5px]"><thead class="text-[12px] uppercase tracking-wide text-ink-3 bg-paper-2"><tr>
      <th class="px-5 py-2 font-semibold">${t('Page', 'পাতা')}</th><th class="px-3 py-2 font-semibold hidden sm:table-cell">${t('Sections', 'অংশ')}</th><th class="px-3 py-2 font-semibold">${t('Status', 'অবস্থা')}</th><th class="px-5 py-2 font-semibold hidden md:table-cell">${t('Last published', 'শেষ প্রকাশ')}</th></tr></thead>
    <tbody class="divide-y divide-rule">${Object.entries(PAGES).map(([id, p]) => `<tr class="hover:bg-paper-2 cursor-pointer" data-open="page:${id}" tabindex="0">
      <td class="px-5 py-3.5"><span class="flex items-center gap-2.5 font-semibold"><i data-lucide="${p.icon}" class="w-4 h-4 text-ink-3"></i>${t(p.en, p.bn)}</span></td>
      <td class="px-3 py-3.5 text-ink-2 hidden sm:table-cell">${p.sections.map((s) => L(s.en, s.bn)).join(' · ')}</td>
      <td class="px-3 py-3.5">${w.drafts[`page:${id}`] ? STATUS.changes() : STATUS.published()}</td>
      <td class="px-5 py-3.5 text-ink-3 text-[13.5px] hidden md:table-cell">${metaLine(`page:${id}`)}</td></tr>`).join('')}</tbody></table></div>
  ${customList()}`;
}

function customList() {
  const rows = customEntries();
  return `<div class="paper-card overflow-hidden mt-5">${listHead('Your pages', 'আপনার পাতা', 'Pages the committee writes: a camp, a scholarship, puja rules. Each one gets its own link and can go in the menu.', 'কমিটির লেখা পাতা: শিবির, বৃত্তি, পূজার নিয়ম। প্রতিটির নিজের লিঙ্ক, মেনুতেও রাখা যায়।',
    `<button class="btn btn-primary btn-sm" data-new-page><i data-lucide="file-plus"></i>${t('New page', 'নতুন পাতা')}</button>`)}
    ${rows.length ? `<table class="w-full text-left text-[14.5px]"><thead class="text-[12px] uppercase tracking-wide text-ink-3 bg-paper-2"><tr>
      <th class="px-5 py-2 font-semibold">${t('Page', 'পাতা')}</th><th class="px-3 py-2 font-semibold hidden sm:table-cell">${t('Link', 'লিঙ্ক')}</th><th class="px-3 py-2 font-semibold">${t('Status', 'অবস্থা')}</th><th class="px-5 py-2 font-semibold hidden md:table-cell">${t('Last published', 'শেষ প্রকাশ')}</th></tr></thead>
    <tbody class="divide-y divide-rule">${rows.map((p) => `<tr class="hover:bg-paper-2 cursor-pointer" data-open="cpage:${esc(p.id)}" tabindex="0">
      <td class="px-5 py-3.5"><span class="flex items-center gap-2.5 font-semibold"><i data-lucide="file-text" class="w-4 h-4 text-ink-3"></i>${t(esc(p.title.en) || 'Untitled page', esc(p.title.bn || p.title.en) || 'শিরোনাম নেই')}</span>
        ${p.menu ? `<span class="mt-1 inline-flex">${chip('bg-paper-2 text-ink-2', 'In the menu', 'মেনুতে আছে', 'menu')}</span>` : ''}</td>
      <td class="px-3 py-3.5 text-ink-3 text-[13.5px] num hidden sm:table-cell">${p.slug ? `#page/${esc(p.slug)}` : '—'}</td>
      <td class="px-3 py-3.5"><div class="flex flex-wrap gap-1">${STATUS[p.status]()}${p.hasDraft && p.status !== 'draft' ? STATUS.changes() : ''}</div></td>
      <td class="px-5 py-3.5 text-ink-3 text-[13.5px] hidden md:table-cell">${p.status === 'draft' ? t('Not yet', 'এখনও নয়') : metaLine(`cpage:${p.id}`)}</td></tr>`).join('')}</tbody></table>`
    : `<div class="px-5 py-10 text-center"><i data-lucide="file-plus" class="w-8 h-8 mx-auto text-ink-3"></i><p class="mt-2 font-semibold">${t('No pages of your own yet', 'এখনও নিজের কোনো পাতা নেই')}</p>
      <p class="text-[14px] text-ink-3 max-w-[46ch] mx-auto">${t('Make one for anything that needs more than a notice: the blood camp, a scholarship, the rules for the puja.', 'নোটিসের চেয়ে বেশি কিছু লাগলে পাতা বানান: রক্তদান শিবির, বৃত্তি, পূজার নিয়ম।')}</p></div>`}
  </div>`;
}

function noticesList() {
  const rows = noticeEntries();
  const n = (s) => rows.filter((r) => !s || r.status === s).length;
  const filt = [['', 'All', 'সব'], ['published', 'Published', 'প্রকাশিত'], ['draft', 'Drafts', 'খসড়া'], ['hidden', 'Unpublished', 'অপ্রকাশিত']];
  return `<div class="paper-card overflow-hidden">${listHead('Notices', 'নোটিস', 'Shown on the home page and the Notices page, pinned first.', 'হোম পাতা ও নোটিস পাতায় দেখায়, পিন করা আগে।',
    `<button class="btn btn-primary btn-sm" data-new-notice><i data-lucide="plus"></i>${t('New notice', 'নতুন নোটিস')}</button>`)}
    <div class="px-5 py-3 border-b border-rule flex flex-wrap items-center gap-2">
      <label class="relative flex-1 min-w-[200px]"><i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"></i>
        <input class="field pl-9 h-10" type="search" data-cms-search placeholder="${L('Search notices', 'নোটিস খুঁজুন')}" aria-label="${L('Search notices', 'নোটিস খুঁজুন')}" /></label>
      <div class="flex gap-1.5" role="group">${filt.map(([k, en, bn], i) => `<button type="button" data-cms-filter="${k}" aria-pressed="${i === 0}" class="chip h-9 px-3 text-[13.5px] border border-rule bg-card aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink">${t(en, bn)} <span class="num opacity-70">${lang === 'bn' ? bnD(n(k)) : n(k)}</span></button>`).join('')}</div>
    </div>
    <table class="w-full text-left text-[14.5px]"><thead class="text-[12px] uppercase tracking-wide text-ink-3 bg-paper-2"><tr>
      <th class="px-5 py-2 font-semibold">${t('Title', 'শিরোনাম')}</th><th class="px-3 py-2 font-semibold hidden md:table-cell">${t('Kind', 'ধরন')}</th><th class="px-3 py-2 font-semibold">${t('Status', 'অবস্থা')}</th><th class="px-5 py-2 font-semibold hidden sm:table-cell">${t('Date', 'তারিখ')}</th></tr></thead>
    <tbody class="divide-y divide-rule">${rows.map((r) => `<tr class="hover:bg-paper-2 cursor-pointer" data-open="notice:${esc(r.id)}" data-status="${r.status}" data-q="${esc(`${r.title} ${r.titleBn} ${r.body} ${r.tag}`.toLowerCase())}" tabindex="0">
      <td class="px-5 py-3"><p class="font-semibold leading-snug flex items-center gap-1.5">${r.pinned ? `<i data-lucide="pin" class="w-3.5 h-3.5 text-sindoor shrink-0" aria-label="${L('Pinned', 'পিন করা')}"></i>` : ''}${t(esc(r.title) || L('Untitled', 'শিরোনাম নেই'), esc(r.titleBn || r.title) || 'শিরোনাম নেই')}</p>
        <p class="text-[13px] text-ink-3 line-clamp-1">${t(esc(r.body), esc(r.bodyBn || r.body))}</p></td>
      <td class="px-3 py-3 hidden md:table-cell"><span class="text-[12.5px] font-bold uppercase tracking-wide text-sindoor-deep">${t(r.tag || '', r.tagBn || r.tag || '')}</span></td>
      <td class="px-3 py-3"><div class="flex flex-wrap gap-1">${STATUS[r.status]()}${r.hasDraft && r.status !== 'draft' ? STATUS.changes() : ''}</div></td>
      <td class="px-5 py-3 text-ink-3 text-[13.5px] num hidden sm:table-cell">${t(r.date || '', r.dateBn || bnD(r.date || ''))}</td></tr>`).join('')}</tbody></table>
    <p data-cms-empty class="hidden px-5 py-8 text-center text-ink-3">${t('No notices match.', 'কোনো নোটিস মেলেনি।')}</p></div>`;
}

function mediaItems() {
  const own = (siteContent.get().media || []).map((m) => ({ ...m, own: true, full: m.url }));
  const samples = Object.entries(PHOTOS).map(([id, p]) => ({ id, url: p.src(800), full: p.src(2000), alt: p.alt, altBn: p.altBn, by: p.by, own: false }));
  return [...own, ...samples];
}
function mediaList() {
  const used = siteContent.get().photos?.group || PHOTOS.group.src(2000);
  return `<div class="paper-card overflow-hidden">${listHead('Media', 'ছবি', 'Photos the website can use. Club photos first, then the sample photos.', 'ওয়েবসাইটে ব্যবহারযোগ্য ছবি। আগে ক্লাবের ছবি, তারপর নমুনা ছবি।',
    `<button class="btn btn-primary btn-sm" data-add-media><i data-lucide="image-plus"></i>${t('Add photo', 'ছবি যোগ')}</button>`)}
    <ul class="p-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">${mediaItems().map((m) => `<li class="group">
      <div class="relative aspect-[4/3] rounded-xl overflow-hidden bg-paper-2"><img src="${esc(m.url)}" alt="${esc(L(m.alt, m.altBn || m.alt))}" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
        ${m.full === used ? `<span class="absolute left-2 top-2 chip h-6 px-2 text-[11.5px] bg-ink text-paper">${t('On About page', 'আমাদের কথা পাতায়')}</span>` : ''}
        ${m.own ? `<button type="button" data-del-media="${esc(m.id)}" class="absolute right-2 top-2 w-8 h-8 grid place-items-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="${L('Remove photo', 'ছবি সরান')}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}</div>
      <p class="mt-1.5 text-[13px] leading-snug line-clamp-2">${t(esc(m.alt), esc(m.altBn || m.alt))}</p>
      <p class="text-[12px] text-ink-3">${m.own ? t('Club photo', 'ক্লাবের ছবি') : t(`Sample · ${esc(m.by)}`, `নমুনা · ${esc(m.by)}`)}</p></li>`).join('')}</ul></div>`;
}

/* ---------- Editor ---------- */
function openEntry(key) {
  const w = ws.get();
  const pub = published(key);
  const draft = w.drafts[key];
  state = { key, data: clone(draft?.data ?? pub), saved: JSON.stringify(draft?.data ?? pub), pub, draftAt: draft?.at };
  view.entry = key;
}

function biField(name, label, v, long) {
  const box = (l) => (long
    ? `<textarea class="field min-h-[96px]" rows="3" name="${name}|${l}" ${l === 'bn' ? 'lang="bn"' : ''}>${esc(v?.[l])}</textarea>`
    : `<input class="field" name="${name}|${l}" value="${esc(v?.[l])}" ${l === 'bn' ? 'lang="bn"' : ''} />`);
  return `<div class="cms-field" data-bi>
    <p class="text-[13.5px] font-semibold mb-1.5">${label}</p>
    <div class="cms-langs grid gap-3">
      <label class="block" data-l="en"><span class="cms-lang">English</span>${box('en')}</label>
      <label class="block" data-l="bn"><span class="cms-lang">বাংলা</span>${box('bn')}</label>
    </div></div>`;
}

function sectionCard(s, body, i, extra = '') {
  const isOpen = view.open[`${state.key}:${s.id}`] ?? !s.closed;
  return `<details class="paper-card cms-section" data-sec="${s.id}" ${isOpen ? 'open' : ''}>
    <summary class="px-5 py-3.5 flex items-center gap-3 cursor-pointer select-none list-none">
      <span class="w-7 h-7 rounded-full bg-paper-2 grid place-items-center text-[12.5px] font-bold num">${lang === 'bn' ? bnD(i + 1) : i + 1}</span>
      <span class="min-w-0"><span class="block font-display text-lg leading-tight">${t(s.en, s.bn)}</span>${s.hintEn ? `<span class="block text-[13px] text-ink-3">${t(s.hintEn, s.hintBn)}</span>` : ''}</span>
      ${extra}<i data-lucide="chevron-down" class="cms-chev ml-auto w-5 h-5 text-ink-3 transition-transform"></i></summary>
    <div class="px-5 pb-5 pt-1 space-y-5 border-t border-rule">${body}</div></details>`;
}

function rowCard(kind, i, n, titleHtml, body) {
  return `<li class="rounded-xl border border-rule bg-card" data-row="${i}">
    <div class="flex items-center gap-2 px-3 py-2 border-b border-rule bg-paper-2/60 rounded-t-xl">
      <i data-lucide="grip-vertical" class="w-4 h-4 text-ink-3"></i><span class="text-[13.5px] font-semibold truncate">${titleHtml}</span>
      <span class="ml-auto flex gap-0.5">
        <button type="button" class="btn btn-ghost btn-sm !px-2" data-row-move="${kind}|${i}|-1" ${i === 0 ? 'disabled' : ''} aria-label="${L('Move up', 'উপরে')}"><i data-lucide="arrow-up"></i></button>
        <button type="button" class="btn btn-ghost btn-sm !px-2" data-row-move="${kind}|${i}|1" ${i === n - 1 ? 'disabled' : ''} aria-label="${L('Move down', 'নিচে')}"><i data-lucide="arrow-down"></i></button>
        <button type="button" class="btn btn-ghost btn-sm !px-2" data-row-del="${kind}|${i}" aria-label="${L('Remove', 'সরান')}"><i data-lucide="trash-2"></i></button></span></div>
    <div class="p-3.5 space-y-4">${body}</div></li>`;
}

function editorFields() {
  const { key, data } = state;
  if (key.startsWith('page:')) {
    const p = PAGES[key.slice(5)];
    return p.sections.map((s, i) => {
      let body = (s.fields || []).map(([k, en, bn, long]) => biField(`t:${k}`, t(en, bn), data.text[k], long)).join('');
      if (s.repeat === 'values') {
        body += `<ol class="space-y-3" data-rep="values">${data.values.map((v, j) => rowCard('values', j, data.values.length, t(esc(v.title.en) || `Value ${j + 1}`, esc(v.title.bn || v.title.en) || `মূল্যবোধ ${bnD(j + 1)}`), `
          <div><p class="text-[13.5px] font-semibold mb-1.5">${t('Icon', 'আইকন')}</p>
            <div class="flex flex-wrap gap-1.5">${ICONS.map((ic) => `<label class="w-9 h-9 grid place-items-center rounded-lg border border-rule cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-paper has-[:checked]:border-ink" title="${ic}"><input type="radio" class="sr-only" name="v${j}:icon" value="${ic}" ${v.icon === ic ? 'checked' : ''} /><i data-lucide="${ic}" class="w-4 h-4"></i></label>`).join('')}</div></div>
          ${biField(`v${j}:title`, t('Title', 'শিরোনাম'), v.title)}${biField(`v${j}:text`, t('One line', 'এক লাইন'), v.text, true)}`)).join('')}</ol>
          <button type="button" class="btn btn-line btn-sm" data-row-add="values"><i data-lucide="plus"></i>${t('Add a value', 'মূল্যবোধ যোগ')}</button>`;
      }
      if (s.image) {
        const url = data.photo || PHOTOS.group.src(1000);
        body = `<div class="grid sm:grid-cols-[220px_1fr] gap-4 items-start">
          <div class="relative aspect-[4/3] rounded-xl overflow-hidden bg-paper-2"><img src="${esc(url)}" alt="" class="absolute inset-0 w-full h-full object-cover" />
            <span class="absolute left-2 top-2 chip h-6 px-2 text-[11.5px] bg-black/65 text-white">${data.photo ? t('Chosen photo', 'বাছা ছবি') : t('Sample photo', 'নমুনা ছবি')}</span></div>
          <div><p class="text-[13.5px] font-semibold">${t('Photo', 'ছবি')}</p><p class="text-[13px] text-ink-3">${t('A wide (landscape) photo of the members works best.', 'সদস্যদের চওড়া (আড়াআড়ি) ছবি সবচেয়ে ভালো।')}</p>
            <input type="hidden" name="photo" value="${esc(data.photo)}" />
            <div class="mt-2 flex flex-wrap gap-2"><button type="button" class="btn btn-line btn-sm" data-pick-photo="photo"><i data-lucide="images"></i>${t('Choose from Media', 'ছবি থেকে বাছুন')}</button>
            ${data.photo ? `<button type="button" class="btn btn-ghost btn-sm" data-clear-photo="photo"><i data-lucide="rotate-ccw"></i>${t('Use the sample', 'নমুনা ছবি')}</button>` : ''}</div></div></div>${body}`;
      }
      return sectionCard(s, body, i);
    }).join('') + `<div class="paper-card px-5 py-4 flex flex-wrap items-center gap-3"><i data-lucide="search" class="w-5 h-5 text-ink-3"></i>
      <div class="min-w-0"><p class="font-semibold">${t('Search & sharing', 'সার্চ ও শেয়ার')}</p><p class="text-[13px] text-ink-3">${t('The title and description Google and WhatsApp show for this page.', 'এই পাতার জন্য গুগল ও হোয়াটসঅ্যাপে যে শিরোনাম ও বিবরণ দেখায়।')}</p></div>
      <button type="button" class="btn btn-line btn-sm ml-auto" data-open-seo><i data-lucide="arrow-right"></i>${t('Edit in SEO', 'এসইও-তে বদলান')}</button></div>`;
  }
  const links = `<datalist id="cms-links">${linkTargets().map(([h, label]) => `<option value="${esc(h)}">${esc(label)}</option>`).join('')}</datalist>`;
  const linkField = (name, val, hintEn = 'Pick a page, or paste a web link that starts with https://', hintBn = 'একটি পাতা বাছুন, বা https:// দিয়ে শুরু লিঙ্ক দিন') => `<label class="block"><span class="text-[13.5px] font-semibold">${t('Goes to', 'কোথায় যাবে')}</span>
    <input class="field num" name="${name}" list="cms-links" value="${esc(val)}" placeholder="#events" /><span class="block text-[12.5px] text-ink-3 mt-1">${t(hintEn, hintBn)}</span></label>`;
  if (key === 'menu') {
    const SHOW = { main: [['all', 'Everywhere', 'সব জায়গায়'], ['phone', 'Phone menu only', 'শুধু ফোনের মেনুতে'], ['hidden', 'Hidden', 'লুকোনো']], footer: [['all', 'Shown', 'দেখানো'], ['hidden', 'Hidden', 'লুকোনো']] };
    const lists = [['main', 'Main menu', 'মূল মেনু', 'The bar at the top of every page; on a phone it opens from ☰. Keep names short: the bar cuts them after 16 letters, and 8 or fewer links fit best.', 'প্রতিটি পাতার উপরের বার; ফোনে ☰ থেকে খোলে। নাম ছোট রাখুন: ১৬ অক্ষরের পরে কেটে যায়, ৮টির কম লিঙ্ক সবচেয়ে ভালো।'],
      ['footer1', 'Footer: Club', 'ফুটার: ক্লাব', 'First list of links at the bottom of every page.', 'প্রতিটি পাতার নিচের প্রথম লিঙ্কের তালিকা।'],
      ['footer2', 'Footer: Services', 'ফুটার: পরিষেবা', 'Second list of links at the bottom.', 'নিচের দ্বিতীয় লিঙ্কের তালিকা।']];
    return links + lists.map(([k, en, bn, hEn, hBn], i) => sectionCard({ id: k, en, bn, hintEn: hEn, hintBn: hBn }, `
      <ol class="space-y-3" data-rep="${k}">${data[k].map((it, j) => rowCard(k, j, data[k].length,
        `${t(esc(it.label.en) || 'New item', esc(it.label.bn || it.label.en) || 'নতুন')} <span class="font-normal text-ink-3 num">· ${esc(it.href)}</span>${it.show === 'hidden' ? ` ${chip('bg-paper-2 text-ink-2', 'Hidden', 'লুকোনো', 'eye-off')}` : it.show === 'phone' ? ` ${chip('bg-paper-2 text-ink-2', 'Phone only', 'শুধু ফোন', 'smartphone')}` : ''}`, `
        ${biField(`${k}${j}:label`, t('Label', 'নাম'), it.label)}
        <div class="grid sm:grid-cols-[1fr_200px] gap-3 items-start">${linkField(`${k}${j}:href`, it.href)}
          <label class="block"><span class="text-[13.5px] font-semibold">${t('Show', 'দেখাবে')}</span><select class="field" name="${k}${j}:show">${SHOW[k === 'main' ? 'main' : 'footer'].map(([v, e, b]) => `<option value="${v}" ${it.show === v ? 'selected' : ''}>${L(e, b)}</option>`).join('')}</select></label></div>`)).join('')}</ol>
      <button type="button" class="btn btn-line btn-sm" data-row-add="${k}"><i data-lucide="plus"></i>${t('Add a link', 'লিঙ্ক যোগ')}</button>`, i)).join('')
      + `<p class="text-[13px] text-ink-3 px-1">${t('Removing a link only takes it out of the menu. The page itself stays.', 'লিঙ্ক সরালে শুধু মেনু থেকে সরে, পাতাটি থাকে।')}</p>`;
  }
  if (key.startsWith('cpage:')) {
    const blockBody = (b, j) => {
      if (b.type === 'text') return biField(`b${j}:heading`, t('Heading (optional)', 'শিরোনাম (ঐচ্ছিক)'), b.heading) + biField(`b${j}:body`, t('Text · leave an empty line for a new paragraph', 'লেখা · নতুন অনুচ্ছেদের জন্য একটি ফাঁকা লাইন'), b.body, true);
      if (b.type === 'image') return `<div class="grid sm:grid-cols-[200px_1fr] gap-3 items-start">
          <div class="relative aspect-[4/3] rounded-lg overflow-hidden bg-paper-2 grid place-items-center">${b.url ? `<img src="${esc(b.url)}" alt="" class="absolute inset-0 w-full h-full object-cover" />` : '<i data-lucide="image" class="w-7 h-7 text-ink-3"></i>'}</div>
          <div><button type="button" class="btn btn-line btn-sm" data-pick-photo="block:${j}"><i data-lucide="images"></i>${t(b.url ? 'Change photo' : 'Choose a photo', b.url ? 'ছবি বদলান' : 'ছবি বাছুন')}</button></div></div>`
        + biField(`b${j}:caption`, t('Caption (optional)', 'ক্যাপশন (ঐচ্ছিক)'), b.caption);
      if (b.type === 'button') return biField(`b${j}:label`, t('Button text', 'বোতামের লেখা'), b.label) + linkField(`b${j}:href`, b.href);
      if (b.type === 'faq') return biField(`b${j}:q`, t('Question', 'প্রশ্ন'), b.q) + biField(`b${j}:a`, t('Answer', 'উত্তর'), b.a, true);
      return biField(`b${j}:text`, t('Text', 'লেখা'), b.text, true);
    };
    const bt = (type) => BLOCKS.find((x) => x[0] === type) || BLOCKS[0];
    return links + [
      sectionCard({ id: 'top', en: 'Page', bn: 'পাতা', hintEn: 'The title and photo at the top of the page.', hintBn: 'পাতার উপরের শিরোনাম ও ছবি।' }, `
        ${biField('cp:title', t('Title', 'শিরোনাম'), data.title)}
        ${biField('cp:intro', t('Short intro under the title (optional)', 'শিরোনামের নিচে ছোট ভূমিকা (ঐচ্ছিক)'), data.intro, true)}
        <label class="block"><span class="text-[13.5px] font-semibold">${t('Link', 'লিঙ্ক')}</span>
          <span class="flex items-stretch"><span class="px-3 grid place-items-center rounded-l-lg border border-r-0 border-rule bg-paper-2 text-[13.5px] text-ink-3 num">gedemaitreeclub.org/#page/</span>
          <input class="field rounded-l-none num" name="cp:slug" value="${esc(data.slug)}" placeholder="blood-camp-2026" pattern="[a-z0-9-]+" /></span>
          <span class="block text-[12.5px] text-ink-3 mt-1">${t('Small English letters, numbers and dashes. Made from the title; changing it later updates the menu.', 'ছোট ইংরেজি অক্ষর, সংখ্যা আর ড্যাশ। শিরোনাম থেকে তৈরি; পরে বদলালে মেনুও বদলাবে।')}</span></label>
        <div class="grid sm:grid-cols-[200px_1fr] gap-3 items-start">
          <div class="relative aspect-[16/9] rounded-lg overflow-hidden bg-ink grid place-items-center">${data.image ? `<img src="${esc(data.image)}" alt="" class="absolute inset-0 w-full h-full object-cover" />` : `<span class="text-[12px] text-white/70">${t('Plain dark banner', 'সাধারণ গাঢ় ব্যানার')}</span>`}</div>
          <div><p class="text-[13.5px] font-semibold">${t('Banner photo (optional)', 'ব্যানারের ছবি (ঐচ্ছিক)')}</p>
            <div class="mt-2 flex flex-wrap gap-2"><button type="button" class="btn btn-line btn-sm" data-pick-photo="image"><i data-lucide="images"></i>${t('Choose from Media', 'ছবি থেকে বাছুন')}</button>
            ${data.image ? `<button type="button" class="btn btn-ghost btn-sm" data-clear-photo="image"><i data-lucide="x"></i>${t('No photo', 'ছবি ছাড়া')}</button>` : ''}</div></div></div>`, 0),
      sectionCard({ id: 'blocks', en: 'Content', bn: 'লেখা ও অংশ', hintEn: 'Build the page from blocks. Move them up or down to change the order.', hintBn: 'অংশ জুড়ে পাতা বানান। উপরে-নিচে সরিয়ে ক্রম বদলান।' }, `
        <ol class="space-y-3" data-rep="blocks">${data.blocks.map((b, j) => { const [, ic, en, bn] = bt(b.type); return rowCard('blocks', j, data.blocks.length, `<span class="inline-flex items-center gap-1.5"><i data-lucide="${ic}" class="w-4 h-4"></i>${t(en, bn)}</span>`, blockBody(b, j)); }).join('')}</ol>
        <div><p class="text-[13px] font-semibold text-ink-3 mb-2">${t('Add a block', 'অংশ যোগ')}</p>
          <div class="flex flex-wrap gap-2">${BLOCKS.map(([type, ic, en, bn]) => `<button type="button" class="btn btn-line btn-sm" data-row-add="blocks" data-block-type="${type}"><i data-lucide="${ic}"></i>${t(en, bn)}</button>`).join('')}</div></div>`, 1),
      sectionCard({ id: 'seo', en: 'Search & sharing', bn: 'সার্চ ও শেয়ার', closed: true }, `
        ${biField('cp:desc', t('Search description · about 150 letters', 'সার্চের বিবরণ · প্রায় ১৫০ অক্ষর'), data.desc, true)}
        <p class="text-[12.5px] text-ink-3">${t('Shown by Google and when the link is shared. If empty, the intro is used.', 'গুগলে আর লিঙ্ক শেয়ারে দেখায়। ফাঁকা থাকলে ভূমিকা দেখাবে।')}</p>`, 2),
    ].join('');
  }
  if (key === 'seo') {
    const img = data.image || DEF_SHARE;
    const settings = sectionCard({ id: 'share', en: 'Sharing and search engines', bn: 'শেয়ার ও সার্চ ইঞ্জিন', hintEn: 'Used by Google, and by WhatsApp and Facebook when someone shares the website.', hintBn: 'গুগল, আর কেউ হোয়াটসঅ্যাপ বা ফেসবুকে ওয়েবসাইট শেয়ার করলে এটা দেখায়।' }, `
      <div class="grid sm:grid-cols-[260px_1fr] gap-4 items-start">
        <div class="relative aspect-[1200/630] rounded-xl overflow-hidden bg-paper-2"><img src="${esc(img)}" alt="" class="absolute inset-0 w-full h-full object-cover" /></div>
        <div><p class="text-[13.5px] font-semibold">${t('Share image', 'শেয়ারের ছবি')}</p><p class="text-[13px] text-ink-3">${t('Shows when the link is shared. Best size 1200 × 630, with no small text.', 'লিঙ্ক শেয়ার করলে দেখায়। সেরা মাপ ১২০০ × ৬৩০, ছোট লেখা ছাড়া।')}</p>
          <div class="mt-2 flex flex-wrap gap-2"><button type="button" class="btn btn-line btn-sm" data-pick-photo="image"><i data-lucide="images"></i>${t('Choose from Media', 'ছবি থেকে বাছুন')}</button>
          ${data.image ? `<button type="button" class="btn btn-ghost btn-sm" data-clear-photo="image"><i data-lucide="rotate-ccw"></i>${t('Use the club card', 'ক্লাবের কার্ড')}</button>` : ''}</div></div></div>
      <label class="flex items-start gap-3 text-[14.5px]"><input type="checkbox" class="switch mt-0.5" name="s:index" ${data.index ? 'checked' : ''} />
        <span><span class="font-semibold">${t('Show the website in Google and other search results', 'গুগল ও অন্য সার্চে ওয়েবসাইট দেখান')}</span>
        <span class="block text-[13px] text-ink-3">${t('Keep this on. Turn it off only while the website is not ready.', 'চালু রাখুন। ওয়েবসাইট তৈরি না হলে তবেই বন্ধ করুন।')}</span></span></label>
      <div><p class="text-[13.5px] font-semibold">${t('Club pages on other sites', 'অন্য সাইটে ক্লাবের পাতা')}</p><p class="text-[13px] text-ink-3 mb-2">${t('Helps Google connect them to the club. Leave blank if you have none.', 'গুগলকে ক্লাবের সাথে মেলাতে সাহায্য করে। না থাকলে ফাঁকা রাখুন।')}</p>
        <div class="grid sm:grid-cols-3 gap-3">${SOCIAL.map(([k, en, bn]) => `<label class="block"><span class="text-[12px] text-ink-3">${t(en, bn)}</span><input class="field" type="url" name="s:${k}" placeholder="https://…" value="${esc(data.social[k])}" /></label>`).join('')}</div></div>`, 0);
    const pages = SEO_PAGES.map(([id, en, bn], i) => sectionCard({ id: `p-${id}`, en, bn, closed: i > 0 }, `
      ${biField(`p:${id}:title`, `${t('Search title', 'সার্চের শিরোনাম')} <span class="font-normal text-ink-3" data-count="${id}:title"></span>`, data.pages[id].title)}
      ${biField(`p:${id}:desc`, `${t('Search description', 'সার্চের বিবরণ')} <span class="font-normal text-ink-3" data-count="${id}:desc"></span>`, data.pages[id].desc, true)}
      <div><p class="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-3 mb-1.5">${t('How it looks on Google', 'গুগলে যেমন দেখাবে')}</p>
        <div class="rounded-xl border border-rule bg-white p-4 max-w-[600px]" data-serp="${id}" style="font-family: arial, sans-serif"></div></div>`, i + 1,
    `<span class="hidden sm:inline text-[12.5px] text-ink-3 num ml-2">${id === 'home' ? '/' : `/#${id}`}</span>`)).join('');
    return settings + pages;
  }
  if (key === 'committee') {
    const list = data.list;
    return sectionCard({ id: 'people', en: 'People, in website order', bn: 'ওয়েবসাইটের ক্রমে সদস্যরা', hintEn: 'Shown on the About page and the home page.', hintBn: 'আমাদের কথা ও হোম পাতায় দেখায়।' },
      `<ol class="space-y-3" data-rep="committee">${list.map((p, j) => rowCard('committee', j, list.length, t(`${esc(p.name) || 'New person'} <span class="font-normal text-ink-3">· ${esc(p.role)}</span>`, `${esc(p.nameBn || p.name) || 'নতুন সদস্য'} <span class="font-normal text-ink-3">· ${esc(p.roleBn || p.role)}</span>`), `
        ${biField(`c${j}:name`, t('Name', 'নাম'), { en: p.name, bn: p.nameBn })}
        ${biField(`c${j}:role`, t('Role', 'পদ'), { en: p.role, bn: p.roleBn })}
        <label class="block max-w-[160px]"><span class="text-[13.5px] font-semibold">${t('On the committee since', 'কবে থেকে কমিটিতে')}</span><input class="field num" name="c${j}:since" inputmode="numeric" value="${esc(p.since)}" /></label>`)).join('')}</ol>
      <button type="button" class="btn btn-line btn-sm" data-row-add="committee"><i data-lucide="user-plus"></i>${t('Add a person', 'একজন যোগ')}</button>`, 0);
  }
  // Notice
  return [
    sectionCard({ id: 'content', en: 'Notice', bn: 'নোটিস' }, `
      ${biField('n:title', t('Title', 'শিরোনাম'), { en: data.title, bn: data.titleBn })}
      ${biField('n:body', t('Short text (shows in the list)', 'ছোট লেখা (তালিকায় দেখায়)'), { en: data.body, bn: data.bodyBn }, true)}
      ${biField('n:more', t('Full notice (on its own page, optional)', 'পুরো নোটিস (আলাদা পাতায়, ঐচ্ছিক)'), { en: data.more, bn: data.moreBn }, true)}`, 0),
  ].join('');
}

function sidebar() {
  const { key, data } = state;
  const w = ws.get();
  const isNotice = key.startsWith('notice:');
  const isPage = key.startsWith('cpage:');
  const n = isNotice ? noticeEntries().find((x) => `notice:${x.id}` === key) : isPage ? customEntries().find((x) => `cpage:${x.id}` === key) || { status: 'draft', mine: true } : null;
  const status = n ? n.status : 'published';
  const hist = w.history[key] || [];
  const details = isNotice ? `<section class="paper-card p-4 space-y-3">
      <h3 class="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-3">${t('Details', 'বিবরণ')}</h3>
      <label class="block"><span class="text-[13.5px] font-semibold">${t('Kind', 'ধরন')}</span>
        <select class="field" name="n:tag">${TAGS.map(([en, bn]) => `<option value="${esc(en)}" ${data.tag === en ? 'selected' : ''}>${L(en, bn)}</option>`).join('')}</select></label>
      <label class="flex items-center gap-3 text-[14.5px]"><input type="checkbox" class="switch" name="n:pinned" ${data.pinned ? 'checked' : ''} />${t('Pin to the top', 'উপরে আটকে রাখুন')}</label>
      <p class="text-[13px] text-ink-3 num">${t(`Date: ${esc(data.date || todayParts().date)}`, `তারিখ: ${esc(data.dateBn || todayParts().dateBn)}`)}</p></section>`
    : isPage ? `<section class="paper-card p-4 space-y-3">
      <h3 class="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-3">${t('Menu', 'মেনু')}</h3>
      <label class="flex items-start gap-3 text-[14.5px]"><input type="checkbox" class="switch mt-0.5" name="cp:inMenu" ${data.inMenu ? 'checked' : ''} /><span>${t('Show in the main menu', 'মূল মেনুতে দেখান')}<span class="block text-[12.5px] text-ink-3">${t('Added at the end. Change its place in Menus.', 'শেষে যোগ হবে। জায়গা বদলান মেনু-তে।')}</span></span></label></section>` : '';
  return `<aside class="space-y-4 self-start ${view.preview ? 'grid sm:grid-cols-2 gap-4 space-y-0' : 'xl:sticky xl:top-36'}">
    <section class="paper-card p-4">
      <h3 class="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-3">${t('Publishing', 'প্রকাশ')}</h3>
      <div class="mt-2 flex flex-wrap gap-1">${STATUS[status]()}${w.drafts[key] && status !== 'draft' ? STATUS.changes() : ''}</div>
      <dl class="mt-3 text-[13px] space-y-1.5">
        <div class="flex gap-2"><dt class="text-ink-3 w-24 shrink-0">${t('Published', 'প্রকাশ')}</dt><dd>${status === 'draft' ? t('Not yet', 'এখনও নয়') : metaLine(key)}</dd></div>
        ${w.drafts[key] ? `<div class="flex gap-2"><dt class="text-ink-3 w-24 shrink-0">${t('Draft saved', 'খসড়া সেভ')}</dt><dd>${t(fmtWhen(w.drafts[key].at)[0], fmtWhen(w.drafts[key].at)[1])}</dd></div>` : ''}
      </dl>
      <div class="mt-4 grid gap-2">
        <button type="submit" class="btn btn-primary" data-publish><i data-lucide="upload"></i>${t(status === 'hidden' ? 'Publish again' : 'Publish', status === 'hidden' ? 'আবার প্রকাশ' : 'প্রকাশ করুন')}</button>
        <button type="button" class="btn btn-line" data-save-draft><i data-lucide="save"></i>${t('Save draft', 'খসড়া সেভ')}</button>
        ${w.drafts[key] && status !== 'draft' ? `<button type="button" class="btn btn-ghost btn-sm" data-discard><i data-lucide="undo-2"></i>${t('Discard draft', 'খসড়া বাদ দিন')}</button>` : ''}
        ${(isNotice || isPage) && status === 'published' ? `<button type="button" class="btn btn-ghost btn-sm" data-unpublish><i data-lucide="eye-off"></i>${t('Unpublish', 'প্রকাশ বন্ধ')}</button>` : ''}
        ${(isNotice || isPage) && n?.mine !== false && (isPage || n?.mine) ? `<button type="button" class="btn btn-ghost btn-sm text-sindoor-deep" data-delete><i data-lucide="trash-2"></i>${isPage ? t('Delete page', 'পাতা মুছুন') : t('Delete notice', 'নোটিস মুছুন')}</button>` : ''}
      </div></section>
    ${details}
    ${key === 'seo' ? '<section class="paper-card p-4" data-seo-health></section>' : ''}
    <section class="paper-card p-4" data-translation></section>
    <section class="paper-card p-4">
      <h3 class="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-3 flex items-center gap-1.5"><i data-lucide="history" class="w-3.5 h-3.5"></i>${t('History', 'ইতিহাস')}</h3>
      ${hist.length ? `<ol class="mt-2 space-y-2">${hist.map((h, i) => { const [en, bn] = fmtWhen(h.at); return `<li class="flex items-center gap-2 text-[13px]"><span class="min-w-0"><span class="block">${t(`Before ${en}`, `${bn}-এর আগে`)}</span><span class="block text-ink-3">${t(h.by[0], h.by[1])}</span></span>
        <button type="button" class="btn btn-ghost btn-sm ml-auto" data-restore="${i}">${t('Restore', 'ফেরান')}</button></li>`; }).join('')}</ol>`
        : `<p class="mt-2 text-[13px] text-ink-3">${t('Earlier versions show here after you publish.', 'প্রকাশের পর আগের সংস্করণ এখানে দেখাবে।')}</p>`}
    </section></aside>`;
}

function entryTitle() {
  const { key, data } = state;
  if (key.startsWith('page:')) { const p = PAGES[key.slice(5)]; return [p.en, p.bn, 'pages', 'Pages', 'পাতা']; }
  if (key === 'menu') return ['Menus', 'মেনু', 'menu', 'Menus', 'মেনু'];
  if (key.startsWith('cpage:')) return [data.title.en || 'New page', data.title.bn || data.title.en || 'নতুন পাতা', 'pages', 'Pages', 'পাতা'];
  if (key === 'seo') return ['SEO & sharing', 'এসইও ও শেয়ার', 'seo', 'SEO', 'এসইও'];
  if (key === 'committee') return ['Committee list', 'কমিটির তালিকা', 'committee', 'Committee', 'কমিটি'];
  return [data.title || 'New notice', data.titleBn || data.title || 'নতুন নোটিস', 'notices', 'Notices', 'নোটিস'];
}

function editor() {
  const [en, bn, , listEn, listBn] = entryTitle();
  const back = ['committee', 'seo', 'menu'].includes(state.key) ? '' : `<button type="button" class="btn btn-ghost btn-sm !px-2" data-back aria-label="${L(`Back to ${listEn}`, `${listBn}-এ ফিরুন`)}"><i data-lucide="arrow-left"></i></button>
    <span class="text-ink-3 text-[14px] hidden sm:inline">${t(listEn, listBn)} /</span>`;
  return `<form data-cms-form data-lmode="${view.lmode}" novalidate>
    <div class="sticky top-16 z-20 -mx-1 px-1 py-2.5 mb-4 bg-paper/95 backdrop-blur border-b border-rule flex flex-wrap items-center gap-2">
      ${back}<h2 class="font-display text-xl truncate max-w-[40ch]">${t(esc(en), esc(bn))}</h2>
      <span data-dirty class="hidden chip h-6 px-2 text-[12px] bg-sindoor-wash text-sindoor-deep"><span class="w-1.5 h-1.5 rounded-full bg-sindoor"></span>${t('Unsaved changes', 'সেভ হয়নি')}</span>
      <div class="ml-auto flex items-center gap-2">
        <div class="inline-flex rounded-lg border border-rule bg-card p-0.5" role="tablist" aria-label="${L('Language', 'ভাষা')}">
          ${[['en', 'English'], ['bn', 'বাংলা'], ['both', L('Both', 'দুটোই')]].map(([k, label]) => `<button type="button" role="tab" data-lmode-btn="${k}" aria-selected="${view.lmode === k}" class="relative h-8 px-3 rounded-md text-[13.5px] font-semibold aria-selected:bg-ink aria-selected:text-paper">${label}${k === 'bn' ? '<span data-bn-dot class="hidden absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-marigold ring-2 ring-card"></span>' : ''}</button>`).join('')}
        </div>
        <button type="button" class="btn btn-line btn-sm" data-preview aria-pressed="${view.preview}"><i data-lucide="monitor-smartphone"></i>${t('Preview', 'প্রিভিউ')}</button>
        ${view.preview ? `<button type="button" class="btn btn-line btn-sm" data-save-draft><i data-lucide="save"></i>${t('Save draft', 'খসড়া সেভ')}</button><button class="btn btn-primary btn-sm"><i data-lucide="upload"></i>${t('Publish', 'প্রকাশ')}</button>` : ''}
      </div>
    </div>
    <div class="grid ${view.preview ? '' : 'xl:grid-cols-[minmax(0,1fr)_300px]'} gap-5 items-start">
      <div class="space-y-4">${editorFields()}</div>
      ${sidebar()}
    </div></form>`;
}

function previewPanel() {
  const hash = state.key.startsWith('page:') ? PAGES[state.key.slice(5)].hash : state.key === 'committee' ? '#committee' : state.key === 'seo' || state.key === 'menu' ? '#home' : state.key.startsWith('cpage:') ? `#page/${state.data.slug || 'x'}` : `#notice/${state.key.slice(7)}`;
  return `<aside data-cms-preview class="fixed inset-0 xl:inset-y-0 xl:left-auto xl:right-0 xl:w-[min(48vw,760px)] z-[70] bg-paper-2 border-l border-rule flex flex-col shadow-2xl">
    <div class="h-14 px-4 flex items-center gap-2 bg-card border-b border-rule">
      <i data-lucide="monitor-smartphone" class="w-4 h-4 text-ink-3"></i><p class="font-semibold">${t('Live preview', 'লাইভ প্রিভিউ')}</p>
      <span class="text-[12.5px] text-ink-3 hidden sm:inline">${t('Updates as you type. Not published.', 'লেখার সাথে বদলায়। প্রকাশ হয়নি।')}</span>
      <div class="ml-auto inline-flex rounded-lg border border-rule p-0.5">${[['desktop', 'monitor', 'Desktop', 'ডেস্কটপ'], ['phone', 'smartphone', 'Phone', 'ফোন']].map(([k, ic, en, bn]) => `<button type="button" data-device="${k}" aria-pressed="${view.device === k}" class="h-8 px-2.5 rounded-md aria-pressed:bg-ink aria-pressed:text-paper" aria-label="${L(en, bn)}"><i data-lucide="${ic}" class="w-4 h-4"></i></button>`).join('')}</div>
      <button type="button" data-preview-close class="w-9 h-9 grid place-items-center rounded-full hover:bg-paper-2" aria-label="${L('Close preview', 'প্রিভিউ বন্ধ')}"><i data-lucide="x" class="w-5 h-5"></i></button>
    </div>
    <div class="flex-1 overflow-hidden grid place-items-center p-3">
      <iframe title="${L('Website preview', 'ওয়েবসাইট প্রিভিউ')}" src="index.html?cms-preview=1${hash}" class="bg-white rounded-lg border border-rule shadow ${view.device === 'phone' ? 'w-[390px] max-w-full h-full' : 'w-full h-full'}"></iframe>
    </div></aside>`;
}

/* ---------- Screen ---------- */
export async function websiteScreen(ctx) {
  C = ctx;
  await loadDefaults();
  if (['committee', 'seo', 'menu'].includes(view.type) && !state) openEntry(view.type);
  const el = C.screen('website');
  const main = state ? editor() : view.type === 'notices' ? noticesList() : view.type === 'media' ? mediaList() : pagesList();
  const [at] = fmtWhen(siteContent.get().at); const [, atBn] = fmtWhen(siteContent.get().at);
  C.paint(el, `
    <style>
      [data-lmode="en"] [data-l="bn"], [data-lmode="bn"] [data-l="en"] { display: none; }
      [data-lmode="both"] .cms-langs { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
      [data-lmode="en"] .cms-lang, [data-lmode="bn"] .cms-lang { display: none; }
      .cms-lang { display: block; font-size: 12px; color: var(--color-ink-3); margin-bottom: 2px; }
      .cms-section[open] .cms-chev { transform: rotate(180deg); }
      .cms-section summary::-webkit-details-marker { display: none; }
      .cms-missing { box-shadow: inset 3px 0 0 var(--color-marigold); }
      @media (min-width: 1280px) { .cms-preview-on { margin-right: min(48vw, 760px); } }
    </style>
    ${C.pageHead('Website', 'ওয়েবসাইট', t('Write and publish what the public website says, in English and Bengali.', 'পাবলিক ওয়েবসাইটে কী লেখা থাকবে লিখুন ও প্রকাশ করুন, ইংরেজি ও বাংলায়।'), `
      <a href="index.html" target="_blank" rel="noopener" class="btn btn-line btn-sm"><i data-lucide="globe"></i>${t('Open website', 'ওয়েবসাইট খুলুন')}</a>
      <button class="btn btn-ghost btn-sm" data-undo-all><i data-lucide="rotate-ccw"></i>${t('Reset website', 'ওয়েবসাইট আগের মতো')}</button>`)}
    <p class="-mt-3 mb-4 text-[13.5px] text-ink-3 flex items-center gap-1.5"><i data-lucide="clock" class="w-4 h-4"></i>${at ? t(`Last published ${at}`, `শেষ প্রকাশ ${atBn}`) : t('Nothing published yet: the website shows its original content.', 'এখনও কিছু প্রকাশ হয়নি: ওয়েবসাইটে আসল লেখাই আছে।')}</p>
    <div data-cms-body class="grid ${state && view.preview ? '' : 'lg:grid-cols-[230px_minmax(0,1fr)]'} gap-5 items-start">
      ${state && view.preview ? '' : sideNav()}
      <div class="min-w-0">${main}
        <p class="mt-5 text-[13px] text-ink-3">${t('Prototype: content is kept in this browser, so open the website in the same browser to see it. In the real system it is saved on the server for everyone.', 'প্রোটোটাইপ: লেখা এই ব্রাউজারে থাকে, তাই একই ব্রাউজারে ওয়েবসাইট খুলে দেখুন। আসল ব্যবস্থায় সার্ভারে সেভ হবে, সবাই দেখবেন।')}</p></div>
    </div>
    ${state && view.preview ? previewPanel() : ''}`);
  el.classList.toggle('cms-preview-on', !!(state && view.preview));
  wire(el);
  if (readOnly()) lockDown(el);
}

const rerender = () => websiteScreen(C);

/* Roles with "view" for Website content (treasurer, puja in-charge) can look but not change anything */
function readOnly() {
  if (!viewAs) return false;
  return rolePerms.modules.find((m) => m.id === 'website')?.p[viewAs] === 'view';
}
function lockDown(el) {
  el.querySelectorAll('[data-cms-form] input, [data-cms-form] textarea, [data-cms-form] select').forEach((x) => { x.disabled = true; });
  el.querySelectorAll('[data-publish], [data-save-draft], [data-cms-form] button[type="submit"], [data-cms-form] .btn-primary, [data-discard], [data-unpublish], [data-delete], [data-restore], [data-row-add], [data-row-move], [data-row-del], [data-pick-photo], [data-clear-photo], [data-new-notice], [data-new-page], [data-add-media], [data-del-media], [data-undo-all]').forEach((b) => b.remove());
  const bar = document.createElement('p');
  bar.className = 'mb-4 rounded-xl bg-paper-2 border border-rule px-4 py-3 text-[14.5px] flex items-center gap-2';
  bar.innerHTML = `<i data-lucide="eye" class="w-4 h-4 text-ink-3"></i>${t('View only. Your role can see the website content but not change it. Ask the secretary to make a change.', 'শুধু দেখা যাবে। আপনার ভূমিকায় ওয়েবসাইটের লেখা দেখা যায়, বদলানো যায় না। বদলাতে সম্পাদককে বলুন।')}`;
  el.querySelector('[data-cms-body]')?.before(bar);
  C.paint(bar, bar.innerHTML);
}

/* Read the form back into the entry's data shape */
function collect(form) {
  const { key } = state;
  const v = (n) => form.elements[n]?.value?.trim() ?? '';
  const bi = (n) => ({ en: v(`${n}|en`), bn: v(`${n}|bn`) });
  const d = clone(state.data);
  if (key === 'menu') {
    ['main', 'footer1', 'footer2'].forEach((k) => { d[k] = d[k].map((it, j) => ({ label: bi(`${k}${j}:label`), href: v(`${k}${j}:href`) || '#home', show: v(`${k}${j}:show`) || it.show })); });
    return d;
  }
  if (key.startsWith('cpage:')) {
    Object.assign(d, { title: bi('cp:title'), intro: bi('cp:intro'), desc: bi('cp:desc'), inMenu: !!form.elements['cp:inMenu']?.checked });
    d.slug = d.slugAuto ? slugify(d.title.en) : slugify(v('cp:slug'));
    d.blocks = d.blocks.map((b, j) => {
      if (b.type === 'text') return { ...b, heading: bi(`b${j}:heading`), body: bi(`b${j}:body`) };
      if (b.type === 'image') return { ...b, caption: bi(`b${j}:caption`) };
      if (b.type === 'button') return { ...b, label: bi(`b${j}:label`), href: v(`b${j}:href`) || '#home' };
      if (b.type === 'faq') return { ...b, q: bi(`b${j}:q`), a: bi(`b${j}:a`) };
      return { ...b, text: bi(`b${j}:text`) };
    });
    return d;
  }
  if (key.startsWith('page:')) {
    Object.keys(d.text).forEach((k) => { d.text[k] = bi(`t:${k}`); });
    if (d.values) d.values = d.values.map((x, j) => ({ icon: form.querySelector(`[name="v${j}:icon"]:checked`)?.value || x.icon, title: bi(`v${j}:title`), text: bi(`v${j}:text`) }));
    if ('photo' in d) d.photo = v('photo');
  } else if (key === 'seo') {
    SEO_PAGES.forEach(([id]) => { d.pages[id] = { title: bi(`p:${id}:title`), desc: bi(`p:${id}:desc`) }; });
    d.index = !!form.elements['s:index']?.checked;
    SOCIAL.forEach(([k]) => { d.social[k] = v(`s:${k}`); });
  } else if (key === 'committee') {
    d.list = d.list.map((p, j) => { const nm = bi(`c${j}:name`); const rl = bi(`c${j}:role`); return { ...p, name: nm.en, nameBn: nm.bn, role: rl.en, roleBn: rl.bn, since: Number(v(`c${j}:since`)) || p.since }; });
  } else {
    const ti = bi('n:title'); const bo = bi('n:body'); const mo = bi('n:more');
    const tag = v('n:tag') || d.tag; const tagBn = (TAGS.find(([e]) => e === tag) || [])[1] || d.tagBn;
    Object.assign(d, { title: ti.en, titleBn: ti.bn, body: bo.en, bodyBn: bo.bn, more: mo.en, moreBn: mo.bn, tag, tagBn, pinned: !!form.elements['n:pinned']?.checked });
  }
  return d;
}

const dirty = () => state && JSON.stringify(state.data) !== state.saved;

function leave(fn) {
  if (!dirty()) { fn(); return; }
  confirmBox('Leave without saving?', 'সেভ না করে বেরোবেন?', 'Your changes to this entry will be lost. Save a draft first to keep them.', 'এই লেখার বদল হারিয়ে যাবে। রাখতে চাইলে আগে খসড়া সেভ করুন।', 'Leave', 'বেরোন', fn, { danger: true });
}
function closeEntry() { state = null; view.entry = null; view.preview = false; try { localStorage.removeItem(PREVIEW_KEY); } catch { /* blocked */ } }

function writePreview() {
  if (!state || !view.preview) return;
  try { localStorage.setItem(PREVIEW_KEY, JSON.stringify(withEntry(siteContent.get(), state.key, state.data))); } catch { /* blocked */ }
}

function checkTranslation(form) {
  const missing = [];
  form.querySelectorAll('[data-bi]').forEach((f) => {
    const en = f.querySelector('[data-l="en"] .field'); const bn = f.querySelector('[data-l="bn"] .field');
    const gap = en.value.trim() && !bn.value.trim();
    f.classList.toggle('cms-missing', !!gap); if (gap) missing.push((f.querySelector('p > span') || f.querySelector('p')).textContent.trim());
  });
  form.querySelector('[data-bn-dot]')?.classList.toggle('hidden', !missing.length);
  const box = form.querySelector('[data-translation]');
  if (box) {
    box.innerHTML = `<h3 class="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-3 flex items-center gap-1.5"><i data-lucide="languages" class="w-3.5 h-3.5"></i>${t('Translation', 'অনুবাদ')}</h3>
      ${missing.length ? `<p class="mt-2 text-[13.5px] text-turmeric font-semibold">${t(`${missing.length} field${missing.length === 1 ? ' still needs' : 's still need'} Bengali`, `${bnD(missing.length)}টি ঘরে বাংলা বাকি`)}</p>
        <ul class="mt-1 text-[13px] text-ink-2 list-disc pl-4">${missing.slice(0, 5).map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
        <p class="mt-1.5 text-[12.5px] text-ink-3">${t('The website shows the English there until it is filled.', 'ভরা না হলে ওখানে ইংরেজি দেখাবে।')}</p>`
        : `<p class="mt-2 text-[13.5px] text-tulsi font-semibold flex items-center gap-1.5"><i data-lucide="circle-check" class="w-4 h-4"></i>${t('English and Bengali both filled', 'ইংরেজি ও বাংলা দুটোই ভরা')}</p>`}`;
    C.paint(box, box.innerHTML);
  }
  return missing.length;
}

function validEntry() {
  const d = state.data;
  if (state.key.startsWith('notice:') && !d.title) { toast(`<i data-lucide="info"></i>${t('Give the notice an English title first.', 'আগে নোটিসের ইংরেজি শিরোনাম দিন।')}`); return false; }
  const say = (en, bn) => { toast(`<i data-lucide="info"></i>${t(en, bn)}`); return false; };
  if (state.key.startsWith('cpage:')) {
    if (!d.title.en) return say('Give the page an English title first.', 'আগে পাতার ইংরেজি শিরোনাম দিন।');
    if (!d.slug) return say('Give the page a link: small English letters, numbers and dashes.', 'পাতার লিঙ্ক দিন: ছোট ইংরেজি অক্ষর, সংখ্যা আর ড্যাশ।');
    if (customEntries().some((p) => p.slug === d.slug && p.id !== d.id)) return say('Another page already uses this link. Change it a little.', 'এই লিঙ্ক অন্য পাতায় আছে। একটু বদলান।');
  }
  if (state.key === 'menu' && ['main', 'footer1', 'footer2'].some((k) => d[k].some((i) => !i.label.en))) return say('Every menu link needs an English label.', 'প্রতিটি মেনু লিঙ্কের ইংরেজি নাম লাগবে।');
  if (state.key === 'committee' && d.list.some((p) => !p.name || !p.role)) { toast(`<i data-lucide="info"></i>${t('Every person needs a name and a role in English.', 'প্রত্যেকের ইংরেজিতে নাম ও পদ লাগবে।')}`); return false; }
  return true;
}

function saveDraft() {
  if ((state.key.startsWith('notice:') && !state.data.title && !state.data.titleBn) || (state.key.startsWith('cpage:') && !state.data.title.en && !state.data.title.bn)) { toast(`<i data-lucide="info"></i>${t('Write a title first.', 'আগে শিরোনাম লিখুন।')}`); return; }
  ws.edit((w) => { w.drafts[state.key] = { data: state.data, at: new Date().toISOString(), by: WHO }; });
  state.saved = JSON.stringify(state.data);
  ok('Draft saved. The website has not changed.', 'খসড়া সেভ হয়েছে। ওয়েবসাইট বদলায়নি।');
}

function publish() {
  if (!validEntry()) return;
  const { key, data } = state;
  const before = published(key);
  if (data.isNew) Object.assign(data, todayParts());
  const next = withEntry(siteContent.get(), key, { ...data, isNew: false });
  siteContent.set(next);
  ws.edit((w) => {
    delete w.drafts[key];
    if (before && !before.isNew && !same(before, data)) w.history[key] = [{ data: before, at: new Date().toISOString(), by: WHO }, ...(w.history[key] || [])].slice(0, 8);
    w.meta[key] = { at: new Date().toISOString(), by: WHO };
  });
  const [en, bn] = entryTitle();
  C.logAudit('website', `Website published · ${en}`, `ওয়েবসাইটে প্রকাশ · ${bn}`);
  ok('Published. The website shows it now.', 'প্রকাশ হয়েছে। ওয়েবসাইটে এখন দেখাবে।');
  openEntry(key);
}

function wire(el) {
  // Content types and lists
  el.querySelectorAll('[data-cms-type]').forEach((b) => b.addEventListener('click', () => leave(() => { closeEntry(); view.type = b.dataset.cmsType; rerender(); })));
  el.querySelectorAll('[data-open]').forEach((r) => {
    const go = () => { openEntry(r.dataset.open); rerender(); scrollTo({ top: 0 }); };
    r.addEventListener('click', go); r.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  });
  el.querySelector('[data-undo-all]')?.addEventListener('click', () => confirmBox('Reset the whole website?', 'পুরো ওয়েবসাইট আগের মতো করবেন?',
    'All published text, notices, the committee list and photos go back to the original. Drafts and history are cleared too. This can’t be undone.',
    'প্রকাশ করা সব লেখা, নোটিস, কমিটি তালিকা ও ছবি আসল অবস্থায় ফিরবে। খসড়া ও ইতিহাসও মুছবে। এটা আর ফেরানো যাবে না।', 'Reset website', 'আগের মতো করুন', () => {
      siteContent.clear(); ws.put({ drafts: {}, history: {}, meta: {} }); closeEntry(); if (['committee', 'seo', 'menu'].includes(view.type)) view.type = 'pages';
      C.logAudit('website', 'Website reset to original content', 'ওয়েবসাইট আসল অবস্থায় ফেরানো'); ok('The website is back to its original content.', 'ওয়েবসাইট আসল অবস্থায় ফিরেছে।'); rerender();
    }, { danger: true }));

  // Notices list: search + filter without a repaint
  const search = el.querySelector('[data-cms-search]'); let filter = '';
  const applyFilter = () => {
    const q = (search?.value || '').trim().toLowerCase(); let shown = 0;
    el.querySelectorAll('tr[data-status]').forEach((r) => { const on = (!filter || r.dataset.status === filter) && (!q || r.dataset.q.includes(q)); r.hidden = !on; if (on) shown++; });
    el.querySelector('[data-cms-empty]')?.classList.toggle('hidden', !!shown);
  };
  search?.addEventListener('input', applyFilter);
  el.querySelectorAll('[data-cms-filter]').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.cmsFilter; el.querySelectorAll('[data-cms-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); applyFilter(); }));
  el.querySelector('[data-new-page]')?.addEventListener('click', () => {
    const id = `p${Date.now()}`;
    state = { key: `cpage:${id}`, data: { id, slug: '', slugAuto: true, title: { en: '', bn: '' }, intro: { en: '', bn: '' }, image: '', desc: { en: '', bn: '' }, inMenu: false, blocks: [blankBlock('text')], isNew: true }, saved: 'null', pub: null };
    view.entry = state.key; rerender(); scrollTo({ top: 0 }); el.querySelector('[name="cp:title|en"]')?.focus();
  });
  el.querySelector('[data-new-notice]')?.addEventListener('click', () => {
    const id = `w${Date.now()}`; const d = todayParts();
    state = { key: `notice:${id}`, data: { ...pick({}), tag: 'Club', tagBn: 'ক্লাব', ...d, isNew: true }, saved: 'null', pub: null };
    view.entry = state.key; rerender(); el.querySelector('[name="n:title|en"]')?.focus();
  });

  // Media
  el.querySelector('[data-add-media]')?.addEventListener('click', () => addMedia());
  el.querySelectorAll('[data-del-media]').forEach((b) => b.addEventListener('click', () => {
    const c = siteContent.get(); const m = (c.media || []).find((x) => x.id === b.dataset.delMedia);
    if (m && c.photos?.group === m.url) { toast(`<i data-lucide="info"></i>${t('This photo is on the About page. Choose another one there first.', 'ছবিটি আমাদের কথা পাতায় আছে। আগে সেখানে অন্য ছবি বাছুন।')}`); return; }
    confirmBox('Remove this photo?', 'ছবিটি সরাবেন?', 'It is removed from Media. Pages that do not use it are not affected.', 'ছবিটি মিডিয়া থেকে সরবে। যে পাতায় ব্যবহার হয়নি তাতে কিছু হবে না।', 'Remove', 'সরান', () => {
      siteContent.set({ media: (c.media || []).filter((x) => x.id !== b.dataset.delMedia) }); C.logAudit('website', 'Website photo removed from Media', 'মিডিয়া থেকে ছবি সরানো'); rerender();
    }, { danger: true });
  }));

  const form = el.querySelector('[data-cms-form]');
  if (!form) return refreshIcons();

  // Editor
  const sync = () => { state.data = collect(form); el.querySelector('[data-dirty]')?.classList.toggle('hidden', !dirty()); };
  let pv;
  form.elements['cp:slug']?.addEventListener('input', () => { state.data.slugAuto = false; });
  form.addEventListener('input', () => { sync(); const sl = form.elements['cp:slug']; if (sl && state.data.slugAuto && document.activeElement !== sl) sl.value = state.data.slug; checkTranslation(form); clearTimeout(pv); pv = setTimeout(writePreview, 450); });
  form.addEventListener('change', () => { sync(); clearTimeout(pv); pv = setTimeout(writePreview, 200); });
  form.addEventListener('submit', (e) => { e.preventDefault(); sync(); publish(); rerender(); });
  form.querySelectorAll('[data-save-draft]').forEach((b) => b.addEventListener('click', () => { sync(); saveDraft(); rerender(); }));
  form.querySelector('[data-back]')?.addEventListener('click', () => leave(() => { closeEntry(); rerender(); }));
  form.querySelectorAll('[data-lmode-btn]').forEach((b) => b.addEventListener('click', () => {
    view.lmode = b.dataset.lmodeBtn; form.dataset.lmode = view.lmode;
    form.querySelectorAll('[data-lmode-btn]').forEach((x) => x.setAttribute('aria-selected', String(x === b))); seoLive(form);
  }));
  form.querySelectorAll('details[data-sec]').forEach((d) => d.addEventListener('toggle', () => { view.open[`${state.key}:${d.dataset.sec}`] = d.open; }));
  form.querySelector('[data-preview]')?.addEventListener('click', () => { sync(); view.preview = !view.preview; writePreview(); rerender(); });
  el.querySelector('[data-preview-close]')?.addEventListener('click', () => { sync(); view.preview = false; rerender(); });
  el.querySelectorAll('[data-device]').forEach((b) => b.addEventListener('click', () => { sync(); view.device = b.dataset.device; rerender(); }));

  // Repeatable rows (values, committee)
  const listOf = (kind) => (kind === 'values' ? state.data.values : kind === 'committee' ? state.data.list : state.data[kind]);
  form.querySelectorAll('[data-row-move]').forEach((b) => b.addEventListener('click', () => { sync(); const [k, i, d] = b.dataset.rowMove.split('|'); const a = listOf(k); const [x] = a.splice(Number(i), 1); a.splice(Number(i) + Number(d), 0, x); rerender(); }));
  form.querySelectorAll('[data-row-del]').forEach((b) => b.addEventListener('click', () => { sync(); const [k, i] = b.dataset.rowDel.split('|'); listOf(k).splice(Number(i), 1); rerender(); }));
  form.querySelectorAll('[data-row-add]').forEach((b) => b.addEventListener('click', () => {
    sync(); const k = b.dataset.rowAdd;
    listOf(k).push(k === 'values' ? { icon: 'sparkles', title: { en: '', bn: '' }, text: { en: '', bn: '' } }
      : k === 'committee' ? { name: '', nameBn: '', role: '', roleBn: '', since: new Date().getFullYear() }
      : k === 'blocks' ? blankBlock(b.dataset.blockType)
      : { label: { en: '', bn: '' }, href: '#home', show: 'all' });
    rerender(); const rows = el.querySelectorAll(`[data-rep="${k}"] [data-row]`); rows[rows.length - 1]?.querySelector('.field')?.focus();
  }));

  // Photo
  form.querySelectorAll('[data-pick-photo]').forEach((b) => b.addEventListener('click', () => { sync(); pickPhoto(b.dataset.pickPhoto); }));
  form.querySelectorAll('[data-clear-photo]').forEach((b) => b.addEventListener('click', () => { sync(); setPhoto(b.dataset.clearPhoto, ''); rerender(); writePreview(); }));
  form.querySelectorAll('[data-open-seo]').forEach((b) => b.addEventListener('click', () => leave(() => { closeEntry(); view.type = 'seo'; rerender(); scrollTo({ top: 0 }); })));

  // Draft / publish actions
  form.querySelector('[data-discard]')?.addEventListener('click', () => confirmBox('Discard this draft?', 'খসড়া বাদ দেবেন?', 'The editor goes back to what is on the website now.', 'ওয়েবসাইটে এখন যা আছে সেখানে ফিরবে।', 'Discard', 'বাদ দিন', () => {
    ws.edit((w) => { delete w.drafts[state.key]; }); openEntry(state.key); rerender();
  }, { danger: true }));
  const isPage = state.key.startsWith('cpage:');
  const pageId = state.key.slice(6);
  form.querySelector('[data-unpublish]')?.addEventListener('click', () => (isPage ? confirmBox('Unpublish this page?', 'পাতাটির প্রকাশ বন্ধ করবেন?', 'It disappears from the website and its menu link is hidden. It stays here, so you can publish it again.', 'ওয়েবসাইট থেকে সরে যাবে, মেনুর লিঙ্কও লুকোবে। এখানে থাকবে, আবার প্রকাশ করা যাবে।', 'Unpublish', 'প্রকাশ বন্ধ', () => {
    const c = siteContent.get(); siteContent.set({ pages: (c.pages || []).map((p) => (p.id === pageId ? { ...p, hidden: true } : p)) });
    C.logAudit('website', `Website page unpublished · ${state.data.title.en}`, `ওয়েবসাইটের পাতা প্রকাশ বন্ধ · ${state.data.title.bn || state.data.title.en}`);
    ok('Unpublished. It is off the website.', 'প্রকাশ বন্ধ। ওয়েবসাইট থেকে সরেছে।'); openEntry(state.key); rerender();
  }) : confirmBox('Unpublish this notice?', 'নোটিসটির প্রকাশ বন্ধ করবেন?', 'It disappears from the website but stays here, so you can publish it again.', 'ওয়েবসাইট থেকে সরে যাবে, তবে এখানে থাকবে, আবার প্রকাশ করা যাবে।', 'Unpublish', 'প্রকাশ বন্ধ', () => {
    const id = state.key.slice(7); const n = { hidden: [], added: [], edited: {}, ...(siteContent.get().notices || {}) };
    siteContent.set({ notices: { ...n, hidden: [...new Set([...n.hidden, id])] } });
    C.logAudit('website', `Website notice unpublished · ${state.data.title}`, `ওয়েবসাইটের নোটিস প্রকাশ বন্ধ · ${state.data.titleBn || state.data.title}`);
    ok('Unpublished. It is off the website.', 'প্রকাশ বন্ধ। ওয়েবসাইট থেকে সরেছে।'); openEntry(state.key); rerender();
  })));
  if (isPage) form.querySelector('[data-delete]')?.addEventListener('click', () => confirmBox('Delete this page?', 'পাতাটি মুছবেন?', 'It is removed from the website, the menus and from here. This can’t be undone.', 'ওয়েবসাইট, মেনু ও এখান থেকে মুছে যাবে। এটা আর ফেরানো যাবে না।', 'Delete', 'মুছুন', () => {
    const c = siteContent.get(); const old = (c.pages || []).find((p) => p.id === pageId);
    const patch = { pages: (c.pages || []).filter((p) => p.id !== pageId) };
    if (old && c.menu) { const href = `#page/${old.slug}`; const m = clone(c.menu); Object.keys(m).forEach((k) => { m[k] = m[k].filter((i) => i.href !== href); }); patch.menu = same(m, defaults.menu) ? null : m; }
    siteContent.set(patch);
    ws.edit((w) => { delete w.drafts[state.key]; delete w.history[state.key]; delete w.meta[state.key]; });
    C.logAudit('website', `Website page deleted · ${state.data.title.en}`, `ওয়েবসাইটের পাতা মোছা · ${state.data.title.bn || state.data.title.en}`);
    ok('Page deleted.', 'পাতা মোছা হয়েছে।'); state.saved = JSON.stringify(state.data); closeEntry(); rerender();
  }, { danger: true }));
  else form.querySelector('[data-delete]')?.addEventListener('click', () => confirmBox('Delete this notice?', 'নোটিসটি মুছবেন?', 'It is removed from the website and from here. This can’t be undone.', 'ওয়েবসাইট ও এখান থেকে মুছে যাবে। এটা আর ফেরানো যাবে না।', 'Delete', 'মুছুন', () => {
    const id = state.key.slice(7); const n = { hidden: [], added: [], edited: {}, ...(siteContent.get().notices || {}) };
    if (n.added.some((a) => a.id === id)) siteContent.set({ notices: { ...n, added: n.added.filter((a) => a.id !== id) } });
    ws.edit((w) => { delete w.drafts[state.key]; delete w.history[state.key]; delete w.meta[state.key]; });
    C.logAudit('website', `Website notice deleted · ${state.data.title}`, `ওয়েবসাইটের নোটিস মোছা · ${state.data.titleBn || state.data.title}`);
    ok('Notice deleted.', 'নোটিস মোছা হয়েছে।'); state.saved = JSON.stringify(state.data); closeEntry(); rerender();
  }, { danger: true }));
  form.querySelectorAll('[data-restore]').forEach((b) => b.addEventListener('click', () => {
    const h = ws.get().history[state.key]?.[Number(b.dataset.restore)]; if (!h) return;
    sync(); state.data = clone({ ...h.data, ...(state.key.startsWith('notice:') ? { date: state.data.date, dateBn: state.data.dateBn, iso: state.data.iso } : {}) });
    rerender(); toast(`<i data-lucide="info"></i>${t('Earlier version loaded. Publish to put it back on the website.', 'আগের সংস্করণ এসেছে। ওয়েবসাইটে ফেরাতে প্রকাশ করুন।')}`);
  }));

  checkTranslation(form); seoLive(form);
  form.addEventListener('input', () => seoLive(form));
  form.addEventListener('change', () => seoLive(form));
  el.querySelector('[data-dirty]')?.classList.toggle('hidden', !dirty());
  refreshIcons();
}

/* SEO: character counts, Google preview and a health check, as you type */
const LIMITS = { title: [20, 60], desc: [70, 160] };
function seoLive(form) {
  if (state?.key !== 'seo') return;
  const d = state.data; const ln = view.lmode === 'bn' ? 'bn' : 'en';
  const site = ln === 'bn' ? 'গেদে মৈত্রী ক্লাব' : 'Gede Maitree Club';
  const fullTitle = (id) => { const tt = d.pages[id].title[ln] || d.pages[id].title.en; return id === 'home' ? tt : `${tt} · ${site}`; };
  const issues = [];
  SEO_PAGES.forEach(([id, en, bn]) => {
    [['title', fullTitle(id).length], ['desc', (d.pages[id].desc[ln] || d.pages[id].desc.en).length]].forEach(([f, n]) => {
      const [lo, hi] = LIMITS[f]; const bad = n > hi || n < lo;
      const c = form.querySelector(`[data-count="${id}:${f}"]`);
      if (c) { c.textContent = `· ${lang === 'bn' ? bnD(n) : n}/${lang === 'bn' ? bnD(hi) : hi}`; c.className = `font-normal num ${bad ? 'text-sindoor-deep' : 'text-ink-3'}`; }
      if (bad) issues.push([L(en, bn), f === 'title' ? (n > hi ? L('title is too long', 'শিরোনাম বেশি লম্বা') : L('title is too short', 'শিরোনাম বেশি ছোট')) : (n > hi ? L('description is too long', 'বিবরণ বেশি লম্বা') : L('description is too short', 'বিবরণ বেশি ছোট'))]);
    });
    const box = form.querySelector(`[data-serp="${id}"]`);
    if (box) {
      const tt = fullTitle(id); const ds = d.pages[id].desc[ln] || d.pages[id].desc.en;
      box.innerHTML = `<p style="font-size:12px;color:#4d5156">gedemaitreeclub.org${id === 'home' ? '' : ` › ${id}`}</p>
        <p style="font-size:19px;line-height:1.3;color:#1a0dab;margin-top:2px">${esc(tt.length > 60 ? `${tt.slice(0, 58)}…` : tt)}</p>
        <p style="font-size:14px;line-height:1.5;color:#4d5156;margin-top:3px">${esc(ds.length > 160 ? `${ds.slice(0, 157)}…` : ds)}</p>`;
    }
  });
  const noAlt = (siteContent.get().media || []).filter((m) => !m.alt).length;
  const h = form.querySelector('[data-seo-health]');
  if (!h) return;
  const row = (good, en, bn) => `<li class="flex gap-2 items-start"><i data-lucide="${good ? 'circle-check' : 'circle-alert'}" class="w-4 h-4 mt-0.5 shrink-0 ${good ? 'text-tulsi' : 'text-turmeric'}"></i><span>${t(en, bn)}</span></li>`;
  h.innerHTML = `<h3 class="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-3 flex items-center gap-1.5"><i data-lucide="activity" class="w-3.5 h-3.5"></i>${t('SEO health', 'এসইও স্বাস্থ্য')}</h3>
    <ul class="mt-2 space-y-1.5 text-[13.5px]">
      ${row(d.index, d.index ? 'Shown in search results' : 'Hidden from search results', d.index ? 'সার্চে দেখাচ্ছে' : 'সার্চে লুকোনো')}
      ${row(!issues.length, issues.length ? `${issues.length} title or description length to fix` : 'Every title and description is a good length', issues.length ? `${bnD(issues.length)}টি শিরোনাম বা বিবরণের মাপ ঠিক করুন` : 'সব শিরোনাম ও বিবরণের মাপ ঠিক')}
      ${row(!!d.image, d.image ? 'Club share image chosen' : 'Using the standard club card to share', d.image ? 'ক্লাবের শেয়ার ছবি বাছা' : 'শেয়ারে সাধারণ ক্লাব কার্ড')}
      ${row(!noAlt, noAlt ? `${noAlt} photo(s) in Media need a description` : 'All club photos are described', noAlt ? `মিডিয়ায় ${bnD(noAlt)}টি ছবির বিবরণ নেই` : 'ক্লাবের সব ছবির বিবরণ আছে')}
      ${row(Object.values(d.social).some(Boolean), Object.values(d.social).some(Boolean) ? 'Club pages linked' : 'No Facebook or Instagram page linked', Object.values(d.social).some(Boolean) ? 'ক্লাবের পাতা যুক্ত' : 'ফেসবুক বা ইনস্টাগ্রাম যুক্ত নেই')}
    </ul>
    ${issues.length ? `<ul class="mt-2 text-[12.5px] text-ink-3 list-disc pl-5">${issues.slice(0, 4).map(([p, m]) => `<li>${esc(p)}: ${m}</li>`).join('')}</ul>` : ''}`;
  C.paint(h, h.innerHTML);
}

/* Media: add a photo, and choose one for the About page */
function addMedia(after) {
  C.formDrawer('Add a photo', 'ছবি যোগ', `
    ${C.fld('Photo link', 'ছবির লিঙ্ক', C.inp('name="url" type="url" placeholder="https://…" required pattern="https://.+"'))}
    <p class="text-[13px] text-ink-3 -mt-2">${t('Prototype: paste a link. In the real console you upload from your phone or computer.', 'প্রোটোটাইপ: লিঙ্ক দিন। আসল কনসোলে ফোন বা কম্পিউটার থেকে আপলোড করবেন।')}</p>
    ${C.fld('What is in the photo · English', 'ছবিতে কী আছে · ইংরেজি', C.inp('name="alt" required placeholder="Members at the 2026 Durga Puja"'))}
    ${C.fld('What is in the photo · Bengali', 'ছবিতে কী আছে · বাংলা', C.inp('name="altBn" lang="bn"'))}
    <p class="text-[13px] text-ink-3 -mt-2">${t('This is read aloud to people who cannot see the photo.', 'যাঁরা ছবি দেখতে পান না তাঁদের এটা পড়ে শোনানো হয়।')}</p>`,
  'Add to Media', 'মিডিয়ায় যোগ', 'Photo added to Media.', 'ছবি মিডিয়ায় যোগ হয়েছে।', { onDone: (f) => {
    const m = { id: `m${Date.now()}`, url: f.elements.url.value.trim(), alt: f.elements.alt.value.trim(), altBn: f.elements.altBn.value.trim() };
    siteContent.set({ media: [m, ...(siteContent.get().media || [])] });
    C.logAudit('website', 'Website photo added to Media', 'মিডিয়ায় ছবি যোগ');
    if (after) after(m); else rerender();
  } });
}

const getPhoto = (field) => (field.startsWith('block:') ? state.data.blocks[Number(field.slice(6))]?.url : state.data[field]);
function setPhoto(field, url) { if (field.startsWith('block:')) state.data.blocks[Number(field.slice(6))].url = url; else state.data[field] = url; }
function pickPhoto(field = 'photo') {
  const items = mediaItems(); const cur = getPhoto(field) || (field === 'photo' ? PHOTOS.group.src(2000) : '');
  C.formDrawer('Choose a photo', 'ছবি বাছুন', `
    <ul class="grid grid-cols-2 gap-3">${items.map((m, i) => `<li><label class="block cursor-pointer rounded-xl border-2 border-transparent has-[:checked]:border-sindoor overflow-hidden">
      <input type="radio" name="pick" value="${i}" class="sr-only" ${m.full === cur ? 'checked' : ''} />
      <span class="block relative aspect-[4/3] bg-paper-2"><img src="${esc(m.url)}" alt="${esc(L(m.alt, m.altBn || m.alt))}" loading="lazy" class="absolute inset-0 w-full h-full object-cover" /></span>
      <span class="block px-2 py-1.5 text-[12.5px] leading-snug line-clamp-2">${m.own ? t('Club photo', 'ক্লাবের ছবি') : t('Sample', 'নমুনা')} · ${esc(L(m.alt, m.altBn || m.alt))}</span></label></li>`).join('')}</ul>
    <button type="button" class="btn btn-line btn-sm w-full" data-pick-add><i data-lucide="image-plus"></i>${t('Add a new photo', 'নতুন ছবি যোগ')}</button>`,
  'Use this photo', 'এই ছবি নিন', '', '', { onDone: (f) => {
    const m = items[Number(f.elements.pick.value)]; if (!m) return;
    setPhoto(field, field === 'photo' && m.id === 'group' ? '' : m.full); rerender(); writePreview();
  } });
  document.querySelector('[data-pick-add]')?.addEventListener('click', () => addMedia((m) => { setPhoto(field, m.url); rerender(); writePreview(); }));
}

// Leaving the Website screen from the console menu with unsaved changes
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href^="#"]');
  if (!a || !dirty() || a.closest('[data-cms-form]')) return;
  e.preventDefault(); e.stopPropagation();
  leave(() => { closeEntry(); location.hash = a.getAttribute('href'); });
}, true);

// Leaving the console page with unsaved changes
addEventListener('beforeunload', (e) => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
