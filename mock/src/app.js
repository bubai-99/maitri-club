import { boot, t, inr, dn, seal, qr, router, applyLang, refreshIcons, toast, lang, setLang } from './shared.js';
import { peopleOf, cardFront, cardBack, fillQrs, printCards, downloadCard } from './idcard.js';
import { me, events, notices, plants, memberDiscount, club } from './data.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const render = (sel, html) => { const el = $(sel); el.innerHTML = html; applyLang(el); refreshIcons(); return el; };

$('#app-seal').innerHTML = seal({ size: 46, rotate: -6 });
$('#dues-seal').innerHTML = seal({ size: 150, color: '#fff', rotate: 10 });

/* Home */
const dueTotal = me.dues.reduce((a, b) => a + b.amount, 0);
$('#dues-total').innerHTML = inr(dueTotal);
const noticeRow = (n) => `
  <li class="py-3.5 border-b border-rule">
    <div class="flex items-center gap-2 text-[12.5px]">
      ${n.pinned ? `<i data-lucide="pin" class="w-3.5 h-3.5 text-sindoor"></i>` : ''}
      <span class="font-semibold text-sindoor">${t(n.tag, n.tagBn)}</span>
      <span class="text-ink-3 num">${t(n.date, n.date)}</span>
    </div>
    <p class="font-semibold mt-1 leading-snug">${t(n.title, n.titleBn)}</p>
    <p class="text-[15px] text-ink-2 mt-0.5 leading-snug">${t(n.body, n.bodyBn)}</p>
  </li>`;
render('#home-notices', notices.slice(0, 2).map(noticeRow).join(''));

/* Pay */
const months = [
  ...me.dues.map((d) => ({ ...d, due: true, on: true })),
  { month: 'Dec 2026', monthBn: 'ডিসে ২০২৬', amount: 100, on: false },
  { month: 'Jan 2027', monthBn: 'জানু ২০২৭', amount: 100, on: false },
  { month: 'Feb 2027', monthBn: 'ফেব্রু ২০২৭', amount: 100, on: false },
];
function renderMonths() {
  render('#month-list', months.map((m, i) => `
    <li><label class="flex items-center gap-3 px-4 py-3 cursor-pointer">
      <input type="checkbox" data-i="${i}" ${m.on ? 'checked' : ''} class="w-5 h-5 accent-[#d21f1b]" />
      <span class="flex-1">${t(m.month, m.monthBn)}</span>
      ${m.due ? `<span class="chip bg-sindoor-wash text-sindoor-deep">${t('Due', 'বকেয়া')}</span>` : `<span class="text-sm text-ink-3">${t('advance', 'অগ্রিম')}</span>`}
      <span class="font-semibold w-14 text-right">${inr(m.amount)}</span>
    </label></li>`).join(''));
  $('#month-list').querySelectorAll('input').forEach((c) => c.addEventListener('change', () => { months[c.dataset.i].on = c.checked; updatePay(); }));
  updatePay();
}
function updatePay() {
  const sel = months.filter((m) => m.on);
  const sum = sel.reduce((a, b) => a + b.amount, 0);
  $('#pay-total').innerHTML = inr(sum);
  const note = `MC-0104 ${sel.map((m) => m.month).join(', ')}`;
  const uri = `upi://pay?pa=${club.upi}&pn=Maitri%20Club&am=${sum}&cu=INR&tn=${encodeURIComponent(note)}`;
  $('#upi-link').href = uri;
  qr($('#upi-qr'), uri);
  $('#upi-link').classList.toggle('pointer-events-none', sum === 0);
  $('#upi-link').classList.toggle('opacity-45', sum === 0);
}
renderMonths();

// Accept pasted UTRs with spaces or dashes; keep digits only.
const utr = $('#utr');
utr.addEventListener('input', () => { utr.value = utr.value.replace(/\D/g, '').slice(0, 12); utr.setCustomValidity(''); });
utr.addEventListener('invalid', () => utr.setCustomValidity(lang === 'bn' ? 'UTR-এ ঠিক ১২টি সংখ্যা থাকে। UPI অ্যাপের রসিদ থেকে কপি করুন।' : 'A UTR has exactly 12 digits. Copy it from your UPI app’s receipt.'));
$('#paste-utr').addEventListener('click', async () => {
  try { utr.value = (await navigator.clipboard.readText()).replace(/\D/g, '').slice(0, 12); } catch { utr.focus(); }
});
$('#utr-form').addEventListener('submit', (e) => {
  e.preventDefault();
  openSheet(`
    <div class="text-center pt-2">
      <div class="w-16 h-16 mx-auto rounded-full bg-marigold-wash grid place-items-center"><i data-lucide="hourglass" class="w-7 h-7 text-turmeric"></i></div>
      <h2 id="sheet-title" class="font-display text-2xl mt-4">${t('Waiting for the treasurer', 'কোষাধ্যক্ষের যাচাইয়ের অপেক্ষায়')}</h2>
      <p class="text-[15px] text-ink-2 mt-2">${t('We sent your UTR to Tapas Mondal. You’ll get a notification and a stamped receipt once he confirms, usually the same evening.', 'আপনার UTR তাপস মণ্ডলকে পাঠানো হয়েছে। যাচাই হলেই নোটিফিকেশন ও রসিদ পাবেন, সাধারণত সেদিন সন্ধ্যাতেই।')}</p>
      <button class="btn btn-ink w-full mt-6" data-close>${t('Done', 'ঠিক আছে')}</button>
    </div>`);
});

const historyRow = (h, i) => `
  <li><button data-receipt="${i}" class="w-full flex items-center gap-3 py-3.5 border-b border-rule text-left hover:bg-paper-2/60 -mx-2 px-2 rounded">
    <span class="w-10 h-10 rounded-full bg-tulsi-wash text-tulsi grid place-items-center shrink-0"><i data-lucide="check" class="w-5 h-5"></i></span>
    <span class="flex-1 min-w-0"><span class="block font-semibold num">${h.receipt}</span><span class="block text-sm text-ink-3">${dn(h.date)} · ${t(h.mode, h.mode === 'Cash' ? 'নগদ' : 'ইউপিআই')}</span></span>
    <span class="font-semibold">${inr(h.amount)}</span>
    <i data-lucide="chevron-right" class="w-4 h-4 text-ink-3"></i>
  </button></li>`;
render('#history', me.history.map(historyRow).join(''));
$('#history').addEventListener('click', (e) => {
  const b = e.target.closest('[data-receipt]');
  if (!b) return;
  const h = me.history[b.dataset.receipt];
  openSheet(`
    <div class="relative">
      <div class="flex items-start justify-between">
        <div>
          <p class="font-display text-xl text-sindoor">মৈত্রী ক্লাব</p>
          <p class="text-[11px] tracking-[0.16em] font-semibold text-ink-3">MONEY RECEIPT · ${t('CLUB BOOK', 'ক্লাব খাতা')}</p>
        </div>
        <button data-close class="w-9 h-9 grid place-items-center rounded-full hover:bg-paper-2 -mr-2 -mt-1" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      <dl class="mt-5 text-[15px] divide-y divide-dashed divide-ink/20 border-y border-dashed border-ink/20">
        <div class="flex justify-between py-2.5"><dt class="text-ink-3">${t('Receipt no.', 'রসিদ নং')}</dt><dd class="font-semibold num" id="sheet-title">${h.receipt}</dd></div>
        <div class="flex justify-between py-2.5"><dt class="text-ink-3">${t('Received from', 'প্রদানকারী')}</dt><dd>${t(me.name, me.nameBn)} · MC-0104</dd></div>
        <div class="flex justify-between py-2.5"><dt class="text-ink-3">${t('For', 'বাবদ')}</dt><dd>${t('Subscription, 3 months', 'চাঁদা, ৩ মাস')}</dd></div>
        <div class="flex justify-between py-2.5"><dt class="text-ink-3">${t('Mode', 'মাধ্যম')}</dt><dd>${t(h.mode, h.mode === 'Cash' ? 'নগদ' : 'ইউপিআই')} · ${dn(h.date)}</dd></div>
        <div class="flex justify-between py-2.5"><dt class="text-ink-3">${t('Received by', 'গ্রহণকারী')}</dt><dd>${t(h.by + ', Treasurer', 'তাপস মণ্ডল, কোষাধ্যক্ষ')}</dd></div>
      </dl>
      <p class="font-display text-[2.6rem] mt-4">${inr(h.amount)}</p>
      <div class="absolute right-2 bottom-0 ink-stamp">${seal({ size: 110, rotate: -8, className: 'stamp-in' })}</div>
      <button class="btn btn-line mt-6"><i data-lucide="share-2"></i>${t('Share', 'শেয়ার')}</button>
    </div>`);
});

/* Sheet */
function openSheet(html) {
  const sheet = $('#sheet');
  render('#sheet-body', html);
  sheet.classList.remove('hidden');
  sheet.querySelector('[data-close]:not(.absolute)')?.focus?.();
}
$('#sheet').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) $('#sheet').classList.add('hidden'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('#sheet').classList.add('hidden'); });

/* ID */
/* ID: one card per person, flip front/back, big gate QR, download, print */
const myPeople = peopleOf(me.family, 1);
let idPerson = 0, idView = 'card', flipped = false;
function renderId() {
  render('#person-tabs', myPeople.map((p, i) => `<button role="tab" aria-selected="${i === idPerson}" data-person="${i}" class="chip h-9 px-3.5 text-sm whitespace-nowrap border border-rule bg-card aria-selected:bg-ink aria-selected:text-paper aria-selected:border-ink">${t(p.name.split(' ')[0], p.nameBn.split(' ')[0])}</button>`).join(''));
  document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.view === idView)));
  const p = myPeople[idPerson];
  if (idView === 'card') {
    render('#card-area', `
      <div class="idc-flip ${flipped ? 'is-back' : ''}" id="flip">
        <div class="idc-flip-inner">
          <div class="idc-wrap">${cardFront(p)}</div>
          <div class="idc-wrap">${cardBack(p)}</div>
        </div>
      </div>
      <button class="btn btn-ghost w-full mt-2" id="flip-btn"><i data-lucide="repeat"></i>${flipped ? t('Show front', 'সামনের দিক') : t('Show back', 'পেছনের দিক')}</button>
      ${p.photo ? '' : `<div class="mt-2 rounded-lg border-2 border-ink p-4 flex items-center gap-3"><i data-lucide="camera" class="w-6 h-6 shrink-0"></i><p class="flex-1 text-[15px]">${t('This card needs a photo before it can be printed.', 'প্রিন্টের আগে এই কার্ডে ছবি লাগবে।')}</p><label class="btn btn-ink btn-sm cursor-pointer">${t('Add photo', 'ছবি দিন')}<input type="file" accept="image/*" capture="user" class="sr-only" id="photo-in" /></label></div>`}
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button class="btn btn-primary h-12" id="dl-card"><i data-lucide="download"></i>${t('Download', 'ডাউনলোড')}</button>
        <button class="btn btn-line h-12" id="print-card"><i data-lucide="printer"></i>${t('Print', 'প্রিন্ট')}</button>
      </div>
      <p class="mt-2 text-[13px] text-ink-2">${t('Download saves a PNG at print quality. Print gives a true-size card on A4; choose “Save as PDF” to keep a file. A laminated card is also handed out at the club room.', 'ডাউনলোডে প্রিন্টের মানের PNG। প্রিন্টে A4-এ আসল মাপের কার্ড; ফাইল রাখতে “Save as PDF”। ক্লাব ঘর থেকে ল্যামিনেট করা কার্ডও দেওয়া হয়।')}</p>`);
    $('#flip').addEventListener('click', () => { flipped = !flipped; renderId(); });
    $('#flip-btn').addEventListener('click', () => { flipped = !flipped; renderId(); });
    $('#dl-card').addEventListener('click', async (e) => { const b = e.currentTarget; b.disabled = true; try { await downloadCard(p); } finally { b.disabled = false; } });
    $('#print-card').addEventListener('click', () => printCards([p]));
    $('#photo-in')?.addEventListener('change', () => { p.photo = true; renderId(); toast(`<i data-lucide="check-circle-2"></i>${t('Photo added. The committee checks it before printing.', 'ছবি যোগ হয়েছে। প্রিন্টের আগে কমিটি দেখে নেবে।')}`); });
  } else {
    render('#card-area', `
      <div class="rounded-lg border-2 border-ink p-5 text-center">
        <div class="w-56 h-56 mx-auto" data-qr="${p.token}"></div>
        <p class="mt-4 poster text-[1.7rem]">${t(p.name, p.nameBn)}</p>
        <p class="text-[15px] num mt-1 text-ink-2">${p.id} · ${t(p.rel, p.relBn)}</p>
      </div>
      <p class="mt-4 text-[15px] text-ink-2 flex gap-2"><i data-lucide="sun" class="w-5 h-5 shrink-0"></i><span>${t('Turn your screen brightness up. Works without internet.', 'স্ক্রিনের আলো বাড়ান। ইন্টারনেট ছাড়াও চলে।')}</span></p>`);
  }
  fillQrs($('#card-area'));
  $$('#person-tabs [data-person]').forEach((b) => b.addEventListener('click', () => { idPerson = Number(b.dataset.person); flipped = false; renderId(); }));
}
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { idView = b.dataset.view; renderId(); }));
renderId();
document.addEventListener('langchange', renderId);

/* Events */
let passTaken = false;
function renderEvents() {
  render('#event-list', events.map((e) => `
    <li class="flex items-center gap-4 py-4 border-b border-rule">
      <div class="w-12 text-center leading-none text-sindoor shrink-0"><div class="font-display text-[1.9rem] num">${dn(e.day)}</div><div class="text-[11.5px] font-semibold mt-1">${t(e.mon.toUpperCase(), e.monBn)}</div></div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold leading-tight">${t(e.title, e.titleBn)}</p>
        <p class="text-sm text-ink-3 mt-0.5">${t(e.place, e.placeBn)}</p>
      </div>
      ${e.pass
        ? (e.id === 'sports' && passTaken
          ? `<span class="chip bg-tulsi-wash text-tulsi"><i data-lucide="check"></i>${t('Pass ready', 'পাস তৈরি')}</span>`
          : `<button class="btn btn-primary btn-sm" data-pass="${e.id}">${t('Get pass', 'পাস নিন')}</button>`)
        : `<span class="text-sm text-ink-3">${t('Open to all', 'সবার জন্য')}</span>`}
    </li>`).join(''));
  $('#event-list').querySelectorAll('[data-pass]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.pass === 'sports') { passTaken = true; renderEvents(); showPass(); }
    else toast(`<i data-lucide="check-circle-2"></i>${t('Pass requested. Picnic seats are confirmed after payment.', 'পাসের অনুরোধ গেছে। টাকা দিলে আসন নিশ্চিত।')}`);
  }));
}
function showPass() {
  render('#pass-area', `
    <div class="rounded-lg bg-ink text-paper p-5 rise">
      <div class="flex items-start gap-4">
        <div class="flex-1">
          <p class="text-[12px] tracking-[0.14em] font-semibold text-marigold">${t('FAMILY PASS', 'পরিবারের পাস')}</p>
          <p class="font-display text-2xl mt-1 leading-tight">${t('Annual Sports Day', 'বার্ষিক ক্রীড়া')}</p>
          <p class="text-sm text-paper/75 mt-1">${t('Sun 13 Dec · 3 people · MC-0104', 'রবি ১৩ ডিসে · ৩ জন · MC-0104')}</p>
        </div>
        <div class="w-24 h-24 bg-paper rounded-lg p-1.5 shrink-0" id="pass-qr"></div>
      </div>
      <p class="text-sm text-paper/75 mt-4 pt-3 border-t border-dashed border-paper/25">${t('Breakfast coupon included for each person.', 'প্রত্যেকের জন্য জলখাবারের কুপন সহ।')}</p>
    </div>`);
  qr($('#pass-qr'), 'MAITRI-PASS:sports-2026:MC-0104:3');
}
renderEvents();

/* Notices + poll */
let voted = null;
const pollOpts = [
  { en: 'Gadiara', bn: 'গাদিয়াড়া', v: 61 },
  { en: 'Mukutmanipur', bn: 'মুকুটমণিপুর', v: 34 },
  { en: 'Bakkhali', bn: 'বকখালি', v: 48 },
];
function renderPoll() {
  const total = pollOpts.reduce((a, b) => a + b.v, 0);
  render('#poll', `
    <p class="text-[12.5px] font-semibold text-sindoor flex items-center gap-1.5"><i data-lucide="vote" class="w-4 h-4"></i>${t('Poll · closes 20 Nov', 'ভোট · ২০ নভে পর্যন্ত')}</p>
    <p class="font-display text-xl mt-1 leading-snug">${t('Where should the winter picnic go?', 'শীতের পিকনিক কোথায় হবে?')}</p>
    <div class="mt-3 space-y-2">
      ${pollOpts.map((o, i) => {
        const pct = Math.round((o.v / total) * 100);
        return voted === null
          ? `<button data-vote="${i}" class="w-full text-left rounded-lg border border-rule px-4 h-11 hover:border-sindoor font-medium">${t(o.en, o.bn)}</button>`
          : `<div class="relative rounded-lg overflow-hidden border ${voted === i ? 'border-sindoor' : 'border-rule'} h-11 flex items-center px-4">
               <div class="absolute inset-y-0 left-0 ${voted === i ? 'bg-sindoor-wash' : 'bg-paper-2'}" style="width:${pct}%"></div>
               <span class="relative font-medium flex items-center gap-1.5">${voted === i ? '<i data-lucide="check" class="w-4 h-4 text-sindoor"></i>' : ''}${t(o.en, o.bn)}</span>
               <span class="relative ml-auto text-sm font-semibold">${dn(pct + '%')}</span>
             </div>`;
      }).join('')}
    </div>
    <p class="text-sm text-ink-3 mt-3 flex items-center gap-2">${voted === null ? t('One vote per family. You can change it until 20 Nov.', 'প্রতি পরিবারে একটি ভোট। ২০ নভে পর্যন্ত বদলানো যাবে।') : `${t(`${total} families voted`, `${total}টি পরিবার ভোট দিয়েছে`)} · <button class="font-semibold text-sindoor hover:underline" id="revote">${t('Change my vote', 'ভোট বদলান')}</button>`}</p>`);
  $('#revote')?.addEventListener('click', () => { pollOpts[voted].v--; voted = null; renderPoll(); });
  $('#poll').querySelectorAll('[data-vote]').forEach((b) => b.addEventListener('click', () => { voted = Number(b.dataset.vote); pollOpts[voted].v++; renderPoll(); }));
}
renderPoll();
render('#notice-list', notices.map(noticeRow).join(''));

/* Nursery */
function renderAppPlants() {
  render('#app-plants', plants.filter((p) => p.stock > 0).slice(0, 9).map((p) => `
    <li class="flex items-center gap-3 py-3 border-b border-rule">
      <span class="w-12 h-12 rounded-lg bg-tulsi-wash text-tulsi grid place-items-center shrink-0"><i data-lucide="${p.icon}" class="w-6 h-6"></i></span>
      <span class="flex-1 min-w-0"><span class="block font-semibold leading-tight">${t(p.name, p.nameBn)}${p.isNew ? ` <span class="chip h-5 px-1.5 text-[11px] bg-marigold align-middle">${t('New', 'নতুন')}</span>` : ''}</span><span class="block text-sm text-ink-3">${p.pot}</span></span>
      <span class="text-right"><span class="block font-semibold text-tulsi">${inr(Math.round(p.price * (1 - memberDiscount)))}</span><span class="block text-[12.5px] text-ink-3 line-through">${inr(p.price)}</span></span>
    </li>`).join(''));
}
renderAppPlants();
document.addEventListener('langchange', () => { renderAppPlants(); renderPoll(); });


/* ---------- Profile, settings, notifications, receipts ---------- */
function renderFamily() {
  const people = [{ name: me.name, nameBn: me.nameBn, rel: 'Head of family', relBn: 'পরিবারের প্রধান' }, ...me.dependents];
  render('#family-list', people.map((p, i) => `
    <li class="flex items-center gap-3 py-3 border-b border-rule">
      <span class="w-10 h-10 rounded-full ${i ? 'bg-paper-2 text-ink' : 'bg-ink text-white'} grid place-items-center font-display" lang="bn">${p.nameBn.slice(0, 1)}</span>
      <span class="flex-1 min-w-0"><span class="block font-semibold">${t(p.name, p.nameBn)}</span><span class="block text-sm text-ink-2">${t(p.rel, p.relBn)}</span></span>
      ${i ? `<button class="w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Edit ${p.name}"><i data-lucide="pencil" class="w-4 h-4"></i></button>` : ''}
    </li>`).join(''));
}
renderFamily();
$('#add-member').addEventListener('click', () => openSheet(`
  <form id="member-form">
    <div class="flex items-center"><h2 id="sheet-title" class="font-display text-2xl">${t('Add a family member', 'সদস্য যোগ করুন')}</h2>
      <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
    <label class="block mt-4"><span class="label">${t('Name', 'নাম')}</span><input class="field" required autocomplete="off" /></label>
    <label class="block mt-3"><span class="label">${t('Relation', 'সম্পর্ক')}</span><select class="field"><option>Daughter</option><option>Son</option><option>Parent</option><option>Other</option></select></label>
    <label class="block mt-3"><span class="label">${t('Year of birth (optional)', 'জন্মের বছর (ঐচ্ছিক)')}</span><input class="field num" inputmode="numeric" maxlength="4" /></label>
    <button class="btn btn-primary w-full h-12 mt-5">${t('Send to committee', 'কমিটিকে পাঠান')}</button>
  </form>`));
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'member-form') return;
  e.preventDefault(); $('#sheet').classList.add('hidden');
  toast(`<i data-lucide="check-circle-2"></i>${t('Sent. The name appears on your card once approved.', 'পাঠানো হয়েছে। অনুমোদন হলে কার্ডে নাম উঠবে।')}`);
});

const prefs = [
  ['Dues reminders', 'বকেয়ার তাগাদা', 'Once a month, never more', 'মাসে একবার, তার বেশি নয়', true],
  ['Receipts', 'রসিদ', 'When the treasurer records a payment', 'কোষাধ্যক্ষ জমা নিলে', true],
  ['Events & pujas', 'অনুষ্ঠান ও পূজা', 'New events and pass openings', 'নতুন অনুষ্ঠান ও পাস', true],
  ['Nursery arrivals', 'নার্সারিতে নতুন গাছ', 'Seasonal plants, member prices', 'মরসুমি গাছ, সদস্য মূল্য', false],
];
render('#notify-prefs', prefs.map(([en, bn, sEn, sBn, on], i) => `
  <li class="flex items-center gap-3 py-3">
    <label for="pref-${i}" class="flex-1 min-w-0"><span class="block font-semibold text-[15px]">${t(en, bn)}</span><span class="block text-sm text-ink-2">${t(sEn, sBn)}</span></label>
    <input id="pref-${i}" type="checkbox" role="switch" ${on ? 'checked' : ''} class="switch" />
  </li>`).join(''));
document.querySelectorAll('[data-screen="settings"] [data-lang-btn]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.langBtn)));
$('#change-number').addEventListener('click', () => openSheet(`
  <div><div class="flex items-center"><h2 id="sheet-title" class="font-display text-2xl">${t('Change mobile number', 'মোবাইল নম্বর বদলান')}</h2>
    <button type="button" data-close class="ml-auto w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button></div>
  <p class="mt-3 text-[15px] text-ink-2">${t('We’ll send a code to the new number, then a confirmation to the old one. Your card, receipts and family stay the same.', 'নতুন নম্বরে কোড পাঠাব, পুরনো নম্বরে নিশ্চিতকরণ যাবে। কার্ড, রসিদ ও পরিবার একই থাকবে।')}</p>
  <label class="block mt-4"><span class="label">${t('New mobile number', 'নতুন মোবাইল নম্বর')}</span><input class="field num" type="tel" inputmode="numeric" placeholder="98300 12345" /></label>
  <a href="login.html#forgot" class="btn btn-primary w-full h-12 mt-5">${t('Send code', 'কোড পাঠান')}</a></div>`));

const alerts = [
  { icon: 'megaphone', en: 'Committee meeting on Sunday 16 Nov, 6 pm', bn: 'কমিটি সভা রবি ১৬ নভে, সন্ধ্যা ৬টা', when: '12 Nov', unread: true },
  { icon: 'ticket', en: 'Sports Day passes are open. Entries close 7 Dec.', bn: 'ক্রীড়া দিবসের পাস খোলা। নাম জমা ৭ ডিসে পর্যন্ত।', when: '10 Nov', unread: true },
  { icon: 'sprout', en: 'Dahlia and chrysanthemum have arrived', bn: 'ডালিয়া ও চন্দ্রমল্লিকা এসেছে', when: '6 Nov', unread: false },
  { icon: 'bell-ring', en: 'Reminder: ₹200 subscription due for Oct–Nov', bn: 'মনে করানো: অক্টো–নভে ₹২০০ বকেয়া', when: '5 Nov', unread: false },
  { icon: 'receipt-text', en: 'Receipt MC-26-0388 · ₹300 received', bn: 'রসিদ MC-26-0388 · ₹৩০০ পাওয়া গেছে', when: '12 Sep', unread: false },
];
function renderAlerts() {
  render('#alert-list', alerts.map((a) => `
    <li class="flex gap-3 py-3.5 border-b border-rule">
      <span class="w-10 h-10 rounded-full ${a.unread ? 'bg-ink text-white' : 'bg-paper-2 text-ink'} grid place-items-center shrink-0"><i data-lucide="${a.icon}" class="w-[18px] h-[18px]"></i></span>
      <span class="flex-1 min-w-0"><span class="block text-[15px] ${a.unread ? 'font-semibold' : ''}">${t(a.en, a.bn)}</span><span class="block text-sm text-ink-3 num">${dn(a.when)}</span></span>
      ${a.unread ? '<span class="w-2.5 h-2.5 rounded-full bg-sindoor mt-2 shrink-0"><span class="sr-only">Unread</span></span>' : ''}
    </li>`).join(''));
}
renderAlerts();
$('#mark-read').addEventListener('click', () => { alerts.forEach((a) => (a.unread = false)); renderAlerts(); $('#bell-dot')?.remove(); });

render('#receipt-list', [
  ...me.history.map((h) => ({ ...h, kind: ['Subscription', 'চাঁদা'] })),
  { date: '10 Nov 2026', receipt: 'PS-26-0091', amount: 0, mode: 'Free', kind: ['Sports Day pass', 'ক্রীড়া পাস'] },
  { date: '19 Oct 2026', receipt: 'NS-26-0277', amount: 243, mode: 'UPI', kind: ['Nursery · 3 plants', 'নার্সারি · ৩টি গাছ'] },
].map((h, i) => `
  <li><button ${i < me.history.length ? `data-receipt="${i}"` : ''} class="w-full flex items-center gap-3 py-3.5 border-b border-rule text-left hover:bg-paper-2/60 -mx-2 px-2 rounded">
    <span class="w-10 h-10 rounded-full bg-paper-2 grid place-items-center shrink-0"><i data-lucide="receipt-text" class="w-[18px] h-[18px]"></i></span>
    <span class="flex-1 min-w-0"><span class="block font-semibold">${t(...h.kind)}</span><span class="block text-sm text-ink-3 num">${h.receipt} · ${dn(h.date)}</span></span>
    <span class="font-semibold">${h.amount ? inr(h.amount) : t('Free', 'বিনামূল্যে')}</span>
  </button></li>`).join(''));
$('#receipt-list').addEventListener('click', (e) => { const b = e.target.closest('[data-receipt]'); if (b) $('#history').querySelector(`[data-receipt="${b.dataset.receipt}"]`)?.click(); });
document.addEventListener('langchange', () => { renderFamily(); renderAlerts(); });

router('home');
boot('app');
