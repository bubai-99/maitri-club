// Member app: Maitree Serving (catering) booking, nursery reservations, help & contact.
import { t, inr, dn, lang } from './shared.js';
import { cateringPackages, cateringStatus, serversFor, memberRate, plants, plantCats, memberDiscount, club } from './data.js';
import { profile, store, cateringRequests, contacts, faq, TODAY } from './member-data.js';
import {
  $, $$, L, paint, fdate, bnD, pageHead, sectionTitle, empty, chips, statusChip, openSheet, sheetHead, donePanel, ok, needOnline,
  fieldError, notify,
} from './app-ui.js';

/* ---------- Maitree Serving ---------- */
const STEPS = ['enquiry', 'quoted', 'advance', 'done', 'settled'];
let cat = { pkg: 'tableware', guests: 80 };

function estimate() {
  const p = cateringPackages.find((x) => x.id === cat.pkg);
  const rate = memberRate(p.rate, true);
  const g = Math.max(0, Number(cat.guests) || 0);
  return { p, rate, g, total: rate * g, servers: serversFor(g || 1), advance: Math.round(rate * g * 0.2 / 10) * 10 };
}

function requestCard(r) {
  const p = cateringPackages.find((x) => x.id === r.pkg);
  const at = STEPS.indexOf(r.status);
  return `<li class="rounded-lg border border-rule bg-card p-4">
    <div class="flex items-start gap-3">
      <div class="min-w-0 flex-1"><p class="font-semibold">${t(...r.occasion)} · ${fdate(r.date)}</p><p class="text-sm text-ink-3"><span class="num">${r.id}</span> · ${t(`${r.guests} guests`, `${bnD(r.guests)} জন`)} · ${t(p.name, p.nameBn)}</p></div>
      ${statusChip(r.status === 'settled' ? 'ok' : r.status === 'enquiry' ? 'wait' : 'ink', cateringStatus[r.status].en, cateringStatus[r.status].bn)}
    </div>
    <ol class="mt-3 grid grid-cols-5 gap-1" aria-label="${L('Progress', 'অগ্রগতি')}">${STEPS.map((s, i) => `<li class="h-1.5 rounded-full ${i <= at ? 'bg-turmeric' : 'bg-paper-3'}" title="${L(cateringStatus[s].en, cateringStatus[s].bn)}"><span class="sr-only">${t(cateringStatus[s].en, cateringStatus[s].bn)}${i <= at ? ' ✓' : ''}</span></li>`).join('')}</ol>
    <p class="mt-2 text-sm text-ink-2">${r.status === 'enquiry' ? t('Debashis Pal will call within a day to visit the venue and send a quote.', 'দেবাশিস পাল এক দিনের মধ্যে ফোন করে জায়গা দেখে কোটেশন পাঠাবেন।') : `${t('Bill', 'বিল')} ${inr(r.amount)}`}</p>
  </li>`;
}

const estHtml = (e) => `
  ${sectionTitle('Estimate', 'আনুমানিক খরচ')}
  <p class="font-display text-[2.4rem] leading-none mt-2">${inr(e.total)}</p>
  <dl class="mt-3 text-[15px] space-y-1.5">
    <div class="flex justify-between"><dt class="text-ink-2">${t('Member rate', 'সদস্য মূল্য')}</dt><dd>${inr(e.rate)} × ${dn(e.g)}</dd></div>
    <div class="flex justify-between"><dt class="text-ink-2">${t('Servers on site', 'পরিবেশনকারী')}</dt><dd class="num">${dn(e.servers)}</dd></div>
    <div class="flex justify-between"><dt class="text-ink-2">${t('Advance to confirm (20%)', 'নিশ্চিত করতে অগ্রিম (২০%)')}</dt><dd>${inr(e.advance)}</dd></div>
  </dl>
  ${e.g && e.g < e.p.min ? `<p class="mt-3 text-sm text-sindoor-deep font-medium">${t(`This package starts at ${e.p.min} guests.`, `এই প্যাকেজ অন্তত ${bnD(e.p.min)} জনের জন্য।`)}</p>` : ''}`;

function renderCatering() {
  const e = estimate();
  paint('#s-catering', `
    ${pageHead({ eyebrow: `<p class="eyebrow text-turmeric">${t('Maitree Serving', 'মৈত্রী পরিবেশন')}</p>`, en: 'Book the serving team', bn: 'পরিবেশনকারী দল বুক করুন', subEn: 'Our uniformed team serves at your family event. We don’t cook: your caterer or cook makes the food, we serve it. Members get 10% off.', subBn: 'আপনার পারিবারিক অনুষ্ঠানে ক্লাবের পোশাক পরা দল পরিবেশন করে। আমরা রান্না করি না: রান্না আপনার ক্যাটারার বা রাঁধুনির, পরিবেশন আমাদের। সদস্যদের ১০% ছাড়।' })}
    <form id="cat-form" class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] items-start" novalidate>
      <div class="min-w-0 space-y-5">
        <fieldset><legend class="label">${t('Package', 'প্যাকেজ')}</legend>
          <div class="grid gap-2 md:grid-cols-3">${cateringPackages.map((p) => `
            <label class="relative rounded-lg border-2 border-rule bg-card p-4 cursor-pointer has-[:checked]:border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sindoor">
              <input type="radio" name="pkg" value="${p.id}" class="sr-only" ${p.id === cat.pkg ? 'checked' : ''} />
              ${p.popular ? `<span class="absolute -top-2.5 right-3 chip h-5 px-2 text-[11px] bg-marigold">${t('Most booked', 'সবচেয়ে বেশি')}</span>` : ''}
              <span class="block font-semibold">${t(p.name, p.nameBn)}</span>
              <span class="block text-sm text-ink-2 mt-0.5">${t(p.for, p.forBn)}</span>
              <span class="block mt-2"><span class="font-display text-xl">${inr(memberRate(p.rate, true))}</span> <span class="text-sm text-ink-3">${t('/ guest', '/ জন')}</span> <span class="text-[12.5px] text-ink-3 line-through">${inr(p.rate)}</span></span>
              <details class="mt-2 text-sm"><summary class="cursor-pointer text-ink-2 font-semibold">${t('What’s included', 'কী কী থাকছে')}</summary><ul class="mt-1.5 space-y-1 text-ink-2">${p.menu.map((m, i) => `<li class="flex gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5 mt-1 shrink-0 text-tulsi"></i>${t(m, p.menuBn[i])}</li>`).join('')}</ul></details>
            </label>`).join('')}</div>
        </fieldset>
        <div class="grid gap-4 sm:grid-cols-2">
          <div data-field><label class="label" for="c-occ">${t('Occasion', 'অনুষ্ঠান')}</label>
            <select id="c-occ" class="field">${[['Annaprashan', 'অন্নপ্রাশন'], ['Wedding', 'বিয়ে'], ['Reception (bou-bhat)', 'বউভাত'], ['Birthday', 'জন্মদিন'], ['Puja at home', 'বাড়ির পূজা'], ['Shraddha', 'শ্রাদ্ধ'], ['Other', 'অন্যান্য']].map(([en, bn]) => `<option value="${en}|${bn}">${L(en, bn)}</option>`).join('')}</select></div>
          <div data-field><label class="label" for="c-date">${t('Date', 'তারিখ')}</label><input id="c-date" type="date" class="field num" min="2026-11-16" /></div>
          <div data-field><label class="label" for="c-guests">${t('Guests (about)', 'অতিথি (আনুমানিক)')}</label><input id="c-guests" type="number" inputmode="numeric" min="1" max="2000" class="field num" value="${cat.guests}" /></div>
          <div data-field><label class="label" for="c-venue">${t('Venue', 'স্থান')}</label><input id="c-venue" class="field" autocomplete="off" data-bn-ph="বাড়ি, ছাদ বা ভাড়া করা হল" placeholder="Home, rooftop or rented hall" /></div>
        </div>
        <div><label class="label" for="c-notes">${t('Anything we should know (optional)', 'আর কিছু জানানোর (ঐচ্ছিক)')}</label><textarea id="c-notes" rows="3" class="field" data-bn-ph="যেমন: দুই ব্যাচে খাওয়া, নিরামিষ আলাদা" placeholder="e.g. two sittings, separate veg line"></textarea></div>
        <p class="text-sm text-ink-2">${t(`We’ll call you on +91 ${profile.mobile}.`, `+৯১ ${profile.mobile} নম্বরে ফোন করব।`)}</p>
      </div>
      <aside class="min-w-0 lg:sticky lg:top-24">
        <div class="rounded-lg border-2 border-ink bg-card p-5" id="cat-est">
          <div id="cat-est-live" aria-live="polite">${estHtml(e)}</div>
          <button class="btn btn-primary w-full h-12 mt-4">${t('Send booking request', 'বুকিংয়ের অনুরোধ পাঠান')}</button>
          <p class="mt-2 text-[13px] text-ink-3">${t('Final quote after a free venue visit. Nothing to pay now.', 'বিনামূল্যে জায়গা দেখার পর চূড়ান্ত কোটেশন। এখন কিছু দিতে হবে না।')}</p>
        </div>
      </aside>
    </form>
    <section class="mt-8" aria-labelledby="myreq-h">
      <h2 id="myreq-h" class="font-display text-xl">${t('My bookings', 'আমার বুকিং')}</h2>
      ${cateringRequests.length ? `<ul class="mt-3 grid gap-3 md:grid-cols-2">${cateringRequests.map(requestCard).join('')}</ul>` : `<div class="mt-3">${empty({ icon: 'utensils-crossed', en: 'No bookings yet', bn: 'এখনও বুকিং নেই' })}</div>`}
    </section>`);
  const f = $('#cat-form');
  const live = () => paint('#cat-est-live', estHtml(estimate()));
  $$('[name=pkg]', f).forEach((r) => r.addEventListener('change', () => { cat.pkg = r.value; live(); }));
  const g = $('#c-guests');
  g.addEventListener('input', () => { cat.guests = g.value; live(); });
  f.addEventListener('submit', (ev) => {
    ev.preventDefault();
    cat.guests = g.value;
    const est = estimate();
    const date = $('#c-date');
    if (!date.value) return fieldError(date, 'Choose the date of the event.', 'অনুষ্ঠানের তারিখ দিন।');
    if (date.value <= TODAY) return fieldError(date, 'Choose a date after today.', 'আজকের পরের তারিখ দিন।');
    if (!est.g) return fieldError(g, 'Enter about how many guests.', 'আনুমানিক অতিথির সংখ্যা দিন।');
    if (est.g < est.p.min) return fieldError(g, `This package starts at ${est.p.min} guests. Choose Serving team for smaller events.`, `এই প্যাকেজ অন্তত ${bnD(est.p.min)} জনের। ছোট অনুষ্ঠানে “পরিবেশন” বেছে নিন।`);
    if (!$('#c-venue').value.trim()) return fieldError($('#c-venue'), 'Tell us where the event is.', 'অনুষ্ঠান কোথায় জানান।');
    if (!needOnline()) return;
    const [en, bn] = $('#c-occ').value.split('|');
    const id = `CT-26-00${46 + cateringRequests.length - 1}`;
    cateringRequests.unshift({ id, occasion: [en, bn], date: date.value, guests: est.g, pkg: est.p.id, status: 'enquiry', amount: est.total });
    notify(); renderCatering();
    openSheet(donePanel({ icon: 'utensils-crossed', en: 'Booking request sent', bn: 'বুকিংয়ের অনুরোধ পাঠানো হয়েছে', subEn: 'Debashis Pal, Catering in-charge, will call you within a day to fix a visit. The team is held for your date until then.', subBn: 'ক্যাটারিং দায়িত্বে থাকা দেবাশিস পাল এক দিনের মধ্যে ফোন করে দেখতে আসার সময় ঠিক করবেন। ততক্ষণ আপনার তারিখে দল রাখা থাকবে।', ref: id }));
  });
}

/* ---------- Nursery ---------- */
let pCat = 'all';
const price = (p) => Math.round(p.price * (1 - memberDiscount));
function basketLines() { return Object.entries(store.basket).filter(([, q]) => q > 0).map(([id, q]) => ({ p: plants.find((x) => x.id === id), q })); }

function renderNursery() {
  const list = plants.filter((p) => pCat === 'all' || p.cat === pCat);
  const lines = basketLines();
  const count = lines.reduce((a, b) => a + b.q, 0);
  const total = lines.reduce((a, b) => a + b.q * price(b.p), 0);
  const saved = lines.reduce((a, b) => a + b.q * (b.p.price - price(b.p)), 0);
  const waText = `Namaskar, this is ${profile.name} (${profile.family}). I'd like to reserve: ${lines.map((l) => `${l.q} × ${l.p.name}`).join(', ')}. Member total ₹${total}.`;
  paint('#s-nursery', `
    ${pageHead({ eyebrow: `<p class="eyebrow text-tulsi">${t('Club nursery', 'ক্লাবের নার্সারি')}</p>`, en: 'Nursery', bn: 'নার্সারি', subEn: 'Member prices shown (10% off). Reserve plants and collect at the counter, Saturday and Sunday, 7–10 am.', subBn: 'সদস্য মূল্য দেখানো হচ্ছে (১০% ছাড়)। গাছ রিজার্ভ করুন, কাউন্টার থেকে নিন, শনি ও রবি সকাল ৭–১০টা।' })}
    <div class="mt-5">${chips(Object.entries(plantCats).map(([k, v]) => [k, v.en, v.bn]), pCat, 'data-pcat')}</div>
    <div class="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
      <ul class="rounded-lg border border-rule bg-card divide-y divide-rule overflow-hidden min-w-0">
        ${list.map((p) => { const q = store.basket[p.id] || 0; const out = p.stock === 0; return `
        <li class="flex items-center gap-3 px-4 py-3">
          <span class="w-12 h-12 rounded-lg bg-tulsi-wash text-tulsi grid place-items-center shrink-0"><i data-lucide="${p.icon}" class="w-6 h-6"></i></span>
          <span class="flex-1 min-w-0"><span class="block font-semibold leading-tight">${t(p.name, p.nameBn)}${p.isNew ? ` <span class="chip h-5 px-1.5 text-[11px] bg-marigold align-middle">${t('New', 'নতুন')}</span>` : ''}</span>
            <span class="block text-sm text-ink-3">${p.pot}${!out && p.stock <= 5 ? ` · <span class="text-sindoor-deep font-medium">${t(`only ${p.stock} left`, `মাত্র ${bnD(p.stock)}টি বাকি`)}</span>` : ''}</span>
            <span class="block sm:hidden mt-0.5"><span class="font-semibold text-tulsi">${inr(price(p))}</span> <span class="text-[12.5px] text-ink-3 line-through">${inr(p.price)}</span></span></span>
          <span class="hidden sm:block text-right mr-2"><span class="block font-semibold text-tulsi">${inr(price(p))}</span><span class="block text-[12.5px] text-ink-3 line-through">${inr(p.price)}</span></span>
          ${out ? `<button type="button" class="btn btn-line btn-sm shrink-0" data-notify="${p.id}" aria-pressed="${store.notifyMe.has(p.id)}">${store.notifyMe.has(p.id) ? `<i data-lucide="bell-ring"></i>${t('We’ll tell you', 'জানাব')}` : `<i data-lucide="bell"></i>${t('Notify me', 'জানাবেন')}`}</button>`
            : q ? `<span class="flex items-center gap-1 shrink-0"><button type="button" class="w-9 h-9 rounded-full border border-rule grid place-items-center hover:bg-paper-2" data-dec="${p.id}" aria-label="${L(`One fewer ${p.name}`, `${p.nameBn} একটি কমান`)}"><i data-lucide="minus" class="w-4 h-4"></i></button><output class="w-6 text-center font-semibold num">${dn(q)}</output><button type="button" class="w-9 h-9 rounded-full border border-rule grid place-items-center hover:bg-paper-2" data-inc="${p.id}" aria-label="${L(`One more ${p.name}`, `${p.nameBn} আরও একটি`)}" ${q >= p.stock ? 'disabled' : ''}><i data-lucide="plus" class="w-4 h-4"></i></button></span>`
            : `<button type="button" class="btn btn-line btn-sm shrink-0" data-inc="${p.id}"><i data-lucide="plus"></i>${t('Add', 'যোগ')}</button>`}
        </li>`; }).join('')}
      </ul>
      <aside class="min-w-0 lg:sticky lg:top-24 ${count ? 'max-lg:fixed max-lg:inset-x-0 max-lg:bottom-[calc(66px+env(safe-area-inset-bottom))] max-lg:z-30 max-lg:px-4' : ''}">
        ${count ? `
        <div class="rounded-lg border-2 border-tulsi bg-card p-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,.3)] lg:shadow-none">
          <div class="flex items-center gap-3">
            <div class="flex-1 min-w-0"><p class="font-semibold">${t(`${count} plant${count === 1 ? '' : 's'} · ${'₹' + total}`, `${bnD(count)}টি গাছ · ₹${bnD(total)}`)}</p><p class="text-sm text-tulsi">${t(`You save ₹${saved}`, `আপনার সাশ্রয় ₹${bnD(saved)}`)}</p></div>
            <button type="button" class="btn btn-ghost btn-sm" id="basket-clear">${t('Clear', 'মুছুন')}</button>
          </div>
          <ul class="hidden lg:block mt-3 text-sm divide-y divide-rule border-y border-rule">${lines.map((l) => `<li class="flex justify-between py-1.5"><span>${dn(l.q)} × ${t(l.p.name, l.p.nameBn)}</span><span>${inr(l.q * price(l.p))}</span></li>`).join('')}</ul>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <button type="button" class="btn btn-ink" id="reserve">${t('Reserve', 'রিজার্ভ')}</button>
            <a class="btn btn-line" target="_blank" rel="noopener" href="https://wa.me/${club.whatsapp}?text=${encodeURIComponent(waText)}"><i data-lucide="message-circle"></i>WhatsApp</a>
          </div>
        </div>` : `<div class="hidden lg:block">${empty({ icon: 'shopping-basket', en: 'Your basket is empty', bn: 'ঝুড়ি খালি', subEn: 'Add plants to reserve them for pickup.', subBn: 'নিয়ে যেতে গাছ যোগ করুন।' })}</div>`}
      </aside>
    </div>
    ${count ? '<div class="h-28 lg:hidden" aria-hidden="true"></div>' : ''}`);
  $$('[data-pcat]').forEach((b) => b.addEventListener('click', () => { pCat = b.dataset.pcat; renderNursery(); }));
  const keep = (fn) => (b) => b.addEventListener('click', () => { const sc = window.scrollY; fn(b); renderNursery(); window.scrollTo(0, sc); });
  $$('[data-inc]').forEach(keep((b) => { store.basket[b.dataset.inc] = (store.basket[b.dataset.inc] || 0) + 1; }));
  $$('[data-dec]').forEach(keep((b) => { store.basket[b.dataset.dec] = Math.max(0, (store.basket[b.dataset.dec] || 0) - 1); }));
  $$('[data-notify]').forEach(keep((b) => { const id = b.dataset.notify; store.notifyMe.has(id) ? store.notifyMe.delete(id) : store.notifyMe.add(id); }));
  $('#basket-clear')?.addEventListener('click', () => { store.basket = {}; renderNursery(); });
  $('#reserve')?.addEventListener('click', () => openSheet(`
    ${sheetHead('Reserve for pickup', 'নিয়ে যাওয়ার জন্য রিজার্ভ', 'Pay at the counter when you collect, by cash or UPI.', 'নেওয়ার সময় কাউন্টারে নগদ বা ইউপিআই-এ দিন।')}
    <ul class="mt-4 text-[15px] divide-y divide-rule border-y border-rule">${lines.map((l) => `<li class="flex justify-between py-2"><span>${dn(l.q)} × ${t(l.p.name, l.p.nameBn)}</span><span>${inr(l.q * price(l.p))}</span></li>`).join('')}<li class="flex justify-between py-2 font-semibold"><span>${t('Member total', 'সদস্য মোট')}</span><span>${inr(total)}</span></li></ul>
    <form id="res-form" class="mt-4 space-y-4" novalidate>
      <fieldset><legend class="label">${t('Pickup day', 'কবে নেবেন')}</legend>
        <div class="grid grid-cols-2 gap-2">${[['2026-11-21', 'sat'], ['2026-11-22', 'sun']].map(([d], i) => `<label class="rounded-[7px] border-2 border-rule p-3 cursor-pointer has-[:checked]:border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sindoor"><input type="radio" name="day" value="${d}" class="sr-only" ${i ? '' : 'checked'} /><span class="block font-semibold">${fdate(d, { day: true, year: false })}</span><span class="text-sm text-ink-2">${t('7–10 am', 'সকাল ৭–১০টা')}</span></label>`).join('')}</div></fieldset>
      <p class="text-sm text-ink-2">${t('We hold reserved plants until 10 am on your pickup day.', 'রিজার্ভ করা গাছ নেওয়ার দিন সকাল ১০টা পর্যন্ত রাখা থাকবে।')}</p>
      <button class="btn btn-primary w-full h-12">${t('Confirm reservation', 'রিজার্ভেশন নিশ্চিত করুন')}</button>
    </form>`, { onMount: (b) => b.querySelector('#res-form').addEventListener('submit', (e) => {
      e.preventDefault(); if (!needOnline()) return;
      const day = b.querySelector('[name=day]:checked').value;
      lines.forEach((l) => { l.p.stock -= l.q; });
      store.basket = {};
      renderNursery();
      paint(b, donePanel({ icon: 'sprout', en: 'Plants reserved', bn: 'গাছ রিজার্ভ হয়েছে', subEn: 'Sutapa Bose will keep them aside. Show your member card at the counter.', subBn: 'সুতপা বসু আলাদা করে রাখবেন। কাউন্টারে সদস্য কার্ড দেখান।', ref: `NR-${day.slice(8)}-${String(total).padStart(4, '0')}`, extra: `<p class="mt-2 text-[15px]">${fdate(day, { day: true, year: false })} · ${t('7–10 am', 'সকাল ৭–১০টা')}</p>` }));
    }) }));
}

/* ---------- Help & contact ---------- */
function renderHelp() {
  const wa = (phone, text) => `https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  paint('#s-help', `
    ${pageHead({ en: 'Help & contact', bn: 'সাহায্য ও যোগাযোগ', subEn: 'Ask the right person on the committee, or write to us here.', subBn: 'কমিটির ঠিক মানুষটিকে জিজ্ঞেস করুন, বা এখান থেকে লিখুন।' })}
    <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
      <div class="min-w-0 space-y-6">
        <section aria-labelledby="who-h">
          <h2 id="who-h" class="text-[13px] font-bold uppercase tracking-wide text-ink-2">${t('Who to ask', 'কাকে জিজ্ঞেস করবেন')}</h2>
          <ul class="mt-2 grid gap-2 md:grid-cols-2">
            ${contacts.map((c) => `<li class="rounded-lg border border-rule bg-card p-4">
              <p class="text-[12.5px] font-semibold text-sindoor">${t(c.role, c.roleBn)}</p>
              <p class="font-semibold">${t(c.name, c.nameBn)}</p>
              <p class="text-sm text-ink-2">${t(c.for, c.forBn)}</p>
              <div class="mt-3 flex gap-2">
                <a href="tel:+91${c.phone.replace(/\D/g, '')}" class="btn btn-line btn-sm flex-1"><i data-lucide="phone"></i>${t('Call', 'ফোন')}</a>
                <a href="${wa(c.phone, `Namaskar, this is ${profile.name} (${profile.family}).`)}" target="_blank" rel="noopener" class="btn btn-line btn-sm flex-1"><i data-lucide="message-circle"></i>WhatsApp</a>
              </div>
            </li>`).join('')}
          </ul>
        </section>
        <section aria-labelledby="faq-h">
          <h2 id="faq-h" class="text-[13px] font-bold uppercase tracking-wide text-ink-2">${t('Common questions', 'সাধারণ প্রশ্ন')}</h2>
          <div class="mt-2 rounded-lg border border-rule bg-card divide-y divide-rule">
            ${faq.map(([q, qb, a, ab]) => `<details class="group px-4">
              <summary class="flex items-center gap-3 py-3.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-semibold">${t(q, qb)}<i data-lucide="chevron-down" class="ml-auto w-4 h-4 shrink-0 transition-transform group-open:rotate-180"></i></summary>
              <p class="pb-4 -mt-1 text-[15px] text-ink-2 leading-relaxed">${t(a, ab)}</p>
            </details>`).join('')}
          </div>
        </section>
      </div>
      <aside class="min-w-0 space-y-4 lg:sticky lg:top-24">
        <form id="msg-form" class="rounded-lg border-2 border-ink bg-card p-4 sm:p-5 space-y-4" novalidate>
          <h2 class="font-display text-xl">${t('Write to the committee', 'কমিটিকে লিখুন')}</h2>
          <div><label class="label" for="m-topic">${t('About', 'বিষয়')}</label>
            <select id="m-topic" class="field">${[['Dues or a receipt', 'চাঁদা বা রসিদ'], ['My family or ID card', 'পরিবার বা আইডি কার্ড'], ['Events and passes', 'অনুষ্ঠান ও পাস'], ['A suggestion', 'একটি পরামর্শ'], ['A complaint', 'একটি অভিযোগ'], ['A problem with the app', 'অ্যাপে সমস্যা']].map(([en, bn]) => `<option>${L(en, bn)}</option>`).join('')}</select></div>
          <div data-field><label class="label" for="m-body">${t('Message', 'বার্তা')}</label><textarea id="m-body" rows="5" class="field" maxlength="600"></textarea></div>
          <label class="flex items-center gap-2 text-[15px]"><input type="checkbox" checked class="w-4 h-4 accent-[#2b2f36]" />${t('Reply on WhatsApp', 'হোয়াটসঅ্যাপে উত্তর দিন')}</label>
          <button class="btn btn-primary w-full h-12">${t('Send', 'পাঠান')}</button>
        </form>
        <div class="rounded-lg border border-rule bg-card p-4 text-[15px]">
          ${sectionTitle('Club room', 'ক্লাব ঘর')}
          <p class="mt-2">${t(club.address, club.addressBn)}</p>
          <p class="text-ink-2">${t('Open every evening, 6–9 pm', 'প্রতি সন্ধ্যা ৬–৯টা খোলা')}</p>
          <a href="tel:+919830012345" class="mt-2 inline-flex items-center gap-2 font-semibold num hover:underline"><i data-lucide="phone" class="w-4 h-4"></i>${club.phone}</a>
        </div>
      </aside>
    </div>`);
  $('#msg-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const body = $('#m-body');
    if (body.value.trim().length < 5) return fieldError(body, 'Write a few words so we know how to help.', 'কী সাহায্য লাগবে, কয়েকটা কথা লিখুন।');
    if (!needOnline()) return;
    body.value = '';
    openSheet(donePanel({ icon: 'send', en: 'Message sent', bn: 'বার্তা পাঠানো হয়েছে', subEn: 'The secretary passes it to the right person. Most messages get a reply within two days.', subBn: 'সম্পাদক ঠিক মানুষের কাছে পৌঁছে দেবেন। বেশিরভাগ বার্তার উত্তর দুই দিনের মধ্যে আসে।', ref: `HM-${String(Date.now()).slice(-5)}` }));
  });
}

export const screens = { catering: renderCatering, nursery: renderNursery, help: renderHelp };
