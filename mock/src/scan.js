// Gate scanner: offline pass checks for event volunteers. Sample data only.
import { boot, t, applyLang, refreshIcons, lang } from './shared.js';
import { families, events } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const bnD = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
const L = (en, bn) => (lang === 'bn' ? bn : en);

const GATES = [['Gate 1 · Bapi Halder', 'গেট ১ · বাপি হালদার'], ['Gate 2 · Manas Kundu', 'গেট ২ · মানস কুণ্ডু'], ['Bus point · Bapi Halder', 'বাস পয়েন্ট · বাপি হালদার']];
const passEvents = events.filter((e) => e.pass);
const S = { evt: passEvents[0], gate: 0, inside: 412, coupons: 388, denied: 3, online: false, queued: 14, sound: true, torch: false, log: [], seen: new Set(['MC-0116']) };
let timer;

/* ---------- Header and counters ---------- */
function paintHead() {
  $('#gate-name').innerHTML = t(...GATES[S.gate]);
  $('#evt-name').innerHTML = t(S.evt.title, S.evt.titleBn);
  $('#sync-btn').innerHTML = S.online ? `<i data-lucide="wifi"></i>${t('Online', 'অনলাইন')}` : `<i data-lucide="wifi-off"></i>${t('Offline', 'অফলাইন')}${S.queued ? ` <span class="num">· ${L(S.queued, bnD(S.queued))}</span>` : ''}`;
  $('#sync-line').innerHTML = S.online
    ? t('All scans uploaded · 286 passes on this phone', 'সব স্ক্যান আপলোড হয়েছে · ফোনে ২৮৬টি পাস')
    : t(`286 passes saved on this phone · synced 6:58 am · ${S.queued} scans waiting to upload`, `ফোনে ২৮৬টি পাস · সকাল ৬:৫৮-এ সিঙ্ক · ${bnD(S.queued)}টি স্ক্যান আপলোডের অপেক্ষায়`);
  for (const k of ['inside', 'coupons', 'denied']) $(`#${k}`).dataset.n = S[k];
  applyLang(document.querySelector('header').parentElement);
  refreshIcons();
}
function paintRecent() {
  $('#recent').innerHTML = S.log.length ? S.log.slice(0, 5).map((r) => `<li class="px-3.5 py-2.5 flex items-center gap-3">
      <span class="w-2.5 h-2.5 rounded-full shrink-0 ${r.tone}"></span>
      <span class="flex-1 min-w-0 truncate">${t(r.who[0], r.who[1])}</span>
      <span class="text-[13px] text-paper/60 whitespace-nowrap">${r.n ? t(`+${r.n}`, `+${bnD(r.n)}`) : t(r.label[0], r.label[1])} · <span class="num">${L(r.at, bnD(r.at))}</span></span></li>`).join('')
    : `<li class="px-3.5 py-4 text-paper/50 text-center">${t('No scans yet on this shift', 'এই শিফটে এখনও স্ক্যান নেই')}</li>`;
  $('#undo').disabled = !S.log.length || !S.log[0].n;
  applyLang($('#recent').parentElement);
}
const nowAt = () => { const d = new Date(); return `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`; };

/* ---------- Results ---------- */
const famOf = (no) => families.find((f) => f.no === no);
function resultFor(kind, f) {
  const fam = f || { ok: famOf('MC-0104'), dues: famOf('MC-0113'), used: famOf('MC-0116'), lapsed: famOf('MC-0140') }[kind] || famOf('MC-0104');
  const who = [`${fam.head} · ${fam.no}`, `${fam.headBn} · ${fam.no}`];
  return {
    ok: { bg: 'bg-tulsi', icon: 'check', head: ['Let them in', 'ঢুকতে দিন'], who, people: fam.size, detail: [`Family pass · ${fam.size} people`, `পরিবারের পাস · ${bnD(fam.size)} জন`] },
    dues: { bg: 'bg-tulsi', icon: 'check', head: ['Let them in', 'ঢুকতে দিন'], who, people: fam.size, detail: [`Family pass · ${fam.size} people`, `পরিবারের পাস · ${bnD(fam.size)} জন`],
      note: [`₹${fam.due} subscription pending. Mention it politely; don’t stop entry.`, `₹${bnD(fam.due)} চাঁদা বাকি। ভদ্রভাবে মনে করিয়ে দিন, আটকাবেন না।`] },
    used: { bg: 'bg-marigold !text-ink', icon: 'history', head: ['Already inside', 'আগেই ঢুকেছেন'], who, people: 0,
      detail: ['Entered 7:41 am at Gate 1, scanned by Bapi', 'সকাল ৭:৪১-এ গেট ১ দিয়ে, বাপি স্ক্যান করেছে'],
      note: ['If someone stepped out and came back, it is fine to let them in.', 'কেউ বাইরে গিয়ে ফিরলে ঢুকতে দিন।'], ask: 'reentry' },
    lapsed: { bg: 'bg-marigold !text-ink', icon: 'alert-triangle', head: ['Check with the committee', 'কমিটির সঙ্গে কথা বলুন'], who, people: 0,
      detail: [`Membership lapsed · ${fam.dueMonths} months due`, `সদস্যপদ মেয়াদোত্তীর্ণ · ${bnD(fam.dueMonths)} মাস বকেয়া`],
      note: ['They can pay at the club desk and come in. Or let them in once; the treasurer is told.', 'ক্লাবের টেবিলে টাকা দিয়ে ঢুকতে পারেন। বা একবার ঢুকতে দিন; কোষাধ্যক্ষকে জানানো হবে।'], ask: 'once' },
    cancelled: { bg: 'bg-sindoor', icon: 'x', head: ['Card cancelled', 'কার্ড বাতিল'], who: ['Sen family · MC-0116-03', 'সেন পরিবার · MC-0116-03'], people: 0,
      detail: ['This card was reported lost on 2 Nov', '২ নভেম্বর কার্ডটি হারানো বলে জানানো হয়েছে'],
      note: ['Ask for another family member’s card or the app QR. Keep this card and hand it to the committee.', 'পরিবারের অন্য কারও কার্ড বা অ্যাপের QR চান। কার্ডটি রেখে কমিটিকে দিন।'], deny: true },
    bad: { bg: 'bg-sindoor', icon: 'x', head: ['Pass not found', 'পাস পাওয়া যায়নি'], who: ['This QR is not a Gede Maitree Club pass', 'এটি গেদে মৈত্রী ক্লাবের পাস নয়'], people: 0,
      detail: ['Ask for the member card, or type the family number', 'সদস্য কার্ড চান, বা পরিবার নম্বর লিখুন'], deny: true },
  }[kind];
}
function beep(good) {
  if (!S.sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = good ? 880 : 220; g.gain.value = 0.08; o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + (good ? 0.12 : 0.35));
  } catch { /* no audio */ }
}
function show(kind, fam) {
  const r = resultFor(kind, fam);
  let n = r.people;
  const el = $('#result');
  el.className = `fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-8 text-white ${r.bg}`;
  el.innerHTML = `
    <div class="w-24 h-24 rounded-full bg-white/20 grid place-items-center rise"><i data-lucide="${r.icon}" class="w-14 h-14" stroke-width="2.5"></i></div>
    <p class="font-display text-[2.6rem] leading-tight mt-5">${t(...r.head)}</p>
    <p class="text-xl font-semibold mt-2">${t(...r.who)}</p>
    <p class="text-lg mt-1 opacity-90">${t(...r.detail)}</p>
    ${n ? `<div class="mt-5 flex items-center gap-4 rounded-2xl bg-black/15 px-4 py-2.5">
      <span class="text-[15px]">${t('Coming in now', 'এখন ঢুকছেন')}</span>
      <button type="button" data-step="-1" class="w-11 h-11 rounded-full bg-white/20 text-2xl grid place-items-center" aria-label="${L('Fewer', 'কম')}">−</button>
      <span class="font-display text-3xl w-8 num" id="r-n"></span>
      <button type="button" data-step="1" class="w-11 h-11 rounded-full bg-white/20 text-2xl grid place-items-center" aria-label="${L('More', 'বেশি')}">+</button></div>
      <p class="text-[14px] mt-2 opacity-85" id="r-c"></p>` : ''}
    ${r.note ? `<p class="mt-4 text-[15px] rounded-xl bg-black/15 px-4 py-3 max-w-sm">${t(...r.note)}</p>` : ''}
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      ${r.ask ? `<button class="btn h-14 px-6 bg-white/25 hover:bg-white/35 text-[17px] text-inherit" data-allow>${r.ask === 'once' ? t('Let in once', 'একবার ঢুকতে দিন') : t('Let back in', 'আবার ঢুকতে দিন')}</button>` : ''}
      <button class="btn h-14 px-8 bg-white/20 hover:bg-white/30 text-[17px] text-inherit" data-next>${r.ask ? t('Don’t allow', 'ঢুকতে দেবেন না') : r.people ? t('Done · next scan', 'হয়েছে · পরের স্ক্যান') : t('Next scan', 'পরের স্ক্যান')}</button>
    </div>`;
  const paintN = () => { const c = $('#r-n', el); if (!c) return; c.textContent = L(n, bnD(n)); $('#r-c', el).innerHTML = t(`Give ${n} breakfast coupon${n === 1 ? '' : 's'}`, `${bnD(n)}টি জলখাবারের কুপন দিন`); };
  paintN(); applyLang(el); refreshIcons();
  if (navigator.vibrate) navigator.vibrate(r.deny ? [80, 60, 80] : 60);
  beep(!r.deny && !r.ask);
  clearTimeout(timer);
  const commit = (count, label, tone) => {
    S.inside += count; S.coupons += count; if (r.deny || label === 'denied') S.denied++; S.queued++;
    S.log.unshift({ who: r.who, n: count, label: label === 'denied' ? ['turned away', 'ফেরানো'] : label === 'seen' ? ['re-entry', 'আবার'] : ['', ''], tone, at: nowAt() });
    if (fam) S.seen.add(fam.no);
    paintHead(); paintRecent();
  };
  let done = false;
  const finish = (allow) => {
    if (done) return; done = true; hide();
    if (r.people) commit(n, 'in', 'bg-tulsi');
    else if (allow) commit(r.ask === 'once' ? 1 : 0, 'seen', 'bg-marigold');
    else commit(0, 'denied', r.deny ? 'bg-sindoor' : 'bg-marigold');
  };
  el.onclick = (e) => {
    const st = e.target.closest('[data-step]');
    if (st) { clearTimeout(timer); n = Math.max(1, Math.min(12, n + Number(st.dataset.step))); paintN(); return; }
    if (e.target.closest('[data-allow]')) finish(true);
    else if (e.target.closest('[data-next]')) finish(false);
  };
  if (r.people) timer = setTimeout(() => finish(false), 4500);
}
function hide() { $('#result').className = 'fixed inset-0 z-50 hidden'; }

/* ---------- Bottom sheet ---------- */
function sheet(html, wire) {
  const s = $('#sheet');
  $('#sheet-body').innerHTML = `<div class="w-10 h-1.5 rounded-full bg-white/20 mx-auto mb-4"></div>${html}`;
  s.classList.remove('hidden'); applyLang(s); refreshIcons();
  wire?.($('#sheet-body'));
  $('#sheet-body').querySelector('button, input')?.focus();
}
const closeSheet = () => $('#sheet').classList.add('hidden');
$('#sheet').addEventListener('click', (e) => { if (e.target.closest('[data-sheet-close]')) closeSheet(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeSheet(); hide(); } });

function manualSheet() {
  let digits = '';
  sheet(`
    <h2 class="font-display text-2xl">${t('Family number', 'পরিবার নম্বর')}</h2>
    <p class="text-[14px] text-paper/60">${t('It is printed on the member card, under the name.', 'সদস্য কার্ডে নামের নিচে ছাপা থাকে।')}</p>
    <p class="mt-4 rounded-xl bg-night px-4 h-16 flex items-center font-display text-3xl tracking-wider"><span class="text-paper/50">MC-</span><span id="kp-v" class="num"></span><span class="w-0.5 h-8 bg-marigold ml-0.5 animate-pulse"></span></p>
    <p id="kp-hint" class="text-[14px] text-paper/60 mt-2 min-h-5"></p>
    <div class="grid grid-cols-3 gap-2 mt-3">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'go'].map((k) => `<button type="button" data-k="${k}" class="h-14 rounded-xl text-2xl font-semibold ${k === 'go' ? 'bg-marigold text-ink text-lg' : 'bg-white/10 hover:bg-white/15'}">${k === 'del' ? '<i data-lucide="delete" class="w-6 h-6 mx-auto"></i>' : k === 'go' ? L('Check', 'দেখুন') : L(k, bnD(k))}</button>`).join('')}</div>
    <button type="button" data-sheet-close class="btn w-full h-12 mt-3 bg-transparent text-paper/80">${t('Cancel', 'বাতিল')}</button>`, (b) => {
    const upd = () => {
      $('#kp-v', b).textContent = L(digits, bnD(digits));
      const f = digits.length === 4 && famOf(`MC-${digits}`);
      $('#kp-hint', b).innerHTML = digits.length < 4 ? '' : f ? `${L(f.head, f.headBn)} · ${L(`${f.size} people`, `${bnD(f.size)} জন`)}` : L('No family with this number', 'এই নম্বরে কোনো পরিবার নেই');
    };
    b.addEventListener('click', (e) => {
      const k = e.target.closest('[data-k]')?.dataset.k; if (!k) return;
      if (k === 'del') digits = digits.slice(0, -1);
      else if (k === 'go') {
        if (!digits) return;
        const f = famOf(`MC-${digits.padStart(4, '0')}`);
        closeSheet();
        show(!f ? 'bad' : S.seen.has(f.no) ? 'used' : f.status === 'lapsed' ? 'lapsed' : f.status === 'due' ? 'dues' : 'ok', f);
        return;
      } else if (digits.length < 4) digits += k;
      upd();
    });
    upd();
  });
}
function eventSheet() {
  sheet(`
    <h2 class="font-display text-2xl">${t('Event and gate', 'অনুষ্ঠান ও গেট')}</h2>
    <p class="text-[13px] font-semibold tracking-wide text-paper/50 mt-4 mb-2">${t('EVENT', 'অনুষ্ঠান')}</p>
    <div class="space-y-2">${passEvents.map((e) => `<button type="button" data-evt="${e.id}" aria-pressed="${S.evt.id === e.id}" class="w-full text-left rounded-xl bg-white/5 px-4 py-3 border border-white/10 aria-pressed:border-marigold aria-pressed:bg-marigold/10">
      <span class="block font-semibold">${t(e.title, e.titleBn)}</span><span class="block text-[13px] text-paper/60">${L(`${e.day} ${e.mon}`, `${bnD(e.day)} ${e.monBn}`)} · ${L(e.place, e.placeBn)}</span></button>`).join('')}</div>
    <p class="text-[13px] font-semibold tracking-wide text-paper/50 mt-5 mb-2">${t('GATE', 'গেট')}</p>
    <div class="grid gap-2">${GATES.map((g, i) => `<button type="button" data-gate="${i}" aria-pressed="${S.gate === i}" class="h-12 rounded-xl bg-white/5 border border-white/10 font-semibold aria-pressed:border-marigold aria-pressed:bg-marigold/10">${t(...g)}</button>`).join('')}</div>
    <p class="text-[13px] text-paper/60 mt-4">${t('Passes for each event are downloaded when you pick it, so the gate keeps working without signal.', 'অনুষ্ঠান বাছলে পাসগুলো ফোনে নেমে যায়, তাই সিগন্যাল ছাড়াও গেট চলে।')}</p>
    <button type="button" data-sheet-close class="btn w-full h-12 mt-4 bg-marigold text-ink">${t('Done', 'হয়েছে')}</button>`, (b) => {
    b.addEventListener('click', (e) => {
      const ev = e.target.closest('[data-evt]'), g = e.target.closest('[data-gate]');
      if (ev) { S.evt = passEvents.find((x) => x.id === ev.dataset.evt); $$('[data-evt]', b).forEach((x) => x.setAttribute('aria-pressed', String(x === ev))); }
      if (g) { S.gate = Number(g.dataset.gate); $$('[data-gate]', b).forEach((x) => x.setAttribute('aria-pressed', String(x === g))); }
      if (ev || g) paintHead();
    });
  });
}
function syncSheet() {
  sheet(`
    <h2 class="font-display text-2xl">${S.online ? t('Online', 'অনলাইন') : t('Working offline', 'অফলাইনে চলছে')}</h2>
    <ul class="mt-3 space-y-2.5 text-[15px]">
      <li class="flex gap-2.5"><i data-lucide="check" class="w-5 h-5 text-marigold shrink-0"></i>${t('All 286 passes and cancelled cards are on this phone', 'সব ২৮৬টি পাস ও বাতিল কার্ডের তালিকা ফোনে আছে')}</li>
      <li class="flex gap-2.5"><i data-lucide="cloud-upload" class="w-5 h-5 text-marigold shrink-0"></i>${S.queued ? t(`${S.queued} scans will upload when there is signal`, `সিগন্যাল এলে ${bnD(S.queued)}টি স্ক্যান আপলোড হবে`) : t('Nothing waiting to upload', 'আপলোডের অপেক্ষায় কিছু নেই')}</li>
      <li class="flex gap-2.5"><i data-lucide="users" class="w-5 h-5 text-marigold shrink-0"></i>${t('Gate 2 scans appear here after both phones sync', 'দুটি ফোন সিঙ্ক হলে গেট ২-এর স্ক্যান এখানে দেখা যাবে')}</li>
    </ul>
    <p id="sync-msg" class="text-[14px] text-paper/70 mt-4 min-h-5" role="status"></p>
    <button type="button" id="sync-now" class="btn w-full h-12 mt-2 bg-marigold text-ink"><i data-lucide="refresh-cw"></i>${t('Sync now', 'এখনই সিঙ্ক')}</button>
    <button type="button" data-sheet-close class="btn w-full h-12 mt-2 bg-transparent text-paper/80">${t('Close', 'বন্ধ')}</button>`, (b) => {
    $('#sync-now', b).addEventListener('click', (e) => {
      const btn = e.currentTarget; btn.disabled = true;
      $('#sync-msg', b).innerHTML = t('Looking for signal…', 'সিগন্যাল খোঁজা হচ্ছে…'); applyLang(b);
      setTimeout(() => {
        const n = S.queued; S.queued = 0; S.online = true; S.inside += 37;
        $('#sync-msg', b).innerHTML = t(`Uploaded ${n} scans. Gate 2 added 37 people.`, `${bnD(n)}টি স্ক্যান আপলোড হয়েছে। গেট ২ থেকে ৩৭ জন যোগ হয়েছে।`); applyLang(b);
        btn.disabled = false; paintHead();
      }, 1100);
    });
  });
}
function endSheet() {
  const inNow = S.log.reduce((a, r) => a + r.n, 0);
  const away = S.log.filter((r) => r.label[0] === 'turned away').length;
  sheet(`
    <h2 class="font-display text-2xl">${t('End your shift', 'শিফট শেষ')}</h2>
    <p class="text-[14px] text-paper/60">${t(...GATES[S.gate])} · ${t(S.evt.title, S.evt.titleBn)}</p>
    <div class="grid grid-cols-3 gap-2 mt-4 text-center">
      <div class="rounded-xl bg-night p-3"><p class="font-display text-2xl num">${L(S.log.length, bnD(S.log.length))}</p><p class="text-[12.5px] text-paper/60">${t('scans', 'স্ক্যান')}</p></div>
      <div class="rounded-xl bg-night p-3"><p class="font-display text-2xl num">${L(inNow, bnD(inNow))}</p><p class="text-[12.5px] text-paper/60">${t('let in', 'ঢুকেছেন')}</p></div>
      <div class="rounded-xl bg-night p-3"><p class="font-display text-2xl num">${L(away, bnD(away))}</p><p class="text-[12.5px] text-paper/60">${t('turned away', 'ফেরানো')}</p></div>
    </div>
    <label class="block mt-4"><span class="block text-[14px] text-paper/70 mb-1.5">${t('Hand the gate to', 'গেট কাকে দিচ্ছেন')}</span>
      <select class="w-full h-12 rounded-xl bg-night border border-white/15 px-3 text-paper"><option>${L('Sanjay Nandi', 'সঞ্জয় নন্দী')}</option><option>${L('Manas Kundu', 'মানস কুণ্ডু')}</option><option>${L('Nobody: close this gate', 'কেউ না: গেট বন্ধ')}</option></select></label>
    <label class="flex items-center gap-3 mt-3 text-[15px]"><input type="checkbox" checked class="w-5 h-5 accent-[#f2a516]" />${t(`Unused coupons handed to the desk`, 'বাকি কুপন টেবিলে জমা দিয়েছি')}</label>
    ${S.queued ? `<p class="mt-3 rounded-xl bg-marigold/15 text-marigold px-3.5 py-2.5 text-[14px]">${t(`${S.queued} scans are still on this phone. They upload by themselves when there is signal, even after you sign out.`, `${bnD(S.queued)}টি স্ক্যান এখনও ফোনে। সাইন আউটের পরেও সিগন্যাল এলে নিজে আপলোড হবে।`)}</p>` : ''}
    <a href="admin-login.html" class="btn w-full h-12 mt-4 bg-marigold text-ink"><i data-lucide="log-out"></i>${t('End shift and sign out', 'শিফট শেষ, সাইন আউট')}</a>
    <button type="button" data-sheet-close class="btn w-full h-12 mt-2 bg-transparent text-paper/80">${t('Keep scanning', 'স্ক্যান চালিয়ে যান')}</button>`);
}

/* ---------- Wire up ---------- */
$$('[data-sim]').forEach((b) => b.addEventListener('click', () => show(b.dataset.sim)));
$('#manual').addEventListener('click', manualSheet);
$('#evt-btn').addEventListener('click', eventSheet);
$('#sync-btn').addEventListener('click', syncSheet);
$('#end-shift').addEventListener('click', endSheet);
$('#torch').addEventListener('click', (e) => { S.torch = !S.torch; e.currentTarget.setAttribute('aria-pressed', String(S.torch)); $('#viewfinder').classList.toggle('torch', S.torch); });
$('#sound').addEventListener('click', (e) => {
  S.sound = !S.sound; const b = e.currentTarget; b.setAttribute('aria-pressed', String(S.sound));
  b.innerHTML = `<i data-lucide="${S.sound ? 'volume-2' : 'volume-x'}" class="w-5 h-5"></i>`; refreshIcons();
});
$('#undo').addEventListener('click', () => {
  const r = S.log.shift(); if (!r) return;
  S.inside -= r.n; S.coupons -= r.n; S.queued = Math.max(0, S.queued - 1);
  paintHead(); paintRecent();
});
document.addEventListener('langchange', () => { paintHead(); paintRecent(); });

boot('scan', { dark: true });
paintHead(); paintRecent();
