// Committee console: Website. The committee edits what the public website says without touching code:
// home and About page text (both languages), website notices, the committee list and the group photo.
// The current text is read straight from the website page itself, so there is one source for the defaults.
// Prototype: saved in this browser (shared.js siteContent); the website applies it on load (site-cms.js).
import { t, lang, toast, refreshIcons, siteContent } from './shared.js';
import { committee } from './data.js';
import { publicNotices } from './site-data.js';
import { PHOTOS } from './photos.js';

const L = (en, bn) => (lang === 'bn' ? bn : en);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const bnD = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
const ok = (en, bn) => toast(`<i data-lucide="check-circle-2"></i>${t(en, bn)}`);

/* Every editable piece of page text: key matches data-cms="key" on the website. */
const FIELDS = {
  home: {
    link: 'index.html#home',
    groups: [
      [['Top of the home page', 'হোম পাতার উপরে'], [
        ['hero.kicker', 'Small line above the title', 'শিরোনামের উপরের ছোট লাইন'],
        ['hero.title', 'Big title', 'বড় শিরোনাম'],
        ['hero.sub', 'Text under the title', 'শিরোনামের নিচের লেখা', true],
      ]],
    ],
  },
  about: {
    link: 'index.html#committee',
    groups: [
      [['Banner', 'ব্যানার'], [
        ['about.title', 'Title', 'শিরোনাম'],
        ['about.intro', 'Text under the title', 'শিরোনামের নিচের লেখা', true],
      ]],
      [['Mission and values', 'লক্ষ্য ও মূল্যবোধ'], [
        ['about.mission', 'Mission', 'লক্ষ্য', true],
        ['value1.title', 'Value 1', 'মূল্যবোধ ১'], ['value1.text', 'Value 1, one line', 'মূল্যবোধ ১, এক লাইন', true],
        ['value2.title', 'Value 2', 'মূল্যবোধ ২'], ['value2.text', 'Value 2, one line', 'মূল্যবোধ ২, এক লাইন', true],
        ['value3.title', 'Value 3', 'মূল্যবোধ ৩'], ['value3.text', 'Value 3, one line', 'মূল্যবোধ ৩, এক লাইন', true],
        ['value4.title', 'Value 4', 'মূল্যবোধ ৪'], ['value4.text', 'Value 4, one line', 'মূল্যবোধ ৪, এক লাইন', true],
      ]],
      [['Our story', 'আমাদের কথা'], [
        ['story.title', 'Title', 'শিরোনাম'],
        ['story.text', 'Story', 'গল্প', true],
      ]],
      [['Group photo', 'দলগত ছবি'], [
        ['group.kicker', 'Small line', 'ছোট লাইন'],
        ['group.title', 'Heading', 'শিরোনাম'],
        ['group.caption', 'Caption', 'ক্যাপশন', true],
      ]],
      [['Club room', 'ক্লাব ঘর'], [
        ['clubroom.text', 'Address and hours', 'ঠিকানা ও সময়', true],
      ]],
    ],
  },
};
const TABS = [
  ['home', 'house', 'Home page', 'হোম পাতা'],
  ['about', 'info', 'About page', 'আমাদের কথা'],
  ['notices', 'megaphone', 'Notices', 'নোটিস'],
  ['committee', 'users', 'Committee', 'কমিটি'],
  ['photos', 'image', 'Photos', 'ছবি'],
];
const TAGS = [['Meeting', 'সভা'], ['Puja', 'পূজা'], ['Club', 'ক্লাব'], ['Service', 'সেবা'], ['Sports', 'খেলা']];

let C;
let tab = 'home';
let defaults = null; // { key: { en, bn } } read from the website page
let draftCommittee = null;

/* Read today's text from the website page itself (same site), so the editor always starts from what is live. */
async function loadDefaults() {
  if (defaults) return defaults;
  defaults = {};
  try {
    const html = await (await fetch('index.html', { cache: 'no-store' })).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const plain = (h) => { const d = document.createElement('div'); d.innerHTML = String(h).replace(/<br\s*\/?>/gi, '\n'); return d.textContent.replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' ').trim(); };
    doc.querySelectorAll('[data-cms]').forEach((el) => { defaults[el.dataset.cms] = { en: plain(el.innerHTML), bn: plain(el.dataset.bn || '') }; });
  } catch { /* offline: fields start empty */ }
  return defaults;
}

const current = (key) => { const o = siteContent.get().text?.[key]; const d = defaults[key] || { en: '', bn: '' }; return { en: o?.en ?? d.en, bn: o?.bn ?? d.bn, edited: !!o }; };
const todayParts = () => { const d = new Date(); const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]; const mBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'][d.getMonth()]; return { date: `${d.getDate()} ${m}`, dateBn: `${bnD(d.getDate())} ${mBn}`, iso: d.toISOString().slice(0, 10) }; };
const whenSaved = () => { const at = siteContent.get().at; if (!at) return t('Nothing changed yet: the website shows its original text.', 'এখনো কিছু বদলানো হয়নি: ওয়েবসাইটে আসল লেখাই আছে।'); const d = new Date(at); const hm = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }); return t(`Last published ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${hm}`, `শেষ প্রকাশ ${bnD(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))}, ${bnD(hm)}`); };

/* ---------- Page text tabs ---------- */
function textTab(spec) {
  return `<form data-text-form class="space-y-5">
    ${spec.groups.map(([[gEn, gBn], fields]) => `
      <section class="paper-card">
        <h2 class="px-5 pt-4 pb-3 border-b border-rule font-display text-xl">${t(gEn, gBn)}</h2>
        <div class="divide-y divide-rule">
          ${fields.map(([key, en, bn, long]) => { const v = current(key); const box = (lng, val) => long
            ? `<textarea class="field min-h-[88px]" rows="3" name="${key}|${lng}" ${lng === 'bn' ? 'lang="bn"' : ''}>${esc(val)}</textarea>`
            : `<input class="field" name="${key}|${lng}" value="${esc(val)}" ${lng === 'bn' ? 'lang="bn"' : ''} />`;
          return `<div class="px-5 py-4">
            <p class="text-[14px] font-semibold flex items-center gap-2">${t(en, bn)}${v.edited ? `<span class="chip h-5 px-1.5 text-[11px] bg-marigold-wash text-turmeric">${t('Edited', 'বদলানো')}</span>` : ''}</p>
            <div class="mt-2 grid md:grid-cols-2 gap-3">
              <label class="block"><span class="text-[12px] text-ink-3">English</span>${box('en', v.en)}</label>
              <label class="block"><span class="text-[12px] text-ink-3">বাংলা</span>${box('bn', v.bn)}</label>
            </div></div>`; }).join('')}
        </div>
      </section>`).join('')}
    <div class="sticky bottom-0 -mx-1 px-1 py-3 bg-paper/95 backdrop-blur flex flex-wrap items-center gap-2 border-t border-rule">
      <button type="button" class="btn btn-line btn-sm" data-undo-tab><i data-lucide="rotate-ccw"></i>${t('Back to original text', 'আসল লেখায় ফেরান')}</button>
      <a href="${spec.link}" target="_blank" rel="noopener" class="btn btn-line btn-sm ml-auto"><i data-lucide="external-link"></i>${t('View on website', 'ওয়েবসাইটে দেখুন')}</a>
      <button class="btn btn-primary btn-sm"><i data-lucide="upload"></i>${t('Publish to website', 'ওয়েবসাইটে প্রকাশ')}</button>
    </div>
  </form>`;
}

/* ---------- Notices ---------- */
function noticeRows() {
  const c = siteContent.get();
  const hidden = new Set(c.notices?.hidden || []);
  const added = c.notices?.added || [];
  const all = [...added, ...publicNotices].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.iso).localeCompare(String(a.iso)));
  return { hidden, added, all };
}
function noticesTab() {
  const { hidden, added, all } = noticeRows();
  return `<div class="paper-card">
    <div class="px-5 pt-4 pb-3 border-b border-rule flex flex-wrap items-center gap-2">
      <div><h2 class="font-display text-xl">${t('Notices on the website', 'ওয়েবসাইটের নোটিস')}</h2>
        <p class="text-sm text-ink-3">${t('These show on the home page and the Notices page. Hidden ones stay in the app for members.', 'এগুলো হোম পাতা ও নোটিস পাতায় দেখায়। লুকোনো নোটিস সদস্যদের অ্যাপে থাকে।')}</p></div>
      <a href="index.html#notices" target="_blank" rel="noopener" class="btn btn-line btn-sm ml-auto"><i data-lucide="external-link"></i>${t('View on website', 'ওয়েবসাইটে দেখুন')}</a>
      <button class="btn btn-primary btn-sm" data-add-notice><i data-lucide="plus"></i>${t('Add a notice', 'নোটিস যোগ')}</button>
    </div>
    <ul class="divide-y divide-rule">
      ${all.map((n) => { const off = hidden.has(n.id); const mine = added.some((a) => a.id === n.id); return `<li class="px-5 py-3.5 flex flex-wrap items-start gap-3 ${off ? 'opacity-55' : ''}">
        <div class="min-w-0 flex-1">
          <p class="text-[12.5px] flex items-center gap-2"><span class="font-bold uppercase tracking-wide text-sindoor-deep">${t(n.tag, n.tagBn)}</span><span class="text-ink-3 num">${t(n.date || '', n.dateBn || bnD(n.date || ''))}</span>${n.pinned ? '<i data-lucide="pin" class="w-3.5 h-3.5 text-ink-3"></i>' : ''}${mine ? `<span class="chip h-5 px-1.5 text-[11px] bg-marigold-wash text-turmeric">${t('Added here', 'এখানে যোগ')}</span>` : ''}${off ? `<span class="chip h-5 px-1.5 text-[11px] bg-paper-2 text-ink-2">${t('Hidden', 'লুকোনো')}</span>` : ''}</p>
          <p class="font-semibold leading-snug mt-0.5">${t(esc(n.title), esc(n.titleBn))}</p>
          <p class="text-[14px] text-ink-2 line-clamp-2">${t(esc(n.body), esc(n.bodyBn))}</p>
        </div>
        <div class="flex gap-1.5 shrink-0">
          <button class="btn btn-line btn-sm" data-toggle-notice="${esc(n.id)}"><i data-lucide="${off ? 'eye' : 'eye-off'}"></i>${off ? t('Show', 'দেখান') : t('Hide', 'লুকোন')}</button>
          ${mine ? `<button class="btn btn-ghost btn-sm" data-del-notice="${esc(n.id)}" aria-label="${L('Delete', 'মুছুন')}"><i data-lucide="trash-2"></i></button>` : ''}
        </div></li>`; }).join('')}
    </ul></div>`;
}

/* ---------- Committee ---------- */
function committeeTab() {
  draftCommittee ??= (siteContent.get().committee || committee).map((c) => ({ ...c }));
  return `<form data-committee-form class="paper-card">
    <div class="px-5 pt-4 pb-3 border-b border-rule flex flex-wrap items-center gap-2">
      <div><h2 class="font-display text-xl">${t('Committee on the website', 'ওয়েবসাইটের কমিটি')}</h2>
        <p class="text-sm text-ink-3">${t('Shown on the About page and the home page, in this order.', 'আমাদের কথা ও হোম পাতায় এই ক্রমে দেখায়।')}</p></div>
      <a href="index.html#committee" target="_blank" rel="noopener" class="btn btn-line btn-sm ml-auto"><i data-lucide="external-link"></i>${t('View on website', 'ওয়েবসাইটে দেখুন')}</a>
    </div>
    <ol class="divide-y divide-rule">
      ${draftCommittee.map((c, i) => `<li class="px-5 py-3.5 grid sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
        <label class="block"><span class="text-[12px] text-ink-3">${t('Name', 'নাম')} · English</span><input class="field" data-cm="${i}|name" value="${esc(c.name)}" required /></label>
        <label class="block"><span class="text-[12px] text-ink-3">${t('Name', 'নাম')} · বাংলা</span><input class="field" data-cm="${i}|nameBn" value="${esc(c.nameBn)}" lang="bn" required /></label>
        <span class="hidden sm:block"></span>
        <label class="block"><span class="text-[12px] text-ink-3">${t('Role', 'পদ')} · English</span><input class="field" data-cm="${i}|role" value="${esc(c.role)}" required /></label>
        <label class="block"><span class="text-[12px] text-ink-3">${t('Role', 'পদ')} · বাংলা</span><input class="field" data-cm="${i}|roleBn" value="${esc(c.roleBn)}" lang="bn" required /></label>
        <div class="flex gap-1">
          <button type="button" class="btn btn-ghost btn-sm" data-cm-move="${i}|-1" ${i === 0 ? 'disabled' : ''} aria-label="${L('Move up', 'উপরে')}"><i data-lucide="arrow-up"></i></button>
          <button type="button" class="btn btn-ghost btn-sm" data-cm-move="${i}|1" ${i === draftCommittee.length - 1 ? 'disabled' : ''} aria-label="${L('Move down', 'নিচে')}"><i data-lucide="arrow-down"></i></button>
          <button type="button" class="btn btn-ghost btn-sm" data-cm-del="${i}" aria-label="${L(`Remove ${c.name}`, `${c.nameBn} সরান`)}"><i data-lucide="trash-2"></i></button>
        </div></li>`).join('')}
    </ol>
    <div class="px-5 py-3 border-t border-rule flex flex-wrap items-center gap-2">
      <button type="button" class="btn btn-line btn-sm" data-cm-add><i data-lucide="user-plus"></i>${t('Add a person', 'একজন যোগ')}</button>
      <button type="button" class="btn btn-line btn-sm" data-cm-reset><i data-lucide="rotate-ccw"></i>${t('Back to original list', 'আসল তালিকায় ফেরান')}</button>
      <button class="btn btn-primary btn-sm ml-auto"><i data-lucide="upload"></i>${t('Publish to website', 'ওয়েবসাইটে প্রকাশ')}</button>
    </div>
  </form>`;
}

/* ---------- Photos ---------- */
function photosTab() {
  const url = siteContent.get().photos?.group || '';
  const shown = url || PHOTOS.group.src(1000);
  return `<form data-photo-form class="paper-card">
    <div class="px-5 pt-4 pb-3 border-b border-rule flex flex-wrap items-center gap-2">
      <div><h2 class="font-display text-xl">${t('About page group photo', 'আমাদের কথা পাতার দলগত ছবি')}</h2>
        <p class="text-sm text-ink-3">${t('The full-width photo at the bottom of the About page. A wide (landscape) photo works best.', 'আমাদের কথা পাতার নিচের পুরো চওড়া ছবি। চওড়া (আড়াআড়ি) ছবি সবচেয়ে ভালো লাগে।')}</p></div>
      <a href="index.html#committee" target="_blank" rel="noopener" class="btn btn-line btn-sm ml-auto"><i data-lucide="external-link"></i>${t('View on website', 'ওয়েবসাইটে দেখুন')}</a>
    </div>
    <div class="p-5 grid lg:grid-cols-2 gap-5 items-start">
      <div class="relative aspect-[5/3] rounded-xl overflow-hidden bg-paper-2"><img id="ws-photo-preview" src="${esc(shown)}" alt="" class="absolute inset-0 w-full h-full object-cover" />
        <span class="absolute left-2 top-2 chip h-6 text-[12px] bg-black/65 text-white">${url ? t('Your photo', 'আপনার ছবি') : t('Sample photo', 'নমুনা ছবি')}</span></div>
      <div class="space-y-3">
        <label class="block"><span class="label">${t('Photo link', 'ছবির লিঙ্ক')}</span><input class="field" name="url" type="url" placeholder="https://…" value="${esc(url)}" /></label>
        <p class="text-[13px] text-ink-3">${t('Prototype: paste a link to the photo. In the real console you upload it from your phone or computer.', 'প্রোটোটাইপ: ছবির লিঙ্ক দিন। আসল কনসোলে ফোন বা কম্পিউটার থেকে আপলোড করবেন।')}</p>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn btn-line btn-sm" data-photo-test><i data-lucide="eye"></i>${t('Preview', 'দেখুন')}</button>
          ${url ? `<button type="button" class="btn btn-line btn-sm" data-photo-reset><i data-lucide="rotate-ccw"></i>${t('Use the sample again', 'আবার নমুনা ছবি')}</button>` : ''}
          <button class="btn btn-primary btn-sm"><i data-lucide="upload"></i>${t('Publish to website', 'ওয়েবসাইটে প্রকাশ')}</button>
        </div>
      </div>
    </div>
  </form>`;
}

export async function websiteScreen(ctx) {
  C = ctx;
  await loadDefaults();
  const body = tab === 'notices' ? noticesTab() : tab === 'committee' ? committeeTab() : tab === 'photos' ? photosTab() : textTab(FIELDS[tab]);
  const el = C.screen('website');
  C.paint(el, `
    ${C.pageHead('Website', 'ওয়েবসাইট', t('Change what the public website says, in English and Bengali. Press Publish and the website shows it.', 'পাবলিক ওয়েবসাইটে কী লেখা থাকবে বদলান, ইংরেজি ও বাংলায়। প্রকাশ চাপলেই ওয়েবসাইটে দেখাবে।'), `
      <a href="index.html" target="_blank" rel="noopener" class="btn btn-line btn-sm"><i data-lucide="globe"></i>${t('Open website', 'ওয়েবসাইট খুলুন')}</a>
      <button class="btn btn-line btn-sm" data-undo-all><i data-lucide="rotate-ccw"></i>${t('Undo all edits', 'সব বদল ফেরান')}</button>`)}
    <p class="-mt-3 mb-4 text-[13.5px] text-ink-3 flex items-center gap-1.5"><i data-lucide="clock" class="w-4 h-4"></i>${whenSaved()}</p>
    <div class="flex flex-wrap gap-2 mb-5" role="tablist">
      ${TABS.map(([k, icon, en, bn]) => `<button type="button" role="tab" aria-selected="${tab === k}" data-ws-tab="${k}" class="chip h-9 px-3.5 text-sm border border-rule bg-card aria-selected:bg-ink aria-selected:text-paper aria-selected:border-ink"><i data-lucide="${icon}"></i>${t(en, bn)}</button>`).join('')}
    </div>
    ${body}
    <p class="mt-5 text-[13px] text-ink-3">${t('Prototype: edits are kept in this browser, so open the website in the same browser to see them. In the real system they are saved on the server for everyone.', 'প্রোটোটাইপ: বদল এই ব্রাউজারে থাকে, তাই একই ব্রাউজারে ওয়েবসাইট খুলে দেখুন। আসল ব্যবস্থায় সার্ভারে সেভ হবে, সবাই দেখবেন।')}</p>`);
  wire(el);
}

function publishText(form) {
  const text = { ...(siteContent.get().text || {}) };
  const keys = FIELDS[tab].groups.flatMap(([, f]) => f.map(([k]) => k));
  let changed = 0;
  keys.forEach((k) => {
    const en = form.elements[`${k}|en`].value.trim(); const bn = form.elements[`${k}|bn`].value.trim();
    const d = defaults[k] || {};
    const same = en === (d.en || '') && bn === (d.bn || '');
    const before = JSON.stringify(text[k] || null);
    if (same) delete text[k]; else text[k] = { en: en || d.en, bn: bn || d.bn };
    if (JSON.stringify(text[k] || null) !== before) changed++;
  });
  siteContent.set({ text });
  C.logAudit('website', `Website text published · ${tab} page · ${changed} change${changed === 1 ? '' : 's'}`, `ওয়েবসাইটের লেখা প্রকাশ · ${tab} · ${bnD(changed)}টি বদল`);
  ok(changed ? 'Published. The website shows the new text.' : 'Nothing had changed.', changed ? 'প্রকাশ হয়েছে। ওয়েবসাইটে নতুন লেখা দেখাবে।' : 'কিছু বদলায়নি।');
}

function wire(el) {
  const rerender = () => websiteScreen(C);
  el.querySelectorAll('[data-ws-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.wsTab; draftCommittee = null; rerender(); }));
  el.querySelector('[data-undo-all]')?.addEventListener('click', () => {
    C.formDrawer('Undo all website edits?', 'ওয়েবসাইটের সব বদল ফেরাবেন?', `
      <p class="text-[15px] text-ink-2">${t('The website goes back to its original text, notices, committee list and photo. This can’t be undone.', 'ওয়েবসাইট আসল লেখা, নোটিস, কমিটি তালিকা ও ছবিতে ফিরে যাবে। এটা আর ফেরানো যাবে না।')}</p>`,
    'Undo all edits', 'সব বদল ফেরান', 'The website is back to its original content.', 'ওয়েবসাইট আসল অবস্থায় ফিরেছে।', { danger: true, onDone: () => {
      siteContent.clear(); draftCommittee = null;
      C.logAudit('website', 'Website edits undone', 'ওয়েবসাইটের সব বদল ফেরানো হয়েছে');
      rerender();
    } });
  });

  // Page text
  const tf = el.querySelector('[data-text-form]');
  tf?.addEventListener('submit', (e) => { e.preventDefault(); publishText(tf); rerender(); });
  tf?.querySelector('[data-undo-tab]')?.addEventListener('click', () => {
    const text = { ...(siteContent.get().text || {}) };
    FIELDS[tab].groups.flatMap(([, f]) => f.map(([k]) => k)).forEach((k) => delete text[k]);
    siteContent.set({ text });
    C.logAudit('website', `Website text reset · ${tab} page`, `ওয়েবসাইটের লেখা ফেরানো · ${tab}`);
    ok('Back to the original text.', 'আসল লেখায় ফেরানো হয়েছে।'); rerender();
  });

  // Notices
  const notices = () => ({ hidden: [], added: [], ...(siteContent.get().notices || {}) });
  el.querySelectorAll('[data-toggle-notice]').forEach((b) => b.addEventListener('click', () => {
    const n = notices(); const id = b.dataset.toggleNotice;
    n.hidden = n.hidden.includes(id) ? n.hidden.filter((x) => x !== id) : [...n.hidden, id];
    siteContent.set({ notices: n });
    C.logAudit('website', `Website notice ${n.hidden.includes(id) ? 'hidden' : 'shown'} · ${id}`, `ওয়েবসাইটের নোটিস ${n.hidden.includes(id) ? 'লুকোনো' : 'দেখানো'} · ${id}`);
    rerender();
  }));
  el.querySelectorAll('[data-del-notice]').forEach((b) => b.addEventListener('click', () => {
    const n = notices(); n.added = n.added.filter((x) => x.id !== b.dataset.delNotice);
    siteContent.set({ notices: n }); C.logAudit('website', 'Website notice deleted', 'ওয়েবসাইটের নোটিস মোছা হয়েছে'); rerender();
  }));
  el.querySelector('[data-add-notice]')?.addEventListener('click', () => {
    C.formDrawer('Add a website notice', 'ওয়েবসাইটে নোটিস যোগ', `
      ${C.fld('Title · English', 'শিরোনাম · ইংরেজি', C.inp('name="title" required'))}
      ${C.fld('Title · Bengali', 'শিরোনাম · বাংলা', C.inp('name="titleBn" lang="bn" required'))}
      ${C.fld('Notice · English', 'নোটিস · ইংরেজি', '<textarea class="field" name="body" rows="3" required></textarea>')}
      ${C.fld('Notice · Bengali', 'নোটিস · বাংলা', '<textarea class="field" name="bodyBn" rows="3" lang="bn" required></textarea>')}
      ${C.fld('Kind', 'ধরন', `<select class="field" name="tag">${TAGS.map(([en, bn], i) => `<option value="${i}">${L(en, bn)}</option>`).join('')}</select>`)}
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" name="pinned" />${t('Pin to the top', 'উপরে আটকে রাখুন')}</label>`,
    'Publish notice', 'নোটিস প্রকাশ', 'Notice published on the website.', 'নোটিস ওয়েবসাইটে প্রকাশ হয়েছে।', { onDone: (f) => {
      const n = notices(); const d = todayParts(); const [tag, tagBn] = TAGS[Number(f.elements.tag.value)];
      n.added = [{ id: `w${Date.now()}`, ...d, tag, tagBn, title: f.elements.title.value.trim(), titleBn: f.elements.titleBn.value.trim(), body: f.elements.body.value.trim(), bodyBn: f.elements.bodyBn.value.trim(), pinned: f.elements.pinned.checked }, ...n.added];
      siteContent.set({ notices: n });
      C.logAudit('website', `Website notice published · ${n.added[0].title}`, `ওয়েবসাইটে নোটিস প্রকাশ · ${n.added[0].titleBn}`);
      rerender();
    } });
  });

  // Committee
  const cf = el.querySelector('[data-committee-form]');
  if (cf) {
    const sync = () => cf.querySelectorAll('[data-cm]').forEach((i) => { const [n, f] = i.dataset.cm.split('|'); draftCommittee[Number(n)][f] = i.value; });
    cf.querySelectorAll('[data-cm-move]').forEach((b) => b.addEventListener('click', () => { sync(); const [i, d] = b.dataset.cmMove.split('|').map(Number); const [x] = draftCommittee.splice(i, 1); draftCommittee.splice(i + d, 0, x); rerender(); }));
    cf.querySelectorAll('[data-cm-del]').forEach((b) => b.addEventListener('click', () => { sync(); draftCommittee.splice(Number(b.dataset.cmDel), 1); rerender(); }));
    cf.querySelector('[data-cm-add]').addEventListener('click', () => { sync(); draftCommittee.push({ name: '', nameBn: '', role: '', roleBn: '', since: new Date().getFullYear() }); rerender(); });
    cf.querySelector('[data-cm-reset]').addEventListener('click', () => { siteContent.set({ committee: null }); draftCommittee = null; C.logAudit('website', 'Website committee list reset', 'ওয়েবসাইটের কমিটি তালিকা ফেরানো'); ok('Back to the original list.', 'আসল তালিকায় ফেরানো হয়েছে।'); rerender(); });
    cf.addEventListener('submit', (e) => {
      e.preventDefault(); sync();
      const list = draftCommittee.map((c) => ({ ...c, name: c.name.trim(), nameBn: c.nameBn.trim(), role: c.role.trim(), roleBn: c.roleBn.trim() })).filter((c) => c.name && c.role);
      siteContent.set({ committee: list }); draftCommittee = null;
      C.logAudit('website', `Website committee list published · ${list.length} people`, `ওয়েবসাইটের কমিটি তালিকা প্রকাশ · ${bnD(list.length)} জন`);
      ok('Published. The website shows the new committee list.', 'প্রকাশ হয়েছে। ওয়েবসাইটে নতুন কমিটি তালিকা দেখাবে।'); rerender();
    });
  }

  // Photo
  const pf = el.querySelector('[data-photo-form]');
  if (pf) {
    const good = (u) => /^https:\/\/\S+$/i.test(u);
    pf.querySelector('[data-photo-test]').addEventListener('click', () => { const u = pf.elements.url.value.trim(); if (good(u)) el.querySelector('#ws-photo-preview').src = u; else toast(`<i data-lucide="info"></i>${t('Paste a link that starts with https://', 'https:// দিয়ে শুরু লিঙ্ক দিন')}`); });
    pf.querySelector('[data-photo-reset]')?.addEventListener('click', () => { siteContent.set({ photos: { ...(siteContent.get().photos || {}), group: '' } }); C.logAudit('website', 'Website group photo back to sample', 'ওয়েবসাইটের ছবি নমুনায় ফেরানো'); rerender(); });
    pf.addEventListener('submit', (e) => {
      e.preventDefault(); const u = pf.elements.url.value.trim();
      if (!good(u)) { toast(`<i data-lucide="info"></i>${t('Paste a link that starts with https://', 'https:// দিয়ে শুরু লিঙ্ক দিন')}`); return; }
      siteContent.set({ photos: { ...(siteContent.get().photos || {}), group: u } });
      C.logAudit('website', 'Website group photo changed', 'ওয়েবসাইটের দলগত ছবি বদল');
      ok('Published. The About page shows the new photo.', 'প্রকাশ হয়েছে। আমাদের কথা পাতায় নতুন ছবি দেখাবে।'); rerender();
    });
  }
  refreshIcons();
}
