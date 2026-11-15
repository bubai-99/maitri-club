// Website screens added on top of site.js: notices, notice detail, event detail, chanda, contact, search.
import { t, inr, dn, applyLang, refreshIcons, toast, lang, qr } from './shared.js';
import { PHOTOS, photo, credit } from './photos.js';
import { club, books, plants, committee } from './data.js';
import { events, eventInfo, publicNotices, drive, pujaSpend, documents, contactTopics, askAbout, person, searchPages, searchFaq } from './site-data.js';
import { isoParts, longDate, shortDate, daysUntil, daysLabel, bnNum, ref, validate, enhanceForm, confirmPanel, share, initials } from './site-ui.js';

const $ = (s) => document.querySelector(s);
const wa = (text) => `https://wa.me/${club.whatsapp}?text=${encodeURIComponent(text)}`;
const backLink = (href, en, bn) => `<a href="${href}" class="inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink-2 hover:text-ink" data-no-print><i data-lucide="arrow-left" class="w-4 h-4"></i>${t(en, bn)}</a>`;

export const kindLabel = { service: ['Service', 'সেবা'], sports: ['Sports', 'খেলা'], social: ['Members', 'সদস্য'], puja: ['Puja', 'পূজা'] };

/** Calendar file for an event (all-day). */
export const ics = (e) => {
  const d = e.date.replace(/-/g, '');
  const nx = new Date(`${e.date}T00:00:00Z`); nx.setUTCDate(nx.getUTCDate() + 1);
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Gede Maitree Club//EN', 'BEGIN:VEVENT', `UID:${e.id}@gedemaitreeclub`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${nx.toISOString().slice(0, 10).replace(/-/g, '')}`, `SUMMARY:${e.title} · Gede Maitree Club`, `LOCATION:${e.place}`, `DESCRIPTION:${e.time}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
};
export const eventTime = (e) => t(e.time, eventInfo[e.id]?.timeBn || e.time);

/* =================== Notices =================== */
let noticeTag = 'all';
const tagChip = (n) => `<span class="font-bold uppercase tracking-wide text-sindoor-deep">${t(n.tag, n.tagBn)}</span>`;
export function renderNotices() {
  const tags = [['all', 'All', 'সব'], ...[...new Map(publicNotices.map((n) => [n.tag, [n.tag, n.tag, n.tagBn]])).values()]];
  const count = (k) => (k === 'all' ? publicNotices.length : publicNotices.filter((n) => n.tag === k).length);
  $('#notice-filters').innerHTML = tags.map(([k, en, bn]) => `<button type="button" data-nt="${k}" aria-pressed="${noticeTag === k}" class="chip h-9 px-4 text-[15px] border border-rule bg-card hover:border-ink aria-pressed:bg-ink aria-pressed:text-white aria-pressed:border-ink">${t(en, bn)} <span class="opacity-60 num">${dn(String(count(k)))}</span></button>`).join('');
  const list = publicNotices.filter((n) => noticeTag === 'all' || n.tag === noticeTag);
  $('#notice-count').innerHTML = t(`${list.length} notice${list.length === 1 ? '' : 's'}`, `${bnNum(list.length)}টি নোটিস`);
  $('#notice-list').innerHTML = list.map((n) => {
    const p = isoParts(n.iso);
    return `<li class="border-b border-rule">
      <a href="#notice/${n.id}" class="group grid grid-cols-[56px_1fr_auto] sm:grid-cols-[80px_1fr_auto] gap-x-4 sm:gap-x-6 py-5 items-start">
        <span class="text-sindoor leading-none text-center">
          <span class="block font-display text-[2.4rem] num">${dn(String(p.d))}</span>
          <span class="block text-[12.5px] font-semibold tracking-wide mt-1">${t(p.mon.toUpperCase(), p.monBn)}</span>
        </span>
        <span class="min-w-0">
          <span class="flex flex-wrap items-center gap-2 text-[12.5px]">${tagChip(n)}${n.pinned ? `<span class="chip h-6 px-2 text-[12px] bg-marigold-wash text-ink"><i data-lucide="pin" class="!w-3 !h-3"></i>${t('Pinned', 'পিন করা')}</span>` : ''}</span>
          <span class="block mt-1 text-[19px] font-semibold leading-snug group-hover:underline decoration-1">${t(n.title, n.titleBn)}</span>
          <span class="block mt-1 text-[15px] text-ink-2 leading-snug">${t(n.body, n.bodyBn)}</span>
        </span>
        <i data-lucide="chevron-right" class="w-5 h-5 text-ink-3 mt-2 transition-transform group-hover:translate-x-0.5"></i>
      </a></li>`;
  }).join('');
  $('#notice-filters').querySelectorAll('[data-nt]').forEach((b) => b.addEventListener('click', () => { noticeTag = b.dataset.nt; renderNotices(); }));
  ['#notice-filters', '#notice-count', '#notice-list'].forEach((s) => applyLang($(s)));
  refreshIcons();
}

export function renderNoticeDetail(id) {
  const el = $('#notice-detail');
  const i = publicNotices.findIndex((n) => n.id === id);
  const n = publicNotices[i];
  if (!n) {
    el.innerHTML = `${backLink('#notices', 'All notices', 'সব নোটিস')}
      <h1 class="mt-6 poster text-[clamp(2rem,5vw,3rem)]">${t('This notice has been taken down', 'এই নোটিসটি সরিয়ে নেওয়া হয়েছে')}</h1>
      <p class="mt-3 text-[17px] text-ink-2">${t('It may be old. The current notices are on the board.', 'হয়তো পুরনো। এখনকার নোটিস বোর্ডে আছে।')}</p>`;
  } else {
    const prev = publicNotices[i - 1], next = publicNotices[i + 1];
    const navCard = (x, dir) => x ? `<a href="#notice/${x.id}" class="block rounded-lg border border-rule p-4 hover:border-ink ${dir === 'next' ? 'sm:text-right' : ''}">
      <span class="text-[13px] text-ink-3">${dir === 'next' ? t('Older', 'পুরনো') : t('Newer', 'নতুন')}</span>
      <span class="block font-semibold leading-snug mt-0.5">${t(x.title, x.titleBn)}</span></a>` : '<span></span>';
    el.innerHTML = `${backLink('#notices', 'All notices', 'সব নোটিস')}
      <p class="mt-8 flex flex-wrap items-center gap-3 text-[13px]">${tagChip(n)}<span class="text-ink-2">${longDate(n.iso)}</span></p>
      <h1 class="mt-3 poster text-[clamp(2.2rem,5.5vw,3.6rem)]" tabindex="-1">${t(n.title, n.titleBn)}</h1>
      <div class="mt-6 text-[18px] leading-relaxed text-ink-2 prose-site max-w-[62ch]">
        <p class="text-ink">${t(n.body, n.bodyBn)}</p>
        ${n.more ? `<p>${t(n.more, n.moreBn)}</p>` : ''}
      </div>
      ${n.link ? `<a href="${n.link[0]}" class="btn btn-primary mt-8" data-no-print>${t(n.link[1], n.link[2])}<i data-lucide="arrow-right"></i></a>` : ''}
      <p class="mt-8 text-[15px] text-ink-3">${t('Posted by the club secretary, Rajib Banerjee.', 'ক্লাব সম্পাদক রাজীব ব্যানার্জির পক্ষ থেকে।')}</p>
      <div class="mt-8 pt-6 border-t border-rule flex flex-wrap gap-2" data-no-print>
        <button type="button" class="btn btn-line btn-sm" data-share><i data-lucide="share-2"></i>${t('Share', 'শেয়ার')}</button>
        <a href="${wa(`${n.title}: ${location.origin}${location.pathname}#notice/${n.id}`)}" target="_blank" rel="noopener" class="btn btn-line btn-sm"><i data-lucide="message-circle"></i>${t('Send on WhatsApp', 'হোয়াটসঅ্যাপে পাঠান')}</a>
        <button type="button" class="btn btn-line btn-sm" data-print><i data-lucide="printer"></i>${t('Print', 'প্রিন্ট')}</button>
      </div>
      <nav class="mt-10 grid sm:grid-cols-2 gap-3" aria-label="More notices" data-no-print>${navCard(prev, 'prev')}${navCard(next, 'next')}</nav>
      <p class="print-only mt-8 text-[11px]">Gede Maitree Club · Reg. No. ${club.regNo} · ${club.phone}</p>`;
    el.querySelector('[data-share]').addEventListener('click', () => share(n.title, `#notice/${n.id}`));
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
  }
  applyLang(el); refreshIcons();
  return n ? (lang === 'bn' ? n.titleBn : n.title) : null;
}

/* =================== Event detail =================== */
export function renderEventDetail(id) {
  const el = $('#event-detail');
  const e = events.find((x) => x.id === id);
  if (!e) {
    el.innerHTML = `<div class="mx-auto max-w-[760px] px-5 py-16">${backLink('#events', 'All events', 'সব অনুষ্ঠান')}
      <h1 class="mt-6 poster text-[clamp(2rem,5vw,3rem)]" tabindex="-1">${t('We couldn’t find that event', 'অনুষ্ঠানটি পাওয়া গেল না')}</h1>
      <p class="mt-3 text-[17px] text-ink-2">${t('It may have finished or moved. See what is coming up.', 'হয়তো শেষ হয়েছে বা তারিখ বদলেছে। সামনের অনুষ্ঠান দেখুন।')}</p>
      <a href="#events" class="btn btn-primary mt-6">${t('See all events', 'সব অনুষ্ঠান দেখুন')}</a></div>`;
    applyLang(el); refreshIcons();
    return null;
  }
  const info = eventInfo[e.id] || {};
  const who = person(info.contact || 'Secretary');
  const left = daysUntil(e.date);
  const [kEn, kBn] = kindLabel[e.kind] || ['Event', 'অনুষ্ঠান'];
  const others = events.filter((x) => x.id !== e.id);
  const photoKey = info.photo && PHOTOS[info.photo] ? info.photo : 'pujaNight';
  const localPlace = e.id !== 'picnic';

  el.innerHTML = `
    <div class="page-hero bg-sindoor-wash/50">
      <div class="mx-auto max-w-[1160px] px-5 pt-8 pb-12 lg:pb-16">
        ${backLink('#events', 'All events', 'সব অনুষ্ঠান')}
        <div class="mt-6 grid lg:grid-cols-12 gap-10 items-center">
          <div class="lg:col-span-7">
            <p class="eyebrow text-sindoor flex flex-wrap items-center gap-3"><span>${t(kEn, kBn)}</span><span class="chip h-7 px-3 normal-case tracking-normal text-[13px] ${left >= 0 && left <= 14 ? 'bg-marigold text-ink' : 'bg-card text-ink-2 border border-rule'}">${daysLabel(left)}</span></p>
            <h1 class="mt-3 poster text-[clamp(2.6rem,6.5vw,4.6rem)] text-sindoor" tabindex="-1">${t(e.title, e.titleBn)}</h1>
            <ul class="mt-6 space-y-2.5 text-[17px]">
              <li class="flex gap-3"><i data-lucide="calendar" class="w-5 h-5 text-sindoor shrink-0 mt-0.5"></i><span>${longDate(e.date)}</span></li>
              <li class="flex gap-3"><i data-lucide="clock" class="w-5 h-5 text-sindoor shrink-0 mt-0.5"></i><span>${eventTime(e)}</span></li>
              <li class="flex gap-3"><i data-lucide="map-pin" class="w-5 h-5 text-sindoor shrink-0 mt-0.5"></i><span>${t(e.place, e.placeBn)}${localPlace ? ` · <a href="#contact" class="font-semibold text-sindoor hover:underline">${t('Directions', 'পথ')}</a>` : ''}</span></li>
              <li class="flex gap-3"><i data-lucide="${e.pass ? 'ticket' : 'users'}" class="w-5 h-5 text-sindoor shrink-0 mt-0.5"></i><span>${e.pass ? t('Member pass needed, from the member app', 'সদস্য পাস লাগবে, সদস্য অ্যাপ থেকে') : t('Open to everyone, no pass needed', 'সবার জন্য খোলা, পাস লাগবে না')}</span></li>
            </ul>
            <div class="mt-8 flex flex-wrap gap-2.5" data-no-print>
              ${e.pass ? `<a href="login.html" class="btn btn-primary h-12 px-6"><i data-lucide="ticket"></i>${t('Get your pass', 'পাস নিন')}</a>` : ''}
              <a href="${ics(e)}" download="${e.id}.ics" class="btn ${e.pass ? 'btn-line' : 'btn-primary'} h-12 px-5"><i data-lucide="calendar-plus"></i>${t('Add to calendar', 'ক্যালেন্ডারে রাখুন')}</a>
              <button type="button" class="btn btn-line h-12 px-5" data-share><i data-lucide="share-2"></i>${t('Share', 'শেয়ার')}</button>
            </div>
          </div>
          <figure class="lg:col-span-5 relative aspect-[4/3] border-2 border-ink overflow-hidden bg-paper-2">
            ${photo(photoKey, { cls: 'absolute inset-0 w-full h-full object-cover', sizes: '(min-width: 1024px) 460px, 100vw' })}
            <figcaption class="absolute bottom-2 right-2 text-[11.5px] text-white bg-black/50 px-1.5 rounded">${credit(photoKey)}</figcaption>
          </figure>
        </div>
      </div>
    </div>
    <div class="mx-auto max-w-[1160px] px-5 pt-12 pb-20 grid lg:grid-cols-12 gap-12 items-start">
      <div class="lg:col-span-7">
        <h2 class="poster text-[2.2rem]">${t('About', 'বিস্তারিত')}</h2>
        <p class="mt-3 text-[18px] leading-relaxed text-ink-2 max-w-[60ch]">${info.about ? t(info.about, info.aboutBn) : t('Details will be posted soon.', 'বিস্তারিত শীঘ্রই জানানো হবে।')}</p>
        ${info.schedule ? `<h2 class="mt-12 poster text-[2.2rem]">${t('Programme', 'অনুষ্ঠানসূচি')}</h2>
          <ol class="mt-4 space-y-3 text-[17px] max-w-[560px]">${info.schedule.map(([tm, tmBn, en, bn]) => `<li class="leader"><span>${t(en, bn)}</span><span class="font-semibold num whitespace-nowrap">${t(tm, tmBn)}</span></li>`).join('')}</ol>
          <p class="mt-3 text-sm text-ink-3">${t('Times may shift a little on the day.', 'সেদিন সময় সামান্য এদিক-ওদিক হতে পারে।')}</p>` : ''}
        ${info.bring ? `<h2 class="mt-12 poster text-[2.2rem]">${t('What to bring', 'যা আনবেন')}</h2>
          <ul class="mt-4 space-y-2.5 text-[17px]">${info.bring.map(([en, bn]) => `<li class="flex gap-3"><i data-lucide="check" class="w-5 h-5 text-tulsi shrink-0 mt-0.5"></i><span>${t(en, bn)}</span></li>`).join('')}</ul>` : ''}
      </div>
      <aside class="lg:col-span-5 space-y-5">
        <div class="rounded-lg border-2 border-ink p-6">
          <p class="eyebrow text-ink-2">${t('Questions? Ask', 'প্রশ্ন? জিজ্ঞেস করুন')}</p>
          <div class="mt-3 flex items-center gap-4">
            <span class="w-12 h-12 rounded-full bg-sindoor-wash text-sindoor-deep grid place-items-center font-display text-lg shrink-0" aria-hidden="true">${initials(who)}</span>
            <span><span class="block font-semibold text-[17px]">${t(who.name, who.nameBn)}</span><span class="block text-[15px] text-ink-2">${t(who.role, who.roleBn)}</span></span>
          </div>
          <a href="${wa(`Namaskar, a question about ${e.title} (${e.day} ${e.mon}):`)}" target="_blank" rel="noopener" class="btn btn-line btn-sm mt-5" data-no-print><i data-lucide="message-circle"></i>${t('Ask on WhatsApp', 'হোয়াটসঅ্যাপে জিজ্ঞাসা')}</a>
        </div>
        <div class="rounded-lg bg-ink text-white p-6" data-no-print>
          <i data-lucide="hand-heart" class="w-7 h-7 text-marigold"></i>
          <h2 class="mt-3 font-display text-[1.6rem] leading-tight">${t('Lend a hand', 'হাত লাগান')}</h2>
          <p class="mt-1.5 text-white/80 text-[15px]">${t('Setting up, the gate, serving, clearing up. Even two hours helps.', 'সাজানো, গেট, পরিবেশন, গোছানো। দু-ঘণ্টা দিলেও কাজে লাগে।')}</p>
          <a href="${wa(`I would like to volunteer at ${e.title} on ${e.day} ${e.mon}.`)}" target="_blank" rel="noopener" class="btn bg-white text-ink hover:bg-paper-2 btn-sm mt-5"><i data-lucide="message-circle"></i>${t('I’ll volunteer', 'আমি স্বেচ্ছাসেবক হব')}</a>
        </div>
        ${info.chanda ? `<a href="#chanda" class="block rounded-lg bg-sindoor-wash/70 p-6 hover:bg-sindoor-wash" data-no-print>
          <p class="font-semibold flex items-center gap-2"><i data-lucide="hand-coins" class="w-5 h-5 text-sindoor"></i>${t('Puja chanda', 'পূজার চাঁদা')}</p>
          <p class="mt-1.5 text-[15px] text-ink-2">${t(`${inr(drive.collected)} raised of ${inr(drive.target)}. See the budget and how to give.`, `${inr(drive.target)} লক্ষ্যের মধ্যে ${inr(drive.collected)} উঠেছে। বাজেট ও দেওয়ার উপায় দেখুন।`)}</p></a>` : ''}
      </aside>
      ${others.length ? `<div class="lg:col-span-12 pt-4" data-no-print>
        <h2 class="poster text-[2.2rem]">${t('Also coming up', 'আরও সামনে')}</h2>
        <ul class="mt-5 grid sm:grid-cols-3 gap-4">${others.map((o) => `<li><a href="#event/${o.id}" class="group flex gap-4 items-center rounded-lg border border-rule p-4 hover:border-ink h-full">
          <span class="text-sindoor leading-none text-center w-12 shrink-0"><span class="block font-display text-[2rem] num">${dn(o.day)}</span><span class="block text-[12px] font-semibold mt-0.5">${t(o.mon.toUpperCase(), o.monBn)}</span></span>
          <span class="min-w-0"><span class="block font-semibold leading-snug group-hover:underline">${t(o.title, o.titleBn)}</span><span class="block text-sm text-ink-2 mt-0.5">${t(o.place, o.placeBn)}</span></span></a></li>`).join('')}</ul></div>` : ''}
    </div>`;
  el.querySelector('[data-share]').addEventListener('click', () => share(e.title, `#event/${e.id}`));
  applyLang(el); refreshIcons();
  return lang === 'bn' ? e.titleBn : e.title;
}

/* =================== Durga Puja breakdown (home + chanda) =================== */
export function renderPujaBreakdown(totalSel, barSel, legendSel) {
  const total = pujaSpend.reduce((a, b) => a + b.v, 0);
  $(totalSel).innerHTML = inr(total);
  const bar = $(barSel);
  bar.innerHTML = pujaSpend.map((p) => `<div style="flex:${p.v};background:${p.c}" class="h-full border-r-2 border-paper last:border-r-0" title="${lang === 'bn' ? p.bn : p.en}"></div>`).join('');
  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;
  bar.setAttribute('aria-label', lang === 'bn'
    ? `দুর্গাপূজা ২০২৬-এর খরচ: ${pujaSpend.map((p) => `${p.bn} ${bnNum(fmt(p.v))}`).join(', ')}`
    : `Durga Puja 2026 spending: ${pujaSpend.map((p) => `${p.en} ${fmt(p.v)}`).join(', ')}`);
  $(legendSel).innerHTML = pujaSpend.map((p) => `
    <li class="flex items-center gap-3 py-2.5 border-b border-rule">
      <span class="w-3 h-3 rounded-sm shrink-0" style="background:${p.c}" aria-hidden="true"></span>
      <span class="text-[15px]">${t(p.en, p.bn)}</span>
      <span class="ml-auto text-[15px] font-semibold">${inr(p.v)}</span>
      <span class="w-10 text-right text-[13px] text-ink-3 num">${dn(`${Math.round((p.v / total) * 100)}%`)}</span>
    </li>`).join('');
  applyLang($(legendSel));
}

/* =================== Chanda & accounts =================== */
let pledgeAmt = 501;
const AMOUNTS = [101, 251, 501, 1001, 2001];
export function renderChanda() {
  const pct = Math.round((drive.collected / drive.target) * 100);
  $('#drive-title').innerHTML = `${t(drive.event, drive.eventBn)} <span class="block mt-2 font-sans text-[17px] text-ink-2 tracking-normal">${t(drive.date, drive.dateBn)} · <a href="#event/saraswati" class="font-semibold text-sindoor hover:underline">${t('Puja details', 'পূজার বিস্তারিত')}</a></span>`;
  $('#drive-got').innerHTML = inr(drive.collected);
  $('#drive-of').innerHTML = `${t('raised of', 'উঠেছে, লক্ষ্য')} ${inr(drive.target)} · <strong class="text-ink num">${dn(`${pct}%`)}</strong>`;
  const bar = $('#drive-bar');
  bar.setAttribute('aria-valuenow', String(pct));
  bar.setAttribute('aria-label', lang === 'bn' ? `লক্ষ্যের ${bnNum(pct)}% উঠেছে` : `${pct}% of the target raised`);
  bar.firstElementChild.style.width = `${Math.min(100, pct)}%`;
  const days = daysUntil('2027-02-11');
  const stat = (v, en, bn) => `<div class="bg-paper p-4"><dt class="text-[13px] text-ink-2">${t(en, bn)}</dt><dd class="mt-1 font-display text-[1.9rem] leading-none">${v}</dd></div>`;
  $('#drive-stats').innerHTML = stat(dn(`${drive.visited}/${drive.houses}`), 'Houses visited', 'বাড়িতে যাওয়া হয়েছে')
    + stat(dn(String(drive.sponsors.length)), 'Sponsors', 'স্পনসর')
    + stat(dn(String(Math.max(0, days))), 'Days to the puja', 'পূজা আর কত দিন');
  $('#drive-updated').innerHTML = t(`Updated ${drive.updated} by the treasurer. Figures come straight from the club khata.`, `কোষাধ্যক্ষের হালনাগাদ, ${drive.updatedBn}। অঙ্ক সরাসরি ক্লাবের খাতা থেকে।`);

  const btotal = drive.budget.reduce((a, b) => a + b.amount, 0);
  $('#drive-budget').innerHTML = drive.budget.map((b) => `<li class="leader"><span>${t(b.head, b.headBn)}</span><span class="font-semibold">${inr(b.amount)}</span></li>`).join('')
    + `<li class="flex items-baseline justify-between pt-3 mt-1 border-t-2 border-ink font-semibold"><span>${t('Total', 'মোট')}</span><span>${inr(btotal)}</span></li>`;

  $('#drive-lanes').innerHTML = drive.areas.map((a) => {
    const p = Math.round((a.got / a.target) * 100);
    return `<tr class="border-b border-rule">
      <th scope="row" class="py-3 pr-4 text-left font-semibold">${t(a.lane, a.laneBn)}</th>
      <td class="py-3 pr-4 text-ink-2">${a.volunteer}</td>
      <td class="py-3 pr-4 num">${dn(`${a.visited} / ${a.houses}`)}</td>
      <td class="py-3"><div class="flex items-center gap-3"><div class="flex-1 h-2 bg-paper-2 rounded-full overflow-hidden" aria-hidden="true"><div class="h-full bg-sindoor rounded-full bar-grow" style="width:${Math.min(100, p)}%"></div></div><span class="whitespace-nowrap text-[14px]"><strong>${inr(a.got)}</strong> <span class="text-ink-3">/ ${inr(a.target)}</span></span></div></td>
    </tr>`;
  }).join('');

  $('#upi-id').textContent = club.upi;
  const qrEl = $('#upi-qr');
  if (!qrEl.dataset.done) { qr(qrEl, `upi://pay?pa=${club.upi}&pn=Gede%20Maitree%20Club&tn=Saraswati%20Puja%20chanda&cu=INR`); qrEl.dataset.done = '1'; }

  const laneNow = $('#pledge-lane').value;
  $('#pledge-lane').innerHTML = drive.areas.map((a) => `<option value="${a.lane}">${lang === 'bn' ? a.laneBn : a.lane}</option>`).join('')
    + `<option value="outside">${lang === 'bn' ? 'পাড়ার বাইরে' : 'Outside the para'}</option>`;
  if (laneNow) $('#pledge-lane').value = laneNow;
  renderAmounts();

  $('#drive-sponsors').innerHTML = drive.sponsors.map((s) => `<li class="flex flex-wrap items-center gap-x-4 gap-y-1 py-4 border-b border-rule">
      <span class="min-w-0 flex-1"><span class="block font-semibold text-[17px]">${t(s.name, s.nameBn)}</span><span class="block text-[14px] text-ink-2">${t(s.gives, s.givesBn)}</span></span>
      <span class="font-semibold">${inr(s.amount)}</span>
      ${s.status === 'paid' ? `<span class="chip bg-tulsi-wash text-tulsi"><i data-lucide="check"></i>${t('Paid', 'দেওয়া হয়েছে')}</span>` : `<span class="chip bg-paper-2 text-ink-2"><i data-lucide="clock"></i>${t('Promised', 'প্রতিশ্রুত')}</span>`}
    </li>`).join('');

  renderPujaBreakdown('#puja-total-2', '#puja-bar-2', '#puja-legend-2');

  const bookCls = { club: 'book-club', catering: 'book-catering', nursery: 'book-nursery' };
  $('#books').innerHTML = Object.entries(books).map(([k, b]) => `<article class="${bookCls[k]} rounded-lg border border-rule border-t-4 p-6" style="border-top-color:var(--book)">
      <h3 class="font-display text-[1.6rem] leading-tight" style="color:var(--book)">${t(`${b.en} book`, `${b.bn} খাতা`)}</h3>
      <dl class="mt-4 space-y-2 text-[15px]">
        <div class="flex justify-between"><dt class="text-ink-2">${t('Income', 'আয়')}</dt><dd class="font-semibold">${inr(b.income)}</dd></div>
        <div class="flex justify-between"><dt class="text-ink-2">${t('Spent', 'খরচ')}</dt><dd class="font-semibold">${inr(b.expense)}</dd></div>
        <div class="flex justify-between pt-2 border-t border-rule"><dt class="font-semibold">${t('Surplus', 'উদ্বৃত্ত')}</dt><dd class="font-display text-[1.5rem] leading-none" style="color:var(--book)">${inr(b.income - b.expense)}</dd></div>
      </dl></article>`).join('');

  $('#documents').innerHTML = documents.map((d, i) => `<li class="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 border-b border-rule">
      <span class="w-10 h-10 rounded-lg bg-paper-2 grid place-items-center shrink-0"><i data-lucide="file-text" class="w-5 h-5 text-ink-2"></i></span>
      <span class="min-w-0 flex-1"><span class="block font-semibold">${t(d.en, d.bn)}</span><span class="block text-[14px] text-ink-2"><span class="num">${t(d.note, d.noteBn)}</span> · PDF · ${t(d.size, d.sizeBn)}</span></span>
      <button type="button" class="btn btn-line btn-sm" data-doc="${i}"><i data-lucide="external-link"></i>${t('Open', 'খুলুন')}</button>
    </li>`).join('');
  $('#documents').querySelectorAll('[data-doc]').forEach((b) => b.addEventListener('click', () => toast(`<i data-lucide="info"></i>${t('Prototype: the PDF opens here once the club uploads it.', 'প্রোটোটাইপ: ক্লাব আপলোড করলে এখানে PDF খুলবে।')}`)));

  applyLang($('[data-screen="chanda"]')); refreshIcons();
}
function renderAmounts() {
  const wrap = $('#pledge-amounts');
  wrap.innerHTML = AMOUNTS.map((a) => `<button type="button" class="amt-chip" data-amt="${a}" aria-pressed="${pledgeAmt === a}">${inr(a)}</button>`).join('');
  $('#pledge-amount').value = pledgeAmt || '';
  wrap.querySelectorAll('[data-amt]').forEach((b) => b.addEventListener('click', () => {
    pledgeAmt = Number(b.dataset.amt);
    $('#pledge-amount').value = pledgeAmt;
    $('#pledge-amount').dispatchEvent(new Event('input', { bubbles: true }));
  }));
}
export function initChandaForm() {
  const form = $('#pledge-form');
  enhanceForm(form);
  $('#pledge-amount').addEventListener('input', (e) => {
    pledgeAmt = Number(e.target.value) || 0;
    $('#pledge-amounts').querySelectorAll('[data-amt]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.amt) === pledgeAmt)));
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    const fd = new FormData(form);
    const amt = Number(fd.get('amount'));
    const lane = drive.areas.find((a) => a.lane === fd.get('lane'));
    const rupees = `₹${amt.toLocaleString('en-IN')}`;
    const r = ref('CH');
    const how = {
      upi: [`Pay ${rupees} by UPI to ${club.upi}. Put ${r} in the note.`, `${club.upi}-এ ইউপিআই দিয়ে ${bnNum(rupees)} পাঠান। নোটে ${r} লিখুন।`],
      club: ['Come to the club room any evening, 6 to 9 pm. The treasurer gives you a receipt.', 'যেকোনো সন্ধ্যা ৬টা থেকে ৯টার মধ্যে ক্লাব ঘরে আসুন। কোষাধ্যক্ষ রসিদ দেবেন।'],
      visit: lane ? [`${lane.volunteer}, who looks after ${lane.lane}, will call you to fix a time.`, `${lane.laneBn}-র দায়িত্বে থাকা ${lane.volunteer} ফোন করে সময় ঠিক করবেন।`] : ['A volunteer will call you to fix a time.', 'একজন স্বেচ্ছাসেবক ফোন করে সময় ঠিক করবেন।'],
    }[fd.get('method')];
    confirmPanel(form, 'Thank you', 'ধন্যবাদ', [
      [`Your pledge of ${rupees} for Saraswati Puja is noted.`, `সরস্বতী পূজার জন্য আপনার ${bnNum(rupees)} অঙ্গীকার লেখা হল।`],
      how,
      fd.get('anon') ? ['Your name stays off the public list. You still get a receipt.', 'প্রকাশ্য তালিকায় আপনার নাম থাকবে না। রসিদ পাবেন।'] : ['Your name goes on the list of givers after the puja.', 'পূজার পরে দাতাদের তালিকায় আপনার নাম থাকবে।'],
    ], ['Make another pledge', 'আরেকটি অঙ্গীকার'], { refNo: r });
  });
}

/* =================== Contact =================== */
const MAP = `<svg viewBox="0 0 640 400" class="block w-full h-auto" role="img" aria-label="Sketch map of Netaji Para showing the club room beside School Road, at the north corner of the para ground" font-family="Anek Bangla Variable, sans-serif">
  <rect width="640" height="400" fill="#f2f1ef"/>
  <g fill="#e2e0dc">
    <rect x="20" y="20" width="80" height="200" rx="3"/><rect x="160" y="20" width="70" height="90" rx="3"/><rect x="160" y="130" width="70" height="90" rx="3"/>
    <rect x="460" y="20" width="160" height="90" rx="3"/><rect x="460" y="130" width="70" height="90" rx="3"/><rect x="560" y="280" width="60" height="100" rx="3"/>
    <rect x="200" y="280" width="200" height="100" rx="3"/><rect x="460" y="280" width="70" height="100" rx="3"/>
  </g>
  <ellipse cx="100" cy="330" rx="72" ry="42" fill="#e1e6f1" stroke="#b9c3d6" stroke-width="1.5"/>
  <text x="100" y="335" text-anchor="middle" font-size="13" fill="#4b5059" data-bn="পুকুর">Pond</text>
  <rect x="250" y="40" width="160" height="180" rx="4" fill="#d9ead6" stroke="#2c6a3a" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="330" y="140" text-anchor="middle" font-size="14" font-weight="600" fill="#2c6a3a" data-bn="পাড়ার মাঠ">Para ground</text>
  <g fill="none" stroke-linecap="round">
    <path d="M0 250 H640" stroke="#c9c6c0" stroke-width="30"/><path d="M0 250 H640" stroke="#fff" stroke-width="26"/>
    <path d="M430 0 V400" stroke="#c9c6c0" stroke-width="24"/><path d="M430 0 V400" stroke="#fff" stroke-width="20"/>
    <path d="M130 250 V0" stroke="#c9c6c0" stroke-width="16"/><path d="M130 250 V0" stroke="#fff" stroke-width="12"/>
    <path d="M240 250 V0" stroke="#c9c6c0" stroke-width="16"/><path d="M240 250 V0" stroke="#fff" stroke-width="12"/>
    <path d="M545 250 V400" stroke="#c9c6c0" stroke-width="16"/><path d="M545 250 V400" stroke="#fff" stroke-width="12"/>
    <path d="M180 250 C 180 300, 190 360, 180 400" stroke="#c9c6c0" stroke-width="14"/><path d="M180 250 C 180 300, 190 360, 180 400" stroke="#fff" stroke-width="10"/>
    <path d="M410 70 H430" stroke="#2b2f36" stroke-width="2" stroke-dasharray="3 3"/>
  </g>
  <g font-size="12.5" fill="#4b5059">
    <text x="24" y="246" data-bn="নেতাজি সুভাষ রোড">Netaji Subhas Road</text>
    <text x="436" y="246" data-bn="মোড়">Crossing</text>
    <text transform="translate(447 380) rotate(-90)" data-bn="স্কুল রোড">School Road</text>
    <text transform="translate(135 200) rotate(-90)" font-size="11.5" data-bn="১ নং গলি">Lane 1</text>
    <text transform="translate(245 200) rotate(-90)" font-size="11.5" data-bn="২ নং গলি">Lane 2</text>
    <text transform="translate(550 390) rotate(-90)" font-size="11.5" data-bn="৩ নং গলি">Lane 3</text>
    <text x="190" y="396" font-size="11.5" data-bn="পুকুর পাড়">Pukur Par</text>
  </g>
  <g transform="translate(398 70)">
    <circle r="26" fill="#d21f1b" opacity=".14"/>
    <path d="M0 -30 C -12 -30 -20 -21 -20 -10 C -20 4 0 22 0 22 C 0 22 20 4 20 -10 C 20 -21 12 -30 0 -30 Z" transform="translate(0 -10)" fill="#d21f1b" stroke="#fff" stroke-width="2"/>
    <circle cy="-20" r="7" fill="#fff"/>
  </g>
  <g transform="translate(276 22)">
    <rect x="0" y="-14" width="104" height="22" rx="4" fill="#2b2f36"/>
    <text x="52" y="1.5" text-anchor="middle" font-size="12.5" font-weight="600" fill="#fff" data-bn="মৈত্রী ক্লাব ঘর">Maitree club room</text>
  </g>
  <g transform="translate(600 46)" fill="#2b2f36">
    <circle r="16" fill="#fff" stroke="#2b2f36" stroke-width="1.5"/>
    <path d="M0 -11 L5 4 L0 1 L-5 4 Z"/>
    <text y="13" text-anchor="middle" font-size="9" font-weight="700">N</text>
  </g>
</svg>`;

export function renderContact() {
  $('#para-map').innerHTML = MAP;
  const sel = $('#contact-topic');
  const cur = sel.value || 'membership';
  sel.innerHTML = contactTopics.map((c) => `<option value="${c.key}" ${c.key === cur ? 'selected' : ''}>${lang === 'bn' ? c.bn : c.en}</option>`).join('');
  updateWho();
  $('#who-to-ask').innerHTML = committee.map((c) => {
    const a = askAbout[c.role] || ['', ''];
    return `<li class="flex gap-4 py-5 border-b border-rule">
      <span class="w-11 h-11 rounded-full bg-sindoor-wash text-sindoor-deep grid place-items-center font-display text-lg shrink-0" aria-hidden="true">${initials(c)}</span>
      <span class="min-w-0"><span class="block font-semibold">${t(c.name, c.nameBn)} <span class="font-normal text-ink-3">· ${t(c.role, c.roleBn)}</span></span><span class="block text-[15px] text-ink-2 mt-0.5">${t(a[0], a[1])}</span></span>
    </li>`;
  }).join('');
  applyLang($('[data-screen="contact"]')); refreshIcons();
}
function updateWho() {
  const topic = contactTopics.find((c) => c.key === $('#contact-topic').value) || contactTopics[0];
  const p = person(topic.role);
  $('#contact-who').innerHTML = t(`Goes to ${p.name}, ${p.role.toLowerCase()}.`, `যাবে ${p.nameBn}-র কাছে (${p.roleBn})।`);
  applyLang($('#contact-who'));
}
export function initContactForm() {
  const form = $('#contact-form');
  enhanceForm(form);
  $('#contact-topic').addEventListener('change', updateWho);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    const fd = new FormData(form);
    const topic = contactTopics.find((c) => c.key === fd.get('topic')) || contactTopics[0];
    const p = person(topic.role);
    confirmPanel(form, 'Message received', 'বার্তা পেয়েছি', [
      [`Your message is with ${p.name}, ${p.role.toLowerCase()}.`, `আপনার বার্তা ${p.nameBn}-র (${p.roleBn}) কাছে।`],
      fd.get('reply') === 'call' ? ['They will call you within a day.', 'এক দিনের মধ্যে ফোন করবেন।'] : ['They will reply on WhatsApp within a day.', 'এক দিনের মধ্যে হোয়াটসঅ্যাপে উত্তর দেবেন।'],
      [`Urgent? Call ${club.phone}.`, `জরুরি হলে ফোন করুন ${bnNum(club.phone)}।`],
    ], ['Write another message', 'আরেকটি বার্তা'], { refNo: ref('GMC') });
  });
}

/* =================== Site search =================== */
const ICON = { page: 'file-text', event: 'calendar', notice: 'megaphone', plant: 'sprout', person: 'user', faq: 'circle-help' };
const GROUP = { page: ['Pages', 'পাতা'], event: ['Events', 'অনুষ্ঠান'], notice: ['Notices', 'নোটিস'], plant: ['Plants', 'গাছ'], person: ['Committee', 'কমিটি'], faq: ['Questions', 'প্রশ্ন'] };
function searchIndex() {
  const L = (en, bn) => (lang === 'bn' ? bn : en);
  return [
    ...searchPages.map((p) => ({ type: 'page', href: p.href, title: L(p.en, p.bn), sub: '', hay: `${p.en} ${p.bn} ${p.k}` })),
    ...events.map((e) => ({ type: 'event', href: `#event/${e.id}`, title: L(e.title, e.titleBn), sub: `${L(`${e.day} ${e.mon}`, `${bnNum(e.day)} ${e.monBn}`)} · ${L(e.place, e.placeBn)}`, hay: `${e.title} ${e.titleBn} ${e.place} ${e.placeBn} ${e.kind}` })),
    ...publicNotices.map((n) => ({ type: 'notice', href: `#notice/${n.id}`, title: L(n.title, n.titleBn), sub: L(n.tag, n.tagBn), hay: `${n.title} ${n.titleBn} ${n.body} ${n.bodyBn} ${n.tag} ${n.tagBn}` })),
    ...plants.map((p) => ({ type: 'plant', href: '#nursery', plant: p.name, title: L(p.name, p.nameBn), sub: `₹${p.price} · ${p.pot}${p.stock === 0 ? L(' · out of stock', ' · স্টকে নেই') : ''}`, hay: `${p.name} ${p.nameBn} ${p.cat}` })),
    ...committee.map((c) => ({ type: 'person', href: '#committee', title: L(c.name, c.nameBn), sub: L(c.role, c.roleBn), hay: `${c.name} ${c.nameBn} ${c.role} ${c.roleBn} ${(askAbout[c.role] || []).join(' ')}` })),
    ...searchFaq.map((f) => ({ type: 'faq', href: f.href, title: L(f.en, f.bn), sub: '', hay: `${f.en} ${f.bn}` })),
  ];
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const mark = (s, q) => (q ? s.replace(new RegExp(`(${esc(q)})`, 'i'), '<mark>$1</mark>') : s);

export function initSearch({ onPick } = {}) {
  const dlg = $('#search'), input = $('#search-q'), out = $('#search-results');
  let hits = [], active = 0, opener = null;
  const draw = () => {
    const q = input.value.trim().toLowerCase();
    const toks = q.split(/\s+/).filter(Boolean);
    const all = searchIndex();
    if (!toks.length) {
      const quick = ['#events', '#catering', '#nursery', '#join', '#chanda', '#contact'];
      hits = quick.map((h) => all.find((x) => x.href === h)).filter(Boolean);
    } else {
      hits = all
        .map((x) => {
          const hay = `${x.title} ${x.hay}`.toLowerCase();
          if (!toks.every((tk) => hay.includes(tk))) return null;
          const tl = x.title.toLowerCase();
          return { ...x, score: (tl.startsWith(toks[0]) ? 3 : 0) + (tl.includes(toks[0]) ? 2 : 0) };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .slice(0, 14);
    }
    active = Math.min(active, Math.max(0, hits.length - 1));
    if (!hits.length) {
      out.innerHTML = `<div class="px-4 py-10 text-center">
        <p class="font-semibold">${lang === 'bn' ? `“${input.value}” মেলেনি` : `Nothing for “${input.value.replace(/</g, '&lt;')}”`}</p>
        <p class="mt-1 text-[15px] text-ink-2">${lang === 'bn' ? 'অন্য শব্দে খুঁজুন, বা ক্লাবে জিজ্ঞেস করুন।' : 'Try another word, or ask the club.'}</p>
        <a href="#contact" class="btn btn-line btn-sm mt-4" data-hit-link>${lang === 'bn' ? 'যোগাযোগ' : 'Contact the club'}</a></div>`;
      input.removeAttribute('aria-activedescendant');
      out.querySelector('[data-hit-link]').addEventListener('click', close);
      return;
    }
    let lastType = '';
    const head = toks.length ? '' : `<p class="search-group">${lang === 'bn' ? 'দ্রুত যান' : 'Go to'}</p>`;
    out.innerHTML = head + hits.map((h, i) => {
      const g = toks.length && h.type !== lastType ? `<p class="search-group" role="presentation">${lang === 'bn' ? GROUP[h.type][1] : GROUP[h.type][0]}</p>` : '';
      lastType = h.type;
      return `${g}<a id="sr-${i}" role="option" aria-selected="${i === active}" href="${h.href}" data-i="${i}" class="search-hit">
        <span class="w-9 h-9 rounded-lg bg-paper-2 grid place-items-center shrink-0"><i data-lucide="${ICON[h.type]}" class="w-[18px] h-[18px] text-ink-2"></i></span>
        <span class="min-w-0 flex-1"><span class="block font-semibold leading-snug truncate">${mark(h.title, toks[0])}</span>${h.sub ? `<span class="block text-[13px] text-ink-3 truncate">${h.sub}</span>` : ''}</span>
        <i data-lucide="corner-down-left" class="w-4 h-4 text-ink-3 shrink-0 ${i === active ? '' : 'invisible'}"></i></a>`;
    }).join('');
    input.setAttribute('aria-activedescendant', `sr-${active}`);
    refreshIcons();
  };
  const setActive = (i) => {
    active = (i + hits.length) % hits.length;
    out.querySelectorAll('.search-hit').forEach((a, j) => {
      a.setAttribute('aria-selected', String(j === active));
      a.lastElementChild?.classList.toggle('invisible', j !== active);
    });
    input.setAttribute('aria-activedescendant', `sr-${active}`);
    out.querySelector(`#sr-${active}`)?.scrollIntoView({ block: 'nearest' });
  };
  const pick = (h) => { close(); onPick?.(h); };
  function open() {
    if (!dlg.classList.contains('hidden')) return;
    opener = document.activeElement;
    dlg.classList.remove('hidden');
    document.documentElement.style.overflow = 'hidden';
    input.value = ''; active = 0;
    applyLang(dlg); refreshIcons(); draw();
    requestAnimationFrame(() => input.focus());
  }
  function close() {
    if (dlg.classList.contains('hidden')) return;
    dlg.classList.add('hidden');
    document.documentElement.style.overflow = '';
    opener?.focus?.();
  }
  input.addEventListener('input', () => { active = 0; draw(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (hits.length) setActive(active + 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (hits.length) setActive(active - 1); }
    if (e.key === 'Enter' && hits[active]) { e.preventDefault(); const h = hits[active]; pick(h); if (h.href.startsWith('#')) location.hash = h.href; else location.href = h.href; }
  });
  out.addEventListener('click', (e) => { const a = e.target.closest('.search-hit'); if (a) pick(hits[Number(a.dataset.i)]); });
  dlg.addEventListener('click', (e) => { if (e.target.closest('[data-search-close]')) close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') { // keep focus inside the dialog
      const f = [...dlg.querySelectorAll('input, button, a[href]')].filter((x) => x.offsetParent !== null);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('keydown', (e) => {
    const typing = e.target.closest?.('input, textarea, select, [contenteditable="true"]');
    if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); open(); }
  });
  document.addEventListener('langchange', () => { if (!dlg.classList.contains('hidden')) draw(); });
  return { open, close };
}
