// Committee console: admin registers and tools.
// Audit log, cash & bank, receipts register, blood donors, volunteers, club assets,
// roles & "view as", data export & backup, notice preview, AGM pack, shortcuts and the bell.
// Sample data only. Nothing is sent, banked or restored.
import { t, inr, dn, applyLang, refreshIcons, toast, lang, seal } from './shared.js';
import { peopleOf } from './idcard.js';
import {
  bnText, families, ledger, books, events, club, chanda, notices,
  cashHolders, bank, auditLog, assets, assetLoans, volunteers, volunteerSkills, duties, rolePerms,
} from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const bnD = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
const L = (en, bn) => (lang === 'bn' ? bn : en); // plain text for attributes, messages and CSV
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const chipCls = 'chip h-9 px-3.5 text-sm border border-rule bg-card aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:border-ink';
const ok = (en, bn) => toast(`<i data-lucide="check-circle-2"></i>${t(en, bn)}`);

let C; // helpers handed over by console.js

/* ---------------- Audit log (append-only) ---------------- */
function nowAt() {
  const d = new Date();
  const h24 = d.getHours(), h = h24 % 12 || 12, m = String(d.getMinutes()).padStart(2, '0');
  return [`15 Nov, ${h}:${m} ${h24 >= 12 ? 'pm' : 'am'}`, `১৫ নভে, ${h24 < 12 ? 'সকাল' : h24 < 17 ? 'দুপুর' : 'সন্ধ্যা'} ${bnD(`${h}:${m}`)}`];
}
let auditSeq = 100;
export function logAudit(mod, en, bn, { flag = false } = {}) {
  const [at, atBn] = nowAt();
  if (!MODS[mod]) mod = { meetings: 'notices', chanda: 'khata', dues: 'collect', applications: 'members', cards: 'members', gallery: 'events', profile: 'security' }[mod] || 'form';
  auditLog.unshift({ id: `a${++auditSeq}`, at, atBn, who: 'Tapas Mondal', whoBn: 'তাপস মণ্ডল', mod, en, bn, device: 'Club-room laptop', flag, fresh: true });
  bellItems.unshift({ icon: 'history', en: `Logged: ${en}`, bn: `লগ: ${bn}`, href: '#audit', at: L('just now', 'এইমাত্র') });
  paintBell();
}
const MODS = {
  collect: ['Collect', 'জমা', 'receipts'], receipts: ['Receipts', 'রসিদ', 'receipts'], khata: ['Khata', 'খাতা', 'khata'],
  cash: ['Cash & bank', 'নগদ ও ব্যাংক', 'cash'], members: ['Members', 'সদস্য', 'members'], donors: ['Blood donors', 'রক্তদাতা', 'donors'],
  settings: ['Settings', 'সেটিংস', 'settings'], security: ['Security', 'নিরাপত্তা', 'settings/security'], data: ['Data & backup', 'ডেটা ও ব্যাকআপ', 'settings/data'],
  catering: ['Catering', 'ক্যাটারিং', 'catering'], nursery: ['Nursery', 'নার্সারি', 'nursery'], events: ['Events', 'অনুষ্ঠান', 'events'],
  volunteers: ['Volunteers', 'স্বেচ্ছাসেবক', 'volunteers'], assets: ['Assets', 'সম্পত্তি', 'assets'], notices: ['Notices', 'নোটিস', 'meetings'],
  form: ['Console', 'কনসোল', 'dashboard'],
};
const AUDIT_GROUPS = [
  ['all', 'Everything', 'সব', null],
  ['money', 'Money', 'টাকা', ['collect', 'receipts', 'khata', 'cash']],
  ['members', 'Members', 'সদস্য', ['members', 'donors']],
  ['biz', 'Catering & nursery', 'ক্যাটারিং ও নার্সারি', ['catering', 'nursery']],
  ['club', 'Events & club', 'অনুষ্ঠান ও ক্লাব', ['events', 'volunteers', 'assets', 'notices', 'form']],
  ['admin', 'Settings & security', 'সেটিংস ও নিরাপত্তা', ['settings', 'security', 'data']],
];
let aGroup = 'all', aWho = 'all', aQ = '', aFlag = false;
function auditScreen() {
  const grp = AUDIT_GROUPS.find((g) => g[0] === aGroup)[3];
  const people = [...new Set(auditLog.map((a) => a.who))];
  const rows = auditLog.filter((a) => (!grp || grp.includes(a.mod)) && (aWho === 'all' || a.who === aWho) && (!aFlag || a.flag)
    && `${a.en} ${a.bn} ${a.who} ${a.whoBn}`.toLowerCase().includes(aQ.toLowerCase()));
  C.paint(C.screen('audit'), `
    ${C.pageHead('Audit log', 'অডিট লগ', t('Every entry, change, reversal and sign-in, with who, when and from which device.', 'প্রতিটি এন্ট্রি, পরিবর্তন, উল্টানো ও লগইন: কে, কখন, কোন ডিভাইস থেকে।'), `
      <button class="btn btn-line btn-sm" data-act="audit-csv"><i data-lucide="file-down"></i>${t('Export CSV', 'CSV ডাউনলোড')}</button>
      <button class="btn btn-ink btn-sm" data-act="print-doc"><i data-lucide="printer"></i>${t('Print for the auditor', 'অডিটরের জন্য প্রিন্ট')}</button>`)}
    <div class="rounded-lg border border-rule bg-paper-2/60 px-4 py-3 mb-4 flex items-start gap-3 text-[15px]">
      <i data-lucide="lock" class="w-5 h-5 shrink-0 mt-0.5 text-ink-2"></i>
      <p>${t('This log is append-only. Nobody, not even the secretary, can edit or delete a line. Flagged lines are reversals, rule changes and failed sign-ins.', 'এই লগে শুধু যোগ হয়। কেউ, সম্পাদকও, কোনো লাইন বদলাতে বা মুছতে পারেন না। চিহ্নিত লাইন: উল্টানো, নিয়ম বদল ও ব্যর্থ লগইন।')}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2 mb-4">
      ${AUDIT_GROUPS.map(([k, en, bn]) => `<button data-ag="${k}" aria-pressed="${aGroup === k}" class="${chipCls}">${t(en, bn)}</button>`).join('')}
      <button data-aflag aria-pressed="${aFlag}" class="${chipCls}"><i data-lucide="flag"></i>${t('Flagged only', 'শুধু চিহ্নিত')}</button>
    </div>
    <div class="flex flex-wrap gap-2 mb-4">
      <select id="a-who" class="field h-9 text-sm w-full sm:w-56" aria-label="${L('Person', 'ব্যক্তি')}">
        <option value="all">${L('Everyone', 'সবাই')}</option>
        ${people.map((p) => `<option value="${esc(p)}" ${aWho === p ? 'selected' : ''}>${esc(L(p, auditLog.find((a) => a.who === p).whoBn))}</option>`).join('')}
      </select>
      <input id="a-q" value="${esc(aQ)}" class="field h-9 text-sm w-full sm:w-72 sm:ml-auto" data-bn-ph="রসিদ নং, পরিবার নং বা শব্দ" placeholder="Receipt no., family no. or a word" />
    </div>
    <div class="paper-card overflow-x-auto relative">
      <table class="khata-table">
        <thead><tr><th class="w-[150px]">${t('When', 'কখন')}</th><th>${t('Who', 'কে')}</th><th>${t('What happened', 'কী হয়েছে')}</th><th class="hidden md:table-cell">${t('Device', 'ডিভাইস')}</th><th><span class="sr-only">${t('Open', 'খুলুন')}</span></th></tr></thead>
        <tbody>
          ${rows.length ? rows.map((a) => `<tr class="cursor-pointer ${a.fresh ? 'bg-marigold-wash/40' : ''}" data-audit="${a.id}">
            <td class="text-[13px] text-ink-2 num whitespace-nowrap align-top">${t(a.at, a.atBn)}</td>
            <td class="align-top whitespace-nowrap"><span class="font-semibold">${t(a.who, a.whoBn)}</span></td>
            <td class="align-top"><span class="flex items-start gap-2">${a.flag ? `<i data-lucide="flag" class="w-4 h-4 mt-1 shrink-0 text-sindoor" aria-label="${L('Flagged', 'চিহ্নিত')}"></i>` : ''}<span><span class="chip h-5 px-1.5 text-[11.5px] bg-paper-2 text-ink-2 mr-1.5">${t(MODS[a.mod][0], MODS[a.mod][1])}</span>${t(a.en, a.bn)}</span></span></td>
            <td class="hidden md:table-cell text-[13px] text-ink-3 whitespace-nowrap align-top">${t(a.device, bnText(a.device))}</td>
            <td class="text-right align-top"><i data-lucide="chevron-right" class="w-4 h-4 text-ink-3 inline"></i></td>
          </tr>`).join('') : `<tr><td colspan="5" class="!py-12 text-center text-ink-3">${t('Nothing in the log matches. Clear a filter or search for a receipt number.', 'লগে কিছু মেলেনি। একটি ফিল্টার সরান বা রসিদ নম্বর দিয়ে খুঁজুন।')}</td></tr>`}
        </tbody>
      </table>
    </div>
    <p class="text-sm text-ink-3 mt-3">${t(`${rows.length} of ${auditLog.length} lines · kept for 8 years, as the registrar asks`, `${auditLog.length}টির মধ্যে ${rows.length}টি লাইন · রেজিস্ট্রারের নিয়মে ৮ বছর রাখা হয়`)}</p>`);
  $$('[data-ag]').forEach((b) => b.addEventListener('click', () => { aGroup = b.dataset.ag; auditScreen(); }));
  $('[data-aflag]').addEventListener('click', () => { aFlag = !aFlag; auditScreen(); });
  $('#a-who').addEventListener('change', (e) => { aWho = e.target.value; auditScreen(); });
  const q = $('#a-q');
  q.addEventListener('input', () => { aQ = q.value; auditScreen(); const n = $('#a-q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
  $$('[data-audit]').forEach((r) => r.addEventListener('click', () => auditDrawer(r.dataset.audit)));
}
function auditDrawer(id) {
  const a = auditLog.find((x) => x.id === id);
  const m = MODS[a.mod];
  C.openDrawer(`
    <div class="p-6">
      <div class="flex items-start"><div><p class="text-sm text-ink-3 num">${a.id.toUpperCase()} · ${t(m[0], m[1])}</p><h2 class="font-display text-[1.6rem] leading-tight pr-4">${t(a.en, a.bn)}</h2></div>${C.closeBtn}</div>
      <dl class="mt-5 grid grid-cols-2 gap-4 text-[15px]">
        <div><dt class="text-sm text-ink-3">${t('Who', 'কে')}</dt><dd class="font-semibold">${t(a.who, a.whoBn)}</dd></div>
        <div><dt class="text-sm text-ink-3">${t('When', 'কখন')}</dt><dd class="font-semibold num">${t(a.at, a.atBn)}</dd></div>
        <div><dt class="text-sm text-ink-3">${t('Device', 'ডিভাইস')}</dt><dd>${t(a.device, bnText(a.device))}</dd></div>
        <div><dt class="text-sm text-ink-3">${t('Sign-in', 'লগইন')}</dt><dd>${a.who === 'System' ? t('Automatic', 'স্বয়ংক্রিয়') : a.who === 'Unknown' ? t('Failed', 'ব্যর্থ') : t('Password + SMS code', 'পাসওয়ার্ড + এসএমএস কোড')}</dd></div>
      </dl>
      ${a.mod === 'settings' && a.flag ? `<div class="mt-5"><p class="text-sm font-semibold text-ink-3">${t('Change', 'পরিবর্তন')}</p>
        <div class="mt-1.5 grid grid-cols-2 gap-2 text-[15px]"><div class="rounded-lg bg-sindoor-wash p-3"><p class="text-[12px] font-semibold text-sindoor-deep">${t('Before', 'আগে')}</p><p class="line-through">${t('9 months due', '৯ মাস বকেয়া')}</p></div>
        <div class="rounded-lg bg-tulsi-wash p-3"><p class="text-[12px] font-semibold text-tulsi">${t('After', 'পরে')}</p><p>${t('6 months due', '৬ মাস বকেয়া')}</p></div></div></div>` : ''}
      ${a.flag ? `<p class="mt-5 rounded-lg bg-marigold-wash p-3.5 text-[15px] flex gap-2.5"><i data-lucide="flag" class="w-5 h-5 shrink-0 text-turmeric"></i>${t('Flagged for the auditor’s attention. It will be listed in the AGM pack.', 'অডিটরের নজরের জন্য চিহ্নিত। এজিএম প্যাকে তালিকাভুক্ত হবে।')}</p>` : ''}
      <div class="grid grid-cols-2 gap-2 mt-6">
        <a href="#${m[2]}" class="btn btn-line" data-close><i data-lucide="arrow-up-right"></i>${t('Open the record', 'রেকর্ড খুলুন')}</a>
        <button class="btn btn-ghost" data-act="audit-note" data-id="${a.id}"><i data-lucide="message-square-plus"></i>${t('Add a note', 'নোট যোগ')}</button>
      </div>
      <p class="mt-4 text-[13px] text-ink-3">${t('A note is added as a new line. The original line never changes.', 'নোট নতুন লাইন হিসেবে যোগ হয়। মূল লাইন কখনো বদলায় না।')}</p>
    </div>`);
}

/* ---------------- Cash & bank ---------------- */
const holders = cashHolders.map((h) => ({ ...h }));
const stmt = bank.statement.map((s) => ({ ...s }));
const inTransit = [];
const unpresented = [{ ref: 'CHQ 000149', to: 'Galiff Street wholesale', toBn: 'গ্যালিফ স্ট্রিট পাইকারি', amount: 3250, on: '10 Nov' }];
let reconciled = false;
const OLD = ['5 Nov', '8 Nov']; // older than 7 days on 15 Nov
function cashScreen() {
  const withCollectors = holders.filter((h) => !h.treasurer).reduce((a, b) => a + b.amount, 0);
  const box = holders.find((h) => h.treasurer);
  const open = stmt.filter((s) => !s.match);
  const transit = inTransit.reduce((a, b) => a + b.amount, 0);
  const unp = unpresented.reduce((a, b) => a + b.amount, 0);
  const uIn = open.filter((s) => s.type === 'in').reduce((a, b) => a + b.amount, 0);
  const uOut = open.filter((s) => s.type === 'out').reduce((a, b) => a + b.amount, 0);
  const khataBank = bank.balance + transit - unp - uIn + uOut;
  const tile = (en, bn, v, sub, tone = '') => `<div class="bg-card p-4"><p class="text-sm text-ink-3">${t(en, bn)}</p><p class="font-display text-2xl ${tone}">${v}</p><p class="text-[13px] text-ink-3 mt-0.5">${sub}</p></div>`;
  C.paint(C.screen('cash'), `
    ${C.pageHead('Cash & bank', 'নগদ ও ব্যাংক', t('Who is holding club money, what reached the bank, and whether the khata agrees with the statement.', 'ক্লাবের টাকা কার কাছে, কত ব্যাংকে গেছে, আর খাতা ও ব্যাংকের হিসাব মিলছে কি না।'), `
      <button class="btn btn-line btn-sm" data-act="bank-import"><i data-lucide="cloud-upload"></i>${t('Import statement', 'স্টেটমেন্ট আনুন')}</button>
      <button class="btn btn-ink btn-sm" data-act="cash-deposit"><i data-lucide="landmark"></i>${t('Deposit to bank', 'ব্যাংকে জমা')}</button>`)}
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-rule rounded-lg overflow-hidden border border-rule mb-6">
      ${tile('With collectors', 'সংগ্রাহকদের কাছে', inr(withCollectors), t(`${holders.filter((h) => !h.treasurer && h.amount).length} people · hand over within 7 days`, `${holders.filter((h) => !h.treasurer && h.amount).length} জন · ৭ দিনের মধ্যে জমা`), 'text-sindoor')}
      ${tile('Treasurer’s cash box', 'কোষাধ্যক্ষের ক্যাশবাক্স', inr(box.amount), t('Bank anything over ₹5,000', '₹৫,০০০-এর বেশি ব্যাংকে দিন'))}
      ${tile('Bank balance', 'ব্যাংক ব্যালান্স', inr(bank.balance), t(`SBI ${bank.account} · ${bank.lastImport}`, `SBI ${bank.account} · ${bank.lastImportBn}`))}
      ${tile('Not yet matched', 'এখনও মেলানো হয়নি', dn(String(open.length)), open.length ? t('bank lines need a khata entry', 'ব্যাংকের লাইনে খাতার এন্ট্রি দরকার') : t('All lines matched', 'সব লাইন মিলেছে'), open.length ? 'text-sindoor' : 'text-tulsi')}
    </div>

    <div class="grid xl:grid-cols-12 gap-6 items-start">
      <div class="xl:col-span-7 paper-card overflow-hidden">
        <div class="px-5 pt-4 pb-3 border-b border-rule flex items-center"><h2 class="font-display text-xl">${t('Cash in hand', 'হাতে নগদ')}</h2>
          <span class="ml-auto text-sm text-ink-3">${t('Counted at handover', 'জমার সময় গোনা')}</span></div>
        <div class="overflow-x-auto relative"><table class="khata-table min-w-[560px]">
          <thead><tr><th>${t('Held by', 'কার কাছে')}</th><th>${t('Since', 'কবে থেকে')}</th><th class="!text-right">${t('Amount', 'টাকা')}</th><th><span class="sr-only">${t('Action', 'কাজ')}</span></th></tr></thead>
          <tbody>
            ${holders.map((h) => `<tr>
              <td><span class="flex items-center gap-2.5">${C.bookDot(h.book)}<span><span class="block font-semibold">${t(h.name, h.nameBn)}</span><span class="block text-[13px] text-ink-3">${t(h.role, h.roleBn)} · ${t(`${h.receipts} receipts`, `${h.receipts}টি রসিদ`)}</span></span></span></td>
              <td class="whitespace-nowrap">${h.amount ? `${dn(h.since)}${OLD.includes(h.since) && !h.treasurer ? ` <span class="chip h-5 px-1.5 text-[11.5px] bg-sindoor-wash text-sindoor-deep">${t('Over 7 days', '৭ দিনের বেশি')}</span>` : ''}` : '<span class="text-ink-3">—</span>'}</td>
              <td class="amt font-semibold ${h.amount ? '' : 'text-ink-3'}">${inr(h.amount)}</td>
              <td class="text-right whitespace-nowrap">${h.treasurer
                ? `<button class="btn btn-ghost btn-sm" data-act="cash-deposit"><i data-lucide="landmark"></i>${t('Bank it', 'ব্যাংকে দিন')}</button>`
                : h.amount ? `<button class="btn btn-ink btn-sm" data-act="cash-handover" data-id="${h.id}"><i data-lucide="hand-coins"></i>${t('Receive', 'বুঝে নিন')}</button>` : `<span class="chip bg-paper-2 text-ink-2"><i data-lucide="check"></i>${t('Handed over', 'জমা হয়েছে')}</span>`}</td>
            </tr>`).join('')}
            <tr class="bg-paper-2/50 font-semibold [&>td]:border-t [&>td]:border-t-ink/20 [&>td]:border-b-[3px] [&>td]:border-double [&>td]:border-b-ink/25">
              <td>${t('Club cash outside the bank', 'ব্যাংকের বাইরে ক্লাবের নগদ')}</td><td></td><td class="amt text-sindoor">${inr(withCollectors + box.amount)}</td><td></td></tr>
          </tbody>
        </table></div>
        <p class="px-5 py-3 text-sm text-ink-2 border-t border-rule">${t('Club rule: collectors hand cash to the treasurer within 7 days. Both confirm the count on their phones, and it goes in the audit log.', 'ক্লাবের নিয়ম: সংগ্রাহকরা ৭ দিনের মধ্যে কোষাধ্যক্ষকে নগদ দেবেন। দুজনেই ফোনে গোনা নিশ্চিত করেন, অডিট লগে ওঠে।')}</p>
      </div>

      <div class="xl:col-span-5 paper-card p-5">
        <h2 class="font-display text-xl">${t('Reconciliation · November', 'মেলানো · নভেম্বর')}</h2>
        <p class="text-sm text-ink-3">${t(bank.name, bank.nameBn)} · ${t(bank.account, bnText(bank.account))}</p>
        <dl class="mt-4 text-[15px]">
          <div class="flex py-1.5"><dt>${t('Bank balance as per khata', 'খাতা অনুযায়ী ব্যাংক ব্যালান্স')}</dt><dd class="ml-auto num">${inr(khataBank)}</dd></div>
          <div class="flex py-1.5 text-ink-2"><dt>${t('Add: cheques issued, not yet cashed', 'যোগ: চেক দেওয়া, এখনও ভাঙানো হয়নি')}</dt><dd class="ml-auto num">+${inr(unp)}</dd></div>
          <div class="flex py-1.5 text-ink-2"><dt>${t('Less: deposits not yet in the statement', 'বাদ: জমা, স্টেটমেন্টে এখনও আসেনি')}</dt><dd class="ml-auto num">−${inr(transit)}</dd></div>
          <div class="flex py-1.5 text-ink-2"><dt>${t('Add: bank credits not in the khata', 'যোগ: ব্যাংকে জমা, খাতায় নেই')}</dt><dd class="ml-auto num ${uIn ? 'text-sindoor font-semibold' : ''}">+${inr(uIn)}</dd></div>
          <div class="flex py-1.5 text-ink-2"><dt>${t('Less: bank debits not in the khata', 'বাদ: ব্যাংকে খরচ, খাতায় নেই')}</dt><dd class="ml-auto num ${uOut ? 'text-sindoor font-semibold' : ''}">−${inr(uOut)}</dd></div>
          <div class="flex py-2.5 mt-1 font-semibold border-t border-ink/20 border-b-[3px] border-double border-b-ink/25"><dt>${t('Balance as per bank statement', 'ব্যাংক স্টেটমেন্ট অনুযায়ী')}</dt><dd class="ml-auto font-display text-xl">${inr(bank.balance)}</dd></div>
        </dl>
        ${reconciled
          ? `<div class="mt-4 rounded-lg bg-tulsi-wash text-tulsi p-3.5 flex items-center gap-2.5 font-semibold"><i data-lucide="check-circle-2" class="w-5 h-5"></i>${t('November reconciled by Tapas Mondal · in the audit log', 'নভেম্বর মেলানো হয়েছে · তাপস মণ্ডল · অডিট লগে আছে')}</div>`
          : `<button class="btn btn-primary w-full mt-4" data-act="bank-close" ${open.length ? 'disabled' : ''}><i data-lucide="check-check"></i>${t('Mark November reconciled', 'নভেম্বর মেলানো হয়েছে')}</button>
             ${open.length ? `<p class="text-sm text-ink-2 mt-2">${t(`Match the ${open.length} open bank lines below first.`, `আগে নিচের ${open.length}টি খোলা লাইন মেলান।`)}</p>` : ''}`}
      </div>

      <div class="xl:col-span-12 paper-card overflow-hidden">
        <div class="px-5 pt-4 pb-3 border-b border-rule flex flex-wrap items-center gap-2"><h2 class="font-display text-xl">${t('Bank statement lines', 'ব্যাংক স্টেটমেন্টের লাইন')}</h2>
          <span class="ml-auto text-sm text-ink-3">${t(`Imported ${bank.lastImport} · ${stmt.length - open.length} of ${stmt.length} matched`, `আনা হয়েছে ${bank.lastImportBn} · ${stmt.length}টির মধ্যে ${stmt.length - open.length}টি মিলেছে`)}</span></div>
        <div class="overflow-x-auto relative"><table class="khata-table min-w-[720px]">
          <thead><tr><th class="w-[70px]">${t('Date', 'তারিখ')}</th><th>${t('Bank narration', 'ব্যাংকের বিবরণ')}</th><th class="!text-right">${t('In', 'জমা')}</th><th class="!text-right">${t('Out', 'খরচ')}</th><th>${t('Matched with', 'মিলেছে')}</th></tr></thead>
          <tbody>
            ${stmt.map((s) => `<tr class="${s.match ? '' : 'bg-sindoor-wash/40'}">
              <td class="text-[13px] text-ink-2 num whitespace-nowrap">${dn(s.date)}</td>
              <td class="text-[13px] num tracking-tight break-all">${s.desc}</td>
              <td class="amt ${s.type === 'in' ? 'font-semibold' : ''}">${s.type === 'in' ? inr(s.amount) : ''}</td>
              <td class="amt ${s.type === 'out' ? 'font-semibold text-sindoor' : ''}">${s.type === 'out' ? inr(s.amount) : ''}</td>
              <td>${s.match ? `<span class="inline-flex items-center gap-1.5 text-sm text-ink-2"><i data-lucide="check" class="w-4 h-4 text-tulsi"></i><span class="num">${esc(s.match)}</span></span>`
                : `<button class="btn btn-ink btn-sm" data-act="bank-match" data-id="${s.id}"><i data-lucide="link-2"></i>${t('Match', 'মেলান')}</button>`}</td>
            </tr>`).join('')}
            ${inTransit.map((d) => `<tr class="text-ink-2"><td class="text-[13px] num">${dn(d.on)}</td><td class="text-[13px]">${t(`Cash deposit · slip ${d.slip} · in transit`, `নগদ জমা · স্লিপ ${d.slip} · পথে`)}</td><td class="amt">${inr(d.amount)}</td><td></td><td><span class="chip h-6 border border-ink/30 text-[12px]"><i data-lucide="timer"></i>${t('Awaiting statement', 'স্টেটমেন্টের অপেক্ষা')}</span></td></tr>`).join('')}
          </tbody>
        </table></div>
      </div>
    </div>`);
}
function handoverDrawer(id) {
  const h = holders.find((x) => x.id === id);
  const notes = [500, 200, 100, 50, 20, 10];
  C.openDrawer(`
    <form class="p-6 space-y-4" id="ho-form">
      <div class="flex items-center"><h2 class="font-display text-[1.7rem] leading-tight pr-4">${t(`Receive cash · ${h.name}`, `নগদ বুঝে নিন · ${h.nameBn}`)}</h2>${C.closeBtn}</div>
      <div class="rounded-lg bg-paper-2 p-4 flex items-center"><div><p class="text-sm text-ink-2">${t(`Expected from ${h.receipts} receipts`, `${h.receipts}টি রসিদ অনুযায়ী প্রত্যাশিত`)}</p><p class="font-display text-3xl">${inr(h.amount)}</p></div><span class="ml-auto">${C.bookDot(h.book)}</span></div>
      <div>
        <p class="label">${t('Count the notes', 'নোট গুনুন')}</p>
        <div class="divide-y divide-rule border-y border-rule">
          ${notes.map((n) => `<label class="flex items-center gap-3 py-2"><span class="w-16 font-semibold num">₹${lang === 'bn' ? bnD(n) : n}</span><span class="text-ink-3">×</span>
            <input class="field h-10 w-20 num text-center" inputmode="numeric" data-note="${n}" data-digits="4" value="" placeholder="0" aria-label="${L(`Number of ₹${n} notes`, `₹${n} নোটের সংখ্যা`)}" />
            <span class="ml-auto num text-ink-2" data-sub="${n}">₹0</span></label>`).join('')}
          <label class="flex items-center gap-3 py-2"><span class="w-16 font-semibold">${t('Coins', 'কয়েন')}</span><span class="text-ink-3">₹</span>
            <input class="field h-10 w-20 num text-center" inputmode="numeric" data-coins data-digits="4" placeholder="0" aria-label="${L('Coins total', 'কয়েন মোট')}" /><span class="ml-auto"></span></label>
        </div>
      </div>
      <div class="rounded-lg border-2 border-ink p-4 flex items-center" id="ho-sum" role="status"></div>
      <label class="block hidden" id="ho-why"><span class="label">${t('Why is it different? (required)', 'পার্থক্য কেন? (বাধ্যতামূলক)')}</span><input class="field" id="ho-why-in" /></label>
      <label class="flex items-start gap-3 text-[15px]"><input type="checkbox" required class="mt-1 w-4 h-4 accent-[#d21f1b]" />${t(`${h.receipts} receipt counterfoils checked against the khata`, `${h.receipts}টি রসিদের মুড়ি খাতার সঙ্গে মেলানো হয়েছে`)}</label>
      <label class="flex items-start gap-3 text-[15px]"><input type="checkbox" checked class="mt-1 w-4 h-4 accent-[#d21f1b]" />${t(`Send ${h.name} a code to confirm the count on their phone`, `${h.nameBn}-কে ফোনে গোনা নিশ্চিত করার কোড পাঠান`)}</label>
      <div class="grid grid-cols-2 gap-2 pt-2"><button type="button" data-close class="btn btn-line">${t('Cancel', 'বাতিল')}</button><button class="btn btn-primary">${t('Received', 'বুঝে পেয়েছি')}</button></div>
    </form>`);
  const form = $('#ho-form');
  const calc = () => {
    let s = 0;
    $$('[data-note]', form).forEach((i) => { const v = Number(i.value || 0) * Number(i.dataset.note); s += v; $(`[data-sub="${i.dataset.note}"]`, form).textContent = (lang === 'bn' ? bnD : String)(`₹${v.toLocaleString('en-IN')}`); });
    s += Number($('[data-coins]', form).value || 0);
    const d = s - h.amount;
    $('#ho-sum').innerHTML = `<div><p class="text-sm text-ink-2">${L('Counted', 'গোনা হয়েছে')}</p><p class="font-display text-2xl">${(lang === 'bn' ? bnD : String)(`₹${s.toLocaleString('en-IN')}`)}</p></div>
      <p class="ml-auto font-semibold ${d === 0 ? 'text-tulsi' : 'text-sindoor'}">${s === 0 ? L('Start counting', 'গোনা শুরু করুন') : d === 0 ? L('Matches ✓', 'মিলেছে ✓') : d < 0 ? L(`Short by ₹${-d}`, `₹${bnD(-d)} কম`) : L(`Over by ₹${d}`, `₹${bnD(d)} বেশি`)}</p>`;
    const why = d !== 0 && s > 0;
    $('#ho-why').classList.toggle('hidden', !why); $('#ho-why-in').required = why;
    return s;
  };
  form.addEventListener('input', calc); calc();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = calc() || h.amount;
    const box = holders.find((x) => x.treasurer);
    box.amount += s; box.receipts += h.receipts; h.amount = 0; h.receipts = 0;
    C.closeDrawer();
    logAudit('cash', `Received ₹${s.toLocaleString('en-IN')} cash from ${h.name}`, `${h.nameBn}-এর থেকে ₹${bnD(s.toLocaleString('en-IN'))} নগদ বুঝে নেওয়া`);
    ok(`₹${s.toLocaleString('en-IN')} is now in the treasurer’s cash box.`, `₹${bnD(s.toLocaleString('en-IN'))} এখন কোষাধ্যক্ষের ক্যাশবাক্সে।`);
    C.rerender();
  });
}

/* ---------------- Receipts register ---------------- */
const RC = [
  [412, '13 Nov', 3, 'Cash', 300, 3], [411, '13 Nov', 4, 'UPI', 500, 5], [410, '12 Nov', 7, 'Cash', 200, 2], [409, '10 Nov', 10, 'Cash', 600, 6],
  [408, '10 Nov', 15, 'UPI', 100, 1], [407, '09 Nov', 18, 'Cash', 300, 3], [406, '08 Nov', 11, 'Cash', 300, 3], [405, '08 Nov', 12, 'Cash', 300, 3],
  [404, '07 Nov', 20, 'Cash', 1100, 12], [403, '06 Nov', 2, 'UPI', 200, 2], [402, '05 Nov', 22, 'Cash', 100, 1], [401, '04 Nov', 5, 'Cash', 500, 5],
];
const receipts = [
  ...RC.map(([n, date, fi, mode, amount, months]) => ({
    no: `MC-26-0${n}`, date, book: 'club', mode, amount, by: 'Tapas M.', fam: families[fi].no,
    from: families[fi].head, fromBn: families[fi].headBn,
    for: months === 12 ? ['Subscription, 1 year', 'বার্ষিক চাঁদা'] : [`Subscription, ${months} month${months > 1 ? 's' : ''}`, `চাঁদা, ${bnD(months)} মাস`],
    status: n === 405 ? 'cancelled' : 'ok', reason: n === 405 ? ['Wrong family · reissued as MC-26-0406', 'ভুল পরিবার · নতুন রসিদ MC-26-0406'] : null,
  })),
  { no: 'NS-26-0311', date: '13 Nov', book: 'nursery', mode: 'Cash', amount: 830, by: 'Sutapa B.', from: 'Counter sale', fromBn: 'কাউন্টার বিক্রি', for: ['6 plants', '৬টি গাছ'], status: 'ok' },
  { no: 'NS-26-0310', date: '12 Nov', book: 'nursery', mode: 'UPI', amount: 260, by: 'Sutapa B.', from: 'Counter sale', fromBn: 'কাউন্টার বিক্রি', for: ['2 plants', '২টি গাছ'], status: 'ok' },
  { no: 'CT-26-R019', date: '11 Nov', book: 'catering', mode: 'Bank', amount: 10000, by: 'Debashis P.', from: 'Kar family · CT-26-0044', fromBn: 'কর পরিবার · CT-26-0044', for: ['Catering advance', 'ক্যাটারিং অগ্রিম'], status: 'ok' },
  { no: 'NS-26-0302', date: '08 Nov', book: 'nursery', mode: 'Cash', amount: 1460, by: 'Sutapa B.', from: 'Counter sale', fromBn: 'কাউন্টার বিক্রি', for: ['11 plants', '১১টি গাছ'], status: 'ok' },
  { no: 'CT-26-R018', date: '07 Nov', book: 'catering', mode: 'Bank', amount: 37200, by: 'Debashis P.', from: 'Dey family · CT-26-0036', fromBn: 'দে পরিবার · CT-26-0036', for: ['Catering final bill', 'ক্যাটারিং চূড়ান্ত বিল'], status: 'ok' },
];
receipts.sort((a, b) => parseInt(b.date, 10) - parseInt(a.date, 10));
export function addReceipt({ no, fam, amount, mode, months }) {
  receipts.unshift({ no, date: '15 Nov', book: 'club', mode: mode === 'upi' ? 'UPI' : 'Cash', amount, by: 'Tapas M.', fam: fam.no, from: fam.head, fromBn: fam.headBn,
    for: [`Subscription, ${months} month${months > 1 ? 's' : ''}`, `চাঁদা, ${bnD(months)} মাস`], status: 'ok', fresh: true });
  if (mode !== 'upi') holders.find((h) => h.treasurer).amount += amount;
  logAudit('collect', `Recorded ₹${amount} ${mode === 'upi' ? 'UPI' : 'cash'} from ${fam.no} · receipt ${no}`, `${fam.no} থেকে ₹${bnD(amount)} ${mode === 'upi' ? 'ইউপিআই' : 'নগদ'} · রসিদ ${no}`);
}
let rBook = 'all', rMode = 'all', rQ = '';
const MODE_BN = { Cash: 'নগদ', UPI: 'ইউপিআই', Bank: 'ব্যাংক' };
function receiptsScreen() {
  const list = receipts.filter((r) => (rBook === 'all' || r.book === rBook) && (rMode === 'all' || (rMode === 'cancelled' ? r.status === 'cancelled' : r.mode === rMode))
    && `${r.no} ${r.from} ${r.fromBn} ${r.fam || ''}`.toLowerCase().includes(rQ.toLowerCase()));
  const valid = receipts.filter((r) => r.status === 'ok');
  const cash = valid.filter((r) => r.mode === 'Cash').reduce((a, b) => a + b.amount, 0);
  const digital = valid.filter((r) => r.mode !== 'Cash').reduce((a, b) => a + b.amount, 0);
  const mc = receipts.filter((r) => r.no.startsWith('MC-26-')).map((r) => Number(r.no.slice(-4))).sort((a, b) => a - b);
  const gaps = []; for (let n = mc[0]; n <= mc.at(-1); n++) if (!mc.includes(n)) gaps.push(n);
  const cancelled = receipts.filter((r) => r.status === 'cancelled');
  const total = list.filter((r) => r.status === 'ok').reduce((a, b) => a + b.amount, 0);
  C.paint(C.screen('receipts'), `
    ${C.pageHead('Receipts register', 'রসিদ খাতা', t('Every receipt number in order, across the three books. Numbers are never reused or deleted.', 'তিনটি খাতার সব রসিদ নম্বর ক্রমানুসারে। নম্বর কখনো আবার ব্যবহার বা মোছা হয় না।'), `
      <button class="btn btn-line btn-sm" data-act="receipts-csv"><i data-lucide="file-down"></i>${t('Export CSV', 'CSV ডাউনলোড')}</button>
      <a href="#collect" class="btn btn-ink btn-sm"><i data-lucide="plus"></i>${t('New receipt', 'নতুন রসিদ')}</a>`)}
    <div class="grid sm:grid-cols-3 gap-px bg-rule rounded-lg overflow-hidden border border-rule mb-4">
      <div class="bg-card p-4"><p class="text-sm text-ink-3">${t('November so far', 'নভেম্বরে এ পর্যন্ত')}</p><p class="font-display text-2xl">${inr(cash + digital)}</p><p class="text-[13px] text-ink-3">${t(`${valid.length} valid receipts`, `${valid.length}টি বৈধ রসিদ`)}</p></div>
      <div class="bg-card p-4"><p class="text-sm text-ink-3">${t('Cash · UPI & bank', 'নগদ · ইউপিআই ও ব্যাংক')}</p><p class="font-display text-2xl">${inr(cash)} <span class="text-ink-3 text-lg">·</span> ${inr(digital)}</p><p class="text-[13px] text-ink-3"><a href="#cash" class="hover:underline">${t('Cash goes to the cash box', 'নগদ ক্যাশবাক্সে যায়')} →</a></p></div>
      <div class="bg-card p-4"><p class="text-sm text-ink-3">${t('Series check · MC-26', 'ক্রম যাচাই · MC-26')}</p>
        <p class="font-semibold mt-1 flex items-center gap-2 ${gaps.length ? 'text-sindoor' : 'text-tulsi'}"><i data-lucide="${gaps.length ? 'triangle-alert' : 'check-circle-2'}" class="w-5 h-5"></i>${gaps.length ? t(`${gaps.length} missing numbers`, `${gaps.length}টি নম্বর নেই`) : t(`${dn(String(mc[0]).padStart(4, '0'))} to ${dn(String(mc.at(-1)).padStart(4, '0'))} complete`, `${dn(String(mc[0]).padStart(4, '0'))} থেকে ${dn(String(mc.at(-1)).padStart(4, '0'))} সম্পূর্ণ`)}</p>
        <p class="text-[13px] text-ink-3">${t(`${cancelled.length} cancelled, kept with a reason`, `${cancelled.length}টি বাতিল, কারণসহ রাখা`)}</p></div>
    </div>
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <button data-rb="all" aria-pressed="${rBook === 'all'}" class="${chipCls}">${t('All books', 'সব খাতা')}</button>
      ${Object.keys(books).map((k) => `<button data-rb="${k}" aria-pressed="${rBook === k}" class="${chipCls}">${C.bookDot(k)}${C.bookName(k)}</button>`).join('')}
      <select id="r-mode" class="field h-9 text-sm w-auto" aria-label="${L('Payment mode', 'মাধ্যম')}">
        ${[['all', 'All modes', 'সব মাধ্যম'], ['Cash', 'Cash', 'নগদ'], ['UPI', 'UPI', 'ইউপিআই'], ['Bank', 'Bank transfer', 'ব্যাংক'], ['cancelled', 'Cancelled only', 'শুধু বাতিল']].map(([v, en, bn]) => `<option value="${v}" ${rMode === v ? 'selected' : ''}>${L(en, bn)}</option>`).join('')}
      </select>
      <input id="r-q" value="${esc(rQ)}" class="field h-9 text-sm w-full sm:w-64 sm:ml-auto" data-bn-ph="রসিদ নং, নাম বা পরিবার নং" placeholder="Receipt no., name or family no." />
    </div>
    <div class="paper-card overflow-x-auto relative">
      <table class="khata-table min-w-[680px]">
        <thead><tr><th>${t('Receipt', 'রসিদ')}</th><th>${t('Received from', 'কার থেকে')}</th><th class="hidden md:table-cell">${t('Mode', 'মাধ্যম')}</th><th class="hidden md:table-cell">${t('By', 'কে নিয়েছেন')}</th><th class="!text-right">${t('Amount', 'টাকা')}</th><th><span class="sr-only">${t('Action', 'কাজ')}</span></th></tr></thead>
        <tbody>
          ${list.length ? list.map((r) => `<tr class="${r.fresh ? 'bg-marigold-wash/40' : ''}">
            <td class="whitespace-nowrap"><span class="flex items-center gap-2">${C.bookDot(r.book)}<span><span class="block font-semibold num">${r.no}</span><span class="block text-[13px] text-ink-3 num">${dn(r.date)}</span></span></span></td>
            <td><span class="block ${r.status === 'cancelled' ? 'line-through text-ink-3' : 'font-semibold'}">${t(r.from, r.fromBn)}</span><span class="block text-[13px] text-ink-3">${r.status === 'cancelled' ? t(r.reason[0], r.reason[1]) : t(r.for[0], r.for[1])}</span></td>
            <td class="hidden md:table-cell text-ink-2">${t(r.mode, MODE_BN[r.mode])}</td>
            <td class="hidden md:table-cell text-[13px] text-ink-2 whitespace-nowrap">${r.by}</td>
            <td class="amt ${r.status === 'cancelled' ? 'line-through text-ink-3' : 'font-semibold'}">${inr(r.amount)}</td>
            <td class="text-right whitespace-nowrap">${r.status === 'cancelled' ? `<span class="chip bg-ink text-white">${t('Cancelled', 'বাতিল')}</span>` : `<button class="btn btn-ghost btn-sm" data-act="rc-view" data-no="${r.no}">${t('View', 'দেখুন')}</button>`}</td>
          </tr>`).join('') : `<tr><td colspan="6" class="!py-12 text-center text-ink-3">${t('No receipt matches. Try the number printed on the counterfoil.', 'কোনো রসিদ মেলেনি। মুড়িতে ছাপা নম্বর দিয়ে খুঁজুন।')}</td></tr>`}
          ${list.length ? `<tr class="bg-paper-2/50 font-semibold [&>td]:border-t [&>td]:border-t-ink/20 [&>td]:border-b-[3px] [&>td]:border-double [&>td]:border-b-ink/25"><td>${t('Total shown', 'দেখানো মোট')}</td><td class="text-ink-3 font-normal text-sm">${t('cancelled not counted', 'বাতিল বাদে')}</td><td class="hidden md:table-cell"></td><td class="hidden md:table-cell"></td><td class="amt">${inr(total)}</td><td></td></tr>` : ''}
        </tbody>
      </table>
    </div>`);
  $$('[data-rb]').forEach((b) => b.addEventListener('click', () => { rBook = b.dataset.rb; receiptsScreen(); }));
  $('#r-mode').addEventListener('change', (e) => { rMode = e.target.value; receiptsScreen(); });
  const q = $('#r-q');
  q.addEventListener('input', () => { rQ = q.value; receiptsScreen(); const n = $('#r-q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
}
function receiptDrawer(no) {
  const r = receipts.find((x) => x.no === no);
  const f = r.fam && families.find((x) => x.no === r.fam);
  C.openDrawer(`
    <div class="p-6">
      <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t('Receipt', 'রসিদ')} <span class="num">${r.no}</span></h2>${C.closeBtn}</div>
      <div class="mt-4 rounded-lg border border-rule p-5 relative book-${r.book}">
        <div class="flex items-center gap-3 border-b border-ink/20 pb-3"><span>${seal({ size: 44, rotate: -4 })}</span>
          <div class="leading-tight"><p class="font-display text-lg text-sindoor">${t('Gede Maitree Club', 'গেদে মৈত্রী ক্লাব')}</p><p class="text-[11px] tracking-[0.12em] font-semibold text-ink-3">REG. ${club.regNo}</p></div>
          <span class="ml-auto flex items-center gap-1.5 text-sm">${C.bookDot(r.book)}${C.bookName(r.book)}</span></div>
        <p class="mt-3 text-[15px] leading-relaxed">${t('Received with thanks from', 'ধন্যবাদের সঙ্গে গৃহীত')} <strong>${t(r.from, r.fromBn)}</strong>${r.fam ? ` (${r.fam})` : ''} <strong>${inr(r.amount)}</strong> · ${t(r.for[0], r.for[1])} · ${t(r.mode, MODE_BN[r.mode])}.</p>
        <p class="mt-3 text-sm text-ink-3 num">${dn(r.date)} 2026 · ${r.by}</p>
      </div>
      <div class="grid grid-cols-2 gap-2 mt-4">
        <button class="btn btn-line" data-act="receipt-print" data-ref="${r.no}"><i data-lucide="printer"></i>${t('Print', 'প্রিন্ট')}</button>
        ${f ? `<a class="btn btn-ink" target="_blank" rel="noopener" href="https://wa.me/91${f.phone}?text=${encodeURIComponent(L(`Gede Maitree Club receipt ${r.no}: ₹${r.amount} received. Thank you.`, `গেদে মৈত্রী ক্লাব রসিদ ${r.no}: ₹${r.amount} পাওয়া গেছে। ধন্যবাদ।`))}"><i data-lucide="message-circle"></i>${t('Resend', 'আবার পাঠান')}</a>` : `<button class="btn btn-ink" data-act="print-doc"><i data-lucide="copy"></i>${t('Duplicate copy', 'ডুপ্লিকেট কপি')}</button>`}
      </div>
      <button class="mt-4 text-sm font-semibold text-sindoor hover:underline" data-act="rc-cancel" data-no="${r.no}">${t('Cancel this receipt…', 'রসিদ বাতিল…')}</button>
      <p class="mt-1 text-[13px] text-ink-3">${t('The number stays in the register marked cancelled, and a reversing entry goes into the khata.', 'নম্বরটি বাতিল হিসেবে খাতায় থাকে, আর খাতায় উল্টো এন্ট্রি হয়।')}</p>
    </div>`);
}

/* ---------------- Blood donors ---------------- */
const GROUPS = ['A+', 'A−', 'B+', 'B−', 'O+', 'O−', 'AB+', 'AB−'];
const normG = (g) => String(g).replace('-', '−');
const MONTHS_AGO = [0, 1, 2, 4, 5, 7, 9, 13, 18, -1, 3, 6, 25, -1];
const LAST_LBL = (m) => (m < 0 ? ['Never', 'কখনো না'] : m === 0 ? ['This month', 'এই মাসে'] : [`${m} month${m > 1 ? 's' : ''} ago`, `${bnD(m)} মাস আগে`]);
const donors = families.flatMap((f, i) => peopleOf(f, i).map((p, k) => ({ ...p, fi: i, phone: f.phone, famNo: f.no, k })))
  .filter((p) => { const age = Number((p.rel.match(/\d+/) || [])[0]); return !age || age >= 18; })
  .filter((p, n) => (p.fi * 7 + p.k * 3 + n) % 5 !== 0) // the rest did not opt in on their form
  .map((p, n) => ({ ...p, blood: normG(p.blood), ago: MONTHS_AGO[(p.fi + p.k * 5) % MONTHS_AGO.length] }));
const eligible = (d) => d.ago < 0 || d.ago >= 3;
let dGroup = 'all', dLane = 'all', dElig = false, dQ = '';
function donorsScreen() {
  const counts = Object.fromEntries(GROUPS.map((g) => [g, donors.filter((d) => d.blood === g).length]));
  const list = donors.filter((d) => (dGroup === 'all' || d.blood === dGroup) && (dLane === 'all' || d.lane === dLane) && (!dElig || eligible(d))
    && `${d.name} ${d.nameBn} ${d.famNo}`.toLowerCase().includes(dQ.toLowerCase()));
  const camp = events.find((e) => e.id === 'blood');
  C.paint(C.screen('donors'), `
    ${C.pageHead('Blood donors', 'রক্তদাতা', t(`${donors.length} members said yes to donating on their membership form. Only the committee sees this list.`, `${donors.length} জন সদস্য ফর্মে রক্তদানে সম্মতি দিয়েছেন। এই তালিকা শুধু কমিটি দেখে।`), `
      <button class="btn btn-line btn-sm" data-act="donors-csv"><i data-lucide="file-down"></i>${t('Export', 'ডাউনলোড')}</button>
      <button class="btn btn-primary btn-sm" data-act="blood-urgent"><i data-lucide="droplet"></i>${t('Urgent request', 'জরুরি অনুরোধ')}</button>`)}
    <div class="paper-card p-4 sm:p-5 mb-5 flex flex-wrap items-center gap-4">
      <span class="w-12 h-12 rounded-full bg-sindoor-wash text-sindoor grid place-items-center shrink-0"><i data-lucide="heart-pulse" class="w-6 h-6"></i></span>
      <div class="flex-1 min-w-[220px]"><p class="font-semibold">${t(camp.title, camp.titleBn)} · ${dn(camp.day)} ${t(camp.mon, camp.monBn)} · ${t(camp.time, bnText(camp.time))}</p>
        <p class="text-sm text-ink-2">${t(`${donors.filter(eligible).length} donors are eligible (3+ months since last donation). With the blood bank, Medical College.`, `${donors.filter(eligible).length} জন যোগ্য (শেষ দানের পর ৩+ মাস)। মেডিক্যাল কলেজ ব্লাড ব্যাংকের সঙ্গে।`)}</p></div>
      <button class="btn btn-ink btn-sm" data-act="blood-invite"><i data-lucide="send"></i>${t('Invite eligible donors', 'যোগ্য দাতাদের আমন্ত্রণ')}</button>
    </div>
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <button data-dg="all" aria-pressed="${dGroup === 'all'}" class="${chipCls}">${t('All groups', 'সব গ্রুপ')} <span class="opacity-70 num">${dn(String(donors.length))}</span></button>
      ${GROUPS.map((g) => `<button data-dg="${g}" aria-pressed="${dGroup === g}" class="${chipCls} font-semibold">${g} <span class="opacity-70 num font-normal">${dn(String(counts[g]))}</span></button>`).join('')}
    </div>
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <select id="d-lane" class="field h-9 text-sm w-auto" aria-label="${L('Lane', 'গলি')}"><option value="all">${L('All lanes', 'সব গলি')}</option>
        ${[...new Set(families.map((f) => f.lane))].map((l) => `<option value="${l}" ${dLane === l ? 'selected' : ''}>${L(l, families.find((f) => f.lane === l).laneBn)}</option>`).join('')}</select>
      <button data-delig aria-pressed="${dElig}" class="${chipCls}"><i data-lucide="calendar-check"></i>${t('Can donate now', 'এখন দিতে পারবেন')}</button>
      <input id="d-q" value="${esc(dQ)}" class="field h-9 text-sm w-full sm:w-60 sm:ml-auto" data-bn-ph="নাম বা পরিবার নং" placeholder="Name or family no." />
    </div>
    <div class="paper-card overflow-x-auto relative">
      <table class="khata-table min-w-[600px]">
        <thead><tr><th>${t('Member', 'সদস্য')}</th><th>${t('Group', 'গ্রুপ')}</th><th class="hidden md:table-cell">${t('Lane', 'গলি')}</th><th>${t('Last donated', 'শেষ দান')}</th><th><span class="sr-only">${t('Action', 'কাজ')}</span></th></tr></thead>
        <tbody>
          ${list.length ? list.slice(0, 60).map((d) => `<tr>
            <td><span class="block font-semibold">${t(d.name, d.nameBn)}</span><span class="block text-[13px] text-ink-3 num">${d.famNo} · ${t(d.rel, d.relBn)}</span></td>
            <td><span class="inline-grid place-items-center min-w-11 h-8 px-2 rounded-md border-2 border-sindoor text-sindoor-deep font-bold num">${d.blood}</span></td>
            <td class="hidden md:table-cell text-ink-2">${t(d.lane, d.laneBn)}</td>
            <td><span class="block text-[15px]">${t(...LAST_LBL(d.ago))}</span>${eligible(d) ? `<span class="text-[12.5px] font-semibold text-tulsi">${t('Can donate', 'দিতে পারবেন')}</span>` : `<span class="text-[12.5px] text-ink-3">${t(`Wait ${3 - d.ago} more month${3 - d.ago > 1 ? 's' : ''}`, `আরও ${bnD(3 - d.ago)} মাস অপেক্ষা`)}</span>`}</td>
            <td class="text-right whitespace-nowrap">
              <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/91${d.phone}" aria-label="WhatsApp"><i data-lucide="message-circle"></i></a>
              <button class="btn btn-ghost btn-sm" data-act="blood-record" data-id="${d.id}">${t('Donated', 'দিয়েছেন')}</button></td>
          </tr>`).join('') : `<tr><td colspan="5" class="!py-12 text-center text-ink-3">${t('No donor matches these filters. Try another lane or all groups.', 'এই ফিল্টারে কোনো দাতা নেই। অন্য গলি বা সব গ্রুপ দেখুন।')}</td></tr>`}
        </tbody>
      </table>
    </div>
    <p class="text-sm text-ink-3 mt-3">${t(`Showing ${Math.min(60, list.length)} of ${list.length}. Children under 18 are never listed. Members can withdraw consent in the app at any time.`, `${list.length} জনের মধ্যে ${Math.min(60, list.length)} জন। ১৮-র কম বয়সীদের কখনো তালিকায় রাখা হয় না। সদস্যরা অ্যাপে যেকোনো সময় সম্মতি তুলে নিতে পারেন।`)}</p>`);
  $$('[data-dg]').forEach((b) => b.addEventListener('click', () => { dGroup = b.dataset.dg; donorsScreen(); }));
  $('[data-delig]').addEventListener('click', () => { dElig = !dElig; donorsScreen(); });
  $('#d-lane').addEventListener('change', (e) => { dLane = e.target.value; donorsScreen(); });
  const q = $('#d-q');
  q.addEventListener('input', () => { dQ = q.value; donorsScreen(); const n = $('#d-q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
}
const bloodMsg = (g, units, place) => L(
  `URGENT · Gede Maitree Club\n${units} unit(s) of ${g} blood needed at ${place} today. If you can donate (last donation 3+ months ago), please reply or call Tapas-da on ${club.phone}. Thank you.`,
  `জরুরি · গেদে মৈত্রী ক্লাব\nআজ ${place}-এ ${g} গ্রুপের ${bnD(units)} ইউনিট রক্ত দরকার। দিতে পারলে (শেষ দানের পর ৩+ মাস) উত্তর দিন বা তাপস-দাকে ফোন করুন ${club.phone}। ধন্যবাদ।`);
function waListDrawer(titleEn, titleBn, people, text, noteEn, noteBn) {
  C.openDrawer(`
    <div class="p-6">
      <div class="flex items-center"><h2 class="font-display text-[1.7rem] leading-tight pr-4">${t(titleEn, titleBn)}</h2>${C.closeBtn}</div>
      <div class="mt-3 rounded-lg bg-[#e7ddc9] p-3"><div class="bg-[#dcf3d0] rounded-lg rounded-tr-sm p-3 text-[14px] leading-relaxed ml-6 whitespace-pre-line">${esc(text)}</div></div>
      <p class="mt-3 text-[15px] text-ink-2">${t(noteEn, noteBn)}</p>
      <ul class="mt-3 divide-y divide-rule border-y border-rule">${people.map((p) => `<li class="py-2.5 flex items-center gap-3">
        <span class="flex-1 min-w-0"><span class="block font-semibold truncate">${t(p.name, p.nameBn)}</span><span class="block text-sm text-ink-3 num">${p.sub || ''}</span></span>
        <a target="_blank" rel="noopener" data-wa-sent href="https://wa.me/91${p.phone}?text=${encodeURIComponent(text)}" class="btn btn-ink btn-sm"><i data-lucide="message-circle"></i>${t('Open', 'খুলুন')}</a></li>`).join('') || `<li class="py-6 text-center text-ink-3">${t('Nobody matches.', 'কেউ মেলেনি।')}</li>`}</ul>
      <p class="mt-4 text-[13px] text-ink-3">${t('Nothing is sent automatically. Each chat opens on your phone with the message filled in.', 'নিজে থেকে কিছু যায় না। প্রতিটি চ্যাট আপনার ফোনে বার্তা লেখা অবস্থায় খোলে।')}</p>
    </div>`);
  $$('[data-wa-sent]').forEach((a) => a.addEventListener('click', () => { setTimeout(() => { a.outerHTML = `<span class="chip bg-paper-2 text-ink-2"><i data-lucide="check"></i>${L('Opened', 'খোলা হয়েছে')}</span>`; refreshIcons(); }, 50); }));
}

/* ---------------- Volunteers & duty roster ---------------- */
let vEvt = 'sports';
const vols = volunteers.map((v) => ({ ...v }));
const vName = (n) => { const v = vols.find((x) => x.name === n); return v ? t(v.name, v.nameBn) : n; };
function volunteersScreen(param) {
  if (param && duties[param]) vEvt = param;
  const ev = events.find((e) => e.id === vEvt);
  const list = duties[vEvt];
  const short = list.filter((d) => d.who.length < d.need);
  C.paint(C.screen('volunteers'), `
    ${C.pageHead('Volunteers', 'স্বেচ্ছাসেবক', t('Duty rosters for each event, attendance on the day, and hours for the AGM thank-you list.', 'প্রতি অনুষ্ঠানের দায়িত্ব, দিনের হাজিরা, আর এজিএম-এর ধন্যবাদ তালিকার জন্য ঘণ্টা।'), `
      <button class="btn btn-ink btn-sm" data-act="vol-add"><i data-lucide="user-plus"></i>${t('Add volunteer', 'স্বেচ্ছাসেবক যোগ')}</button>`)}
    <div class="flex flex-wrap gap-2 mb-5" role="tablist">
      ${Object.keys(duties).map((k) => { const e = events.find((x) => x.id === k); return `<a href="#volunteers/${k}" role="tab" aria-selected="${vEvt === k}" class="chip h-9 px-3.5 text-sm border border-rule bg-card aria-selected:bg-ink aria-selected:text-paper aria-selected:border-ink">${dn(e.day)} ${t(e.mon, e.monBn)} · ${t(e.title, e.titleBn)}</a>`; }).join('')}
    </div>
    <div class="grid xl:grid-cols-12 gap-6 items-start">
      <div class="xl:col-span-7 paper-card">
        <div class="px-5 pt-4 pb-3 border-b border-rule flex flex-wrap items-center gap-2">
          <div class="min-w-0"><h2 class="font-display text-xl">${t(ev.title, ev.titleBn)}</h2><p class="text-sm text-ink-3">${t(ev.place, ev.placeBn)} · ${t(ev.time, bnText(ev.time))}</p></div>
          <div class="ml-auto flex gap-2"><button class="btn btn-line btn-sm" data-act="vol-share"><i data-lucide="message-circle"></i>${t('Share roster', 'তালিকা পাঠান')}</button>
            <button class="btn btn-ink btn-sm" data-act="vol-attend"><i data-lucide="list-checks"></i>${t('Attendance', 'হাজিরা')}</button></div>
        </div>
        ${short.length ? `<p class="mx-5 mt-4 rounded-lg bg-marigold-wash p-3 text-[15px] flex gap-2.5"><i data-lucide="triangle-alert" class="w-5 h-5 shrink-0 text-turmeric"></i>${t(`${short.length} duties are short of people. Assign before the notice goes out.`, `${short.length}টি দায়িত্বে লোক কম। নোটিসের আগে ঠিক করুন।`)}</p>` : ''}
        <ul class="divide-y divide-rule">
          ${list.map((d, i) => { const gap = d.need - d.who.length; return `<li class="px-5 py-4">
            <div class="flex flex-wrap items-start gap-2">
              <div class="min-w-0 flex-1"><p class="font-semibold">${t(d.duty, d.dutyBn)}</p><p class="text-sm text-ink-3">${t(d.time, bnText(d.time))} · ${t(volunteerSkills[d.skill].en, volunteerSkills[d.skill].bn)}</p></div>
              <span class="chip ${gap > 0 ? 'bg-sindoor-wash text-sindoor-deep' : 'bg-tulsi-wash text-tulsi'} num">${dn(`${d.who.length}/${d.need}`)} ${gap > 0 ? t(`· ${gap} short`, `· ${bnD(gap)} কম`) : t('· full', '· পূর্ণ')}</span>
            </div>
            <div class="mt-2.5 flex flex-wrap gap-1.5">
              ${d.who.map((n) => `<span class="chip bg-paper-2 text-ink pr-1">${vName(n)}<button class="w-5 h-5 grid place-items-center rounded-full hover:bg-paper-3" data-act="vol-unassign" data-i="${i}" data-name="${esc(n)}" aria-label="${L(`Remove ${n}`, `${n} সরান`)}"><i data-lucide="x" class="!w-3 !h-3"></i></button></span>`).join('')}
              <button class="chip border border-dashed border-ink/30 text-ink-2 hover:bg-paper-2" data-act="vol-assign" data-i="${i}"><i data-lucide="plus"></i>${t('Assign', 'যোগ করুন')}</button>
            </div></li>`; }).join('')}
        </ul>
      </div>
      <div class="xl:col-span-5 paper-card">
        <div class="px-5 pt-4 pb-3 border-b border-rule flex items-center"><h2 class="font-display text-xl">${t('Volunteer list', 'স্বেচ্ছাসেবক তালিকা')}</h2>
          <span class="ml-auto text-sm text-ink-3 num">${t(`${vols.reduce((a, b) => a + b.hours, 0)} hours this year`, `এ বছর ${bnD(vols.reduce((a, b) => a + b.hours, 0))} ঘণ্টা`)}</span></div>
        <ul class="divide-y divide-rule">
          ${[...vols].sort((a, b) => b.hours - a.hours).map((v) => `<li class="px-5 py-3 flex items-start gap-3">
            <div class="flex-1 min-w-0"><p class="font-semibold">${t(v.name, v.nameBn)} <span class="text-sm font-normal text-ink-3">· ${t(v.lane, v.laneBn)}</span></p>
              <p class="mt-1 flex flex-wrap gap-1">${v.skills.map((s) => `<span class="chip h-6 text-[12px] border border-rule">${s === 'gate' ? '<i data-lucide="scan-line"></i>' : ''}${t(volunteerSkills[s].en, volunteerSkills[s].bn)}</span>`).join('')}</p></div>
            <span class="text-right shrink-0"><span class="block font-semibold num">${dn(String(v.hours))}</span><span class="block text-[12px] text-ink-3">${t('hours', 'ঘণ্টা')}</span></span>
            <a class="btn btn-ghost btn-sm shrink-0" target="_blank" rel="noopener" href="https://wa.me/91${v.phone}" aria-label="WhatsApp ${esc(v.name)}"><i data-lucide="message-circle"></i></a>
          </li>`).join('')}
        </ul>
        <p class="px-5 py-3 border-t border-rule text-sm text-ink-2">${t('People with “Gate & scanner” get the gate scanner on their phone for that event only.', '“গেট ও স্ক্যানার” থাকলে শুধু সেই অনুষ্ঠানের জন্য ফোনে গেট স্ক্যানার পান।')} <a href="scan.html" class="font-semibold text-sindoor hover:underline">${t('Open scanner', 'স্ক্যানার খুলুন')}</a></p>
      </div>
    </div>`);
}

/* ---------------- Club assets ---------------- */
let asBook = 'all';
const loans = assetLoans.map((l) => ({ ...l }));
const COND = {
  good: ['Good', 'ভালো', 'bg-paper-2 text-ink-2'],
  worn: ['Worn', 'পুরনো', 'border border-ink/40 text-ink'],
  repair: ['Needs repair', 'সারাতে হবে', 'bg-sindoor-wash text-sindoor-deep'],
};
function assetsScreen() {
  const list = assets.filter((a) => asBook === 'all' || a.book === asBook);
  const val = list.reduce((s, a) => s + a.value, 0);
  C.paint(C.screen('assets'), `
    ${C.pageHead('Club assets', 'ক্লাবের সম্পত্তি', t('Chairs, tableware, pandal material and kit: what we own, where it is, and who has borrowed it.', 'চেয়ার, থালা-বাসন, প্যান্ডেল ও সরঞ্জাম: কী আছে, কোথায় আছে, কে ধার নিয়েছেন।'), `
      <button class="btn btn-line btn-sm" data-act="print-doc"><i data-lucide="printer"></i>${t('Stock list', 'স্টক তালিকা')}</button>
      <button class="btn btn-line btn-sm" data-act="asset-add"><i data-lucide="plus"></i>${t('Add item', 'জিনিস যোগ')}</button>
      <button class="btn btn-ink btn-sm" data-act="asset-lend"><i data-lucide="arrow-right-left"></i>${t('Lend out', 'ধার দিন')}</button>`)}
    <div class="flex flex-wrap gap-2 mb-4">
      <button data-asb="all" aria-pressed="${asBook === 'all'}" class="${chipCls}">${t('All books', 'সব খাতা')}</button>
      ${Object.keys(books).map((k) => `<button data-asb="${k}" aria-pressed="${asBook === k}" class="${chipCls}">${C.bookDot(k)}${C.bookName(k)}</button>`).join('')}
    </div>
    <div class="grid xl:grid-cols-12 gap-6 items-start">
      <div class="xl:col-span-8 paper-card overflow-x-auto relative">
        <table class="khata-table min-w-[640px]">
          <thead><tr><th>${t('Item', 'জিনিস')}</th><th class="!text-right">${t('Own', 'মোট')}</th><th class="!text-right">${t('Free now', 'এখন আছে')}</th><th class="hidden md:table-cell">${t('Kept at', 'কোথায়')}</th><th>${t('Condition', 'অবস্থা')}</th><th class="!text-right hidden lg:table-cell">${t('Value', 'মূল্য')}</th><th></th></tr></thead>
          <tbody>
            ${list.map((a) => `<tr>
              <td><span class="flex items-center gap-2.5">${C.bookDot(a.book)}<span><span class="block font-semibold">${t(a.name, a.nameBn)}</span><span class="block text-[13px] text-ink-3 num">${a.id}</span></span></span></td>
              <td class="amt">${inr(a.qty, { plain: true })}</td>
              <td class="amt font-semibold ${a.out ? 'text-turmeric' : ''}">${inr(a.qty - a.out, { plain: true })}</td>
              <td class="hidden md:table-cell text-ink-2 text-[14px]">${t(a.place, a.placeBn)}</td>
              <td><span class="chip ${COND[a.cond][2]}">${t(COND[a.cond][0], COND[a.cond][1])}</span></td>
              <td class="amt hidden lg:table-cell text-ink-2">${inr(a.value)}</td>
              <td class="text-right whitespace-nowrap">${a.cond === 'repair' ? `<button class="btn btn-ghost btn-sm" data-act="asset-repair" data-id="${a.id}"><i data-lucide="wrench"></i>${t('Repair', 'সারান')}</button>` : `<button class="btn btn-ghost btn-sm" data-act="asset-lend" data-id="${a.id}">${t('Lend', 'ধার')}</button>`}</td>
            </tr>`).join('')}
            <tr class="bg-paper-2/50 font-semibold [&>td]:border-t [&>td]:border-t-ink/20 [&>td]:border-b-[3px] [&>td]:border-double [&>td]:border-b-ink/25">
              <td>${t('Book value', 'খাতার মূল্য')}</td><td></td><td></td><td class="hidden md:table-cell"></td><td></td><td class="amt hidden lg:table-cell">${inr(val)}</td><td></td></tr>
          </tbody>
        </table>
      </div>
      <div class="xl:col-span-4 paper-card">
        <div class="px-5 pt-4 pb-3 border-b border-rule"><h2 class="font-display text-xl">${t('Out on loan', 'ধারে আছে')}</h2></div>
        <ul class="divide-y divide-rule">
          ${loans.length ? loans.map((l) => { const a = assets.find((x) => x.id === l.asset); return `<li class="px-5 py-3.5">
            <div class="flex items-start gap-2"><p class="font-semibold flex-1">${dn(String(l.qty))} × ${t(a.name, a.nameBn)}</p>${l.overdue ? `<span class="chip bg-sindoor text-white">${t('Overdue', 'সময় পেরিয়েছে')}</span>` : ''}</div>
            <p class="text-sm text-ink-2">${t(l.to, l.toBn)}</p>
            <p class="text-[13px] text-ink-3 num">${t(`Out ${l.out} · back by ${l.due}`, `দেওয়া ${l.out} · ফেরত ${l.due}`)}${l.deposit ? ` · ${t('deposit', 'জামানত')} ${inr(l.deposit)}` : ''}</p>
            <div class="flex gap-2 mt-2"><button class="btn btn-line btn-sm" data-act="asset-return" data-id="${l.id}"><i data-lucide="package-check"></i>${t('Returned', 'ফেরত এসেছে')}</button>
              ${l.overdue ? `<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/91${families[5].phone}?text=${encodeURIComponent(L(`Namaskar, a reminder from Gede Maitree Club: please return the ${l.qty} ${a.name.toLowerCase()} borrowed on ${l.out}. Thank you.`, `নমস্কার, গেদে মৈত্রী ক্লাব থেকে মনে করাচ্ছি: ${l.out}-এ নেওয়া ${bnD(l.qty)}টি ${a.nameBn} ফেরত দিন। ধন্যবাদ।`))}"><i data-lucide="message-circle"></i>${t('Remind', 'মনে করান')}</a>` : ''}</div>
          </li>`; }).join('') : `<li class="px-5 py-10 text-center text-ink-3">${t('Everything is back in the godown.', 'সব কিছু গুদামে ফিরে এসেছে।')}</li>`}
        </ul>
        <p class="px-5 py-3 border-t border-rule text-sm text-ink-2">${t('Members borrow free with a small deposit. Catering orders reserve tableware automatically.', 'সদস্যরা অল্প জামানতে বিনা ভাড়ায় নেন। ক্যাটারিং অর্ডারে থালা-বাসন নিজে থেকেই সংরক্ষিত হয়।')}</p>
      </div>
    </div>`);
  $$('[data-asb]').forEach((b) => b.addEventListener('click', () => { asBook = b.dataset.asb; assetsScreen(); }));
}

/* ---------------- Roles & "view as" ---------------- */
export let viewAs = null;
const ALWAYS = ['dashboard', 'profile'];
export function canSee(screenName) {
  if (!viewAs || ALWAYS.includes(screenName)) return true;
  const m = rolePerms.modules.find((x) => x.screens.includes(screenName));
  return !m || m.p[viewAs] !== 'none';
}
export function lockedScreen(el, name) {
  const r = rolePerms.roles.find((x) => x.id === viewAs);
  C.paint(el, `<div class="paper-card max-w-lg mx-auto mt-10 p-8 text-center">
    <span class="w-14 h-14 mx-auto rounded-full bg-paper-2 grid place-items-center"><i data-lucide="lock" class="w-7 h-7 text-ink-2"></i></span>
    <h1 class="font-display text-2xl mt-4">${t('Not in this role’s menu', 'এই ভূমিকার মেনুতে নেই')}</h1>
    <p class="text-ink-2 mt-2">${t(`A ${r.en} cannot open this page. If ${r.people} needs it, the secretary can change the role in Settings.`, `${r.bn} এই পাতা খুলতে পারেন না। ${r.peopleBn}-এর দরকার হলে সম্পাদক সেটিংসে ভূমিকা বদলাতে পারেন।`)}</p>
    <div class="flex justify-center gap-2 mt-5"><a href="#dashboard" class="btn btn-line btn-sm">${t('Go to Today', 'আজ-এ যান')}</a><button class="btn btn-ink btn-sm" data-act="view-as" data-role="">${t('Exit preview', 'প্রিভিউ বন্ধ')}</button></div>
  </div>`);
}
function paintRoleBanner() {
  const el = $('#role-banner'); if (!el) return;
  const r = viewAs && rolePerms.roles.find((x) => x.id === viewAs);
  el.classList.toggle('hidden', !r);
  if (!r) { el.innerHTML = ''; return; }
  C.paint(el, `<div class="bg-marigold-wash border-b border-marigold/50 px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
    <i data-lucide="eye" class="w-5 h-5 text-turmeric shrink-0"></i>
    <p class="flex-1 min-w-[200px]">${t(`Previewing as <strong>${r.en}</strong> (${r.people}). The menu shows only what this role can open.`, `<strong>${r.bn}</strong> (${r.peopleBn}) হিসেবে দেখছেন। মেনুতে শুধু এই ভূমিকার পাতা।`)}</p>
    <button class="btn btn-ink btn-sm" data-act="view-as" data-role=""><i data-lucide="x"></i>${t('Exit preview', 'প্রিভিউ বন্ধ')}</button></div>`);
}
const PERM = {
  full: ['Add & change', 'যোগ ও বদল', 'bg-ink text-white', 'pencil-line'],
  own: ['Own book only', 'শুধু নিজের', 'border border-ink/40 text-ink', 'user-round-check'],
  view: ['View only', 'শুধু দেখা', 'bg-paper-2 text-ink-2', 'eye'],
  none: ['No access', 'নেই', 'text-ink-3', 'minus'],
};
function rolesTab() {
  return `<div class="paper-card overflow-hidden">
    <div class="px-5 pt-4 pb-3 border-b border-rule flex flex-wrap items-center gap-2"><h2 class="font-display text-xl">${t('What each role can do', 'কোন ভূমিকা কী করতে পারে')}</h2>
      <span class="ml-auto text-sm text-ink-3">${t('Use “View as” to see the console through their eyes', '“দেখুন” দিয়ে ওঁদের চোখে কনসোল দেখুন')}</span></div>
    <div class="overflow-x-auto relative"><table class="khata-table min-w-[900px]">
      <thead><tr><th class="w-[200px]">${t('Area', 'বিভাগ')}</th>${rolePerms.roles.map((r) => `<th class="!normal-case !tracking-normal align-bottom"><span class="block text-[13px] text-ink font-semibold">${t(r.en, r.bn)}</span><span class="block text-[12px] font-normal text-ink-3">${t(r.people, r.peopleBn)}</span>
        <span class="mt-1.5 flex gap-1"><button class="btn btn-line h-7 px-2 text-[12px]" data-act="view-as" data-role="${r.id}"><i data-lucide="eye" class="!w-3.5 !h-3.5"></i>${t('View as', 'দেখুন')}</button><button class="btn btn-ghost h-7 px-2 text-[12px]" data-act="role-edit" data-role="${r.id}" aria-label="${L(`Edit ${r.en}`, `${r.bn} সম্পাদনা`)}"><i data-lucide="pencil" class="!w-3.5 !h-3.5"></i></button></span></th>`).join('')}</tr></thead>
      <tbody>${rolePerms.modules.map((m) => `<tr><td class="font-semibold">${t(m.en, m.bn)}</td>${rolePerms.roles.map((r) => { const p = PERM[m.p[r.id]]; return `<td><span class="chip h-6 text-[12px] ${p[2]}"><i data-lucide="${p[3]}"></i>${t(p[0], p[1])}</span></td>`; }).join('')}</tr>`).join('')}</tbody>
    </table></div>
    <div class="px-5 py-4 border-t border-rule grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-ink-2">
      <p class="sm:col-span-2 font-semibold text-ink">${t('Rules no role can switch off', 'যে নিয়ম কোনো ভূমিকা বন্ধ করতে পারে না')}</p>
      ${[['Khata entries are never deleted, only reversed with a note', 'খাতার এন্ট্রি মোছা যায় না, শুধু নোট দিয়ে উল্টানো'], ['Expenses over ₹10,000 need a second signature', '₹১০,০০০-এর বেশি খরচে দ্বিতীয় সই'], ['Only the last 4 digits of Aadhaar are stored', 'আধারের শুধু শেষ ৪ সংখ্যা রাখা হয়'], ['Every change is written to the audit log', 'প্রতিটি পরিবর্তন অডিট লগে ওঠে']].map(([en, bn]) => `<p class="flex gap-2"><i data-lucide="lock" class="w-4 h-4 shrink-0 mt-0.5"></i>${t(en, bn)}</p>`).join('')}
    </div></div>`;
}

/* ---------------- Data, export & backup ---------------- */
const backups = [
  ['15 Nov, 2:00 am', '১৫ নভে, রাত ২:০০', '4.2 MB'], ['14 Nov, 2:00 am', '১৪ নভে, রাত ২:০০', '4.2 MB'], ['13 Nov, 2:00 am', '১৩ নভে, রাত ২:০০', '4.1 MB'],
  ['12 Nov, 2:00 am', '১২ নভে, রাত ২:০০', '4.1 MB'], ['11 Nov, 2:00 am', '১১ নভে, রাত ২:০০', '4.0 MB'],
];
const periods = [{ en: 'September 2026', bn: 'সেপ্টেম্বর ২০২৬', locked: '3 Oct · Tapas Mondal', lockedBn: '৩ অক্টো · তাপস মণ্ডল' }, { en: 'October 2026', bn: 'অক্টোবর ২০২৬', locked: null }, { en: 'November 2026', bn: 'নভেম্বর ২০২৬', locked: null, current: true }];
const EXPORTS = [
  ['families', 'users', 'Families & people', 'পরিবার ও সদস্য', '24 families · 86 people (sample)', '২৪টি পরিবার · ৮৬ জন (নমুনা)'],
  ['khata', 'book-open', 'Khata · November 2026', 'খাতা · নভেম্বর ২০২৬', 'All three books, with who entered each line', 'তিনটি খাতা, প্রতিটি লাইনে লেখকের নাম'],
  ['receipts', 'receipt', 'Receipts register', 'রসিদ খাতা', 'Including cancelled numbers and reasons', 'বাতিল নম্বর ও কারণসহ'],
  ['audit', 'history', 'Audit log', 'অডিট লগ', 'Every change, for the auditor', 'অডিটরের জন্য প্রতিটি পরিবর্তন'],
  ['donors', 'droplet', 'Blood donors', 'রক্তদাতা', 'Only members who opted in', 'শুধু সম্মতি দেওয়া সদস্য'],
];
function dataTab() {
  return `<div class="grid xl:grid-cols-2 gap-6 items-start">
    <div class="paper-card">
      <div class="px-5 pt-4 pb-3 border-b border-rule"><h2 class="font-display text-xl">${t('Export', 'ডাউনলোড')}</h2><p class="text-sm text-ink-3">${t('Spreadsheet files (CSV) that open in Excel or Google Sheets, in the current language.', 'এক্সেল বা গুগল শিটে খোলে এমন ফাইল (CSV), বর্তমান ভাষায়।')}</p></div>
      <ul class="divide-y divide-rule">${EXPORTS.map(([k, icon, en, bn, sEn, sBn]) => `<li class="px-5 py-3 flex items-center gap-3">
        <span class="w-9 h-9 rounded-full bg-paper-2 grid place-items-center shrink-0"><i data-lucide="${icon}" class="w-[18px] h-[18px]"></i></span>
        <span class="flex-1 min-w-0"><span class="block font-semibold">${t(en, bn)}</span><span class="block text-sm text-ink-3">${t(sEn, sBn)}</span></span>
        <button class="btn btn-line btn-sm shrink-0" data-act="export" data-kind="${k}"><i data-lucide="download"></i>CSV</button></li>`).join('')}</ul>
      <div class="px-5 py-3 border-t border-rule flex flex-wrap items-center gap-2"><p class="text-sm text-ink-2 flex-1 min-w-[200px]">${t('Everything in one file, with bill photos, for handing over to a new committee.', 'নতুন কমিটিকে দেওয়ার জন্য সব কিছু এক ফাইলে, বিলের ছবিসহ।')}</p>
        <button class="btn btn-ink btn-sm" data-act="export-all"><i data-lucide="archive"></i>${t('Full export (ZIP)', 'সম্পূর্ণ (ZIP)')}</button></div>
    </div>
    <div class="space-y-6">
      <div class="paper-card">
        <div class="px-5 pt-4 pb-3 border-b border-rule flex items-center gap-2"><div><h2 class="font-display text-xl">${t('Backups', 'ব্যাকআপ')}</h2><p class="text-sm text-ink-3">${t('Every night at 2 am · encrypted · kept 30 days', 'প্রতি রাত ২টায় · এনক্রিপ্ট করা · ৩০ দিন রাখা')}</p></div>
          <button class="btn btn-ink btn-sm ml-auto" data-act="backup-now"><i data-lucide="hard-drive"></i>${t('Back up now', 'এখনই ব্যাকআপ')}</button></div>
        <ul class="divide-y divide-rule">${backups.map(([en, bn, size], i) => `<li class="px-5 py-2.5 flex items-center gap-3">
          <i data-lucide="${i ? 'cloud' : 'check-circle-2'}" class="w-[18px] h-[18px] ${i ? 'text-ink-3' : 'text-tulsi'}"></i>
          <span class="flex-1 num">${t(en, bn)} <span class="text-sm text-ink-3">· ${size}</span></span>
          <button class="btn btn-ghost btn-sm" data-act="backup-restore" data-i="${i}"><i data-lucide="rotate-ccw"></i>${t('Restore', 'ফেরান')}</button></li>`).join('')}</ul>
      </div>
      <div class="paper-card">
        <div class="px-5 pt-4 pb-3 border-b border-rule"><h2 class="font-display text-xl">${t('Close a month', 'মাস বন্ধ করুন')}</h2><p class="text-sm text-ink-3">${t('A closed month cannot take new entries. Mistakes are reversed in the current month.', 'বন্ধ মাসে নতুন এন্ট্রি হয় না। ভুল চলতি মাসে উল্টানো হয়।')}</p></div>
        <ul class="divide-y divide-rule">${periods.map((p, i) => `<li class="px-5 py-3 flex items-center gap-3">
          <i data-lucide="${p.locked ? 'lock' : 'unlock'}" class="w-[18px] h-[18px] ${p.locked ? '' : 'text-ink-3'}"></i>
          <span class="flex-1"><span class="block font-semibold">${t(p.en, p.bn)}</span><span class="block text-sm text-ink-3">${p.locked ? t(`Closed ${p.locked}`, `বন্ধ ${p.lockedBn}`) : p.current ? t('Current month', 'চলতি মাস') : t('Open', 'খোলা')}</span></span>
          ${!p.locked && !p.current ? `<button class="btn btn-line btn-sm" data-act="period-lock" data-i="${i}"><i data-lucide="lock"></i>${t('Close month', 'বন্ধ করুন')}</button>` : ''}</li>`).join('')}</ul>
      </div>
      <form class="paper-card p-5 divide-y divide-rule" data-save>
        <h2 class="font-display text-xl pb-3">${t('Privacy', 'গোপনীয়তা')}</h2>
        <label class="flex items-center gap-4 py-3.5"><span class="flex-1"><span class="block font-semibold">${t('Store only the last 4 digits of Aadhaar', 'আধারের শুধু শেষ ৪ সংখ্যা রাখুন')}</span><span class="block text-sm text-ink-2">${t('Always on. The paper form stays in the club file.', 'সবসময় চালু। কাগজের ফর্ম ক্লাবের ফাইলে থাকে।')}</span></span><input type="checkbox" class="switch" checked disabled /></label>
        <label class="flex items-center gap-4 py-3.5 cursor-pointer"><span class="flex-1"><span class="block font-semibold">${t('Remove a family’s personal details 3 years after they leave', 'পরিবার ছাড়ার ৩ বছর পর ব্যক্তিগত তথ্য মুছুন')}</span><span class="block text-sm text-ink-2">${t('Receipts keep the name and amount for the accounts.', 'হিসাবের জন্য রসিদে নাম ও টাকা থাকে।')}</span></span><input type="checkbox" class="switch" checked /></label>
        <label class="flex items-center gap-4 py-3.5 cursor-pointer"><span class="flex-1"><span class="block font-semibold">${t('Members can download their own data in the app', 'সদস্যরা অ্যাপে নিজের তথ্য ডাউনলোড করতে পারেন')}</span></span><input type="checkbox" class="switch" checked /></label>
        <div class="pt-4"><button class="btn btn-ink">${t('Save', 'সেভ করুন')}</button></div>
      </form>
    </div>
  </div>`;
}
function downloadCsv(name, rows) {
  const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  logAudit('data', `Exported ${name}`, `${name} ডাউনলোড`);
  ok(`${name} downloaded (sample data).`, `${name} ডাউনলোড হয়েছে (নমুনা তথ্য)।`);
}
const CSV = {
  families: () => [[L('Family no.', 'পরিবার নং'), L('Head', 'প্রধান'), L('Lane', 'গলি'), L('Phone', 'ফোন'), L('People', 'সদস্য'), L('Member since', 'থেকে'), L('Months due', 'বকেয়া মাস'), L('Due (₹)', 'বকেয়া (₹)'), L('Status', 'অবস্থা')],
    ...families.map((f) => [f.no, L(f.head, f.headBn), L(f.lane, f.laneBn), f.phone, f.size, f.since, f.dueMonths, f.due, f.status])],
  khata: () => [[L('Date', 'তারিখ'), L('Book', 'খাতা'), L('Particulars', 'বিবরণ'), L('Ref.', 'সূত্র'), L('In (₹)', 'জমা (₹)'), L('Out (₹)', 'খরচ (₹)'), L('Entered by', 'লিখেছেন')],
    ...ledger.map((r) => [r.date, L(books[r.book].en, books[r.book].bn), L(r.head, r.headBn), r.ref, r.type === 'in' ? r.amount : '', r.type === 'out' ? r.amount : '', r.by])],
  receipts: () => [[L('Receipt', 'রসিদ'), L('Date', 'তারিখ'), L('Book', 'খাতা'), L('From', 'কার থেকে'), L('For', 'বাবদ'), L('Mode', 'মাধ্যম'), L('Amount (₹)', 'টাকা (₹)'), L('By', 'কে'), L('Status', 'অবস্থা')],
    ...receipts.map((r) => [r.no, r.date, L(books[r.book].en, books[r.book].bn), L(r.from, r.fromBn), L(...r.for), r.mode, r.amount, r.by, r.status === 'ok' ? L('Valid', 'বৈধ') : `${L('Cancelled', 'বাতিল')}: ${L(...r.reason)}`])],
  audit: () => [[L('When', 'কখন'), L('Who', 'কে'), L('Area', 'বিভাগ'), L('What', 'কী'), L('Device', 'ডিভাইস'), L('Flagged', 'চিহ্নিত')],
    ...auditLog.map((a) => [L(a.at, a.atBn), L(a.who, a.whoBn), L(MODS[a.mod][0], MODS[a.mod][1]), L(a.en, a.bn), a.device, a.flag ? 'Y' : ''])],
  donors: () => [[L('Name', 'নাম'), L('Family no.', 'পরিবার নং'), L('Blood group', 'রক্তের গ্রুপ'), L('Lane', 'গলি'), L('Last donated', 'শেষ দান'), L('Phone', 'ফোন')],
    ...donors.map((d) => [L(d.name, d.nameBn), d.famNo, d.blood, L(d.lane, d.laneBn), L(...LAST_LBL(d.ago)), d.phone])],
};

/* ---------------- Notice composer preview ---------------- */
const AUD = [['Everyone', 'সবাই', 286], ['Committee only', 'শুধু কমিটি', 7], ['Families with dues', 'বকেয়া থাকা পরিবার', 9], ['Volunteers', 'স্বেচ্ছাসেবক', 38]];
let pvTab = 'push';
export function wireNotice(form) {
  const box = $('#notice-preview', form); if (!box) return;
  const [ten, tbn] = $$('input.field', form);
  const msg = $('textarea', form);
  const draw = () => {
    const title = (lang === 'bn' ? tbn.value : ten.value) || L('Notice title', 'নোটিসের শিরোনাম');
    const body = msg.value || L('Your message', 'আপনার বার্তা');
    const ai = Number(($('input[name="aud"]:checked', form) || {}).value || 0);
    const n = AUD[ai][2];
    const pv = {
      push: `<div class="rounded-2xl bg-night text-paper p-4"><p class="text-[12px] text-paper/60 text-center num">${L('Sat 15 Nov', 'শনি ১৫ নভে')}</p>
        <div class="mt-3 rounded-xl bg-white/10 p-3 flex gap-3"><span class="w-9 h-9 rounded-lg bg-paper grid place-items-center shrink-0">${seal({ size: 30, rotate: 0 })}</span>
        <div class="min-w-0"><p class="text-[12px] text-paper/70 flex">${L('Gede Maitree Club', 'গেদে মৈত্রী ক্লাব')}<span class="ml-auto pl-2">${L('now', 'এখন')}</span></p><p class="font-semibold leading-snug truncate">${esc(title)}</p><p class="text-[13.5px] text-paper/85 leading-snug line-clamp-2">${esc(body)}</p></div></div></div>`,
      wa: `<div class="rounded-lg bg-[#e7ddc9] p-3"><div class="bg-white rounded-lg rounded-tl-sm p-3 text-[14px] leading-relaxed mr-6 shadow-[0_1px_1px_rgba(0,0,0,.08)]">
        <p class="text-[12.5px] font-semibold text-turmeric">${L('Gede Maitree Club Members', 'গেদে মৈত্রী ক্লাব সদস্য')}</p><p class="font-bold">📌 ${esc(title)}</p><p class="whitespace-pre-line">${esc(body)}</p><p class="text-[#1a73e8] break-all">gedemaitree.club/n/${notices.length + 1}</p><p class="text-right text-[11px] text-ink-3">7:42 pm</p></div></div>`,
      web: `<div class="rounded-lg border border-rule bg-paper p-4"><p class="text-[12.5px] font-semibold text-sindoor">${L('Notice', 'নোটিস')} · <span class="text-ink-3">${L('15 Nov', '১৫ নভে')}</span></p><p class="font-display text-lg leading-snug mt-1">${esc(title)}</p><p class="text-[14px] text-ink-2 mt-1">${esc(body)}</p></div>`,
    };
    box.innerHTML = `<div class="flex items-center gap-2 mb-2"><p class="label !mb-0">${L('Preview', 'নমুনা')}</p>
      <div class="ml-auto flex rounded-lg bg-paper-2 p-0.5 text-[13px] font-semibold" role="tablist">${[['push', 'App', 'অ্যাপ'], ['wa', 'WhatsApp', 'হোয়াটসঅ্যাপ'], ['web', 'Website', 'ওয়েবসাইট']].map(([k, en, bn]) => `<button type="button" role="tab" data-pv="${k}" aria-selected="${pvTab === k}" class="px-2.5 h-7 rounded-md aria-selected:bg-card aria-selected:shadow-sm">${L(en, bn)}</button>`).join('')}</div></div>
      ${pv[pvTab]}
      <p class="text-sm text-ink-2 mt-2 flex items-center gap-2"><i data-lucide="users" class="w-4 h-4"></i>${L(`Reaches ${n} ${ai === 1 ? 'people' : ai === 3 ? 'volunteers' : 'families'}`, `${bnD(n)} ${ai === 1 ? 'জন' : ai === 3 ? 'জন স্বেচ্ছাসেবক' : 'টি পরিবার'} পাবেন`)}</p>`;
    refreshIcons();
    $$('[data-pv]', box).forEach((b) => b.addEventListener('click', () => { pvTab = b.dataset.pv; draw(); }));
    form.dataset.reach = n;
  };
  form.addEventListener('input', draw); form.addEventListener('change', draw); draw();
}
export const audienceRadios = () => AUD.map(([en, bn, n], i) => `<label class="chip h-9 px-3.5 text-sm border border-rule bg-card cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-paper has-[:checked]:border-ink"><input type="radio" name="aud" value="${i}" class="sr-only" ${i ? '' : 'checked'} />${t(en, bn)} <span class="opacity-70 num">${dn(String(n))}</span></label>`).join('');

/* ---------------- Bell (activity) ---------------- */
const bellItems = [
  { icon: 'smartphone', en: '2 UPI payments to confirm', bn: '২টি ইউপিআই যাচাই বাকি', href: '#dashboard', at: '2:14 pm' },
  { icon: 'user-check', en: 'New application · Soumen Pramanik', bn: 'নতুন আবেদন · সৌমেন প্রামানিক', href: '#applications', at: '12 Nov' },
  { icon: 'hand-coins', en: 'Bapi Halder has held ₹7,350 for 10 days', bn: 'বাপি হালদারের কাছে ১০ দিন ধরে ₹৭,৩৫০', href: '#cash', at: '15 Nov' },
  { icon: 'link-2', en: '3 bank lines not matched to the khata', bn: 'ব্যাংকের ৩টি লাইন খাতায় মেলেনি', href: '#cash', at: '14 Nov' },
  { icon: 'package-x', en: '40 chairs overdue from the Sen family', bn: 'সেন পরিবারের ৪০টি চেয়ার ফেরত বাকি', href: '#assets', at: '14 Nov' },
  { icon: 'shield-alert', en: '3 wrong passwords for Sutapa Bose', bn: 'সুতপা বসুর ৩ বার ভুল পাসওয়ার্ড', href: '#audit', at: '11 Nov' },
];
let unread = bellItems.length;
function paintBell() {
  const badge = $('#bell-badge'); if (!badge) return;
  badge.textContent = lang === 'bn' ? bnD(unread) : unread;
  badge.classList.toggle('hidden', !unread);
  const p = $('#bell-panel'); if (!p || p.classList.contains('hidden')) return;
  C.paint(p, `<div class="px-4 py-3 border-b border-rule flex items-center"><p class="font-semibold">${t('Activity', 'কার্যকলাপ')}</p>
      <button class="ml-auto text-sm font-semibold text-sindoor hover:underline" data-bell-read>${t('Mark all read', 'সব পড়া হয়েছে')}</button></div>
    <ul class="max-h-[60vh] overflow-y-auto divide-y divide-rule">${bellItems.slice(0, 12).map((b, i) => `<li><a href="${b.href}" data-bell-go class="flex items-start gap-3 px-4 py-3 hover:bg-paper-2 ${i < unread ? 'bg-marigold-wash/30' : ''}">
      <i data-lucide="${b.icon}" class="w-[18px] h-[18px] mt-0.5 shrink-0 text-ink-2"></i><span class="flex-1 text-[14.5px] leading-snug">${t(b.en, b.bn)}</span><span class="text-[12px] text-ink-3 whitespace-nowrap num">${b.at}</span></a></li>`).join('')}</ul>
    <a href="#audit" data-bell-go class="block px-4 py-2.5 border-t border-rule text-sm font-semibold text-center hover:bg-paper-2">${t('Open the audit log', 'অডিট লগ খুলুন')}</a>`);
  $('[data-bell-read]', p).addEventListener('click', () => { unread = 0; paintBell(); });
  $$('[data-bell-go]', p).forEach((a) => a.addEventListener('click', () => p.classList.add('hidden')));
}

/* ---------------- Keyboard shortcuts ---------------- */
const KEYS = [
  ['d', 'dashboard', 'Today', 'আজ'], ['a', 'applications', 'Applications', 'আবেদন'], ['f', 'members', 'Families', 'পরিবার'], ['c', 'collect', 'Collect payment', 'টাকা জমা'],
  ['u', 'dues', 'Dues & reminders', 'বকেয়া ও তাগাদা'], ['k', 'khata', 'Khata', 'খাতা'], ['b', 'cash', 'Cash & bank', 'নগদ ও ব্যাংক'], ['i', 'receipts', 'Receipts register', 'রসিদ খাতা'],
  ['p', 'chanda', 'Puja chanda', 'পূজার চাঁদা'], ['t', 'catering', 'Catering', 'ক্যাটারিং'], ['n', 'nursery', 'Nursery', 'নার্সারি'], ['e', 'events', 'Events', 'অনুষ্ঠান'],
  ['v', 'volunteers', 'Volunteers', 'স্বেচ্ছাসেবক'], ['m', 'meetings', 'Notices & meetings', 'নোটিস ও সভা'], ['r', 'reports', 'Reports', 'রিপোর্ট'], ['l', 'audit', 'Audit log', 'অডিট লগ'], ['s', 'settings', 'Settings', 'সেটিংস'],
];
function shortcutsDrawer() {
  const k = (s) => `<kbd class="inline-grid place-items-center min-w-7 h-7 px-1.5 rounded border border-ink/25 bg-card text-[13px] font-semibold shadow-[0_1px_0_rgba(0,0,0,.15)]">${s}</kbd>`;
  C.openDrawer(`<div class="p-6">
    <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t('Keyboard shortcuts', 'কিবোর্ড শর্টকাট')}</h2>${C.closeBtn}</div>
    <ul class="mt-4 divide-y divide-rule border-y border-rule text-[15px]">
      <li class="py-2.5 flex items-center gap-3"><span class="flex-1">${t('Search families, receipts and pages', 'পরিবার, রসিদ ও পাতা খুঁজুন')}</span>${k('/')}</li>
      <li class="py-2.5 flex items-center gap-3"><span class="flex-1">${t('This list', 'এই তালিকা')}</span>${k('?')}</li>
      <li class="py-2.5 flex items-center gap-3"><span class="flex-1">${t('Close a panel', 'প্যানেল বন্ধ')}</span>${k('Esc')}</li>
    </ul>
    <p class="mt-5 text-sm font-semibold text-ink-3">${t('Go to a page: press G, then the letter', 'পাতায় যান: G, তারপর অক্ষর')}</p>
    <ul class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-[15px]">${KEYS.map(([key, , en, bn]) => `<li class="py-1.5 flex items-center gap-2 border-b border-rule"><span class="flex-1">${t(en, bn)}</span>${k('G')}${k(key.toUpperCase())}</li>`).join('')}</ul>
  </div>`);
}

/* ---------------- Global search: pages ---------------- */
const PAGES = [...KEYS.map(([, id, en, bn]) => [id, en, bn]), ['donors', 'Blood donors', 'রক্তদাতা'], ['assets', 'Club assets', 'ক্লাবের সম্পত্তি'], ['cards', 'ID cards', 'পরিচয়পত্র'], ['gallery', 'Gallery', 'ছবি ও ভিডিও'], ['settings/roles', 'Roles & permissions', 'ভূমিকা ও অনুমতি'], ['settings/data', 'Export & backup', 'ডাউনলোড ও ব্যাকআপ'], ['profile', 'My account', 'আমার অ্যাকাউন্ট']];
export function searchPages(q) {
  if (q.length < 2) return '';
  const hits = PAGES.filter(([id, en, bn]) => canSee(id.split('/')[0]) && `${en} ${bn} ${id}`.toLowerCase().includes(q)).slice(0, 4);
  const recs = receipts.filter((r) => r.no.toLowerCase().includes(q)).slice(0, 3);
  return (hits.length ? `<p class="px-3 pt-2.5 pb-1 text-[12px] font-bold uppercase tracking-wide text-ink-3">${t('Pages', 'পাতা')}</p>${hits.map(([id, en, bn]) => `<a href="#${id}" class="flex items-center gap-3 px-3 py-2 hover:bg-paper-2"><i data-lucide="arrow-up-right" class="w-4 h-4 text-ink-3"></i><span class="font-semibold">${t(en, bn)}</span></a>`).join('')}` : '')
    + (recs.length ? `<p class="px-3 pt-2.5 pb-1 text-[12px] font-bold uppercase tracking-wide text-ink-3">${t('Receipts', 'রসিদ')}</p>${recs.map((r) => `<a href="#receipts" data-g-rc="${r.no}" class="flex items-center gap-3 px-3 py-2 hover:bg-paper-2">${C.bookDot(r.book)}<span class="num font-semibold">${r.no}</span><span class="text-sm text-ink-3 truncate">${t(r.from, r.fromBn)}</span><span class="ml-auto text-sm num">${inr(r.amount)}</span></a>`).join('')}` : '');
}

/* ---------------- Actions ---------------- */
const ACTIONS = {
  'audit-csv'() { downloadCsv('audit-log.csv', CSV.audit()); },
  'audit-note'(b) {
    const a = auditLog.find((x) => x.id === b.dataset.id);
    C.formDrawer('Add a note to the log', 'লগে নোট যোগ', `
      <div class="rounded-lg bg-paper-2 p-4 text-[15px]">${t(a.en, a.bn)}</div>
      ${C.fld('Note', 'নোট', '<textarea class="field" rows="3" required></textarea>')}`,
    'Add note', 'নোট যোগ', 'Note added as a new line in the log.', 'নোট লগে নতুন লাইন হিসেবে যোগ হয়েছে।',
    { onDone: () => { logAudit(a.mod, `Note on ${a.id.toUpperCase()}: ${a.en}`, `${a.id.toUpperCase()}-এ নোট: ${a.bn}`); C.rerender(); } });
  },
  'cash-handover'(b) { handoverDrawer(b.dataset.id); },
  'cash-deposit'() {
    const box = holders.find((h) => h.treasurer);
    const sug = Math.max(0, Math.floor((box.amount - 500) / 100) * 100);
    C.formDrawer('Deposit cash to the bank', 'ব্যাংকে নগদ জমা', `
      <div class="rounded-lg bg-paper-2 p-4 text-[15px] flex"><span>${t('In the cash box', 'ক্যাশবাক্সে')}</span><strong class="ml-auto">${inr(box.amount)}</strong></div>
      <div class="grid grid-cols-2 gap-3">${C.fld('Amount to deposit', 'জমার টাকা', C.inp(`class="field num text-xl h-12" inputmode="numeric" data-digits="6" required value="${sug}" id="dep-amt"`))}${C.fld('Keep as float', 'হাতে রাখুন', C.inp('class="field num h-12" value="₹500" disabled'))}</div>
      <div class="grid grid-cols-2 gap-3">${C.fld('Pay-in slip no.', 'স্লিপ নং', C.inp('class="field num" required placeholder="20994" data-digits="8"'))}${C.fld('Date', 'তারিখ', C.inp('type="date" class="field num" value="2026-11-15"'))}</div>
      <label class="w-full h-20 rounded-lg border-2 border-dashed border-rule bg-card text-ink-2 flex items-center justify-center gap-2 cursor-pointer"><i data-lucide="camera" class="w-5 h-5"></i><span class="text-sm" data-photo-name>${t('Photo of the stamped slip', 'সিল করা স্লিপের ছবি')}</span><input type="file" accept="image/*" capture="environment" class="sr-only" data-photo-input /></label>
      <p class="text-sm text-ink-2">${t('Shows as “in transit” until the next bank statement is imported, then matches by itself.', 'পরের স্টেটমেন্ট আসা পর্যন্ত “পথে” দেখাবে, তারপর নিজে থেকেই মিলবে।')}</p>`,
    'Record deposit', 'জমা লিখুন', '', '', { onDone: (f) => {
      const amt = Math.min(box.amount, Number(f.querySelector('#dep-amt').value) || 0);
      const slip = f.querySelectorAll('input.field')[2].value || '—';
      box.amount -= amt; inTransit.push({ amount: amt, slip, on: '15 Nov' });
      logAudit('cash', `Deposited ₹${amt.toLocaleString('en-IN')} cash to SBI · slip ${slip}`, `SBI-তে ₹${bnD(amt.toLocaleString('en-IN'))} নগদ জমা · স্লিপ ${slip}`);
      ok(`₹${amt.toLocaleString('en-IN')} recorded as deposited. It shows as in transit.`, `₹${bnD(amt.toLocaleString('en-IN'))} জমা লেখা হয়েছে। “পথে” দেখাবে।`);
      if (location.hash.startsWith('#cash')) C.rerender(); else location.hash = 'cash';
    } });
  },
  'bank-import'() {
    C.formDrawer('Import bank statement', 'ব্যাংক স্টেটমেন্ট আনুন', `
      ${C.fld('Bank', 'ব্যাংক', C.sel([`SBI ${bank.account}`]))}
      <label class="w-full h-28 rounded-lg border-2 border-dashed border-rule bg-card text-ink-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-ink/30"><i data-lucide="file-spreadsheet" class="w-6 h-6"></i><span class="text-sm" data-photo-name>${t('Choose the CSV or PDF from net banking', 'নেট ব্যাংকিং থেকে CSV বা PDF বেছে নিন')}</span><input type="file" accept=".csv,.pdf,.xls,.xlsx" class="sr-only" data-photo-input /></label>
      <p class="text-sm text-ink-2">${t('Lines are matched to the khata by UTR, amount and date. Anything unsure is left for you to match.', 'UTR, টাকা ও তারিখ দিয়ে খাতার সঙ্গে মেলানো হয়। সন্দেহ থাকলে আপনার জন্য রেখে দেওয়া হয়।')}</p>`,
    'Import', 'আনুন', 'Statement read: 9 lines, 6 matched by themselves, 3 left for you.', 'স্টেটমেন্ট পড়া হয়েছে: ৯টি লাইন, ৬টি নিজে মিলেছে, ৩টি আপনার জন্য।',
    { onDone: () => logAudit('cash', 'Imported SBI statement · 9 lines', 'SBI স্টেটমেন্ট আনা · ৯টি লাইন') });
  },
  'bank-match'(b) {
    const s = stmt.find((x) => x.id === b.dataset.id);
    const sugg = s.desc.startsWith('UPI') ? [[`UPI from MC-0104 waiting on Today (₹${s.amount})`, `আজ-এ অপেক্ষমাণ MC-0104-এর ইউপিআই (₹${bnD(s.amount)})`, 'MC-0104 UPI'], ['Book as a new subscription receipt', 'নতুন চাঁদার রসিদ হিসেবে', 'New receipt']]
      : s.type === 'out' ? [['Book as bank charges (Club book)', 'ব্যাংক চার্জ হিসেবে (ক্লাব খাতা)', 'Bank charges'], ['Link to an existing expense', 'আগের খরচের সঙ্গে', 'Existing expense']]
        : [['Book as bank interest (Club book)', 'ব্যাংক সুদ হিসেবে (ক্লাব খাতা)', 'Bank interest'], ['Book as other income', 'অন্য আয় হিসেবে', 'Other income']];
    C.formDrawer('Match a bank line', 'ব্যাংকের লাইন মেলান', `
      <div class="rounded-lg bg-paper-2 p-4"><p class="text-[13px] num break-all">${s.desc}</p><p class="mt-1 font-display text-2xl ${s.type === 'out' ? 'text-sindoor' : ''}">${s.type === 'out' ? '−' : '+'}${inr(s.amount)}</p><p class="text-sm text-ink-3 num">${dn(s.date)}</p></div>
      <div class="space-y-2">${sugg.map(([en, bn, v], i) => `<label class="flex items-center gap-3 rounded-lg border border-rule bg-card p-3 cursor-pointer has-[:checked]:border-ink has-[:checked]:ring-2 has-[:checked]:ring-ink/10"><input type="radio" name="m" value="${v}" ${i ? '' : 'checked'} class="w-4 h-4 accent-[#2b2f36]" /><span class="text-[15px]">${t(en, bn)}</span>${i ? '' : `<span class="ml-auto chip h-5 px-1.5 text-[11px] bg-tulsi-wash text-tulsi">${t('Best match', 'সেরা মিল')}</span>`}</label>`).join('')}</div>
      ${C.fld('Note (optional)', 'নোট (ঐচ্ছিক)', C.inp())}`,
    'Match', 'মেলান', 'Matched. The khata and the bank now agree on this line.', 'মিলেছে। এই লাইনে খাতা ও ব্যাংক এক।',
    { onDone: (f) => { s.match = f.querySelector('input[name="m"]:checked').value; logAudit('cash', `Matched bank line ${s.date} ₹${s.amount} → ${s.match}`, `ব্যাংকের লাইন ${s.date} ₹${bnD(s.amount)} মেলানো → ${s.match}`); C.rerender(); } });
  },
  'bank-close'() {
    C.formDrawer('Mark November reconciled', 'নভেম্বর মেলানো হয়েছে', `
      <div class="rounded-lg bg-tulsi-wash p-4 text-[15px] flex gap-2.5"><i data-lucide="check-circle-2" class="w-5 h-5 text-tulsi shrink-0"></i>${t('Every bank line has a khata entry, and the difference is fully explained.', 'ব্যাংকের প্রতিটি লাইনের খাতায় এন্ট্রি আছে, পার্থক্যের পুরো ব্যাখ্যা আছে।')}</div>
      <label class="flex items-start gap-3 text-[15px]"><input type="checkbox" required class="mt-1 w-4 h-4 accent-[#d21f1b]" />${t('I have checked the statement against the passbook', 'পাসবইয়ের সঙ্গে স্টেটমেন্ট মিলিয়ে দেখেছি')}</label>`,
    'Confirm', 'নিশ্চিত', 'November reconciled. It goes into the AGM pack.', 'নভেম্বর মেলানো হয়েছে। এজিএম প্যাকে যাবে।',
    { onDone: () => { reconciled = true; logAudit('cash', 'Marked November bank reconciliation complete', 'নভেম্বরের ব্যাংক মেলানো সম্পূর্ণ'); C.rerender(); } });
  },
  'receipts-csv'() { downloadCsv('receipts-register.csv', CSV.receipts()); },
  'rc-view'(b) { receiptDrawer(b.dataset.no); },
  'rc-cancel'(b) {
    const r = receipts.find((x) => x.no === b.dataset.no);
    C.formDrawer(`Cancel receipt ${r.no}`, `রসিদ ${r.no} বাতিল`, `
      <div class="rounded-lg bg-sindoor-wash p-4 text-[15px]"><p class="font-semibold">${t(r.from, r.fromBn)} · ${inr(r.amount)}</p><p class="text-ink-2">${dn(r.date)} · ${t(r.mode, MODE_BN[r.mode])}</p></div>
      ${C.fld('Reason', 'কারণ', C.sel([L('Wrong family', 'ভুল পরিবার'), L('Wrong amount', 'ভুল টাকা'), L('Payment bounced / not received', 'টাকা আসেনি'), L('Duplicate', 'দুবার লেখা')]))}
      ${C.fld('Note (required)', 'নোট (বাধ্যতামূলক)', '<textarea class="field" rows="2" required></textarea>')}
      <p class="text-sm text-ink-2">${t('A reversing entry of the same amount goes into the khata today. The secretary is asked to countersign.', 'আজ খাতায় সমান টাকার উল্টো এন্ট্রি হবে। সম্পাদকের সই চাওয়া হবে।')}</p>`,
    'Cancel receipt', 'রসিদ বাতিল', `${r.no} cancelled. Reversal entered and sent for countersign.`, `${r.no} বাতিল। উল্টো এন্ট্রি হয়েছে, সইয়ের জন্য পাঠানো হয়েছে।`,
    { danger: true, onDone: (f) => { const why = f.querySelector('select').value; r.status = 'cancelled'; r.reason = [`${why} · ${f.querySelector('textarea').value}`, `${why} · ${f.querySelector('textarea').value}`]; logAudit('receipts', `Cancelled receipt ${r.no} · ${why}`, `রসিদ ${r.no} বাতিল · ${why}`, { flag: true }); C.rerender(); } });
  },
  'donors-csv'() { downloadCsv('blood-donors.csv', CSV.donors()); },
  'blood-urgent'() {
    const g0 = dGroup === 'all' ? 'O+' : dGroup;
    C.formDrawer('Urgent blood request', 'জরুরি রক্তের অনুরোধ', `
      <div class="grid grid-cols-2 gap-3">${C.fld('Blood group', 'রক্তের গ্রুপ', `<select class="field" id="bu-g">${GROUPS.map((g) => `<option ${g === g0 ? 'selected' : ''}>${g}</option>`).join('')}</select>`)}${C.fld('Units', 'ইউনিট', C.inp('class="field num" id="bu-u" inputmode="numeric" data-digits="2" value="2"'))}</div>
      ${C.fld('Hospital', 'হাসপাতাল', C.inp(`id="bu-h" required value="${L('Medical College, Kolkata', 'মেডিক্যাল কলেজ, কলকাতা')}"`))}
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" id="bu-c" checked />${t('Include compatible groups (O− can give to everyone)', 'মানানসই গ্রুপও (O− সবাইকে দিতে পারেন)')}</label>
      <div id="bu-pv"></div>`,
    'Next: pick donors', 'পরের ধাপ: দাতা বাছুন', '', '', { onDone: (f) => {
      const g = f.querySelector('#bu-g').value, units = f.querySelector('#bu-u').value || 1, place = f.querySelector('#bu-h').value;
      const okG = f.querySelector('#bu-c').checked ? [g, ...(g.endsWith('+') ? [g.replace('+', '−')] : []), 'O−'] : [g];
      const ppl = donors.filter((d) => okG.includes(d.blood) && eligible(d)).map((d) => ({ ...d, sub: `${d.blood} · ${d.famNo}` }));
      logAudit('donors', `Urgent request for ${units} unit(s) of ${g} · ${ppl.length} donors shown`, `${g} গ্রুপের ${bnD(units)} ইউনিটের জরুরি অনুরোধ · ${bnD(ppl.length)} জন দাতা`);
      setTimeout(() => waListDrawer(`${ppl.length} donors who can give ${g}`, `${g} দিতে পারেন এমন ${ppl.length} জন`, ppl, bloodMsg(g, units, place), 'Work down the list. Each chat opens with the message filled in.', 'তালিকা ধরে এগোন। প্রতিটি চ্যাটে বার্তা লেখা থাকবে।'), 30);
    } });
    const f = $('[data-drawer-form]');
    const pv = () => { $('#bu-pv').innerHTML = `<p class="label">${L('Message', 'বার্তা')}</p><div class="rounded-lg bg-[#e7ddc9] p-3"><div class="bg-[#dcf3d0] rounded-lg rounded-tr-sm p-3 text-[14px] leading-relaxed ml-6 whitespace-pre-line">${esc(bloodMsg(f.querySelector('#bu-g').value, f.querySelector('#bu-u').value || 1, f.querySelector('#bu-h').value))}</div></div>`; };
    f.addEventListener('input', pv); f.addEventListener('change', pv); pv();
  },
  'blood-invite'() {
    const camp = events.find((e) => e.id === 'blood');
    const ppl = donors.filter(eligible).slice(0, 25).map((d) => ({ ...d, sub: `${d.blood} · ${d.famNo}` }));
    waListDrawer(`Invite to the ${camp.title}`, `${camp.titleBn}-এ আমন্ত্রণ`, ppl,
      L(`Namaskar from Gede Maitree Club. Our ${camp.title} is on ${camp.day} ${camp.mon}, ${camp.time}, at the ${camp.place.toLowerCase()}. You are eligible to donate. Reply YES to book a slot. Thank you.`, `গেদে মৈত্রী ক্লাব থেকে নমস্কার। আমাদের ${camp.titleBn} ${bnD(camp.day)} ${camp.monBn}, ${camp.placeBn}-এ। আপনি রক্ত দিতে পারবেন। সময় নিতে “হ্যাঁ” লিখুন। ধন্যবাদ।`),
      'First 25 eligible donors. Bulk sending needs the WhatsApp Business API later.', 'প্রথম ২৫ জন যোগ্য দাতা। একসঙ্গে পাঠাতে পরে হোয়াটসঅ্যাপ বিজনেস API লাগবে।');
  },
  'blood-record'(b) {
    const d = donors.find((x) => x.id === b.dataset.id);
    C.formDrawer(`Donation · ${d.name}`, `রক্তদান · ${d.nameBn}`, `
      <div class="rounded-lg bg-paper-2 p-4 flex items-center"><span class="font-semibold">${t(d.name, d.nameBn)}</span><span class="ml-auto inline-grid place-items-center min-w-11 h-8 px-2 rounded-md border-2 border-sindoor text-sindoor-deep font-bold">${d.blood}</span></div>
      <div class="grid grid-cols-2 gap-3">${C.fld('Date', 'তারিখ', C.inp('type="date" class="field num" value="2026-11-15"'))}${C.fld('Where', 'কোথায়', C.sel([L('Club camp', 'ক্লাবের শিবির'), L('Hospital, on request', 'হাসপাতাল, অনুরোধে')]))}</div>
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" checked />${t('Send a thank-you card in the app', 'অ্যাপে ধন্যবাদ কার্ড পাঠান')}</label>`,
    'Save', 'সেভ করুন', 'Donation recorded. They are hidden from requests for 3 months.', 'রক্তদান লেখা হয়েছে। ৩ মাস অনুরোধে দেখানো হবে না।',
    { onDone: () => { d.ago = 0; logAudit('donors', `Recorded blood donation · ${d.name} (${d.blood})`, `রক্তদান লেখা · ${d.nameBn} (${d.blood})`); C.rerender(); } });
  },
  'vol-assign'(b) {
    const d = duties[vEvt][Number(b.dataset.i)];
    const busy = (n) => duties[vEvt].filter((x) => x !== d && x.who.includes(n)).map((x) => L(x.duty, x.dutyBn));
    const sorted = [...vols].sort((x, y) => (y.skills.includes(d.skill) - x.skills.includes(d.skill)) || y.hours - x.hours);
    C.formDrawer(`Assign · ${d.duty}`, `দায়িত্ব · ${d.dutyBn}`, `
      <p class="text-sm text-ink-2 -mt-2">${t(d.time, bnText(d.time))} · ${t(`needs ${d.need}`, `${bnD(d.need)} জন দরকার`)}</p>
      <ul class="divide-y divide-rule border-y border-rule">${sorted.map((v) => `<li><label class="flex items-center gap-3 py-2.5 cursor-pointer"><input type="checkbox" value="${esc(v.name)}" ${d.who.includes(v.name) ? 'checked' : ''} class="w-5 h-5 accent-[#2b2f36]" />
        <span class="flex-1 min-w-0"><span class="block font-semibold">${t(v.name, v.nameBn)}</span><span class="block text-[13px] text-ink-3">${busy(v.name).length ? `${L('Also on', 'আরও আছেন')}: ${esc(busy(v.name).join(', '))}` : t(v.lane, v.laneBn)}</span></span>
        ${v.skills.includes(d.skill) ? `<span class="chip h-6 text-[12px] bg-tulsi-wash text-tulsi">${t('Has the skill', 'দক্ষ')}</span>` : ''}</label></li>`).join('')}</ul>`,
    'Save roster', 'তালিকা সেভ', 'Roster saved. Assigned volunteers get a notification.', 'তালিকা সেভ হয়েছে। স্বেচ্ছাসেবকরা নোটিফিকেশন পাবেন।',
    { onDone: (f) => { d.who = $$('input[type=checkbox]:checked', f).map((c) => c.value); logAudit('volunteers', `Roster changed · ${d.duty} · ${d.who.length}/${d.need}`, `তালিকা বদল · ${d.dutyBn} · ${bnD(d.who.length)}/${bnD(d.need)}`); C.rerender(); } });
  },
  'vol-unassign'(b) {
    const d = duties[vEvt][Number(b.dataset.i)];
    d.who = d.who.filter((n) => n !== b.dataset.name);
    C.rerender();
    toast(`<i data-lucide="user-x"></i>${t(`${b.dataset.name} removed from ${d.duty}.`, `${d.dutyBn} থেকে সরানো হয়েছে।`)}`);
  },
  'vol-share'() {
    const ev = events.find((e) => e.id === vEvt);
    const text = `${L(ev.title, ev.titleBn)} · ${L(`${ev.day} ${ev.mon}`, `${bnD(ev.day)} ${ev.monBn}`)}\n${L('Volunteer duties', 'স্বেচ্ছাসেবকদের দায়িত্ব')}\n\n${duties[vEvt].map((d) => `• ${L(d.duty, d.dutyBn)} (${d.time}): ${d.who.map((n) => L(n, vols.find((v) => v.name === n)?.nameBn || n)).join(', ') || L('needed', 'লোক দরকার')}`).join('\n')}\n\n${L('Please be there 15 minutes early. Thank you!', '১৫ মিনিট আগে আসুন। ধন্যবাদ!')}`;
    C.openDrawer(`<div class="p-6">
      <div class="flex items-center"><h2 class="font-display text-[1.7rem]">${t('Share roster', 'তালিকা পাঠান')}</h2>${C.closeBtn}</div>
      <div class="mt-3 rounded-lg bg-[#e7ddc9] p-3"><div class="bg-[#dcf3d0] rounded-lg rounded-tr-sm p-3 text-[14px] leading-relaxed ml-6 whitespace-pre-line">${esc(text)}</div></div>
      <div class="grid grid-cols-2 gap-2 mt-4"><button class="btn btn-line" id="vs-copy"><i data-lucide="copy"></i>${t('Copy text', 'লেখা কপি')}</button>
        <a class="btn btn-ink" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text)}"><i data-lucide="message-circle"></i>${t('Open WhatsApp', 'হোয়াটসঅ্যাপ খুলুন')}</a></div>
      <p class="mt-3 text-[13px] text-ink-3">${t('Paste it in the volunteers’ group. Nothing is sent from here.', 'স্বেচ্ছাসেবকদের গ্রুপে পেস্ট করুন। এখান থেকে কিছু যায় না।')}</p></div>`);
    $('#vs-copy').addEventListener('click', () => { navigator.clipboard?.writeText(text).catch(() => {}); ok('Roster copied.', 'তালিকা কপি হয়েছে।'); });
  },
  'vol-attend'() {
    const ev = events.find((e) => e.id === vEvt);
    const ppl = [...new Set(duties[vEvt].flatMap((d) => d.who))];
    C.formDrawer(`Attendance · ${ev.title}`, `হাজিরা · ${ev.titleBn}`, `
      <p class="text-sm text-ink-2 -mt-2">${t('Tick who turned up. Hours go to their record for the AGM thank-you list.', 'কে এসেছেন টিক দিন। ঘণ্টা এজিএম-এর ধন্যবাদ তালিকায় যাবে।')}</p>
      <ul class="divide-y divide-rule border-y border-rule">${ppl.map((n) => `<li><label class="flex items-center gap-3 py-2.5 cursor-pointer"><input type="checkbox" checked value="${esc(n)}" class="w-5 h-5 accent-[#2c6a3a]" /><span class="flex-1 font-semibold">${vName(n)}</span>
        <input class="field h-9 w-20 num text-center" inputmode="numeric" value="5" data-digits="2" aria-label="${L('Hours', 'ঘণ্টা')}" /><span class="text-sm text-ink-3">${t('hrs', 'ঘণ্টা')}</span></label></li>`).join('') || `<li class="py-6 text-center text-ink-3">${t('Nobody is assigned yet.', 'এখনও কাউকে দেওয়া হয়নি।')}</li>`}</ul>`,
    'Save attendance', 'হাজিরা সেভ', '', '', { onDone: (f) => {
      let n = 0, hrs = 0;
      $$('li', f).forEach((li) => { const c = $('input[type=checkbox]', li); if (c?.checked) { const h = Number($('input.field', li).value) || 0; const v = vols.find((x) => x.name === c.value); if (v) v.hours += h; n++; hrs += h; } });
      logAudit('volunteers', `Attendance saved · ${ev.title} · ${n} present · ${hrs} hours`, `হাজিরা · ${ev.titleBn} · ${bnD(n)} জন · ${bnD(hrs)} ঘণ্টা`);
      ok(`Attendance saved: ${n} present, ${hrs} hours added.`, `হাজিরা সেভ: ${bnD(n)} জন, ${bnD(hrs)} ঘণ্টা যোগ হয়েছে।`);
      C.rerender();
    } });
  },
  'vol-add'() {
    C.formDrawer('Add a volunteer', 'স্বেচ্ছাসেবক যোগ', `
      ${C.fld('Member', 'সদস্য', `<select class="field" id="va-m">${families.map((f) => `<option value="${f.no}">${f.no} · ${esc(L(f.head, f.headBn))}</option>`).join('')}</select>`)}
      <div><p class="label">${t('Can help with', 'কোন কাজে')}</p><div class="flex flex-wrap gap-2">${Object.entries(volunteerSkills).map(([k, s]) => `<label class="chip h-9 px-3.5 text-sm border border-rule bg-card cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-paper has-[:checked]:border-ink"><input type="checkbox" value="${k}" class="sr-only" />${t(s.en, s.bn)}</label>`).join('')}</div></div>
      <label class="flex items-center gap-3 text-[15px]"><input type="checkbox" class="switch" checked />${t('Add to the volunteers’ WhatsApp group', 'স্বেচ্ছাসেবকদের হোয়াটসঅ্যাপ গ্রুপে যোগ')}</label>`,
    'Add', 'যোগ করুন', '', '', { onDone: (f) => {
      const fam = families.find((x) => x.no === f.querySelector('#va-m').value);
      const skills = $$('input[type=checkbox][value]:checked', f).map((c) => c.value).filter((k) => volunteerSkills[k]);
      if (!vols.find((v) => v.name === fam.head)) vols.push({ name: fam.head, nameBn: fam.headBn, lane: fam.lane, laneBn: fam.laneBn, skills: skills.length ? skills : ['serving'], hours: 0, phone: fam.phone });
      logAudit('volunteers', `Added volunteer ${fam.head}`, `স্বেচ্ছাসেবক যোগ ${fam.headBn}`);
      ok(`${fam.head} added to the volunteer list.`, `${fam.headBn} স্বেচ্ছাসেবক তালিকায় যোগ হয়েছেন।`);
      C.rerender();
    } });
  },
  'asset-add'() {
    C.formDrawer('Add an item', 'জিনিস যোগ', `
      ${C.fld('Item (English)', 'জিনিস (ইংরেজি)', C.inp('required placeholder="Gas burners"'))}
      ${C.fld('Item (Bengali)', 'জিনিস (বাংলা)', C.inp('lang="bn" placeholder="গ্যাস বার্নার"'))}
      <div><p class="label">${t('Book', 'খাতা')}</p>${C.radioRow('asb', [['Club', 'ক্লাব'], ['Catering', 'ক্যাটারিং'], ['Nursery', 'নার্সারি']])}</div>
      <div class="grid grid-cols-2 gap-3">${C.fld('Quantity', 'সংখ্যা', C.inp('class="field num" inputmode="numeric" data-digits="4" required value="1"'))}${C.fld('Total value', 'মোট মূল্য', C.inp('class="field num" inputmode="numeric" data-digits="7" placeholder="₹"'))}</div>
      ${C.fld('Kept at', 'কোথায় থাকে', C.sel([L('Club godown', 'ক্লাবের গুদাম'), L('Catering store', 'ক্যাটারিং স্টোর'), L('Club room', 'ক্লাব ঘর'), L('Roof store', 'ছাদের স্টোর'), L('Nursery shed', 'নার্সারি শেড')]))}
      <label class="w-full h-20 rounded-lg border-2 border-dashed border-rule bg-card text-ink-2 flex items-center justify-center gap-2 cursor-pointer"><i data-lucide="camera" class="w-5 h-5"></i><span class="text-sm" data-photo-name>${t('Photo or purchase bill', 'ছবি বা কেনার বিল')}</span><input type="file" accept="image/*" class="sr-only" data-photo-input /></label>`,
    'Add item', 'যোগ করুন', '', '', { onDone: (f) => {
      const ins = $$('input.field', f);
      const bk = ['club', 'catering', 'nursery'][Number(f.querySelector('input[name="asb"]:checked').value)];
      const id = `AS-${String(assets.length + 1).padStart(2, '0')}`;
      const placeSel = f.querySelector('select');
      assets.push({ id, name: ins[0].value, nameBn: ins[1].value || ins[0].value, book: bk, qty: Number(ins[2].value) || 1, out: 0, place: placeSel.value, placeBn: placeSel.value, cond: 'good', value: Number(ins[3].value) || 0 });
      logAudit('assets', `Added ${ins[0].value} (${id}) to the asset register`, `সম্পত্তি তালিকায় ${ins[1].value || ins[0].value} (${id}) যোগ`);
      ok(`${ins[0].value} added as ${id}.`, `${ins[1].value || ins[0].value} যোগ হয়েছে (${id})।`); C.rerender();
    } });
  },
  'asset-lend'(b) {
    const free = assets.filter((a) => a.qty - a.out > 0 && a.cond !== 'repair');
    C.formDrawer('Lend out', 'ধার দিন', `
      ${C.fld('Item', 'জিনিস', `<select class="field" id="al-a">${free.map((a) => `<option value="${a.id}" ${a.id === b.dataset.id ? 'selected' : ''}>${esc(L(a.name, a.nameBn))} · ${L(`${a.qty - a.out} free`, `${bnD(a.qty - a.out)}টি আছে`)}</option>`).join('')}</select>`)}
      <div class="grid grid-cols-2 gap-3">${C.fld('How many', 'কতগুলো', C.inp('class="field num" id="al-q" inputmode="numeric" data-digits="4" required value="20"'))}${C.fld('Back by', 'ফেরতের দিন', C.inp('type="date" class="field num" value="2026-11-18"'))}</div>
      ${C.fld('Borrowed by', 'কে নিচ্ছেন', `<select class="field" id="al-to">${families.slice(0, 12).map((f) => `<option>${f.no} · ${esc(L(f.head, f.headBn))}</option>`).join('')}<option>${L('Catering order', 'ক্যাটারিং অর্ডার')}</option><option>${L('Another club', 'অন্য ক্লাব')}</option></select>`)}
      <div><p class="label">${t('Deposit', 'জামানত')}</p>${C.radioRow('dep', [['₹10 each', 'প্রতিটি ₹১০'], ['None (catering)', 'নেই (ক্যাটারিং)'], ['Waived', 'মকুব']])}</div>`,
    'Lend', 'ধার দিন', '', '', { onDone: (f) => {
      const a = assets.find((x) => x.id === f.querySelector('#al-a').value);
      const q = Math.min(a.qty - a.out, Number(f.querySelector('#al-q').value) || 1);
      const to = f.querySelector('#al-to').value;
      a.out += q;
      const dep = f.querySelector('input[name="dep"]:checked').value === '0' ? q * 10 : 0;
      loans.unshift({ id: `LN-0${34 + loans.length}`, asset: a.id, qty: q, to, toBn: to, out: '15 Nov', due: '18 Nov', deposit: dep });
      logAudit('assets', `Lent ${q} × ${a.name} to ${to}`, `${to}-কে ${bnD(q)}টি ${a.nameBn} ধার`);
      ok(`${q} × ${a.name} lent out. Back by 18 Nov.`, `${bnD(q)}টি ${a.nameBn} ধার দেওয়া হয়েছে। ফেরত ১৮ নভে।`);
      if (location.hash.startsWith('#assets')) C.rerender();
    } });
  },
  'asset-return'(b) {
    const l = loans.find((x) => x.id === b.dataset.id);
    const a = assets.find((x) => x.id === l.asset);
    C.formDrawer(`Returned · ${a.name}`, `ফেরত · ${a.nameBn}`, `
      <div class="rounded-lg bg-paper-2 p-4 text-[15px]"><p class="font-semibold">${dn(String(l.qty))} × ${t(a.name, a.nameBn)}</p><p class="text-ink-2">${t(l.to, l.toBn)}</p></div>
      <div class="grid grid-cols-2 gap-3">${C.fld('Came back in good shape', 'ভালো অবস্থায় ফেরত', C.inp(`class="field num" inputmode="numeric" data-digits="4" value="${l.qty}" id="ar-ok"`))}${C.fld('Damaged or missing', 'ভাঙা বা হারানো', C.inp('class="field num" inputmode="numeric" data-digits="4" value="0" id="ar-bad"'))}</div>
      ${l.deposit ? `<div><p class="label">${t(`Deposit ${inr(l.deposit)}`, `জামানত ${inr(l.deposit)}`)}</p>${C.radioRow('rd', [['Return in full', 'পুরো ফেরত'], ['Keep for damage', 'ক্ষতির জন্য রাখুন']])}</div>` : ''}
      <p class="text-sm text-ink-2">${t('Damaged items are written off only with a second signature, and the loss goes to the khata.', 'ভাঙা জিনিস বাদ দিতে দ্বিতীয় সই লাগে, ক্ষতি খাতায় ওঠে।')}</p>`,
    'Save return', 'ফেরত সেভ', '', '', { onDone: (f) => {
      const bad = Number(f.querySelector('#ar-bad').value) || 0;
      a.out = Math.max(0, a.out - l.qty); a.qty -= Math.min(bad, a.qty);
      loans.splice(loans.indexOf(l), 1);
      logAudit('assets', `Returned ${l.qty} × ${a.name}${bad ? ` · ${bad} damaged, sent for write-off` : ''}`, `${bnD(l.qty)}টি ${a.nameBn} ফেরত${bad ? ` · ${bnD(bad)}টি ক্ষতিগ্রস্ত` : ''}`, { flag: !!bad });
      ok(bad ? `Back in the godown. ${bad} sent for write-off approval.` : 'Back in the godown.', bad ? `গুদামে ফিরেছে। ${bnD(bad)}টি বাদ দেওয়ার অনুমোদনে।` : 'গুদামে ফিরেছে।');
      C.rerender();
    } });
  },
  'asset-repair'(b) {
    const a = assets.find((x) => x.id === b.dataset.id);
    C.formDrawer(`Repair · ${a.name}`, `মেরামত · ${a.nameBn}`, `
      ${C.fld('What is wrong', 'কী সমস্যা', '<textarea class="field" rows="2" required></textarea>')}
      <div class="grid grid-cols-2 gap-3">${C.fld('Repairer', 'কে সারাবেন', C.inp('placeholder="Sur Electronics"'))}${C.fld('Estimate', 'আনুমানিক খরচ', C.inp('class="field num" inputmode="numeric" data-digits="6" placeholder="₹"'))}</div>
      <p class="text-sm text-ink-2">${t('The estimate goes to the treasurer. Once paid, the bill goes into the Club book.', 'আনুমানিক খরচ কোষাধ্যক্ষের কাছে যাবে। টাকা দিলে বিল ক্লাব খাতায় উঠবে।')}</p>`,
    'Send for approval', 'অনুমোদনে পাঠান', 'Repair logged and sent to the treasurer.', 'মেরামত লেখা হয়েছে, কোষাধ্যক্ষের কাছে গেছে।',
    { onDone: () => logAudit('assets', `Repair requested · ${a.name}`, `মেরামতের অনুরোধ · ${a.nameBn}`) });
  },
  'view-as'(b) {
    viewAs = b.dataset.role || null;
    C.onRoleChange();
    const r = viewAs && rolePerms.roles.find((x) => x.id === viewAs);
    toast(`<i data-lucide="eye"></i>${r ? t(`Previewing as ${r.en}.`, `${r.bn} হিসেবে দেখছেন।`) : t('Back to your own view.', 'নিজের দৃশ্যে ফিরেছেন।')}`);
  },
  'role-edit'(b) {
    const r = rolePerms.roles.find((x) => x.id === b.dataset.role);
    const opts = ['full', 'own', 'view', 'none'];
    C.formDrawer(`Permissions · ${r.en}`, `অনুমতি · ${r.bn}`, `
      <p class="text-sm text-ink-2 -mt-2">${t(`${r.people} sees the new menus at the next sign-in.`, `${r.peopleBn} পরের লগইনে নতুন মেনু দেখবেন।`)}</p>
      <ul class="divide-y divide-rule border-y border-rule">${rolePerms.modules.map((m) => `<li class="py-3"><p class="font-semibold text-[15px] mb-1.5">${t(m.en, m.bn)}</p>
        <div class="grid grid-cols-4 gap-1.5">${opts.map((o) => `<label class="flex items-center justify-center h-9 rounded-md border border-rule bg-card cursor-pointer text-[12.5px] font-semibold text-center px-1 has-[:checked]:bg-ink has-[:checked]:text-paper has-[:checked]:border-ink ${r.id === 'secretary' && m.id === 'admin' ? 'opacity-50 pointer-events-none' : ''}"><input type="radio" class="sr-only" name="p-${m.id}" value="${o}" ${m.p[r.id] === o ? 'checked' : ''} />${t(PERM[o][0], PERM[o][1])}</label>`).join('')}</div></li>`).join('')}</ul>
      <p class="text-[13px] text-ink-3">${t('The secretary always keeps Settings, so the club can never be locked out.', 'সম্পাদকের সেটিংস সবসময় থাকে, যাতে ক্লাব কখনো আটকে না যায়।')}</p>`,
    'Save permissions', 'অনুমতি সেভ', `Permissions for ${r.en} saved.`, `${r.bn}-এর অনুমতি সেভ হয়েছে।`,
    { onDone: (f) => { rolePerms.modules.forEach((m) => { const v = f.querySelector(`input[name="p-${m.id}"]:checked`)?.value; if (v) m.p[r.id] = v; }); logAudit('settings', `Changed permissions for ${r.en}`, `${r.bn}-এর অনুমতি বদল`, { flag: true }); C.onRoleChange(); C.rerender(); } });
  },
  export(b) { downloadCsv(`${b.dataset.kind}-${L('en', 'bn')}.csv`, CSV[b.dataset.kind]()); },
  'export-all'() {
    logAudit('data', 'Prepared full export (ZIP)', 'সম্পূর্ণ ডাউনলোড (ZIP) তৈরি');
    C.proto('Full export prepared: 7 registers and 212 bill photos.', 'সম্পূর্ণ ডাউনলোড তৈরি: ৭টি খাতা ও ২১২টি বিলের ছবি।');
  },
  'backup-now'() {
    toast(`<i data-lucide="hard-drive"></i>${t('Backing up…', 'ব্যাকআপ চলছে…')}`);
    setTimeout(() => {
      const [at, atBn] = nowAt(); backups.unshift([at, atBn, '4.2 MB']); backups.length = Math.min(backups.length, 6);
      logAudit('data', 'Manual backup completed · 4.2 MB', 'হাতে ব্যাকআপ সম্পূর্ণ · ৪.২ MB');
      ok('Backup complete and stored off-site.', 'ব্যাকআপ সম্পূর্ণ, অন্য জায়গায় রাখা হয়েছে।');
      if (location.hash.startsWith('#settings')) C.rerender();
    }, 900);
  },
  'backup-restore'(b) {
    const [en, bn] = backups[Number(b.dataset.i)];
    C.formDrawer('Restore a backup', 'ব্যাকআপ ফেরান', `
      <div class="rounded-lg bg-sindoor-wash p-4 text-[15px] flex gap-2.5"><i data-lucide="triangle-alert" class="w-5 h-5 shrink-0 text-sindoor"></i><span>${t(`Everything entered after ${en} will be set aside. The current data is backed up first, so this can be undone.`, `${bn}-এর পরের সব এন্ট্রি আলাদা করে রাখা হবে। আগে বর্তমান তথ্যের ব্যাকআপ হবে, তাই ফেরানো যায়।`)}</span></div>
      ${C.fld('Type RESTORE to confirm', 'নিশ্চিত করতে RESTORE লিখুন', C.inp('required pattern="RESTORE" autocomplete="off" class="field num tracking-[0.2em]"'))}
      <p class="text-sm text-ink-2">${t('Needs the secretary and treasurer. The other one gets an SMS to approve.', 'সম্পাদক ও কোষাধ্যক্ষ দুজনকেই লাগবে। অন্যজন অনুমোদনের এসএমএস পাবেন।')}</p>`,
    'Ask to restore', 'ফেরানোর অনুরোধ', 'Restore requested. Waiting for the secretary’s approval. (Prototype: nothing is restored.)', 'ফেরানোর অনুরোধ গেছে। সম্পাদকের অনুমোদনের অপেক্ষা। (প্রোটোটাইপ: কিছু ফেরানো হয়নি।)',
    { danger: true, onDone: () => logAudit('data', `Restore requested to ${en}`, `${bn}-এ ফেরানোর অনুরোধ`, { flag: true }) });
  },
  'period-lock'(b) {
    const p = periods[Number(b.dataset.i)];
    const uncl = holders.filter((h) => !h.treasurer && h.amount).length;
    C.formDrawer(`Close ${p.en}`, `${p.bn} বন্ধ`, `
      <ul class="space-y-2 text-[15px]">
        <li class="flex gap-2"><i data-lucide="check" class="w-5 h-5 text-tulsi shrink-0"></i>${t('Bank statement reconciled for October', 'অক্টোবরের ব্যাংক মেলানো হয়েছে')}</li>
        <li class="flex gap-2"><i data-lucide="check" class="w-5 h-5 text-tulsi shrink-0"></i>${t('No expenses waiting for a second signature', 'দ্বিতীয় সইয়ের অপেক্ষায় কোনো খরচ নেই')}</li>
        <li class="flex gap-2">${uncl ? `<i data-lucide="triangle-alert" class="w-5 h-5 text-turmeric shrink-0"></i>${t(`${uncl} collectors still hold cash (it is carried into November)`, `${bnD(uncl)} জন সংগ্রাহকের কাছে এখনও নগদ (নভেম্বরে যাবে)`)}` : `<i data-lucide="check" class="w-5 h-5 text-tulsi shrink-0"></i>${t('All cash handed over', 'সব নগদ জমা হয়েছে')}`}</li>
      </ul>
      <label class="flex items-start gap-3 text-[15px]"><input type="checkbox" required class="mt-1 w-4 h-4 accent-[#d21f1b]" />${t('I understand no new entries can be dated in this month after closing', 'বুঝেছি, বন্ধের পর এই মাসের তারিখে নতুন এন্ট্রি হবে না')}</label>`,
    'Close month', 'মাস বন্ধ', `${p.en} closed.`, `${p.bn} বন্ধ হয়েছে।`,
    { danger: true, onDone: () => { p.locked = '15 Nov · Tapas Mondal'; p.lockedBn = '১৫ নভে · তাপস মণ্ডল'; logAudit('khata', `Closed the books for ${p.en}`, `${p.bn}-এর খাতা বন্ধ`, { flag: true }); C.rerender(); } });
  },
  'agm-pack'() {
    const secs = [['Secretary’s report', 'সম্পাদকের প্রতিবেদন', true], ['Income & expenditure, all three books', 'আয়-ব্যয়, তিনটি খাতা', true], ['Balance sheet & bank reconciliation', 'ব্যালান্স শিট ও ব্যাংক মেলানো', true], ['Puja chanda summary', 'পূজার চাঁদার হিসাব', true], ['Membership movement & waivers', 'সদস্য সংখ্যার পরিবর্তন ও মকুব', true], ['Club assets register', 'ক্লাবের সম্পত্তির তালিকা', true], ['Volunteer thank-you list', 'স্বেচ্ছাসেবকদের ধন্যবাদ তালিকা', true], ['Flagged audit lines', 'চিহ্নিত অডিট লাইন', true], ['Resolutions to vote on', 'ভোটের প্রস্তাব', false]];
    const tot = Object.values(books).reduce((a, b2) => a + (b2.income - b2.expense) * 7, 0);
    C.formDrawer('AGM pack 2026–27', 'এজিএম প্যাক ২০২৬–২৭', `
      <div class="rounded-lg bg-paper-2 p-4 text-[15px] space-y-1"><p class="flex"><span>${t('Surplus, all books, Apr–Nov', 'উদ্বৃত্ত, সব খাতা, এপ্রি–নভে')}</span><strong class="ml-auto">${inr(tot)}</strong></p>
        <p class="flex text-ink-2"><span>${t('Families: 277 → 286', 'পরিবার: ২৭৭ → ২৮৬')}</span><span class="ml-auto">${t('+14 joined · −6 lapsed · +1 rejoined', '+১৪ নতুন · −৬ মেয়াদোত্তীর্ণ · +১ ফিরেছেন')}</span></p>
        <p class="flex text-ink-2"><span>${t('Flagged audit lines', 'চিহ্নিত অডিট লাইন')}</span><span class="ml-auto num">${dn(String(auditLog.filter((a) => a.flag).length))}</span></p></div>
      <div class="grid grid-cols-2 gap-3">${C.fld('AGM date', 'এজিএম-এর তারিখ', C.inp('type="date" class="field num" value="2027-04-20"'))}${C.fld('Place', 'জায়গা', C.inp(`value="${L('Club room', 'ক্লাব ঘর')}"`))}</div>
      <div><p class="label">${t('Sections', 'বিভাগ')}</p><ul class="divide-y divide-rule border-y border-rule">${secs.map(([en, bn, on]) => `<li><label class="flex items-center gap-3 py-2 text-[15px] cursor-pointer"><input type="checkbox" ${on ? 'checked' : ''} class="w-4 h-4 accent-[#d21f1b]" />${t(en, bn)}</label></li>`).join('')}</ul></div>
      ${C.fld('Language', 'ভাষা', C.sel([L('Bengali and English, side by side', 'বাংলা ও ইংরেজি পাশাপাশি'), L('Bengali only', 'শুধু বাংলা'), L('English only', 'শুধু ইংরেজি')]))}
      <p class="text-sm text-ink-2">${t(`Signed by the secretary and treasurer, with Reg. No. ${club.regNo} on every page. Members get it in the app 14 days before the AGM.`, `সম্পাদক ও কোষাধ্যক্ষের সই, প্রতি পাতায় রেজি. নং ${club.regNo}। এজিএম-এর ১৪ দিন আগে সদস্যরা অ্যাপে পাবেন।`)}</p>`,
    'Prepare the pack', 'প্যাক তৈরি', '', '', { onDone: () => {
      logAudit('form', 'Prepared AGM pack 2026–27', 'এজিএম প্যাক ২০২৬–২৭ তৈরি');
      C.proto('AGM pack prepared as a PDF, 18 pages.', 'এজিএম প্যাক PDF হিসেবে তৈরি, ১৮ পাতা।');
    } });
  },
  shortcuts() { shortcutsDrawer(); },
};

/* ---------------- Install ---------------- */
export function initAdmin(ctx) {
  C = ctx;
  // Bell
  const bell = $('#bell'), panel = $('#bell-panel');
  if (bell && panel) {
    bell.addEventListener('click', (e) => { e.stopPropagation(); panel.classList.toggle('hidden'); bell.setAttribute('aria-expanded', String(!panel.classList.contains('hidden'))); paintBell(); });
    document.addEventListener('click', (e) => { if (!e.target.closest('#bell-panel') && !e.target.closest('#bell')) { panel.classList.add('hidden'); bell.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') panel.classList.add('hidden'); });
    paintBell();
  }
  // Keyboard: ? for help, G then a letter to jump
  let gAt = 0;
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (!$('#drawer').classList.contains('hidden')) return;
    if (e.key === '?') { e.preventDefault(); shortcutsDrawer(); return; }
    const k = e.key.toLowerCase();
    if (k === 'g') { gAt = Date.now(); return; }
    if (Date.now() - gAt < 1200) { const hit = KEYS.find((x) => x[0] === k); if (hit) { e.preventDefault(); location.hash = hit[1]; } gAt = 0; }
  });
  document.addEventListener('langchange', () => { paintBell(); paintRoleBanner(); });
  return {
    screens: { audit: auditScreen, cash: cashScreen, receipts: receiptsScreen, donors: donorsScreen, volunteers: volunteersScreen, assets: assetsScreen },
    actions: ACTIONS,
    settingsTabs: { roles: rolesTab, data: dataTab },
    paintRoleBanner,
    openReceipt: receiptDrawer,
    dropReceipt: (no) => {
      const i = receipts.findIndex((r) => r.no === no); if (i < 0) return;
      const [r] = receipts.splice(i, 1);
      if (r.mode === 'Cash') holders.find((h) => h.treasurer).amount -= r.amount;
      logAudit('collect', `Undid receipt ${no} straight after entry · number released`, `রসিদ ${no} সঙ্গে সঙ্গে ফেরানো · নম্বর মুক্ত`, { flag: true });
    },
    cashOutside: () => holders.filter((h) => !h.treasurer).reduce((a, b) => a + b.amount, 0),
  };
}
