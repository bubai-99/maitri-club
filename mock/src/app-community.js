// Member app: events & passes, notices, AGM & polls, documents.
import { t, inr, dn, seal, lang } from './shared.js';
import { fillQrs } from './idcard.js';
import { events, pastEvents, notices, club } from './data.js';
import { profile, household, store, receipts, alerts, eventInfo, noticeExtra, agm, pollOpts, closedPolls, docs, rulebook, durgaAccounts, TODAY } from './member-data.js';
import {
  $, $$, L, paint, fdate, dayMon, bnD, ageOn, daysUntil, pageHead, sectionTitle, empty, segmented, chips, statusChip, avatar,
  openSheet, closeSheet, sheetHead, donePanel, confirmSheet, ok, needOnline, fieldError, printDoc, downloadText, notify, rerender, backLink,
} from './app-ui.js';

const ev = (id) => events.find((e) => e.id === id);
const timeOf = (e) => t(e.time, eventInfo[e.id]?.timeBn || e.time);

/* ---------- Passes ---------- */
function passCard(p, { big = false } = {}) {
  const e = ev(p.event);
  const pending = p.status === 'pending';
  return `
  <article class="rounded-lg ${pending ? 'bg-card border-2 border-dashed border-ink/30 text-ink' : 'bg-ink text-paper'} p-5 rise">
    <div class="flex items-start gap-4">
      <div class="flex-1 min-w-0">
        <p class="text-[12px] tracking-[0.14em] font-semibold ${pending ? 'text-turmeric' : 'text-marigold'}">${t(...p.kind)}</p>
        <p class="font-display text-2xl mt-1 leading-tight">${t(e.title, e.titleBn)}</p>
        <p class="text-sm ${pending ? 'text-ink-2' : 'text-paper/75'} mt-1">${fdate(e.date, { day: true, year: false })} · ${t(p.count[0], p.count[1])} · <span class="num">${profile.family}</span></p>
      </div>
      <div class="${big ? 'w-32 h-32' : 'w-24 h-24'} bg-white rounded-lg p-1.5 shrink-0 ${pending ? 'opacity-25' : ''}" data-qr="${p.token}" role="img" aria-label="${L('Pass QR code', 'পাসের QR কোড')}"></div>
    </div>
    <p class="text-sm ${pending ? 'text-ink-2' : 'text-paper/75'} mt-4 pt-3 border-t border-dashed ${pending ? 'border-ink/20' : 'border-paper/25'}">${pending ? t('Becomes active once the treasurer confirms your payment.', 'কোষাধ্যক্ষ পেমেন্ট যাচাই করলে পাস চালু হবে।') : t(...p.note)}</p>
  </article>`;
}

function upsertPass(pass) {
  store.passes = store.passes.filter((p) => p.event !== pass.event);
  store.passes.unshift(pass);
}

/* ---------- Events list ---------- */
let evTab = 'upcoming';
function renderEvents(param) {
  if (param === 'passes' || param === 'past' || param === 'upcoming') evTab = param;
  const list = events.filter((e) => e.date >= TODAY);
  paint('#s-events', `
    ${pageHead({ en: 'Events & passes', bn: 'অনুষ্ঠান ও পাস', subEn: 'Register your family, get passes and add events to your calendar.', subBn: 'পরিবারের নাম দিন, পাস নিন, অনুষ্ঠান ক্যালেন্ডারে রাখুন।' })}
    <div class="mt-5">${segmented([['upcoming', 'Upcoming', 'আসন্ন'], ['passes', 'My passes', 'আমার পাস', store.passes.length || ''], ['past', 'Past', 'আগের']], evTab, 'data-evtab', L('Events view', 'অনুষ্ঠানের দৃশ্য'))}</div>
    <div class="mt-5" id="ev-body">
      ${evTab === 'upcoming' ? `<ul class="grid gap-3 md:grid-cols-2">${list.map((e) => {
        const dm = dayMon(e.date); const reg = store.eventRegs[e.id];
        return `<li><a href="#event/${e.id}" class="flex items-center gap-4 rounded-lg border border-rule bg-card p-4 h-full hover:border-ink/30 group">
          <div class="w-14 text-center leading-none text-sindoor shrink-0 border-r border-rule pr-3"><div class="font-display text-[2rem]">${dn(dm.d)}</div><div class="text-[11.5px] font-semibold mt-1">${t(dm.en, dm.bn)}</div></div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold leading-tight group-hover:underline">${t(e.title, e.titleBn)}</p>
            <p class="text-sm text-ink-3 mt-0.5">${timeOf(e)} · ${t(e.place, e.placeBn)}</p>
            <p class="mt-2">${reg ? (reg.status === 'pending' ? statusChip('wait', 'Payment check', 'পেমেন্ট যাচাই') : statusChip('ok', 'Registered', 'নাম দেওয়া হয়েছে', 'check')) : e.pass ? statusChip('due', 'Pass needed', 'পাস লাগবে', 'ticket') : statusChip('muted', 'Open to all', 'সবার জন্য')}</p>
          </div>
          <i data-lucide="chevron-right" class="w-5 h-5 text-ink-3 shrink-0"></i>
        </a></li>`; }).join('')}</ul>`
      : evTab === 'passes' ? (store.passes.length ? `<div class="grid gap-3 md:grid-cols-2">${store.passes.map((p) => `<button type="button" class="text-left block w-full" data-open-pass="${p.event}" aria-label="${L('Open pass full screen', 'পাস বড় করে দেখুন')}">${passCard(p)}</button>`).join('')}</div>
          <p class="mt-4 text-[15px] text-ink-2 flex gap-2"><i data-lucide="wifi-off" class="w-5 h-5 shrink-0"></i>${t('Passes open without internet once loaded. Show the QR at the gate.', 'একবার খোলা হলে পাস ইন্টারনেট ছাড়াও খোলে। গেটে QR দেখান।')}</p>`
        : empty({ icon: 'ticket', en: 'No passes yet', bn: 'এখনও কোনো পাস নেই', subEn: 'Register for Sports Day or the winter picnic and your family pass appears here.', subBn: 'বার্ষিক ক্রীড়া বা শীতের পিকনিকে নাম দিলে পরিবারের পাস এখানে আসবে।', action: `<a href="#event/sports" class="btn btn-primary btn-sm">${t('Register for Sports Day', 'ক্রীড়ায় নাম দিন')}</a>` }))
      : `<ul class="grid gap-3 md:grid-cols-2">${pastEvents.map((p) => `<li class="rounded-lg border border-rule bg-card p-4">
          <p class="text-sm text-ink-3">${t(p.when, bnD(p.when).replace('Oct', 'অক্টো').replace('Nov', 'নভে'))}</p>
          <p class="font-display text-xl leading-tight mt-0.5">${t(p.title, p.titleBn)}</p>
          <p class="text-[15px] text-ink-2 mt-1">${t(p.note, p.noteBn)}</p>
          <div class="mt-3 flex gap-4 text-sm font-semibold"><a href="index.html#gallery" class="text-sindoor hover:underline">${t('Photos', 'ছবি')}</a>${p.title.startsWith('Durga') ? `<a href="#docs/acc-durga" class="text-sindoor hover:underline">${t('Accounts', 'হিসাব')}</a>` : ''}</div>
        </li>`).join('')}</ul>`}
    </div>`);
  $$('[data-evtab]').forEach((b) => b.addEventListener('click', () => { evTab = b.dataset.evtab; history.replaceState(null, '', evTab === 'upcoming' ? '#events' : `#events/${evTab}`); renderEvents(); }));
  $$('[data-open-pass]').forEach((b) => b.addEventListener('click', () => openPass(b.dataset.openPass)));
  fillQrs($('#ev-body'));
}

function openPass(eventId) {
  const p = store.passes.find((x) => x.event === eventId);
  if (!p) return;
  const e = ev(eventId);
  openSheet(`
    ${sheetHead(e.title, e.titleBn)}
    <div class="mt-4 rounded-lg border-2 border-ink bg-white p-5 text-center">
      <div class="w-60 h-60 mx-auto ${p.status === 'pending' ? 'opacity-25' : ''}" data-qr="${p.token}" role="img" aria-label="${L('Pass QR code', 'পাসের QR কোড')}"></div>
      <p class="mt-3 poster text-[1.5rem]">${t(...p.kind)}</p>
      <p class="text-[15px] text-ink-2 num mt-1">${profile.family} · ${t(p.count[0], p.count[1])}</p>
      <p class="text-sm text-ink-2 mt-2">${p.names.map((n) => t(n[0], n[1])).join(', ')}</p>
    </div>
    <p class="mt-4 text-[15px] text-ink-2 flex gap-2"><i data-lucide="sun" class="w-5 h-5 shrink-0"></i>${t('Turn your screen brightness up at the gate.', 'গেটে স্ক্রিনের আলো বাড়িয়ে দিন।')}</p>`, { onMount: (b) => fillQrs(b) });
}

/* ---------- Event detail ---------- */
function icsFor(e) {
  const d = e.date.replace(/-/g, '');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Gede Maitree Club//Member app//EN', 'BEGIN:VEVENT', `UID:${e.id}-${d}@gedemaitreeclub`, `DTSTART;VALUE=DATE:${d}`, `SUMMARY:${e.title} · Gede Maitree Club`, `LOCATION:${e.place}`, `DESCRIPTION:${e.time}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}

const personRow = (p, i, inner) => `
  <li class="flex items-start gap-3 py-3">
    ${avatar(p, 'w-9 h-9 text-sm', i ? 'bg-paper-2 text-ink' : 'bg-ink text-white')}
    <div class="flex-1 min-w-0">${inner}</div>
  </li>`;

function sportsForm(reg) {
  const info = eventInfo.sports;
  return `
  <form id="ev-form" class="mt-4" novalidate>
    <p class="text-[15px] text-ink-2">${t('Tick who is coming and choose up to two games each. Entries close', 'কে কে আসবেন টিক দিন, প্রত্যেকে দুটি পর্যন্ত খেলা। নাম জমার শেষ দিন')} ${fdate(info.closes, { year: false })}.</p>
    <ul class="mt-2 divide-y divide-rule border-y border-rule">
      ${household.map((p, i) => {
        const kid = ageOn(p.dob) < 16;
        const r = reg?.people.find((x) => x.i === i);
        const on = reg ? !!r : true;
        return personRow(p, i, `
          <label class="flex items-center gap-2 font-semibold"><input type="checkbox" name="go" value="${i}" ${on ? 'checked' : ''} class="w-5 h-5 accent-[#d21f1b]" />${t(p.name, p.nameBn)} <span class="font-normal text-sm text-ink-3">${t(kid ? `child, ${ageOn(p.dob)}` : 'adult', kid ? `ছোট, ${bnD(ageOn(p.dob))}` : 'বড়')}</span></label>
          <div class="mt-2 flex flex-wrap gap-1.5" data-games="${i}">
            ${(kid ? info.kid : info.adult).map(([k, en, bn]) => `<label class="chip h-8 px-3 border border-rule bg-card cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-paper has-[:checked]:border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sindoor"><input type="checkbox" class="sr-only" name="g${i}" value="${k}" ${r?.items.includes(k) ? 'checked' : ''} />${t(en, bn)}</label>`).join('')}
          </div>`);
      }).join('')}
    </ul>
    <p class="text-sm text-ink-2 mt-3">${t('Breakfast coupons for everyone ticked are added to the pass. Free for members.', 'টিক দেওয়া প্রত্যেকের জলখাবারের কুপন পাসে থাকবে। সদস্যদের জন্য বিনামূল্যে।')}</p>
    <button class="btn btn-primary w-full sm:w-auto sm:px-8 h-12 mt-4">${reg ? t('Save changes', 'বদল সেভ করুন') : t('Register and get the pass', 'নাম দিন ও পাস নিন')}</button>
  </form>`;
}

function picnicForm() {
  const info = eventInfo.picnic;
  return `
  <form id="ev-form" class="mt-4" novalidate>
    <p class="text-[15px] text-ink-2">${t(`Member price per seat. ${info.seatsLeft} seats left on the bus.`, `সদস্য মূল্য, আসন প্রতি। বাসে আর ${bnD(info.seatsLeft)}টি আসন বাকি।`)}</p>
    <div class="mt-3 rounded-lg border border-rule divide-y divide-rule">
      ${[['adults', 'Adults', 'বড়', info.adult, 2], ['kids', 'Children 5–12', 'ছোট ৫–১২', info.child, 1], ['under5', 'Under 5 (free)', '৫-এর নিচে (বিনামূল্যে)', 0, 0]].map(([k, en, bn, price, v]) => `
      <div class="flex items-center gap-3 px-4 h-16">
        <div class="flex-1"><p class="font-semibold">${t(en, bn)}</p><p class="text-sm text-ink-3">${price ? inr(price) : t('Free', 'বিনামূল্যে')}</p></div>
        <div class="flex items-center gap-1" data-stepper="${k}" data-price="${price}">
          <button type="button" class="w-10 h-10 rounded-full border border-rule grid place-items-center hover:bg-paper-2" data-step="-1" aria-label="${L(`Fewer ${en}`, `${bn} কমান`)}"><i data-lucide="minus" class="w-4 h-4"></i></button>
          <output class="w-8 text-center font-semibold text-lg num" aria-live="polite">${v}</output>
          <button type="button" class="w-10 h-10 rounded-full border border-rule grid place-items-center hover:bg-paper-2" data-step="1" aria-label="${L(`More ${en}`, `${bn} বাড়ান`)}"><i data-lucide="plus" class="w-4 h-4"></i></button>
        </div>
      </div>`).join('')}
    </div>
    <div class="mt-3 flex items-center justify-between rounded-lg bg-paper-2 px-4 h-12"><span class="text-ink-2">${t('Total', 'মোট')}</span><span class="font-display text-2xl" id="picnic-total"></span></div>
    <button class="btn btn-primary w-full sm:w-auto sm:px-8 h-12 mt-4">${t('Book seats and pay', 'আসন বুক করে টাকা দিন')}</button>
  </form>`;
}

function bloodForm() {
  const info = eventInfo.blood;
  const adults = household.map((p, i) => ({ p, i })).filter(({ p }) => ageOn(p.dob) >= 18);
  return `
  <form id="ev-form" class="mt-4 space-y-4" novalidate>
    <fieldset><legend class="label">${t('Who will donate?', 'কে রক্ত দেবেন?')}</legend>
      <div class="flex flex-wrap gap-2">${adults.map(({ p, i }) => `<label class="chip h-10 px-3.5 border border-rule bg-card cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-paper has-[:checked]:border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sindoor"><input type="checkbox" class="sr-only" name="donor" value="${i}" ${i === 0 ? 'checked' : ''} />${t(p.name.split(' ')[0], p.nameBn.split(' ')[0])} · <span class="num">${p.blood}</span></label>`).join('')}</div>
    </fieldset>
    <div data-field><label class="label" for="slot">${t('Time slot', 'সময়')}</label>
      <select id="slot" class="field">${info.slots.map(([en, bn], i) => `<option value="${i}">${L(en, bn)}</option>`).join('')}</select></div>
    <fieldset class="rounded-lg bg-paper-2 p-4"><legend class="sr-only">${t('Eligibility', 'যোগ্যতা')}</legend>
      <p class="font-semibold text-[15px]">${t('Before you register, confirm:', 'নাম দেওয়ার আগে নিশ্চিত করুন:')}</p>
      ${[['Aged 18–65 and weigh over 45 kg', '১৮–৬৫ বছর বয়স ও ওজন ৪৫ কেজির বেশি'], ['No blood donation in the last 3 months', 'গত ৩ মাসে রক্ত দেননি'], ['Not unwell or on antibiotics this week', 'এই সপ্তাহে অসুস্থ নন বা অ্যান্টিবায়োটিক খাচ্ছেন না']].map(([en, bn]) => `<label class="flex items-start gap-3 mt-2.5 text-[15px]"><input type="checkbox" name="elig" class="mt-1 w-4 h-4 accent-[#d21f1b]" />${t(en, bn)}</label>`).join('')}
    </fieldset>
    <button class="btn btn-primary w-full sm:w-auto sm:px-8 h-12">${t('Register as donor', 'রক্তদাতা হিসেবে নাম দিন')}</button>
  </form>`;
}

function saraswatiForm() {
  const info = eventInfo.saraswati;
  return `
  <form id="ev-form" class="mt-4 space-y-4" novalidate>
    <p class="text-[15px] text-ink-2">${t('No pass needed. If you can lend a hand, sign up to volunteer.', 'পাস লাগবে না। হাত লাগাতে চাইলে স্বেচ্ছাসেবক হিসেবে নাম দিন।')}</p>
    <fieldset><legend class="label">${t('I can help with', 'আমি সাহায্য করতে পারি')}</legend>
      <div class="grid sm:grid-cols-2 gap-2">${info.roles.map(([k, en, bn], i) => `<label class="flex items-center gap-3 rounded-[7px] border-2 border-rule px-3 h-12 cursor-pointer has-[:checked]:border-ink"><input type="radio" name="role" value="${k}" ${i === 0 ? 'checked' : ''} class="w-4 h-4 accent-[#2b2f36]" />${t(en, bn)}</label>`).join('')}</div>
    </fieldset>
    <div><label class="label" for="vol-who">${t('Who is volunteering', 'কে স্বেচ্ছাসেবক হবেন')}</label>
      <select id="vol-who" class="field">${household.map((p, i) => `<option value="${i}">${L(p.name, p.nameBn)}</option>`).join('')}</select></div>
    <button class="btn btn-primary w-full sm:w-auto sm:px-8 h-12">${t('Sign up to volunteer', 'স্বেচ্ছাসেবক হিসেবে নাম দিন')}</button>
  </form>`;
}

function regSummary(e, reg) {
  if (e.id === 'sports') return `${passCard(store.passes.find((p) => p.event === 'sports'))}
    <div class="mt-3 flex flex-wrap gap-2"><button type="button" class="btn btn-line btn-sm" data-edit-reg>${t('Change entries', 'নাম বদলান')}</button><button type="button" class="btn btn-ghost btn-sm text-sindoor-deep" data-cancel-reg>${t('Cancel registration', 'নাম তুলে নিন')}</button></div>`;
  if (e.id === 'picnic') return `${passCard(store.passes.find((p) => p.event === 'picnic'))}
    ${reg.status === 'pending' ? `<div class="mt-3 flex flex-wrap gap-2"><a class="btn btn-primary btn-sm" href="upi://pay?pa=${club.upi}&pn=Gede%20Maitree%20Club&am=${reg.total}&cu=INR&tn=${encodeURIComponent(`${profile.family} picnic`)}"><i data-lucide="smartphone"></i>${t(`Pay ₹${reg.total} by UPI`, `ইউপিআই-এ ₹${bnD(reg.total)} দিন`)}</a><button type="button" class="btn btn-line btn-sm" data-picnic-confirm><i data-lucide="wand-sparkles"></i>${t('Prototype: treasurer confirms', 'প্রোটোটাইপ: কোষাধ্যক্ষ যাচাই করলেন')}</button></div>` : ''}`;
  if (e.id === 'blood') return `<div class="rounded-lg border-2 border-tulsi bg-tulsi-wash/50 p-4"><p class="font-semibold flex items-center gap-2"><i data-lucide="heart-handshake" class="w-5 h-5 text-tulsi"></i>${t('You’re registered to donate', 'রক্তদাতা হিসেবে নাম দেওয়া হয়েছে')}</p>
    <p class="text-[15px] text-ink-2 mt-1">${reg.names.map((n) => t(n[0], n[1])).join(', ')} · ${t(...eventInfo.blood.slots[reg.slot])}</p>
    <p class="text-sm text-ink-2 mt-1">${t('Eat a proper breakfast and bring your member card.', 'ভালো করে জলখাবার খেয়ে আসুন, সদস্য কার্ড সঙ্গে আনুন।')}</p></div>
    <button type="button" class="btn btn-ghost btn-sm text-sindoor-deep mt-2" data-cancel-reg>${t('Cancel', 'বাতিল')}</button>`;
  return `<div class="rounded-lg border-2 border-tulsi bg-tulsi-wash/50 p-4"><p class="font-semibold flex items-center gap-2"><i data-lucide="hand-heart" class="w-5 h-5 text-tulsi"></i>${t('Thank you for volunteering', 'স্বেচ্ছাসেবক হওয়ার জন্য ধন্যবাদ')}</p>
    <p class="text-[15px] text-ink-2 mt-1">${t(reg.who[0], reg.who[1])} · ${t(...reg.role)}. ${t('Kakoli Sen will add you to the WhatsApp group.', 'কাকলি সেন আপনাকে হোয়াটসঅ্যাপ গ্রুপে যোগ করবেন।')}</p></div>
    <button type="button" class="btn btn-ghost btn-sm text-sindoor-deep mt-2" data-cancel-reg>${t('Withdraw', 'নাম তুলে নিন')}</button>`;
}

let editing = false;
function renderEvent(id) {
  const e = ev(id);
  if (!e) { paint('#s-event', `<div class="mb-1">${backLink('#events', 'Events', 'অনুষ্ঠান')}</div>${empty({ icon: 'calendar-x', en: 'Event not found', bn: 'অনুষ্ঠান পাওয়া যায়নি', action: `<a href="#events" class="btn btn-line btn-sm">${t('All events', 'সব অনুষ্ঠান')}</a>` })}`); return; }
  const info = eventInfo[e.id] || {};
  const reg = store.eventRegs[e.id];
  const left = daysUntil(e.date);
  const dm = dayMon(e.date);
  const formTitle = { sports: ['Register your family', 'পরিবারের নাম দিন'], picnic: ['Book seats', 'আসন বুক করুন'], blood: ['Register to donate', 'রক্তদানে নাম দিন'], saraswati: ['Volunteer', 'স্বেচ্ছাসেবক'] }[e.id];
  const form = { sports: () => sportsForm(editing ? reg : null), picnic: picnicForm, blood: bloodForm, saraswati: saraswatiForm }[e.id];
  paint('#s-event', `
    <div class="mb-1">${backLink('#events', 'Events', 'অনুষ্ঠান')}</div>
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
      <div class="min-w-0">
        <div class="flex items-start gap-4">
          <div class="w-16 text-center leading-none text-sindoor shrink-0 rounded-lg border-2 border-sindoor py-2"><div class="font-display text-[2.2rem]">${dn(dm.d)}</div><div class="text-[12px] font-semibold mt-1">${t(dm.en, dm.bn)}</div></div>
          <div class="min-w-0">
            <h1 class="font-display text-[1.9rem] lg:text-[2.3rem] leading-tight">${t(e.title, e.titleBn)}</h1>
            <p class="text-[15px] text-ink-2 mt-1">${fdate(e.date, { day: true })} · ${timeOf(e)}</p>
          </div>
        </div>
        ${info.about ? `<p class="mt-4 text-[16px] leading-relaxed max-w-[62ch]">${t(...info.about)}</p>` : ''}
        <div class="mt-6 rounded-lg border border-rule bg-card p-4 sm:p-5">
          <h2 class="font-display text-xl">${t(...formTitle)}</h2>
          ${reg && !editing ? `<div class="mt-3">${regSummary(e, reg)}</div>` : form()}
        </div>
      </div>
      <aside class="min-w-0 space-y-3 lg:sticky lg:top-24">
        <dl class="rounded-lg border border-rule bg-card divide-y divide-rule text-[15px]">
          <div class="flex gap-3 px-4 py-3"><dt><i data-lucide="calendar" class="w-5 h-5 text-ink-3"></i><span class="sr-only">${t('Date', 'তারিখ')}</span></dt><dd>${fdate(e.date, { day: true })}<span class="block text-sm text-ink-3">${left === 0 ? t('Today', 'আজ') : t(`In ${left} days`, `আর ${bnD(left)} দিন`)}</span></dd></div>
          <div class="flex gap-3 px-4 py-3"><dt><i data-lucide="clock" class="w-5 h-5 text-ink-3"></i><span class="sr-only">${t('Time', 'সময়')}</span></dt><dd>${timeOf(e)}</dd></div>
          <div class="flex gap-3 px-4 py-3"><dt><i data-lucide="map-pin" class="w-5 h-5 text-ink-3"></i><span class="sr-only">${t('Place', 'স্থান')}</span></dt><dd>${t(e.place, e.placeBn)}</dd></div>
          <div class="flex gap-3 px-4 py-3"><dt><i data-lucide="ticket" class="w-5 h-5 text-ink-3"></i><span class="sr-only">${t('Entry', 'প্রবেশ')}</span></dt><dd>${e.pass ? t('Family pass at the gate', 'গেটে পরিবারের পাস') : t('Open to all, no pass', 'সবার জন্য, পাস লাগবে না')}</dd></div>
        </dl>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="btn btn-line" id="ics"><i data-lucide="calendar-plus"></i>${t('Calendar', 'ক্যালেন্ডার')}</button>
          <a class="btn btn-line" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`${e.title} · ${e.time} · ${e.place} — Gede Maitree Club`)}"><i data-lucide="share-2"></i>${t('Share', 'শেয়ার')}</a>
        </div>
        <p class="text-sm text-ink-2">${t('Questions? Call Kakoli Sen, Puja in-charge, on', 'প্রশ্ন? পূজা কমিটির কাকলি সেনকে ফোন করুন:')} <a class="font-semibold num text-ink hover:underline" href="tel:+919830033718">98300 33718</a></p>
      </aside>
    </div>`);
  fillQrs($('#s-event'));
  $('#ics').addEventListener('click', () => { downloadText(`${e.id}.ics`, icsFor(e), 'text/calendar'); ok('Calendar file saved. Open it to add the event.', 'ক্যালেন্ডার ফাইল সেভ হয়েছে। খুললেই অনুষ্ঠান যোগ হবে।', 'calendar-check'); });
  $('[data-edit-reg]')?.addEventListener('click', () => { editing = true; renderEvent(id); });
  $('[data-cancel-reg]')?.addEventListener('click', () => confirmSheet({
    en: 'Cancel this registration?', bn: 'এই নাম তুলে নেবেন?', subEn: 'You can register again until entries close.', subBn: 'নাম জমা বন্ধ হওয়ার আগে আবার নাম দেওয়া যাবে।', yesEn: 'Yes, cancel', yesBn: 'হ্যাঁ, তুলে নিন', danger: true,
    onYes: () => { delete store.eventRegs[id]; store.passes = store.passes.filter((p) => p.event !== id); closeSheet(); notify(); renderEvent(id); ok('Registration cancelled', 'নাম তুলে নেওয়া হয়েছে', 'info'); },
  }));
  $('[data-picnic-confirm]')?.addEventListener('click', () => {
    reg.status = 'ready';
    const p = store.passes.find((x) => x.event === 'picnic'); p.status = 'ready';
    const no = `EV-26-00${60 + store.passes.length}`;
    receipts.unshift({ no, date: TODAY, amount: reg.total, mode: 'upi', kind: 'event', note: [`Winter picnic · ${reg.seats} seats`, `শীতের পিকনিক · ${bnD(reg.seats)}টি আসন`], by: 'Tapas Mondal', byBn: 'তাপস মণ্ডল', utr: '631' + Math.floor(100000000 + Math.random() * 899999999) });
    alerts.unshift({ icon: 'ticket', en: `Picnic seats confirmed · receipt ${no}`, bn: `পিকনিকের আসন নিশ্চিত · রসিদ ${no}`, date: TODAY, unread: true, href: '#events/passes' });
    notify(); renderEvent(id); ok('Payment confirmed. Your picnic pass is active.', 'পেমেন্ট যাচাই হয়েছে। পিকনিকের পাস চালু।', 'ticket');
  });
  wireEventForm(e);
}

function wireEventForm(e) {
  const f = $('#ev-form');
  if (!f) return;
  if (e.id === 'sports') {
    $$('[data-games]', f).forEach((box) => box.addEventListener('change', (ev2) => {
      const on = $$('input:checked', box);
      if (on.length > 2) { ev2.target.checked = false; ok('Two games per person at most.', 'প্রত্যেকে সর্বোচ্চ দুটি খেলা।', 'info'); }
      if (on.length) { const go = f.querySelector(`[name=go][value="${box.dataset.games}"]`); go.checked = true; }
    }));
  }
  if (e.id === 'picnic') {
    const total = () => $$('[data-stepper]', f).reduce((a, s) => a + Number(s.querySelector('output').textContent) * Number(s.dataset.price), 0);
    const upd = () => paint('#picnic-total', inr(total()));
    $$('[data-stepper]', f).forEach((s) => s.addEventListener('click', (x) => {
      const b = x.target.closest('[data-step]'); if (!b) return;
      const o = s.querySelector('output'); o.textContent = Math.max(0, Math.min(10, Number(o.textContent) + Number(b.dataset.step))); upd();
    }));
    upd();
  }
  f.addEventListener('submit', (x) => {
    x.preventDefault();
    if (!needOnline()) return;
    const token = (n) => `MAITRI-PASS:${e.id}-2026:${profile.family}:${n}`;
    if (e.id === 'sports') {
      const people = $$('[name=go]:checked', f).map((c) => ({ i: Number(c.value), items: $$(`[name=g${c.value}]:checked`, f).map((g) => g.value) }));
      if (!people.length) return fieldError($('[name=go]', f), 'Tick at least one person.', 'অন্তত একজনকে টিক দিন।');
      const names = people.map(({ i }) => [household[i].name.split(' ')[0], household[i].nameBn.split(' ')[0]]);
      store.eventRegs.sports = { people };
      upsertPass({ event: 'sports', status: 'ready', token: token(people.length), kind: ['FAMILY PASS', 'পরিবারের পাস'], count: [`${people.length} people`, `${bnD(people.length)} জন`], names, note: ['Breakfast coupon included for each person.', 'প্রত্যেকের জন্য জলখাবারের কুপন সহ।'] });
      const wasEditing = editing; editing = false;
      notify(); renderEvent(e.id);
      if (!wasEditing) openSheet(donePanel({ icon: 'ticket', en: 'You’re in for Sports Day', bn: 'বার্ষিক ক্রীড়ায় নাম উঠেছে', subEn: 'Your family pass is ready in My passes. Show it at the ground gate.', subBn: 'পরিবারের পাস “আমার পাস”-এ তৈরি। মাঠের গেটে দেখান।', btnEn: 'See my pass', btnBn: 'পাস দেখুন', href: '#events/passes' }));
      else ok('Entries updated', 'নাম আপডেট হয়েছে');
    }
    if (e.id === 'picnic') {
      const get = (k) => Number(f.querySelector(`[data-stepper="${k}"] output`).textContent);
      const seats = get('adults') + get('kids') + get('under5');
      const total = get('adults') * eventInfo.picnic.adult + get('kids') * eventInfo.picnic.child;
      if (!seats) return ok('Add at least one seat.', 'অন্তত একটি আসন দিন।', 'info');
      store.eventRegs.picnic = { seats, total, status: 'pending' };
      upsertPass({ event: 'picnic', status: 'pending', token: token(seats), kind: ['PICNIC SEATS', 'পিকনিকের আসন'], count: [`${seats} seats`, `${bnD(seats)}টি আসন`], names: [[profile.name, profile.nameBn]], note: ['Bus leaves the club at 6:30 am sharp.', 'বাস ক্লাব থেকে ঠিক ৬:৩০-এ ছাড়বে।'] });
      notify(); renderEvent(e.id);
      openSheet(donePanel({ icon: 'bus', tone: 'wait', en: 'Seats held for 48 hours', bn: '৪৮ ঘণ্টার জন্য আসন রাখা হলো', subEn: `Pay ₹${total} by UPI or in cash at the club room. The pass turns active once the treasurer confirms.`, subBn: `ইউপিআই-এ বা ক্লাব ঘরে নগদে ₹${bnD(total)} দিন। কোষাধ্যক্ষ যাচাই করলে পাস চালু হবে।`, btnEn: 'Okay', btnBn: 'ঠিক আছে' }));
    }
    if (e.id === 'blood') {
      const donors = $$('[name=donor]:checked', f).map((c) => household[Number(c.value)]);
      if (!donors.length) return fieldError($('[name=donor]', f), 'Choose who will donate.', 'কে রক্ত দেবেন বেছে নিন।');
      if ($$('[name=elig]', f).some((c) => !c.checked)) return fieldError($$('[name=elig]', f).find((c) => !c.checked), 'Please confirm all three before registering.', 'নাম দেওয়ার আগে তিনটিই নিশ্চিত করুন।');
      store.eventRegs.blood = { slot: Number($('#slot').value), names: donors.map((p) => [p.name.split(' ')[0], p.nameBn.split(' ')[0]]) };
      notify(); renderEvent(e.id);
      openSheet(donePanel({ icon: 'heart-handshake', en: 'Thank you for donating', bn: 'রক্তদানের জন্য ধন্যবাদ', subEn: 'We’ll remind you on WhatsApp the evening before.', subBn: 'আগের দিন সন্ধ্যায় হোয়াটসঅ্যাপে মনে করিয়ে দেব।' }));
    }
    if (e.id === 'saraswati') {
      const role = eventInfo.saraswati.roles.find((r) => r[0] === f.querySelector('[name=role]:checked').value);
      const p = household[Number($('#vol-who').value)];
      store.eventRegs.saraswati = { role: [role[1], role[2]], who: [p.name, p.nameBn] };
      notify(); renderEvent(e.id);
      ok('Signed up. Kakoli Sen will be in touch.', 'নাম নেওয়া হয়েছে। কাকলি সেন যোগাযোগ করবেন।', 'hand-heart');
    }
  });
}

/* ---------- Notices ---------- */
let nTag = 'all';
function renderNotices() {
  const tags = [['all', 'All', 'সব'], ...[...new Map(notices.map((n) => [n.tag, [n.tag, n.tag, n.tagBn]])).values()]];
  const list = notices.filter((n) => nTag === 'all' || n.tag === nTag).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const unreadN = notices.filter((n) => !store.readNotices.has(n.id)).length;
  paint('#s-notices', `
    ${pageHead({ en: 'Notice board', bn: 'নোটিস বোর্ড', subEn: 'From the committee. Important notices also come on WhatsApp.', subBn: 'কমিটির পক্ষ থেকে। জরুরি নোটিস হোয়াটসঅ্যাপেও আসে।', actions: unreadN ? `<button type="button" class="btn btn-line btn-sm" id="n-readall"><i data-lucide="check-check"></i>${t('Mark all read', 'সব পড়া হয়েছে')}</button>` : '' })}
    <a href="#polls" class="mt-5 flex items-center gap-3 rounded-lg border-2 border-ink bg-card p-4 hover:bg-paper-2/50">
      <i data-lucide="vote" class="w-6 h-6 text-sindoor shrink-0"></i>
      <span class="min-w-0 flex-1"><span class="block font-semibold">${t('AGM 2026 and open polls', 'সাধারণ সভা ২০২৬ ও চলতি ভোট')}</span><span class="block text-sm text-ink-2">${store.ballot ? t('Your ballot is in. Picnic poll still open.', 'আপনার ব্যালট জমা হয়েছে। পিকনিকের ভোট চলছে।') : t('Ballot open until 14 Dec · one vote per household', '১৪ ডিসে পর্যন্ত ব্যালট খোলা · পরিবার পিছু একটি ভোট')}</span></span>
      <i data-lucide="chevron-right" class="w-5 h-5 shrink-0"></i>
    </a>
    <div class="mt-5">${chips(tags, nTag, 'data-ntag')}</div>
    <ul class="mt-3 rounded-lg border border-rule bg-card divide-y divide-rule overflow-hidden">
      ${list.map((n) => `<li><a href="#notice/${n.id}" class="flex gap-3 px-4 py-4 hover:bg-paper-2/50 group">
        <span class="mt-2 w-2 h-2 rounded-full shrink-0 ${store.readNotices.has(n.id) ? '' : 'bg-sindoor'}"><span class="sr-only">${store.readNotices.has(n.id) ? '' : t('Unread', 'না-পড়া')}</span></span>
        <span class="min-w-0 flex-1">
          <span class="flex items-center gap-2 text-[12.5px]">${n.pinned ? `<span class="inline-flex items-center gap-1 text-sindoor font-semibold"><i data-lucide="pin" class="w-3.5 h-3.5"></i>${t('Pinned', 'পিন করা')}</span> ·` : ''}<span class="font-semibold text-sindoor">${t(n.tag, n.tagBn)}</span><span class="text-ink-3">${dn(n.date)}</span></span>
          <span class="block font-semibold mt-1 leading-snug ${store.readNotices.has(n.id) ? '' : 'text-ink'} group-hover:underline">${t(n.title, n.titleBn)}</span>
          <span class="block text-[15px] text-ink-2 mt-0.5 leading-snug">${t(n.body, n.bodyBn)}</span>
        </span>
        <i data-lucide="chevron-right" class="w-4 h-4 text-ink-3 shrink-0 mt-1"></i>
      </a></li>`).join('')}
    </ul>`);
  $$('[data-ntag]').forEach((b) => b.addEventListener('click', () => { nTag = b.dataset.ntag; renderNotices(); }));
  $('#n-readall')?.addEventListener('click', () => { notices.forEach((n) => store.readNotices.add(n.id)); notify(); renderNotices(); });
}

function renderNotice(id) {
  const i = notices.findIndex((n) => n.id === id);
  const n = notices[i];
  if (!n) { paint('#s-notice', `<div class="mb-1">${backLink('#notices', 'Notices', 'নোটিস')}</div>${empty({ icon: 'file-question', en: 'Notice not found', bn: 'নোটিস পাওয়া যায়নি', subEn: 'It may have been taken down by the committee.', subBn: 'হয়তো কমিটি সরিয়ে নিয়েছে।' })}`); return; }
  store.readNotices.add(n.id); notify();
  const x = noticeExtra[n.id];
  const prev = notices[i - 1], next = notices[i + 1];
  paint('#s-notice', `
    <div class="mb-1">${backLink('#notices', 'Notices', 'নোটিস')}</div>
    <article class="max-w-[68ch]">
      <p class="flex items-center gap-2 text-[13px]">${n.pinned ? '<i data-lucide="pin" class="w-3.5 h-3.5 text-sindoor"></i>' : ''}<span class="font-semibold text-sindoor">${t(n.tag, n.tagBn)}</span><span class="text-ink-3">${dn(n.date)} · ${t('Committee', 'কমিটি')}</span></p>
      <h1 class="font-display text-[1.9rem] lg:text-[2.3rem] leading-tight mt-1">${t(n.title, n.titleBn)}</h1>
      <p class="mt-4 text-[17px] leading-relaxed">${t(n.body, n.bodyBn)}</p>
      ${x ? `<p class="mt-3 text-[17px] leading-relaxed text-ink-2">${t(...x.more)}</p>
      <a href="${x.link[0]}" class="btn btn-primary mt-6">${t(x.link[1], x.link[2])}<i data-lucide="arrow-right"></i></a>` : ''}
      <div class="mt-6 pt-5 border-t border-rule flex flex-wrap gap-2">
        <a class="btn btn-line btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`${n.title} — ${n.body}`)}"><i data-lucide="share-2"></i>${t('Share on WhatsApp', 'হোয়াটসঅ্যাপে শেয়ার')}</a>
      </div>
    </article>
    <nav class="mt-8 grid grid-cols-2 gap-3 max-w-[68ch]" aria-label="${L('More notices', 'আরও নোটিস')}">
      ${prev ? `<a href="#notice/${prev.id}" class="rounded-lg border border-rule bg-card p-3 hover:border-ink/30"><span class="text-[12.5px] text-ink-3 flex items-center gap-1"><i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>${t('Newer', 'নতুন')}</span><span class="block font-semibold text-[15px] leading-snug mt-0.5 line-clamp-2">${t(prev.title, prev.titleBn)}</span></a>` : '<span></span>'}
      ${next ? `<a href="#notice/${next.id}" class="rounded-lg border border-rule bg-card p-3 text-right hover:border-ink/30"><span class="text-[12.5px] text-ink-3 flex items-center justify-end gap-1">${t('Older', 'পুরনো')}<i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></span><span class="block font-semibold text-[15px] leading-snug mt-0.5 line-clamp-2">${t(next.title, next.titleBn)}</span></a>` : ''}
    </nav>`);
}

/* ---------- AGM & polls ---------- */
const choiceLbl = { yes: ['For', 'পক্ষে'], no: ['Against', 'বিপক্ষে'], abstain: ['Abstain', 'বিরত'] };
function renderPolls() {
  const total = pollOpts.reduce((a, b) => a + b.v, 0);
  paint('#s-polls', `
    ${pageHead({ en: 'AGM & polls', bn: 'সাধারণ সভা ও ভোট', subEn: 'One vote per household, cast by the head of family.', subBn: 'পরিবার পিছু একটি ভোট, দেবেন পরিবারের প্রধান।' })}
    <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
      <div class="min-w-0 space-y-6">
        <section class="rounded-lg border-2 border-ink bg-card p-4 sm:p-5" aria-labelledby="ballot-h">
          <p class="text-[12.5px] font-semibold text-sindoor flex items-center gap-1.5"><i data-lucide="vote" class="w-4 h-4"></i>${t('AGM 2026 ballot', 'সাধারণ সভা ২০২৬ ব্যালট')} · ${t('closes', 'শেষ')} ${t(...agm.closes)}</p>
          <h2 id="ballot-h" class="font-display text-2xl mt-1">${t('Resolutions', 'প্রস্তাব')}</h2>
          ${store.ballot ? `
            <ol class="mt-3 divide-y divide-rule border-y border-rule">${agm.resolutions.map((r, i) => `<li class="flex items-start gap-3 py-3"><span class="num font-semibold text-ink-3 w-5">${dn(i + 1)}</span><span class="flex-1 text-[15px]">${t(r.en, r.bn)}</span>${statusChip(store.ballot[r.id] === 'yes' ? 'ok' : store.ballot[r.id] === 'no' ? 'due' : 'muted', ...choiceLbl[store.ballot[r.id]])}</li>`).join('')}</ol>
            <p class="mt-3 text-[15px] flex items-start gap-2"><i data-lucide="lock" class="w-4 h-4 mt-1 shrink-0"></i><span>${t('Ballot recorded. It can’t be changed. Results are read out at the AGM.', 'ব্যালট জমা হয়েছে, আর বদলানো যাবে না। ফল ঘোষণা সাধারণ সভায়।')} <span class="text-ink-3">${t('Ballot ID', 'ব্যালট আইডি')} <span class="num">${store.ballot.id}</span></span></span></p>`
          : `<form id="ballot" class="mt-3 space-y-3" novalidate>
            ${agm.resolutions.map((r, i) => `
            <fieldset class="rounded-lg border border-rule p-4" data-field>
              <legend class="sr-only">${t(r.en, r.bn)}</legend>
              <p class="font-semibold leading-snug"><span class="num text-ink-3 mr-1">${dn(i + 1)}.</span>${t(r.en, r.bn)}</p>
              <p class="text-sm text-ink-2 mt-0.5">${t(r.noteEn, r.noteBn)}</p>
              <div class="mt-3 grid grid-cols-3 gap-2">${Object.entries(choiceLbl).map(([k, [en, bn]]) => `<label class="flex items-center justify-center h-11 rounded-[7px] border-2 border-rule text-[15px] font-semibold cursor-pointer has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sindoor"><input type="radio" class="sr-only" name="${r.id}" value="${k}" />${t(en, bn)}</label>`).join('')}</div>
            </fieldset>`).join('')}
            <button class="btn btn-primary w-full sm:w-auto sm:px-8 h-12">${t('Review and submit', 'দেখে নিয়ে জমা দিন')}</button>
          </form>`}
        </section>

        <section class="rounded-lg border border-rule bg-card p-4 sm:p-5" aria-labelledby="poll-h">
          <p class="text-[12.5px] font-semibold text-sindoor flex items-center gap-1.5"><i data-lucide="bar-chart-3" class="w-4 h-4"></i>${t('Poll · closes 20 Nov', 'ভোট · ২০ নভে পর্যন্ত')}</p>
          <h2 id="poll-h" class="font-display text-xl mt-1 leading-snug">${t('Where should the winter picnic go?', 'শীতের পিকনিক কোথায় হবে?')}</h2>
          <div class="mt-3 space-y-2">
            ${pollOpts.map((o, i) => {
              const pct = Math.round((o.v / total) * 100);
              return store.pollVote === null || store.pollVote === undefined
                ? `<button type="button" data-vote="${i}" class="w-full text-left rounded-lg border border-rule px-4 h-11 hover:border-sindoor font-medium">${t(o.en, o.bn)}</button>`
                : `<div class="relative rounded-lg overflow-hidden border ${store.pollVote === i ? 'border-sindoor' : 'border-rule'} h-11 flex items-center px-4">
                    <div class="absolute inset-y-0 left-0 ${store.pollVote === i ? 'bg-sindoor-wash' : 'bg-paper-2'}" style="width:${pct}%"></div>
                    <span class="relative font-medium flex items-center gap-1.5">${store.pollVote === i ? '<i data-lucide="check" class="w-4 h-4 text-sindoor"></i>' : ''}${t(o.en, o.bn)}</span>
                    <span class="relative ml-auto text-sm font-semibold">${dn(pct + '%')}</span></div>`;
            }).join('')}
          </div>
          <p class="text-sm text-ink-3 mt-3">${store.pollVote === null || store.pollVote === undefined ? t('Tap an option to vote. You can change it until 20 Nov.', 'ভোট দিতে একটি বেছে নিন। ২০ নভে পর্যন্ত বদলানো যাবে।') : `${t(`${total} families voted`, `${bnD(total)}টি পরিবার ভোট দিয়েছে`)} · <button type="button" class="font-semibold text-sindoor hover:underline" id="revote">${t('Change my vote', 'ভোট বদলান')}</button>`}</p>
        </section>

        <section aria-labelledby="closed-h">
          <h2 id="closed-h" class="text-[13px] font-bold uppercase tracking-wide text-ink-2">${t('Closed polls', 'শেষ হওয়া ভোট')}</h2>
          ${closedPolls.map((p) => `<div class="mt-2 rounded-lg border border-rule bg-card p-4"><p class="font-semibold">${t(...p.q)}</p><p class="text-sm text-ink-3">${t('Closed', 'শেষ')} ${fdate(p.closed)}</p>
            <div class="mt-3 space-y-2">${p.opts.map(([en, bn, v], i) => `<div><div class="flex justify-between text-sm"><span class="${i ? '' : 'font-semibold'}">${t(en, bn)}${i ? '' : ` · ${t('chosen', 'নির্বাচিত')}`}</span><span class="num">${dn(v + '%')}</span></div><div class="mt-1 h-2 rounded-full bg-paper-2"><div class="h-2 rounded-full ${i ? 'bg-ink-3' : 'bg-sindoor'}" style="width:${v}%"></div></div></div>`).join('')}</div></div>`).join('')}
        </section>
      </div>

      <aside class="min-w-0 space-y-4 lg:sticky lg:top-24">
        <div class="rounded-lg bg-ink text-paper p-5">
          <p class="text-[12px] tracking-[0.14em] font-semibold text-marigold">${t('ANNUAL GENERAL MEETING', 'বার্ষিক সাধারণ সভা')}</p>
          <p class="font-display text-2xl mt-1">${fdate(agm.date, { day: true })}</p>
          <p class="text-paper/80 text-[15px]">${t(...agm.time)} · ${t(...agm.place)}</p>
          <p class="mt-4 text-sm text-paper/80">${t('Will you attend?', 'আপনি কি আসবেন?')}</p>
          <div class="mt-2 grid grid-cols-2 gap-2">${[['yes', 'Attending', 'আসছি'], ['no', 'Can’t come', 'আসতে পারব না']].map(([k, en, bn]) => `<button type="button" data-rsvp="${k}" aria-pressed="${store.agmRsvp === k}" class="h-10 rounded-[7px] border border-paper/30 text-[15px] font-semibold hover:bg-white/10 aria-pressed:bg-paper aria-pressed:text-ink">${t(en, bn)}</button>`).join('')}</div>
        </div>
        <div class="rounded-lg border border-rule bg-card p-4">
          ${sectionTitle('Agenda', 'আলোচ্যসূচি')}
          <ol class="mt-2 space-y-1.5 text-[15px] list-decimal pl-5 marker:text-ink-3">${agm.agenda.map((a) => `<li>${t(...a)}</li>`).join('')}</ol>
          <div class="mt-4 pt-3 border-t border-rule space-y-1 text-sm font-semibold">
            <a href="#docs/minutes" class="flex items-center gap-2 text-sindoor hover:underline"><i data-lucide="file-text" class="w-4 h-4"></i>${t('Last year’s minutes', 'গত বছরের কার্যবিবরণী')}</a>
            <a href="#docs/rules" class="flex items-center gap-2 text-sindoor hover:underline"><i data-lucide="book-open" class="w-4 h-4"></i>${t('Rule book: meetings and voting', 'নিয়মাবলি: সভা ও ভোট')}</a>
          </div>
        </div>
      </aside>
    </div>`);
  $$('[data-vote]').forEach((b) => b.addEventListener('click', () => { store.pollVote = Number(b.dataset.vote); pollOpts[store.pollVote].v++; renderPolls(); ok('Vote counted', 'ভোট গোনা হয়েছে'); }));
  $('#revote')?.addEventListener('click', () => { pollOpts[store.pollVote].v--; store.pollVote = null; renderPolls(); });
  $$('[data-rsvp]').forEach((b) => b.addEventListener('click', () => { store.agmRsvp = b.dataset.rsvp; renderPolls(); ok(b.dataset.rsvp === 'yes' ? 'See you at the AGM.' : 'Noted. You can still vote in the app.', b.dataset.rsvp === 'yes' ? 'সাধারণ সভায় দেখা হবে।' : 'জানানো হলো। অ্যাপে ভোট দিতে পারবেন।'); }));
  $('#ballot')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const missing = agm.resolutions.find((r) => !f.querySelector(`[name=${r.id}]:checked`));
    if (missing) return fieldError(f.querySelector(`[name=${missing.id}]`), 'Choose For, Against or Abstain.', 'পক্ষে, বিপক্ষে বা বিরত বেছে নিন।');
    const choice = Object.fromEntries(agm.resolutions.map((r) => [r.id, f.querySelector(`[name=${r.id}]:checked`).value]));
    openSheet(`
      ${sheetHead('Submit your ballot?', 'ব্যালট জমা দেবেন?', 'Once submitted it can’t be changed.', 'জমা দেওয়ার পর আর বদলানো যাবে না।')}
      <ol class="mt-4 divide-y divide-rule border-y border-rule">${agm.resolutions.map((r, i) => `<li class="flex items-start gap-3 py-3 text-[15px]"><span class="num text-ink-3">${dn(i + 1)}.</span><span class="flex-1">${t(r.en, r.bn)}</span><strong>${t(...choiceLbl[choice[r.id]])}</strong></li>`).join('')}</ol>
      <p class="mt-3 text-sm text-ink-2">${t(`Voting for household ${profile.family} as ${profile.name}, head of family.`, `পরিবার ${profile.family}-এর পক্ষে, পরিবারের প্রধান ${profile.nameBn}।`)}</p>
      <div class="mt-5 grid grid-cols-2 gap-2"><button type="button" class="btn btn-line h-12" data-close>${t('Go back', 'ফিরে যান')}</button><button type="button" class="btn btn-primary h-12" id="cast">${t('Submit ballot', 'ব্যালট জমা দিন')}</button></div>`, {
      onMount: (b) => b.querySelector('#cast').addEventListener('click', () => {
        if (!needOnline()) return;
        store.ballot = { ...choice, id: `AGM26-${profile.family.slice(3)}-7Q4K` };
        notify(); renderPolls();
        paint(b, donePanel({ icon: 'vote', en: 'Ballot recorded', bn: 'ব্যালট জমা হয়েছে', subEn: 'Thank you for voting. A confirmation has gone to your WhatsApp.', subBn: 'ভোট দেওয়ার জন্য ধন্যবাদ। হোয়াটসঅ্যাপে নিশ্চিতকরণ পাঠানো হয়েছে।', ref: store.ballot.id }));
      }),
    });
  });
}

/* ---------- Documents ---------- */
function docContent(id) {
  if (id === 'rules') return `<ol class="space-y-4">${rulebook.map(([en, bn, ten, tbn], i) => `<li><h3 class="font-semibold"><span class="num text-ink-3 mr-1">${dn(i + 1)}.</span>${t(en, bn)}</h3><p class="text-[15px] text-ink-2 mt-1 leading-relaxed">${t(ten, tbn)}</p></li>`).join('')}</ol>`;
  if (id === 'reg') return `<div class="rounded-lg border-2 border-ink p-5 text-center relative">
      <p class="text-[12px] tracking-[0.14em] font-semibold text-ink-3">${t('GOVERNMENT OF WEST BENGAL', 'পশ্চিমবঙ্গ সরকার')}</p>
      <p class="font-display text-xl mt-1">${t('Certificate of Registration of Society', 'সোসাইটি নিবন্ধনের শংসাপত্র')}</p>
      <p class="text-[15px] text-ink-2 mt-3">${t('Under the West Bengal Societies Registration Act, 1961', 'পশ্চিমবঙ্গ সোসাইটি নিবন্ধন আইন, ১৯৬১ অনুযায়ী')}</p>
      <dl class="mt-4 text-[15px] text-left divide-y divide-rule border-y border-rule">
        <div class="flex justify-between gap-3 py-2"><dt class="text-ink-3">${t('Name', 'নাম')}</dt><dd>${t('Gede Maitree Club', 'গেদে মৈত্রী ক্লাব')}</dd></div>
        <div class="flex justify-between gap-3 py-2"><dt class="text-ink-3">${t('Registration no.', 'নিবন্ধন নং')}</dt><dd class="num font-semibold">S-0027153 / 2022-23</dd></div>
        <div class="flex justify-between gap-3 py-2"><dt class="text-ink-3">${t('Established', 'প্রতিষ্ঠা')}</dt><dd class="num">${dn(2014)}</dd></div>
        <div class="flex justify-between gap-3 py-2"><dt class="text-ink-3">${t('Registered office', 'নিবন্ধিত অফিস')}</dt><dd class="text-right">${t(club.address, club.addressBn)}</dd></div>
      </dl>
      <p class="mt-3 text-[13px] text-ink-3">${t('Prototype copy. The scanned certificate goes here.', 'প্রোটোটাইপ কপি। এখানে স্ক্যান করা শংসাপত্র থাকবে।')}</p>
    </div>`;
  if (id === 'acc-durga') {
    const inc = durgaAccounts.income.reduce((a, b) => a + b[2], 0); const exp = durgaAccounts.expense.reduce((a, b) => a + b[2], 0);
    const table = (rows, en, bn, tot) => `<table class="khata-table"><thead><tr><th>${t(en, bn)}</th><th class="amt">${t('Amount', 'টাকা')}</th></tr></thead><tbody>${rows.map(([e, b, v]) => `<tr><td>${t(e, b)}</td><td class="amt">${inr(v)}</td></tr>`).join('')}<tr><td class="font-semibold">${t('Total', 'মোট')}</td><td class="amt font-semibold">${inr(tot)}</td></tr></tbody></table>`;
    return `<div class="grid gap-4 sm:grid-cols-2">${table(durgaAccounts.income, 'Income', 'আয়', inc)}${table(durgaAccounts.expense, 'Expenditure', 'ব্যয়', exp)}</div>
      <p class="mt-4 rounded-lg bg-tulsi-wash text-tulsi px-4 py-3 font-semibold">${t('Surplus carried to the Puja fund:', 'পূজা তহবিলে উদ্বৃত্ত:')} ${inr(inc - exp)}</p>
      <p class="mt-2 text-sm text-ink-2">${t('Prepared by Tapas Mondal, Treasurer. Audit at the AGM.', 'প্রস্তুত করেছেন তাপস মণ্ডল, কোষাধ্যক্ষ। নিরীক্ষা সাধারণ সভায়।')}</p>`;
  }
  if (id === 'minutes') return `<p class="text-[15px] text-ink-2">${t('Held 14 Dec 2025 at the club room. 112 households present; chaired by Ashok Chakraborty, President.', '১৪ ডিসে ২০২৫, ক্লাব ঘরে। ১১২টি পরিবার উপস্থিত; সভাপতিত্ব করেন সভাপতি অশোক চক্রবর্তী।')}</p>
    <ol class="mt-4 space-y-3 list-decimal pl-5 text-[15px] marker:text-ink-3">
      <li>${t('Accounts for 2024–25 adopted (98 for, 6 against, 8 abstained).', '২০২৪–২৫-এর হিসাব গৃহীত (পক্ষে ৯৮, বিপক্ষে ৬, বিরত ৮)।')}</li>
      <li>${t('Subscription kept at ₹100 a month per household.', 'বাড়ি পিছু মাসিক চাঁদা ₹১০০-ই থাকবে।')}</li>
      <li>${t('Maitree Serving to hire four more servers for the wedding season.', 'বিয়ের মরসুমে মৈত্রী পরিবেশনে আরও চারজন পরিবেশনকারী নেওয়া হবে।')}</li>
      <li>${t('Member app to be built so dues, cards and votes move online.', 'চাঁদা, কার্ড ও ভোট অনলাইনে আনতে সদস্য অ্যাপ তৈরি হবে।')}</li>
      <li>${t('Rule book section 5 amended: members may vote in the app before the AGM.', 'নিয়মাবলির ৫ নং অংশ সংশোধিত: সাধারণ সভার আগে অ্যাপে ভোট দেওয়া যাবে।')}</li>
    </ol>`;
  return `<p class="text-[15px] text-ink-2">${t('Neighbours can apply online at the club website, or fill this form at the club room. Each person fills one; family at the same address can join on the same form.', 'প্রতিবেশীরা ক্লাবের ওয়েবসাইটে অনলাইনে আবেদন করতে পারেন, বা ক্লাব ঘরে এই ফর্ম ভরতে পারেন। প্রত্যেকে একটি করে; একই ঠিকানার পরিবার একই ফর্মে যোগ দিতে পারে।')}</p>
    <ul class="mt-3 grid sm:grid-cols-2 gap-1.5 text-[15px]">${[['Photo', 'ছবি'], ['Full name', 'পুরো নাম'], ['Date of birth', 'জন্মতারিখ'], ['Blood group', 'রক্তের গ্রুপ'], ['Mobile and email', 'মোবাইল ও ইমেল'], ['Address', 'ঠিকানা'], ['Aadhaar, last 4 digits', 'আধারের শেষ ৪ সংখ্যা'], ['Self declaration', 'স্ব-ঘোষণা']].map(([en, bn]) => `<li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-tulsi"></i>${t(en, bn)}</li>`).join('')}</ul>
    <p class="mt-3 text-[15px]">${t('Fees: ₹500 admission once, then ₹100 a month per household.', 'ফি: একবার ₹৫০০ ভর্তি, তারপর বাড়ি পিছু মাসে ₹১০০।')}</p>
    <button type="button" class="btn btn-line btn-sm mt-4" id="copy-join"><i data-lucide="link"></i>${t('Copy the join link for a neighbour', 'প্রতিবেশীর জন্য যোগদানের লিঙ্ক কপি')}</button>`;
}

function openDoc(id) {
  const d = docs.find((x) => x.id === id);
  if (!d) return;
  openSheet(`
    ${sheetHead(d.en, d.bn, d.metaEn, d.metaBn)}
    <div class="mt-5" id="doc-body">${docContent(id)}</div>
    <div class="mt-6 grid grid-cols-2 gap-2">
      <button type="button" class="btn btn-primary h-11" id="doc-print"><i data-lucide="download"></i>${t('Download PDF', 'পিডিএফ ডাউনলোড')}</button>
      <button type="button" class="btn btn-line h-11" data-close>${t('Close', 'বন্ধ করুন')}</button>
    </div>`, {
    wide: true,
    onClose: () => { if (location.hash.startsWith('#docs/')) history.replaceState(null, '', '#docs'); },
    onMount: (b) => {
      b.querySelector('#doc-print').addEventListener('click', () => printDoc(`<div style="display:flex;align-items:center;gap:12px;border-bottom:2px solid #2b2f36;padding-bottom:8px;margin-bottom:12px">${seal({ size: 56, rotate: -6 })}<div><div style="font-family:var(--font-display);font-size:18pt;color:#d21f1b">${t('Gede Maitree Club', 'গেদে মৈত্রী ক্লাব')}</div><div style="font-size:9pt">REGD. S-0027153 / 2022-23</div></div></div><h1 style="font-size:16pt;font-weight:700;margin-bottom:10px">${t(d.en, d.bn)}</h1>${docContent(id)}`));
      b.querySelector('#copy-join')?.addEventListener('click', async () => { try { await navigator.clipboard.writeText(`${location.origin}/index.html#join`); } catch { /* ignore */ } ok('Join link copied', 'যোগদানের লিঙ্ক কপি হয়েছে', 'link'); });
    },
  });
}

function renderDocs(param) {
  paint('#s-docs', `
    ${pageHead({ en: 'Documents', bn: 'ডকুমেন্টস', subEn: 'The club’s rule book, registration, accounts and minutes. Open to every member.', subBn: 'ক্লাবের নিয়মাবলি, নিবন্ধন, হিসাব ও কার্যবিবরণী। সব সদস্যের জন্য খোলা।' })}
    <ul class="mt-5 grid gap-3 md:grid-cols-2">
      ${docs.map((d) => `<li><a href="#docs/${d.id}" class="flex items-center gap-4 rounded-lg border border-rule bg-card p-4 h-full hover:border-ink/30 group">
        <span class="w-12 h-12 rounded-lg bg-paper-2 grid place-items-center shrink-0"><i data-lucide="${d.icon}" class="w-6 h-6"></i></span>
        <span class="min-w-0 flex-1"><span class="block font-semibold leading-tight group-hover:underline">${t(d.en, d.bn)}</span><span class="block text-sm text-ink-3 mt-0.5">${t(d.metaEn, d.metaBn)} · ${fdate(d.date)}</span></span>
        <i data-lucide="chevron-right" class="w-5 h-5 text-ink-3 shrink-0"></i>
      </a></li>`).join('')}
    </ul>
    <p class="mt-5 text-sm text-ink-2">${t('Looking for something else, like a bank letter or NOC?', 'অন্য কিছু দরকার, যেমন ব্যাঙ্কের চিঠি বা এনওসি?')} <a href="#help" class="font-semibold text-sindoor hover:underline">${t('Ask the secretary', 'সম্পাদককে বলুন')}</a></p>`);
  if (param) openDoc(param);
}

export const screens = { events: renderEvents, event: (id) => { editing = false; renderEvent(id); }, notices: renderNotices, notice: renderNotice, polls: renderPolls, docs: renderDocs };
