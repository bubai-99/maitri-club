// Committee console: Panjika. The committee enters puja days, parbon and wedding days (with lagna)
// from the club's panjika; the website's Panjika page shows them next to the calculated tithi.
// Prototype: changes live in this tab only.
import { t, lang, toast, refreshIcons } from './shared.js';
import { panjikaDates, panjikaSource } from './data.js';
import { PLACE, BN_MONTHS, tithiName, panjikaDay, todayKey, parseKey, keyOf, istHM } from './panjika.js';

const bnD = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
const N = (v) => (lang === 'bn' ? bnD(v) : String(v));
const L = (en, bn) => (lang === 'bn' ? bn : en);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const MON = [['Jan', 'জানু'], ['Feb', 'ফেব্রু'], ['Mar', 'মার্চ'], ['Apr', 'এপ্রিল'], ['May', 'মে'], ['Jun', 'জুন'], ['Jul', 'জুলাই'], ['Aug', 'আগ'], ['Sep', 'সেপ্টে'], ['Oct', 'অক্টো'], ['Nov', 'নভে'], ['Dec', 'ডিসে']];
const gDate = (k) => { const { y, m, d } = parseKey(k); return `${N(d)} ${L(...MON[m - 1])} ${N(y)}`; };
const clock = (date) => { const [h, m] = istHM(date); const s = `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`; return lang === 'bn' ? bnD(s) : `${s} ${h < 12 ? 'am' : 'pm'}`; };
const KIND = { puja: ['Puja', 'পূজা', 'bg-sindoor text-white'], parbon: ['Parbon', 'পার্বণ', 'bg-marigold text-ink'], wedding: ['Wedding day', 'বিয়ের দিন', 'bg-turmeric-wash text-ink border border-turmeric/40'] };

let C;
let show = 'upcoming'; // or 'all'
let seq = 100;

export function panjikaScreen(ctx) {
  C = ctx;
  const today = todayKey();
  const p = panjikaDay(today);
  const rows = panjikaDates.filter((x) => show === 'all' || x.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  C.paint(C.screen('panjika'), `
    ${C.pageHead('Panjika', 'পঞ্জিকা', t('Puja days, parbon and wedding days from the club’s panjika. They show on the website’s Panjika page.', 'ক্লাবের পঞ্জিকা থেকে পূজা, পার্বণ ও বিয়ের দিন। ওয়েবসাইটের পঞ্জিকা পাতায় দেখা যায়।'), `
      <a href="index.html#panjika" target="_blank" rel="noopener" class="btn btn-line btn-sm"><i data-lucide="external-link"></i>${t('See on the website', 'ওয়েবসাইটে দেখুন')}</a>
      <button class="btn btn-line btn-sm" data-pj-add="wedding"><i data-lucide="heart"></i>${t('Add wedding day', 'বিয়ের দিন যোগ')}</button>
      <button class="btn btn-primary btn-sm" data-pj-add="puja"><i data-lucide="plus"></i>${t('Add puja or parbon', 'পূজা বা পার্বণ যোগ')}</button>`)}

    <div class="grid lg:grid-cols-3 gap-4 mb-6">
      <div class="paper-card p-5 lg:col-span-2">
        <p class="text-[12.5px] font-semibold uppercase tracking-wide text-ink-3">${t('Today, calculated', 'আজ, হিসাব করা')} · ${L(PLACE.en, PLACE.bn)}</p>
        <p class="mt-2 font-display text-[1.7rem] leading-tight">${N(p.bengali.day)} ${L(...BN_MONTHS[p.bengali.month])} ${N(p.bengali.year)}</p>
        <p class="mt-1 text-[15px] text-ink-2">${L(...tithiName(p.tithi.i))} ${L('till', 'শেষ')} ${keyOf(p.tithi.end) === today ? '' : `${gDate(keyOf(p.tithi.end))}, `}${clock(p.tithi.end)} · ${L('Sunrise', 'সূর্যোদয়')} ${clock(p.sun.rise)} · ${L('Sunset', 'সূর্যাস্ত')} ${clock(p.sun.set)}</p>
        <p class="mt-3 text-[13.5px] text-ink-3">${t('Tithi, nakshatra, sunrise and the Bengali date are worked out automatically. You only enter the days below.', 'তিথি, নক্ষত্র, সূর্যোদয় ও বাংলা তারিখ নিজে থেকেই হিসাব হয়। আপনি শুধু নিচের দিনগুলো দেবেন।')}</p>
      </div>
      <form class="paper-card p-5" id="pj-src-form">
        <label class="block"><span class="label">${t('Panjika we follow', 'আমরা যে পঞ্জিকা মানি')}</span>
          <input class="field" id="pj-src" value="${esc(L(panjikaSource.en, panjikaSource.bn))}" /></label>
        <p class="mt-2 text-[13px] text-ink-3">${t('Shown on the website next to the dates.', 'ওয়েবসাইটে তারিখের পাশে দেখানো হয়।')}</p>
        <button class="btn btn-line btn-sm mt-3">${t('Save', 'সেভ')}</button>
      </form>
    </div>

    <div class="flex flex-wrap items-center gap-2 mb-3">
      <button data-pj-show="upcoming" aria-pressed="${show === 'upcoming'}" class="chip h-9 px-3.5 text-sm border border-rule bg-card aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink">${t('Coming up', 'সামনে')}</button>
      <button data-pj-show="all" aria-pressed="${show === 'all'}" class="chip h-9 px-3.5 text-sm border border-rule bg-card aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink">${t('All', 'সব')}</button>
      <span class="ml-auto text-[13.5px] text-ink-3">${t(`${rows.length} days`, `${bnD(rows.length)}টি দিন`)}</span>
    </div>
    <div class="paper-card overflow-x-auto">
      <table class="khata-table">
        <thead><tr><th>${t('Date', 'তারিখ')}</th><th>${t('What', 'কী')}</th><th class="hidden md:table-cell">${t('Kind', 'ধরন')}</th><th>${t('Tithi at sunrise', 'সূর্যোদয়ের তিথি')}</th><th><span class="sr-only">${t('Remove', 'মুছুন')}</span></th></tr></thead>
        <tbody>${rows.map((x) => {
          const d = panjikaDay(x.date);
          const mismatch = x.tithi !== undefined && x.tithi !== d.tithi.i;
          return `<tr>
            <td class="whitespace-nowrap"><span class="font-semibold">${gDate(x.date)}</span><span class="block text-[13px] text-ink-3">${N(d.bengali.day)} ${L(...BN_MONTHS[d.bengali.month])}</span></td>
            <td><span class="font-semibold">${esc(L(x.en, x.bn))}</span>${x.lagna ? `<span class="block text-[13px] text-ink-2">${t('Lagna', 'লগ্ন')} ${esc(L(...x.lagna))}</span>` : ''}</td>
            <td class="hidden md:table-cell"><span class="chip h-7 px-2.5 text-[12.5px] ${KIND[x.kind][2]}">${t(KIND[x.kind][0], KIND[x.kind][1])}</span></td>
            <td>${L(...tithiName(d.tithi.i))}${mismatch ? `<span class="mt-1 flex items-start gap-1.5 text-[12.5px] text-sindoor-deep"><i data-lucide="triangle-alert" class="w-3.5 h-3.5 shrink-0 mt-0.5"></i>${t(`You entered ${tithiName(x.tithi)[0]}. Check the panjika.`, `আপনি দিয়েছেন ${tithiName(x.tithi)[1]}। পঞ্জিকা মিলিয়ে নিন।`)}</span>` : ''}</td>
            <td class="text-right"><button class="btn btn-ghost btn-sm px-2" data-pj-del="${x.id}" aria-label="${esc(L(`Remove ${x.en}, ${x.date}`, `মুছুন: ${x.bn}, ${x.date}`))}"><i data-lucide="trash-2"></i></button></td>
          </tr>`;
        }).join('') || `<tr><td colspan="5" class="text-center text-ink-3 py-8">${t('Nothing entered yet.', 'এখনও কিছু দেওয়া হয়নি।')}</td></tr>`}</tbody>
      </table>
    </div>
    <p class="mt-3 text-[13px] text-ink-3">${t('Prototype: the dates are samples and changes stay in this tab.', 'প্রোটোটাইপ: তারিখগুলো নমুনা, বদল শুধু এই ট্যাবেই থাকে।')}</p>`);
  wire();
}

function wire() {
  const root = C.screen('panjika');
  root.querySelectorAll('[data-pj-show]').forEach((b) => b.addEventListener('click', () => { show = b.dataset.pjShow; panjikaScreen(C); }));
  root.querySelectorAll('[data-pj-add]').forEach((b) => b.addEventListener('click', () => addDrawer(b.dataset.pjAdd)));
  root.querySelectorAll('[data-pj-del]').forEach((b) => b.addEventListener('click', () => {
    const i = panjikaDates.findIndex((x) => x.id === b.dataset.pjDel);
    if (i < 0) return;
    const [x] = panjikaDates.splice(i, 1);
    C.logAudit('events', `Removed panjika day “${x.en}”, ${x.date}`, `পঞ্জিকার দিন মোছা “${x.bn}”, ${x.date}`);
    toast(`<i data-lucide="check-circle-2"></i>${t('Removed', 'মোছা হয়েছে')}`);
    panjikaScreen(C);
  }));
  root.querySelector('#pj-src-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = root.querySelector('#pj-src').value.trim();
    if (!v) return;
    if (lang === 'bn') panjikaSource.bn = v; else panjikaSource.en = v;
    C.logAudit('events', `Panjika set to “${v}”`, `পঞ্জিকা: “${v}”`);
    toast(`<i data-lucide="check-circle-2"></i>${t('Saved', 'সেভ হয়েছে')}`);
  });
}

function addDrawer(kind) {
  const wedding = kind === 'wedding';
  const tithiOpts = `<option value="">${L('Not tied to a tithi (sankranti, Poila Boishakh)', 'তিথি নয় (সংক্রান্তি, পয়লা বৈশাখ)')}</option>`
    + Array.from({ length: 30 }, (_, i) => `<option value="${i}">${L(...tithiName(i))} · ${L(i < 15 ? 'Shukla' : 'Krishna', i < 15 ? 'শুক্ল' : 'কৃষ্ণ')}</option>`).join('');
  C.formDrawer(wedding ? 'Add a wedding day' : 'Add a puja or parbon', wedding ? 'বিয়ের দিন যোগ' : 'পূজা বা পার্বণ যোগ', `
    ${wedding ? '' : C.fld('Kind', 'ধরন', `<div data-pj-kind>${C.radioRow('pjkind', [['Puja', 'পূজা'], ['Parbon', 'পার্বণ']])}</div>`)}
    ${C.fld('Date', 'তারিখ', C.inp(`type="date" required name="date" min="${todayKey()}"`))}
    <p class="text-[13.5px] text-ink-2 -mt-2" data-pj-hint></p>
    ${wedding ? '' : `${C.fld('Name in English', 'নাম (ইংরেজিতে)', C.inp('required name="en" placeholder="Jagaddhatri Puja"'))}
    ${C.fld('Name in Bengali', 'নাম (বাংলায়)', C.inp('required name="bn" placeholder="জগদ্ধাত্রী পূজা"'))}
    ${C.fld('Tithi, as in the panjika', 'তিথি, পঞ্জিকা অনুযায়ী', `<select class="field" name="tithi">${tithiOpts}</select>`)}`}
    ${wedding ? `${C.fld('Lagna (English)', 'লগ্ন (ইংরেজিতে)', C.inp('required name="lagnaEn" placeholder="8:10 pm – 1:40 am"'))}
    ${C.fld('Lagna (Bengali)', 'লগ্ন (বাংলায়)', C.inp('required name="lagnaBn" placeholder="রাত ৮:১০ – ১:৪০"'))}` : ''}`,
  'Add', 'যোগ করুন', 'Added. It shows on the website’s Panjika page.', 'যোগ হয়েছে। ওয়েবসাইটের পঞ্জিকা পাতায় দেখা যাবে।', {
    onDone: (f) => {
      const v = (n) => f.querySelector(`[name="${n}"]`)?.value.trim();
      const date = v('date');
      const k = wedding ? 'wedding' : (f.querySelector('input[name="pjkind"]:checked')?.value === '1' ? 'parbon' : 'puja');
      const item = wedding
        ? { id: `w${++seq}`, kind: 'wedding', date, en: 'Wedding day', bn: 'বিয়ের দিন', lagna: [v('lagnaEn'), v('lagnaBn')] }
        : { id: `pj${++seq}`, kind: k, date, en: v('en'), bn: v('bn'), ...(v('tithi') !== '' ? { tithi: Number(v('tithi')) } : {}) };
      panjikaDates.push(item);
      C.logAudit('events', `Added panjika day “${item.en}”, ${date}`, `পঞ্জিকার দিন যোগ “${item.bn}”, ${date}`);
      panjikaScreen(C);
    },
  });
  // Show the calculated Bengali date and tithi as soon as a date is picked
  const form = document.querySelector('[data-drawer-form]');
  const dateIn = form.querySelector('[name="date"]');
  dateIn.addEventListener('change', () => {
    if (!dateIn.value) return;
    const d = panjikaDay(dateIn.value);
    form.querySelector('[data-pj-hint]').innerHTML = `<i data-lucide="moon-star" class="inline w-4 h-4 -mt-0.5"></i> ${N(d.bengali.day)} ${L(...BN_MONTHS[d.bengali.month])} ${N(d.bengali.year)} · ${L('tithi at sunrise', 'সূর্যোদয়ের তিথি')}: ${L(...tithiName(d.tithi.i))}`;
    const tSel = form.querySelector('[name="tithi"]');
    const isPuja = !form.querySelector('input[name="pjkind"]:checked') || form.querySelector('input[name="pjkind"]:checked').value === '0';
    if (tSel && tSel.value === '' && isPuja) tSel.value = String(d.tithi.i);
    refreshIcons();
  });
}
