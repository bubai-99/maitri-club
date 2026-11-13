import { boot, t, inr, dn, seal, router, applyLang, refreshIcons, toast, lang, setLang } from './shared.js';
import { peopleOf, cardFront, cardBack, fillQrs, printCards, downloadCard } from './idcard.js';
import { families, ledger, books, chanda, cateringOrders, cateringStatus, cateringPackages, plants, memberDiscount, notices, events, club } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const screen = (name) => $(`[data-screen="${name}"]`);
const paint = (el, html) => { el.innerHTML = html; applyLang(el); refreshIcons(); return el; };
const bookName = (k) => t(books[k].en, books[k].bn);
const bookDot = (k) => `<span class="book-${k} inline-block w-2.5 h-2.5 rounded-full bg-[color:var(--book)] shrink-0"></span>`;

const pageHead = (en, bn, sub = '', actions = '') => `
  <div class="flex flex-wrap items-end gap-4 mb-6">
    <div class="min-w-0">
      <h1 class="font-display text-[2.1rem] leading-tight">${t(en, bn)}</h1>
      ${sub ? `<p class="text-[15px] text-ink-2 mt-1">${sub}</p>` : ''}
    </div>
    <div class="ml-auto flex flex-wrap gap-2">${actions}</div>
  </div>`;

const statusChip = (s) => ({
  paid: `<span class="chip bg-paper-2 text-ink-2"><i data-lucide="check"></i>${t('Paid up', 'পরিশোধিত')}</span>`,
  due: `<span class="chip border border-ink/40 text-ink"><i data-lucide="clock"></i>${t('Due', 'বকেয়া')}</span>`,
  lapsed: `<span class="chip bg-ink text-white"><i data-lucide="alert-triangle"></i>${t('Lapsed', 'মেয়াদোত্তীর্ণ')}</span>`,
}[s]);

/* ---------------- Sidebar ---------------- */
$('#side-seal').innerHTML = seal({ size: 38, rotate: -6 });
const NAV = [
  { group: ['', ''], items: [['dashboard', 'layout-dashboard', 'Today', 'আজ']] },
  { group: ['Members', 'সদস্য'], items: [['members', 'users', 'Families', 'পরিবার'], ['collect', 'hand-coins', 'Collect payment', 'টাকা জমা'], ['dues', 'bell-ring', 'Dues & reminders', 'বকেয়া ও তাগাদা', String(families.filter((f) => f.due).length)], ['cards', 'id-card', 'ID cards', 'পরিচয়পত্র']] },
  { group: ['Books', 'খাতা'], items: [['khata', 'book-open', 'Khata', 'খাতা'], ['chanda', 'hand-heart', 'Puja chanda', 'পূজার চাঁদা']] },
  { group: ['Businesses', 'ব্যবসা'], items: [['catering', 'chef-hat', 'Catering', 'ক্যাটারিং', '2'], ['nursery', 'sprout', 'Nursery', 'নার্সারি']] },
  { group: ['Club', 'ক্লাব'], items: [['events', 'calendar-days', 'Events', 'অনুষ্ঠান'], ['meetings', 'megaphone', 'Notices & meetings', 'নোটিস ও সভা']] },
  { group: ['Admin', 'অ্যাডমিন'], items: [['reports', 'chart-column', 'Reports', 'রিপোর্ট'], ['settings', 'settings', 'Settings', 'সেটিংস']] },
];
paint($('#side-nav'), NAV.map((g) => `
  ${g.group[0] ? `<p class="px-3 mt-5 mb-1.5 text-[12px] font-semibold text-ink-3 tracking-wide">${t(g.group[0], g.group[1])}</p>` : ''}
  ${g.items.map(([id, icon, en, bn, badge]) => `
    <a href="#${id}" data-nav="${id}" class="flex items-center gap-3 px-3 h-10 rounded-lg text-ink-2 hover:bg-paper-3/50 aria-[current=page]:bg-card aria-[current=page]:text-ink aria-[current=page]:font-semibold aria-[current=page]:shadow-[0_1px_2px_rgba(29,33,64,.08)]">
      <i data-lucide="${icon}" class="w-[18px] h-[18px]"></i>${t(en, bn)}
      ${badge ? `<span class="ml-auto chip h-5 px-1.5 text-[11.5px] bg-sindoor text-white num">${dn(badge)}</span>` : ''}
    </a>`).join('')}`).join(''));

const side = $('#sidebar'), scrim = $('#scrim');
const lgMq = matchMedia('(min-width: 1024px)');
const syncInert = () => { side.inert = !lgMq.matches && side.classList.contains('-translate-x-full'); };
const closeSide = () => { side.classList.add('-translate-x-full'); scrim.classList.add('hidden'); syncInert(); };
$('#side-btn').addEventListener('click', () => { side.classList.remove('-translate-x-full'); scrim.classList.remove('hidden'); syncInert(); side.querySelector('a')?.focus(); });
lgMq.addEventListener('change', syncInert); syncInert();
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lgMq.matches) closeSide(); });
scrim.addEventListener('click', closeSide);
$$('#side-nav a').forEach((a) => a.addEventListener('click', closeSide));

/* ---------------- Drawer ---------------- */
let drawerReturn = null;
function openDrawer(html) {
  drawerReturn = document.activeElement;
  paint($('#drawer-body'), html);
  const d = $('#drawer');
  d.classList.remove('hidden');
  const h = d.querySelector('h2'); if (h) { h.id = 'drawer-title'; d.setAttribute('aria-labelledby', 'drawer-title'); }
  $('#drawer-body').focus();
}
function closeDrawer() { $('#drawer').classList.add('hidden'); drawerReturn?.focus?.(); }
window.addEventListener('hashchange', () => $('#drawer').classList.add('hidden'));
$('#drawer').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeDrawer(); });
$('#drawer').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') return closeDrawer();
  if (e.key !== 'Tab') return;
  const f = [...$('#drawer-body').querySelectorAll('a,button,input,select,textarea')].filter((x) => !x.disabled);
  if (!f.length) return;
  if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
  else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
});

/* ---------------- Dashboard ---------------- */
const pendingUpi = [
  { fam: families[4], amount: 500, utr: '431298765012', months: 'Jul–Nov', time: '2:14 pm' },
  { fam: families[1], amount: 200, utr: '431277120934', months: 'Oct–Nov', time: '11:02 am' },
];
function dashboard() {
  const totalIn = Object.values(books).reduce((a, b) => a + b.income, 0);
  const totalOut = Object.values(books).reduce((a, b) => a + b.expense, 0);
  const collected = chanda.areas.reduce((a, b) => a + b.got, 0) + 13000;
  const dueFams = families.filter((f) => f.dueMonths >= 3);
  paint(screen('dashboard'), `
    ${pageHead('Friday, 13 November', 'শুক্রবার, ১৩ নভেম্বর', t('Good evening, Tapas-da. Here is where the books stand.', 'শুভ সন্ধ্যা, তাপস-দা। খাতার হাল এই রকম।'))}

    <div class="grid xl:grid-cols-12 gap-6">
      <!-- Books sheet -->
      <div class="xl:col-span-7 paper-card overflow-hidden">
        <div class="px-5 pt-4 pb-3 flex items-center border-b border-rule">
          <h2 class="font-display text-xl">${t('November books', 'নভেম্বরের খাতা')}</h2>
          <a href="#khata" class="ml-auto text-sm font-semibold text-sindoor hover:underline">${t('Open khata', 'খাতা খুলুন')}</a>
        </div>
        <div class="overflow-x-auto">
        <table class="khata-table min-w-[480px]">
          <thead><tr><th>${t('Book', 'খাতা')}</th><th class="!text-right">${t('In (joma)', 'জমা')}</th><th class="!text-right">${t('Out (khoroch)', 'খরচ')}</th><th class="!text-right">${t('Surplus', 'উদ্বৃত্ত')}</th></tr></thead>
          <tbody>
            ${Object.entries(books).map(([k, b]) => `<tr>
              <td><a href="#khata/${k}" class="flex items-center gap-2.5 font-semibold hover:underline">${bookDot(k)}${bookName(k)}</a></td>
              <td class="amt">${inr(b.income)}</td><td class="amt text-ink-2">${inr(b.expense)}</td>
              <td class="amt font-semibold ${b.income - b.expense >= 0 ? 'text-tulsi' : 'text-sindoor'}">${inr(b.income - b.expense)}</td></tr>`).join('')}
            <tr class="[&>td]:border-b-[3px] [&>td]:border-double [&>td]:border-ink/70 font-semibold">
              <td>${t('All books', 'সব খাতা')}</td><td class="amt">${inr(totalIn)}</td><td class="amt">${inr(totalOut)}</td><td class="amt text-tulsi">${inr(totalIn - totalOut)}</td></tr>
          </tbody>
        </table>
        </div>
        <div class="px-5 py-4 border-t border-rule">
          <div class="flex items-baseline justify-between text-[15px]">
            <a href="#chanda" class="font-semibold hover:underline">${t('Saraswati Puja chanda', 'সরস্বতী পূজার চাঁদা')}</a>
            <span><span class="font-semibold">${inr(collected)}</span> <span class="text-ink-3">${t('of', 'এর মধ্যে')} ${inr(chanda.target)}</span></span>
          </div>
          <div class="mt-2 h-2.5 rounded-full bg-paper-2 overflow-hidden"><div class="h-full bg-sindoor rounded-full" style="width:${(collected / chanda.target) * 100}%"></div></div>
        </div>
      </div>

      <!-- Needs you -->
      <div class="xl:col-span-5">
        <h2 class="font-display text-xl mb-3">${t('Needs you today', 'আজকের কাজ')}</h2>
        <ul class="space-y-3" id="todo">
          ${pendingUpi.map((p, i) => `
          <li class="paper-card p-4" data-upi="${i}">
            <div class="flex items-start gap-3">
              <span class="w-9 h-9 rounded-full bg-marigold-wash text-turmeric grid place-items-center shrink-0"><i data-lucide="smartphone" class="w-[18px] h-[18px]"></i></span>
              <div class="flex-1 min-w-0">
                <p class="font-semibold leading-snug">${t(`UPI payment to confirm · ${p.fam.head}`, `ইউপিআই যাচাই · ${p.fam.headBn}`)}</p>
                <p class="text-sm text-ink-3 mt-0.5 num">${p.fam.no} · ${p.months} · UTR ${p.utr} · ${p.time}</p>
              </div>
              <span class="font-semibold">${inr(p.amount)}</span>
            </div>
            <div class="flex gap-2 mt-3 pl-12">
              <button class="btn btn-ink btn-sm" data-confirm="${i}"><i data-lucide="check"></i>${t('Matches bank, confirm', 'ব্যাংকে মিলেছে, নিশ্চিত')}</button>
              <button class="btn btn-ghost btn-sm" data-flag="${i}">${t('Not in bank yet', 'ব্যাংকে আসেনি')}</button>
            </div>
          </li>`).join('')}
          <li class="paper-card p-4 flex items-start gap-3">
            <span class="w-9 h-9 rounded-full bg-sindoor-wash text-sindoor grid place-items-center shrink-0"><i data-lucide="bell-ring" class="w-[18px] h-[18px]"></i></span>
            <div class="flex-1"><p class="font-semibold leading-snug">${t(`${dueFams.length} families owe 3 months or more`, `${dueFams.length}টি পরিবারের ৩ মাস বা বেশি বকেয়া`)}</p>
            <p class="text-sm text-ink-3 mt-0.5">${dueFams.slice(0, 3).map((f) => t(f.head, f.headBn)).join(', ')} …</p></div>
            <a href="#dues" class="btn btn-line btn-sm shrink-0">${t('Remind', 'তাগাদা')}</a>
          </li>
          <li class="paper-card p-4 flex items-start gap-3">
            <span class="w-9 h-9 rounded-full bg-turmeric-wash text-turmeric grid place-items-center shrink-0"><i data-lucide="chef-hat" class="w-[18px] h-[18px]"></i></span>
            <div class="flex-1"><p class="font-semibold leading-snug">${t('Riya & Arka wedding: quote sent 4 days ago', 'রিয়া ও অর্কর বিয়ে: ৪ দিন আগে কোটেশন গেছে')}</p>
            <p class="text-sm text-ink-3 mt-0.5">${t('220 plates · Bhoj · 6 Dec', '২২০ প্লেট · ভোজ · ৬ ডিসে')}</p></div>
            <a href="#catering" class="btn btn-line btn-sm shrink-0">${t('Follow up', 'খোঁজ নিন')}</a>
          </li>
          <li class="paper-card p-4 flex items-start gap-3">
            <span class="w-9 h-9 rounded-full bg-tulsi-wash text-tulsi grid place-items-center shrink-0"><i data-lucide="sprout" class="w-[18px] h-[18px]"></i></span>
            <div class="flex-1"><p class="font-semibold leading-snug">${t('3 plants almost out of stock', '৩টি গাছ প্রায় শেষ')}</p>
            <p class="text-sm text-ink-3 mt-0.5">${t('Snake plant, Chrysanthemum, Guava', 'স্নেক প্ল্যান্ট, চন্দ্রমল্লিকা, পেয়ারা')}</p></div>
            <a href="#nursery/stock" class="btn btn-line btn-sm shrink-0">${t('Restock', 'স্টক')}</a>
          </li>
        </ul>
      </div>

      <!-- Recent entries -->
      <div class="xl:col-span-12 paper-card overflow-hidden">
        <div class="px-5 pt-4 pb-3 flex items-center border-b border-rule">
          <h2 class="font-display text-xl">${t('Latest entries', 'সাম্প্রতিক এন্ট্রি')}</h2>
          <span class="ml-auto text-sm text-ink-3">${t('Every entry shows who wrote it', 'প্রতিটি এন্ট্রিতে লেখকের নাম থাকে')}</span>
        </div>
        ${ledgerTable(ledger.slice(0, 6), { compact: true })}
      </div>
    </div>`);
  const settle = (b, html) => {
    const li = b.closest('li');
    const prev = li.innerHTML;
    paint(li, html);
    li.querySelector('[data-undo]')?.addEventListener('click', () => dashboard());
  };
  $$('[data-confirm]').forEach((b) => b.addEventListener('click', () => {
    const p = pendingUpi[b.dataset.confirm];
    const no = nextReceipt();
    settle(b, `<div class="flex items-center gap-3" role="status"><span class="w-9 h-9 rounded-full bg-ink text-white grid place-items-center shrink-0"><i data-lucide="check" class="w-[18px] h-[18px]"></i></span>
      <div class="flex-1 min-w-0"><p class="font-semibold leading-snug">${t(`Confirmed · ${p.fam.head}`, `নিশ্চিত · ${p.fam.headBn}`)} · ${inr(p.amount)}</p>
      <p class="text-sm text-ink-3 mt-0.5 num">${t('Club book', 'ক্লাব খাতা')} · ${no} · ${t('receipt sent to app', 'রসিদ অ্যাপে গেছে')}</p></div>
      <button class="btn btn-ghost btn-sm" data-undo>${t('Undo', 'ফেরান')}</button></div>`);
  }));
  $$('[data-flag]').forEach((b) => b.addEventListener('click', () => {
    const p = pendingUpi[b.dataset.flag];
    settle(b, `<div class="flex items-center gap-3" role="status"><span class="w-9 h-9 rounded-full border-2 border-ink grid place-items-center shrink-0"><i data-lucide="flag" class="w-[18px] h-[18px]"></i></span>
      <div class="flex-1 min-w-0"><p class="font-semibold leading-snug">${t(`Held · ${p.fam.head}`, `আটকে রাখা · ${p.fam.headBn}`)}</p>
      <p class="text-sm text-ink-3 mt-0.5">${t('Not entered in the khata. Member asked to check the UTR.', 'খাতায় ওঠেনি। সদস্যকে UTR দেখতে বলা হয়েছে।')}</p></div>
      <button class="btn btn-ghost btn-sm" data-undo>${t('Undo', 'ফেরান')}</button></div>`);
  }));
}

let receiptSeq = 412;
const nextReceipt = () => `MC-26-${String(++receiptSeq).padStart(4, '0')}`;
const MONTHS = [['Jan', 'জানু'], ['Feb', 'ফেব্রু'], ['Mar', 'মার্চ'], ['Apr', 'এপ্রি'], ['May', 'মে'], ['Jun', 'জুন'], ['Jul', 'জুলা'], ['Aug', 'আগ'], ['Sep', 'সেপ্টে'], ['Oct', 'অক্টো'], ['Nov', 'নভে'], ['Dec', 'ডিসে']];
const dueRange = (n) => { const end = 10, start = (end - n + 1 + 12) % 12; return n === 1 ? MONTHS[end] : [`${MONTHS[start][0]}–${MONTHS[end][0]}`, `${MONTHS[start][1]}–${MONTHS[end][1]}`]; };

/* ---------------- Ledger table ---------------- */
function ledgerTable(rows, { compact = false } = {}) {
  const tin = rows.filter((r) => r.type === 'in').reduce((a, b) => a + b.amount, 0);
  const tout = rows.filter((r) => r.type === 'out').reduce((a, b) => a + b.amount, 0);
  return `<div class="overflow-x-auto"><div class="khata sm:min-w-[720px]">
    <table class="khata-table">
      <thead><tr>
        <th class="w-[56px] !px-2">${t('Date', 'তারিখ')}</th>
        <th class="!pl-4">${t('Particulars', 'বিবরণ')}</th>
        <th class="hidden md:table-cell">${t('Ref.', 'সূত্র')}</th>
        <th class="hidden md:table-cell">${t('Entered by', 'লিখেছেন')}</th>
        <th class="!text-right">${t('Joma (in)', 'জমা')}</th>
        <th class="!text-right">${t('Khoroch (out)', 'খরচ')}</th>
        ${compact ? '' : `<th><span class="sr-only">${t('Action', 'কাজ')}</span></th>`}
      </tr></thead>
      <tbody>
        ${rows.map((r, i) => `<tr${i && rows[i - 1].date !== r.date ? ' class="[&>td]:border-t-2 [&>td]:border-t-ink/30"' : ''}>
          <td class="!px-2 text-[13px] text-ink-2 num whitespace-nowrap">${i && rows[i - 1].date === r.date ? '' : dn(r.date)}</td>
          <td class="!pl-4"><span class="flex items-center gap-2.5">${bookDot(r.book)}<span>${t(r.head, r.headBn)}</span>${r.bill ? `<button class="text-ink-3 hover:text-ink" data-act="bill" data-head="${r.head}" data-amt="${r.amount}" aria-label="View bill photo" title="Bill photo"><i data-lucide="paperclip" class="w-4 h-4"></i></button>` : ''}</span></td>
          <td class="hidden md:table-cell text-[13px] text-ink-3 num whitespace-nowrap">${r.ref}</td>
          <td class="hidden md:table-cell text-[13px] text-ink-2 whitespace-nowrap">${r.by}</td>
          <td class="amt ${r.type === 'in' ? 'text-ink font-semibold' : ''}">${r.type === 'in' ? inr(r.amount) : ''}</td>
          <td class="amt ${r.type === 'out' ? 'text-sindoor font-semibold' : ''}">${r.type === 'out' ? inr(r.amount) : ''}</td>
          ${compact ? '' : `<td class="text-right"><button class="btn btn-ghost btn-sm text-ink-2" data-act="reverse" data-head="${r.head}" data-amt="${r.amount}" data-type="${r.type}">${t('Reverse', 'উল্টান')}</button></td>`}
        </tr>`).join('')}
        ${compact ? '' : `<tr class="font-semibold [&>td]:border-b-[3px] [&>td]:border-double [&>td]:border-ink/70 [&>td]:border-t-2 [&>td]:border-t-ink/70">
          <td></td><td class="!pl-4">${t('Page total', 'পাতার মোট')}</td><td class="hidden md:table-cell"></td><td class="hidden md:table-cell"></td>
          <td class="amt">${inr(tin)}</td><td class="amt text-sindoor">${inr(tout)}</td><td></td></tr>`}
      </tbody>
    </table></div></div>`;
}

/* ---------------- Members ---------------- */
let memFilter = 'all';
let memQuery = '';
function members() {
  const counts = { all: families.length, paid: 0, due: 0, lapsed: 0 };
  families.forEach((f) => counts[f.status]++);
  const list = families.filter((f) => (memFilter === 'all' || f.status === memFilter) && (`${f.head} ${f.headBn} ${f.no} ${f.phone}`.toLowerCase().includes(memQuery.toLowerCase())));
  paint(screen('members'), `
    ${pageHead('Families', 'পরিবার', t('286 families · 1,041 people · showing a sample of 24', '২৮৬টি পরিবার · ১,০৪১ জন · নমুনা ২৪টি'), `
      <button class="btn btn-line btn-sm" data-act="import"><i data-lucide="upload"></i>${t('Import from Excel', 'এক্সেল থেকে')}</button>
      <button class="btn btn-ink btn-sm" data-act="family"><i data-lucide="user-plus"></i>${t('Add family', 'পরিবার যোগ')}</button>`)}
    <div class="flex flex-wrap items-center gap-2 mb-4">
      ${['all', 'paid', 'due', 'lapsed'].map((k) => `<button data-mf="${k}" aria-pressed="${memFilter === k}" class="chip h-9 px-3.5 text-sm border border-rule bg-card aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink">${t({ all: 'All', paid: 'Paid up', due: 'Due', lapsed: 'Lapsed 6+ months' }[k], { all: 'সব', paid: 'পরিশোধিত', due: 'বকেয়া', lapsed: '৬+ মাস বকেয়া' }[k])} <span class="opacity-70 num">${dn(String(counts[k]))}</span></button>`).join('')}
      <input id="mem-q" value="${memQuery}" class="field h-9 w-full sm:w-64 sm:ml-auto text-sm" data-bn-ph="নাম, নম্বর বা ফোন" placeholder="Name, number or phone" />
    </div>
    <div class="paper-card overflow-x-auto">
      <table class="khata-table">
        <thead><tr><th>${t('Family', 'পরিবার')}</th><th class="hidden md:table-cell">${t('Lane', 'গলি')}</th><th class="hidden lg:table-cell">${t('People', 'সদস্য')}</th><th class="hidden lg:table-cell">${t('Phone', 'ফোন')}</th><th>${t('Status', 'অবস্থা')}</th><th class="!text-right">${t('Due', 'বকেয়া')}</th><th></th></tr></thead>
        <tbody>
          ${list.length ? list.map((f) => `<tr class="cursor-pointer" data-fam="${f.no}">
            <td><button type="button" data-open="${f.no}" class="font-semibold text-left hover:underline">${t(f.head, f.headBn)}</button><span class="block text-[13px] text-ink-3 num">${f.no} · ${t('since', 'থেকে')} ${dn(String(f.since))}</span></td>
            <td class="hidden md:table-cell text-ink-2">${t(f.lane, f.laneBn)}</td>
            <td class="hidden lg:table-cell num">${dn(String(f.size))}</td>
            <td class="hidden lg:table-cell num text-ink-2 whitespace-nowrap">${dn(f.phone.replace(/(\d{5})(\d{5})/, '$1 $2'))}</td>
            <td>${statusChip(f.status)}</td>
            <td class="amt ${f.due ? 'font-semibold text-sindoor' : 'text-ink-3'}">${f.due ? inr(f.due) : '—'}</td>
            <td class="text-right"><a href="#collect/${f.no}" class="btn btn-ghost btn-sm text-sindoor" data-stop>${t('Collect', 'জমা')}</a></td>
          </tr>`).join('') : `<tr><td colspan="7" class="!py-12 text-center text-ink-3">${t('No family matches. Check the spelling or search by phone number.', 'কোনো পরিবার মেলেনি। বানান দেখুন বা ফোন নম্বর দিয়ে খুঁজুন।')}</td></tr>`}
        </tbody>
      </table>
    </div>`);
  $$('[data-mf]').forEach((b) => b.addEventListener('click', () => { memFilter = b.dataset.mf; members(); }));
  const q = $('#mem-q');
  q.addEventListener('input', () => { memQuery = q.value; members(); const n = $('#mem-q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
  $$('[data-fam]').forEach((r) => r.addEventListener('click', (e) => { if (!e.target.closest('[data-stop]') && !e.target.closest('[data-open]')) familyDrawer(r.dataset.fam); }));
  $$('[data-open]').forEach((b) => b.addEventListener('click', () => familyDrawer(b.dataset.open)));
}

function familyDrawer(no) {
  const f = families.find((x) => x.no === no);
  openDrawer(`
    <div class="p-6">
      <div class="flex items-start">
        <div><p class="text-sm text-ink-3 num">${f.no}</p><h2 class="font-display text-[1.9rem] leading-tight">${t(f.head, f.headBn)}</h2><p class="text-ink-2">${t(f.lane, f.laneBn)} · ${t(`${f.size} people`, `${f.size} জন`)}</p></div>
        <button data-close class="ml-auto w-9 h-9 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      <div class="mt-5 rounded-lg ${f.due ? 'bg-sindoor-wash' : 'bg-tulsi-wash'} p-4 flex items-center">
        <div><p class="text-sm text-ink-2">${f.due ? t(`${f.dueMonths} months due`, `${f.dueMonths} মাস বকেয়া`) : t('Paid up to November', 'নভেম্বর পর্যন্ত পরিশোধিত')}</p>
        <p class="font-display text-3xl ${f.due ? 'text-sindoor-deep' : 'text-tulsi'}">${f.due ? inr(f.due) : inr(0)}</p></div>
        ${f.due ? `<a href="#collect/${f.no}" data-close class="btn btn-primary btn-sm ml-auto">${t('Collect', 'জমা নিন')}</a>` : ''}
      </div>
      <div class="mt-4 flex gap-2">
        <a href="tel:${f.phone}" class="btn btn-line btn-sm flex-1"><i data-lucide="phone"></i>${t('Call', 'ফোন')}</a>
        <a href="https://wa.me/91${f.phone}" target="_blank" rel="noopener" class="btn btn-line btn-sm flex-1"><i data-lucide="message-circle"></i>WhatsApp</a>
        <button class="btn btn-line btn-sm flex-1" data-act="family" data-no="${f.no}"><i data-lucide="pencil"></i>${t('Edit', 'সম্পাদনা')}</button>
      </div>
      <h3 class="font-display text-lg mt-7">${t('Payment history', 'পেমেন্টের ইতিহাস')}</h3>
      <ul class="mt-2 text-[15px]">
        ${[['12 Sep 2026', 'MC-26-0388', 300, 'Cash'], ['04 Jun 2026', 'MC-26-0214', 300, 'UPI'], ['09 Mar 2026', 'MC-26-0097', 300, 'Cash'], ['02 Dec 2025', 'MC-25-0512', 300, 'Cash']].map(([d, r, a, m]) => `
        <li class="flex items-center py-2.5 border-b border-rule"><span class="num">${r}</span><span class="text-ink-3 text-sm ml-3">${dn(d)} · ${m}</span><span class="ml-auto font-semibold">${inr(a)}</span></li>`).join('')}
      </ul>
      <h3 class="font-display text-lg mt-7">${t('Activity', 'কার্যকলাপ')}</h3>
      <ul class="mt-2 text-sm text-ink-2 space-y-2">
        <li>${t('Got Sports Day family pass · 10 Nov', 'ক্রীড়া পাস নিয়েছেন · ১০ নভে')}</li>
        <li>${t('Catering order CT-26-0036 · Nov', 'ক্যাটারিং অর্ডার CT-26-0036 · নভে')}</li>
        <li>${t('Voted in picnic poll · 11 Nov', 'পিকনিক ভোট দিয়েছেন · ১১ নভে')}</li>
      </ul>
    </div>`);
}

/* ---------------- Collect ---------------- */
let col = { fam: families[13], months: families[13].dueMonths, mode: 'cash', done: false, receipt: null };
function collect(param) {
  if (param) { const f = families.find((x) => x.no === param); if (f) col = { fam: f, months: Math.max(1, f.dueMonths || 1), mode: 'cash', done: false, receipt: null }; }
  const f = col.fam;
  const amount = col.months * club.monthlyFee;
  const opts = [...new Set([f.dueMonths || 1, 1, 3, 6, 12])].filter(Boolean).sort((a, b) => a - b);
  paint(screen('collect'), `
    ${pageHead('Collect payment', 'টাকা জমা নিন', t('Cash in hand or UPI. The receipt goes to the member’s app and WhatsApp.', 'হাতে নগদ বা ইউপিআই। রসিদ সদস্যের অ্যাপ ও হোয়াটসঅ্যাপে যাবে।'))}
    <div class="grid lg:grid-cols-12 gap-6 items-start">
      <form class="lg:col-span-7 paper-card p-5 sm:p-6 space-y-6" id="collect-form">
        <div>
          <label class="label" for="fam-pick">1 · ${t('Family', 'পরিবার')}</label>
          <div class="relative">
            <input id="fam-pick" class="field" role="combobox" aria-expanded="false" aria-controls="fam-list" autocomplete="off"
              value="${f.no} · ${lang === 'bn' ? f.headBn : f.head}" data-bn-ph="নাম, পরিবার নম্বর বা ফোন" placeholder="Type a name, family no. or phone" />
            <ul id="fam-list" role="listbox" class="hidden absolute z-10 left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-white border-2 border-ink rounded-[7px] shadow-[0_8px_24px_-8px_rgba(0,0,0,.3)]"></ul>
          </div>
          <p class="text-sm mt-2 ${f.due ? 'text-sindoor' : 'text-tulsi'}">${f.due ? (() => { const r = dueRange(f.dueMonths); return t(`${f.dueMonths} month${f.dueMonths > 1 ? 's' : ''} due (${r[0]})`, `${f.dueMonths} মাস বকেয়া (${r[1]})`); })() : t('Paid up. Anything now is advance.', 'বকেয়া নেই। এখন দিলে অগ্রিম।')}</p>
        </div>
        <div>
          <p class="label">2 · ${t('How many months?', 'কত মাসের?')}</p>
          <div class="flex flex-wrap gap-2">
            ${opts.map((m) => `<button type="button" data-m="${m}" aria-pressed="${col.months === m}" class="h-12 min-w-16 px-4 rounded-lg border border-rule bg-card font-semibold aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink">${dn(String(m))} <span class="font-normal text-sm opacity-75">${t(m === 1 ? 'month' : 'months', 'মাস')}</span>${m === f.dueMonths ? `<span class="block text-[11px] font-semibold opacity-80 -mt-0.5">${t('clears dues', 'বকেয়া শোধ')}</span>` : ''}</button>`).join('')}
          </div>
        </div>
        <div>
          <p class="label">3 · ${t('Paid by', 'মাধ্যম')}</p>
          <div class="grid grid-cols-2 gap-2 max-w-sm">
            <button type="button" data-mode="cash" aria-pressed="${col.mode === 'cash'}" class="h-12 rounded-lg border border-rule bg-card font-semibold flex items-center justify-center gap-2 aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink"><i data-lucide="banknote" class="w-5 h-5"></i>${t('Cash', 'নগদ')}</button>
            <button type="button" data-mode="upi" aria-pressed="${col.mode === 'upi'}" class="h-12 rounded-lg border border-rule bg-card font-semibold flex items-center justify-center gap-2 aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink"><i data-lucide="smartphone" class="w-5 h-5"></i>UPI</button>
          </div>
          ${col.mode === 'upi' ? `<label class="block mt-3 max-w-sm"><span class="label">${t('UTR (12 digits)', 'UTR (১২ সংখ্যা)')}</span><input class="field num" inputmode="numeric" placeholder="412356789012" /></label>` : ''}
        </div>
        ${col.done ? `<div class="rounded-lg bg-ink text-white p-4 flex items-center gap-3" role="status"><i data-lucide="check-circle-2" class="w-6 h-6 shrink-0"></i><div class="flex-1"><p class="font-semibold">${t('Recorded in the Club book', 'ক্লাব খাতায় উঠেছে')} · ${inr(amount)}</p><p class="text-sm text-white/85 num">${col.receipt} · ${t('receipt sent to the member app', 'রসিদ সদস্যের অ্যাপে গেছে')}</p></div><button type="button" id="undo-collect" class="btn btn-sm bg-white text-ink hover:bg-paper-2">${t('Undo', 'ফেরান')}</button></div>
        <button type="button" id="next-collect" class="btn btn-line w-full h-12">${t('Collect from another family', 'অন্য পরিবারের জমা')}</button>` : `<button class="btn btn-primary h-14 w-full text-[17px]">${t('Record', 'জমা করুন')} ${inr(amount)} ${t('and send receipt', 'ও রসিদ পাঠান')}</button>`}
      </form>

      <div class="lg:col-span-5">
        <p class="text-sm font-semibold text-ink-3 mb-2">${col.done ? t('Receipt sent', 'রসিদ পাঠানো হয়েছে') : t('Receipt preview', 'রসিদের নমুনা')}</p>
        <div class="relative bg-card border border-rule rounded-lg p-6 shadow-[0_1px_2px_rgba(29,33,64,.05),0_16px_32px_-20px_rgba(29,33,64,.35)]">
          <div class="flex items-center gap-3 border-b-2 border-ink pb-3">
            <span>${seal({ size: 48, rotate: -4 })}</span>
            <div class="leading-tight"><p class="font-display text-xl text-sindoor">${t('Maitri Club', 'মৈত্রী ক্লাব')}</p><p class="text-[11px] tracking-[0.14em] font-semibold text-ink-3">NETAJI PARA · ESTD 1972</p></div>
            <p class="ml-auto text-right text-sm"><span class="block text-ink-3">${t('Receipt', 'রসিদ')}</span><span class="font-semibold num">${col.receipt || t('next no.', 'পরের নং')}</span></p>
          </div>
          <p class="mt-4 text-[15px] leading-relaxed">${t('Received with thanks from', 'ধন্যবাদের সঙ্গে গৃহীত')} <strong>${t(f.head, f.headBn)}</strong> (${f.no}) ${t('the sum of', 'মোট')} <strong>${inr(amount)}</strong> ${t(`towards subscription for ${col.months} month${col.months > 1 ? 's' : ''}, by`, `${col.months} মাসের চাঁদা বাবদ,`)} ${col.mode === 'cash' ? t('cash', 'নগদে') : 'UPI'}.</p>
          <div class="mt-6 flex items-end justify-between">
            <div class="text-sm"><p class="font-display text-lg">${t('Tapas Mondal', 'তাপস মণ্ডল')}</p><p class="text-ink-3">${t('Treasurer · 13 Nov 2026', 'কোষাধ্যক্ষ · ১৩ নভে ২০২৬')}</p></div>
            <p class="font-display text-3xl">${inr(amount)}</p>
          </div>
          ${col.done ? `<div class="absolute right-24 top-16 ink-stamp">${seal({ size: 120, rotate: -10, className: 'stamp-in' })}</div>` : ''}
        </div>
        ${col.done ? `<div class="mt-3 flex gap-2">
          <a target="_blank" rel="noopener" href="https://wa.me/91${f.phone}?text=${encodeURIComponent(lang === 'bn' ? `নমস্কার, মৈত্রী ক্লাবে ₹${amount} জমা হয়েছে। রসিদ নং ${col.receipt}। ধন্যবাদ।` : `Namaskar, ₹${amount} received by Maitri Club. Receipt no. ${col.receipt}. Thank you.`)}" class="btn btn-line btn-sm flex-1"><i data-lucide="message-circle"></i>${t('Also send on WhatsApp', 'হোয়াটসঅ্যাপেও পাঠান')}</a>
          <button class="btn btn-line btn-sm flex-1"><i data-lucide="printer"></i>${t('Print', 'প্রিন্ট')}</button></div>` : ''}
      </div>
    </div>`);
  const pick = $('#fam-pick'), list = $('#fam-list');
  const showList = () => {
    const q = pick.value.toLowerCase().replace(/^mc-\d+ · /, '');
    const hits = families.filter((x) => `${x.no} ${x.head} ${x.headBn} ${x.phone}`.toLowerCase().includes(q)).slice(0, 8);
    list.innerHTML = hits.map((x, i) => `<li role="option" id="opt-${x.no}" data-no="${x.no}" aria-selected="${i === 0}" class="px-3 py-2.5 cursor-pointer flex items-center gap-2 aria-selected:bg-paper-2 hover:bg-paper-2">
      <span class="font-semibold">${lang === 'bn' ? x.headBn : x.head}</span><span class="text-sm text-ink-3 num">${x.no}</span>
      <span class="ml-auto text-sm ${x.due ? 'font-semibold' : 'text-ink-3'}">${x.due ? `₹${x.due} ${lang === 'bn' ? 'বকেয়া' : 'due'}` : (lang === 'bn' ? 'বকেয়া নেই' : 'paid up')}</span></li>`).join('')
      || `<li class="px-3 py-3 text-ink-3">${lang === 'bn' ? 'কেউ মেলেনি' : 'No family matches'}</li>`;
    list.classList.remove('hidden'); pick.setAttribute('aria-expanded', 'true');
  };
  pick.addEventListener('focus', () => { pick.select(); showList(); });
  pick.addEventListener('input', showList);
  pick.addEventListener('keydown', (e) => {
    const opts = [...list.querySelectorAll('[data-no]')]; const cur = opts.findIndex((o) => o.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const n = (cur + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length; opts.forEach((o, i) => o.setAttribute('aria-selected', String(i === n))); pick.setAttribute('aria-activedescendant', opts[n]?.id || ''); }
    if (e.key === 'Enter' && opts[cur]) { e.preventDefault(); location.hash = `collect/${opts[cur].dataset.no}`; }
    if (e.key === 'Escape') { list.classList.add('hidden'); pick.setAttribute('aria-expanded', 'false'); }
  });
  list.addEventListener('mousedown', (e) => { const o = e.target.closest('[data-no]'); if (o) location.hash = `collect/${o.dataset.no}`; });
  pick.addEventListener('blur', () => setTimeout(() => list.classList.add('hidden'), 150));
  $$('[data-m]').forEach((b) => b.addEventListener('click', () => { if (col.done) return; col.months = Number(b.dataset.m); collect(); }));
  $$('[data-mode]').forEach((b) => b.addEventListener('click', () => { if (col.done) return; col.mode = b.dataset.mode; collect(); }));
  $('#collect-form').addEventListener('submit', (e) => {
    e.preventDefault(); if (col.done) return;
    col.done = true; col.receipt = nextReceipt(); collect();
  });
  $('#undo-collect')?.addEventListener('click', () => { col.done = false; col.receipt = null; receiptSeq--; collect(); toast(`<i data-lucide="undo-2"></i>${t('Entry reversed. Nothing was kept in the khata.', 'এন্ট্রি ফেরানো হয়েছে। খাতায় কিছু থাকেনি।')}`); });
  $('#next-collect')?.addEventListener('click', () => { const f = families.find((x) => x.due && x !== col.fam) || families[0]; col = { fam: f, months: Math.max(1, f.dueMonths), mode: 'cash', done: false, receipt: null }; collect(); });
}

/* ---------------- Dues ---------------- */
function dues() {
  const list = families.filter((f) => f.due).sort((a, b) => b.dueMonths - a.dueMonths);
  const total = list.reduce((a, b) => a + b.due, 0);
  const msg = (f) => (lang === 'bn'
    ? `নমস্কার ${f.headBn}, মৈত্রী ক্লাবের ${f.dueMonths} মাসের চাঁদা ₹${f.due} বাকি আছে। অ্যাপে ইউপিআই-এ দিতে পারেন বা সন্ধ্যায় ক্লাব ঘরে তাপস-দাকে দিন। ধন্যবাদ।`
    : `Namaskar ${f.head}, your Maitri Club subscription of ₹${f.due} for ${f.dueMonths} months is due. Pay by UPI in the app, or to Tapas-da at the club room in the evening. Thank you.`);
  paint(screen('dues'), `
    ${pageHead('Dues & reminders', 'বকেয়া ও তাগাদা', `${t(`${list.length} families owe`, `${list.length}টি পরিবারের বকেয়া`)} <strong class="text-sindoor">${inr(total)}</strong>`)}
    <div class="grid lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-8 paper-card overflow-x-auto">
        <table class="khata-table">
          <thead><tr><th>${t('Family', 'পরিবার')}</th><th class="hidden sm:table-cell">${t('Months', 'মাস')}</th><th class="!text-right">${t('Due', 'বকেয়া')}</th><th class="hidden md:table-cell">${t('Last reminded', 'শেষ তাগাদা')}</th><th><span class="sr-only">${t('Action', 'কাজ')}</span></th></tr></thead>
          <tbody>
            ${list.map((f, i) => `<tr>
              <td><span class="font-semibold">${t(f.head, f.headBn)}</span><span class="block text-[13px] text-ink-3 num">${f.no} · ${t(f.lane, f.laneBn)}</span></td>
              <td class="hidden sm:table-cell"><span class="flex gap-0.5" role="img" aria-label="${f.dueMonths} months due">${Array.from({ length: 8 }, (_, k) => `<span class="w-2.5 h-5 rounded-sm ${k < f.dueMonths ? (f.dueMonths >= 6 ? 'bg-sindoor' : 'bg-marigold') : 'bg-paper-2'}"></span>`).join('')}</span></td>
              <td class="amt font-semibold">${inr(f.due)}</td>
              <td class="hidden md:table-cell text-sm text-ink-3">${i % 3 === 0 ? t('Never', 'কখনো না') : t(`${i + 2} days ago`, `${i + 2} দিন আগে`)}</td>
              <td class="text-right whitespace-nowrap">
                <a target="_blank" rel="noopener" href="https://wa.me/91${f.phone}?text=${encodeURIComponent(msg(f))}" class="btn btn-sm btn-ink"><i data-lucide="message-circle"></i>${t('Remind', 'তাগাদা')}</a>
              </td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="lg:col-span-4">
        <p class="text-sm font-semibold text-ink-3 mb-2">${t('WhatsApp message', 'হোয়াটসঅ্যাপ বার্তা')}</p>
        <div class="rounded-lg bg-[#e7ddc9] p-4">
          <div class="bg-[#dcf3d0] rounded-lg rounded-tr-sm p-3.5 text-[15px] leading-relaxed ml-6 shadow-[0_1px_1px_rgba(0,0,0,.08)]">${msg(list[0])}<span class="block text-right text-[11px] text-ink-3 mt-1">7:42 pm ✓✓</span></div>
        </div>
        <p class="text-sm text-ink-2 mt-3">${t('Opens WhatsApp on your phone with this filled in. Nothing is sent automatically and it costs nothing.', 'আপনার ফোনে হোয়াটসঅ্যাপ খুলবে, বার্তা লেখা থাকবে। নিজে থেকে কিছু যাবে না, খরচও নেই।')}</p>
        <div class="flex flex-wrap gap-2 mt-3"><button class="btn btn-line btn-sm" data-act="message"><i data-lucide="pencil"></i>${t('Edit message', 'বার্তা বদলান')}</button><button class="btn btn-ink btn-sm" data-act="remind-all"><i data-lucide="send"></i>${t('Remind all', 'সবাইকে তাগাদা')}</button></div>
      </div>
    </div>`);
}

/* ---------------- Khata ---------------- */
let khataBook = 'all';
function khata(param) {
  if (param && books[param]) khataBook = param;
  const rows = ledger.filter((r) => khataBook === 'all' || r.book === khataBook);
  paint(screen('khata'), `
    ${pageHead('Khata', 'খাতা', t('November 2026 · three books, one AGM report', 'নভেম্বর ২০২৬ · তিনটি খাতা, একটি এজিএম রিপোর্ট'), `
      <button class="btn btn-line btn-sm"><i data-lucide="printer"></i>${t('Print month', 'মাসের প্রিন্ট')}</button>
      <button class="btn btn-line btn-sm"><i data-lucide="file-spreadsheet"></i>${t('AGM report', 'এজিএম রিপোর্ট')}</button>
      <button class="btn btn-ink btn-sm" id="add-entry"><i data-lucide="plus"></i>${t('New entry', 'নতুন এন্ট্রি')}</button>`)}
    <div class="flex flex-wrap gap-2 mb-4" role="tablist">
      <button role="tab" data-book="all" aria-selected="${khataBook === 'all'}" class="chip h-9 px-3.5 text-sm border border-rule bg-card aria-selected:bg-ink aria-selected:text-paper aria-selected:border-ink">${t('All books', 'সব খাতা')}</button>
      ${Object.keys(books).map((k) => `<button role="tab" data-book="${k}" aria-selected="${khataBook === k}" class="book-${k} chip h-9 px-3.5 text-sm border border-rule bg-card aria-selected:bg-[color:var(--book)] aria-selected:text-white aria-selected:border-transparent">${bookDot(k)}${bookName(k)}</button>`).join('')}
      <select class="field h-9 w-auto text-sm ml-auto"><option>November 2026</option><option>October 2026</option><option>September 2026</option></select>
    </div>
    ${khataBook !== 'all' ? `<div class="grid grid-cols-3 gap-px bg-rule rounded-lg overflow-hidden border border-rule mb-4 book-${khataBook}">
      <div class="bg-card p-4"><p class="text-sm text-ink-3">${t('Joma this month', 'এ মাসের জমা')}</p><p class="font-display text-2xl">${inr(books[khataBook].income)}</p></div>
      <div class="bg-card p-4"><p class="text-sm text-ink-3">${t('Khoroch this month', 'এ মাসের খরচ')}</p><p class="font-display text-2xl text-sindoor">${inr(books[khataBook].expense)}</p></div>
      <div class="bg-card p-4"><p class="text-sm text-ink-3">${t('Surplus', 'উদ্বৃত্ত')}</p><p class="font-display text-2xl text-tulsi">${inr(books[khataBook].income - books[khataBook].expense)}</p></div>
    </div>` : ''}
    <div class="paper-card overflow-hidden">${ledgerTable(rows)}</div>
    <p class="text-sm text-ink-3 mt-3">${t('Entries cannot be deleted, only reversed with a note. Every change is logged for the auditor.', 'এন্ট্রি মোছা যায় না, শুধু নোট দিয়ে উল্টানো যায়। প্রতিটি পরিবর্তন অডিটরের জন্য রাখা থাকে।')}</p>`);
  $$('[data-book]').forEach((b) => b.addEventListener('click', () => { khataBook = b.dataset.book; khata(); }));
  $('#add-entry').addEventListener('click', entryDrawer);
}
function entryDrawer() {
  openDrawer(`
    <form class="p-6 space-y-4" id="entry-form">
      <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t('New khata entry', 'নতুন এন্ট্রি')}</h2>
        <button type="button" data-close class="ml-auto w-9 h-9 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
      <div><p class="label">${t('Book', 'খাতা')}</p><div class="grid grid-cols-3 gap-2">
        ${Object.keys(books).map((k, i) => `<label class="book-${k} flex items-center justify-center gap-2 h-11 rounded-lg border border-rule bg-card cursor-pointer font-semibold has-[:checked]:border-[color:var(--book)] has-[:checked]:bg-[color:var(--book-wash)]"><input type="radio" name="book" class="sr-only" ${i === 0 ? 'checked' : ''} />${bookDot(k)}${bookName(k)}</label>`).join('')}</div></div>
      <div><p class="label">${t('Type', 'ধরন')}</p><div class="grid grid-cols-2 gap-2">
        <label class="flex items-center justify-center h-11 rounded-lg border border-rule bg-card cursor-pointer font-semibold has-[:checked]:bg-ink has-[:checked]:text-paper"><input type="radio" name="ty" class="sr-only" />${t('Joma (in)', 'জমা')}</label>
        <label class="flex items-center justify-center h-11 rounded-lg border border-rule bg-card cursor-pointer font-semibold has-[:checked]:bg-sindoor has-[:checked]:text-white"><input type="radio" name="ty" class="sr-only" checked />${t('Khoroch (out)', 'খরচ')}</label></div></div>
      <label class="block"><span class="label">${t('Amount', 'টাকা')}</span><input class="field num text-xl h-12" inputmode="numeric" value="1870" /></label>
      <label class="block"><span class="label">${t('Head', 'খাত')}</span><select class="field"><option>Electricity</option><option>Puja expenses</option><option>Repairs</option><option>Stationery</option><option>Other</option></select></label>
      <label class="block"><span class="label">${t('Note', 'বিবরণ')}</span><input class="field" value="CESC bill, October" /></label>
      <div><p class="label">${t('Bill photo', 'বিলের ছবি')}</p>
        <button type="button" class="w-full h-28 rounded-lg border-2 border-dashed border-rule bg-card text-ink-2 flex flex-col items-center justify-center gap-1.5 hover:border-ink/30"><i data-lucide="camera" class="w-6 h-6"></i><span class="text-sm">${t('Take a photo of the bill', 'বিলের ছবি তুলুন')}</span></button></div>
      <button class="btn btn-ink w-full h-12">${t('Save entry', 'এন্ট্রি সেভ করুন')}</button>
    </form>`);
  $('#entry-form').addEventListener('submit', (e) => { e.preventDefault(); $('#drawer').classList.add('hidden'); toast(`<i data-lucide="check-circle-2"></i>${t('Entry saved in the Club book', 'ক্লাব খাতায় এন্ট্রি সেভ হয়েছে')}`); });
}

/* ---------------- Chanda ---------------- */
function chandaScreen() {
  const got = chanda.areas.reduce((a, b) => a + b.got, 0);
  const spons = chanda.sponsors.filter((s) => s.status === 'paid').reduce((a, b) => a + b.amount, 0);
  const total = got + spons;
  const budget = chanda.budget.reduce((a, b) => a + b.amount, 0);
  paint(screen('chanda'), `
    ${pageHead(chanda.event, chanda.eventBn, t('11 February 2027 · chanda books handed out on 1 November', '১১ ফেব্রুয়ারি ২০২৭ · ১ নভেম্বর চাঁদার বই দেওয়া হয়েছে'), `
      <button class="btn btn-line btn-sm" data-act="chanda-book"><i data-lucide="book-plus"></i>${t('Issue chanda book', 'চাঁদার বই দিন')}</button>
      <button class="btn btn-ink btn-sm" data-act="chanda"><i data-lucide="plus"></i>${t('Record chanda', 'চাঁদা লিখুন')}</button>`)}
    <div class="paper-card p-5 sm:p-6">
      <div class="flex flex-wrap items-end gap-x-8 gap-y-2">
        <div><p class="text-sm text-ink-3">${t('Collected so far', 'এখন পর্যন্ত সংগ্রহ')}</p><p class="font-display text-[2.6rem] leading-none text-sindoor mt-1">${inr(total)}</p></div>
        <p class="text-[15px] text-ink-2 pb-1">${t('Target', 'লক্ষ্য')} ${inr(chanda.target)} · ${t('Budget', 'বাজেট')} ${inr(budget)} · <span class="font-semibold text-ink">${inr(chanda.target - total)} ${t('to go', 'বাকি')}</span></p>
      </div>
      <div class="mt-4 h-4 rounded-full bg-paper-2 overflow-hidden flex">
        <div class="h-full bg-sindoor" style="width:${(got / chanda.target) * 100}%" title="Door to door"></div>
        <div class="h-full bg-marigold" style="width:${(spons / chanda.target) * 100}%" title="Sponsors"></div>
      </div>
      <div class="mt-2 flex gap-5 text-sm text-ink-2"><span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-sindoor"></span>${t('Door to door', 'বাড়ি বাড়ি')} ${inr(got)}</span><span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-marigold"></span>${t('Sponsors', 'স্পনসর')} ${inr(spons)}</span></div>
    </div>

    <div class="grid xl:grid-cols-12 gap-6 mt-6 items-start">
      <div class="xl:col-span-8 paper-card overflow-x-auto">
        <div class="px-5 pt-4 pb-3 border-b border-rule"><h2 class="font-display text-xl">${t('By area', 'এলাকা অনুযায়ী')}</h2></div>
        <table class="khata-table min-w-[640px]">
          <thead><tr><th>${t('Area', 'এলাকা')}</th><th>${t('Volunteer', 'স্বেচ্ছাসেবক')}</th><th>${t('Houses visited', 'বাড়ি গেছেন')}</th><th class="w-[30%]">${t('Collected / target', 'সংগ্রহ / লক্ষ্য')}</th></tr></thead>
          <tbody>${chanda.areas.map((a) => {
            const pct = Math.round((a.got / a.target) * 100);
            return `<tr>
              <td class="font-semibold">${t(a.lane, a.laneBn)}</td>
              <td class="text-ink-2">${a.volunteer}</td>
              <td class="num">${dn(`${a.visited} / ${a.houses}`)}</td>
              <td><div class="flex items-center gap-3"><div class="flex-1 h-2 rounded-full bg-paper-2 overflow-hidden"><div class="h-full rounded-full ${pct >= 80 ? 'bg-tulsi' : pct >= 50 ? 'bg-marigold' : 'bg-sindoor'}" style="width:${pct}%"></div></div><span class="text-sm num whitespace-nowrap">${inr(a.got)} <span class="text-ink-3">/ ${inr(a.target)}</span></span></div></td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
      <div class="xl:col-span-4 space-y-6">
        <div class="paper-card">
          <div class="px-5 pt-4 pb-3 border-b border-rule"><h2 class="font-display text-xl">${t('Sponsors', 'স্পনসর')}</h2></div>
          <ul class="px-5">${chanda.sponsors.map((s) => `<li class="py-3 border-b border-rule last:border-0 flex items-start gap-3">
            <div class="flex-1"><p class="font-semibold">${t(s.name, s.nameBn)}</p><p class="text-sm text-ink-3">${t(s.gives, s.givesBn)}</p></div>
            <div class="text-right"><p class="font-semibold">${inr(s.amount)}</p><p class="text-[12.5px] ${s.status === 'paid' ? 'text-tulsi' : 'text-turmeric'} font-semibold">${s.status === 'paid' ? t('Received', 'পেয়েছি') : t('Promised', 'প্রতিশ্রুত')}</p></div></li>`).join('')}</ul>
        </div>
        <div class="paper-card">
          <div class="px-5 pt-4 pb-3 border-b border-rule"><h2 class="font-display text-xl">${t('Budget', 'বাজেট')}</h2></div>
          <ul class="px-5 text-[15px]">${chanda.budget.map((b) => `<li class="py-2.5 border-b border-rule last:border-0 flex"><span>${t(b.head, b.headBn)}</span><span class="ml-auto num">${inr(b.amount)}</span></li>`).join('')}</ul>
        </div>
      </div>
    </div>`);
}

/* ---------------- Catering ---------------- */
let selOrder = 'CT-26-0042';
function catering() {
  const cols = ['enquiry', 'quoted', 'advance', 'done', 'settled'];
  const o = cateringOrders.find((x) => x.id === selOrder);
  const pkg = cateringPackages.find((p) => p.id === o.pkg);
  const rate = pkg.rate - (o.member ? 20 : 0);
  paint(screen('catering'), `
    ${pageHead('Catering orders', 'ক্যাটারিং অর্ডার', t('Debashis Pal · 7 orders this season', 'দেবাশিস পাল · এই মরসুমে ৭টি অর্ডার'), `<button class="btn btn-ink btn-sm" data-act="enquiry"><i data-lucide="plus"></i>${t('New enquiry', 'নতুন জিজ্ঞাসা')}</button>`)}
    <div class="grid xl:grid-cols-12 gap-6 items-start">
      <div class="xl:col-span-7 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div class="grid grid-cols-5 gap-3 min-w-[920px]">
          ${cols.map((c) => {
            const list = cateringOrders.filter((x) => x.status === c);
            return `<div class="bg-paper-2/70 rounded-lg p-2.5">
              <p class="px-1.5 pt-1 pb-2.5 text-sm font-semibold text-ink-2 flex">${t(cateringStatus[c].en, cateringStatus[c].bn)}<span class="ml-auto num text-ink-3">${dn(String(list.length))}</span></p>
              <div class="space-y-2">${list.map((x) => `
                <button data-order="${x.id}" class="w-full text-left bg-card rounded-lg border ${x.id === selOrder ? 'border-turmeric ring-2 ring-turmeric/25' : 'border-rule'} p-3 hover:border-turmeric/60">
                  <p class="font-semibold leading-tight">${t(x.customer, x.customerBn)}</p>
                  <p class="text-[13px] text-ink-3 mt-0.5">${x.occasion} · ${dn(x.date)}</p>
                  <p class="mt-2 flex items-center gap-2 text-sm whitespace-nowrap"><span class="num text-ink-2">${dn(String(x.guests))} ${t('plates', 'প্লেট')}</span>${x.member ? `<span class="chip h-5 px-1.5 text-[11px] bg-sindoor-wash text-sindoor-deep">${t('Member', 'সদস্য')}</span>` : ''}</p>
                  <p class="mt-1 font-semibold">${inr(x.amount)}</p>
                </button>`).join('') || `<p class="text-sm text-ink-3 px-1.5 py-3">${t('Nothing here', 'কিছু নেই')}</p>`}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="xl:col-span-5 paper-card book-catering">
        <div class="p-5 border-b border-rule">
          <p class="text-sm text-ink-3 num">${o.id} · ${t(cateringStatus[o.status].en, cateringStatus[o.status].bn)}</p>
          <h2 class="font-display text-2xl leading-tight">${t(o.customer, o.customerBn)}</h2>
          <p class="text-ink-2 text-[15px]">${o.occasion} · ${dn(o.date)} · ${dn(String(o.guests))} ${t('guests', 'অতিথি')}</p>
        </div>
        <div class="p-5">
          <p class="text-sm font-semibold text-ink-3">${t('Quotation', 'কোটেশন')}</p>
          <table class="w-full text-[15px] mt-2">
            <tr><td class="py-1.5">${t(`${pkg.name} menu`, `${pkg.nameBn} মেনু`)}</td><td class="text-right num">${dn(String(o.guests))} × ${inr(rate)}</td></tr>
            <tr><td class="py-1.5 text-ink-2">${t('Serving staff & plates', 'পরিবেশন ও প্লেট')}</td><td class="text-right text-ink-2">${t('included', 'সহ')}</td></tr>
            <tr class="border-t-2 border-ink font-semibold"><td class="py-2">${t('Total', 'মোট')}</td><td class="text-right">${inr(o.guests * rate)}</td></tr>
            <tr><td class="py-1.5 text-ink-2">${t('Advance (20%)', 'অগ্রিম (২০%)')}</td><td class="text-right">${inr(Math.round(o.guests * rate * 0.2))}</td></tr>
            <tr><td class="py-1.5 text-ink-2">${t('Received', 'পাওয়া গেছে')}</td><td class="text-right text-tulsi font-semibold">${inr(o.paid)}</td></tr>
            <tr class="font-semibold"><td class="py-1.5">${t('Balance', 'বাকি')}</td><td class="text-right text-sindoor">${inr(o.guests * rate - o.paid)}</td></tr>
          </table>
          <p class="text-sm font-semibold text-ink-3 mt-5">${t('Menu', 'মেনু')}</p>
          <p class="text-[15px] text-ink-2 mt-1 leading-relaxed">${pkg.menu.map((m, i) => t(m, pkg.menuBn[i])).join(' · ')}</p>
          <div class="grid grid-cols-2 gap-2 mt-5">
            <button class="btn btn-ink btn-sm" data-act="quote"><i data-lucide="send"></i>${t('Send quote', 'কোটেশন পাঠান')}</button>
            <button class="btn btn-line btn-sm" data-act="cat-pay"><i data-lucide="indian-rupee"></i>${t('Record payment', 'টাকা জমা')}</button>
            <button class="btn btn-line btn-sm" data-act="bazaar"><i data-lucide="shopping-basket"></i>${t('Bazaar list', 'বাজারের ফর্দ')}</button>
            <button class="btn btn-line btn-sm" data-act="cat-exp"><i data-lucide="receipt"></i>${t('Expenses', 'খরচ')}</button>
          </div>
        </div>
      </div>
    </div>`);
  $$('[data-order]').forEach((b) => b.addEventListener('click', () => { selOrder = b.dataset.order; catering(); }));
}

/* ---------------- Nursery ---------------- */
let nTab = 'counter';
const cart = new Map();
let cartMember = true;
function nursery(param) {
  if (param === 'stock') nTab = 'stock';
  const items = [...cart.entries()].map(([id, q]) => ({ p: plants.find((x) => x.id === id), q }));
  const sub = items.reduce((a, b) => a + b.q * b.p.price, 0);
  const disc = cartMember ? Math.round(sub * memberDiscount) : 0;
  paint(screen('nursery'), `
    ${pageHead('Nursery', 'নার্সারি', t('Sutapa Bose · counter open 5–8 pm', 'সুতপা বসু · কাউন্টার খোলা বিকেল ৫–৮টা'))}
    <div class="flex gap-2 mb-5" role="tablist">
      <button role="tab" data-nt="counter" aria-selected="${nTab === 'counter'}" class="chip h-9 px-3.5 text-sm border border-rule bg-card aria-selected:bg-tulsi aria-selected:text-white aria-selected:border-tulsi"><i data-lucide="shopping-cart"></i>${t('Counter sale', 'কাউন্টার বিক্রি')}</button>
      <button role="tab" data-nt="stock" aria-selected="${nTab === 'stock'}" class="chip h-9 px-3.5 text-sm border border-rule bg-card aria-selected:bg-tulsi aria-selected:text-white aria-selected:border-tulsi"><i data-lucide="boxes"></i>${t('Stock', 'স্টক')}</button>
    </div>
    ${nTab === 'counter' ? `
    <div class="grid lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-7 xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
        ${plants.map((p) => `<button data-pa="${p.id}" ${p.stock === 0 ? 'disabled' : ''} class="text-left bg-card rounded-lg border ${cart.has(p.id) ? 'border-tulsi ring-2 ring-tulsi/25' : 'border-rule'} p-3 hover:border-tulsi/60 disabled:opacity-45 disabled:cursor-not-allowed relative">
          <span class="w-9 h-9 rounded-lg bg-tulsi-wash text-tulsi grid place-items-center"><i data-lucide="${p.icon}" class="w-5 h-5"></i></span>
          ${cart.has(p.id) ? `<span class="absolute top-2.5 right-2.5 chip h-6 px-2 bg-tulsi text-white num">${dn('×' + cart.get(p.id))}</span>` : ''}
          <span class="block font-semibold leading-tight mt-2 text-[15px]">${t(p.name, p.nameBn)}</span>
          <span class="block text-sm text-ink-3 mt-0.5">${p.pot} · ${inr(p.price)}</span>
          <span class="block text-[12.5px] mt-1 ${p.stock === 0 ? 'text-ink-3' : p.stock < 10 ? 'text-sindoor font-semibold' : 'text-ink-3'}">${p.stock === 0 ? t('Out of stock', 'স্টকে নেই') : t(`${p.stock} in stock`, `${p.stock}টি আছে`)}</span>
        </button>`).join('')}
      </div>
      <div class="lg:col-span-5 xl:col-span-4 paper-card lg:sticky lg:top-24">
        <div class="p-5 border-b border-rule flex items-center"><h2 class="font-display text-xl">${t('Bill', 'বিল')}</h2><span class="ml-auto text-sm text-ink-3 num">NS-26-0312</span></div>
        <div class="p-5">
          ${items.length ? `<ul class="text-[15px]">${items.map(({ p, q }) => `<li class="flex items-center gap-2 py-2 border-b border-rule">
            <span class="flex-1">${t(p.name, p.nameBn)}</span>
            <span class="flex items-center rounded-md border border-rule"><button data-pd="${p.id}" class="w-7 h-7 grid place-items-center" aria-label="Less"><i data-lucide="minus" class="w-3.5 h-3.5"></i></button><span class="w-6 text-center num">${dn(String(q))}</span><button data-pa="${p.id}" class="w-7 h-7 grid place-items-center" aria-label="More"><i data-lucide="plus" class="w-3.5 h-3.5"></i></button></span>
            <span class="w-16 text-right num">${inr(p.price * q)}</span></li>`).join('')}</ul>`
          : `<p class="text-[15px] text-ink-3 py-6 text-center">${t('Tap plants on the left to add them.', 'বাঁদিকের গাছে চাপ দিয়ে যোগ করুন।')}</p>`}
          <label class="flex items-center gap-2.5 mt-4 text-[15px]"><input type="checkbox" id="cart-member" ${cartMember ? 'checked' : ''} class="w-5 h-5 accent-[#2c6a3a]" />${t('Member (MC-0104), 10% off', 'সদস্য (MC-0104), ১০% ছাড়')}</label>
          <dl class="mt-4 text-[15px] space-y-1">
            <div class="flex"><dt class="text-ink-2">${t('Subtotal', 'মোট')}</dt><dd class="ml-auto num">${inr(sub)}</dd></div>
            <div class="flex"><dt class="text-ink-2">${t('Member discount', 'সদস্য ছাড়')}</dt><dd class="ml-auto num text-tulsi">−${inr(disc)}</dd></div>
            <div class="flex font-semibold text-lg border-t-2 border-ink pt-2 mt-2"><dt>${t('To collect', 'নিতে হবে')}</dt><dd class="ml-auto font-display text-2xl">${inr(sub - disc)}</dd></div>
          </dl>
          <div class="grid grid-cols-2 gap-2 mt-4">
            <button data-sale="cash" ${items.length ? '' : 'disabled'} class="btn bg-tulsi text-white hover:bg-[#1f5029]"><i data-lucide="banknote"></i>${t('Cash', 'নগদ')}</button>
            <button data-sale="upi" ${items.length ? '' : 'disabled'} class="btn btn-line"><i data-lucide="qr-code"></i>${t('UPI QR', 'ইউপিআই')}</button>
          </div>
        </div>
      </div>
    </div>` : `
    <div class="paper-card overflow-x-auto">
      <table class="khata-table min-w-[700px]">
        <thead><tr><th>${t('Plant', 'গাছ')}</th><th>${t('Pot', 'টব')}</th><th class="!text-right">${t('Price', 'দাম')}</th><th class="!text-right">${t('In stock', 'স্টক')}</th><th>${t('Sold this month', 'এ মাসে বিক্রি')}</th><th></th></tr></thead>
        <tbody>${plants.map((p, i) => `<tr>
          <td><span class="flex items-center gap-2.5"><span class="w-8 h-8 rounded-lg bg-tulsi-wash text-tulsi grid place-items-center"><i data-lucide="${p.icon}" class="w-4 h-4"></i></span><span class="font-semibold">${t(p.name, p.nameBn)}</span></span></td>
          <td class="text-ink-2">${p.pot}</td>
          <td class="amt">${inr(p.price)}</td>
          <td class="amt font-semibold ${p.stock === 0 ? 'text-ink-3' : p.stock < 10 ? 'text-sindoor' : ''}">${p.stock === 0 ? t('Out', 'শেষ') : inr(p.stock, { plain: true })}${p.stock > 0 && p.stock < 10 ? ` <i data-lucide="triangle-alert" class="w-4 h-4 inline -mt-0.5"></i>` : ''}</td>
          <td class="num text-ink-2">${dn(String((i * 7 + 5) % 23))}</td>
          <td class="text-right whitespace-nowrap"><button class="btn btn-ghost btn-sm" data-act="stock-in" data-plant="${p.id}">${t('Stock in', 'স্টক যোগ')}</button><button class="btn btn-ghost btn-sm text-ink-2" data-act="loss" data-plant="${p.id}">${t('Loss', 'নষ্ট')}</button></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`}`);
  $$('[data-nt]').forEach((b) => b.addEventListener('click', () => { nTab = b.dataset.nt; nursery(); }));
  $$('[data-pa]').forEach((b) => b.addEventListener('click', () => { const p = plants.find((x) => x.id === b.dataset.pa); cart.set(p.id, Math.min(p.stock, (cart.get(p.id) || 0) + 1)); nursery(); }));
  $$('[data-pd]').forEach((b) => b.addEventListener('click', () => { const v = cart.get(b.dataset.pd) - 1; if (v <= 0) cart.delete(b.dataset.pd); else cart.set(b.dataset.pd, v); nursery(); }));
  $('#cart-member')?.addEventListener('change', (e) => { cartMember = e.target.checked; nursery(); });
  $$('[data-sale]').forEach((b) => b.addEventListener('click', () => {
    cart.clear(); nursery();
    toast(`<i data-lucide="check-circle-2"></i>${t('Sale NS-26-0312 saved in the Nursery book. Stock updated.', 'বিক্রি NS-26-0312 নার্সারি খাতায় উঠেছে। স্টক আপডেট হয়েছে।')}`);
  }));
}

/* ---------------- Meetings & notices ---------------- */
function meetings() {
  paint(screen('meetings'), `
    ${pageHead('Notices & meetings', 'নোটিস ও সভা')}
    <div class="grid xl:grid-cols-12 gap-6 items-start">
      <form class="xl:col-span-7 paper-card p-5 sm:p-6 space-y-4" id="notice-form">
        <h2 class="font-display text-xl">${t('Put up a notice', 'নোটিস দিন')}</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <label class="block"><span class="label">${t('Title (English)', 'শিরোনাম (ইংরেজি)')}</span><input class="field" value="Committee meeting — Saraswati Puja planning" /></label>
          <label class="block"><span class="label">${t('Title (Bengali)', 'শিরোনাম (বাংলা)')}</span><input class="field" value="কমিটি সভা — সরস্বতী পূজার প্রস্তুতি" /></label>
        </div>
        <label class="block"><span class="label">${t('Message', 'বার্তা')}</span><textarea class="field" rows="3">Sunday 16 Nov, 6 pm at the club room. Budget and volunteer list will be finalised.</textarea></label>
        <div><p class="label">${t('Who should get it', 'কারা পাবেন')}</p>
          <div class="flex flex-wrap gap-2">
            ${[['Everyone', 'সবাই', true], ['Committee only', 'শুধু কমিটি', false], ['Families with dues', 'বকেয়া থাকা পরিবার', false], ['Volunteers', 'স্বেচ্ছাসেবক', false]].map(([en, bn, on]) => `<label class="chip h-9 px-3.5 text-sm border border-rule bg-card cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-paper has-[:checked]:border-ink"><input type="radio" name="aud" class="sr-only" ${on ? 'checked' : ''} />${t(en, bn)}</label>`).join('')}
          </div></div>
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
          <label class="flex items-center gap-2"><input type="checkbox" checked class="w-5 h-5 accent-[#d21f1b]" />${t('App notification', 'অ্যাপ নোটিফিকেশন')}</label>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="w-5 h-5 accent-[#d21f1b]" />${t('Pin to top', 'উপরে পিন')}</label>
          <label class="flex items-center gap-2"><input type="checkbox" class="w-5 h-5 accent-[#d21f1b]" />${t('Show on website', 'ওয়েবসাইটে দেখান')}</label>
        </div>
        <div class="flex gap-2"><button class="btn btn-primary">${t('Publish notice', 'নোটিস প্রকাশ')}</button><button type="button" class="btn btn-line"><i data-lucide="message-circle"></i>${t('Copy for WhatsApp group', 'হোয়াটসঅ্যাপ গ্রুপের জন্য কপি')}</button></div>
      </form>

      <div class="xl:col-span-5 space-y-6">
        <div class="paper-card p-5">
          <p class="text-sm font-semibold text-sindoor">${t('Next meeting', 'পরের সভা')}</p>
          <h2 class="font-display text-xl mt-1">${t('Sun 16 Nov, 6 pm · Club room', 'রবি ১৬ নভে, সন্ধ্যা ৬টা · ক্লাব ঘর')}</h2>
          <ol class="mt-3 text-[15px] space-y-1.5 list-decimal pl-5 marker:text-ink-3">
            <li>${t('Saraswati Puja budget approval', 'সরস্বতী পূজার বাজেট অনুমোদন')}</li>
            <li>${t('Sports Day volunteer list', 'ক্রীড়া দিবসের স্বেচ্ছাসেবক তালিকা')}</li>
            <li>${t('Catering: second cook for December', 'ক্যাটারিং: ডিসেম্বরের জন্য দ্বিতীয় রাঁধুনি')}</li>
            <li>${t('Lapsed members: final reminder', 'মেয়াদোত্তীর্ণ সদস্য: শেষ তাগাদা')}</li>
          </ol>
          <button class="btn btn-line btn-sm mt-4" data-act="minutes"><i data-lucide="notebook-pen"></i>${t('Write minutes', 'কার্যবিবরণী লিখুন')}</button>
        </div>
        <div class="paper-card">
          <div class="px-5 pt-4 pb-3 border-b border-rule"><h2 class="font-display text-xl">${t('Published', 'প্রকাশিত')}</h2></div>
          <ul class="px-5">${notices.map((n) => `<li class="py-3 border-b border-rule last:border-0">
            <p class="text-[12.5px] text-ink-3"><span class="font-semibold text-sindoor">${t(n.tag, n.tagBn)}</span> · ${dn(n.date)} · ${t('read by 184', '১৮৪ জন পড়েছেন')}</p>
            <p class="font-semibold leading-snug mt-0.5">${t(n.title, n.titleBn)}</p></li>`).join('')}</ul>
        </div>
      </div>
    </div>`);
  $('#notice-form').addEventListener('submit', (e) => { e.preventDefault(); toast(`<i data-lucide="check-circle-2"></i>${t('Notice published. 286 families notified.', 'নোটিস প্রকাশিত। ২৮৬টি পরিবারকে জানানো হয়েছে।')}`); });
}


/* ---------------- Events ---------------- */
function eventsScreen() {
  const rows = [
    ...events.map((e, i) => ({ ...e, regs: [0, 74, 38, 0][i], cap: [0, 0, 120, 0][i] })),
  ];
  paint(screen('events'), `
    ${pageHead('Events', 'অনুষ্ঠান', t('Create events, open passes, and see who is coming.', 'অনুষ্ঠান তৈরি, পাস খোলা, কারা আসছেন দেখুন।'), `<button class="btn btn-ink btn-sm" id="new-event"><i data-lucide="plus"></i>${t('New event', 'নতুন অনুষ্ঠান')}</button>`)}
    <div class="paper-card overflow-x-auto">
      <table class="khata-table min-w-[720px]">
        <thead><tr><th>${t('Date', 'তারিখ')}</th><th>${t('Event', 'অনুষ্ঠান')}</th><th>${t('Passes', 'পাস')}</th><th>${t('Registered', 'নাম দিয়েছেন')}</th><th>${t('Status', 'অবস্থা')}</th><th></th></tr></thead>
        <tbody>${rows.map((e) => `<tr>
          <td class="num whitespace-nowrap font-semibold">${dn(e.day)} ${t(e.mon, e.monBn)}</td>
          <td><span class="font-semibold">${t(e.title, e.titleBn)}</span><span class="block text-[13px] text-ink-3">${t(e.place, e.placeBn)} · ${e.time}</span></td>
          <td>${e.pass ? `<span class="chip border border-ink/40"><i data-lucide="ticket"></i>${t('Pass needed', 'পাস লাগবে')}</span>` : `<span class="text-sm text-ink-3">${t('Open to all', 'সবার জন্য')}</span>`}</td>
          <td class="num">${e.pass ? `${dn(String(e.regs))} ${t('families', 'পরিবার')}${e.cap ? ` <span class="text-ink-3">/ ${dn(String(e.cap))} ${t('seats', 'আসন')}</span>` : ''}` : '—'}</td>
          <td><span class="chip bg-paper-2 text-ink-2">${t('Published', 'প্রকাশিত')}</span></td>
          <td class="text-right whitespace-nowrap"><button class="btn btn-ghost btn-sm" data-act="event-edit">${t('Edit', 'সম্পাদনা')}</button>${e.pass ? `<a href="scan.html" class="btn btn-ghost btn-sm">${t('Gate', 'গেট')}</a>` : ''}</td></tr>`).join('')}</tbody>
      </table>
    </div>`);
  $('#new-event').addEventListener('click', () => openDrawer(`
    <form class="p-6 space-y-4" id="event-form">
      <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t('New event', 'নতুন অনুষ্ঠান')}</h2>
        <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
      <label class="block"><span class="label">${t('Name (English)', 'নাম (ইংরেজি)')}</span><input class="field" required placeholder="Netaji Jayanti flag hoisting" /></label>
      <label class="block"><span class="label">${t('Name (Bengali)', 'নাম (বাংলা)')}</span><input class="field" placeholder="নেতাজি জয়ন্তী পতাকা উত্তোলন" lang="bn" /></label>
      <div class="grid grid-cols-2 gap-3"><label class="block"><span class="label">${t('Date', 'তারিখ')}</span><input type="date" class="field" value="2027-01-23" /></label>
        <label class="block"><span class="label">${t('Time', 'সময়')}</span><input type="time" class="field" value="08:00" /></label></div>
      <label class="block"><span class="label">${t('Place', 'জায়গা')}</span><input class="field" value="Club ground" /></label>
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" />${t('Members need a pass (QR at the gate)', 'সদস্যদের পাস লাগবে (গেটে QR)')}</label>
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" checked />${t('Show on the website', 'ওয়েবসাইটে দেখান')}</label>
      <div class="grid grid-cols-2 gap-2 pt-2"><button type="button" data-close class="btn btn-line">${t('Save draft', 'খসড়া রাখুন')}</button><button class="btn btn-primary">${t('Publish', 'প্রকাশ করুন')}</button></div>
    </form>`));
}
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'event-form') return;
  e.preventDefault(); closeDrawer();
  toast(`<i data-lucide="check-circle-2"></i>${t('Event published. Members get a notification.', 'অনুষ্ঠান প্রকাশিত। সদস্যরা নোটিফিকেশন পাবেন।')}`);
});

/* ---------------- Reports ---------------- */
function reports() {
  const tot = (k) => books[k].income - books[k].expense;
  paint(screen('reports'), `
    ${pageHead('Reports', 'রিপোর্ট', t('Statements for the committee, the auditor and the AGM.', 'কমিটি, অডিটর ও এজিএম-এর জন্য বিবরণী।'))}
    <div class="grid lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-7 paper-card">
        <div class="px-5 pt-4 pb-3 border-b border-rule flex items-center"><h2 class="font-display text-xl">${t('Year to date · Apr–Nov 2026', 'চলতি বছর · এপ্রি–নভে ২০২৬')}</h2></div>
        <table class="khata-table">
          <thead><tr><th>${t('Book', 'খাতা')}</th><th class="!text-right">${t('Joma', 'জমা')}</th><th class="!text-right">${t('Khoroch', 'খরচ')}</th><th class="!text-right">${t('Surplus', 'উদ্বৃত্ত')}</th></tr></thead>
          <tbody>
            ${Object.keys(books).map((k) => `<tr><td><span class="flex items-center gap-2.5 font-semibold">${bookDot(k)}${bookName(k)}</span></td><td class="amt">${inr(books[k].income * 7)}</td><td class="amt">${inr(books[k].expense * 7)}</td><td class="amt font-semibold">${inr(tot(k) * 7)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="lg:col-span-5 space-y-3">
        ${[
          ['file-text', 'Monthly statement', 'মাসিক বিবরণী', 'November 2026 · all three books', 'নভেম্বর ২০২৬ · তিনটি খাতা'],
          ['landmark', 'AGM annual report', 'এজিএম বার্ষিক রিপোর্ট', 'Income & expenditure, balance sheet, notes', 'আয়-ব্যয়, ব্যালান্স শিট, টীকা'],
          ['users', 'Member register', 'সদস্য তালিকা', 'All families, status and dues', 'সব পরিবার, অবস্থা ও বকেয়া'],
          ['hand-heart', 'Puja chanda summary', 'পূজার চাঁদার হিসাব', 'By area, volunteer and sponsor', 'এলাকা, স্বেচ্ছাসেবক ও স্পনসর অনুযায়ী'],
          ['history', 'Audit trail', 'অডিট ট্রেইল', 'Every entry, edit and reversal with who and when', 'প্রতিটি এন্ট্রি, কে ও কখন'],
        ].map(([icon, en, bn, sEn, sBn]) => `
          <div class="paper-card p-4 flex items-center gap-3">
            <span class="w-10 h-10 rounded-full bg-paper-2 grid place-items-center shrink-0"><i data-lucide="${icon}" class="w-5 h-5"></i></span>
            <div class="flex-1 min-w-0"><p class="font-semibold">${t(en, bn)}</p><p class="text-sm text-ink-2">${t(sEn, sBn)}</p></div>
            <button class="btn btn-line btn-sm" data-dl><i data-lucide="download"></i>PDF</button>
            <button class="btn btn-ghost btn-sm" data-dl>Excel</button>
          </div>`).join('')}
      </div>
    </div>`);
  $$('[data-dl]').forEach((b) => b.addEventListener('click', () => toast(`<i data-lucide="download"></i>${t('Report prepared. (Prototype: no file is created.)', 'রিপোর্ট তৈরি। (প্রোটোটাইপ: কোনো ফাইল তৈরি হয়নি।)')}`)));
}

/* ---------------- Settings ---------------- */
let setTab = 'club';
const staff = [
  { name: 'Rajib Banerjee', nameBn: 'রাজীব ব্যানার্জি', role: ['Admin (Secretary)', 'অ্যাডমিন (সম্পাদক)'], last: '13 Nov, 7:10 pm', twofa: true },
  { name: 'Tapas Mondal', nameBn: 'তাপস মণ্ডল', role: ['Treasurer', 'কোষাধ্যক্ষ'], last: 'Now', twofa: true },
  { name: 'Debashis Pal', nameBn: 'দেবাশিস পাল', role: ['Catering in-charge', 'ক্যাটারিং দায়িত্বে'], last: '12 Nov', twofa: true },
  { name: 'Sutapa Bose', nameBn: 'সুতপা বসু', role: ['Nursery in-charge', 'নার্সারি দায়িত্বে'], last: '13 Nov', twofa: false },
  { name: 'Bapi Halder', nameBn: 'বাপি হালদার', role: ['Volunteer', 'স্বেচ্ছাসেবক'], last: '5 Nov', twofa: false },
  { name: 'Kakoli Sen', nameBn: 'কাকলি সেন', role: ['Puja in-charge', 'পূজা কমিটি'], last: 'Invite sent 13 Nov', twofa: false, pending: true },
];
function settings(param) {
  if (param) setTab = param;
  const tabs = [['club', 'Club', 'ক্লাব'], ['fees', 'Fees', 'চাঁদা'], ['people', 'Users & roles', 'ব্যবহারকারী ও ভূমিকা'], ['security', 'Security', 'নিরাপত্তা']];
  const body = {
    club: `<form class="paper-card p-5 sm:p-6 grid sm:grid-cols-2 gap-4 max-w-3xl" data-save>
      <label class="block"><span class="label">${t('Club name (English)', 'ক্লাবের নাম (ইংরেজি)')}</span><input class="field" value="Maitri Club" /></label>
      <label class="block"><span class="label">${t('Club name (Bengali)', 'ক্লাবের নাম (বাংলা)')}</span><input class="field" value="মৈত্রী ক্লাব" lang="bn" /></label>
      <label class="block"><span class="label">${t('Locality', 'এলাকা')}</span><input class="field" value="Netaji Para" /></label>
      <label class="block"><span class="label">${t('Founded', 'প্রতিষ্ঠা')}</span><input class="field num" value="1972" inputmode="numeric" /></label>
      <label class="block sm:col-span-2"><span class="label">${t('Address', 'ঠিকানা')}</span><input class="field" value="14/2 Netaji Subhas Road, Kolkata 700 084" /></label>
      <label class="block"><span class="label">${t('Club UPI ID', 'ক্লাবের UPI আইডি')}</span><input class="field num" value="maitriclub@sbi" /></label>
      <label class="block"><span class="label">${t('WhatsApp number', 'হোয়াটসঅ্যাপ নম্বর')}</span><input class="field num" value="+91 98300 12345" /></label>
      <div class="sm:col-span-2 flex items-center gap-4 pt-2"><span>${seal({ size: 64, rotate: -6 })}</span><p class="text-sm text-ink-2">${t('The seal on receipts and cards uses the name, locality and year above.', 'রসিদ ও কার্ডের সিলে ওপরের নাম, এলাকা ও সাল থাকে।')}</p></div>
      <div class="sm:col-span-2"><button class="btn btn-ink">${t('Save changes', 'সেভ করুন')}</button></div></form>`,
    fees: `<form class="paper-card p-5 sm:p-6 max-w-3xl space-y-5" data-save>
      <div class="grid sm:grid-cols-3 gap-4">
        <label class="block"><span class="label">${t('Monthly subscription', 'মাসিক চাঁদা')}</span><input class="field num" value="₹100" /></label>
        <label class="block"><span class="label">${t('Yearly (paid at once)', 'বার্ষিক (একসঙ্গে)')}</span><input class="field num" value="₹1,100" /></label>
        <label class="block"><span class="label">${t('Admission, one time', 'ভর্তি ফি, একবার')}</span><input class="field num" value="₹500" /></label>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <label class="block"><span class="label">${t('Mark family as lapsed after', 'কত মাস বকেয়া হলে মেয়াদোত্তীর্ণ')}</span><select class="field"><option>6 months due</option><option>9 months due</option><option>12 months due</option></select></label>
        <label class="block"><span class="label">${t('Member discount', 'সদস্য ছাড়')}</span><input class="field num" value="Nursery 10% · Catering ₹20 / plate" /></label>
      </div>
      <p class="text-sm text-ink-2">${t('New rates apply from the next month. Receipts already issued don’t change.', 'নতুন হার পরের মাস থেকে। আগের রসিদ বদলাবে না।')}</p>
      <button class="btn btn-ink">${t('Save fees', 'সেভ করুন')}</button></form>`,
    people: `<div class="paper-card overflow-x-auto">
      <div class="px-5 pt-4 pb-3 border-b border-rule flex items-center"><h2 class="font-display text-xl">${t('Who can use the console', 'কারা কনসোল ব্যবহার করেন')}</h2>
        <button class="btn btn-ink btn-sm ml-auto" id="invite"><i data-lucide="user-plus"></i>${t('Invite someone', 'আমন্ত্রণ পাঠান')}</button></div>
      <table class="khata-table min-w-[640px]"><thead><tr><th>${t('Name', 'নাম')}</th><th>${t('Role', 'ভূমিকা')}</th><th>${t('Two-step', 'দুই-ধাপ')}</th><th>${t('Last active', 'শেষ সক্রিয়')}</th><th></th></tr></thead>
      <tbody>${staff.map((s) => `<tr>
        <td class="font-semibold">${t(s.name, s.nameBn)}</td>
        <td><select class="field h-9 text-sm w-auto" aria-label="Role for ${s.name}"><option>${s.role[0]}</option><option>Treasurer</option><option>Puja in-charge</option><option>Catering in-charge</option><option>Nursery in-charge</option><option>Volunteer</option></select></td>
        <td>${s.twofa ? `<span class="chip bg-paper-2 text-ink-2"><i data-lucide="shield-check"></i>${t('On', 'চালু')}</span>` : `<span class="chip border border-ink/40"><i data-lucide="shield-alert"></i>${t('Off', 'বন্ধ')}</span>`}</td>
        <td class="text-sm text-ink-2">${s.pending ? `<span class="chip border border-ink/40"><i data-lucide="mail"></i>${t('Invited', 'আমন্ত্রিত')}</span>` : s.last}</td>
        <td class="text-right whitespace-nowrap">${s.pending ? `<button class="btn btn-ghost btn-sm">${t('Resend', 'আবার পাঠান')}</button>` : `<button class="btn btn-ghost btn-sm">${t('Remove access', 'অ্যাক্সেস বাতিল')}</button>`}</td></tr>`).join('')}</tbody></table>
      <div class="px-5 py-4 border-t border-rule text-sm text-ink-2">${t('Roles decide what each person sees: the treasurer sees all books, in-charges see their own book, volunteers only the gate scanner and chanda entry.', 'ভূমিকা অনুযায়ী দেখা যায়: কোষাধ্যক্ষ সব খাতা, দায়িত্বপ্রাপ্তরা নিজের খাতা, স্বেচ্ছাসেবক শুধু গেট স্ক্যানার ও চাঁদা।')}</div></div>`,
    security: `<form class="paper-card p-5 sm:p-6 max-w-3xl divide-y divide-rule" data-save>
      ${[
        ['Require two-step sign-in for everyone', 'সবার জন্য দুই-ধাপ লগইন বাধ্যতামূলক', 'A code by SMS after the password', 'পাসওয়ার্ডের পর এসএমএস কোড', true],
        ['Pause sign-in after 3 wrong passwords', '৩ বার ভুল পাসওয়ার্ডে লগইন বন্ধ', 'For 15 minutes, and SMS the owner', '১৫ মিনিটের জন্য, মালিককে এসএমএস', true],
        ['Sign out idle sessions after 30 minutes', '৩০ মিনিট নিষ্ক্রিয় থাকলে লগআউট', 'Useful on shared club-room laptops', 'ক্লাব ঘরের শেয়ার করা ল্যাপটপে দরকারি', true],
        ['Two people to approve expenses over ₹10,000', '₹১০,০০০-এর বেশি খরচে দুজনের অনুমোদন', 'Treasurer plus secretary or president', 'কোষাধ্যক্ষ ও সম্পাদক বা সভাপতি', false],
      ].map(([en, bn, sEn, sBn, on], i) => `<label class="flex items-center gap-4 py-4 first:pt-0 cursor-pointer"><span class="flex-1"><span class="block font-semibold">${t(en, bn)}</span><span class="block text-sm text-ink-2">${t(sEn, sBn)}</span></span><input type="checkbox" class="switch" ${on ? 'checked' : ''} /></label>`).join('')}
      <div class="pt-4"><button class="btn btn-ink">${t('Save', 'সেভ করুন')}</button></div></form>`,
  };
  paint(screen('settings'), `
    ${pageHead('Settings', 'সেটিংস', t('Only the secretary and treasurer can change these.', 'শুধু সম্পাদক ও কোষাধ্যক্ষ এগুলো বদলাতে পারেন।'))}
    <div class="flex flex-wrap gap-2 mb-5" role="tablist">${tabs.map(([k, en, bn]) => `<a href="#settings/${k}" role="tab" aria-selected="${setTab === k}" class="chip h-9 px-3.5 text-sm border border-rule bg-card aria-selected:bg-ink aria-selected:text-paper aria-selected:border-ink">${t(en, bn)}</a>`).join('')}</div>
    ${body[setTab]}`);
  $$('[data-save]').forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); toast(`<i data-lucide="check-circle-2"></i>${t('Saved. The change is in the audit trail.', 'সেভ হয়েছে। পরিবর্তন অডিট ট্রেইলে আছে।')}`); }));
  $('#invite')?.addEventListener('click', () => openDrawer(`
    <form class="p-6 space-y-4" id="invite-form">
      <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t('Invite to the console', 'কনসোলে আমন্ত্রণ')}</h2>
        <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
      <label class="block"><span class="label">${t('Name', 'নাম')}</span><input class="field" required /></label>
      <label class="block"><span class="label">${t('Mobile number', 'মোবাইল নম্বর')}</span><input class="field num" type="tel" inputmode="numeric" placeholder="98300 12345" required /></label>
      <label class="block"><span class="label">${t('Role', 'ভূমিকা')}</span><select class="field"><option>Puja in-charge</option><option>Catering in-charge</option><option>Nursery in-charge</option><option>Volunteer</option><option>Treasurer</option></select></label>
      <p class="text-sm text-ink-2">${t('They get an SMS link to set a password. It expires in 7 days.', 'এসএমএস লিঙ্কে পাসওয়ার্ড দেবেন। ৭ দিন বৈধ।')} <a href="admin-login.html#invite" class="font-semibold text-sindoor hover:underline">${t('Preview what they see', 'ওঁরা কী দেখবেন')}</a></p>
      <button class="btn btn-primary w-full h-12">${t('Send invite', 'আমন্ত্রণ পাঠান')}</button>
    </form>`));
}
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'invite-form') return;
  e.preventDefault(); closeDrawer();
  toast(`<i data-lucide="send"></i>${t('Invite sent by SMS.', 'এসএমএসে আমন্ত্রণ পাঠানো হয়েছে।')}`);
});

/* ---------------- My profile ---------------- */
function profile() {
  paint(screen('profile'), `
    ${pageHead('My account', 'আমার অ্যাকাউন্ট')}
    <div class="grid lg:grid-cols-2 gap-6 items-start max-w-5xl">
      <form class="paper-card p-5 sm:p-6 space-y-4" data-save>
        <div class="flex items-center gap-4"><span class="w-14 h-14 rounded-full bg-ink text-white grid place-items-center font-display text-xl">${t('T', 'তা')}</span>
          <div><p class="font-display text-2xl">${t('Tapas Mondal', 'তাপস মণ্ডল')}</p><p class="text-sm text-ink-2">${t('Treasurer · since 2021', 'কোষাধ্যক্ষ · ২০২১ থেকে')}</p></div></div>
        <label class="block"><span class="label">${t('Mobile', 'মোবাইল')}</span><input class="field num" value="+91 98314 55120" /></label>
        <label class="block"><span class="label">${t('Language', 'ভাষা')}</span><select class="field" id="pf-lang"><option value="en">English</option><option value="bn">বাংলা</option></select></label>
        <button class="btn btn-ink">${t('Save', 'সেভ করুন')}</button>
      </form>
      <div class="space-y-6">
        <div class="paper-card p-5">
          <h2 class="font-display text-xl">${t('Sign-in & security', 'লগইন ও নিরাপত্তা')}</h2>
          <ul class="mt-3 divide-y divide-rule text-[15px]">
            <li class="py-3 flex items-center gap-3"><i data-lucide="key-round" class="w-5 h-5"></i><span class="flex-1">${t('Password · changed 2 months ago', 'পাসওয়ার্ড · ২ মাস আগে বদলানো')}</span><a href="admin-login.html#forgot" class="btn btn-line btn-sm">${t('Change', 'বদলান')}</a></li>
            <li class="py-3 flex items-center gap-3"><i data-lucide="shield-check" class="w-5 h-5"></i><span class="flex-1">${t('Two-step sign-in · SMS to ••••5120', 'দুই-ধাপ লগইন · ••••5120-এ এসএমএস')}</span><span class="chip bg-paper-2 text-ink-2">${t('On', 'চালু')}</span></li>
          </ul>
        </div>
        <div class="paper-card p-5">
          <h2 class="font-display text-xl">${t('Where you’re signed in', 'কোথায় লগইন আছে')}</h2>
          <ul class="mt-3 divide-y divide-rule text-[15px]">
            <li class="py-3 flex items-center gap-3"><i data-lucide="laptop" class="w-5 h-5"></i><span class="flex-1">${t('Club-room laptop · Chrome', 'ক্লাব ঘরের ল্যাপটপ · Chrome')}<span class="block text-sm text-ink-2">${t('This device · now', 'এই ডিভাইস · এখন')}</span></span></li>
            <li class="py-3 flex items-center gap-3"><i data-lucide="smartphone" class="w-5 h-5"></i><span class="flex-1">${t('Android phone · Kolkata', 'অ্যান্ড্রয়েড ফোন · কলকাতা')}<span class="block text-sm text-ink-2">${t('Yesterday, 9:12 pm', 'গতকাল, রাত ৯:১২')}</span></span><button class="btn btn-ghost btn-sm" data-signout>${t('Sign out', 'লগআউট')}</button></li>
          </ul>
          <a href="admin-login.html" class="btn btn-line w-full mt-3"><i data-lucide="log-out"></i>${t('Sign out of this device', 'এই ডিভাইস থেকে লগআউট')}</a>
        </div>
      </div>
    </div>`);
  $('#pf-lang').value = lang;
  $('#pf-lang').addEventListener('change', (e) => setLang(e.target.value));
  $$('[data-save]').forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); toast(`<i data-lucide="check-circle-2"></i>${t('Saved.', 'সেভ হয়েছে।')}`); }));
  $$('[data-signout]').forEach((b) => b.addEventListener('click', () => { b.closest('li').remove(); toast(`<i data-lucide="log-out"></i>${t('That phone is signed out.', 'ওই ফোন থেকে লগআউট হয়েছে।')}`); }));
}


/* ---------------- Member ID cards ---------------- */
const cardStatus = (f, i) => (i % 6 === 2 ? 'pending' : i % 9 === 4 ? 'lost' : 'issued');
let cardsFam = families[1].no;
let cardsFilter = 'all';
const cardPick = new Set();
function cardsScreen(param) {
  if (param) cardsFam = param;
  const rows = families.map((f, i) => ({ f, i, people: peopleOf(f, i), st: cardStatus(f, i) }));
  const noPhoto = rows.reduce((a, r) => a + r.people.filter((p) => !p.photo).length, 0);
  const counts = { all: rows.length, pending: rows.filter((r) => r.st === 'pending').length, photo: rows.filter((r) => r.people.some((p) => !p.photo)).length, lost: rows.filter((r) => r.st === 'lost').length };
  const list = rows.filter((r) => cardsFilter === 'all' || (cardsFilter === 'photo' ? r.people.some((p) => !p.photo) : r.st === cardsFilter));
  const cur = rows.find((r) => r.f.no === cardsFam) || rows[0];
  if (![...cardPick].some((id) => id.startsWith(cur.f.no))) { cardPick.clear(); cur.people.forEach((p) => cardPick.add(p.id)); }
  const picked = cur.people.filter((p) => cardPick.has(p.id));
  const stChip = (st) => ({
    issued: `<span class="chip bg-paper-2 text-ink-2"><i data-lucide="check"></i>${t('Handed over', 'দেওয়া হয়েছে')}</span>`,
    pending: `<span class="chip border border-ink/40 text-ink"><i data-lucide="printer"></i>${t('To print', 'প্রিন্ট বাকি')}</span>`,
    lost: `<span class="chip bg-ink text-white"><i data-lucide="alert-triangle"></i>${t('Reported lost', 'হারানো')}</span>`,
  }[st]);
  paint(screen('cards'), `
    ${pageHead('Member ID cards', 'সদস্য পরিচয়পত্র', `${t('One card per person', 'প্রতি জনের একটি কার্ড')} · ${dn('1,041')} ${t('people', 'জন')} · ${dn(String(noPhoto))} ${t('need a photo in this sample', 'জনের ছবি লাগবে (নমুনায়)')}`, `
      <button class="btn btn-line btn-sm" id="print-pending"><i data-lucide="printer"></i>${t(`Print all “to print” (${counts.pending} families)`, `প্রিন্ট বাকি সব (${counts.pending}টি পরিবার)`)}</button>`)}
    <div class="flex flex-wrap gap-2 mb-4">
      ${[['all', 'All families', 'সব পরিবার'], ['pending', 'To print', 'প্রিন্ট বাকি'], ['photo', 'Photo needed', 'ছবি লাগবে'], ['lost', 'Reported lost', 'হারানো']].map(([k, en, bn]) => `<button data-cf="${k}" aria-pressed="${cardsFilter === k}" class="chip h-9 px-3.5 text-sm border border-rule bg-card aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink">${t(en, bn)} <span class="opacity-70 num">${dn(String(counts[k]))}</span></button>`).join('')}
    </div>
    <div class="grid lg:grid-cols-12 gap-6 items-start">
      <ul class="lg:col-span-4 paper-card divide-y divide-rule max-h-[70vh] overflow-y-auto" aria-label="Families">
        ${list.map((r) => `<li><a href="#cards/${r.f.no}" class="flex items-center gap-3 px-4 py-3 hover:bg-paper-2 ${r.f.no === cur.f.no ? 'bg-paper-2' : ''}" ${r.f.no === cur.f.no ? 'aria-current="true"' : ''}>
          <span class="flex-1 min-w-0"><span class="block font-semibold truncate">${t(r.f.head, r.f.headBn)}</span><span class="block text-[13px] text-ink-3 num">${r.f.no} · ${dn(String(r.people.length))} ${t('cards', 'কার্ড')}${r.people.some((p) => !p.photo) ? ` · ${t('photo needed', 'ছবি লাগবে')}` : ''}</span></span>
          ${stChip(r.st)}</a></li>`).join('') || `<li class="px-4 py-10 text-center text-ink-3">${t('No families in this list.', 'এই তালিকায় কোনো পরিবার নেই।')}</li>`}
      </ul>

      <div class="lg:col-span-8">
        <div class="paper-card p-5">
          <div class="flex flex-wrap items-center gap-3">
            <div class="min-w-0"><p class="text-sm text-ink-3 num">${cur.f.no} · ${t(cur.f.lane, cur.f.laneBn)}</p><h2 class="font-display text-2xl leading-tight">${t(cur.f.head, cur.f.headBn)} ${t('family', 'পরিবার')}</h2></div>
            <div class="ml-auto">${stChip(cur.st)}</div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button class="btn btn-primary btn-sm" id="print-picked" ${picked.length ? '' : 'disabled'}><i data-lucide="printer"></i>${t(`Print ${picked.length} card${picked.length === 1 ? '' : 's'}`, `${picked.length}টি কার্ড প্রিন্ট`)}</button>
            <button class="btn btn-line btn-sm" id="dl-picked" ${picked.length ? '' : 'disabled'}><i data-lucide="download"></i>${t('Download PNG', 'PNG ডাউনলোড')}</button>
            <button class="btn btn-line btn-sm" id="handed"><i data-lucide="hand"></i>${t('Mark handed over', 'দেওয়া হয়েছে চিহ্নিত করুন')}</button>
            ${cur.st === 'lost' ? `<button class="btn btn-ink btn-sm" id="reissue"><i data-lucide="refresh-cw"></i>${t('Reissue · cancel old QR', 'নতুন কার্ড · পুরনো QR বাতিল')}</button>` : ''}
          </div>
          <p class="mt-2 text-[13px] text-ink-2">${t('Prints at true size (85.6 × 54 mm) on A4: front and back side by side. Cut, fold and laminate. Choose “Save as PDF” in the print dialog to keep a file.', 'A4-এ আসল মাপে (৮৫.৬ × ৫৪ মিমি) প্রিন্ট: সামনে ও পেছন পাশাপাশি। কেটে, ভাঁজ করে ল্যামিনেট করুন। ফাইল রাখতে প্রিন্ট ডায়ালগে “Save as PDF” বেছে নিন।')}</p>
        </div>

        <ul class="mt-4 space-y-4">
          ${cur.people.map((p) => `<li class="paper-card p-4">
            <div class="flex flex-wrap items-center gap-3 mb-3">
              <label class="flex items-center gap-2.5 font-semibold"><input type="checkbox" class="w-5 h-5 accent-[#2b2f36]" data-pick="${p.id}" ${cardPick.has(p.id) ? 'checked' : ''} />${t(p.name, p.nameBn)}</label>
              <span class="text-sm text-ink-3 num">${p.id} · ${t(p.rel, p.relBn)}</span>
              <span class="ml-auto flex gap-1">
                ${p.photo ? '' : `<button class="btn btn-sm btn-ink" data-photo="${p.id}"><i data-lucide="camera"></i>${t('Add photo', 'ছবি যোগ')}</button>`}
                <button class="btn btn-ghost btn-sm" data-dl="${p.id}"><i data-lucide="download"></i>PNG</button>
              </span>
            </div>
            <div class="grid sm:grid-cols-2 gap-3">
              <div class="idc-wrap">${cardFront(p)}</div>
              <div class="idc-wrap">${cardBack(p)}</div>
            </div>
          </li>`).join('')}
        </ul>
      </div>
    </div>`);
  fillQrs(screen('cards'));
  $$('[data-cf]').forEach((b) => b.addEventListener('click', () => { cardsFilter = b.dataset.cf; cardsScreen(); }));
  $$('[data-pick]').forEach((c) => c.addEventListener('change', () => { c.checked ? cardPick.add(c.dataset.pick) : cardPick.delete(c.dataset.pick); cardsScreen(); }));
  $('#print-picked').addEventListener('click', () => printCards(picked));
  $('#print-pending').addEventListener('click', () => printCards(rows.filter((r) => r.st === 'pending').flatMap((r) => r.people)));
  $('#dl-picked').addEventListener('click', async () => { for (const p of picked) await downloadCard(p); });
  $$('[data-dl]').forEach((b) => b.addEventListener('click', () => downloadCard(cur.people.find((p) => p.id === b.dataset.dl))));
  $('#handed').addEventListener('click', () => toast(`<i data-lucide="check-circle-2"></i>${t(`${picked.length} cards marked as handed over to ${cur.f.head}.`, `${cur.f.headBn}-কে ${picked.length}টি কার্ড দেওয়া হয়েছে।`)}`));
  $('#reissue')?.addEventListener('click', () => toast(`<i data-lucide="refresh-cw"></i>${t('Old QR codes cancelled. The gate scanner will refuse them from now.', 'পুরনো QR বাতিল। গেট স্ক্যানার আর গ্রহণ করবে না।')}`));
  $$('[data-photo]').forEach((b) => b.addEventListener('click', () => openDrawer(`
    <div class="p-6">
      <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t('Add a photo', 'ছবি যোগ করুন')}</h2>
        <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
      <p class="mt-2 text-[15px] text-ink-2">${t('Face the camera against a plain wall. The photo is cropped to 3:4 for the card.', 'সাদা দেয়ালের সামনে ক্যামেরার দিকে মুখ করে। কার্ডের জন্য ৩:৪ মাপে কাটা হবে।')}</p>
      <label class="mt-5 w-full aspect-[3/4] max-w-[220px] mx-auto rounded-lg border-2 border-dashed border-rule bg-paper-2 text-ink-2 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-ink/40">
        <i data-lucide="camera" class="w-8 h-8"></i><span class="text-sm font-semibold">${t('Take or choose a photo', 'ছবি তুলুন বা বেছে নিন')}</span>
        <input type="file" accept="image/*" capture="user" class="sr-only" />
      </label>
      <p class="mt-4 text-[13px] text-ink-3 text-center">${t('Members can also add their own photo in the app.', 'সদস্যরা অ্যাপেও নিজের ছবি দিতে পারেন।')}</p>
    </div>`)));
}

/* ---------------- Actions: every button opens a real form ---------------- */
const fld = (en, bn, input) => `<label class="block"><span class="label">${t(en, bn)}</span>${input}</label>`;
const inp = (attrs = '') => `<input class="field" ${attrs} />`;
const sel = (opts) => `<select class="field">${opts.map((o) => `<option>${o}</option>`).join('')}</select>`;
function formDrawer(titleEn, titleBn, body, submitEn, submitBn, doneEn, doneBn, { danger = false } = {}) {
  openDrawer(`
    <form class="p-6 space-y-4" data-drawer-form>
      <div class="flex items-center"><h2 class="font-display text-[1.7rem] leading-tight pr-4">${t(titleEn, titleBn)}</h2>
        <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2 shrink-0" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
      ${body}
      <div class="grid grid-cols-2 gap-2 pt-2"><button type="button" data-close class="btn btn-line">${t('Cancel', 'বাতিল')}</button>
        <button class="btn ${danger ? 'btn-ink' : 'btn-primary'}">${t(submitEn, submitBn)}</button></div>
    </form>`);
  $('[data-drawer-form]').addEventListener('submit', (e) => { e.preventDefault(); closeDrawer(); toast(`<i data-lucide="check-circle-2"></i>${t(doneEn, doneBn)}`); });
}
const LANES = ['Lane 1', 'Lane 2', 'Lane 3', 'Pukur Par', 'School Road'];

const ACTIONS = {
  family(b) {
    const f = families.find((x) => x.no === b.dataset.no);
    formDrawer(f ? 'Edit family' : 'Add a family', f ? 'পরিবার সম্পাদনা' : 'পরিবার যোগ', `
      ${f ? `<p class="text-sm text-ink-3 num">${f.no}</p>` : `<p class="text-sm text-ink-2">${t('The next family number is MC-0173.', 'পরের পরিবার নম্বর MC-0173।')}</p>`}
      ${fld('Head of family', 'পরিবারের প্রধান', inp(`value="${f ? f.head : ''}" required`))}
      ${fld('Name in Bengali', 'বাংলায় নাম', inp(`value="${f ? f.headBn : ''}" lang="bn"`))}
      <div class="grid grid-cols-2 gap-3">${fld('Mobile', 'মোবাইল', inp(`class="field num" type="tel" value="${f ? f.phone : ''}"`))}${fld('Lane', 'গলি', sel(LANES))}</div>
      ${fld('Address', 'ঠিকানা', inp())}
      <div class="grid grid-cols-2 gap-3">${fld('Plan', 'প্ল্যান', sel(['₹100 / month', '₹1,100 / year']))}${fld('Member since', 'কবে থেকে', inp(`class="field num" value="${f ? f.since : 2026}"`))}</div>
      ${f ? `<label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" />${t('Mark as left the para (keeps history)', 'পাড়া ছেড়েছেন (ইতিহাস থাকবে)')}</label>` : ''}`,
      f ? 'Save changes' : 'Add family', f ? 'সেভ করুন' : 'যোগ করুন',
      f ? 'Family updated. The change is in the audit trail.' : 'Family MC-0173 added. Their member card is ready to print.',
      f ? 'পরিবার আপডেট হয়েছে।' : 'পরিবার MC-0173 যোগ হয়েছে। কার্ড প্রিন্টের জন্য তৈরি।');
  },
  import() {
    openDrawer(`
      <div class="p-6">
        <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t('Import from Excel', 'এক্সেল থেকে আনুন')}</h2>
          <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
        <ol class="mt-4 space-y-2 text-[15px] text-ink-2 list-decimal pl-5">
          <li>${t('Copy the old register into Excel or Google Sheets: one row per family.', 'পুরনো খাতা এক্সেল বা গুগল শিটে তুলুন: প্রতি পরিবার এক সারি।')}</li>
          <li>${t('Columns: family no., head, mobile, lane, months due.', 'কলাম: পরিবার নং, প্রধান, মোবাইল, গলি, বকেয়া মাস।')} <a href="#" class="font-semibold text-sindoor hover:underline">${t('Download template', 'টেমপ্লেট ডাউনলোড')}</a></li>
          <li>${t('Upload it here. You check every row before anything is saved.', 'এখানে আপলোড করুন। সেভের আগে প্রতিটি সারি দেখে নেবেন।')}</li>
        </ol>
        <label class="mt-5 w-full h-32 rounded-lg border-2 border-dashed border-rule bg-paper-2 text-ink-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-ink/40">
          <i data-lucide="file-spreadsheet" class="w-7 h-7"></i><span class="text-sm font-semibold">${t('Choose .xlsx or .csv', '.xlsx বা .csv বেছে নিন')}</span>
          <input type="file" accept=".xlsx,.csv" class="sr-only" id="imp-file" /></label>
        <div id="imp-preview" class="mt-5"></div>
      </div>`);
    $('#imp-file').addEventListener('change', () => {
      paint($('#imp-preview'), `
        <p class="font-semibold">${t('register-2024.xlsx · 286 rows', 'register-2024.xlsx · ২৮৬ সারি')}</p>
        <ul class="mt-2 text-[15px] divide-y divide-rule border-y border-rule">
          <li class="py-2 flex gap-2"><i data-lucide="check" class="w-5 h-5 shrink-0"></i>${t('279 rows ready', '২৭৯টি সারি তৈরি')}</li>
          <li class="py-2 flex gap-2"><i data-lucide="alert-triangle" class="w-5 h-5 shrink-0"></i>${t('5 rows have no mobile number (they can still be added)', '৫টি সারিতে মোবাইল নেই (তবুও যোগ করা যাবে)')}</li>
          <li class="py-2 flex gap-2"><i data-lucide="copy" class="w-5 h-5 shrink-0"></i>${t('2 rows look like duplicates of MC-0110 and MC-0131: skipped', '২টি সারি MC-0110 ও MC-0131-এর মতো: বাদ')}</li>
        </ul>
        <button class="btn btn-primary w-full h-12 mt-4" id="imp-go">${t('Import 284 families', '২৮৪টি পরিবার আনুন')}</button>`);
      $('#imp-go').addEventListener('click', () => { closeDrawer(); toast(`<i data-lucide="check-circle-2"></i>${t('284 families imported. Undo is available for 24 hours.', '২৮৪টি পরিবার আনা হয়েছে। ২৪ ঘণ্টা পর্যন্ত ফেরানো যাবে।')}`); });
    });
  },
  message() {
    formDrawer('Reminder message', 'তাগাদার বার্তা', `
      <p class="text-sm text-ink-2">${t('{name}, {months} and {amount} are filled in for each family.', '{name}, {months} ও {amount} প্রতিটি পরিবারের জন্য বসবে।')}</p>
      ${fld('Bengali', 'বাংলা', `<textarea class="field" rows="5" lang="bn">নমস্কার {name}, মৈত্রী ক্লাবের {months} মাসের চাঁদা ₹{amount} বাকি আছে। অ্যাপে ইউপিআই-এ দিতে পারেন বা সন্ধ্যায় ক্লাব ঘরে তাপস-দাকে দিন। ধন্যবাদ।</textarea>`)}
      ${fld('English', 'ইংরেজি', `<textarea class="field" rows="4">Namaskar {name}, your Maitri Club subscription of ₹{amount} for {months} months is due. Pay by UPI in the app, or to Tapas-da at the club room in the evening. Thank you.</textarea>`)}`,
      'Save message', 'সেভ করুন', 'Reminder message saved.', 'বার্তা সেভ হয়েছে।');
  },
  'remind-all'() {
    const due = families.filter((f) => f.due);
    openDrawer(`
      <div class="p-6">
        <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t(`Remind ${due.length} families`, `${due.length}টি পরিবারকে তাগাদা`)}</h2>
          <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
        <p class="mt-2 text-[15px] text-ink-2">${t('WhatsApp opens one chat at a time, so work down the list. Each one ticks off when you come back.', 'হোয়াটসঅ্যাপ একবারে একটা চ্যাট খোলে, তাই তালিকা ধরে এগোন। ফিরে এলে টিক পড়বে।')}</p>
        <ul class="mt-4 divide-y divide-rule border-y border-rule">${due.map((f) => `<li class="py-2.5 flex items-center gap-3">
          <span class="flex-1 min-w-0"><span class="block font-semibold truncate">${t(f.head, f.headBn)}</span><span class="block text-sm text-ink-3">${inr(f.due)}</span></span>
          <a target="_blank" rel="noopener" data-sent href="https://wa.me/91${f.phone}" class="btn btn-ink btn-sm"><i data-lucide="message-circle"></i>${t('Open', 'খুলুন')}</a></li>`).join('')}</ul>
        <p class="mt-4 text-[13px] text-ink-3">${t('Later: WhatsApp Business API can send all at once for about ₹0.30 per message.', 'পরে: হোয়াটসঅ্যাপ বিজনেস API দিয়ে একসঙ্গে পাঠানো যায়, বার্তা প্রতি প্রায় ₹০.৩০।')}</p>
      </div>`);
    $$('[data-sent]').forEach((a) => a.addEventListener('click', () => { a.outerHTML = `<span class="chip bg-paper-2 text-ink-2"><i data-lucide="check"></i>${t('Sent', 'পাঠানো')}</span>`; refreshIcons(); applyLang($('#drawer-body')); }));
  },
  bill(b) {
    openDrawer(`
      <div class="p-6">
        <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t('Bill photo', 'বিলের ছবি')}</h2>
          <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
        <p class="mt-1 text-[15px] text-ink-2">${b.dataset.head} · ${inr(Number(b.dataset.amt))}</p>
        <div class="mt-4 aspect-[3/4] border-2 border-ink bg-paper-2 relative">
          <div class="absolute inset-6 bg-white shadow-[0_4px_4px_rgba(0,0,0,.2)] rotate-[-1.5deg] p-5 text-[13px] text-ink-2 space-y-2">
            <p class="font-semibold text-ink">CASH MEMO</p><p class="border-b border-dotted border-ink/40 pb-2">No. 2291 · 12/11/2026</p>
            <p class="flex justify-between"><span>${b.dataset.head}</span><span class="num">₹${Number(b.dataset.amt).toLocaleString('en-IN')}</span></p>
            <p class="pt-6 text-ink-3">${t('Photo placeholder: the treasurer’s phone photo of the paper bill goes here.', 'জায়গা: কোষাধ্যক্ষের তোলা কাগজের বিলের ছবি এখানে থাকবে।')}</p>
          </div>
        </div>
        <p class="mt-3 text-sm text-ink-3">${t('Uploaded by Tapas M. · 12 Nov, 8:40 pm', 'আপলোড: তাপস ম. · ১২ নভে, রাত ৮:৪০')}</p>
      </div>`);
  },
  reverse(b) {
    formDrawer('Reverse this entry', 'এন্ট্রি উল্টান', `
      <div class="rounded-lg bg-paper-2 p-4 text-[15px]"><p class="font-semibold">${b.dataset.head}</p><p class="text-ink-2">${b.dataset.type === 'in' ? t('Joma', 'জমা') : t('Khoroch', 'খরচ')} · ${inr(Number(b.dataset.amt))}</p></div>
      <p class="text-[15px] text-ink-2">${t('Nothing is deleted. A matching opposite entry is added with your note, so the auditor sees both.', 'কিছু মোছা হয় না। আপনার নোটসহ উল্টো এন্ট্রি যোগ হয়, অডিটর দুটোই দেখবেন।')}</p>
      ${fld('Why? (required)', 'কেন? (বাধ্যতামূলক)', `<textarea class="field" rows="3" required data-bn-ph="যেমন: ভুল পরিবারে লেখা হয়েছিল" placeholder="e.g. Entered against the wrong family"></textarea>`)}`,
      'Add reversal', 'উল্টো এন্ট্রি যোগ', 'Reversal added. Both entries stay in the khata.', 'উল্টো এন্ট্রি যোগ হয়েছে। দুটোই খাতায় থাকবে।', { danger: true });
  },
  'chanda-book'() {
    formDrawer('Issue a chanda book', 'চাঁদার বই দিন', `
      ${fld('Volunteer', 'স্বেচ্ছাসেবক', sel(['Bapi Halder', 'Moumita Kar', 'Manas Kundu', 'Tumpa Guha', 'Sanjay Nandi']))}
      ${fld('Area', 'এলাকা', sel(LANES))}
      <div class="grid grid-cols-2 gap-3">${fld('Book no.', 'বই নং', inp('class="field num" value="7"'))}${fld('Receipts', 'রসিদ', inp('class="field num" value="0301 – 0350"'))}</div>`,
      'Issue book', 'বই দিন', 'Book 7 issued to Bapi Halder.', 'বই ৭ বাপি হালদারকে দেওয়া হয়েছে।');
  },
  chanda() {
    formDrawer('Record chanda', 'চাঁদা লিখুন', `
      ${fld('Donor', 'দাতা', inp('required data-bn-ph="নাম বা পরিবার নম্বর" placeholder="Name or family number"'))}
      <div class="grid grid-cols-2 gap-3">${fld('Amount', 'টাকা', inp('class="field num text-lg" inputmode="numeric" required placeholder="₹501"'))}${fld('Area', 'এলাকা', sel(LANES))}</div>
      <div class="grid grid-cols-2 gap-3">${fld('Book receipt no.', 'বইয়ের রসিদ নং', inp('class="field num" placeholder="0312"'))}${fld('Paid by', 'মাধ্যম', sel(['Cash', 'UPI']))}</div>`,
      'Record', 'লিখুন', 'Chanda recorded in the Club book.', 'চাঁদা ক্লাব খাতায় উঠেছে।');
  },
  enquiry() {
    formDrawer('New catering enquiry', 'নতুন ক্যাটারিং জিজ্ঞাসা', `
      ${fld('Customer', 'গ্রাহক', inp('required'))}
      <div class="grid grid-cols-2 gap-3">${fld('Mobile', 'মোবাইল', inp('class="field num" type="tel"'))}${fld('Occasion', 'অনুষ্ঠান', sel(['Wedding', 'Reception', 'Annaprashan', 'Birthday', 'Shraddha', 'Office']))}</div>
      <div class="grid grid-cols-2 gap-3">${fld('Date', 'তারিখ', inp('type="date" value="2026-12-28"'))}${fld('Guests', 'অতিথি', inp('class="field num" inputmode="numeric" value="120"'))}</div>
      ${fld('Menu', 'মেনু', sel(cateringPackages.map((p) => `${p.name} · ₹${p.rate}`)))}
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" />${t('Maitri Club member (₹20 off a plate)', 'মৈত্রী ক্লাবের সদস্য (প্লেটে ₹২০ ছাড়)')}</label>`,
      'Add enquiry', 'যোগ করুন', 'Enquiry added to the board.', 'জিজ্ঞাসা বোর্ডে যোগ হয়েছে।');
  },
  quote() {
    formDrawer('Send quotation', 'কোটেশন পাঠান', `
      <p class="text-[15px] text-ink-2">${t('A PDF with the menu, plates, total and 20% advance goes on WhatsApp, signed with the club seal.', 'মেনু, প্লেট, মোট ও ২০% অগ্রিম সহ সিলমোহর দেওয়া PDF হোয়াটসঅ্যাপে যাবে।')}</p>
      ${fld('Valid until', 'বৈধ', inp('type="date" value="2026-11-25"'))}
      ${fld('Note to customer', 'গ্রাহকের জন্য নোট', '<textarea class="field" rows="3">Fish items depend on market price on the day. Final count needed 3 days before.</textarea>')}`,
      'Send on WhatsApp', 'হোয়াটসঅ্যাপে পাঠান', 'Quotation sent.', 'কোটেশন পাঠানো হয়েছে।');
  },
  'cat-pay'() {
    formDrawer('Record catering payment', 'ক্যাটারিং টাকা জমা', `
      <div class="grid grid-cols-2 gap-3">${fld('Kind', 'ধরন', sel(['Advance', 'Final bill']))}${fld('Amount', 'টাকা', inp('class="field num text-lg" inputmode="numeric" required'))}</div>
      ${fld('Paid by', 'মাধ্যম', sel(['Cash', 'UPI', 'Bank transfer']))}`,
      'Record and send receipt', 'জমা ও রসিদ পাঠান', 'Payment recorded in the Catering book.', 'ক্যাটারিং খাতায় জমা হয়েছে।');
  },
  bazaar() {
    openDrawer(`
      <div class="p-6">
        <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t('Bazaar list · 220 plates', 'বাজারের ফর্দ · ২২০ প্লেট')}</h2>
          <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
        <p class="mt-1 text-sm text-ink-2">${t('Worked out from the Bhoj menu. Edit before you go to the market.', 'ভোজ মেনু থেকে হিসাব। বাজারে যাওয়ার আগে বদলে নিন।')}</p>
        <ul class="mt-4 text-[15px]">${[['Basmati rice', 'বাসমতী চাল', '28 kg'], ['Bhetki fillet', 'ভেটকি ফিলে', '24 kg'], ['Golda chingri', 'গলদা চিংড়ি', '30 kg'], ['Mutton', 'খাসির মাংস', '35 kg'], ['Maida (luchi)', 'ময়দা (লুচি)', '18 kg'], ['Mustard oil', 'সর্ষের তেল', '20 L'], ['Mishti doi', 'মিষ্টি দই', '220 cups'], ['Rosogolla', 'রসগোল্লা', '440 pcs']].map(([en, bn, q]) => `<li class="leader py-2"><span>${t(en, bn)}</span><span class="font-semibold num">${q}</span></li>`).join('')}</ul>
        <div class="grid grid-cols-2 gap-2 mt-5"><button class="btn btn-line"><i data-lucide="printer"></i>${t('Print', 'প্রিন্ট')}</button><button class="btn btn-ink"><i data-lucide="message-circle"></i>WhatsApp</button></div>
      </div>`);
  },
  'cat-exp'() {
    formDrawer('Add catering expense', 'ক্যাটারিং খরচ যোগ', `
      <div class="grid grid-cols-2 gap-3">${fld('Head', 'খাত', sel(['Fish & meat', 'Groceries', 'Cook & helpers', 'Transport', 'Gas', 'Other']))}${fld('Amount', 'টাকা', inp('class="field num text-lg" inputmode="numeric" required'))}</div>
      ${fld('Note', 'বিবরণ', inp('placeholder="e.g. Jagu Bazar, prawns"'))}
      <label class="w-full h-24 rounded-lg border-2 border-dashed border-rule bg-paper-2 text-ink-2 flex items-center justify-center gap-2 cursor-pointer"><i data-lucide="camera" class="w-6 h-6"></i><span class="text-sm font-semibold">${t('Photo of the bill', 'বিলের ছবি')}</span><input type="file" accept="image/*" capture="environment" class="sr-only" /></label>`,
      'Save expense', 'খরচ সেভ', 'Expense saved against this order.', 'এই অর্ডারে খরচ সেভ হয়েছে।');
  },
  'stock-in'(b) {
    const p = plants.find((x) => x.id === b.dataset.plant);
    formDrawer(`Stock in · ${p.name}`, `স্টক যোগ · ${p.nameBn}`, `
      <div class="grid grid-cols-2 gap-3">${fld('Quantity', 'সংখ্যা', inp('class="field num text-lg" inputmode="numeric" required value="20"'))}${fld('From', 'কোথা থেকে', sel(['Galiff Street wholesale', 'Own propagation', 'Gift / donation']))}</div>
      <div class="grid grid-cols-2 gap-3">${fld('Cost per plant', 'গাছ প্রতি দাম', inp(`class="field num" value="₹${Math.round(p.price * 0.45)}"`))}${fld('Selling price', 'বিক্রির দাম', inp(`class="field num" value="₹${p.price}"`))}</div>`,
      'Add to stock', 'স্টকে যোগ', 'Stock updated. Cost entered in the Nursery book.', 'স্টক আপডেট। খরচ নার্সারি খাতায় উঠেছে।');
  },
  loss(b) {
    const p = plants.find((x) => x.id === b.dataset.plant);
    formDrawer(`Record a loss · ${p.name}`, `নষ্ট · ${p.nameBn}`, `
      <div class="grid grid-cols-2 gap-3">${fld('Quantity', 'সংখ্যা', inp('class="field num text-lg" inputmode="numeric" required value="1"'))}${fld('Reason', 'কারণ', sel(['Died', 'Damaged', 'Given free', 'Count correction']))}</div>`,
      'Record loss', 'লিখুন', 'Loss recorded. Stock reduced.', 'নষ্ট লেখা হয়েছে। স্টক কমেছে।', { danger: true });
  },
  minutes() {
    formDrawer('Minutes · Sun 16 Nov', 'কার্যবিবরণী · রবি ১৬ নভে', `
      ${fld('Present', 'উপস্থিত', inp('value="Ashok C., Rajib B., Tapas M., Kakoli S., Debashis P., Sutapa B."'))}
      ${['Saraswati Puja budget approval', 'Sports Day volunteer list', 'Catering: second cook for December', 'Lapsed members: final reminder'].map((a, i) => fld(`${i + 1}. ${a}`, `${i + 1}. ${a}`, `<textarea class="field" rows="2" placeholder="Decision, who does it, by when"></textarea>`)).join('')}
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" checked />${t('Share with members in the app', 'অ্যাপে সদস্যদের সঙ্গে শেয়ার')}</label>`,
      'Save minutes', 'সেভ করুন', 'Minutes saved and shared.', 'কার্যবিবরণী সেভ ও শেয়ার হয়েছে।');
  },
  'event-edit'() { $('#new-event')?.click(); },
};
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b || !ACTIONS[b.dataset.act]) return;
  e.preventDefault(); e.stopPropagation();
  ACTIONS[b.dataset.act](b);
});

/* ---------------- Global search ---------------- */
{
  const g = $('#gsearch'), box = $('#gresults');
  const run = () => {
    const q = g.value.trim().toLowerCase();
    if (!q) { box.classList.add('hidden'); g.setAttribute('aria-expanded', 'false'); return; }
    const fams = families.filter((f) => `${f.no} ${f.head} ${f.headBn} ${f.phone}`.toLowerCase().includes(q)).slice(0, 5);
    const recs = ledger.filter((r) => `${r.ref} ${r.head}`.toLowerCase().includes(q)).slice(0, 4);
    const orders = cateringOrders.filter((o) => `${o.id} ${o.customer}`.toLowerCase().includes(q)).slice(0, 3);
    const sec = (en, bn, items) => items ? `<p class="px-3 pt-2.5 pb-1 text-[12px] font-bold uppercase tracking-wide text-ink-3">${t(en, bn)}</p>${items}` : '';
    const html = sec('Families', 'পরিবার', fams.map((f) => `<a href="#members" data-g-fam="${f.no}" class="flex items-center gap-3 px-3 py-2 hover:bg-paper-2"><i data-lucide="users" class="w-4 h-4 text-ink-3"></i><span class="font-semibold">${t(f.head, f.headBn)}</span><span class="text-sm text-ink-3 num">${f.no}</span>${f.due ? `<span class="ml-auto text-sm font-semibold">${inr(f.due)}</span>` : ''}</a>`).join(''))
      + sec('Khata', 'খাতা', recs.map((r) => `<a href="#khata/${r.book}" class="flex items-center gap-3 px-3 py-2 hover:bg-paper-2">${bookDot(r.book)}<span class="truncate">${t(r.head, r.headBn)}</span><span class="ml-auto text-sm num">${inr(r.amount)}</span></a>`).join(''))
      + sec('Catering', 'ক্যাটারিং', orders.map((o) => `<a href="#catering" class="flex items-center gap-3 px-3 py-2 hover:bg-paper-2"><i data-lucide="chef-hat" class="w-4 h-4 text-ink-3"></i><span class="font-semibold">${t(o.customer, o.customerBn)}</span><span class="text-sm text-ink-3 num">${o.id}</span></a>`).join(''));
    paint(box, html || `<p class="px-3 py-4 text-ink-3">${t(`Nothing found for “${g.value}”. Try a family number like MC-0104 or a phone number.`, `“${g.value}” পাওয়া যায়নি। MC-0104-এর মতো পরিবার নম্বর বা ফোন নম্বর দিয়ে খুঁজুন।`)}</p>`);
    box.classList.remove('hidden'); g.setAttribute('aria-expanded', 'true');
    $$('[data-g-fam]', box).forEach((a) => a.addEventListener('click', () => setTimeout(() => familyDrawer(a.dataset.gFam), 50)));
  };
  g.addEventListener('input', run);
  g.addEventListener('focus', run);
  g.addEventListener('blur', () => setTimeout(() => box.classList.add('hidden'), 200));
  g.addEventListener('keydown', (e) => { if (e.key === 'Escape') { g.value = ''; run(); g.blur(); } });
  document.addEventListener('keydown', (e) => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); g.focus(); } });
}

/* ---------------- Router ---------------- */
const SCREENS = { dashboard, members, collect, dues, khata, chanda: chandaScreen, catering, nursery, meetings, events: eventsScreen, reports, settings, profile, cards: cardsScreen };
let current = 'dashboard', currentParam;
router('dashboard', (name, param) => { current = name; currentParam = param; SCREENS[name]?.(param); });
document.addEventListener('langchange', () => SCREENS[current]?.(currentParam));
boot('console');
