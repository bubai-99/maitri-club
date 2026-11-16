/* Applies the committee's edits from the console's Website screen to this website.
   Imported by site.js before anything is drawn: lists (notices, committee) and photos are changed in place,
   and page text marked with data-cms="key" is swapped in both languages. */
import { siteContent, SITE_CONTENT_KEY, applyLang } from './shared.js';
import { committee } from './data.js';
import { publicNotices } from './site-data.js';
import { PHOTOS } from './photos.js';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Website notices after the committee's edits: hidden ones dropped, added ones in, pinned first, newest first. */
export function noticesWithEdits(base, c = siteContent.get()) {
  const hidden = new Set(c.notices?.hidden || []);
  return [...(c.notices?.added || []), ...base]
    .filter((n) => !hidden.has(n.id))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.iso).localeCompare(String(a.iso)));
}

const c = siteContent.get();

if (c.notices) publicNotices.splice(0, publicNotices.length, ...noticesWithEdits(publicNotices, c));
if (Array.isArray(c.committee) && c.committee.length) committee.splice(0, committee.length, ...c.committee);
if (c.photos?.group) { const url = c.photos.group; PHOTOS.group = { ...PHOTOS.group, src: () => url, by: 'Gede Maitree Club', page: '#committee' }; }

export function applyCmsText(root = document) {
  const text = siteContent.get().text || {};
  root.querySelectorAll('[data-cms]').forEach((el) => {
    const v = text[el.dataset.cms];
    if (!v) return;
    if (v.en) el.dataset.en = esc(v.en).replace(/\n/g, '<br>');
    if (v.bn) el.dataset.bn = esc(v.bn).replace(/\n/g, '<br>');
  });
  applyLang(root);
}
applyCmsText();

// Saved in the console in another tab of this browser: show it here straight away
addEventListener('storage', (e) => { if (e.key === SITE_CONTENT_KEY) location.reload(); });
