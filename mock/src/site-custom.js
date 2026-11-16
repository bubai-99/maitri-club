/* site-custom.js: pages the committee writes in the console (Website › Pages › New page), shown at #page/<slug>.
   A page is a banner (title, intro, photo) and a list of blocks: text, photo, button, question & answer, highlight. */
import { siteContent, applyLang, refreshIcons } from './shared.js';
import { PREVIEW_KEY } from './site-cms.js';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isPreview = new URLSearchParams(location.search).has('cms-preview');
function content() {
  const c = siteContent.get();
  if (!isPreview) return c;
  try { return JSON.parse(localStorage.getItem(PREVIEW_KEY)) || c; } catch { return c; }
}

/** Published (or, in preview, previewed) custom pages that are not hidden. */
export const customPages = () => (content().pages || []).filter((p) => !p.hidden);
export const findPage = (slug) => customPages().find((p) => p.slug === slug);

// Bilingual plain text: blank line = new paragraph, single line break kept
const bi = (v, tag = 'span', cls = '') => {
  const html = (s) => esc(s).replace(/\n/g, '<br>');
  return `<${tag} class="${cls}" data-bn="${esc(html(v?.bn || v?.en))}">${html(v?.en)}</${tag}>`;
};
const paras = (v) => {
  const en = String(v?.en || '').split(/\n\s*\n/); const bn = String(v?.bn || v?.en || '').split(/\n\s*\n/);
  return en.map((p, i) => bi({ en: p, bn: bn[i] ?? p }, 'p')).join('');
};
const safeHref = (h) => (/^(https:\/\/|#|tel:|mailto:|[a-z-]+\.html)/i.test(String(h || '').trim()) ? String(h).trim() : '#home');

function block(b) {
  if (b.type === 'text') return `<div class="space-y-4">${b.heading?.en ? bi(b.heading, 'h2', 'font-display text-[clamp(1.6rem,3.4vw,2.1rem)] leading-tight text-ink') : ''}<div class="space-y-4">${paras(b.body)}</div></div>`;
  if (b.type === 'image' && b.url) return `<figure><img src="${esc(b.url)}" alt="${esc(b.alt?.en || b.caption?.en || '')}" loading="lazy" class="w-full rounded-2xl object-cover max-h-[520px]" />${b.caption?.en ? bi(b.caption, 'figcaption', 'mt-2 text-[14px] text-ink-3') : ''}</figure>`;
  if (b.type === 'button' && b.label?.en) { const ext = /^https:/.test(safeHref(b.href)); return `<p><a href="${esc(safeHref(b.href))}" ${ext ? 'target="_blank" rel="noopener"' : ''} class="btn btn-primary h-12 px-6">${bi(b.label)}${ext ? '<i data-lucide="external-link"></i>' : '<i data-lucide="arrow-right"></i>'}</a></p>`; }
  if (b.type === 'faq' && b.q?.en) return `<details class="faq rounded-xl border border-rule bg-card px-5 py-4 group"><summary class="font-semibold cursor-pointer list-none flex items-center gap-3">${bi(b.q)}<i data-lucide="plus" class="ml-auto w-5 h-5 shrink-0 group-open:rotate-45 transition-transform"></i></summary><div class="mt-2 text-ink-2 space-y-3">${paras(b.a)}</div></details>`;
  if (b.type === 'note' && b.text?.en) return `<aside class="rounded-2xl bg-marigold-wash border border-marigold/40 p-5 flex gap-3"><i data-lucide="info" class="w-5 h-5 text-turmeric shrink-0 mt-1"></i><div class="space-y-3 text-ink">${paras(b.text)}</div></aside>`;
  return '';
}

export function renderCustomPage(slug) {
  const el = document.getElementById('custom-page');
  const p = findPage(slug);
  if (!el) return null;
  if (!p) { el.innerHTML = ''; return null; }
  el.innerHTML = `
    <div class="banner">
      ${p.image ? `<div class="banner-media" aria-hidden="true"><img src="${esc(p.image)}" alt="" /></div>` : '<div class="banner-media bg-ink" aria-hidden="true"></div>'}
      <div class="banner-shade"></div>
      <div class="relative mx-auto max-w-[1160px] px-5 pt-16 pb-14 sm:pt-24 sm:pb-20 min-h-[320px] sm:min-h-[400px] flex flex-col justify-end">
        <nav class="crumbs text-[13px] mb-5" aria-label="Breadcrumb"><a href="#home" data-bn="হোম">Home</a><span class="mx-2 text-white/40">/</span>${bi(p.title, 'span', 'text-white')}</nav>
        <div class="max-w-[720px]">
          ${bi(p.title, 'h1', 'font-display leading-[1.05] text-[clamp(2.4rem,6vw,4.2rem)] text-white')}
          ${p.intro?.en ? bi(p.intro, 'p', 'mt-4 text-[18px] text-white/85 max-w-[56ch] leading-relaxed') : ''}
        </div>
      </div>
    </div>
    <div class="mx-auto max-w-[760px] px-5 py-14 space-y-8 text-[17px] leading-relaxed text-ink-2">
      ${(p.blocks || []).map(block).join('')}
    </div>`;
  applyLang(el); refreshIcons();
  return p;
}
