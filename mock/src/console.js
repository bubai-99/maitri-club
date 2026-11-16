import { boot, t, inr, dn, seal, router, applyLang, refreshIcons, toast, lang, setLang, demo } from './shared.js';
import { PHOTOS, ALBUMS, GALLERY, photo } from './photos.js';
import { peopleOf, cardFront, cardBack, fillQrs, printCards, downloadCard } from './idcard.js';
import { panjikaDates, duties, rolePerms } from './data.js';
import { bnText, families, ledger, books, chanda, cateringOrders, cateringStatus, cateringPackages, plants, memberDiscount, notices, events, club, serversFor, memberRate, auditLog } from './data.js';
import { panjikaScreen } from './console-panjika.js';
import { initAdmin, logAudit, addReceipt, canSee, viewAs, lockedScreen, wireNotice, audienceRadios, searchPages } from './console-admin.js';

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
  { group: ['Members', 'সদস্য'], items: [['applications', 'user-check', 'Applications', 'আবেদন', '3'], ['members', 'users', 'Families', 'পরিবার'], ['collect', 'hand-coins', 'Collect payment', 'টাকা জমা'], ['dues', 'bell-ring', 'Dues & reminders', 'বকেয়া ও তাগাদা', String(families.filter((f) => f.due).length)], ['cards', 'id-card', 'ID cards', 'পরিচয়পত্র'], ['donors', 'droplet', 'Blood donors', 'রক্তদাতা']] },
  { group: ['Books', 'খাতা'], items: [['khata', 'book-open', 'Khata', 'খাতা'], ['receipts', 'receipt', 'Receipts register', 'রসিদ খাতা'], ['cash', 'landmark', 'Cash & bank', 'নগদ ও ব্যাংক', '3'], ['chanda', 'hand-heart', 'Puja chanda', 'পূজার চাঁদা']] },
  { group: ['Businesses', 'ব্যবসা'], items: [['catering', 'chef-hat', 'Catering', 'ক্যাটারিং', '2'], ['nursery', 'sprout', 'Nursery', 'নার্সারি']] },
  { group: ['Club', 'ক্লাব'], items: [['events', 'calendar-days', 'Events', 'অনুষ্ঠান'], ['panjika', 'moon-star', 'Panjika', 'পঞ্জিকা'], ['volunteers', 'hand-helping', 'Volunteers', 'স্বেচ্ছাসেবক'], ['meetings', 'megaphone', 'Notices & meetings', 'নোটিস ও সভা'], ['gallery', 'images', 'Gallery', 'ছবি ও ভিডিও', '2'], ['assets', 'package', 'Club assets', 'ক্লাবের সম্পত্তি']] },
  { group: ['Admin', 'অ্যাডমিন'], items: [['reports', 'chart-column', 'Reports', 'রিপোর্ট'], ['audit', 'history', 'Audit log', 'অডিট লগ'], ['settings', 'settings', 'Settings', 'সেটিংস']] },
];
function paintNav() {
  paint($('#side-nav'), NAV.map((g) => {
    const items = g.items.filter(([id]) => canSee(id));
    if (!items.length) return '';
    return `
  ${g.group[0] ? `<p class="px-3 mt-5 mb-1.5 text-[12px] font-semibold text-ink-3 tracking-wide">${t(g.group[0], g.group[1])}</p>` : ''}
  ${items.map(([id, icon, en, bn, badge]) => `
    <a href="#${id}" data-nav="${id}" ${id === current ? 'aria-current="page"' : ''} class="flex items-center gap-3 px-3 h-10 rounded-lg text-ink-2 hover:bg-paper-3/50 aria-[current=page]:bg-card aria-[current=page]:text-ink aria-[current=page]:font-semibold aria-[current=page]:shadow-[0_1px_2px_rgba(29,33,64,.08)]">
      <i data-lucide="${icon}" class="w-[18px] h-[18px]"></i>${t(en, bn)}
      ${badge ? `<span class="ml-auto chip h-5 px-1.5 text-[11.5px] bg-sindoor text-white num">${dn(badge)}</span>` : ''}
    </a>`).join('')}`;
  }).join(''));
  $$('#side-nav a').forEach((a) => a.addEventListener('click', () => closeSide()));
  // Phone bottom bar and header button follow the same role rules
  $$('nav[aria-label="Quick"] [data-nav]').forEach((a) => a.classList.toggle('invisible', !canSee(a.dataset.nav)));
  $('header a[href="#collect"]')?.classList.toggle('hidden', !canSee('collect'));
}
let current = 'dashboard', currentParam;
paintNav();

const side = $('#sidebar'), scrim = $('#scrim');
const lgMq = matchMedia('(min-width: 1024px)');
const syncInert = () => { side.inert = !lgMq.matches && side.classList.contains('-translate-x-full'); };
const closeSide = () => { side.classList.add('-translate-x-full'); scrim.classList.add('hidden'); syncInert(); };
$('#side-btn').addEventListener('click', () => { side.classList.remove('-translate-x-full'); scrim.classList.remove('hidden'); syncInert(); side.querySelector('a')?.focus(); });
lgMq.addEventListener('change', syncInert); syncInert();
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lgMq.matches) closeSide(); });
scrim.addEventListener('click', closeSide);
$('#more-btn').addEventListener('click', () => $('#side-btn').click());

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
  const bnD = (x) => String(x).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
  // The prototype's "today" is Sunday 15 November 2026
  const TODAY = Date.UTC(2026, 10, 15);
  const soon = panjikaDates.filter((p) => p.kind === 'puja').map((p) => ({ ...p, days: Math.round((Date.parse(p.date) - TODAY) / 86400000) })).find((p) => p.days >= 0 && p.days <= 10);
  const gaps = (duties.blood || []).reduce((a, d) => a + Math.max(0, d.need - d.who.length), 0);
  const role = viewAs && rolePerms.roles.find((r) => r.id === viewAs);
  const hello = role ? t(`Good evening, ${role.people}. Here is what is waiting for you.`, `শুভ সন্ধ্যা, ${role.peopleBn}। আপনার জন্য যা অপেক্ষা করছে।`) : t('Good evening, Tapas-da. Here is where the books stand.', 'শুভ সন্ধ্যা, তাপস-দা। খাতার হাল এই রকম।');
  paint(screen('dashboard'), `
    ${pageHead('Sunday, 15 November', 'রবিবার, ১৫ নভেম্বর', hello)}

    <div class="grid xl:grid-cols-12 gap-6">
      <!-- Books sheet -->
      <div class="xl:col-span-7 paper-card overflow-hidden ${canSee('receipts') ? '' : 'hidden'}">
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
            <tr class="bg-paper-2/50 font-semibold [&>td]:border-t [&>td]:border-t-ink/20 [&>td]:border-b-[3px] [&>td]:border-double [&>td]:border-b-ink/25">
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

      <!-- Needs you: first on phones, beside the books on wide screens -->
      <div class="${canSee('receipts') ? 'xl:col-span-5' : 'xl:col-span-12 max-w-[720px]'} order-first xl:order-none">
        <h2 class="font-display text-xl mb-3 flex items-center gap-2.5">${t('Needs you today', 'আজকের কাজ')}<span id="todo-count" class="chip h-6 px-2 text-[13px] bg-sindoor text-white num"></span></h2>
        <ul class="space-y-3" id="todo">
          ${soon ? `<li data-need="panjika" class="paper-card p-4 flex items-start gap-3">
            <span class="w-9 h-9 rounded-full bg-[#1f1440] text-[#ffe2a8] grid place-items-center shrink-0"><i data-lucide="moon-star" class="w-[18px] h-[18px]"></i></span>
            <div class="flex-1"><p class="font-semibold leading-snug">${t(`${soon.en} in ${soon.days} days`, `${soon.bn} আর ${bnD(soon.days)} দিন পরে`)}</p>
            <p class="text-sm text-ink-3 mt-0.5">${t('Check the puja times against the panjika before the notice goes out', 'নোটিস যাওয়ার আগে পঞ্জিকার সঙ্গে পূজার সময় মিলিয়ে নিন')}</p></div>
            <a href="#panjika" class="btn btn-line btn-sm shrink-0">${t('Check', 'মেলান')}</a>
          </li>` : ''}
          ${gaps ? `<li data-need="volunteers" class="paper-card p-4 flex items-start gap-3">
            <span class="w-9 h-9 rounded-full bg-sindoor-wash text-sindoor grid place-items-center shrink-0"><i data-lucide="hand-helping" class="w-[18px] h-[18px]"></i></span>
            <div class="flex-1"><p class="font-semibold leading-snug">${t(`Blood Donation Camp: ${gaps} volunteer places empty`, `রক্তদান শিবির: ${bnD(gaps)}টি স্বেচ্ছাসেবকের জায়গা খালি`)}</p>
            <p class="text-sm text-ink-3 mt-0.5">${t('Sat 28 Nov · registration desk and donor care', 'শনি ২৮ নভে · নাম লেখার টেবিল ও রক্তদাতার যত্ন')}</p></div>
            <a href="#volunteers/blood" class="btn btn-line btn-sm shrink-0">${t('Fill', 'ভরুন')}</a>
          </li>` : ''}
          ${pendingUpi.map((p, i) => `
          <li class="paper-card p-4" data-need="collect" data-upi="${i}">
            <div class="flex items-start gap-3">
              <span class="w-9 h-9 rounded-full bg-marigold-wash text-turmeric grid place-items-center shrink-0"><i data-lucide="smartphone" class="w-[18px] h-[18px]"></i></span>
              <div class="flex-1 min-w-0">
                <p class="font-semibold leading-snug">${t(`UPI payment to confirm · ${p.fam.head}`, `ইউপিআই যাচাই · ${p.fam.headBn}`)}</p>
                <p class="text-sm text-ink-3 mt-0.5 num">${p.fam.no} · ${p.months} · UTR ${p.utr} · ${p.time}</p>
              </div>
              <span class="font-semibold">${inr(p.amount)}</span>
            </div>
            <div class="flex flex-wrap gap-2 mt-3 sm:pl-12">
              <button class="btn btn-ink btn-sm" data-confirm="${i}"><i data-lucide="check"></i>${t('Matches bank, confirm', 'ব্যাংকে মিলেছে, নিশ্চিত')}</button>
              <button class="btn btn-ghost btn-sm" data-flag="${i}">${t('Not in bank yet', 'ব্যাংকে আসেনি')}</button>
            </div>
          </li>`).join('')}
          ${pendingExpenses.map((x, i) => `
          <li class="paper-card p-4" data-need="receipts" data-exp="${i}">
            <div class="flex items-start gap-3">
              <span class="w-9 h-9 rounded-full bg-ink text-white grid place-items-center shrink-0"><i data-lucide="stamp" class="w-[18px] h-[18px]"></i></span>
              <div class="flex-1 min-w-0">
                <p class="font-semibold leading-snug">${t('Second signature needed', 'দ্বিতীয় সই দরকার')} · ${t(x.head, x.headBn)}</p>
                <p class="text-sm text-ink-3 mt-0.5">${t(`Entered by ${x.by} · ${x.note}`, `লিখেছেন ${x.by} · ${x.note}`)}</p>
              </div>
              <span class="font-semibold">${inr(x.amount)}</span>
            </div>
            <div class="flex flex-wrap gap-2 mt-3 sm:pl-12">
              <button class="btn btn-ink btn-sm" data-exp-ok="${i}"><i data-lucide="check"></i>${t('Approve', 'অনুমোদন')}</button>
              <button class="btn btn-ghost btn-sm" data-act="bill" data-head="${x.head}" data-amt="${x.amount}">${t('See bill', 'বিল দেখুন')}</button>
              <button class="btn btn-ghost btn-sm" data-exp-no="${i}">${t('Send back', 'ফেরত')}</button>
            </div>
          </li>`).join('')}
          ${openApps().length ? `<li data-need="applications" class="paper-card p-4 flex items-start gap-3">
            <span class="w-9 h-9 rounded-full bg-tulsi-wash text-tulsi grid place-items-center shrink-0"><i data-lucide="user-check" class="w-[18px] h-[18px]"></i></span>
            <div class="flex-1"><p class="font-semibold leading-snug">${t(`${openApps().length} membership applications to review`, `${openApps().length}টি সদস্যপদের আবেদন দেখতে হবে`)}</p>
            <p class="text-sm text-ink-3 mt-0.5">${openApps().map((a) => t(a.head, a.headBn)).join(', ')}</p></div>
            <a href="#applications" class="btn btn-line btn-sm shrink-0">${t('Review', 'দেখুন')}</a>
          </li>` : ''}
          <li data-need="dues" class="paper-card p-4 flex items-start gap-3">
            <span class="w-9 h-9 rounded-full bg-sindoor-wash text-sindoor grid place-items-center shrink-0"><i data-lucide="bell-ring" class="w-[18px] h-[18px]"></i></span>
            <div class="flex-1"><p class="font-semibold leading-snug">${t(`${dueFams.length} families owe 3 months or more`, `${dueFams.length}টি পরিবারের ৩ মাস বা বেশি বকেয়া`)}</p>
            <p class="text-sm text-ink-3 mt-0.5">${dueFams.slice(0, 3).map((f) => t(f.head, f.headBn)).join(', ')} …</p></div>
            <a href="#dues" class="btn btn-line btn-sm shrink-0">${t('Remind', 'তাগাদা')}</a>
          </li>
          ${admin.cashOutside() ? `<li data-need="receipts" class="paper-card p-4 flex items-start gap-3">
            <span class="w-9 h-9 rounded-full bg-paper-2 text-ink grid place-items-center shrink-0"><i data-lucide="hand-coins" class="w-[18px] h-[18px]"></i></span>
            <div class="flex-1"><p class="font-semibold leading-snug">${t(`${inr(admin.cashOutside())} cash is still with collectors`, `সংগ্রাহকদের কাছে এখনও ${inr(admin.cashOutside())} নগদ`)}</p>
            <p class="text-sm text-ink-3 mt-0.5">${t('Bapi Halder has held chanda cash for 10 days · 3 bank lines to match', 'বাপি হালদারের কাছে ১০ দিন ধরে চাঁদার নগদ · ব্যাংকের ৩টি লাইন মেলাতে হবে')}</p></div>
            <a href="#cash" class="btn btn-line btn-sm shrink-0">${t('Receive', 'বুঝে নিন')}</a>
          </li>` : ''}
          <li data-need="catering" class="paper-card p-4 flex items-start gap-3">
            <span class="w-9 h-9 rounded-full bg-turmeric-wash text-turmeric grid place-items-center shrink-0"><i data-lucide="chef-hat" class="w-[18px] h-[18px]"></i></span>
            <div class="flex-1"><p class="font-semibold leading-snug">${t('Riya & Arka wedding: quote sent 4 days ago', 'রিয়া ও অর্কর বিয়ে: ৪ দিন আগে কোটেশন গেছে')}</p>
            <p class="text-sm text-ink-3 mt-0.5">${t('220 guests · Full setup · 6 Dec', '২২০ জন · সম্পূর্ণ ব্যবস্থা · ৬ ডিসে')}</p></div>
            <a href="#catering" class="btn btn-line btn-sm shrink-0">${t('Follow up', 'খোঁজ নিন')}</a>
          </li>
          <li data-need="nursery" class="paper-card p-4 flex items-start gap-3">
            <span class="w-9 h-9 rounded-full bg-tulsi-wash text-tulsi grid place-items-center shrink-0"><i data-lucide="sprout" class="w-[18px] h-[18px]"></i></span>
            <div class="flex-1"><p class="font-semibold leading-snug">${t('3 plants almost out of stock', '৩টি গাছ প্রায় শেষ')}</p>
            <p class="text-sm text-ink-3 mt-0.5">${t('Snake plant, Chrysanthemum, Guava', 'স্নেক প্ল্যান্ট, চন্দ্রমল্লিকা, পেয়ারা')}</p></div>
            <a href="#nursery/stock" class="btn btn-line btn-sm shrink-0">${t('Restock', 'স্টক')}</a>
          </li>
        </ul>
      </div>

      <!-- Recent entries -->
      <div class="xl:col-span-12 paper-card overflow-hidden ${canSee('receipts') ? '' : 'hidden'}">
        <div class="px-5 pt-4 pb-3 flex items-center border-b border-rule">
          <h2 class="font-display text-xl">${t('Latest entries', 'সাম্প্রতিক এন্ট্রি')}</h2>
          <span class="ml-auto text-sm text-ink-3">${t('Every entry shows who wrote it', 'প্রতিটি এন্ট্রিতে লেখকের নাম থাকে')}</span>
        </div>
        ${ledgerTable(ledger.slice(0, 6), { compact: true })}
      </div>
    </div>`);
  // Each task belongs to a page; a role only sees the tasks for pages it can open
  $$('#todo > li[data-need]').forEach((li) => { if (!canSee(li.dataset.need)) li.remove(); });
  const count = () => {
    const left = $$('#todo > li:not([data-done])').length;
    const c = $('#todo-count');
    c.innerHTML = dn(String(left)); c.classList.toggle('hidden', !left);
    $('#todo-clear')?.remove();
    if (!left) $('#todo').insertAdjacentHTML('beforeend', `<li id="todo-clear" class="paper-card p-6 text-center"><span class="w-11 h-11 mx-auto rounded-full bg-tulsi-wash text-tulsi grid place-items-center"><i data-lucide="check-check" class="w-5 h-5"></i></span><p class="font-semibold mt-3">${t('Nothing waiting for you', 'আপনার জন্য কোনো কাজ বাকি নেই')}</p><p class="text-sm text-ink-3 mt-1">${t('New payments and requests will show up here.', 'নতুন পেমেন্ট আর অনুরোধ এখানে আসবে।')}</p></li>`);
    applyLang($('#todo')); refreshIcons();
  };
  count();
  const settle = (b, html) => {
    const li = b.closest('li');
    paint(li, html);
    li.dataset.done = '1'; count();
    li.querySelector('[data-undo]')?.addEventListener('click', () => dashboard());
  };
  $$('[data-confirm]').forEach((b) => b.addEventListener('click', () => {
    const p = pendingUpi[b.dataset.confirm];
    const no = nextReceipt();
    addReceipt({ no, fam: p.fam, amount: p.amount, mode: 'upi', months: p.amount / club.monthlyFee });
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
  $$('[data-exp-ok]').forEach((b) => b.addEventListener('click', () => {
    const x = pendingExpenses[b.dataset.expOk];
    settle(b, `<div class="flex items-center gap-3" role="status"><span class="w-9 h-9 rounded-full bg-ink text-white grid place-items-center shrink-0"><i data-lucide="check" class="w-[18px] h-[18px]"></i></span>
      <div class="flex-1 min-w-0"><p class="font-semibold leading-snug">${t('Approved', 'অনুমোদিত')} · ${t(x.head, x.headBn)} · ${inr(x.amount)}</p>
      <p class="text-sm text-ink-3 mt-0.5">${t(`Signed by ${x.by} and Tapas Mondal · entered in the Club book`, `${x.by} ও তাপস মণ্ডলের সই · ক্লাব খাতায় উঠেছে`)}</p></div>
      <button class="btn btn-ghost btn-sm" data-undo>${t('Undo', 'ফেরান')}</button></div>`);
  }));
  $$('[data-exp-no]').forEach((b) => b.addEventListener('click', () => {
    const x = pendingExpenses[b.dataset.expNo];
    formDrawer('Send back for changes', 'সংশোধনের জন্য ফেরত', `
      <div class="rounded-lg bg-paper-2 p-4 text-[15px]"><p class="font-semibold">${t(x.head, x.headBn)}</p><p class="text-ink-2">${inr(x.amount)} · ${x.by}</p></div>
      ${fld('What needs to change? (required)', 'কী বদলাতে হবে? (বাধ্যতামূলক)', '<textarea class="field" rows="3" required placeholder="e.g. Get a second quotation before paying the advance"></textarea>')}`,
      'Send back', 'ফেরত পাঠান', `Sent back to ${x.by}. Nothing entered in the khata.`, `${x.by}-কে ফেরত পাঠানো হয়েছে। খাতায় কিছু ওঠেনি।`);
  }));
}

/* ---------------- Membership applications ---------------- */
const applications = [
  { id: 'AP-26-019', head: 'Soumen Pramanik', headBn: 'সৌমেন প্রামানিক', phone: '9830551274', lane: 'Lane 3', laneBn: '৩ নং গলি', address: '22/1 Netaji Subhas Road', people: [['Mitali Pramanik', 'Wife'], ['Riju Pramanik', 'Son, 9']], plan: 'monthly', applied: '12 Nov', via: 'Website', status: 'new', note: '' },
  { id: 'AP-26-018', head: 'Farida Begum', headBn: 'ফরিদা বেগম', phone: '9874012388', lane: 'Pukur Par', laneBn: 'পুকুর পাড়', address: '5 Pukur Par Lane', people: [['Rafiq Ali', 'Husband'], ['Sana Ali', 'Daughter, 16'], ['Amina Bibi', 'Mother-in-law']], plan: 'yearly', applied: '10 Nov', via: 'Website', status: 'new', note: '' },
  { id: 'AP-26-017', head: 'Kaushik Ghoshal', headBn: 'কৌশিক ঘোষাল', phone: '9903318820', lane: 'School Road', laneBn: 'স্কুল রোড', address: '41 School Road, 2nd floor', people: [], plan: 'monthly', applied: '6 Nov', via: 'At the club', status: 'info', note: 'Asked for address proof: new tenant' },
];
const approved = [
  { head: 'Pallab Sen', headBn: 'পল্লব সেন', no: 'MC-0172', on: '2 Nov' },
  { head: 'Mousumi Dhar', headBn: 'মৌসুমী ধর', no: 'MC-0171', on: '28 Oct' },
];
let nextFamNo = 173;
// Prototype: an application sent from the website Join form in this browser arrives here
{
  const { app: sent, approved: ok } = demo.get();
  if (sent && !applications.some((a) => a.id === sent.id)) {
    applications.unshift({ id: sent.id, head: sent.head, headBn: sent.head, phone: sent.phone, lane: sent.lane, laneBn: sent.lane, address: sent.address, people: sent.people.map((n) => [n, 'Family']), plan: sent.plan, applied: '15 Nov', via: 'Website', status: ok ? 'done' : 'new', note: '', mine: true });
    if (ok) { approved.unshift({ head: sent.head, headBn: sent.head, no: ok.no, on: '15 Nov' }); nextFamNo++; }
  }
}
const openApps = () => applications.filter((a) => a.status === 'new' || a.status === 'info');
let selApp = applications[0].id;
function applicationsScreen(param) {
  if (param) selApp = param;
  const open = openApps();
  const badge = document.querySelector('#side-nav [data-nav="applications"] .chip');
  if (badge) { badge.textContent = open.length; badge.classList.toggle('hidden', !open.length); }
  if (!open.find((a) => a.id === selApp)) selApp = open[0]?.id;
  const a = applications.find((x) => x.id === selApp);
  const plan = (p) => (p === 'yearly' ? t('₹1,100 / year', '₹১,১০০ / বছর') : t('₹100 / month', '₹১০০ / মাস'));
  paint(screen('applications'), `
    ${pageHead('Membership applications', 'সদস্যপদের আবেদন', t('From the website Join form and the club counter. The committee approves at the next meeting.', 'ওয়েবসাইটের ফর্ম ও ক্লাব কাউন্টার থেকে। কমিটি পরের সভায় অনুমোদন করে।'), `
      <button class="btn btn-ink btn-sm" data-act="member-entry"><i data-lucide="file-pen-line"></i>${t('Enter a paper form', 'কাগজের ফর্ম তুলুন')}</button>`)}
    <div class="grid xl:grid-cols-12 gap-6 items-start">
      <div class="xl:col-span-5 space-y-3">
        ${open.length ? open.map((x) => `
          <a href="#applications/${x.id}" class="block paper-card p-4 ${x.id === selApp ? 'ring-2 ring-sindoor/30 border-sindoor' : 'hover:border-ink/30'}">
            <div class="flex items-start gap-3">
              <div class="flex-1 min-w-0"><p class="font-semibold">${t(x.head, x.headBn)}</p><p class="text-sm text-ink-3 num">${x.id} · ${t(x.lane, x.laneBn)} · ${t(`${x.people.length + 1} people`, `${x.people.length + 1} জন`)}</p></div>
              ${x.status === 'info' ? `<span class="chip bg-marigold-wash text-turmeric">${t('Waiting for info', 'তথ্যের অপেক্ষা')}</span>` : `<span class="chip bg-sindoor-wash text-sindoor-deep">${t('New', 'নতুন')}</span>`}
            </div>
            <p class="text-sm text-ink-2 mt-2">${t(`Applied ${x.applied} · ${x.via}`, `আবেদন ${x.applied} · ${x.via === 'Website' ? 'ওয়েবসাইট' : 'ক্লাবে'}`)}</p>
          </a>`).join('') : `<div class="paper-card p-8 text-center text-ink-3">${t('No applications waiting.', 'কোনো আবেদন বাকি নেই।')}</div>`}
        <div class="paper-card">
          <p class="px-4 pt-3.5 pb-2 text-sm font-semibold text-ink-3">${t('Recently approved', 'সম্প্রতি অনুমোদিত')}</p>
          <ul class="px-4 pb-2">${approved.map((r) => `<li class="py-2.5 border-t border-rule flex items-center gap-3"><i data-lucide="check-circle-2" class="w-5 h-5 text-tulsi"></i><span class="flex-1 font-semibold">${t(r.head, r.headBn)}</span><span class="text-sm text-ink-3 num">${r.no} · ${r.on}</span></li>`).join('')}</ul>
        </div>
      </div>
      ${a ? `<div class="xl:col-span-7 paper-card">
        <div class="p-5 border-b border-rule">
          <p class="text-sm text-ink-3 num">${a.id} · ${t(`applied ${a.applied}`, `আবেদন ${a.applied}`)}</p>
          <h2 class="font-display text-2xl leading-tight">${t(a.head, a.headBn)}</h2>
          <p class="text-ink-2 text-[15px]">${a.address} · ${t(a.lane, a.laneBn)}</p>
        </div>
        <div class="p-5 space-y-5">
          ${a.status === 'info' ? `<div class="rounded-lg bg-marigold-wash p-3.5 text-[15px] flex gap-2.5"><i data-lucide="info" class="w-5 h-5 shrink-0 text-turmeric"></i>${a.note}</div>` : ''}
          <dl class="grid sm:grid-cols-3 gap-4 text-[15px]">
            <div><dt class="text-sm text-ink-3">${t('Mobile', 'মোবাইল')}</dt><dd class="font-semibold num">${a.phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</dd></div>
            <div><dt class="text-sm text-ink-3">${t('Plan', 'প্ল্যান')}</dt><dd class="font-semibold">${plan(a.plan)}</dd></div>
            <div><dt class="text-sm text-ink-3">${t('Admission', 'ভর্তি ফি')}</dt><dd class="font-semibold">${inr(club.admissionFee)} <span class="font-normal text-ink-3">${t('on approval', 'অনুমোদনে')}</span></dd></div>
          </dl>
          <div>
            <p class="text-sm font-semibold text-ink-3">${t('Family', 'পরিবার')}</p>
            <ul class="mt-1.5 text-[15px] divide-y divide-rule border-y border-rule">
              <li class="py-2 flex"><span class="font-semibold">${t(a.head, a.headBn)}</span><span class="ml-auto text-ink-3">${t('Head of family', 'পরিবারের প্রধান')}</span></li>
              ${a.people.map(([n, r]) => `<li class="py-2 flex"><span>${n}</span><span class="ml-auto text-ink-3">${t(r, bnText(r))}</span></li>`).join('')}
            </ul>
          </div>
          <div>
            <p class="text-sm font-semibold text-ink-3">${t('Checks', 'যাচাই')}</p>
            <ul class="mt-1.5 space-y-1.5 text-[15px]">
              <li class="flex gap-2"><i data-lucide="check" class="w-5 h-5 text-tulsi shrink-0"></i>${t('Mobile number verified by OTP', 'মোবাইল ওটিপি দিয়ে যাচাই')}</li>
              <li class="flex gap-2"><i data-lucide="check" class="w-5 h-5 text-tulsi shrink-0"></i>${t('No existing family with this number or address', 'এই নম্বর বা ঠিকানায় আগের পরিবার নেই')}</li>
              <li class="flex gap-2">${a.status === 'info' ? `<i data-lucide="circle-dashed" class="w-5 h-5 text-turmeric shrink-0"></i>${t('Address proof pending', 'ঠিকানার প্রমাণ বাকি')}` : `<i data-lucide="check" class="w-5 h-5 text-tulsi shrink-0"></i>${t('Lives inside the para boundary', 'পাড়ার সীমার মধ্যে থাকেন')}`}</li>
            </ul>
          </div>
          <div class="grid sm:grid-cols-3 gap-2 pt-1">
            <button class="btn btn-primary" data-act="app-approve" data-id="${a.id}"><i data-lucide="check"></i>${t('Approve', 'অনুমোদন')}</button>
            <a class="btn btn-line" target="_blank" rel="noopener" href="https://wa.me/91${a.phone}?text=${encodeURIComponent(`Namaskar ${a.head}, this is Gede Maitree Club about your membership application ${a.id}. Could you please share an address proof (Aadhaar or electricity bill)? Thank you.`)}" data-act="app-info" data-id="${a.id}"><i data-lucide="message-circle"></i>${t('Ask for info', 'তথ্য চান')}</a>
            <button class="btn btn-ghost text-ink-2" data-act="app-reject" data-id="${a.id}"><i data-lucide="x"></i>${t('Decline', 'নামঞ্জুর')}</button>
          </div>
        </div>
      </div>` : ''}
    </div>`);
}

/* Expense approvals (two signatures over ₹10,000) */
const pendingExpenses = [
  { head: 'Pandal advance — Saraswati Puja', headBn: 'প্যান্ডেল অগ্রিম — সরস্বতী পূজা', amount: 15000, by: 'Kakoli Sen', book: 'club', note: 'Maa Tara Decorators, 50% advance' },
];

let receiptSeq = 412;
const nextReceipt = () => `MC-26-${String(++receiptSeq).padStart(4, '0')}`;
const MONTHS = [['Jan', 'জানু'], ['Feb', 'ফেব্রু'], ['Mar', 'মার্চ'], ['Apr', 'এপ্রি'], ['May', 'মে'], ['Jun', 'জুন'], ['Jul', 'জুলা'], ['Aug', 'আগ'], ['Sep', 'সেপ্টে'], ['Oct', 'অক্টো'], ['Nov', 'নভে'], ['Dec', 'ডিসে']];
const dueRange = (n) => { const end = 10, start = (end - n + 1 + 12) % 12; return n === 1 ? MONTHS[end] : [`${MONTHS[start][0]}–${MONTHS[end][0]}`, `${MONTHS[start][1]}–${MONTHS[end][1]}`]; };

/* ---------------- Ledger table ---------------- */
function ledgerTable(rows, { compact = false } = {}) {
  const tin = rows.filter((r) => r.type === 'in').reduce((a, b) => a + b.amount, 0);
  const tout = rows.filter((r) => r.type === 'out').reduce((a, b) => a + b.amount, 0);
  return `<div class="relative overflow-x-auto"><div class="khata sm:min-w-[720px]">
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
        ${rows.map((r, i) => `<tr${i && rows[i - 1].date !== r.date ? ' class="[&>td]:border-t [&>td]:border-t-ink/20"' : ''}>
          <td class="!px-2 text-[13px] text-ink-2 num whitespace-nowrap">${i && rows[i - 1].date === r.date ? '' : dn(r.date)}</td>
          <td class="!pl-4"><span class="flex items-center gap-2.5">${bookDot(r.book)}<span>${t(r.head, r.headBn)}</span>${r.bill ? `<button class="text-ink-3 hover:text-ink" data-act="bill" data-head="${r.head}" data-amt="${r.amount}" aria-label="View bill photo" title="Bill photo"><i data-lucide="paperclip" class="w-4 h-4"></i></button>` : ''}</span></td>
          <td class="hidden md:table-cell text-[13px] text-ink-3 num whitespace-nowrap">${r.ref}</td>
          <td class="hidden md:table-cell text-[13px] text-ink-2 whitespace-nowrap">${r.by}</td>
          <td class="amt ${r.type === 'in' ? 'text-ink font-semibold' : ''}">${r.type === 'in' ? inr(r.amount) : ''}</td>
          <td class="amt ${r.type === 'out' ? 'text-sindoor font-semibold' : ''}">${r.type === 'out' ? inr(r.amount) : ''}</td>
          ${compact ? '' : `<td class="text-right"><button class="btn btn-ghost btn-sm text-ink-2" data-act="reverse" data-head="${r.head}" data-amt="${r.amount}" data-type="${r.type}">${t('Reverse', 'উল্টান')}</button></td>`}
        </tr>`).join('')}
        ${compact ? '' : `<tr class="bg-paper-2/50 font-semibold [&>td]:border-t [&>td]:border-t-ink/20 [&>td]:border-b-[3px] [&>td]:border-double [&>td]:border-b-ink/25">
          <td></td><td class="!pl-4">${t('Page total', 'পাতার মোট')}</td><td class="hidden md:table-cell"></td><td class="hidden md:table-cell"></td>
          <td class="amt">${inr(tin)}</td><td class="amt text-sindoor">${inr(tout)}</td><td></td></tr>`}
      </tbody>
    </table></div></div>`;
}

/* ---------------- Members ---------------- */
let memFilter = 'all';
let memQuery = '';
let memLane = 'all';
function members() {
  const counts = { all: families.length, paid: 0, due: 0, lapsed: 0 };
  families.forEach((f) => counts[f.status]++);
  const list = families.filter((f) => (memFilter === 'all' || f.status === memFilter) && (memLane === 'all' || f.lane === memLane) && (`${f.head} ${f.headBn} ${f.no} ${f.phone}`.toLowerCase().includes(memQuery.toLowerCase())));
  paint(screen('members'), `
    ${pageHead('Families', 'পরিবার', t('286 families · 1,041 people · showing a sample of 24', '২৮৬টি পরিবার · ১,০৪১ জন · নমুনা ২৪টি'), `
      <button class="btn btn-line btn-sm" data-act="import"><i data-lucide="upload"></i>${t('Import from Excel', 'এক্সেল থেকে')}</button>
      <button class="btn btn-line btn-sm" data-act="export" data-kind="families"><i data-lucide="file-down"></i>${t('Export', 'ডাউনলোড')}</button>
      <button class="btn btn-ink btn-sm" data-act="member-entry"><i data-lucide="user-plus"></i>${t('Member entry', 'সদস্য এন্ট্রি')}</button>`)}
    <div class="flex flex-wrap items-center gap-2 mb-4">
      ${['all', 'paid', 'due', 'lapsed'].map((k) => `<button data-mf="${k}" aria-pressed="${memFilter === k}" class="chip h-9 px-3.5 text-sm border border-rule bg-card aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink">${t({ all: 'All', paid: 'Paid up', due: 'Due', lapsed: 'Lapsed 6+ months' }[k], { all: 'সব', paid: 'পরিশোধিত', due: 'বকেয়া', lapsed: '৬+ মাস বকেয়া' }[k])} <span class="opacity-70 num">${dn(String(counts[k]))}</span></button>`).join('')}
      <select id="mem-lane" class="field h-9 text-sm w-auto sm:ml-auto" aria-label="Lane"><option value="all">${lang === 'bn' ? 'সব গলি' : 'All lanes'}</option>${LANES.map((l, i) => `<option value="${l}" ${memLane === l ? 'selected' : ''}>${lang === 'bn' ? ['১ নং গলি', '২ নং গলি', '৩ নং গলি', 'পুকুর পাড়', 'স্কুল রোড'][i] : l}</option>`).join('')}</select>
      <input id="mem-q" value="${memQuery}" class="field h-9 w-full sm:w-64 text-sm" data-bn-ph="নাম, নম্বর বা ফোন" placeholder="Name, number or phone" />
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
  $('#mem-lane').addEventListener('change', (e) => { memLane = e.target.value; members(); });
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
      ${f.due ? `<button class="mt-2 text-sm font-semibold text-ink-2 hover:text-ink hover:underline" data-act="waive" data-no="${f.no}">${t('Waive dues (hardship, death in family…)', 'বকেয়া মকুব (অসুবিধা, শোক…)')}</button>` : ''}
      <div class="flex items-center mt-7"><h3 class="font-display text-lg">${t('Family members', 'পরিবারের সদস্য')}</h3>
        <button class="ml-auto btn btn-ghost btn-sm text-sindoor" data-act="person" data-no="${f.no}"><i data-lucide="user-plus"></i>${t('Add', 'যোগ')}</button></div>
      <ul class="mt-1 text-[15px] divide-y divide-rule border-y border-rule">
        ${peopleOf(f, families.indexOf(f)).map((p, k) => `<li class="py-2.5 flex items-center gap-3">
          <span class="flex-1 min-w-0"><span class="block font-semibold truncate">${t(p.name, p.nameBn)}</span><span class="block text-sm text-ink-3">${t(p.rel, p.relBn)}</span></span>
          ${k ? `<button class="btn btn-ghost btn-sm text-ink-2" data-act="person" data-no="${f.no}" data-name="${p.name}" data-rel="${p.rel}">${t('Edit', 'সম্পাদনা')}</button>` : `<span class="chip bg-paper-2 text-ink-2">${t('Head', 'প্রধান')}</span>`}
        </li>`).join('')}
      </ul>
      <h3 class="font-display text-lg mt-7">${t('Payment history', 'পেমেন্টের ইতিহাস')}</h3>
      <p class="text-sm text-ink-3">${t('Tap a receipt to print it again or resend it.', 'আবার প্রিন্ট বা পাঠাতে রসিদে চাপুন।')}</p>
      <ul class="mt-2 text-[15px]">
        ${[['12 Sep 2026', 'MC-26-0388', 300, 'Cash'], ['04 Jun 2026', 'MC-26-0214', 300, 'UPI'], ['09 Mar 2026', 'MC-26-0097', 300, 'Cash'], ['02 Dec 2025', 'MC-25-0512', 300, 'Cash']].map(([d, r, a, m]) => `
        <li class="border-b border-rule"><button class="w-full flex items-center py-2.5 hover:bg-paper-2 -mx-2 px-2 rounded" data-act="receipt" data-ref="${r}" data-amt="${a}" data-no="${f.no}"><span class="num">${r}</span><span class="text-ink-3 text-sm ml-3">${dn(d)} · ${m}</span><span class="ml-auto font-semibold">${inr(a)}</span><i data-lucide="chevron-right" class="w-4 h-4 ml-2 text-ink-3"></i></button></li>`).join('')}
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
          <div class="flex items-center gap-3 border-b border-ink/20 pb-3">
            <span>${seal({ size: 48, rotate: -4 })}</span>
            <div class="leading-tight"><p class="font-display text-xl text-sindoor">${t('Gede Maitree Club', 'গেদে মৈত্রী ক্লাব')}</p><p class="text-[11px] tracking-[0.14em] font-semibold text-ink-3">NETAJI PARA · ESTD 2014 · REG. S-0027153</p></div>
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
          <a target="_blank" rel="noopener" href="https://wa.me/91${f.phone}?text=${encodeURIComponent(lang === 'bn' ? `নমস্কার, গেদে মৈত্রী ক্লাবে ₹${amount} জমা হয়েছে। রসিদ নং ${col.receipt}। ধন্যবাদ।` : `Namaskar, ₹${amount} received by Gede Maitree Club. Receipt no. ${col.receipt}. Thank you.`)}" class="btn btn-line btn-sm flex-1"><i data-lucide="message-circle"></i>${t('Also send on WhatsApp', 'হোয়াটসঅ্যাপেও পাঠান')}</a>
          <button class="btn btn-line btn-sm flex-1" data-act="receipt-print" data-ref="${col.receipt}"><i data-lucide="printer"></i>${t('Print', 'প্রিন্ট')}</button></div>` : ''}
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
    col.done = true; col.receipt = nextReceipt();
    addReceipt({ no: col.receipt, fam: col.fam, amount: col.months * club.monthlyFee, mode: col.mode, months: col.months });
    collect();
  });
  $('#undo-collect')?.addEventListener('click', () => { admin.dropReceipt(col.receipt); col.done = false; col.receipt = null; receiptSeq--; collect(); toast(`<i data-lucide="undo-2"></i>${t('Entry reversed. Nothing was kept in the khata.', 'এন্ট্রি ফেরানো হয়েছে। খাতায় কিছু থাকেনি।')}`); });
  $('#next-collect')?.addEventListener('click', () => { const f = families.find((x) => x.due && x !== col.fam) || families[0]; col = { fam: f, months: Math.max(1, f.dueMonths), mode: 'cash', done: false, receipt: null }; collect(); });
}

/* ---------------- Dues ---------------- */
let duesLane = 'all', duesMin = 1;
const duesPick = new Set();
const reminded = {};
function dues() {
  const all = families.filter((f) => f.due);
  const list = all.filter((f) => f.dueMonths >= duesMin && (duesLane === 'all' || f.lane === duesLane)).sort((a, b) => b.dueMonths - a.dueMonths);
  [...duesPick].forEach((no) => { if (!list.find((f) => f.no === no)) duesPick.delete(no); });
  const total = list.reduce((a, b) => a + b.due, 0);
  const msg = (f) => (lang === 'bn'
    ? `নমস্কার ${f.headBn}, গেদে মৈত্রী ক্লাবের ${f.dueMonths} মাসের চাঁদা ₹${f.due} বাকি আছে। অ্যাপে ইউপিআই-এ দিতে পারেন বা সন্ধ্যায় ক্লাব ঘরে তাপস-দাকে দিন। ধন্যবাদ।`
    : `Namaskar ${f.head}, your Gede Maitree Club subscription of ₹${f.due} for ${f.dueMonths} months is due. Pay by UPI in the app, or to Tapas-da at the club room in the evening. Thank you.`);
  paint(screen('dues'), `
    ${pageHead('Dues & reminders', 'বকেয়া ও তাগাদা', `${t(`${list.length} families owe`, `${list.length}টি পরিবারের বকেয়া`)} <strong class="text-sindoor">${inr(total)}</strong>`, `
      <button class="btn btn-line btn-sm" data-act="export" data-kind="families"><i data-lucide="file-down"></i>${t('Export', 'ডাউনলোড')}</button>`)}
    <div class="flex flex-wrap items-center gap-2 mb-4">
      ${[[1, 'Any amount', 'সব'], [3, '3+ months', '৩+ মাস'], [6, '6+ months (lapsed)', '৬+ মাস (মেয়াদোত্তীর্ণ)']].map(([m, en, bn]) => `<button data-dmin="${m}" aria-pressed="${duesMin === m}" class="chip h-9 px-3.5 text-sm border border-rule bg-card aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink">${t(en, bn)} <span class="opacity-70 num">${dn(String(all.filter((f) => f.dueMonths >= m).length))}</span></button>`).join('')}
      <select id="dues-lane" class="field h-9 text-sm w-auto" aria-label="Lane"><option value="all">${lang === 'bn' ? 'সব গলি' : 'All lanes'}</option>${LANES.map((l, i) => `<option value="${l}" ${duesLane === l ? 'selected' : ''}>${lang === 'bn' ? ['১ নং গলি', '২ নং গলি', '৩ নং গলি', 'পুকুর পাড়', 'স্কুল রোড'][i] : l}</option>`).join('')}</select>
      ${duesPick.size ? `<span class="sm:ml-auto flex items-center gap-2"><span class="text-sm text-ink-2">${t(`${duesPick.size} selected`, `${duesPick.size}টি বাছা`)}</span><button class="btn btn-ink btn-sm" data-act="remind-all" data-picked="1"><i data-lucide="send"></i>${t('Remind selected', 'বাছাইদের তাগাদা')}</button><button class="btn btn-ghost btn-sm" id="dues-clear">${t('Clear', 'মুছুন')}</button></span>` : ''}
    </div>
    <div class="grid lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-8 paper-card overflow-x-auto">
        <table class="khata-table">
          <thead><tr><th class="w-10 !pr-0"><input type="checkbox" id="dues-all" class="w-4 h-4 accent-[#2b2f36] align-middle" ${list.length && duesPick.size === list.length ? 'checked' : ''} aria-label="${lang === 'bn' ? 'সব বাছুন' : 'Select all'}" /></th><th>${t('Family', 'পরিবার')}</th><th class="hidden sm:table-cell">${t('Months', 'মাস')}</th><th class="!text-right">${t('Due', 'বকেয়া')}</th><th class="hidden md:table-cell">${t('Last reminded', 'শেষ তাগাদা')}</th><th><span class="sr-only">${t('Action', 'কাজ')}</span></th></tr></thead>
          <tbody>
            ${list.length ? '' : `<tr><td colspan="6" class="!py-12 text-center text-ink-3">${t('No family owes in this lane. Nice.', 'এই গলিতে কারও বকেয়া নেই।')}</td></tr>`}
            ${list.map((f, i) => `<tr>
              <td class="!pr-0"><input type="checkbox" data-dpick="${f.no}" ${duesPick.has(f.no) ? 'checked' : ''} class="w-4 h-4 accent-[#2b2f36] align-middle" aria-label="${f.head}" /></td>
              <td><span class="font-semibold">${t(f.head, f.headBn)}</span><span class="block text-[13px] text-ink-3 num">${f.no} · ${t(f.lane, f.laneBn)}</span></td>
              <td class="hidden sm:table-cell"><span class="flex gap-0.5" role="img" aria-label="${f.dueMonths} months due">${Array.from({ length: 8 }, (_, k) => `<span class="w-2.5 h-5 rounded-sm ${k < f.dueMonths ? (f.dueMonths >= 6 ? 'bg-sindoor' : 'bg-marigold') : 'bg-paper-2'}"></span>`).join('')}</span></td>
              <td class="amt font-semibold">${inr(f.due)}</td>
              <td class="hidden md:table-cell text-sm ${reminded[f.no] ? 'text-tulsi font-semibold' : 'text-ink-3'}">${reminded[f.no] ? t('Today', 'আজ') : f.no.endsWith('1') || i % 3 === 0 ? t('Never', 'কখনো না') : t(`${i + 2} days ago`, `${i + 2} দিন আগে`)}</td>
              <td class="text-right whitespace-nowrap">
                <a target="_blank" rel="noopener" data-remind="${f.no}" href="https://wa.me/91${f.phone}?text=${encodeURIComponent(msg(f))}" class="btn btn-sm btn-ink"><i data-lucide="message-circle"></i>${t('Remind', 'তাগাদা')}</a>
              </td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="lg:col-span-4">
        <p class="text-sm font-semibold text-ink-3 mb-2">${t('WhatsApp message', 'হোয়াটসঅ্যাপ বার্তা')}</p>
        <div class="rounded-lg bg-[#e7ddc9] p-4">
          <div class="bg-[#dcf3d0] rounded-lg rounded-tr-sm p-3.5 text-[15px] leading-relaxed ml-6 shadow-[0_1px_1px_rgba(0,0,0,.08)]">${msg(list[0] || all[0])}<span class="block text-right text-[11px] text-ink-3 mt-1">7:42 pm ✓✓</span></div>
        </div>
        <p class="text-sm text-ink-2 mt-3">${t('Opens WhatsApp on your phone with this filled in. Nothing is sent automatically and it costs nothing.', 'আপনার ফোনে হোয়াটসঅ্যাপ খুলবে, বার্তা লেখা থাকবে। নিজে থেকে কিছু যাবে না, খরচও নেই।')}</p>
        <div class="flex flex-wrap gap-2 mt-3"><button class="btn btn-line btn-sm" data-act="message"><i data-lucide="pencil"></i>${t('Edit message', 'বার্তা বদলান')}</button><button class="btn btn-ink btn-sm" data-act="remind-all"><i data-lucide="send"></i>${t(`Remind all ${list.length}`, `সব ${list.length}টিকে তাগাদা`)}</button></div>
      </div>
    </div>`);
  $$('[data-dmin]').forEach((b) => b.addEventListener('click', () => { duesMin = Number(b.dataset.dmin); dues(); }));
  $('#dues-lane').addEventListener('change', (e) => { duesLane = e.target.value; dues(); });
  $$('[data-dpick]').forEach((c) => c.addEventListener('change', () => { c.checked ? duesPick.add(c.dataset.dpick) : duesPick.delete(c.dataset.dpick); dues(); }));
  $('#dues-all').addEventListener('change', (e) => { duesPick.clear(); if (e.target.checked) list.forEach((f) => duesPick.add(f.no)); dues(); });
  $('#dues-clear')?.addEventListener('click', () => { duesPick.clear(); dues(); });
  $$('[data-remind]').forEach((a) => a.addEventListener('click', () => { reminded[a.dataset.remind] = true; logAudit('collect', `WhatsApp reminder opened for ${a.dataset.remind}`, `${a.dataset.remind}-এর জন্য হোয়াটসঅ্যাপ তাগাদা`); setTimeout(dues, 100); }));
}
const duesTargets = (picked) => {
  const all = families.filter((f) => f.due && f.dueMonths >= duesMin && (duesLane === 'all' || f.lane === duesLane));
  return picked && duesPick.size ? all.filter((f) => duesPick.has(f.no)) : all;
};

/* ---------------- Khata ---------------- */
let khataBook = 'all';
function khata(param) {
  if (param && books[param]) khataBook = param;
  const rows = ledger.filter((r) => khataBook === 'all' || r.book === khataBook);
  paint(screen('khata'), `
    ${pageHead('Khata', 'খাতা', t('November 2026 · three books, one AGM report', 'নভেম্বর ২০২৬ · তিনটি খাতা, একটি এজিএম রিপোর্ট'), `
      <button class="btn btn-line btn-sm" data-act="print-month"><i data-lucide="printer"></i>${t('Print month', 'মাসের প্রিন্ট')}</button>
      <a href="#reports" class="btn btn-line btn-sm"><i data-lucide="file-spreadsheet"></i>${t('AGM report', 'এজিএম রিপোর্ট')}</a>
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
        <label class="w-full h-28 rounded-lg border-2 border-dashed border-rule bg-card text-ink-2 flex flex-col items-center justify-center gap-1.5 hover:border-ink/30 cursor-pointer"><i data-lucide="camera" class="w-6 h-6"></i><span class="text-sm" data-photo-name>${t('Take a photo of the bill', 'বিলের ছবি তুলুন')}</span><input type="file" accept="image/*" capture="environment" class="sr-only" data-photo-input /></label>
        <p class="text-sm text-ink-3 mt-2">${t('Over ₹10,000 needs a second signature before it enters the khata.', '₹১০,০০০-এর বেশি হলে খাতায় ওঠার আগে দ্বিতীয় সই লাগবে।')}</p></div>
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
          <tbody>${chanda.areas.map((a, ai) => {
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
          <div class="px-5 pt-4 pb-3 border-b border-rule flex items-center"><h2 class="font-display text-xl">${t('Sponsors', 'স্পনসর')}</h2>
            <button class="ml-auto btn btn-ghost btn-sm text-sindoor" data-act="sponsor"><i data-lucide="plus"></i>${t('Add', 'যোগ')}</button></div>
          <ul class="px-5">${chanda.sponsors.map((s, si) => `<li class="py-3 border-b border-rule last:border-0 flex items-start gap-3">
            <div class="flex-1"><p class="font-semibold">${t(s.name, s.nameBn)}</p><p class="text-sm text-ink-3">${t(s.gives, s.givesBn)}</p></div>
            <div class="text-right"><p class="font-semibold">${inr(s.amount)}</p>${s.status === 'paid' ? `<p class="text-[12.5px] text-tulsi font-semibold">${t('Received', 'পেয়েছি')}</p>` : `<button class="text-[12.5px] text-turmeric font-semibold hover:underline" data-act="sponsor-paid" data-i="${si}">${t('Promised · mark received', 'প্রতিশ্রুত · পেয়েছি')}</button>`}</div></li>`).join('')}</ul>
        </div>
        <div class="paper-card">
          <div class="px-5 pt-4 pb-3 border-b border-rule flex items-center"><h2 class="font-display text-xl">${t('Budget', 'বাজেট')}</h2>
            <button class="ml-auto btn btn-ghost btn-sm text-ink-2" data-act="budget"><i data-lucide="pencil"></i>${t('Edit', 'সম্পাদনা')}</button></div>
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
  const rate = memberRate(pkg.rate, o.member);
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
                  <p class="text-[13px] text-ink-3 mt-0.5">${t(x.occasion, x.occasionBn)} · ${dn(x.date)}</p>
                  <p class="mt-2 flex items-center gap-2 text-sm whitespace-nowrap"><span class="num text-ink-2">${dn(String(x.guests))} ${t('guests', 'জন')}</span>${x.member ? `<span class="chip h-5 px-1.5 text-[11px] bg-sindoor-wash text-sindoor-deep">${t('Member', 'সদস্য')}</span>` : ''}</p>
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
          <p class="text-ink-2 text-[15px]">${t(o.occasion, o.occasionBn)} · ${dn(o.date)} · ${dn(String(o.guests))} ${t('guests', 'অতিথি')}</p>
        </div>
        <div class="p-5">
          <p class="text-sm font-semibold text-ink-3">${t('Quotation', 'কোটেশন')}</p>
          <table class="w-full text-[15px] mt-2">
            <tr><td class="py-1.5">${t(pkg.name, pkg.nameBn)}</td><td class="text-right num">${dn(String(o.guests))} × ${inr(rate)}</td></tr>
            <tr><td class="py-1.5 text-ink-2">${t('Servers', 'পরিবেশনকারী')}</td><td class="text-right text-ink-2 num">${dn(String(serversFor(o.guests)))} ${t('+ team leader', '+ দলনেতা')}</td></tr>
            <tr class="border-t border-ink/20 font-semibold"><td class="py-2">${t('Total', 'মোট')}</td><td class="text-right">${inr(o.guests * rate)}</td></tr>
            <tr><td class="py-1.5 text-ink-2">${t('Advance (20%)', 'অগ্রিম (২০%)')}</td><td class="text-right">${inr(Math.round(o.guests * rate * 0.2))}</td></tr>
            <tr><td class="py-1.5 text-ink-2">${t('Received', 'পাওয়া গেছে')}</td><td class="text-right text-tulsi font-semibold">${inr(o.paid)}</td></tr>
            <tr class="font-semibold"><td class="py-1.5">${t('Balance', 'বাকি')}</td><td class="text-right text-sindoor">${inr(o.guests * rate - o.paid)}</td></tr>
          </table>
          <p class="text-sm font-semibold text-ink-3 mt-5">${t('Included', 'যা থাকছে')}</p>
          <p class="text-[15px] text-ink-2 mt-1 leading-relaxed">${pkg.menu.map((m, i) => t(m, pkg.menuBn[i])).join(' · ')}</p>
          ${{
            enquiry: `<button class="btn btn-ink w-full mt-5" data-act="quote" data-id="${o.id}"><i data-lucide="send"></i>${t('Send quotation', 'কোটেশন পাঠান')}</button>`,
            quoted: `<button class="btn btn-ink w-full mt-5" data-act="cat-pay" data-id="${o.id}" data-kind="advance"><i data-lucide="indian-rupee"></i>${t('Record advance (confirms the booking)', 'অগ্রিম জমা (বুকিং নিশ্চিত)')}</button>`,
            advance: `<button class="btn btn-ink w-full mt-5" data-act="cat-served" data-id="${o.id}"><i data-lucide="utensils"></i>${t('Mark as served', 'পরিবেশিত')}</button>`,
            done: `<button class="btn btn-ink w-full mt-5" data-act="cat-pay" data-id="${o.id}" data-kind="final"><i data-lucide="file-check"></i>${t('Final bill & settle', 'চূড়ান্ত বিল ও মেটান')}</button>`,
            settled: `<div class="mt-5 rounded-lg bg-tulsi-wash text-tulsi p-3.5 flex items-center gap-2.5 font-semibold"><i data-lucide="check-circle-2" class="w-5 h-5"></i>${t(`Settled · profit ${inr(Math.round(o.amount * 0.22))} to the Catering book`, `মিটেছে · লাভ ${inr(Math.round(o.amount * 0.22))} ক্যাটারিং খাতায়`)}</div>`,
          }[o.status]}
          <div class="grid grid-cols-2 gap-2 mt-2">
            ${o.status !== 'enquiry' && o.status !== 'settled' ? `<button class="btn btn-line btn-sm" data-act="cat-pay" data-id="${o.id}" data-kind="other"><i data-lucide="indian-rupee"></i>${t('Record payment', 'টাকা জমা')}</button>` : ''}
            ${o.status !== 'settled' ? `<button class="btn btn-line btn-sm" data-act="quote" data-id="${o.id}"><i data-lucide="pencil"></i>${t(o.status === 'enquiry' ? 'Edit guests & package' : 'Change guests / package', o.status === 'enquiry' ? 'অতিথি ও প্যাকেজ' : 'অতিথি / প্যাকেজ বদল')}</button>` : ''}
            <button class="btn btn-line btn-sm" data-act="roster" data-id="${o.id}"><i data-lucide="users"></i>${t('Serving team', 'পরিবেশন দল')}</button>
            <button class="btn btn-line btn-sm" data-act="cat-exp"><i data-lucide="receipt"></i>${t('Expenses', 'খরচ')}</button>
          </div>
          ${['enquiry', 'quoted'].includes(o.status) ? `<button class="mt-3 text-sm font-semibold text-ink-2 hover:underline" data-act="cat-lost" data-id="${o.id}">${t('Customer went elsewhere? Mark as lost', 'অন্য জায়গায় গেছেন? হারানো অর্ডার')}</button>` : ''}
          ${o.status === 'advance' ? `<button class="mt-3 text-sm font-semibold text-ink-2 hover:underline" data-act="cat-cancel" data-id="${o.id}">${t('Booking cancelled? Refund or keep advance', 'বুকিং বাতিল? অগ্রিম ফেরত বা রাখা')}</button>` : ''}
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
    ${pageHead('Nursery', 'নার্সারি', t('Sutapa Bose · counter open 5–8 pm', 'সুতপা বসু · কাউন্টার খোলা বিকেল ৫–৮টা'), `
      <button class="btn btn-line btn-sm" data-act="wa-orders"><i data-lucide="message-circle"></i>${t('WhatsApp orders', 'হোয়াটসঅ্যাপ অর্ডার')} <span class="chip h-5 px-1.5 text-[11.5px] bg-tulsi text-white num">${dn('2')}</span></button>
      <button class="btn btn-ink btn-sm" data-act="plant"><i data-lucide="plus"></i>${t('Add plant', 'গাছ যোগ')}</button>`)}
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
          <span class="block text-sm text-ink-3 mt-0.5">${t(p.pot, p.potBn)} · ${inr(p.price)}</span>
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
            <div class="flex font-semibold text-lg border-t border-ink/20 pt-3 mt-3"><dt>${t('To collect', 'নিতে হবে')}</dt><dd class="ml-auto font-display text-2xl">${inr(sub - disc)}</dd></div>
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
          <td class="text-ink-2">${t(p.pot, p.potBn)}</td>
          <td class="amt">${inr(p.price)}</td>
          <td class="amt font-semibold ${p.stock === 0 ? 'text-ink-3' : p.stock < 10 ? 'text-sindoor' : ''}">${p.stock === 0 ? t('Out', 'শেষ') : inr(p.stock, { plain: true })}${p.stock > 0 && p.stock < 10 ? ` <i data-lucide="triangle-alert" class="w-4 h-4 inline -mt-0.5"></i>` : ''}</td>
          <td class="num text-ink-2">${dn(String((i * 7 + 5) % 23))}</td>
          <td class="text-right whitespace-nowrap"><button class="btn btn-ghost btn-sm text-ink-2" data-act="plant" data-plant="${p.id}">${t('Edit', 'সম্পাদনা')}</button><button class="btn btn-ghost btn-sm" data-act="stock-in" data-plant="${p.id}">${t('Stock in', 'স্টক যোগ')}</button><button class="btn btn-ghost btn-sm text-ink-2" data-act="loss" data-plant="${p.id}">${t('Loss', 'নষ্ট')}</button></td>
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
const polls = [
  { q: 'Winter picnic: where shall we go?', qBn: 'শীতের পিকনিক: কোথায় যাব?', closes: '20 Nov', open: true, options: [['Gadiara', 'গাদিয়াড়া', 92], ['Bakkhali', 'বকখালি', 61], ['Taki', 'টাকি', 28]] },
  { q: 'AGM 2026: raise subscription to ₹120 / month from April?', qBn: 'এজিএম ২০২৬: এপ্রিল থেকে চাঁদা মাসে ₹১২০?', closes: '', open: false, agm: true, options: [['Yes', 'হ্যাঁ', 118], ['No', 'না', 74], ['Abstain', 'বিরত', 9]] },
];
function meetings() {
  paint(screen('meetings'), `
    ${pageHead('Notices & meetings', 'নোটিস ও সভা')}
    <div class="grid xl:grid-cols-12 gap-6 items-start">
      <form class="xl:col-span-7 min-w-0 paper-card p-5 sm:p-6 space-y-4" id="notice-form">
        <h2 class="font-display text-xl">${t('Put up a notice', 'নোটিস দিন')}</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <label class="block"><span class="label">${t('Title (English)', 'শিরোনাম (ইংরেজি)')}</span><input class="field" value="Committee meeting — Saraswati Puja planning" /></label>
          <label class="block"><span class="label">${t('Title (Bengali)', 'শিরোনাম (বাংলা)')}</span><input class="field" value="কমিটি সভা — সরস্বতী পূজার প্রস্তুতি" /></label>
        </div>
        <label class="block"><span class="label">${t('Message', 'বার্তা')}</span><textarea class="field" rows="3">${lang === 'bn' ? 'রবিবার ১৬ নভে, সন্ধ্যা ৬টা, ক্লাব ঘরে। বাজেট ও স্বেচ্ছাসেবকের তালিকা চূড়ান্ত হবে।' : 'Sunday 16 Nov, 6 pm at the club room. Budget and volunteer list will be finalised.'}</textarea></label>
        <div><p class="label">${t('Who should get it', 'কারা পাবেন')}</p>
          <div class="flex flex-wrap gap-2">
            ${audienceRadios()}
          </div></div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div><p class="label">${t('When', 'কখন')}</p>${radioRow('when', [['Send now', 'এখনই'], ['Schedule', 'পরে']])}</div>
          <label class="block" id="notice-at"><span class="label">${t('Send at', 'পাঠানোর সময়')}</span><input type="datetime-local" class="field num" value="2026-11-16T08:00" disabled /></label>
        </div>
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
          <label class="flex items-center gap-2"><input type="checkbox" checked class="w-5 h-5 accent-[#d21f1b]" />${t('App notification', 'অ্যাপ নোটিফিকেশন')}</label>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="w-5 h-5 accent-[#d21f1b]" />${t('Pin to top', 'উপরে পিন')}</label>
          <label class="flex items-center gap-2"><input type="checkbox" class="w-5 h-5 accent-[#d21f1b]" />${t('Show on website', 'ওয়েবসাইটে দেখান')}</label>
        </div>
        <div id="notice-preview" class="rounded-lg border border-rule bg-paper-2/50 p-4"></div>
        <div class="flex flex-wrap gap-2"><button class="btn btn-primary">${t('Publish notice', 'নোটিস প্রকাশ')}</button><button type="button" class="btn btn-line" data-act="copy-notice"><i data-lucide="message-circle"></i>${t('Copy for WhatsApp group', 'হোয়াটসঅ্যাপ গ্রুপের জন্য কপি')}</button></div>
      </form>

      <div class="xl:col-span-5 space-y-6">
        <div class="paper-card p-5">
          <p class="text-sm font-semibold text-sindoor">${t('Next meeting', 'পরের সভা')}</p>
          <h2 class="font-display text-xl mt-1">${t('Sun 16 Nov, 6 pm · Club room', 'রবি ১৬ নভে, সন্ধ্যা ৬টা · ক্লাব ঘর')}</h2>
          <ol class="mt-3 text-[15px] space-y-1.5 list-decimal pl-5 marker:text-ink-3">
            <li>${t('Saraswati Puja budget approval', 'সরস্বতী পূজার বাজেট অনুমোদন')}</li>
            <li>${t('Sports Day volunteer list', 'ক্রীড়া দিবসের স্বেচ্ছাসেবক তালিকা')}</li>
            <li>${t('Catering: more servers for December weddings', 'ক্যাটারিং: ডিসেম্বরের বিয়ের জন্য আরও পরিবেশনকারী')}</li>
            <li>${t('Lapsed members: final reminder', 'মেয়াদোত্তীর্ণ সদস্য: শেষ তাগাদা')}</li>
          </ol>
          <div class="flex flex-wrap gap-2 mt-4">
            <button class="btn btn-line btn-sm" data-act="minutes"><i data-lucide="notebook-pen"></i>${t('Write minutes', 'কার্যবিবরণী লিখুন')}</button>
            <button class="btn btn-ghost btn-sm" data-act="meeting"><i data-lucide="calendar-plus"></i>${t('Call a meeting', 'সভা ডাকুন')}</button>
          </div>
        </div>
        <div class="paper-card">
          <div class="px-5 pt-4 pb-3 border-b border-rule flex items-center"><h2 class="font-display text-xl">${t('Polls', 'ভোট')}</h2>
            <button class="ml-auto btn btn-ghost btn-sm text-sindoor" data-act="poll"><i data-lucide="plus"></i>${t('New poll', 'নতুন ভোট')}</button></div>
          ${polls.map((pl, pi) => {
            const total = pl.options.reduce((a, o) => a + o[2], 0);
            return `<div class="px-5 py-4 border-b border-rule last:border-0">
              <p class="text-[12.5px] font-semibold ${pl.open ? 'text-tulsi' : 'text-ink-3'}">${pl.open ? t(`Open · closes ${pl.closes}`, `চলছে · শেষ ${pl.closes}`) : t('Closed', 'বন্ধ')} · ${t(`${total} families voted`, `${total}টি পরিবার ভোট দিয়েছে`)}${pl.agm ? ` · <span class="text-sindoor">${t('AGM vote, one per family', 'এজিএম ভোট, পরিবার প্রতি এক')}</span>` : ''}</p>
              <p class="font-semibold mt-0.5">${t(pl.q, pl.qBn)}</p>
              <ul class="mt-2.5 space-y-2">${pl.options.map(([en, bn, v]) => `<li>
                <div class="flex text-sm"><span>${t(en, bn)}</span><span class="ml-auto num text-ink-2">${dn(String(v))} · ${dn(String(Math.round((v / total) * 100)))}%</span></div>
                <div class="mt-1 h-2 rounded-full bg-paper-2 overflow-hidden"><div class="h-full rounded-full bg-sindoor" style="width:${(v / total) * 100}%"></div></div></li>`).join('')}</ul>
              ${pl.open ? `<button class="btn btn-line btn-sm mt-3" data-act="poll-close" data-i="${pi}">${t('Close and share result', 'বন্ধ করে ফল জানান')}</button>` : ''}
            </div>`;
          }).join('')}
        </div>
        <div class="paper-card">
          <div class="px-5 pt-4 pb-3 border-b border-rule"><h2 class="font-display text-xl">${t('Published', 'প্রকাশিত')}</h2></div>
          <ul class="px-5">${notices.map((n) => `<li class="py-3 border-b border-rule last:border-0">
            <p class="text-[12.5px] text-ink-3"><span class="font-semibold text-sindoor">${t(n.tag, n.tagBn)}</span> · ${dn(n.date)} · ${t('read by 184', '১৮৪ জন পড়েছেন')}</p>
            <p class="font-semibold leading-snug mt-0.5">${t(n.title, n.titleBn)}</p></li>`).join('')}</ul>
        </div>
      </div>
    </div>`);
  const nf = $('#notice-form');
  wireNotice(nf);
  nf.addEventListener('change', (e) => { if (e.target.name === 'when') $('#notice-at input').disabled = e.target.value === '0'; });
  nf.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = nf.dataset.reach || 286, later = nf.querySelector('input[name="when"]:checked').value === '1';
    const title = nf.querySelector('input.field').value;
    logAudit('notices', `${later ? 'Scheduled' : 'Published'} notice “${title}” · ${n} recipients`, `নোটিস ${later ? 'নির্ধারিত' : 'প্রকাশিত'} “${title}” · ${n} জন`);
    toast(`<i data-lucide="check-circle-2"></i>${later ? t(`Scheduled for 16 Nov, 8 am. ${n} will be notified.`, `১৬ নভে সকাল ৮টায় যাবে। ${n} জন পাবেন।`) : t(`Notice published. ${n} notified.`, `নোটিস প্রকাশিত। ${n} জনকে জানানো হয়েছে।`)}`);
  });
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
          <td><span class="font-semibold">${t(e.title, e.titleBn)}</span><span class="block text-[13px] text-ink-3">${t(e.place, e.placeBn)} · ${t(e.time, e.timeBn || e.time)}</span></td>
          <td>${e.pass ? `<span class="chip border border-ink/40"><i data-lucide="ticket"></i>${t('Pass needed', 'পাস লাগবে')}</span>` : `<span class="text-sm text-ink-3">${t('Open to all', 'সবার জন্য')}</span>`}</td>
          <td class="num">${e.pass ? `${dn(String(e.regs))} ${t('families', 'পরিবার')}${e.cap ? ` <span class="text-ink-3">/ ${dn(String(e.cap))} ${t('seats', 'আসন')}</span>` : ''}` : '—'}</td>
          <td><span class="chip bg-paper-2 text-ink-2">${t('Published', 'প্রকাশিত')}</span></td>
          <td class="text-right whitespace-nowrap">${e.pass ? `<button class="btn btn-ghost btn-sm" data-act="regs" data-id="${e.id}">${t('Who’s coming', 'কারা আসছেন')}</button>` : ''}<button class="btn btn-ghost btn-sm" data-act="event-edit" data-id="${e.id}">${t('Edit', 'সম্পাদনা')}</button>${e.pass ? `<a href="scan.html" class="btn btn-ghost btn-sm">${t('Gate', 'গেট')}</a>` : ''}</td></tr>`).join('')}</tbody>
      </table>
    </div>`);
  $('#new-event').addEventListener('click', () => eventDrawer());
}
function eventDrawer(e) {
  const iso = e ? e.date : '2027-01-23';
  openDrawer(`
    <form class="p-6 space-y-4" id="event-form">
      <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${e ? t('Edit event', 'অনুষ্ঠান সম্পাদনা') : t('New event', 'নতুন অনুষ্ঠান')}</h2>
        <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
      <label class="block"><span class="label">${t('Name (English)', 'নাম (ইংরেজি)')}</span><input class="field" required value="${e ? e.title : ''}" placeholder="Netaji Jayanti flag hoisting" /></label>
      <label class="block"><span class="label">${t('Name (Bengali)', 'নাম (বাংলা)')}</span><input class="field" value="${e ? e.titleBn : ''}" placeholder="নেতাজি জয়ন্তী পতাকা উত্তোলন" lang="bn" /></label>
      <div class="grid grid-cols-2 gap-3"><label class="block"><span class="label">${t('Date', 'তারিখ')}</span><input type="date" class="field" value="${iso}" /></label>
        <label class="block"><span class="label">${t('Time', 'সময়')}</span><input class="field" value="${e ? e.time : '8:00 am'}" /></label></div>
      <label class="block"><span class="label">${t('Place', 'জায়গা')}</span><input class="field" value="${e ? e.place : 'Club ground'}" /></label>
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" ${e?.pass ? 'checked' : ''} />${t('Members need a pass (QR at the gate)', 'সদস্যদের পাস লাগবে (গেটে QR)')}</label>
      <div class="grid grid-cols-2 gap-3">${fld('Seats (blank = no limit)', 'আসন (ফাঁকা = সীমা নেই)', inp(`class="field num" inputmode="numeric" value="${e?.id === 'picnic' ? 120 : ''}"`))}${fld('Fee per person', 'মাথাপিছু ফি', inp(`class="field num" value="${e?.id === 'picnic' ? '₹350' : '₹0'}"`))}</div>
      ${fld('Registration closes', 'নাম দেওয়ার শেষ দিন', inp(`type="date" class="field" value="${e?.id === 'sports' ? '2026-12-07' : ''}"`))}
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" checked />${t('Show on the website', 'ওয়েবসাইটে দেখান')}</label>
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" checked />${t('Notify members in the app', 'অ্যাপে সদস্যদের জানান')}</label>
      <div class="grid grid-cols-2 gap-2 pt-2"><button type="button" data-close class="btn btn-line">${t('Save draft', 'খসড়া রাখুন')}</button><button class="btn btn-primary">${e ? t('Save changes', 'সেভ করুন') : t('Publish', 'প্রকাশ করুন')}</button></div>
      ${e ? `<button type="button" data-act="event-cancel" data-id="${e.id}" class="w-full text-sm font-semibold text-sindoor hover:underline">${t('Cancel this event and tell everyone', 'অনুষ্ঠান বাতিল করে সবাইকে জানান')}</button>` : ''}
    </form>`);
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
    ${pageHead('Reports', 'রিপোর্ট', t('Statements for the committee, the auditor and the AGM.', 'কমিটি, অডিটর ও এজিএম-এর জন্য বিবরণী।'), `
      <a href="#settings/data" class="btn btn-line btn-sm"><i data-lucide="database"></i>${t('Export & backup', 'ডাউনলোড ও ব্যাকআপ')}</a>
      <button class="btn btn-primary btn-sm" data-act="agm-pack"><i data-lucide="landmark"></i>${t('Build AGM pack', 'এজিএম প্যাক তৈরি')}</button>`)}
    <div class="grid lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-7 min-w-0 paper-card overflow-x-auto">
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
          ['history', 'Audit trail', 'অডিট ট্রেইল', 'Every entry, edit and reversal with who and when', 'প্রতিটি এন্ট্রি, কে ও কখন', 'audit'],
          ['receipt', 'Receipts register', 'রসিদ খাতা', 'Every number in order, cancelled ones with reasons', 'সব নম্বর ক্রমে, বাতিলগুলো কারণসহ', 'receipts'],
          ['landmark', 'Bank reconciliation', 'ব্যাংক মেলানো', 'Khata against the SBI statement, cash with collectors', 'SBI স্টেটমেন্টের সঙ্গে খাতা, সংগ্রাহকদের নগদ', 'cash'],
        ].map(([icon, en, bn, sEn, sBn, link]) => `
          <div class="paper-card p-4 flex flex-wrap items-center gap-3">
            <span class="w-10 h-10 rounded-full bg-paper-2 grid place-items-center shrink-0"><i data-lucide="${icon}" class="w-5 h-5"></i></span>
            <div class="flex-1 min-w-[160px]"><p class="font-semibold">${t(en, bn)}</p><p class="text-sm text-ink-2">${t(sEn, sBn)}</p></div>
            <span class="flex gap-1 ml-auto">${link ? `<a href="#${link}" class="btn btn-line btn-sm">${t('Open', 'খুলুন')}</a>` : ''}
            <button class="btn btn-line btn-sm" data-dl><i data-lucide="download"></i>PDF</button>
            <button class="btn btn-ghost btn-sm" data-dl>Excel</button></span>
          </div>`).join('')}
      </div>
      <div class="lg:col-span-7 paper-card">
        <div class="px-5 pt-4 pb-3 border-b border-rule"><h2 class="font-display text-xl">${t('Membership this year', 'এ বছরের সদস্য')}</h2></div>
        <table class="khata-table"><tbody>
          ${[['Families on 1 April', '১ এপ্রিলে পরিবার', '277', ''], ['Joined', 'নতুন যোগ', '+14', 'text-tulsi'], ['Lapsed (6+ months due)', 'মেয়াদোত্তীর্ণ (৬+ মাস)', '−6', 'text-sindoor'], ['Rejoined after clearing dues', 'বকেয়া মিটিয়ে ফিরেছেন', '+1', 'text-tulsi'], ['Dues waived (hardship)', 'বকেয়া মকুব (অসুবিধা)', '2', 'text-ink-2']].map(([en, bn, v, c]) => `<tr><td>${t(en, bn)}</td><td class="amt font-semibold ${c}">${dn(v)}</td></tr>`).join('')}
          <tr class="bg-paper-2/50 font-semibold [&>td]:border-t [&>td]:border-t-ink/20 [&>td]:border-b-[3px] [&>td]:border-double [&>td]:border-b-ink/25"><td>${t('Families today', 'আজ পরিবার')}</td><td class="amt">${dn('286')}</td></tr>
        </tbody></table>
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
  const tabs = [['club', 'Club', 'ক্লাব'], ['fees', 'Fees', 'চাঁদা'], ['people', 'Users', 'ব্যবহারকারী'], ['roles', 'Roles & permissions', 'ভূমিকা ও অনুমতি'], ['security', 'Security', 'নিরাপত্তা'], ['data', 'Data & backup', 'ডেটা ও ব্যাকআপ']];
  if (!tabs.find((x) => x[0] === setTab)) setTab = 'club';
  const body = {
    roles: admin.settingsTabs.roles(),
    data: admin.settingsTabs.data(),
    club: `<form class="paper-card p-5 sm:p-6 grid sm:grid-cols-2 gap-4 max-w-3xl" data-save>
      <label class="block"><span class="label">${t('Club name (English)', 'ক্লাবের নাম (ইংরেজি)')}</span><input class="field" value="Gede Maitree Club" /></label>
      <label class="block"><span class="label">${t('Club name (Bengali)', 'ক্লাবের নাম (বাংলা)')}</span><input class="field" value="গেদে মৈত্রী ক্লাব" lang="bn" /></label>
      <label class="block"><span class="label">${t('Locality', 'এলাকা')}</span><input class="field" value="Netaji Para" /></label>
      <label class="block"><span class="label">${t('Founded', 'প্রতিষ্ঠা')}</span><input class="field num" value="2014" inputmode="numeric" /></label>
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
        <label class="block"><span class="label">${t('Member discount', 'সদস্য ছাড়')}</span><input class="field num" value="Nursery 10% · Catering 10%" /></label>
      </div>
      <p class="text-sm text-ink-2">${t('New rates apply from the next month. Receipts already issued don’t change.', 'নতুন হার পরের মাস থেকে। আগের রসিদ বদলাবে না।')}</p>
      <button class="btn btn-ink">${t('Save fees', 'সেভ করুন')}</button></form>`,
    people: `<div class="paper-card overflow-x-auto">
      <div class="px-5 pt-4 pb-3 border-b border-rule flex items-center"><h2 class="font-display text-xl">${t('Who can use the console', 'কারা কনসোল ব্যবহার করেন')}</h2>
        <button class="btn btn-ink btn-sm ml-auto" id="invite"><i data-lucide="user-plus"></i>${t('Invite someone', 'আমন্ত্রণ পাঠান')}</button></div>
      <table class="khata-table min-w-[640px]"><thead><tr><th>${t('Name', 'নাম')}</th><th>${t('Role', 'ভূমিকা')}</th><th>${t('Two-step', 'দুই-ধাপ')}</th><th>${t('Last active', 'শেষ সক্রিয়')}</th><th></th></tr></thead>
      <tbody>${staff.map((s) => `<tr>
        <td class="font-semibold">${t(s.name, s.nameBn)}</td>
        <td><select class="field h-9 text-sm w-auto" aria-label="Role for ${s.name}" data-role-for="${s.name}"><option>${s.role[0]}</option><option>Treasurer</option><option>Puja in-charge</option><option>Catering in-charge</option><option>Nursery in-charge</option><option>Volunteer</option></select></td>
        <td>${s.twofa ? `<span class="chip bg-paper-2 text-ink-2"><i data-lucide="shield-check"></i>${t('On', 'চালু')}</span>` : `<span class="chip border border-ink/40"><i data-lucide="shield-alert"></i>${t('Off', 'বন্ধ')}</span>`}</td>
        <td class="text-sm text-ink-2">${s.pending ? `<span class="chip border border-ink/40"><i data-lucide="mail"></i>${t('Invited', 'আমন্ত্রিত')}</span>` : s.last}</td>
        <td class="text-right whitespace-nowrap">${s.pending ? `<button class="btn btn-ghost btn-sm" data-act="resend" data-name="${s.name}">${t('Resend', 'আবার পাঠান')}</button>` : `<button class="btn btn-ghost btn-sm" data-act="revoke" data-name="${s.name}">${t('Remove access', 'অ্যাক্সেস বাতিল')}</button>`}</td></tr>`).join('')}</tbody></table>
      <div class="px-5 py-4 border-t border-rule text-sm text-ink-2">${t('Roles decide what each person sees: the treasurer sees all books, in-charges see their own book, volunteers only the gate scanner and chanda entry.', 'ভূমিকা অনুযায়ী দেখা যায়: কোষাধ্যক্ষ সব খাতা, দায়িত্বপ্রাপ্তরা নিজের খাতা, স্বেচ্ছাসেবক শুধু গেট স্ক্যানার ও চাঁদা।')} <a href="#settings/roles" class="font-semibold text-sindoor hover:underline">${t('See every permission, or view the console as a role', 'সব অনুমতি দেখুন, বা কোনো ভূমিকা হিসেবে কনসোল দেখুন')} →</a></div></div>`,
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
            <li class="py-3 flex items-center gap-3"><i data-lucide="history" class="w-5 h-5"></i><span class="flex-1">${t('Everything you did in the console', 'কনসোলে আপনার সব কাজ')}</span><a href="#audit" class="btn btn-line btn-sm">${t('My activity', 'আমার কাজ')}</a></li>
            <li class="py-3 flex items-center gap-3"><i data-lucide="smartphone" class="w-5 h-5"></i><span class="flex-1">${t('You are also a member (MC-0125)', 'আপনি সদস্যও (MC-0125)')}<span class="block text-sm text-ink-2">${t('The member app has its own sign-in', 'সদস্য অ্যাপের আলাদা লগইন')}</span></span><a href="app.html" class="btn btn-line btn-sm">${t('Member app', 'সদস্য অ্যাপ')}</a></li>
            <li class="py-3 flex items-center gap-3"><i data-lucide="keyboard" class="w-5 h-5"></i><span class="flex-1">${t('Keyboard shortcuts', 'কিবোর্ড শর্টকাট')}</span><button class="btn btn-line btn-sm" data-act="shortcuts">${t('Show', 'দেখুন')} <kbd class="text-[12px] border border-rule rounded px-1">?</kbd></button></li>
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
function formDrawer(titleEn, titleBn, body, submitEn, submitBn, doneEn, doneBn, { danger = false, onDone } = {}) {
  openDrawer(`
    <form class="p-6 space-y-4" data-drawer-form>
      <div class="flex items-center"><h2 class="font-display text-[1.7rem] leading-tight pr-4">${t(titleEn, titleBn)}</h2>
        <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2 shrink-0" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
      ${body}
      <div class="grid grid-cols-2 gap-2 pt-2"><button type="button" data-close class="btn btn-line">${t('Cancel', 'বাতিল')}</button>
        <button class="btn ${danger ? 'btn-ink' : 'btn-primary'}">${t(submitEn, submitBn)}</button></div>
    </form>`);
  $('[data-drawer-form]').addEventListener('submit', (e) => {
    e.preventDefault(); closeDrawer();
    const before = auditLog.length;
    onDone?.(e.target);
    // Every form leaves a line in the audit log, unless the action already wrote a more specific one
    if (auditLog.length === before) logAudit(current, `Saved “${titleEn}”`, `সেভ “${titleBn}”`);
    if (doneEn) toast(`<i data-lucide="check-circle-2"></i>${t(doneEn, doneBn)}`);
  });
}
const rerender = () => SCREENS[current]?.(currentParam);
const proto = (en, bn) => toast(`<i data-lucide="info"></i>${t(`${en} (Prototype: nothing is printed or downloaded.)`, `${bn} (প্রোটোটাইপ: কিছু প্রিন্ট বা ডাউনলোড হয় না।)`)}`);
const closeBtn = `<button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2 shrink-0" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button>`;
const radioRow = (name, opts) => `<div class="grid grid-cols-${opts.length} gap-2">${opts.map(([en, bn], i) => `<label class="flex items-center justify-center h-11 rounded-lg border border-rule bg-card cursor-pointer text-sm font-semibold text-center px-2 has-[:checked]:bg-ink has-[:checked]:text-paper has-[:checked]:border-ink"><input type="radio" name="${name}" value="${i}" class="sr-only" ${i ? '' : 'checked'} />${t(en, bn)}</label>`).join('')}</div>`;
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
          <li>${t('Columns: family no., head, mobile, lane, months due.', 'কলাম: পরিবার নং, প্রধান, মোবাইল, গলি, বকেয়া মাস।')} <button type="button" data-act="template" class="font-semibold text-sindoor hover:underline">${t('Download template', 'টেমপ্লেট ডাউনলোড')}</button></li>
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
      ${fld('Bengali', 'বাংলা', `<textarea class="field" rows="5" lang="bn">নমস্কার {name}, গেদে মৈত্রী ক্লাবের {months} মাসের চাঁদা ₹{amount} বাকি আছে। অ্যাপে ইউপিআই-এ দিতে পারেন বা সন্ধ্যায় ক্লাব ঘরে তাপস-দাকে দিন। ধন্যবাদ।</textarea>`)}
      ${fld('English', 'ইংরেজি', `<textarea class="field" rows="4">Namaskar {name}, your Gede Maitree Club subscription of ₹{amount} for {months} months is due. Pay by UPI in the app, or to Tapas-da at the club room in the evening. Thank you.</textarea>`)}`,
      'Save message', 'সেভ করুন', 'Reminder message saved.', 'বার্তা সেভ হয়েছে।');
  },
  'remind-all'(b) {
    const due = duesTargets(b?.dataset.picked);
    openDrawer(`
      <div class="p-6">
        <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t(`Remind ${due.length} families`, `${due.length}টি পরিবারকে তাগাদা`)}</h2>
          <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
        <p class="mt-2 text-[15px] text-ink-2">${t('WhatsApp opens one chat at a time, so work down the list. Each one ticks off when you come back.', 'হোয়াটসঅ্যাপ একবারে একটা চ্যাট খোলে, তাই তালিকা ধরে এগোন। ফিরে এলে টিক পড়বে।')}</p>
        <ul class="mt-4 divide-y divide-rule border-y border-rule">${due.map((f) => `<li class="py-2.5 flex items-center gap-3">
          <span class="flex-1 min-w-0"><span class="block font-semibold truncate">${t(f.head, f.headBn)}</span><span class="block text-sm text-ink-3">${inr(f.due)}</span></span>
          <a target="_blank" rel="noopener" data-sent="${f.no}" href="https://wa.me/91${f.phone}?text=${encodeURIComponent(lang === 'bn' ? `নমস্কার ${f.headBn}, গেদে মৈত্রী ক্লাবের ${f.dueMonths} মাসের চাঁদা ₹${f.due} বাকি আছে। অ্যাপে ইউপিআই-এ দিতে পারেন বা সন্ধ্যায় ক্লাব ঘরে তাপস-দাকে দিন। ধন্যবাদ।` : `Namaskar ${f.head}, your Gede Maitree Club subscription of ₹${f.due} for ${f.dueMonths} months is due. Pay by UPI in the app, or to Tapas-da at the club room in the evening. Thank you.`)}" class="btn btn-ink btn-sm"><i data-lucide="message-circle"></i>${t('Open', 'খুলুন')}</a></li>`).join('')}</ul>
        <p class="mt-4 text-[13px] text-ink-3">${t('Later: WhatsApp Business API can send all at once for about ₹0.30 per message.', 'পরে: হোয়াটসঅ্যাপ বিজনেস API দিয়ে একসঙ্গে পাঠানো যায়, বার্তা প্রতি প্রায় ₹০.৩০।')}</p>
      </div>`);
    $$('[data-sent]').forEach((a) => a.addEventListener('click', () => { reminded[a.dataset.sent] = true; if (current === 'dues') setTimeout(dues, 100); a.outerHTML = `<span class="chip bg-paper-2 text-ink-2"><i data-lucide="check"></i>${t('Sent', 'পাঠানো')}</span>`; refreshIcons(); applyLang($('#drawer-body')); }));
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
      ${fld('Package', 'প্যাকেজ', sel(cateringPackages.map((p) => `${p.name} · ₹${p.rate} / guest`)))}
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" />${t('Gede Maitree Club member (10% off)', 'গেদে মৈত্রী ক্লাবের সদস্য (১০% ছাড়)')}</label>`,
      'Add enquiry', 'যোগ করুন', 'Enquiry added to the board.', 'জিজ্ঞাসা বোর্ডে যোগ হয়েছে।');
  },
  quote(b) {
    const o = cateringOrders.find((x) => x.id === b.dataset.id) || cateringOrders.find((x) => x.id === selOrder);
    formDrawer('Send quotation', 'কোটেশন পাঠান', `
      <div class="grid grid-cols-2 gap-3">${fld('Guests', 'অতিথি', inp(`class="field num" inputmode="numeric" value="${o.guests}"`))}${fld('Package', 'প্যাকেজ', sel(cateringPackages.map((p) => `${p.name} · ₹${p.rate} / guest`)))}</div>
      <p class="text-[15px] text-ink-2">${t('A PDF with the package, guests, number of servers, total and 20% advance goes on WhatsApp, signed with the club seal.', 'প্যাকেজ, অতিথি, পরিবেশনকারী, মোট ও ২০% অগ্রিম সহ সিলমোহর দেওয়া PDF হোয়াটসঅ্যাপে যাবে।')}</p>
      ${fld('Valid until', 'বৈধ', inp('type="date" value="2026-11-25"'))}
      ${fld('Note to customer', 'গ্রাহকের জন্য নোট', '<textarea class="field" rows="3">We serve only; the food is arranged by you. Final guest count needed 3 days before.</textarea>')}`,
      'Send on WhatsApp', 'হোয়াটসঅ্যাপে পাঠান', 'Quotation sent.', 'কোটেশন পাঠানো হয়েছে।',
      { onDone: () => { if (o.status === 'enquiry') o.status = 'quoted'; rerender(); } });
  },
  'cat-pay'(b) {
    const o = cateringOrders.find((x) => x.id === b.dataset.id) || cateringOrders.find((x) => x.id === selOrder);
    const kind = b.dataset.kind || 'other';
    const pkgO = cateringPackages.find((p) => p.id === o.pkg);
    const total = o.guests * memberRate(pkgO.rate, o.member);
    const balance = total - o.paid;
    const amt = kind === 'advance' ? Math.round(total * 0.2) : kind === 'final' ? balance : '';
    formDrawer(kind === 'final' ? `Final bill · ${o.customer}` : 'Record catering payment', kind === 'final' ? `চূড়ান্ত বিল · ${o.customerBn}` : 'ক্যাটারিং টাকা জমা', `
      ${kind === 'final' ? `<table class="w-full text-[15px]"><tr><td class="py-1">${t('Total', 'মোট')}</td><td class="text-right num">${inr(total)}</td></tr><tr><td class="py-1 text-ink-2">${t('Already paid', 'আগে দিয়েছেন')}</td><td class="text-right num text-ink-2">−${inr(o.paid)}</td></tr><tr class="border-t border-ink/20 font-semibold"><td class="py-1.5">${t('Balance', 'বাকি')}</td><td class="text-right">${inr(balance)}</td></tr></table>` : ''}
      <div class="grid grid-cols-2 gap-3">${fld('Kind', 'ধরন', sel(kind === 'advance' ? ['Advance', 'Part payment'] : kind === 'final' ? ['Final bill', 'Part payment'] : ['Part payment', 'Advance', 'Final bill']))}${fld('Amount', 'টাকা', inp(`class="field num text-lg" inputmode="numeric" required value="${amt}"`))}</div>
      ${fld('Paid by', 'মাধ্যম', sel(['Cash', 'UPI', 'Bank transfer']))}
      ${kind === 'final' ? `<label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" checked />${t('Close the order and move profit to the Catering book', 'অর্ডার বন্ধ, লাভ ক্যাটারিং খাতায়')}</label>` : ''}`,
      'Record and send receipt', 'জমা ও রসিদ পাঠান',
      kind === 'advance' ? 'Advance recorded. Booking confirmed.' : kind === 'final' ? 'Bill settled. Order closed.' : 'Payment recorded in the Catering book.',
      kind === 'advance' ? 'অগ্রিম জমা। বুকিং নিশ্চিত।' : kind === 'final' ? 'বিল মিটেছে। অর্ডার বন্ধ।' : 'ক্যাটারিং খাতায় জমা হয়েছে।',
      { onDone: () => { if (kind === 'advance') { o.status = 'advance'; o.paid += amt; } if (kind === 'final') { o.status = 'settled'; o.paid = total; } rerender(); } });
  },
  roster(b) {
    const o = cateringOrders.find((x) => x.id === b.dataset.id) || cateringOrders.find((x) => x.id === selOrder);
    const need = serversFor(o.guests);
    const pool = ['Bapi Halder', 'Sanjay Nandi', 'Manas Kundu', 'Rahul Ghosh', 'Tumpa Guha', 'Pintu Saha', 'Raju Das', 'Moumita Kar', 'Subho Pal', 'Ankit Dey', 'Sumon Roy', 'Biswajit Kar', 'Tapan Sen', 'Liton Biswas', 'Koushik Paul', 'Arup Dutta'];
    const team = Array.from({ length: need + 1 }, (_, i) => pool[i % pool.length]);
    const msg = `Serving duty · ${o.customer} · ${o.occasion}, ${o.date}\nReport 1 hour before, in club uniform.\nTeam: ${team.join(', ')}`;
    openDrawer(`
      <div class="p-6">
        <div class="flex items-center"><h2 class="font-display text-[1.7rem] leading-tight pr-4">${t('Serving team', 'পরিবেশন দল')} · ${dn(String(need + 1))}</h2>${closeBtn}</div>
        <p class="mt-1 text-sm text-ink-2">${t(`${o.guests} guests at 1 server per 15, plus a team leader. Report 1 hour before, in club uniform.`, `${o.guests} জন অতিথি, ১৫ জনে ১ জন পরিবেশনকারী ও একজন দলনেতা। ১ ঘণ্টা আগে, ক্লাবের পোশাকে।`)}</p>
        <ul class="mt-4 divide-y divide-rule border-y border-rule text-[15px]">${team.map((n, i) => `<li class="py-2.5 flex items-center gap-3"><span class="w-8 h-8 rounded-full bg-turmeric-wash text-turmeric grid place-items-center text-sm font-semibold">${n.split(' ').map((w) => w[0]).join('')}</span><span class="flex-1">${n}</span>${i === 0 ? `<span class="chip bg-ink text-white">${t('Team leader', 'দলনেতা')}</span>` : `<span class="text-sm text-ink-3">${t('Confirmed', 'নিশ্চিত')}</span>`}</li>`).join('')}</ul>
        <p class="mt-3 text-sm text-ink-3">${t(`Wages: ${inr((need + 1) * 500)} at ₹500 a person, entered in the Catering book after the event.`, `মজুরি: জনপ্রতি ₹৫০০, মোট ${inr((need + 1) * 500)}, অনুষ্ঠানের পর ক্যাটারিং খাতায়।`)}</p>
        <div class="grid grid-cols-2 gap-2 mt-5"><button class="btn btn-line" data-act="print-doc"><i data-lucide="printer"></i>${t('Print', 'প্রিন্ট')}</button><a class="btn btn-ink" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg)}"><i data-lucide="message-circle"></i>${t('Send to team', 'দলকে পাঠান')}</a></div>
      </div>`);
  },
  'cat-exp'() {
    formDrawer('Add catering expense', 'ক্যাটারিং খরচ যোগ', `
      <div class="grid grid-cols-2 gap-3">${fld('Head', 'খাত', sel(['Server wages', 'Plates & glasses', 'Transport', 'Washing', 'Hire of tables & counters', 'Other']))}${fld('Amount', 'টাকা', inp('class="field num text-lg" inputmode="numeric" required'))}</div>
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
      ${['Saraswati Puja budget approval', 'Sports Day volunteer list', 'Catering: more servers for December weddings', 'Lapsed members: final reminder'].map((a, i) => fld(`${i + 1}. ${a}`, `${i + 1}. ${a}`, `<textarea class="field" rows="2" placeholder="Decision, who does it, by when"></textarea>`)).join('')}
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" checked />${t('Share with members in the app', 'অ্যাপে সদস্যদের সঙ্গে শেয়ার')}</label>`,
      'Save minutes', 'সেভ করুন', 'Minutes saved and shared.', 'কার্যবিবরণী সেভ ও শেয়ার হয়েছে।');
  },
  'event-edit'(b) { eventDrawer(events.find((e) => e.id === b.dataset.id)); },
  'event-cancel'(b) {
    const ev = events.find((e) => e.id === b.dataset.id);
    formDrawer(`Cancel · ${ev.title}`, `বাতিল · ${ev.titleBn}`, `
      <p class="text-[15px] text-ink-2">${t('Everyone who registered gets an app notification. Passes stop working at the gate. Any fees paid are listed for refund.', 'যাঁরা নাম দিয়েছেন তাঁরা অ্যাপে জানবেন। গেটে পাস আর চলবে না। দেওয়া ফি ফেরতের তালিকায় উঠবে।')}</p>
      ${fld('Reason shown to members', 'সদস্যদের জন্য কারণ', '<textarea class="field" rows="3" required placeholder="e.g. Ground not available because of the by-election"></textarea>')}`,
      'Cancel event', 'বাতিল করুন', 'Event cancelled. Members notified.', 'অনুষ্ঠান বাতিল। সদস্যদের জানানো হয়েছে।', { danger: true });
  },
  regs(b) {
    const ev = events.find((e) => e.id === b.dataset.id);
    const regs = families.filter((f, i) => (i + (ev.id === 'picnic' ? 1 : 0)) % 3 !== 2).slice(0, 12);
    openDrawer(`
      <div class="p-6">
        <div class="flex items-center"><h2 class="font-display text-[1.7rem] leading-tight pr-4">${t(ev.title, ev.titleBn)}</h2>${closeBtn}</div>
        <p class="text-[15px] text-ink-2 mt-1">${t(`${regs.length} of a sample · passes issued in the app`, `নমুনা ${regs.length}টি · অ্যাপে পাস দেওয়া হয়েছে`)}</p>
        <div class="grid grid-cols-3 gap-px bg-rule border border-rule rounded-lg overflow-hidden mt-4 text-center">
          <div class="bg-card p-3"><p class="font-display text-2xl num">${dn(ev.id === 'picnic' ? '38' : '74')}</p><p class="text-[12.5px] text-ink-3">${t('families', 'পরিবার')}</p></div>
          <div class="bg-card p-3"><p class="font-display text-2xl num">${dn(ev.id === 'picnic' ? '112' : '231')}</p><p class="text-[12.5px] text-ink-3">${t('people', 'জন')}</p></div>
          <div class="bg-card p-3"><p class="font-display text-2xl num">${dn('0')}</p><p class="text-[12.5px] text-ink-3">${t('checked in', 'ঢুকেছেন')}</p></div>
        </div>
        <ul class="mt-4 divide-y divide-rule border-y border-rule text-[15px]">${regs.map((f) => `<li class="py-2.5 flex items-center gap-3"><span class="flex-1 min-w-0"><span class="block font-semibold truncate">${t(f.head, f.headBn)}</span><span class="block text-sm text-ink-3 num">${f.no}${f.due ? ` · <span class="text-sindoor">${t('dues pending', 'বকেয়া')}</span>` : ''}</span></span><span class="chip bg-paper-2 text-ink-2 num">${dn(String(Math.min(f.size, 4)))} ${t('passes', 'পাস')}</span></li>`).join('')}</ul>
        <div class="grid grid-cols-2 gap-2 mt-4"><button class="btn btn-line" data-act="print-doc"><i data-lucide="printer"></i>${t('Print list', 'তালিকা প্রিন্ট')}</button><button class="btn btn-ink" data-act="add-reg" data-id="${ev.id}"><i data-lucide="user-plus"></i>${t('Register a family', 'পরিবারের নাম দিন')}</button></div>
        <button class="w-full mt-3 text-sm font-semibold text-ink-2 hover:underline" data-act="close-regs">${t('Close registrations now', 'এখনই নাম নেওয়া বন্ধ করুন')}</button>
      </div>`);
  },
  'add-reg'() {
    formDrawer('Register a family', 'পরিবারের নাম দিন', `
      ${fld('Family', 'পরিবার', inp('required placeholder="Name, MC number or phone"'))}
      ${fld('How many people?', 'কতজন?', inp('class="field num" inputmode="numeric" value="3"'))}
      <p class="text-sm text-ink-2">${t('For members who come to the club instead of using the app. Their passes appear in their app.', 'যাঁরা অ্যাপ না ব্যবহার করে ক্লাবে আসেন। পাস তাঁদের অ্যাপে চলে যাবে।')}</p>`,
      'Register and issue passes', 'নাম দিন ও পাস দিন', 'Registered. Passes issued.', 'নাম নেওয়া হয়েছে। পাস দেওয়া হয়েছে।');
  },
  'close-regs'() { closeDrawer(); toast(`<i data-lucide="lock"></i>${t('Registrations closed. The app shows “Registration closed”.', 'নাম নেওয়া বন্ধ। অ্যাপে “নাম নেওয়া বন্ধ” দেখাবে।')}`); },

  /* Applications */
  'app-new'() { ACTIONS['member-entry'](); },
  /* Member entry: type in a paper membership form, field for field */
  'member-entry'() {
    const no = `MC-${String(nextFamNo).padStart(4, '0')}`;
    const sec = (en, bn) => `<p class="pt-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-3">${t(en, bn)}</p>`;
    const BLOOD = [t('Choose', 'বেছে নিন'), 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', t('Not known', 'জানা নেই')];
    formDrawer('Member entry', 'সদস্য এন্ট্রি', `
      <p class="text-sm text-ink-2 -mt-2">${t('Copy a paper membership form into the register. The fields follow the paper form, top to bottom.', 'কাগজের সদস্য ফর্ম খাতায় তুলুন। ঘরগুলো কাগজের ফর্মের ক্রমেই।')}</p>
      <div>${radioRow('entry', [['Secretary signed', 'সম্পাদক সই করেছেন'], ['For the next meeting', 'পরের সভায় উঠবে']])}
        <p class="mt-1.5 text-[13px] text-ink-3">${t(`Signed forms become member ${no} now. Unsigned ones go to Applications.`, `সই করা ফর্ম এখনই সদস্য ${no} হবে। সই ছাড়া ফর্ম আবেদনে যাবে।`)}</p></div>
      ${sec('Personal information', 'ব্যক্তিগত তথ্য')}
      <div class="flex gap-4 items-start">
        <label class="shrink-0 w-24 h-28 rounded-[4px] border-2 border-dashed border-rule grid place-items-center text-center cursor-pointer hover:border-ink/40 overflow-hidden relative">
          <input type="file" accept="image/*" class="sr-only" data-member-photo />
          <span class="text-[12px] text-ink-2 px-2"><i data-lucide="camera" class="w-6 h-6 mx-auto mb-1 text-ink-3"></i>${t('Photo', 'ছবি')}</span>
          <img alt="" class="hidden absolute inset-0 w-full h-full object-cover" /></label>
        <div class="flex-1 space-y-4">
          ${fld('Full name', 'পুরো নাম', inp('required autocomplete="off"'))}
          ${fld('Name in Bengali', 'বাংলায় নাম', inp('lang="bn"'))}
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">${fld('Date of birth', 'জন্মতারিখ', inp('class="field num" type="date" required max="2026-11-15"'))}${fld('Blood group', 'রক্তের গ্রুপ', sel(BLOOD))}</div>
      ${fld('Address', 'ঠিকানা', '<textarea class="field" rows="2" required></textarea>')}
      <div class="grid grid-cols-2 gap-3">${fld('Lane', 'গলি', sel(LANES))}${fld('Aadhaar, last 4 digits', 'আধারের শেষ ৪ সংখ্যা', inp('class="field num tracking-[0.3em]" inputmode="numeric" data-digits="4" placeholder="1234"'))}</div>
      <p class="-mt-2 text-[13px] text-ink-3">${t('If the paper form has the full Aadhaar number, enter only the last 4 and keep the paper in the club file.', 'কাগজে পুরো আধার নম্বর থাকলে শুধু শেষ ৪টি লিখুন, কাগজটি ক্লাবের ফাইলে রাখুন।')}</p>
      <div class="grid grid-cols-2 gap-3">${fld('Phone', 'ফোন', inp('class="field num" type="tel" inputmode="tel" required'))}${fld('Email', 'ইমেল', inp('type="email"'))}</div>
      ${sec('Family on the same form', 'একই ফর্মে পরিবার')}
      ${fld('One per line: name, relation, blood group', 'প্রতি লাইনে একজন: নাম, সম্পর্ক, রক্তের গ্রুপ', '<textarea class="field" rows="2" placeholder="Rina Das, wife, B+"></textarea>')}
      ${sec('Declaration and fees', 'ঘোষণা ও ফি')}
      <label class="flex items-start gap-3 text-[15px]"><input type="checkbox" class="mt-1 w-4 h-4 accent-[#d21f1b]" required />${t('The member has signed the self declaration', 'সদস্য স্ব-ঘোষণায় সই করেছেন')}</label>
      <div class="grid grid-cols-2 gap-3">${fld('Date on the form', 'ফর্মের তারিখ', inp('class="field num" type="date" value="2026-11-15"'))}${fld('Plan', 'প্ল্যান', sel(['₹100 / month', '₹1,100 / year']))}</div>
      <div><p class="label">${t(`Admission fee ${inr(club.admissionFee)}`, `ভর্তি ফি ${inr(club.admissionFee)}`)}</p>${radioRow('adm', [['Paid cash', 'নগদ'], ['Paid UPI', 'ইউপিআই'], ['Not yet', 'এখনও না']])}</div>
      <label class="flex items-center gap-3 text-[15px] cursor-pointer"><input type="file" accept="image/*,.pdf" class="sr-only" data-photo-input /><span class="btn btn-line btn-sm"><i data-lucide="paperclip"></i>${t('Attach the scanned form', 'স্ক্যান করা ফর্ম যুক্ত করুন')}</span><span class="text-sm text-ink-3 truncate" data-photo-name>${t('Optional', 'ঐচ্ছিক')}</span></label>`,
      'Save entry', 'এন্ট্রি সেভ', '', '',
      { onDone: (form) => {
        const name = form.querySelector('input:not([type])').value.trim() || t('New member', 'নতুন সদস্য');
        const signed = form.querySelector('input[name="entry"]:checked').value === '0';
        if (signed) {
          approved.unshift({ head: name, headBn: name, no, on: '15 Nov' }); nextFamNo++;
          toast(`<i data-lucide="check-circle-2"></i>${t(`${name} is now member ${no}. Their ID card is in “To print”.`, `${name} এখন সদস্য ${no}। আইডি কার্ড “প্রিন্ট বাকি”-তে।`)}`);
        } else {
          const ta = form.querySelectorAll('textarea');
          const laneV = form.querySelectorAll('select')[1].value;
          const people = ta[1].value.split('\n').filter((l) => l.trim()).map((l) => { const [n, ...r] = l.split(','); return [n.trim(), r.join(',').trim()]; });
          const id = `AP-26-0${applications.length + 17}`;
          applications.unshift({ id, head: name, headBn: name, phone: form.querySelector('input[type=tel]').value.replace(/\D/g, ''), lane: laneV, laneBn: laneV, address: ta[0].value, people, plan: 'monthly', applied: '15 Nov', via: 'Paper form', status: 'new', note: '' });
          selApp = id;
          toast(`<i data-lucide="check-circle-2"></i>${t('Saved to Applications for the next meeting.', 'আবেদনে সেভ হয়েছে, পরের সভায় উঠবে।')}`);
        }
        rerender();
      } });
  },
  'app-approve'(b) {
    const a = applications.find((x) => x.id === b.dataset.id);
    const no = `MC-${String(nextFamNo).padStart(4, '0')}`;
    formDrawer(`Approve · ${a.head}`, `অনুমোদন · ${a.headBn}`, `
      <div class="rounded-lg bg-paper-2 p-4 text-[15px]"><p>${t('New family number', 'নতুন পরিবার নম্বর')}: <strong class="num">${no}</strong></p><p class="text-ink-2">${t(`${a.people.length + 1} member cards will be created`, `${a.people.length + 1}টি সদস্য কার্ড তৈরি হবে`)}</p></div>
      ${fld('Approved at', 'কোথায় অনুমোদন', sel(['Committee meeting, 16 Nov', 'Secretary (between meetings)']))}
      <div><p class="label">${t(`Admission fee ${inr(club.admissionFee)}`, `ভর্তি ফি ${inr(club.admissionFee)}`)}</p>${radioRow('adm', [['Paid cash', 'নগদ পেয়েছি'], ['Paid UPI', 'ইউপিআই'], ['Pay in app', 'অ্যাপে দেবেন']])}</div>
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" checked />${t('Send welcome on WhatsApp with the app link', 'হোয়াটসঅ্যাপে স্বাগত বার্তা ও অ্যাপের লিঙ্ক')}</label>
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" checked />${t('Add their ID cards to “To print”', 'আইডি কার্ড “প্রিন্ট বাকি”-তে যোগ')}</label>`,
      'Approve and create family', 'অনুমোদন ও পরিবার তৈরি', `${a.head} is now family ${no}. Welcome message sent.`, `${a.headBn} এখন পরিবার ${no}। স্বাগত বার্তা গেছে।`,
      { onDone: () => { if (a.mine) demo.set({ approved: { no, head: a.head, phone: a.phone, people: a.people.length + 1, lane: a.lane } }); a.status = 'done'; approved.unshift({ head: a.head, headBn: a.headBn, no, on: '15 Nov' }); nextFamNo++; rerender(); } });
  },
  'app-info'(b) {
    const a = applications.find((x) => x.id === b.dataset.id);
    window.open(b.href, '_blank', 'noopener');
    a.status = 'info'; a.note = t('Asked on WhatsApp for an address proof · today', 'হোয়াটসঅ্যাপে ঠিকানার প্রমাণ চাওয়া হয়েছে · আজ');
    rerender();
    toast(`<i data-lucide="message-circle"></i>${t('WhatsApp opened. Marked as waiting for info.', 'হোয়াটসঅ্যাপ খুলেছে। তথ্যের অপেক্ষায় রাখা হয়েছে।')}`);
  },
  'app-reject'(b) {
    const a = applications.find((x) => x.id === b.dataset.id);
    formDrawer(`Decline · ${a.head}`, `নামঞ্জুর · ${a.headBn}`, `
      ${fld('Reason', 'কারণ', sel(['Lives outside the para', 'Already a member of another family', 'Duplicate application', 'Other']))}
      ${fld('Message to the applicant', 'আবেদনকারীকে বার্তা', '<textarea class="field" rows="3">Namaskar, thank you for applying to Gede Maitree Club. We are sorry we cannot accept the application at this time. You are always welcome at our pujas and events.</textarea>')}
      <p class="text-sm text-ink-2">${t('The decision and reason are kept in the meeting minutes.', 'সিদ্ধান্ত ও কারণ সভার কার্যবিবরণীতে থাকবে।')}</p>`,
      'Decline and send', 'নামঞ্জুর ও পাঠান', 'Application declined. Message sent.', 'আবেদন নামঞ্জুর। বার্তা গেছে।',
      { danger: true, onDone: () => { a.status = 'rejected'; rerender(); } });
  },

  /* Families */
  person(b) {
    const editing = !!b.dataset.name;
    formDrawer(editing ? `Edit · ${b.dataset.name}` : 'Add a family member', editing ? 'সদস্য সম্পাদনা' : 'পরিবারে সদস্য যোগ', `
      <p class="text-sm text-ink-3 num">${b.dataset.no}</p>
      ${fld('Name', 'নাম', inp(`required value="${b.dataset.name || ''}"`))}
      <div class="grid grid-cols-2 gap-3">${fld('Relation', 'সম্পর্ক', sel([b.dataset.rel || 'Son', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Daughter-in-law', 'Other']))}${fld('Date of birth', 'জন্ম তারিখ', inp('type="date"'))}</div>
      <div class="grid grid-cols-2 gap-3">${fld('Blood group', 'রক্তের গ্রুপ', sel(['Not known', 'A+', 'A−', 'B+', 'B−', 'O+', 'O−', 'AB+', 'AB−']))}${fld('Own mobile (optional)', 'নিজের মোবাইল (ঐচ্ছিক)', inp('class="field num" type="tel"'))}</div>
      <label class="w-full h-20 rounded-lg border-2 border-dashed border-rule bg-paper-2 text-ink-2 flex items-center justify-center gap-2 cursor-pointer"><i data-lucide="camera" class="w-5 h-5"></i><span class="text-sm font-semibold">${t('Photo for the ID card', 'আইডি কার্ডের ছবি')}</span><input type="file" accept="image/*" class="sr-only" /></label>
      ${editing ? `<div><p class="label">${t('Remove from the family', 'পরিবার থেকে বাদ')}</p>${radioRow('rm', [['Keep', 'থাকবেন'], ['Moved out', 'অন্যত্র'], ['Passed away', 'প্রয়াত']])}<p class="text-sm text-ink-3 mt-1.5">${t('Their card stops working at the gate. History is kept.', 'কার্ড গেটে আর চলবে না। ইতিহাস থাকবে।')}</p></div>` : ''}`,
      editing ? 'Save' : 'Add and create card', editing ? 'সেভ করুন' : 'যোগ ও কার্ড তৈরি',
      editing ? 'Saved. The change is in the audit trail.' : 'Member added. Their card is in “To print”.', editing ? 'সেভ হয়েছে।' : 'সদস্য যোগ হয়েছে। কার্ড প্রিন্টের তালিকায়।');
  },
  waive(b) {
    const f = families.find((x) => x.no === b.dataset.no);
    formDrawer(`Waive dues · ${f.head}`, `বকেয়া মকুব · ${f.headBn}`, `
      <div class="rounded-lg bg-sindoor-wash p-4 text-[15px]"><p>${t(`${f.dueMonths} months due`, `${f.dueMonths} মাস বকেয়া`)} · <strong>${inr(f.due)}</strong></p></div>
      ${fld('Waive', 'মকুব', sel([`All ${f.dueMonths} months (${inr(f.due)})`, '1 month (₹100)', '3 months (₹300)']))}
      ${fld('Reason (shown at the AGM)', 'কারণ (এজিএম-এ দেখানো হবে)', sel(['Financial hardship', 'Death in the family', 'Long illness', 'Committee decision', 'Other']))}
      ${fld('Note', 'নোট', '<textarea class="field" rows="2" required></textarea>')}
      <p class="text-sm text-ink-2">${t('Needs the secretary’s approval too. No money entry is made; the dues are marked “waived”.', 'সম্পাদকের অনুমোদনও লাগবে। টাকার এন্ট্রি হয় না; বকেয়া “মকুব” হিসেবে থাকে।')}</p>`,
      'Send for approval', 'অনুমোদনে পাঠান', 'Sent to the secretary for approval.', 'অনুমোদনের জন্য সম্পাদকের কাছে গেছে।');
  },
  receipt(b) {
    const f = families.find((x) => x.no === b.dataset.no);
    openDrawer(`
      <div class="p-6">
        <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t('Receipt', 'রসিদ')} <span class="num">${b.dataset.ref}</span></h2>${closeBtn}</div>
        <div class="mt-4 rounded-lg border border-rule p-5">
          <div class="flex items-center gap-3 border-b border-ink/20 pb-3"><span>${seal({ size: 44, rotate: -4 })}</span><p class="font-display text-lg text-sindoor">${t('Gede Maitree Club', 'গেদে মৈত্রী ক্লাব')}</p></div>
          <p class="mt-3 text-[15px]">${t('Received from', 'গৃহীত')} <strong>${t(f.head, f.headBn)}</strong> (${f.no}) <strong>${inr(Number(b.dataset.amt))}</strong> ${t('towards subscription.', 'চাঁদা বাবদ।')}</p>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-4"><button class="btn btn-line" data-act="receipt-print" data-ref="${b.dataset.ref}"><i data-lucide="printer"></i>${t('Print', 'প্রিন্ট')}</button>
          <a class="btn btn-ink" target="_blank" rel="noopener" href="https://wa.me/91${f.phone}?text=${encodeURIComponent(`Gede Maitree Club receipt ${b.dataset.ref}: ₹${b.dataset.amt} received. Thank you.`)}"><i data-lucide="message-circle"></i>${t('Resend', 'আবার পাঠান')}</a></div>
        <p class="mt-3 text-sm text-ink-3">${t('Wrong amount or family? Reverse it in the khata with a note.', 'ভুল টাকা বা পরিবার? খাতায় নোট দিয়ে উল্টান।')}</p>
      </div>`);
  },
  'receipt-print'(b) { proto(`Receipt ${b.dataset.ref || ''} sent to the printer.`, `রসিদ ${b.dataset.ref || ''} প্রিন্টারে গেছে।`); },
  'print-month'() { proto('November khata prepared for A4, in the old register layout.', 'নভেম্বরের খাতা A4-এ পুরনো খাতার মতো তৈরি।'); },
  'print-doc'() { proto('Sent to the printer.', 'প্রিন্টারে গেছে।'); },
  template() { proto('Template register-template.xlsx prepared.', 'register-template.xlsx তৈরি।'); },
  'copy-notice'() {
    const f = $('#notice-form');
    const [title] = f.querySelectorAll('input');
    const text = `*${title.value}*\n${f.querySelector('textarea').value}\n— Gede Maitree Club`;
    navigator.clipboard?.writeText(text).catch(() => {});
    toast(`<i data-lucide="clipboard-check"></i>${t('Copied. Paste it in the club WhatsApp group.', 'কপি হয়েছে। ক্লাবের হোয়াটসঅ্যাপ গ্রুপে পেস্ট করুন।')}`);
  },

  /* Settings: people */
  resend(b) { toast(`<i data-lucide="send"></i>${t(`Invite sent again to ${b.dataset.name}.`, `${b.dataset.name}-কে আবার আমন্ত্রণ গেছে।`)}`); },
  revoke(b) {
    formDrawer(`Remove access · ${b.dataset.name}`, `অ্যাক্সেস বাতিল · ${b.dataset.name}`, `
      <p class="text-[15px] text-ink-2">${t('They are signed out everywhere and can no longer open the admin app. Their past entries stay in the khata with their name.', 'সব জায়গা থেকে লগআউট হবেন, অ্যাডমিন অ্যাপ আর খুলবে না। আগের এন্ট্রি তাঁদের নামেই খাতায় থাকবে।')}</p>
      ${fld('Reason', 'কারণ', sel(['Term ended', 'Stepped down', 'Phone lost', 'Other']))}`,
      'Remove access', 'বাতিল করুন', 'Access removed.', 'অ্যাক্সেস বাতিল হয়েছে।', { danger: true });
  },

  /* Catering stages */
  'cat-served'(b) {
    const o = cateringOrders.find((x) => x.id === b.dataset.id);
    formDrawer(`Served · ${o.customer}`, `পরিবেশিত · ${o.customerBn}`, `
      ${fld('Final guest count', 'শেষ অতিথি সংখ্যা', inp(`class="field num text-lg" inputmode="numeric" value="${o.guests}"`))}
      <p class="text-sm text-ink-2">${t('Extra guests are added to the final bill at the same rate.', 'বাড়তি অতিথি একই দামে চূড়ান্ত বিলে যোগ হবে।')}</p>`,
      'Mark served', 'পরিবেশিত', 'Marked as served. The final bill is ready.', 'পরিবেশিত। চূড়ান্ত বিল তৈরি।',
      { onDone: () => { o.status = 'done'; rerender(); } });
  },
  'cat-lost'(b) {
    const o = cateringOrders.find((x) => x.id === b.dataset.id);
    formDrawer(`Lost · ${o.customer}`, `হারানো · ${o.customerBn}`, `
      ${fld('Why?', 'কেন?', sel(['Price too high', 'Date not free', 'Chose another caterer', 'Event called off', 'No reply']))}
      <p class="text-sm text-ink-2">${t('Lost orders leave the board and show in the season report, so you can see why.', 'হারানো অর্ডার বোর্ড থেকে সরে মরসুমের রিপোর্টে থাকে।')}</p>`,
      'Mark as lost', 'হারানো', 'Order marked as lost.', 'অর্ডার হারানো হিসেবে চিহ্নিত।',
      { danger: true, onDone: () => { o.status = 'lost'; selOrder = cateringOrders.find((x) => x.status !== 'lost').id; rerender(); } });
  },
  'cat-cancel'(b) {
    const o = cateringOrders.find((x) => x.id === b.dataset.id);
    formDrawer(`Cancel booking · ${o.customer}`, `বুকিং বাতিল · ${o.customerBn}`, `
      <p class="text-[15px]">${t('Advance received', 'অগ্রিম পাওয়া')}: <strong>${inr(o.paid)}</strong></p>
      <div><p class="label">${t('Advance', 'অগ্রিম')}</p>${radioRow('adv', [['Refund all', 'পুরো ফেরত'], ['Refund half', 'অর্ধেক'], ['Keep', 'রাখা']])}</div>
      ${fld('Note', 'নোট', '<textarea class="field" rows="2" required></textarea>')}`,
      'Cancel booking', 'বাতিল করুন', 'Booking cancelled. Any refund is entered in the Catering book.', 'বুকিং বাতিল। ফেরত ক্যাটারিং খাতায় উঠেছে।',
      { danger: true, onDone: () => { o.status = 'lost'; selOrder = cateringOrders.find((x) => x.status !== 'lost').id; rerender(); } });
  },

  /* Chanda */
  sponsor() {
    formDrawer('Add a sponsor', 'স্পনসর যোগ', `
      ${fld('Business or name', 'প্রতিষ্ঠান বা নাম', inp('required'))}
      <div class="grid grid-cols-2 gap-3">${fld('Amount', 'টাকা', inp('class="field num text-lg" inputmode="numeric" required'))}${fld('Status', 'অবস্থা', sel(['Promised', 'Received']))}</div>
      ${fld('What they get', 'বিনিময়ে', sel(['Gate banner', 'Stage mention', 'Bhog counter board', 'Name in the souvenir', 'Nothing']))}`,
      'Add sponsor', 'যোগ করুন', 'Sponsor added.', 'স্পনসর যোগ হয়েছে।');
  },
  'sponsor-paid'(b) {
    const s = chanda.sponsors[b.dataset.i];
    formDrawer(`Received · ${s.name}`, `পেয়েছি · ${s.nameBn}`, `
      <div class="grid grid-cols-2 gap-3">${fld('Amount', 'টাকা', inp(`class="field num text-lg" value="${s.amount}"`))}${fld('Paid by', 'মাধ্যম', sel(['Cash', 'UPI', 'Cheque']))}</div>`,
      'Record and send receipt', 'জমা ও রসিদ', 'Sponsorship entered in the Club book.', 'স্পনসরশিপ ক্লাব খাতায় উঠেছে।',
      { onDone: () => { s.status = 'paid'; rerender(); } });
  },
  budget() {
    formDrawer(`Budget · ${chanda.event}`, `বাজেট · ${chanda.eventBn}`, chanda.budget.map((x) => fld(x.head, x.headBn, inp(`class="field num" value="${x.amount}"`))).join('')
      + `<p class="text-sm text-ink-2">${t('Budget changes after the meeting approval are logged.', 'সভায় অনুমোদনের পর বাজেট বদল লেখা থাকে।')}</p>`,
      'Save budget', 'সেভ করুন', 'Budget saved.', 'বাজেট সেভ হয়েছে।');
  },

  /* Nursery */
  plant(b) {
    const p = plants.find((x) => x.id === b.dataset.plant);
    formDrawer(p ? `Edit · ${p.name}` : 'Add a plant', p ? `সম্পাদনা · ${p.nameBn}` : 'গাছ যোগ', `
      <div class="grid grid-cols-2 gap-3">${fld('Name (English)', 'নাম (ইংরেজি)', inp(`required value="${p ? p.name : ''}"`))}${fld('Name (Bengali)', 'নাম (বাংলা)', inp(`value="${p ? p.nameBn : ''}" lang="bn"`))}</div>
      <div class="grid grid-cols-2 gap-3">${fld('Category', 'ধরন', sel(['Flowering', 'Fruit', 'Indoor', 'Seasonal', 'Seeds & bulbs']))}${fld('Pot size', 'টব', inp(`value="${p ? p.pot : '8&quot;'}"`))}</div>
      <div class="grid grid-cols-2 gap-3">${fld('Price', 'দাম', inp(`class="field num" value="${p ? p.price : ''}" required`))}${fld('Opening stock', 'শুরুর স্টক', inp(`class="field num" value="${p ? p.stock : ''}"`))}</div>
      <label class="w-full h-20 rounded-lg border-2 border-dashed border-rule bg-paper-2 text-ink-2 flex items-center justify-center gap-2 cursor-pointer"><i data-lucide="camera" class="w-5 h-5"></i><span class="text-sm font-semibold">${t('Photo for the website', 'ওয়েবসাইটের ছবি')}</span><input type="file" accept="image/*" class="sr-only" /></label>
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" checked />${t('Show on the website catalogue', 'ওয়েবসাইটের ক্যাটালগে দেখান')}</label>`,
      p ? 'Save' : 'Add plant', p ? 'সেভ করুন' : 'যোগ করুন', p ? 'Plant updated.' : 'Plant added to the catalogue.', p ? 'আপডেট হয়েছে।' : 'ক্যাটালগে যোগ হয়েছে।');
  },
  'wa-orders'() {
    const orders = [['Ruma Basak', 'Tulsi ×2, Aloe vera ×1', 170, 'Pickup today'], ['Amit Saha (MC-0119)', 'Hibiscus ×3, Marigold tray ×2', 432, 'Pickup Sat']];
    openDrawer(`
      <div class="p-6">
        <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t('WhatsApp orders', 'হোয়াটসঅ্যাপ অর্ডার')}</h2>${closeBtn}</div>
        <p class="text-[15px] text-ink-2 mt-1">${t('From “Order on WhatsApp” on the website. Set the plants aside, then take payment at pickup.', 'ওয়েবসাইটের “হোয়াটসঅ্যাপে অর্ডার” থেকে। গাছ সরিয়ে রাখুন, নেওয়ার সময় টাকা নিন।')}</p>
        <ul class="mt-4 space-y-3">${orders.map(([who, what, amt, when]) => `<li class="paper-card p-4">
          <div class="flex"><p class="font-semibold">${who}</p><p class="ml-auto font-semibold">${inr(amt)}</p></div>
          <p class="text-sm text-ink-2">${what}</p><p class="text-sm text-ink-3">${when}</p>
          <div class="grid grid-cols-2 gap-2 mt-3"><button class="btn btn-line btn-sm" data-act="wa-ready"><i data-lucide="package-check"></i>${t('Ready, tell them', 'তৈরি, জানান')}</button><button class="btn btn-ink btn-sm" data-act="wa-sold"><i data-lucide="banknote"></i>${t('Picked up & paid', 'নিয়েছেন ও দিয়েছেন')}</button></div></li>`).join('')}</ul>
      </div>`);
  },
  'wa-ready'(b) { b.closest('li').querySelector('[data-act="wa-ready"]').outerHTML = `<span class="chip bg-paper-2 text-ink-2 justify-center"><i data-lucide="check"></i>${t('Told', 'জানানো হয়েছে')}</span>`; refreshIcons(); applyLang($('#drawer-body')); },
  'wa-sold'(b) { b.closest('li').remove(); toast(`<i data-lucide="check-circle-2"></i>${t('Sale saved in the Nursery book. Stock updated.', 'বিক্রি নার্সারি খাতায় উঠেছে। স্টক আপডেট।')}`); },

  /* Meetings & polls */
  meeting() {
    formDrawer('Call a meeting', 'সভা ডাকুন', `
      <div><p class="label">${t('Kind', 'ধরন')}</p>${radioRow('mk', [['Committee', 'কমিটি'], ['General (AGM)', 'সাধারণ সভা']])}</div>
      <div class="grid grid-cols-2 gap-3">${fld('Date', 'তারিখ', inp('type="date" value="2026-11-30"'))}${fld('Time', 'সময়', inp('value="6:00 pm"'))}</div>
      ${fld('Place', 'জায়গা', inp('value="Club room"'))}
      ${fld('Agenda (one item per line)', 'আলোচ্য (প্রতি লাইনে একটি)', '<textarea class="field" rows="4"></textarea>')}
      <p class="text-sm text-ink-2">${t('Members get the notice in the app. An AGM needs 14 days’ notice under the club rules.', 'সদস্যরা অ্যাপে নোটিস পাবেন। নিয়ম অনুযায়ী এজিএম-এর ১৪ দিন আগে নোটিস লাগে।')}</p>`,
      'Send notice', 'নোটিস পাঠান', 'Meeting notice sent.', 'সভার নোটিস গেছে।');
  },
  poll() {
    formDrawer('New poll', 'নতুন ভোট', `
      ${fld('Question', 'প্রশ্ন', inp('required placeholder="e.g. Which date for the blood donation camp?"'))}
      ${fld('Options (one per line)', 'বিকল্প (প্রতি লাইনে একটি)', '<textarea class="field" rows="3" required></textarea>')}
      <div class="grid grid-cols-2 gap-3">${fld('Closes', 'শেষ', inp('type="date" value="2026-11-27"'))}${fld('Who votes', 'কারা ভোট দেবেন', sel(['One vote per family', 'Committee only']))}</div>
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" />${t('Formal AGM resolution (only paid-up families can vote)', 'এজিএম প্রস্তাব (শুধু বকেয়াহীন পরিবার ভোট দেবে)')}</label>`,
      'Open poll', 'ভোট শুরু', 'Poll opened. Members get a notification.', 'ভোট শুরু। সদস্যরা নোটিফিকেশন পাবেন।');
  },
  'poll-close'(b) { polls[b.dataset.i].open = false; rerender(); toast(`<i data-lucide="check-circle-2"></i>${t('Poll closed. The result is posted as a notice.', 'ভোট বন্ধ। ফল নোটিস হিসেবে দেওয়া হয়েছে।')}`); },
};
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b || !ACTIONS[b.dataset.act]) return;
  e.preventDefault(); e.stopPropagation();
  ACTIONS[b.dataset.act](b);
});

/* ---------------- Gallery manager ---------------- */
const gAlbums = GALLERY.map((g) => ({ ...g, status: 'published', cover: 0, items: g.items.map((it) => ({ ...it })) }));
gAlbums.unshift({ id: 'sports-26', album: 'sports', date: '2026-12-13', en: 'Annual Sports Day', bn: 'বার্ষিক ক্রীড়া', when: '13 Dec 2026', whenBn: '১৩ ডিসে ২০২৬', status: 'draft', cover: 0, items: [] });
const submissions = [
  { from: 'Moumita Kar (MC-0140)', p: 'pujaMorning', note: 'Ashtami morning, our lane', album: 'durga-26', at: '12 Nov' },
  { from: 'Arindam Dey (MC-0137)', v: 'Kids’ drawing competition', vBn: 'ছোটদের আঁকা প্রতিযোগিতা', poster: 'garlands', dur: '1:05', note: 'Sent on WhatsApp', album: 'durga-26', at: '11 Nov' },
];
let gSel = gAlbums[1].id;
const gIsVideo = (it) => !!(it.v || it.kind === 'video');
function gThumb(it, cls = 'w-full h-full object-cover') {
  if (it.local) return it.kind === 'video' ? `<video src="${it.local}" muted preload="metadata" class="${cls}"></video>` : `<img src="${it.local}" alt="" class="${cls}" />`;
  return photo(it.v ? it.poster : it.p, { w: 500, cls, sizes: '220px' });
}
function galleryScreen(param) {
  if (param) gSel = param;
  const a = gAlbums.find((x) => x.id === gSel) || gAlbums[0];
  gSel = a.id;
  const kindName = (k) => { const x = ALBUMS.find((y) => y.key === k); return t(x.en, x.bn); };
  const counts = (g) => { const v = g.items.filter(gIsVideo).length; return t(`${g.items.length - v} photos · ${v} videos`, `${g.items.length - v}টি ছবি · ${v}টি ভিডিও`); };
  let lastY = '';
  paint(screen('gallery'), `
    ${pageHead('Gallery', 'ছবি ও ভিডিও', t('Albums are shown on the website by date, newest first. Members can send photos for review.', 'অ্যালবাম ওয়েবসাইটে তারিখ অনুযায়ী দেখায়। সদস্যরা ছবি পাঠাতে পারেন, যাচাইয়ের পর ওঠে।'), `
      <a href="index.html#gallery" target="_blank" class="btn btn-line btn-sm"><i data-lucide="external-link"></i>${t('View on website', 'ওয়েবসাইটে দেখুন')}</a>
      <button class="btn btn-ink btn-sm" data-act="g-new"><i data-lucide="folder-plus"></i>${t('New album', 'নতুন অ্যালবাম')}</button>`)}
    ${submissions.length ? `<div class="paper-card mb-6">
      <div class="px-5 pt-4 pb-3 border-b border-rule flex items-center gap-2"><h2 class="font-display text-xl">${t('Sent by members', 'সদস্যদের পাঠানো')}</h2><span class="chip h-6 px-2 bg-sindoor text-white num">${dn(String(submissions.length))}</span><span class="ml-auto text-sm text-ink-3 hidden sm:block">${t('Nothing goes public until you approve it', 'অনুমোদন ছাড়া কিছু প্রকাশ হয় না')}</span></div>
      <ul class="divide-y divide-rule">${submissions.map((s, i) => `<li class="p-4 flex items-center gap-4">
        <span class="relative w-20 h-14 rounded overflow-hidden bg-paper-2 shrink-0">${gThumb(s)}${s.v ? '<span class="absolute inset-0 grid place-items-center bg-black/25"><i data-lucide="play" class="w-5 h-5 text-white fill-current"></i></span>' : ''}</span>
        <div class="flex-1 min-w-0"><p class="font-semibold truncate">${s.v ? t(s.v, s.vBn) : t('Photo', 'ছবি')} · ${s.from}</p><p class="text-sm text-ink-3">${t(s.note, bnText(s.note))} · ${t(s.at, bnText(s.at))} · ${t('for', 'অ্যালবাম')} ${t(gAlbums.find((g) => g.id === s.album).en, gAlbums.find((g) => g.id === s.album).bn)}</p></div>
        <button class="btn btn-ink btn-sm" data-act="g-sub-ok" data-i="${i}"><i data-lucide="check"></i><span class="hidden sm:inline">${t('Add to album', 'অ্যালবামে যোগ')}</span></button>
        <button class="btn btn-ghost btn-sm text-ink-2" data-act="g-sub-no" data-i="${i}" aria-label="Decline"><i data-lucide="x"></i></button>
      </li>`).join('')}</ul></div>` : ''}
    <div class="grid xl:grid-cols-12 gap-6 items-start">
      <div class="xl:col-span-4 paper-card overflow-hidden">
        <ul>${gAlbums.slice().sort((x, y) => y.date.localeCompare(x.date)).map((g) => {
          const y = g.date.slice(0, 4); const head = y !== lastY ? `<li class="px-4 pt-3 pb-1 text-[12px] font-bold text-ink-3 tracking-wide num">${dn(y)}</li>` : ''; lastY = y;
          const c = g.items[g.cover];
          return `${head}<li><a href="#gallery/${g.id}" class="flex items-center gap-3 px-4 py-2.5 ${g.id === gSel ? 'bg-paper-2' : 'hover:bg-paper-2/60'}">
            <span class="w-14 h-11 rounded overflow-hidden bg-paper-2 shrink-0 grid place-items-center">${c ? gThumb(c) : '<i data-lucide="image" class="w-5 h-5 text-ink-3"></i>'}</span>
            <span class="flex-1 min-w-0"><span class="block font-semibold truncate">${t(g.en, g.bn)}</span><span class="block text-[13px] text-ink-3 num">${t(g.when, g.whenBn)} · ${dn(String(g.items.length))}</span></span>
            ${g.status === 'draft' ? `<span class="chip h-6 px-2 text-[12px] border border-ink/30 text-ink-2">${t('Draft', 'খসড়া')}</span>` : ''}
          </a></li>`;
        }).join('')}</ul>
      </div>

      <div class="xl:col-span-8 paper-card">
        <div class="p-5 border-b border-rule flex flex-wrap items-start gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-sm text-ink-3"><span class="num">${t(a.when, a.whenBn)}</span> · ${kindName(a.album)} · ${counts(a)}</p>
            <h2 class="font-display text-2xl leading-tight">${t(a.en, a.bn)}</h2>
            <p class="mt-1 text-sm ${a.status === 'published' ? 'text-tulsi' : 'text-turmeric'} font-semibold flex items-center gap-1.5"><i data-lucide="${a.status === 'published' ? 'globe' : 'eye-off'}" class="w-4 h-4"></i>${a.status === 'published' ? t('On the website', 'ওয়েবসাইটে আছে') : t('Draft: only the committee can see it', 'খসড়া: শুধু কমিটি দেখতে পায়')}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="btn btn-line btn-sm" data-act="g-edit"><i data-lucide="pencil"></i>${t('Details', 'বিবরণ')}</button>
            <button class="btn ${a.status === 'published' ? 'btn-line' : 'btn-primary'} btn-sm" data-act="g-publish">${a.status === 'published' ? `<i data-lucide="eye-off"></i>${t('Hide', 'লুকান')}` : `<i data-lucide="globe"></i>${t('Publish', 'প্রকাশ')}`}</button>
          </div>
        </div>
        <div class="p-5">
          <div class="grid sm:grid-cols-[1fr_auto] gap-3">
            <label class="h-24 rounded-lg border-2 border-dashed border-rule bg-paper-2 text-ink-2 flex items-center justify-center gap-3 cursor-pointer hover:border-ink/40 px-4 text-center" id="g-drop">
              <i data-lucide="upload" class="w-6 h-6 shrink-0"></i>
              <span><span class="block font-semibold text-ink">${t('Add photos or videos', 'ছবি বা ভিডিও যোগ করুন')}</span><span class="block text-sm">${t('Drop files here or tap to choose · videos up to 2 minutes', 'ফাইল এখানে ছাড়ুন বা চাপুন · ভিডিও ২ মিনিট পর্যন্ত')}</span></span>
              <input type="file" accept="image/*,video/*" multiple class="sr-only" id="g-files" /></label>
            <button class="btn btn-line h-24 sm:w-40 flex-col gap-1" data-act="g-yt"><i data-lucide="youtube" class="!w-6 !h-6 text-sindoor"></i><span class="text-sm">${t('YouTube link', 'ইউটিউব লিঙ্ক')}</span></button>
          </div>
          ${a.items.length ? `<ul class="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${a.items.map((it, i) => `
            <li class="group relative rounded-lg overflow-hidden border ${i === a.cover ? 'border-sindoor ring-2 ring-sindoor/30' : 'border-rule'} bg-paper-2">
              <div class="relative aspect-[4/3]">${gThumb(it)}
                ${gIsVideo(it) ? `<span class="absolute left-1.5 bottom-1.5 chip h-5 px-1.5 bg-black/70 text-white text-[11px]"><i data-lucide="${it.yt ? 'youtube' : 'video'}" class="!w-3 !h-3"></i>${it.dur || t('Video', 'ভিডিও')}</span>` : ''}
                ${i === a.cover ? `<span class="absolute left-1.5 top-1.5 chip h-5 px-1.5 bg-sindoor text-white text-[11px]">${t('Cover', 'প্রচ্ছদ')}</span>` : ''}
              </div>
              <div class="px-2 py-1.5 flex items-center gap-1 bg-card">
                <span class="flex-1 min-w-0 text-[12.5px] text-ink-2 truncate">${it.v ? t(it.v, it.vBn || it.v) : it.name || t('Photo', 'ছবি')}</span>
                ${i === a.cover ? '' : `<button class="w-7 h-7 grid place-items-center rounded hover:bg-paper-2" data-act="g-cover" data-i="${i}" title="Set as cover" aria-label="Set as cover"><i data-lucide="star" class="w-4 h-4"></i></button>`}
                <button class="w-7 h-7 grid place-items-center rounded hover:bg-paper-2" data-act="g-caption" data-i="${i}" title="Caption" aria-label="Edit caption"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                <button class="w-7 h-7 grid place-items-center rounded hover:bg-paper-2 text-sindoor" data-act="g-remove" data-i="${i}" title="Remove" aria-label="Remove"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
              </div>
            </li>`).join('')}</ul>` : `<div class="mt-5 py-12 text-center text-ink-3"><i data-lucide="images" class="w-8 h-8 mx-auto"></i><p class="mt-2">${t('No photos yet. Add them after the event, then publish.', 'এখনো ছবি নেই। অনুষ্ঠানের পর যোগ করে প্রকাশ করুন।')}</p></div>`}
          <p class="mt-4 text-sm text-ink-3">${t('Faces of children are shown only with a parent’s consent. Photos are resized for the web; originals are kept in the club’s storage.', 'শিশুদের মুখ শুধু অভিভাবকের সম্মতিতে। ছবি ওয়েবের জন্য ছোট করা হয়; আসল ক্লাবের স্টোরেজে থাকে।')}</p>
        </div>
      </div>
    </div>`);
  const add = (files) => {
    const list = [...files].filter((f) => /^(image|video)\//.test(f.type));
    if (!list.length) return;
    list.forEach((f) => a.items.push({ local: URL.createObjectURL(f), kind: f.type.startsWith('video') ? 'video' : 'image', name: f.name }));
    galleryScreen();
    toast(`<i data-lucide="check-circle-2"></i>${t(`${list.length} file${list.length > 1 ? 's' : ''} added to ${a.en}.${a.status === 'draft' ? ' Publish the album to show it on the website.' : ''}`, `${list.length}টি ফাইল যোগ হয়েছে।${a.status === 'draft' ? ' ওয়েবসাইটে দেখাতে অ্যালবাম প্রকাশ করুন।' : ''}`)}`);
  };
  $('#g-files').addEventListener('change', (e) => add(e.target.files));
  const drop = $('#g-drop');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('border-sindoor'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('border-sindoor'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); add(e.dataTransfer.files); });
}
const gCur = () => gAlbums.find((x) => x.id === gSel);
const gDetails = (g) => `
  <div class="grid grid-cols-2 gap-3">${fld('Title (English)', 'শিরোনাম (ইংরেজি)', inp(`required value="${g ? g.en : ''}"`))}${fld('Title (Bengali)', 'শিরোনাম (বাংলা)', inp(`value="${g ? g.bn : ''}" lang="bn"`))}</div>
  <div class="grid grid-cols-2 gap-3">${fld('From', 'থেকে', inp(`type="date" required name="from" value="${g ? g.date : '2026-11-15'}"`))}${fld('To (optional)', 'পর্যন্ত (ঐচ্ছিক)', inp('type="date"'))}</div>
  <div class="grid grid-cols-2 gap-3">${fld('Album', 'অ্যালবাম', `<select class="field" name="album">${ALBUMS.map((x) => `<option value="${x.key}" ${g && g.album === x.key ? 'selected' : ''}>${x.en}</option>`).join('')}</select>`)}${fld('Linked event', 'যুক্ত অনুষ্ঠান', sel(['None', ...events.map((e) => e.title)]))}</div>`;
Object.assign(ACTIONS, {
  'g-new'() {
    formDrawer('New album', 'নতুন অ্যালবাম', gDetails(null) + `<label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" name="pub" />${t('Publish now (otherwise saved as a draft)', 'এখনই প্রকাশ (না হলে খসড়া)')}</label>`,
      'Create album', 'অ্যালবাম তৈরি', 'Album created. Add photos and videos to it.', 'অ্যালবাম তৈরি হয়েছে। ছবি ও ভিডিও যোগ করুন।',
      { onDone: (f) => {
        const [en, bn] = f.querySelectorAll('input:not([type])');
        const date = f.querySelector('[name=from]').value;
        const d = new Date(`${date}T00:00:00`);
        const when = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const id = `album-${Date.now()}`;
        gAlbums.push({ id, album: f.querySelector('[name=album]').value, date, en: en.value || 'New album', bn: bn.value || en.value || 'নতুন অ্যালবাম', when, whenBn: when, status: f.querySelector('[name=pub]').checked ? 'published' : 'draft', cover: 0, items: [] });
        location.hash = `gallery/${id}`;
      } });
  },
  'g-edit'() {
    const g = gCur();
    formDrawer('Album details', 'অ্যালবামের বিবরণ', gDetails(g) + `<button type="button" data-act="g-delete" class="w-full text-sm font-semibold text-sindoor hover:underline">${t('Delete this album', 'অ্যালবাম মুছুন')}</button>`,
      'Save', 'সেভ করুন', 'Album details saved.', 'বিবরণ সেভ হয়েছে।',
      { onDone: (f) => { const [en, bn] = f.querySelectorAll('input:not([type])'); g.en = en.value; g.bn = bn.value || en.value; g.album = f.querySelector('[name=album]').value; rerender(); } });
  },
  'g-delete'() {
    const g = gCur();
    formDrawer(`Delete · ${g.en}`, `মুছুন · ${g.bn}`, `<p class="text-[15px] text-ink-2">${t(`All ${g.items.length} photos and videos are removed from the website. Originals stay in the club’s storage for 30 days, then are deleted.`, `${g.items.length}টি ছবি ও ভিডিও ওয়েবসাইট থেকে সরবে। আসল ফাইল ৩০ দিন থাকবে, তারপর মুছবে।`)}</p>`,
      'Delete album', 'মুছুন', 'Album deleted.', 'অ্যালবাম মুছে ফেলা হয়েছে।',
      { danger: true, onDone: () => { gAlbums.splice(gAlbums.indexOf(g), 1); location.hash = 'gallery'; rerender(); } });
  },
  'g-publish'() {
    const g = gCur();
    g.status = g.status === 'published' ? 'draft' : 'published';
    rerender();
    toast(`<i data-lucide="${g.status === 'published' ? 'globe' : 'eye-off'}"></i>${g.status === 'published' ? t('Published. It now shows on the website gallery.', 'প্রকাশিত। ওয়েবসাইটে দেখাচ্ছে।') : t('Hidden from the website.', 'ওয়েবসাইট থেকে লুকানো হয়েছে।')}`);
  },
  'g-yt'() {
    const g = gCur();
    formDrawer('Add a YouTube video', 'ইউটিউব ভিডিও যোগ', `
      ${fld('YouTube link', 'ইউটিউব লিঙ্ক', inp('type="url" required placeholder="https://youtu.be/…"'))}
      ${fld('Caption', 'ক্যাপশন', inp('required placeholder="e.g. Dhunuchi naach on Navami night"'))}
      <p class="text-sm text-ink-2">${t('Long videos are best on the club’s YouTube channel; they play inside the website gallery.', 'বড় ভিডিও ক্লাবের ইউটিউব চ্যানেলে রাখুন; ওয়েবসাইটের গ্যালারিতেই চলবে।')}</p>`,
      'Add video', 'ভিডিও যোগ', 'Video added.', 'ভিডিও যোগ হয়েছে।',
      { onDone: (f) => { const cap = f.querySelectorAll('input')[1].value; g.items.push({ v: cap, vBn: cap, poster: (g.items.find((x) => x.p) || { p: 'pujaNight' }).p, yt: f.querySelector('input').value, dur: 'YouTube' }); rerender(); } });
  },
  'g-cover'(b) { gCur().cover = Number(b.dataset.i); rerender(); toast(`<i data-lucide="star"></i>${t('Cover photo changed.', 'প্রচ্ছদ বদলানো হয়েছে।')}`); },
  'g-caption'(b) {
    const it = gCur().items[b.dataset.i];
    formDrawer('Caption', 'ক্যাপশন', `
      <div class="aspect-video rounded-lg overflow-hidden bg-paper-2">${gThumb(it)}</div>
      ${fld('Caption (English)', 'ক্যাপশন (ইংরেজি)', inp(`value="${it.v || ''}"`))}
      ${fld('Caption (Bengali)', 'ক্যাপশন (বাংলা)', inp(`value="${it.vBn || ''}" lang="bn"`))}
      ${fld('Photo credit', 'ছবি তুলেছেন', inp('placeholder="e.g. Moumita Kar"'))}`,
      'Save', 'সেভ করুন', 'Caption saved.', 'ক্যাপশন সেভ হয়েছে।',
      { onDone: (f) => { const [en, bn] = f.querySelectorAll('input'); if (en.value) { if (gIsVideo(it)) { it.v = en.value; it.vBn = bn.value || en.value; } else it.name = en.value; } rerender(); } });
  },
  'g-remove'(b) {
    const g = gCur(); const i = Number(b.dataset.i);
    const [it] = g.items.splice(i, 1);
    if (g.cover >= g.items.length) g.cover = 0;
    rerender();
    toast(`<i data-lucide="trash-2"></i>${t('Removed from the album.', 'অ্যালবাম থেকে সরানো হয়েছে।')} <button class="underline font-semibold pointer-events-auto" id="g-undo">${t('Undo', 'ফেরান')}</button>`);
    document.getElementById('g-undo')?.addEventListener('click', () => { g.items.splice(i, 0, it); rerender(); });
  },
  'g-sub-ok'(b) {
    const s = submissions.splice(Number(b.dataset.i), 1)[0];
    const g = gAlbums.find((x) => x.id === s.album);
    g.items.push(s.v ? { v: s.v, vBn: s.vBn, poster: s.poster, dur: s.dur } : { p: s.p });
    rerender();
    toast(`<i data-lucide="check-circle-2"></i>${t(`Added to ${g.en}. ${s.from.split(' (')[0]} gets a thank-you notice.`, `${g.bn}-এ যোগ হয়েছে। পাঠানোকে ধন্যবাদ জানানো হয়েছে।`)}`);
  },
  'g-sub-no'(b) {
    const i = Number(b.dataset.i);
    formDrawer('Decline this photo', 'ছবিটি নেবেন না', `
      ${fld('Reason (sent to the member)', 'কারণ (সদস্যকে জানানো হবে)', sel(['Blurry or dark', 'Already have a similar one', 'Shows children without consent', 'Not from a club event']))}`,
      'Decline', 'নেবেন না', 'Declined. The member is told why.', 'নেওয়া হয়নি। সদস্যকে কারণ জানানো হয়েছে।',
      { danger: true, onDone: () => { submissions.splice(i, 1); rerender(); } });
  },
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
    const html = searchPages(q) + sec('Families', 'পরিবার', fams.map((f) => `<a href="#members" data-g-fam="${f.no}" class="flex items-center gap-3 px-3 py-2 hover:bg-paper-2"><i data-lucide="users" class="w-4 h-4 text-ink-3"></i><span class="font-semibold">${t(f.head, f.headBn)}</span><span class="text-sm text-ink-3 num">${f.no}</span>${f.due ? `<span class="ml-auto text-sm font-semibold">${inr(f.due)}</span>` : ''}</a>`).join(''))
      + sec('Khata', 'খাতা', recs.map((r) => `<a href="#khata/${r.book}" class="flex items-center gap-3 px-3 py-2 hover:bg-paper-2">${bookDot(r.book)}<span class="truncate">${t(r.head, r.headBn)}</span><span class="ml-auto text-sm num">${inr(r.amount)}</span></a>`).join(''))
      + sec('Catering', 'ক্যাটারিং', orders.map((o) => `<a href="#catering" class="flex items-center gap-3 px-3 py-2 hover:bg-paper-2"><i data-lucide="chef-hat" class="w-4 h-4 text-ink-3"></i><span class="font-semibold">${t(o.customer, o.customerBn)}</span><span class="text-sm text-ink-3 num">${o.id}</span></a>`).join(''));
    paint(box, html || `<p class="px-3 py-4 text-ink-3">${t(`Nothing found for “${g.value}”. Try a family number like MC-0104 or a phone number.`, `“${g.value}” পাওয়া যায়নি। MC-0104-এর মতো পরিবার নম্বর বা ফোন নম্বর দিয়ে খুঁজুন।`)}</p>`);
    box.classList.remove('hidden'); g.setAttribute('aria-expanded', 'true');
    $$('[data-g-fam]', box).forEach((a) => a.addEventListener('click', () => setTimeout(() => familyDrawer(a.dataset.gFam), 50)));
    $$('[data-g-rc]', box).forEach((a) => a.addEventListener('click', () => setTimeout(() => admin.openReceipt(a.dataset.gRc), 80)));
  };
  g.addEventListener('input', run);
  g.addEventListener('focus', run);
  g.addEventListener('blur', () => setTimeout(() => box.classList.add('hidden'), 200));
  g.addEventListener('keydown', (e) => { if (e.key === 'Escape') { g.value = ''; run(); g.blur(); } });
  document.addEventListener('keydown', (e) => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); g.focus(); } });
}

/* ---------------- Router ---------------- */
document.addEventListener('change', (e) => {
  const r = e.target.closest('[data-role-for]');
  if (r) toast(`<i data-lucide="shield-check"></i>${t(`${r.dataset.roleFor} is now ${r.value}. They see the new menus at their next sign-in.`, `${r.dataset.roleFor} এখন ${r.value}। পরের লগইনে নতুন মেনু দেখবেন।`)}`);
  const ph = e.target.closest('[data-photo-input]');
  if (ph && ph.files[0]) ph.parentElement.querySelector('[data-photo-name]').textContent = ph.files[0].name;
  const mp = e.target.closest('[data-member-photo]');
  if (mp && mp.files[0]) { const img = mp.parentElement.querySelector('img'); img.src = URL.createObjectURL(mp.files[0]); img.classList.remove('hidden'); }
});
document.addEventListener('input', (e) => {
  if (e.target.matches('[data-digits]')) e.target.value = e.target.value.replace(/\D/g, '').slice(0, +e.target.dataset.digits);
});

/* ---------------- Admin registers (console-admin.js) ---------------- */
const admin = initAdmin({
  paint, pageHead, screen, openDrawer, closeDrawer, formDrawer, fld, inp, sel, radioRow, closeBtn, proto, bookDot, bookName,
  rerender: () => rerender(),
  onRoleChange: () => {
    paintNav(); admin.paintRoleBanner();
    if (!canSee(current)) location.hash = 'dashboard'; else rerender();
  },
});
Object.assign(ACTIONS, admin.actions);

const SCREENS = { dashboard, applications: applicationsScreen, gallery: galleryScreen, members, collect, dues, khata, chanda: chandaScreen, catering, nursery, meetings, events: eventsScreen, reports, settings, profile, cards: cardsScreen, panjika: () => panjikaScreen({ paint, pageHead, screen, formDrawer, fld, inp, radioRow, logAudit }), ...admin.screens };
const show = (name, param) => (canSee(name) ? SCREENS[name]?.(param) : lockedScreen(screen(name), name));
router('dashboard', (name, param) => { current = name; currentParam = param; show(name, param); });
document.addEventListener('langchange', () => { paintNav(); show(current, currentParam); });
boot('console');
