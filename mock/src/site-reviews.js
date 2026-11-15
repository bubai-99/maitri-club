// Reviews: a rating summary, one featured review and a row of others you can feature.
// Used on the catering and nursery pages. The data is sample text (see reviewSets in site-data.js).
import { t, dn, applyLang, refreshIcons, lang } from './shared.js';
import { photo, credit } from './photos.js';
import { reviewSets } from './site-data.js';

const L = (en, bn) => (lang === 'bn' ? bn : en);
const bnNum = (v) => String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
const starRow = (n, cls = 'w-4 h-4') => `<span class="inline-flex gap-0.5" role="img" aria-label="${L(`${n} out of 5 stars`, `৫-এর মধ্যে ${bnNum(n)}`)}">${[1, 2, 3, 4, 5].map((i) => `<i data-lucide="star" class="${cls} ${i <= Math.round(n) ? 'text-marigold fill-current' : 'text-ink/20'}"></i>`).join('')}</span>`;

/**
 * @param {string} rootSel  element to render into
 * @param {'catering'|'nursery'} kind
 * @param {{ accent: string, wash: string, ask: string }} theme  Tailwind colour names and WhatsApp text
 */
export function mountReviews(rootSel, kind, theme) {
  const root = document.querySelector(rootSel);
  if (!root) return;
  const data = reviewSets[kind];
  // Full class names so Tailwind can see them
  const C = kind === 'catering'
    ? { text: 'text-turmeric', bar: 'bg-turmeric', panel: 'bg-turmeric-wash/45', soft: 'bg-turmeric-wash', ring: 'aria-pressed:border-turmeric' }
    : { text: 'text-tulsi', bar: 'bg-tulsi', panel: 'bg-tulsi-wash/55', soft: 'bg-tulsi-wash', ring: 'aria-pressed:border-tulsi' };
  let cur = 0;

  const draw = (focusSel) => {
    const r = data.items[cur];
    const total = data.dist.reduce((a, b) => a + b, 0);
    root.innerHTML = `
      <div class="rounded-[28px] ${C.panel} p-5 sm:p-8 lg:p-10">
        <div class="grid lg:grid-cols-12 gap-8 lg:gap-10">
          <!-- Summary -->
          <div class="lg:col-span-4">
            <p class="eyebrow ${C.text}">${t('Reviews', 'রিভিউ')}</p>
            <h2 class="mt-2 font-display leading-tight text-[clamp(1.9rem,4vw,2.5rem)]">${kind === 'catering' ? t('What families say', 'পরিবারগুলো যা বলেন') : t('What gardeners say', 'বাগানপ্রেমীরা যা বলেন')}</h2>
            <div class="mt-6 flex items-end gap-4">
              <span class="font-display text-[4.25rem] leading-[.85] num">${dn(data.avg.toFixed(1))}</span>
              <span class="pb-1">${starRow(data.avg, 'w-5 h-5')}<span class="block mt-1 text-[14px] text-ink-2">${t(`from ${data.count} ${kind === 'catering' ? 'bookings' : 'buyers'}`, `${bnNum(data.count)}টি ${kind === 'catering' ? 'বুকিং' : 'ক্রেতার'} রিভিউ`)}</span></span>
            </div>
            <ul class="mt-6 space-y-1.5" aria-label="${L('Ratings breakdown', 'রেটিংয়ের ভাগ')}">
              ${data.dist.map((c, i) => `<li class="flex items-center gap-2.5 text-[13.5px]"><span class="w-3 text-right num">${dn(String(5 - i))}</span><i data-lucide="star" class="w-3.5 h-3.5 text-marigold fill-current"></i><span class="flex-1 h-2 rounded-full bg-white/80 overflow-hidden"><span class="block h-full rounded-full ${C.bar}" style="width:${total ? (c / total) * 100 : 0}%"></span></span><span class="w-6 text-right text-ink-3 num">${dn(String(c))}</span></li>`).join('')}
            </ul>
            <p class="mt-6 text-[13px] font-semibold text-ink-2">${t('What people mention', 'মানুষ যা বেশি বলেন')}</p>
            <div class="mt-2 flex flex-wrap gap-1.5">${data.tags.map(([en, bn]) => `<span class="chip h-8 px-3 bg-white text-ink"><i data-lucide="check" class="${C.text}"></i>${t(en, bn)}</span>`).join('')}</div>
            <a href="https://wa.me/919830012345?text=${encodeURIComponent(theme.ask)}" target="_blank" rel="noopener" class="btn btn-line bg-white mt-7"><i data-lucide="message-square-plus"></i>${t('Leave a review', 'রিভিউ দিন')}</a>
          </div>

          <!-- Featured + others -->
          <div class="lg:col-span-8 min-w-0">
            <figure class="relative bg-card rounded-[22px] shadow-[0_1px_2px_rgba(16,24,40,.05),0_18px_40px_-22px_rgba(16,24,40,.35)] overflow-hidden grid sm:grid-cols-[1fr_200px]" aria-live="polite">
              <div class="p-6 sm:p-9 flex flex-col">
                <div class="flex items-center gap-3">
                  ${starRow(r.n)}
                  <span class="text-[13px] text-ink-3 num">${t(r.when[0], r.when[1])}</span>
                </div>
                <svg viewBox="0 0 48 36" class="mt-5 w-10 h-8 ${C.text}" aria-hidden="true"><path fill="currentColor" d="M0 36V22C0 9.6 6.4 2.3 19.2 0l2 5.3C14.6 7 11.2 11 10.9 17H20v19H0zm28 0V22C28 9.6 34.4 2.3 47.2 0l.8 5.3C41.4 7 38 11 37.7 17H48v19H28z"/></svg>
                <blockquote class="mt-4 font-display text-[1.22rem] sm:text-[1.6rem] leading-snug text-ink flex-1">${t(r.en, r.bn)}</blockquote>
                <figcaption class="mt-7 flex flex-wrap items-center gap-3">
                  <span class="w-11 h-11 rounded-full ${C.soft} ${C.text} grid place-items-center font-semibold shrink-0"><i data-lucide="${kind === 'catering' ? 'utensils' : 'sprout'}" class="w-5 h-5"></i></span>
                  <span class="min-w-0"><span class="block font-semibold leading-snug">${t(r.who[0], r.who[1])}</span><span class="block text-[13.5px] text-ink-3">${t(r.what[0], r.what[1])}</span></span>
                  <span class="w-full sm:w-auto sm:ml-auto flex justify-end gap-1.5 shrink-0">
                    <button type="button" data-rv-step="-1" class="w-10 h-10 rounded-full border border-rule grid place-items-center hover:bg-paper-2" aria-label="${L('Previous review', 'আগের রিভিউ')}"><i data-lucide="arrow-left" class="w-4 h-4"></i></button>
                    <button type="button" data-rv-step="1" class="w-10 h-10 rounded-full border border-rule grid place-items-center hover:bg-paper-2" aria-label="${L('Next review', 'পরের রিভিউ')}"><i data-lucide="arrow-right" class="w-4 h-4"></i></button>
                  </span>
                </figcaption>
              </div>
              <div class="hidden sm:block relative bg-paper-2">${photo(data.photo, { w: 500, cls: 'absolute inset-0 w-full h-full object-cover', sizes: '200px' })}<span class="absolute left-2 bottom-2 text-[10.5px] text-white bg-black/50 px-1.5 rounded">${credit(data.photo)}</span></div>
            </figure>

            <div class="mt-4 flex gap-3 overflow-x-auto no-scrollbar snap-x pb-1 -mx-1 px-1" role="group" aria-label="${L('More reviews', 'আরও রিভিউ')}">
              ${data.items.map((x, i) => `<button type="button" data-rv="${i}" aria-pressed="${i === cur}" class="snap-start shrink-0 w-[230px] sm:w-[220px] text-left rounded-2xl bg-white/70 hover:bg-white border border-transparent p-4 transition-colors aria-pressed:bg-white ${C.ring} aria-pressed:shadow-sm">
                ${starRow(x.n, 'w-3.5 h-3.5')}
                <span class="mt-2 text-[14px] leading-snug text-ink-2 line-clamp-3">${t(x.en, x.bn)}</span>
                <span class="mt-2 block text-[13px] font-semibold truncate">${t(x.who[0], x.who[1])}</span>
              </button>`).join('')}
            </div>
            <p class="mt-4 text-[12.5px] text-ink-3">${t('Prototype: sample reviews and numbers. Real ones, with each customer’s permission, go here before launch.', 'প্রোটোটাইপ: নমুনা রিভিউ ও সংখ্যা। চালুর আগে গ্রাহকের অনুমতি নিয়ে আসল রিভিউ বসবে।')}</p>
          </div>
        </div>
      </div>`;
    applyLang(root); refreshIcons();
    root.querySelectorAll('[data-rv]').forEach((b) => b.addEventListener('click', () => { cur = Number(b.dataset.rv); draw(`[data-rv="${cur}"]`); }));
    root.querySelectorAll('[data-rv-step]').forEach((b) => b.addEventListener('click', () => { cur = (cur + Number(b.dataset.rvStep) + data.items.length) % data.items.length; draw(`[data-rv-step="${b.dataset.rvStep}"]`); }));
    if (focusSel) root.querySelector(focusSel)?.focus();
  };
  draw();
  document.addEventListener('langchange', () => draw());
}
