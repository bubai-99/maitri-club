import { boot, t, inr, dn, seal, qr, router, applyLang, refreshIcons, toast, lang, setLang } from './shared.js';
import { cardFront, cardBack, fillQrs, printCards, downloadCard } from './idcard.js';
import { events, notices, club } from './data.js';
import { profile, household, store, receipts, receiptKinds, bookOf, alerts, fee, TODAY, agm } from './member-data.js';
import {
  $, $$, L, paint, fdate, fmonth, monthPlain, dayMon, addMonths, bnD, pageHead, sectionTitle, empty, skeleton, segmented, chips,
  statusChip, avatar, openSheet, closeSheet, initSheet, sheetHead, donePanel, ok, needOnline, fieldError, printDoc, imageUrl,
  notify, rerender, daysUntil,
} from './app-ui.js';
import { screens as community } from './app-community.js';
import { screens as services } from './app-services.js';
import { screens as account, initInstall, initOffline } from './app-account.js';

/* =========================================================
   Shell: sidebar (laptop), top bar, bottom tabs (phone)
   ========================================================= */
const NAV = [
  [null, [['home', 'house', 'Home', 'হোম'], ['pay', 'indian-rupee', 'Pay dues', 'চাঁদা দিন'], ['statement', 'scroll-text', 'Statement', 'হিসাব বিবরণী'], ['receipts', 'receipt-text', 'Receipts', 'রসিদ'], ['id', 'id-card', 'Member cards', 'সদস্য কার্ড']]],
  [['Club', 'ক্লাব'], [['events', 'calendar-days', 'Events & passes', 'অনুষ্ঠান ও পাস'], ['notices', 'megaphone', 'Notices', 'নোটিস'], ['polls', 'vote', 'AGM & polls', 'সাধারণ সভা ও ভোট'], ['docs', 'folder-open', 'Documents', 'ডকুমেন্টস']]],
  [['Services', 'পরিষেবা'], [['catering', 'utensils-crossed', 'Maitree Serving', 'মৈত্রী পরিবেশন'], ['nursery', 'sprout', 'Nursery', 'নার্সারি']]],
  [['Account', 'অ্যাকাউন্ট'], [['profile', 'users', 'Family & profile', 'পরিবার ও প্রোফাইল'], ['alerts', 'bell', 'Notifications', 'নোটিফিকেশন'], ['help', 'life-buoy', 'Help & contact', 'সাহায্য ও যোগাযোগ'], ['settings', 'settings', 'Settings', 'সেটিংস']]],
];
const TABS = [['home', 'house', 'Home', 'হোম'], ['pay', 'indian-rupee', 'Pay', 'চাঁদা'], ['id', 'id-card', 'Card', 'কার্ড'], ['events', 'calendar-days', 'Events', 'অনুষ্ঠান'], ['more', 'layout-grid', 'More', 'আরও']];
const PARENT = { event: 'events', notice: 'notices', receipt: 'receipts' };
const TITLES = Object.fromEntries(NAV.flatMap(([, items]) => items.map(([k, , en, bn]) => [k, [en, bn]])));
Object.assign(TITLES, { event: ['Event', 'অনুষ্ঠান'], notice: ['Notice', 'নোটিস'], receipt: ['Receipt', 'রসিদ'], more: ['More', 'আরও'] });

const unread = () => alerts.filter((a) => a.unread).length;
const dueTotal = () => store.dues.length * fee;

function badge(k) {
  if (k === 'alerts' && unread()) return `<span class="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-sindoor text-white text-[11.5px] font-bold grid place-items-center num">${lang === 'bn' ? bnD(unread()) : unread()}</span>`;
  if (k === 'pay' && store.dues.length && !store.pending) return `<span class="ml-auto text-[12.5px] font-semibold text-sindoor-deep">${inr(dueTotal())}</span>`;
  if (k === 'pay' && store.pending) return `<span class="ml-auto w-2 h-2 rounded-full bg-marigold" aria-hidden="true"></span>`;
  if (k === 'polls' && !store.ballot) return `<span class="ml-auto chip h-5 px-1.5 text-[11px] bg-marigold-wash text-turmeric">${t('Vote', 'ভোট')}</span>`;
  return '';
}

function renderChrome() {
  paint('#side-nav', NAV.map(([group, items]) => `
    ${group ? `<p class="px-3 mt-5 mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-ink-3">${t(...group)}</p>` : ''}
    <ul class="space-y-0.5">${items.map(([k, icon, en, bn]) => `
      <li><a href="#${k}" data-nav="${k}" class="flex items-center gap-3 h-10 px-3 rounded-md text-ink-2 hover:bg-paper-2 hover:text-ink aria-[current=page]:bg-sindoor-wash aria-[current=page]:text-sindoor-deep aria-[current=page]:font-semibold">
        <i data-lucide="${icon}" class="w-[18px] h-[18px] shrink-0"></i><span class="truncate">${t(en, bn)}</span>${badge(k)}</a></li>`).join('')}
    </ul>`).join(''));
  paint('#side-me', `${avatar(profile, 'w-10 h-10 text-base', 'bg-ink text-white')}
    <span class="min-w-0 flex-1 leading-tight"><span class="block font-semibold truncate">${t(profile.name, profile.nameBn)}</span><span class="block text-[13px] text-ink-3 num">${profile.family} · ${t('Head of family', 'পরিবারের প্রধান')}</span></span>
    <i data-lucide="chevron-right" class="w-4 h-4 text-ink-3"></i>`);
  paint('#tabbar', `<div class="grid grid-cols-5 max-w-xl mx-auto">${TABS.map(([k, icon, en, bn]) => `
    <a href="#${k}" data-nav="${k}" class="relative flex flex-col items-center gap-0.5 pt-2 pb-2.5 text-[11.5px] font-medium text-ink-3 aria-[current=page]:text-sindoor">
      <span class="relative"><i data-lucide="${icon}" class="w-6 h-6"></i>${k === 'more' && unread() ? '<span class="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-sindoor border-2 border-paper"></span>' : ''}${k === 'pay' && store.dues.length && !store.pending ? '<span class="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-sindoor border-2 border-paper"></span>' : ''}</span>
      <span>${t(en, bn)}</span></a>`).join('')}</div>`);
  paint('#top-me', avatar(profile, 'w-8 h-8 text-sm', 'bg-ink text-white'));
  $('#top-me').setAttribute('aria-label', L('Family & profile', 'পরিবার ও প্রোফাইল'));
  $('#top-help').setAttribute('aria-label', L('Help & contact', 'সাহায্য ও যোগাযোগ'));
  const n = unread();
  $('#bell-count').textContent = n ? (lang === 'bn' ? bnD(n) : n) : '';
  $('#bell-count').classList.toggle('hidden', !n);
  $('#top-bell').setAttribute('aria-label', n ? L(`Notifications, ${n} unread`, `নোটিফিকেশন, ${bnD(n)}টি না-পড়া`) : L('Notifications', 'নোটিফিকেশন'));
  paint('#top-greet', `${t('Namaskar', 'নমস্কার')}, <span class="font-semibold text-ink">${t(profile.name.split(' ')[0], profile.nameBn.split(' ')[0])}</span> · ${fdate(TODAY, { day: true })}`);
  markNav();
}

let current = 'home';
let currentParam;
function markNav() {
  const active = PARENT[current] || current;
  const tabKeys = TABS.map((x) => x[0]);
  $$('#side-nav [data-nav]').forEach((a) => (a.dataset.nav === active ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  $$('#tabbar [data-nav]').forEach((a) => {
    const on = tabKeys.includes(active) ? a.dataset.nav === active : a.dataset.nav === 'more';
    on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
  const [en, bn] = TITLES[current] || TITLES.home;
  document.title = `${L(en, bn)} · ${L('Gede Maitree Club', 'গেদে মৈত্রী ক্লাব')}`;
}

/* =========================================================
   HOME
   ========================================================= */
const upcoming = () => events.filter((e) => e.date >= TODAY);

function duesCard() {
  if (store.pending) {
    const p = store.pending;
    return `
    <div class="rounded-lg border-2 border-marigold bg-marigold-wash/60 p-5">
      <div class="flex items-start gap-3">
        <span class="w-11 h-11 rounded-full bg-white grid place-items-center shrink-0"><i data-lucide="hourglass" class="w-5 h-5 text-turmeric"></i></span>
        <div class="min-w-0">
          <p class="font-semibold">${t('Payment sent, waiting for the treasurer', 'টাকা পাঠানো হয়েছে, কোষাধ্যক্ষের যাচাইয়ের অপেক্ষা')}</p>
          <p class="text-[15px] text-ink-2 mt-0.5">${inr(p.amount)} · ${p.months.map((m) => fmonth(m, { short: true })).join(', ')} · UTR <span class="num">${dn(p.utr)}</span></p>
          <p class="text-sm text-ink-2 mt-1">${t('Usually confirmed the same evening. You’ll get a notification.', 'সাধারণত সেদিন সন্ধ্যাতেই যাচাই হয়। নোটিফিকেশন পাবেন।')}</p>
        </div>
      </div>
      <button type="button" class="btn btn-line btn-sm mt-4 bg-white" data-confirm-pending><i data-lucide="wand-sparkles"></i>${t('Prototype: treasurer confirms', 'প্রোটোটাইপ: কোষাধ্যক্ষ যাচাই করলেন')}</button>
    </div>`;
  }
  if (!store.dues.length) {
    const lastPaid = receipts.filter((r) => r.kind === 'sub').flatMap((r) => r.months).sort().pop();
    return `
    <div class="rounded-lg bg-tulsi text-white p-5 relative overflow-hidden">
      <div class="absolute -right-10 -top-12 opacity-15 pointer-events-none" aria-hidden="true">${seal({ size: 150, color: '#fff', rotate: 10 })}</div>
      <p class="relative text-[15px] flex items-center gap-1.5"><i data-lucide="badge-check" class="w-5 h-5"></i>${t('All paid up', 'সব চাঁদা দেওয়া আছে')}</p>
      <p class="relative font-display text-[2.2rem] leading-tight mt-1">${t('Up to', 'পর্যন্ত:')} ${fmonth(lastPaid)}</p>
      <p class="relative text-[15px] mt-1 text-white/90">${t('Thank you. Your next month is due on the 1st.', 'ধন্যবাদ। পরের মাসের চাঁদা ১ তারিখে।')}</p>
      <div class="relative mt-5 flex flex-wrap gap-2">
        <a href="#pay" class="btn bg-white text-tulsi hover:bg-paper">${t('Pay ahead', 'অগ্রিম দিন')}</a>
        <a href="#statement" class="btn border border-white/40 text-white hover:bg-white/10">${t('Statement', 'বিবরণী')}</a>
      </div>
    </div>`;
  }
  return `
    <div class="rounded-lg bg-sindoor text-white p-5 lg:p-6 relative overflow-hidden">
      <div class="absolute -right-10 -top-12 opacity-15 pointer-events-none" aria-hidden="true">${seal({ size: 160, color: '#fff', rotate: 10 })}</div>
      <p class="relative text-[15px]">${t('Your dues', 'আপনার বকেয়া')}</p>
      <p class="relative font-display text-[3rem] leading-none mt-1">${inr(dueTotal())}</p>
      <p class="relative text-[15px] mt-2">${store.dues.map((m) => fmonth(m)).join(' · ')} · ${t('Family', 'পরিবার')} <span class="num">${profile.family}</span></p>
      <div class="relative mt-5 flex flex-wrap gap-2">
        <a href="#pay" class="btn bg-white text-sindoor-deep hover:bg-paper flex-1 sm:flex-none sm:px-6"><i data-lucide="smartphone"></i>${t('Pay by UPI', 'ইউপিআই-এ দিন')}</a>
        <a href="#pay/cash" class="btn border border-white/40 text-white hover:bg-white/10">${t('I’ll pay cash', 'নগদে দেব')}</a>
        <a href="#statement" class="btn text-white hover:bg-white/10 hidden sm:inline-flex">${t('Statement', 'বিবরণী')}</a>
      </div>
    </div>`;
}

function confirmPending() {
  const p = store.pending;
  if (!p) return;
  const no = `MC-26-0${store.nextReceipt++}`;
  receipts.unshift({ no, date: TODAY, amount: p.amount, mode: 'upi', kind: 'sub', months: p.months, by: 'Tapas Mondal', byBn: 'তাপস মণ্ডল', utr: p.utr });
  store.dues = store.dues.filter((m) => !p.months.includes(m));
  store.pending = null;
  paySel = new Set(store.dues);
  alerts.unshift({ icon: 'receipt-text', en: `Receipt ${no} · ₹${p.amount} received by UPI`, bn: `রসিদ ${no} · ইউপিআই-এ ₹${bnD(p.amount)} পাওয়া গেছে`, date: TODAY, unread: true, href: `#receipt/${no}` });
  toast(`<i data-lucide="receipt-text" class="w-5 h-5 shrink-0"></i><span>${t(`Confirmed. Receipt ${no} is ready.`, `যাচাই হয়েছে। রসিদ ${no} তৈরি।`)}</span>`);
  notify(); rerender();
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-confirm-pending]')) confirmPending(); });

function renderHome() {
  const first = profile.name.split(' ')[0];
  const next = upcoming().slice(0, 3);
  const needsPhoto = household.filter((p) => !p.photo && !p.photoUrl);
  const actions = [
    ['#id', 'id-card', 'Member cards', 'সদস্য কার্ড', 'text-sindoor'],
    ['#events/passes', 'ticket', 'My passes', 'আমার পাস', 'text-sindoor'],
    ['#statement', 'scroll-text', 'Statement', 'বিবরণী', 'text-ink'],
    ['#polls', 'vote', 'AGM vote', 'সভার ভোট', 'text-ink'],
    ['#catering', 'utensils-crossed', 'Book serving', 'পরিবেশন বুকিং', 'text-turmeric'],
    ['#nursery', 'sprout', 'Nursery', 'নার্সারি', 'text-tulsi'],
    ['#docs', 'folder-open', 'Documents', 'ডকুমেন্টস', 'text-ink'],
    ['#help', 'life-buoy', 'Help', 'সাহায্য', 'text-ink'],
  ];
  const latest = notices.slice(0, 3);
  const standalone = matchMedia('(display-mode: standalone)').matches;
  paint('#s-home', `
    <div class="flex items-center gap-3 mb-5">
      <div class="min-w-0">
        <p class="text-sm text-ink-3">${fdate(TODAY, { day: true })}</p>
        <h1 class="font-display text-[1.7rem] lg:text-[2.3rem] leading-tight">${t(`Namaskar, ${first}`, `নমস্কার, ${profile.nameBn.split(' ')[0]}`)}</h1>
        <p class="text-[15px] text-ink-2">${t('Family', 'পরিবার')} <span class="num">${profile.family}</span> · ${t(`member since ${profile.since}`, `${bnD(profile.since)} থেকে সদস্য`)}</p>
      </div>
    </div>

    <div class="grid gap-4 lg:gap-6 lg:grid-cols-3 items-start">
      <div class="lg:col-span-2 space-y-4 lg:space-y-6 min-w-0">
        ${duesCard()}

        ${!store.installDismissed && !standalone ? `
        <div class="rounded-lg border border-rule bg-card p-4 flex items-center gap-3" id="install-card">
          <span class="w-11 h-11 rounded-lg bg-paper-2 grid place-items-center shrink-0">${seal({ size: 34, rotate: -6 })}</span>
          <div class="min-w-0 flex-1"><p class="font-semibold leading-tight">${t('Install the club app', 'ক্লাবের অ্যাপ ইনস্টল করুন')}</p><p class="text-sm text-ink-2">${t('Opens from your home screen. Cards work offline at the gate.', 'হোম স্ক্রিন থেকে খুলবে। গেটে অফলাইনেও কার্ড চলবে।')}</p></div>
          <button type="button" class="btn btn-ink btn-sm" data-install>${t('Install', 'ইনস্টল')}</button>
          <button type="button" class="w-9 h-9 grid place-items-center rounded-full hover:bg-paper-2 -mr-1 shrink-0" data-install-dismiss aria-label="${L('Not now', 'এখন নয়')}"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>` : ''}

        <nav aria-label="${L('Shortcuts', 'শর্টকাট')}">
          <ul class="grid grid-cols-4 gap-2 text-center text-[12.5px] sm:text-[13.5px] font-medium">
            ${actions.map(([href, icon, en, bn, c]) => `<li><a href="${href}" class="flex flex-col items-center justify-center h-full rounded-lg bg-card border border-rule py-3 px-1 hover:border-ink/30 transition-colors"><i data-lucide="${icon}" class="w-6 h-6 ${c}"></i><span class="block mt-1.5 leading-tight">${t(en, bn)}</span></a></li>`).join('')}
          </ul>
        </nav>

        <div class="rounded-lg bg-card border border-rule p-4 lg:p-5">
          <div class="flex items-baseline justify-between"><h2 class="font-display text-xl">${t('Notice board', 'নোটিস বোর্ড')}</h2><a href="#notices" class="text-sm font-semibold text-sindoor hover:underline">${t('See all', 'সব দেখুন')}</a></div>
          <ul class="mt-1 divide-y divide-rule">
            ${latest.map((n) => `<li><a href="#notice/${n.id}" class="flex gap-3 py-3.5 group">
              <span class="mt-2 w-2 h-2 rounded-full shrink-0 ${store.readNotices.has(n.id) ? 'bg-transparent' : 'bg-sindoor'}" aria-hidden="true"></span>
              <span class="min-w-0 flex-1"><span class="flex items-center gap-2 text-[12.5px]">${n.pinned ? '<i data-lucide="pin" class="w-3.5 h-3.5 text-sindoor"></i>' : ''}<span class="font-semibold text-sindoor">${t(n.tag, n.tagBn)}</span><span class="text-ink-3">${dn(n.date)}</span></span>
              <span class="block font-semibold mt-0.5 leading-snug group-hover:underline">${t(n.title, n.titleBn)}</span>
              <span class="block text-[15px] text-ink-2 mt-0.5 leading-snug line-clamp-2">${t(n.body, n.bodyBn)}</span></span>
            </a></li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="space-y-4 lg:space-y-6 min-w-0">
        ${next[0] ? (() => { const e = next.find((x) => x.id === 'sports') || next[0]; const dm = dayMon(e.date); const left = daysUntil(e.date); return `
        <a href="#event/${e.id}" class="flex items-center gap-4 rounded-lg bg-marigold p-4 hover:brightness-[.98]">
          <div class="text-center w-14 shrink-0 leading-none"><div class="font-display text-3xl">${dn(dm.d)}</div><div class="text-[12px] font-semibold mt-1">${t(dm.en, dm.bn)}</div></div>
          <div class="min-w-0">
            <p class="font-display text-xl leading-tight">${t(e.title, e.titleBn)}</p>
            <p class="text-sm text-ink">${store.eventRegs[e.id] ? t('You’re registered · pass ready', 'নাম দেওয়া হয়েছে · পাস তৈরি') : t(`In ${left} days · get your family pass`, `আর ${bnD(left)} দিন · পরিবারের পাস নিন`)}</p>
          </div>
          <i data-lucide="chevron-right" class="ml-auto w-5 h-5 shrink-0"></i>
        </a>`; })() : ''}

        ${store.ballot ? `
        <a href="#polls" class="flex items-center gap-3 rounded-lg border border-rule bg-card p-4 hover:border-ink/30">
          <span class="w-10 h-10 rounded-full bg-tulsi-wash text-tulsi grid place-items-center shrink-0"><i data-lucide="check" class="w-5 h-5"></i></span>
          <span class="min-w-0"><span class="block font-semibold">${t('Your AGM ballot is in', 'সাধারণ সভার ব্যালট জমা হয়েছে')}</span><span class="block text-sm text-ink-2">${t('Results are read out at the AGM on', 'ফল ঘোষণা সাধারণ সভায়,')} ${fdate(agm.date, { year: false })}</span></span>
        </a>` : `
        <div class="rounded-lg border-2 border-ink bg-card p-4">
          <p class="text-[12.5px] font-semibold text-sindoor flex items-center gap-1.5"><i data-lucide="vote" class="w-4 h-4"></i>${t('AGM 2026 · ballot open', 'সাধারণ সভা ২০২৬ · ব্যালট খোলা')}</p>
          <p class="font-display text-xl mt-1 leading-snug">${t('Three resolutions need your household’s vote', 'তিনটি প্রস্তাবে আপনার পরিবারের ভোট দরকার')}</p>
          <p class="text-sm text-ink-2 mt-1">${t('Vote in the app before', 'অ্যাপে ভোট দিন')} ${t(...agm.closes)}</p>
          <a href="#polls" class="btn btn-ink w-full mt-3">${t('Vote now', 'এখনই ভোট দিন')}</a>
        </div>`}

        <div class="rounded-lg border border-rule bg-card p-4">
          <div class="flex items-baseline justify-between"><h2 class="font-display text-xl">${t('Coming up', 'আসছে')}</h2><a href="#events" class="text-sm font-semibold text-sindoor hover:underline">${t('All events', 'সব অনুষ্ঠান')}</a></div>
          <ul class="mt-1 divide-y divide-rule">
            ${next.map((e) => { const dm = dayMon(e.date); return `<li><a href="#event/${e.id}" class="flex items-center gap-3 py-3 group">
              <span class="w-10 text-center leading-none text-sindoor shrink-0"><span class="block font-display text-2xl">${dn(dm.d)}</span><span class="block text-[11px] font-semibold mt-0.5">${t(dm.en, dm.bn)}</span></span>
              <span class="min-w-0 flex-1"><span class="block font-semibold leading-tight group-hover:underline">${t(e.title, e.titleBn)}</span><span class="block text-sm text-ink-3">${t(e.place, e.placeBn)}</span></span>
              ${store.eventRegs[e.id] ? statusChip('ok', 'Going', 'যাচ্ছি', 'check') : ''}
            </a></li>`; }).join('')}
          </ul>
        </div>

        <a href="#id" class="block rounded-lg border border-rule bg-card p-4 hover:border-ink/30">
          <div class="flex items-center justify-between"><h2 class="font-display text-xl">${t('Your family', 'আপনার পরিবার')}</h2><i data-lucide="chevron-right" class="w-4 h-4 text-ink-3"></i></div>
          <div class="mt-3 flex -space-x-2">${household.map((p, i) => `<span class="ring-2 ring-card rounded-full">${avatar(p, 'w-10 h-10 text-base', i ? 'bg-paper-2 text-ink' : 'bg-ink text-white')}</span>`).join('')}</div>
          <p class="text-sm text-ink-2 mt-2">${t(`${household.length} member cards`, `${bnD(household.length)}টি সদস্য কার্ড`)}${needsPhoto.length ? ` · <span class="text-sindoor-deep font-semibold">${t(`${needsPhoto[0].name.split(' ')[0]}’s card needs a photo`, `${needsPhoto[0].nameBn.split(' ')[0]}-এর কার্ডে ছবি লাগবে`)}</span>` : ''}</p>
        </a>
      </div>
    </div>`);
  $('[data-install-dismiss]')?.addEventListener('click', () => { store.installDismissed = true; $('#install-card').remove(); ok('Okay. You can install it any time from Settings.', 'ঠিক আছে। সেটিংস থেকে যেকোনো সময় ইনস্টল করা যাবে।', 'info'); });
}

/* =========================================================
   PAY
   ========================================================= */
let paySel = new Set(store.dues);
let payMethod = 'upi';

function payMonths() {
  const lastKnown = [...store.dues, ...receipts.filter((r) => r.kind === 'sub').flatMap((r) => r.months)].sort().pop();
  const ahead = Array.from({ length: Math.max(4, 12 - store.dues.length) }, (_, i) => addMonths(lastKnown, i + 1));
  return [...store.dues.map((m) => ({ m, due: true })), ...ahead.map((m) => ({ m, due: false }))];
}

function renderPay(param) {
  if (param === 'cash') payMethod = 'cash';
  const list = payMonths();
  [...paySel].forEach((m) => { if (!list.some((x) => x.m === m)) paySel.delete(m); });
  const sel = list.filter((x) => paySel.has(x.m)).map((x) => x.m);
  const free = Math.floor(sel.length / 12) * fee; // yearly plan: 12 months for the price of 11 (₹1,100)
  const sum = sel.length * fee - free;
  const note = `${profile.family} ${sel.map(monthPlain).join(', ')}`;
  const uri = `upi://pay?pa=${club.upi}&pn=Gede%20Maitree%20Club&am=${sum}&cu=INR&tn=${encodeURIComponent(note)}`;
  const presets = [
    ['dues', 'Dues only', 'শুধু বকেয়া', store.dues],
    ['q', 'Dues + 3 months', 'বকেয়া + ৩ মাস', list.slice(0, store.dues.length + 3).map((x) => x.m)],
    ['fy', 'Up to March', 'মার্চ পর্যন্ত', list.filter((x) => x.m <= '2027-03').map((x) => x.m)],
    ['yr', 'Full year · ₹1,100', 'পুরো বছর · ₹১,১০০', list.slice(0, 12).map((x) => x.m)],
  ];
  paint('#s-pay', `
    ${pageHead({ en: 'Pay subscription', bn: 'চাঁদা দিন', subEn: `₹${fee} a month covers your whole household, or ₹1,100 for a full year (one month free). Pay what’s due, or ahead.`, subBn: `মাসে ₹${bnD(fee)}-তে পুরো পরিবার। বকেয়া দিন, বা কয়েক মাস অগ্রিম।`, actions: `<a href="#statement" class="btn btn-line btn-sm"><i data-lucide="scroll-text"></i>${t('Statement', 'বিবরণী')}</a>` })}

    ${store.pending ? `<div class="mt-5">${duesCard()}</div>` : ''}

    <div class="mt-5 grid gap-5 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_400px] items-start">
      <div class="min-w-0">
        <div class="flex items-center gap-2"><span class="w-6 h-6 rounded-full bg-ink text-white text-[13px] font-bold grid place-items-center num">${dn(1)}</span><h2 class="font-semibold">${t('Choose months', 'মাস বেছে নিন')}</h2></div>
        <div class="mt-3 flex flex-wrap gap-2">${presets.map(([k, en, bn, ms]) => `<button type="button" data-preset="${k}" class="chip h-9 px-3.5 text-sm border border-rule bg-card hover:border-ink/40 aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink" aria-pressed="${ms.length === sel.length && ms.every((m) => paySel.has(m))}">${t(en, bn)}</button>`).join('')}</div>
        <fieldset class="mt-3">
          <legend class="sr-only">${t('Months', 'মাস')}</legend>
          <ul class="rounded-lg border border-rule bg-card divide-y divide-rule" id="month-list">
            ${list.map((x) => `<li><label class="flex items-center gap-3 px-4 h-14 cursor-pointer hover:bg-paper-2/50">
              <input type="checkbox" value="${x.m}" ${paySel.has(x.m) ? 'checked' : ''} ${store.pending?.months.includes(x.m) ? 'disabled' : ''} class="w-5 h-5 accent-[#d21f1b]" />
              <span class="flex-1">${fmonth(x.m)}</span>
              ${store.pending?.months.includes(x.m) ? statusChip('wait', 'Awaiting check', 'যাচাই বাকি') : x.due ? statusChip('due', 'Due', 'বকেয়া') : `<span class="text-sm text-ink-3">${t('advance', 'অগ্রিম')}</span>`}
              <span class="font-semibold w-14 text-right">${inr(fee)}</span>
            </label></li>`).join('')}
          </ul>
        </fieldset>
        <div class="mt-3 flex items-center justify-between rounded-lg bg-paper-2 px-4 h-12 text-[15px]">
          <span class="text-ink-2">${t(`${sel.length} month${sel.length === 1 ? '' : 's'} × ₹${fee}`, `${bnD(sel.length)} মাস × ₹${bnD(fee)}`)}</span>
          <span class="font-semibold">${inr(sum)}</span>
        </div>
        ${free ? `<p class="mt-2 text-sm text-tulsi font-medium flex items-center gap-1.5"><i data-lucide="gift" class="w-4 h-4"></i>${t(`Yearly plan: ${inr(free)} off, one month free`, `বার্ষিক প্ল্যান: ${inr(free)} ছাড়, এক মাস বিনামূল্যে`)}</p>` : sel.length >= 9 ? `<p class="mt-2 text-sm text-ink-3">${t(`Choose ${12 - sel.length} more for a full year and get one month free.`, `আরও ${bnD(12 - sel.length)} মাস বাছলে পুরো বছর, এক মাস বিনামূল্যে।`)}</p>` : ''}
      </div>

      <div class="min-w-0 lg:sticky lg:top-24">
        <div class="flex items-center gap-2"><span class="w-6 h-6 rounded-full bg-ink text-white text-[13px] font-bold grid place-items-center num">${dn(2)}</span><h2 class="font-semibold">${t('Pay', 'টাকা দিন')}</h2></div>
        <div class="mt-3">${segmented([['upi', 'UPI', 'ইউপিআই'], ['cash', 'Cash at the club', 'ক্লাবে নগদ']], payMethod, 'data-method', L('Payment method', 'পেমেন্টের মাধ্যম'))}</div>
        ${payMethod === 'upi' ? `
        <div class="mt-3 rounded-lg bg-card border border-rule p-5 text-center">
          <p class="text-sm text-ink-2">${t('To pay', 'মোট')}</p>
          <p class="font-display text-[2.6rem] leading-none mt-1">${inr(sum)}</p>
          <a href="${sum ? uri : '#pay'}" class="btn btn-primary w-full h-12 mt-4 lg:hidden ${sum ? '' : 'pointer-events-none opacity-45'}" ${sum ? '' : 'aria-disabled="true"'}><i data-lucide="smartphone"></i>${t('Pay with your UPI app', 'ইউপিআই অ্যাপে দিন')}</a>
          <div class="mt-4 ${sum ? '' : 'opacity-30'}">
            <p class="text-sm text-ink-2 mb-2 hidden lg:block">${t('Scan with any UPI app on your phone', 'ফোনের যেকোনো ইউপিআই অ্যাপে স্ক্যান করুন')}</p>
            <details class="group" ${matchMedia('(min-width:1024px)').matches ? 'open' : ''}>
              <summary class="cursor-pointer text-sm font-semibold text-ink-2 flex items-center justify-center gap-1.5 list-none [&::-webkit-details-marker]:hidden lg:hidden"><i data-lucide="qr-code" class="w-4 h-4"></i>${t('Paying from another phone? Show QR', 'অন্য ফোন থেকে দেবেন? QR দেখুন')}</summary>
              <div class="w-44 h-44 mx-auto mt-3 lg:mt-0" id="upi-qr" role="img" aria-label="${L('UPI QR code', 'ইউপিআই QR কোড')}"></div>
            </details>
            <button type="button" class="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink" id="copy-upi"><span class="num">${club.upi}</span><i data-lucide="copy" class="w-3.5 h-3.5"></i><span class="sr-only">${t('Copy UPI ID', 'ইউপিআই আইডি কপি')}</span></button>
          </div>
        </div>
        <form id="utr-form" class="mt-4" novalidate>
          <div class="flex items-center gap-2 mb-2"><span class="w-6 h-6 rounded-full bg-ink text-white text-[13px] font-bold grid place-items-center num">${dn(3)}</span><label for="utr" class="font-semibold">${t('Enter the UTR', 'UTR লিখুন')}</label></div>
          <div data-field>
            <div class="flex gap-2">
              <input id="utr" class="field num tracking-wider" inputmode="numeric" maxlength="12" placeholder="412356789012" autocomplete="off" aria-describedby="utr-hint" />
              <button type="button" id="paste-utr" class="btn btn-line shrink-0 px-3" aria-label="${L('Paste UTR', 'UTR পেস্ট করুন')}"><i data-lucide="clipboard-paste"></i></button>
            </div>
          </div>
          <p class="text-sm text-ink-3 mt-2" id="utr-hint">${t('The 12-digit number on your UPI app’s receipt. Treasurer Tapas Mondal checks it and your receipt arrives here.', 'ইউপিআই অ্যাপের রসিদে থাকা ১২ সংখ্যার নম্বর। কোষাধ্যক্ষ তাপস মণ্ডল যাচাই করলে রসিদ এখানে আসবে।')}</p>
          <button class="btn btn-ink w-full h-12 mt-3" ${sum && !store.pending ? '' : 'disabled'}>${t('Send for confirmation', 'যাচাইয়ের জন্য পাঠান')}</button>
          ${store.pending ? `<p class="text-sm text-ink-2 mt-2">${t('One payment is already waiting for the treasurer.', 'একটি পেমেন্ট ইতিমধ্যে যাচাইয়ের অপেক্ষায়।')}</p>` : ''}
        </form>` : `
        <div class="mt-3 rounded-lg bg-card border border-rule p-5">
          <p class="font-display text-2xl">${inr(sum)} ${t('in cash', 'নগদে')}</p>
          <p class="text-[15px] text-ink-2 mt-2 leading-relaxed">${t('Give it to treasurer Tapas Mondal at the club room, 6–9 pm on any evening. He records it on the spot and the receipt appears in this app; no paper slip needed.', 'যেকোনো সন্ধ্যা ৬–৯টায় ক্লাব ঘরে কোষাধ্যক্ষ তাপস মণ্ডলকে দিন। উনি সঙ্গে সঙ্গে জমা নেবেন, রসিদ এই অ্যাপে আসবে; কাগজের রসিদ লাগবে না।')}</p>
          <dl class="mt-4 text-[15px] divide-y divide-rule border-y border-rule">
            <div class="flex justify-between py-2.5"><dt class="text-ink-3">${t('Where', 'কোথায়')}</dt><dd class="text-right">${t('Club room, 14/2 Netaji Subhas Road', 'ক্লাব ঘর, ১৪/২ নেতাজি সুভাষ রোড')}</dd></div>
            <div class="flex justify-between py-2.5"><dt class="text-ink-3">${t('When', 'কখন')}</dt><dd>${t('Every day, 6–9 pm', 'প্রতিদিন, সন্ধ্যা ৬–৯টা')}</dd></div>
          </dl>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <a href="tel:+919830021456" class="btn btn-line"><i data-lucide="phone"></i>${t('Call Tapas-da', 'তাপস-দাকে ফোন')}</a>
            <button type="button" class="btn btn-ink" id="cash-coming" ${sum ? '' : 'disabled'}>${t('Tell him I’m coming', 'জানিয়ে দিন আসছি')}</button>
          </div>
        </div>`}
      </div>
    </div>`);

  if (payMethod === 'upi' && $('#upi-qr')) qr($('#upi-qr'), uri);
  $$('#month-list input').forEach((c) => c.addEventListener('change', () => { c.checked ? paySel.add(c.value) : paySel.delete(c.value); renderPay(); }));
  $$('[data-preset]').forEach((b) => b.addEventListener('click', () => { paySel = new Set(presets.find((p) => p[0] === b.dataset.preset)[3]); renderPay(); }));
  $$('[data-method]').forEach((b) => b.addEventListener('click', () => { payMethod = b.dataset.method; history.replaceState(null, '', payMethod === 'cash' ? '#pay/cash' : '#pay'); renderPay(); }));
  $('#copy-upi')?.addEventListener('click', async () => { try { await navigator.clipboard.writeText(club.upi); } catch { /* ignore */ } ok('UPI ID copied', 'ইউপিআই আইডি কপি হয়েছে', 'copy'); });
  $('#cash-coming')?.addEventListener('click', () => {
    if (!needOnline()) return;
    ok(`Tapas-da knows to expect ₹${sum} from you this evening.`, `তাপস-দাকে জানানো হয়েছে, আজ সন্ধ্যায় আপনি ₹${bnD(sum)} দেবেন।`, 'send');
  });
  const utr = $('#utr');
  if (utr) {
    utr.addEventListener('input', () => { utr.value = utr.value.replace(/\D/g, '').slice(0, 12); });
    $('#paste-utr').addEventListener('click', async () => { try { utr.value = (await navigator.clipboard.readText()).replace(/\D/g, '').slice(0, 12); } catch { utr.focus(); } });
    $('#utr-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!/^\d{12}$/.test(utr.value)) return fieldError(utr, 'A UTR has exactly 12 digits. Copy it from your UPI app’s receipt.', 'UTR-এ ঠিক ১২টি সংখ্যা থাকে। ইউপিআই অ্যাপের রসিদ থেকে কপি করুন।');
      if (receipts.some((r) => r.utr === utr.value)) return fieldError(utr, 'This UTR is already on one of your receipts.', 'এই UTR আগের একটি রসিদে আছে।');
      if (!needOnline()) return;
      store.pending = { utr: utr.value, amount: sum, months: sel, at: TODAY };
      alerts.unshift({ icon: 'hourglass', en: `UPI payment of ₹${sum} sent for confirmation`, bn: `₹${bnD(sum)} ইউপিআই পেমেন্ট যাচাইয়ের জন্য পাঠানো হয়েছে`, date: TODAY, unread: false, href: '#pay' });
      notify(); renderPay();
      openSheet(donePanel({ icon: 'hourglass', tone: 'wait', en: 'Waiting for the treasurer', bn: 'কোষাধ্যক্ষের যাচাইয়ের অপেক্ষায়', subEn: 'We sent your UTR to Tapas Mondal. You’ll get a notification and a stamped receipt once he confirms, usually the same evening.', subBn: 'আপনার UTR তাপস মণ্ডলকে পাঠানো হয়েছে। যাচাই হলেই নোটিফিকেশন ও রসিদ পাবেন, সাধারণত সেদিন সন্ধ্যাতেই।', ref: `UTR ${utr.value}` }));
    });
  }
}

/* =========================================================
   STATEMENT
   ========================================================= */
let fy = 2026;
let fyLoading = false;
const fyMonths = (y) => Array.from({ length: 12 }, (_, i) => addMonths(`${y}-04`, i));
const paidMap = () => Object.fromEntries(receipts.filter((r) => r.kind === 'sub').flatMap((r) => r.months.map((m) => [m, r])));

function statementRows(y) {
  const paid = paidMap();
  return fyMonths(y).map((m) => {
    if (paid[m]) return { m, s: 'paid', r: paid[m] };
    if (store.pending?.months.includes(m)) return { m, s: 'wait' };
    if (store.dues.includes(m)) return { m, s: 'due' };
    return { m, s: m > TODAY.slice(0, 7) ? 'next' : 'due' };
  });
}
const sLabel = { paid: ['Paid', 'দেওয়া'], due: ['Due', 'বকেয়া'], wait: ['Checking', 'যাচাই চলছে'], next: ['Upcoming', 'আসন্ন'] };
const sTone = { paid: 'bg-tulsi-wash text-tulsi border-tulsi/20', due: 'bg-sindoor-wash text-sindoor-deep border-sindoor/30', wait: 'bg-marigold-wash text-turmeric border-marigold/40', next: 'bg-card text-ink-3 border-rule border-dashed' };

function renderStatement() {
  const rows = statementRows(fy);
  const paidN = rows.filter((r) => r.s === 'paid').length;
  const dueN = rows.filter((r) => r.s === 'due').length;
  const nextN = rows.filter((r) => r.s === 'next').length;
  const recs = [...new Set(rows.filter((r) => r.r).map((r) => r.r))];
  paint('#s-statement', `
    ${pageHead({ en: 'Statement', bn: 'হিসাব বিবরণী', subEn: `Subscription for family ${profile.family}, month by month.`, subBn: `পরিবার ${profile.family}-এর মাসিক চাঁদার হিসাব।`, actions: `<button type="button" class="btn btn-primary btn-sm" id="dl-statement"><i data-lucide="download"></i>${t('Download PDF', 'পিডিএফ ডাউনলোড')}</button>` })}
    <div class="mt-5">${segmented([[2026, 'Apr 2026 – Mar 2027', 'এপ্রিল ২০২৬ – মার্চ ২০২৭'], [2025, 'Apr 2025 – Mar 2026', 'এপ্রিল ২০২৫ – মার্চ ২০২৬']], fy, 'data-fy', L('Financial year', 'আর্থিক বছর'))}</div>
    ${fyLoading ? `<div class="mt-5">${skeleton(4)}</div>` : `
    <div class="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
      ${[['Paid', 'দেওয়া', paidN * fee, 'text-tulsi'], ['Due', 'বকেয়া', dueN * fee, dueN ? 'text-sindoor-deep' : 'text-ink'], ['Still to come', 'আসন্ন', nextN * fee, 'text-ink-2']].map(([en, bn, v, c]) => `
      <div class="rounded-lg border border-rule bg-card p-3 sm:p-4"><p class="text-[13px] text-ink-3">${t(en, bn)}</p><p class="font-display text-[1.5rem] sm:text-[1.9rem] leading-tight ${c}">${inr(v)}</p></div>`).join('')}
    </div>
    <h2 class="sr-only">${t('Months', 'মাস')}</h2>
    <ol class="mt-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
      ${rows.map((r) => `<li class="rounded-lg border ${sTone[r.s]} px-3 py-2.5">
        <p class="text-[13px] font-semibold">${fmonth(r.m)}</p>
        <p class="text-[12.5px] mt-0.5 flex items-center gap-1">${r.s === 'paid' ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : ''}${t(...sLabel[r.s])}</p>
      </li>`).join('')}
    </ol>
    <div class="mt-6 rounded-lg border border-rule bg-card">
      <div class="px-4 pt-4">${sectionTitle('Payments this year', 'এই বছরের জমা')}</div>
      ${recs.length ? `<div class="overflow-x-auto"><table class="khata-table mt-2 min-w-[520px]">
        <thead><tr><th>${t('Date', 'তারিখ')}</th><th>${t('Receipt', 'রসিদ')}</th><th>${t('Months', 'মাস')}</th><th>${t('Mode', 'মাধ্যম')}</th><th class="amt">${t('Amount', 'টাকা')}</th></tr></thead>
        <tbody>${recs.map((r) => `<tr class="cursor-pointer" data-href="#receipt/${r.no}"><td>${fdate(r.date)}</td><td><a href="#receipt/${r.no}" class="font-semibold num hover:underline">${r.no}</a></td><td>${r.months.map((m) => fmonth(m, { short: true })).join(', ')}</td><td>${r.mode === 'cash' ? t('Cash', 'নগদ') : t('UPI', 'ইউপিআই')}</td><td class="amt font-semibold">${inr(r.amount)}</td></tr>`).join('')}</tbody>
      </table></div>` : `<div class="p-4">${empty({ icon: 'receipt-text', en: 'No payments yet this year', bn: 'এই বছরে এখনও জমা নেই' })}</div>`}
    </div>
    ${dueN ? `<a href="#pay" class="btn btn-primary w-full sm:w-auto h-12 mt-5"><i data-lucide="indian-rupee"></i>${t(`Pay ₹${dueN * fee} due`, `বকেয়া ₹${bnD(dueN * fee)} দিন`)}</a>` : ''}`}`);
  $$('[data-fy]').forEach((b) => b.addEventListener('click', () => { fy = Number(b.dataset.fy); fyLoading = true; renderStatement(); setTimeout(() => { fyLoading = false; if (current === 'statement') renderStatement(); }, 350); }));
  $$('#s-statement tr[data-href]').forEach((tr) => tr.addEventListener('click', (e) => { if (!e.target.closest('a')) location.hash = tr.dataset.href; }));
  $('#dl-statement').addEventListener('click', () => printDoc(statementPrint(rows, recs)));
}

const printHead = (en, bn) => `
  <div style="display:flex;align-items:center;gap:14px;border-bottom:2px solid #2b2f36;padding-bottom:10px;margin-bottom:14px">
    ${seal({ size: 64, rotate: -6 })}
    <div><div style="font-family:var(--font-display);font-size:22pt;color:#d21f1b;line-height:1">${t('Gede Maitree Club', 'গেদে মৈত্রী ক্লাব')}</div>
    <div style="font-size:9pt;letter-spacing:.12em">NETAJI PARA · ESTD 2014 · REGD. S-0027153 / 2022-23</div></div>
    <div style="margin-left:auto;text-align:right;font-weight:700;font-size:13pt">${t(en, bn)}</div>
  </div>`;

function statementPrint(rows, recs) {
  return `${printHead('Subscription statement', 'চাঁদার বিবরণী')}
    <p><b>${t(profile.name, profile.nameBn)}</b> · ${t('Family', 'পরিবার')} ${profile.family} · ${t(profile.address, profile.addressBn)}</p>
    <p>${t('Financial year', 'আর্থিক বছর')} ${fy}–${String(fy + 1).slice(2)} · ${t('Printed', 'মুদ্রণ')} ${fdate(TODAY)}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:11pt">
      <thead><tr>${['Month', 'Status', 'Receipt', 'Amount'].map((h, i) => `<th style="text-align:${i === 3 ? 'right' : 'left'};border-bottom:1px solid #999;padding:5px 4px">${t(h, ['মাস', 'অবস্থা', 'রসিদ', 'টাকা'][i])}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr><td style="padding:4px;border-bottom:1px solid #ddd">${fmonth(r.m)}</td><td style="padding:4px;border-bottom:1px solid #ddd">${t(...sLabel[r.s])}</td><td style="padding:4px;border-bottom:1px solid #ddd">${r.r ? r.r.no : '—'}</td><td style="padding:4px;border-bottom:1px solid #ddd;text-align:right">₹${fee}</td></tr>`).join('')}</tbody>
    </table>
    <p style="margin-top:12px">${t('Paid', 'দেওয়া')}: ₹${rows.filter((r) => r.s === 'paid').length * fee} · ${t('Due', 'বকেয়া')}: ₹${rows.filter((r) => r.s === 'due').length * fee} · ${t('Receipts', 'রসিদ')}: ${recs.map((r) => r.no).join(', ') || '—'}</p>
    <p style="margin-top:24px;font-size:9pt;color:#686c75">${t('Generated from the Gede Maitree Club member app. Each receipt is recorded in the Club book.', 'গেদে মৈত্রী ক্লাবের সদস্য অ্যাপ থেকে তৈরি। প্রতিটি রসিদ ক্লাব খাতায় লেখা আছে।')}</p>`;
}

/* =========================================================
   RECEIPTS
   ========================================================= */
let rKind = 'all';
let rQuery = '';
const kindIcon = { sub: 'indian-rupee', event: 'ticket', nursery: 'sprout', catering: 'utensils-crossed' };
const kindTone = { sub: 'bg-sindoor-wash text-sindoor-deep', event: 'bg-marigold-wash text-turmeric', nursery: 'bg-tulsi-wash text-tulsi', catering: 'bg-turmeric-wash text-turmeric' };
const rTitle = (r) => r.kind === 'sub' ? t(`Subscription · ${r.months.length} months`, `চাঁদা · ${bnD(r.months.length)} মাস`) : t(...r.note);

function renderReceipts() {
  const list = receipts.filter((r) => (rKind === 'all' || r.kind === rKind) && (!rQuery || r.no.toLowerCase().includes(rQuery.toLowerCase())));
  const years = [...new Set(list.map((r) => r.date.slice(0, 4)))];
  const thisYear = receipts.filter((r) => r.date.startsWith('2026')).reduce((a, b) => a + b.amount, 0);
  paint('#s-receipts', `
    ${pageHead({ en: 'Receipts', bn: 'রসিদ', subEn: 'Every subscription, event, nursery and catering receipt in one place.', subBn: 'চাঁদা, অনুষ্ঠান, নার্সারি ও পরিবেশনের সব রসিদ এক জায়গায়।' })}
    <div class="mt-5 grid gap-3 sm:grid-cols-[1fr_260px] items-center">
      ${chips(Object.entries(receiptKinds).map(([k, [en, bn]]) => [k, en, bn]), rKind, 'data-rkind')}
      <label class="relative block"><span class="sr-only">${t('Search by receipt number', 'রসিদ নম্বর দিয়ে খুঁজুন')}</span><i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"></i><input id="r-search" class="field pl-9 h-10" value="${rQuery}" placeholder="MC-26-0388" autocomplete="off" /></label>
    </div>
    <p class="mt-4 text-sm text-ink-2">${t('Paid to the club in 2026:', '২০২৬-এ ক্লাবে জমা:')} <span class="font-semibold text-ink">${inr(thisYear)}</span></p>
    <div class="mt-2">
      ${list.length ? years.map((y) => `
        <h2 class="mt-4 text-[13px] font-bold uppercase tracking-wide text-ink-3">${dn(y)}</h2>
        <ul class="mt-1 rounded-lg border border-rule bg-card divide-y divide-rule overflow-hidden">
          ${list.filter((r) => r.date.startsWith(y)).map((r) => `<li><a href="#receipt/${r.no}" class="flex items-center gap-3 px-4 py-3.5 hover:bg-paper-2/60">
            <span class="w-10 h-10 rounded-full ${kindTone[r.kind]} grid place-items-center shrink-0"><i data-lucide="${kindIcon[r.kind]}" class="w-[18px] h-[18px]"></i></span>
            <span class="flex-1 min-w-0"><span class="block font-semibold truncate">${rTitle(r)}</span><span class="block text-sm text-ink-3"><span class="num">${r.no}</span> · ${fdate(r.date)} · ${r.mode === 'cash' ? t('Cash', 'নগদ') : t('UPI', 'ইউপিআই')}</span></span>
            <span class="font-semibold">${inr(r.amount)}</span><i data-lucide="chevron-right" class="w-4 h-4 text-ink-3"></i>
          </a></li>`).join('')}
        </ul>`).join('') : empty({ icon: 'search-x', en: 'No receipts match', bn: 'মিলছে এমন রসিদ নেই', subEn: 'Try another filter or receipt number.', subBn: 'অন্য ফিল্টার বা রসিদ নম্বর দিন।', action: `<button type="button" class="btn btn-line btn-sm" id="r-clear">${t('Clear filters', 'ফিল্টার মুছুন')}</button>` })}
    </div>`);
  $$('[data-rkind]').forEach((b) => b.addEventListener('click', () => { rKind = b.dataset.rkind; renderReceipts(); }));
  const s = $('#r-search');
  s.addEventListener('input', () => { rQuery = s.value.trim(); const pos = s.selectionStart; renderReceipts(); const n = $('#r-search'); n.focus(); n.setSelectionRange(pos, pos); });
  $('#r-clear')?.addEventListener('click', () => { rKind = 'all'; rQuery = ''; renderReceipts(); });
}

function receiptBody(r) {
  const forTxt = r.kind === 'sub' ? `${t('Subscription', 'চাঁদা')}: ${r.months.map((m) => fmonth(m)).join(', ')}` : t(...r.note);
  return `
    <dl class="text-[15px] divide-y divide-dashed divide-ink/20 border-y border-dashed border-ink/20">
      <div class="flex justify-between gap-4 py-2.5"><dt class="text-ink-3 shrink-0">${t('Receipt no.', 'রসিদ নং')}</dt><dd class="font-semibold num text-right">${r.no}</dd></div>
      <div class="flex justify-between gap-4 py-2.5"><dt class="text-ink-3 shrink-0">${t('Date', 'তারিখ')}</dt><dd class="text-right">${fdate(r.date)}</dd></div>
      <div class="flex justify-between gap-4 py-2.5"><dt class="text-ink-3 shrink-0">${t('Received from', 'প্রদানকারী')}</dt><dd class="text-right">${t(profile.name, profile.nameBn)} · <span class="num">${profile.family}</span></dd></div>
      <div class="flex justify-between gap-4 py-2.5"><dt class="text-ink-3 shrink-0">${t('For', 'বাবদ')}</dt><dd class="text-right">${forTxt}</dd></div>
      <div class="flex justify-between gap-4 py-2.5"><dt class="text-ink-3 shrink-0">${t('Mode', 'মাধ্যম')}</dt><dd class="text-right">${r.mode === 'cash' ? t('Cash', 'নগদ') : t('UPI', 'ইউপিআই')}${r.utr ? ` · UTR <span class="num">${dn(r.utr)}</span>` : ''}</dd></div>
      <div class="flex justify-between gap-4 py-2.5"><dt class="text-ink-3 shrink-0">${t('Book', 'খাতা')}</dt><dd class="text-right">${t(...bookOf(r.no))}</dd></div>
      <div class="flex justify-between gap-4 py-2.5"><dt class="text-ink-3 shrink-0">${t('Received by', 'গ্রহণকারী')}</dt><dd class="text-right">${t(r.by, r.byBn)}</dd></div>
    </dl>`;
}

function renderReceipt(no) {
  const r = receipts.find((x) => x.no === no);
  if (!r) {
    paint('#s-receipt', `<div class="mb-1">${backLinkHtml()}</div>${empty({ icon: 'file-question', en: 'Receipt not found', bn: 'রসিদ পাওয়া যায়নি', subEn: 'It may belong to another family number.', subBn: 'এটি হয়তো অন্য পরিবার নম্বরের।', action: `<a href="#receipts" class="btn btn-line btn-sm">${t('All receipts', 'সব রসিদ')}</a>` })}`);
    return;
  }
  paint('#s-receipt', `
    <div class="mb-1">${backLinkHtml()}</div>
    <div class="grid gap-6 lg:grid-cols-[minmax(0,560px)_1fr] items-start">
      <article class="relative rounded-lg bg-card border border-rule p-5 sm:p-7 overflow-hidden" aria-labelledby="rc-title">
        <div class="flex items-start justify-between gap-3">
          <div><p class="font-display text-2xl text-sindoor" id="rc-title">${t('Gede Maitree Club', 'গেদে মৈত্রী ক্লাব')}</p>
          <p class="text-[11px] tracking-[0.16em] font-semibold text-ink-3">MONEY RECEIPT · ${t('REGD. S-0027153 / 2022-23', 'নিবন্ধন S-0027153 / 2022-23')}</p></div>
          ${statusChip('ok', 'Paid', 'প্রাপ্ত', 'check')}
        </div>
        <div class="mt-5">${receiptBody(r)}</div>
        <p class="font-display text-[2.8rem] mt-4">${inr(r.amount)}</p>
        <div class="absolute right-4 bottom-3 ink-stamp pointer-events-none">${seal({ size: 116, rotate: -8, className: 'stamp-in' })}</div>
      </article>
      <div class="space-y-2 lg:pt-2">
        <button type="button" class="btn btn-primary w-full h-12" id="rc-dl"><i data-lucide="download"></i>${t('Download PDF', 'পিডিএফ ডাউনলোড')}</button>
        <button type="button" class="btn btn-line w-full h-12" id="rc-share"><i data-lucide="share-2"></i>${t('Share', 'শেয়ার')}</button>
        <p class="text-[13px] text-ink-2 pt-1">${t('Choose “Save as PDF” in the print dialog to keep a copy. Something wrong on this receipt?', 'প্রিন্টের ডায়লগে “Save as PDF” বেছে কপি রাখুন। রসিদে ভুল আছে?')} <a href="#help" class="font-semibold text-sindoor hover:underline">${t('Tell the treasurer', 'কোষাধ্যক্ষকে জানান')}</a></p>
      </div>
    </div>`);
  $('#rc-dl').addEventListener('click', () => printDoc(`${printHead('Money receipt', 'টাকার রসিদ')}${receiptBody(r)}<p style="font-family:var(--font-display);font-size:28pt;margin-top:12px">₹${r.amount.toLocaleString('en-IN')}</p><div style="margin-top:8px;opacity:.9">${seal({ size: 110, rotate: -8 })}</div>`));
  $('#rc-share').addEventListener('click', async () => {
    const text = `Gede Maitree Club receipt ${r.no} · ₹${r.amount} · ${r.date} · ${profile.family}`;
    try { if (navigator.share) { await navigator.share({ title: r.no, text }); return; } await navigator.clipboard.writeText(text); } catch { /* cancelled */ }
    ok('Receipt details copied', 'রসিদের বিবরণ কপি হয়েছে', 'copy');
  });
}
const backLinkHtml = () => `<a href="#receipts" class="inline-flex items-center gap-1 h-9 text-sm font-semibold text-ink-2 hover:text-ink -ml-1"><i data-lucide="chevron-left" class="w-4 h-4"></i>${t('Receipts', 'রসিদ')}</a>`;

/* =========================================================
   MEMBER CARDS
   ========================================================= */
let idPerson = 0, idView = 'card', flipped = false;
function renderId() {
  const p = household[idPerson];
  const noPhoto = !p.photo && !p.photoUrl;
  paint('#s-id', `
    ${pageHead({ en: 'Member cards', bn: 'সদস্য কার্ড', subEn: 'Everyone in your family has their own card and gate QR.', subBn: 'পরিবারের প্রত্যেকের নিজের কার্ড ও গেটের QR।', actions: `<button type="button" class="btn btn-line btn-sm" id="print-all"><i data-lucide="printer"></i>${t('Print all cards', 'সব কার্ড প্রিন্ট')}</button>` })}
    <div class="mt-5 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="${L('Family member', 'পরিবারের সদস্য')}">
      ${household.map((x, i) => `<button type="button" role="tab" aria-selected="${i === idPerson}" data-person="${i}" class="flex items-center gap-2 h-11 pl-1.5 pr-4 rounded-full whitespace-nowrap border border-rule bg-card text-[15px] font-semibold aria-selected:bg-ink aria-selected:text-paper aria-selected:border-ink">${avatar(x, 'w-8 h-8 text-sm', 'bg-paper-2 text-ink')}${t(x.name.split(' ')[0], x.nameBn.split(' ')[0])}${!x.photo && !x.photoUrl ? '<span class="w-2 h-2 rounded-full bg-sindoor" aria-hidden="true"></span>' : ''}</button>`).join('')}
    </div>
    <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,480px)_1fr] items-start">
      <div class="min-w-0">
        <div class="grid grid-cols-2 p-1 rounded-[7px] bg-paper-2" role="tablist" aria-label="${L('Card view', 'কার্ডের দৃশ্য')}">
          ${[['card', 'Card', 'কার্ড'], ['gate', 'Gate QR', 'গেটের QR']].map(([k, en, bn]) => `<button type="button" role="tab" data-view="${k}" aria-selected="${idView === k}" class="h-10 rounded-[5px] text-[15px] font-semibold text-ink-2 aria-selected:bg-white aria-selected:text-ink aria-selected:shadow-[0_1px_2px_rgba(0,0,0,.12)]">${t(en, bn)}</button>`).join('')}
        </div>
        <div class="mt-4" id="card-area">
          ${idView === 'card' ? `
          <button type="button" class="idc-flip ${flipped ? 'is-back' : ''} block w-full text-left rounded-[4%]" id="flip" aria-label="${L('Flip card', 'কার্ড ঘোরান')}">
            <div class="idc-flip-inner"><div class="idc-wrap">${cardFront(p)}</div><div class="idc-wrap">${cardBack(p)}</div></div>
          </button>
          <button type="button" class="btn btn-ghost w-full mt-2" id="flip-btn"><i data-lucide="repeat"></i>${flipped ? t('Show front', 'সামনের দিক') : t('Show back', 'পেছনের দিক')}</button>` : `
          <div class="rounded-lg border-2 border-ink bg-white p-5 text-center">
            <div class="w-56 h-56 sm:w-64 sm:h-64 mx-auto" data-qr="${p.token}" role="img" aria-label="${L(`Gate QR for ${p.name}`, `${p.nameBn}-এর গেটের QR`)}"></div>
            <p class="mt-4 poster text-[1.7rem]">${t(p.name, p.nameBn)}</p>
            <p class="text-[15px] num mt-1 text-ink-2">${p.id} · ${t(p.rel, p.relBn)}</p>
          </div>
          <p class="mt-4 text-[15px] text-ink-2 flex gap-2"><i data-lucide="sun" class="w-5 h-5 shrink-0"></i><span>${t('Turn your screen brightness up. Works without internet.', 'স্ক্রিনের আলো বাড়ান। ইন্টারনেট ছাড়াও চলে।')}</span></p>`}
        </div>
      </div>
      <div class="min-w-0 space-y-4">
        ${noPhoto ? `<div class="rounded-lg border-2 border-sindoor bg-sindoor-wash/50 p-4 flex items-center gap-3"><i data-lucide="camera" class="w-6 h-6 shrink-0 text-sindoor-deep"></i><p class="flex-1 text-[15px]">${t('This card needs a photo before it can be printed.', 'প্রিন্টের আগে এই কার্ডে ছবি লাগবে।')}</p><label class="btn btn-ink btn-sm cursor-pointer focus-within:outline-2 focus-within:outline-sindoor">${t('Add photo', 'ছবি দিন')}<input type="file" accept="image/*" capture="user" class="sr-only" id="photo-in" /></label></div>` : ''}
        <div class="rounded-lg border border-rule bg-card">
          <dl class="divide-y divide-rule text-[15px]">
            <div class="flex justify-between gap-3 px-4 py-3"><dt class="text-ink-3">${t('Member ID', 'সদস্য নং')}</dt><dd class="font-semibold num">${p.id}</dd></div>
            <div class="flex justify-between gap-3 px-4 py-3"><dt class="text-ink-3">${t('Status', 'অবস্থা')}</dt><dd>${store.dues.length > 5 ? statusChip('due', 'Inactive: dues', 'নিষ্ক্রিয়: বকেয়া') : statusChip('ok', 'Active', 'সক্রিয়', 'check')}</dd></div>
            <div class="flex justify-between gap-3 px-4 py-3"><dt class="text-ink-3">${t('Valid to', 'মেয়াদ')}</dt><dd>${t(p.valid, p.validBn)}</dd></div>
            <div class="flex justify-between gap-3 px-4 py-3"><dt class="text-ink-3">${t('Blood group', 'রক্তের গ্রুপ')}</dt><dd class="num">${p.blood}</dd></div>
          </dl>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="btn btn-primary h-12" id="dl-card"><i data-lucide="download"></i>${t('Download', 'ডাউনলোড')}</button>
          <button type="button" class="btn btn-line h-12" id="print-card"><i data-lucide="printer"></i>${t('Print', 'প্রিন্ট')}</button>
        </div>
        <p class="text-[13px] text-ink-2">${t('Download saves a PNG at print quality. Print gives a true-size card on A4; choose “Save as PDF” to keep a file. A laminated card is also handed out at the club room.', 'ডাউনলোডে প্রিন্টের মানের PNG। প্রিন্টে A4-এ আসল মাপের কার্ড; ফাইল রাখতে “Save as PDF”। ক্লাব ঘর থেকে ল্যামিনেট করা কার্ডও দেওয়া হয়।')}</p>
        <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <button type="button" class="text-sindoor hover:underline" id="lost-card">${t('Report lost card', 'কার্ড হারিয়েছে')}</button>
          <a href="#profile" class="text-sindoor hover:underline">${t('Edit details', 'বিবরণ বদলান')}</a>
        </div>
      </div>
    </div>`);
  fillQrs($('#card-area'));
  $$('[data-person]').forEach((b) => b.addEventListener('click', () => { idPerson = Number(b.dataset.person); flipped = false; renderId(); }));
  $$('[data-view]').forEach((b) => b.addEventListener('click', () => { idView = b.dataset.view; renderId(); }));
  $('#flip')?.addEventListener('click', () => { flipped = !flipped; $('#flip').classList.toggle('is-back', flipped); paint($('#flip-btn'), `<i data-lucide="repeat"></i>${flipped ? t('Show front', 'সামনের দিক') : t('Show back', 'পেছনের দিক')}`); });
  $('#flip-btn')?.addEventListener('click', () => $('#flip').click());
  $('#dl-card').addEventListener('click', async (e) => { const b = e.currentTarget; b.disabled = true; try { await downloadCard(p); } finally { b.disabled = false; } });
  $('#print-card').addEventListener('click', () => printCards([p]));
  $('#print-all').addEventListener('click', () => printCards(household));
  $('#photo-in')?.addEventListener('change', (e) => {
    const url = imageUrl(e.target);
    if (!url) return;
    p.photoUrl = url; p.photo = true;
    notify(); renderId();
    ok('Photo added. The committee checks it before printing.', 'ছবি যোগ হয়েছে। প্রিন্টের আগে কমিটি দেখে নেবে।');
  });
  $('#lost-card').addEventListener('click', () => openSheet(`
    ${sheetHead('Report a lost card', 'কার্ড হারানোর খবর দিন', `For ${p.name}, ${p.id}.`, `${p.nameBn}, ${p.id}-এর জন্য।`)}
    <form id="lost-form" class="mt-5 space-y-4" novalidate>
      <fieldset><legend class="label">${t('What happened?', 'কী হয়েছে?')}</legend>
        <div class="grid grid-cols-2 gap-2">${[['lost', 'Lost', 'হারিয়ে গেছে'], ['damaged', 'Damaged', 'নষ্ট হয়েছে']].map(([k, en, bn], i) => `<label class="rounded-[7px] border-2 border-rule p-3 cursor-pointer has-[:checked]:border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sindoor"><input type="radio" name="why" value="${k}" class="sr-only" ${i ? '' : 'checked'} /><span class="font-semibold">${t(en, bn)}</span></label>`).join('')}</div></fieldset>
      <label class="flex items-start gap-3 text-[15px]"><input type="checkbox" checked class="mt-1 w-4 h-4 accent-[#d21f1b]" />${t('Block the old card’s QR at the gate', 'পুরনো কার্ডের QR গেটে বন্ধ করুন')}</label>
      <p class="text-sm text-ink-2 rounded-lg bg-paper-2 p-3">${t('The card in this app keeps working. Collect the new laminated card at the club room in about a week.', 'অ্যাপের কার্ড চলতে থাকবে। নতুন ল্যামিনেট করা কার্ড প্রায় এক সপ্তাহে ক্লাব ঘর থেকে নিন।')}</p>
      <button class="btn btn-primary w-full h-12">${t('Send to the secretary', 'সম্পাদককে পাঠান')}</button>
    </form>`, { onMount: (b) => b.querySelector('#lost-form').addEventListener('submit', (e) => {
      e.preventDefault(); if (!needOnline()) return;
      paint(b, donePanel({ en: 'Request sent', bn: 'অনুরোধ পাঠানো হয়েছে', subEn: 'Rajib Banerjee will print a new card. We’ll notify you when it’s ready to collect.', subBn: 'রাজীব ব্যানার্জি নতুন কার্ড প্রিন্ট করবেন। নেওয়ার জন্য তৈরি হলে জানাব।', ref: `RC-${p.id.slice(3)}` }));
    }) }));
}

/* =========================================================
   Router and boot
   ========================================================= */
const screens = {
  home: renderHome, pay: renderPay, statement: renderStatement, receipts: renderReceipts, receipt: renderReceipt, id: renderId,
  ...community, ...services, ...account,
};

function show(name, param) {
  current = name; currentParam = param;
  closeSheet();
  screens[name]?.(param);
  markNav();
  if (location.hash.includes('/')) window.scrollTo({ top: 0 });
}

$('#side-seal').innerHTML = seal({ size: 44, rotate: -6 });
$('#top-seal').innerHTML = seal({ size: 34, rotate: -6 });
initSheet();
renderChrome();
document.addEventListener('store', renderChrome);
document.addEventListener('rerender', () => screens[current]?.(currentParam));
document.addEventListener('langchange', () => { renderChrome(); screens[current]?.(currentParam); });
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-app-lang]');
  if (b) setLang(b.dataset.langBtn);
});
initInstall();
initOffline();
router('home', show);
boot('app');
