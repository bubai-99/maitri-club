import { boot, t, dn, applyLang, refreshIcons } from './shared.js';

const $ = (s) => document.querySelector(s);
let inside = 412, coupons = 388, timer;

const RESULTS = {
  ok: {
    bg: 'bg-tulsi', icon: 'check', head: ['Let them in', 'ঢুকতে দিন'],
    who: ['Mukherjee family · MC-0104', 'মুখার্জি পরিবার · MC-0104'],
    detail: ['3 people · give 3 breakfast coupons', '৩ জন · ৩টি জলখাবারের কুপন দিন'], add: 3,
  },
  dues: {
    bg: 'bg-tulsi', icon: 'check', head: ['Let them in', 'ঢুকতে দিন'],
    who: ['Rajib Banerjee · MC-0113', 'রাজীব ব্যানার্জি · MC-0113'],
    detail: ['4 people · give 4 coupons', '৪ জন · ৪টি কুপন দিন'], add: 4,
    note: ['₹500 subscription pending. Mention it politely; don’t stop entry.', '₹৫০০ চাঁদা বাকি। ভদ্রভাবে মনে করিয়ে দিন, আটকাবেন না।'],
  },
  used: {
    bg: 'bg-marigold !text-ink', icon: 'history', head: ['Already inside', 'আগেই ঢুকেছেন'],
    who: ['Sen family · MC-0116', 'সেন পরিবার · MC-0116'],
    detail: ['Entered 7:41 am at Gate 1, scanned by Bapi', 'সকাল ৭:৪১-এ গেট ১ দিয়ে, বাপি স্ক্যান করেছে'], add: 0,
    note: ['If someone stepped out and came back, it is fine to let them in.', 'কেউ বাইরে গিয়ে ফিরলে ঢুকতে দিন।'],
  },
  bad: {
    bg: 'bg-sindoor', icon: 'x', head: ['Pass not found', 'পাস পাওয়া যায়নি'],
    who: ['This QR is not a Maitri Club pass', 'এটি মৈত্রী ক্লাবের পাস নয়'],
    detail: ['Ask for the member card, or type the family number', 'সদস্য কার্ড চান, বা পরিবার নম্বর লিখুন'], add: 0,
  },
};

function show(kind) {
  const r = RESULTS[kind];
  const el = $('#result');
  el.className = `fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-8 text-white ${r.bg}`;
  el.innerHTML = `
    <div class="w-28 h-28 rounded-full bg-white/20 grid place-items-center rise"><i data-lucide="${r.icon}" class="w-16 h-16" stroke-width="2.5"></i></div>
    <p class="font-display text-[2.8rem] leading-tight mt-6">${t(...r.head)}</p>
    <p class="text-xl font-semibold mt-2">${t(...r.who)}</p>
    <p class="text-lg mt-1 opacity-90">${t(...r.detail)}</p>
    ${r.note ? `<p class="mt-5 text-[15px] rounded-xl bg-black/15 px-4 py-3 max-w-sm">${t(...r.note)}</p>` : ''}
    <button class="btn h-14 px-8 mt-10 bg-white/20 hover:bg-white/30 text-[17px] text-inherit" data-next>${t('Next scan', 'পরের স্ক্যান')}</button>`;
  applyLang(el);
  refreshIcons();
  if (navigator.vibrate) navigator.vibrate(kind === 'bad' ? [80, 60, 80] : 60);
  inside += r.add; coupons += r.add;
  $('#inside').dataset.n = inside; $('#coupons').dataset.n = coupons;
  applyLang($('#inside').parentElement); applyLang($('#coupons').parentElement);
  clearTimeout(timer);
  if (kind === 'ok' || kind === 'dues') timer = setTimeout(hide, 3200);
}
function hide() { $('#result').className = 'fixed inset-0 z-50 hidden'; }

$('#result').addEventListener('click', (e) => { if (e.target.closest('[data-next]')) hide(); });
document.querySelectorAll('[data-sim]').forEach((b) => b.addEventListener('click', () => show(b.dataset.sim)));
$('#manual').addEventListener('click', () => show('ok'));

boot('scan', { dark: true });
