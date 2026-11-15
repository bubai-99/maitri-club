// Small UI helpers for the public website: form validation, confirmation panel, share, dates.
import { t, seal, applyLang, refreshIcons, toast, lang } from './shared.js';

/* ---------- Dates ---------- */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_BN = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
export const bnNum = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
export const isoParts = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d, mon: MON[m - 1], monBn: MON_BN[m - 1] };
};
/** "Sunday, 13 December 2026" in either language (browser Intl gives Bengali digits for bn-IN). */
export const longDate = (iso, withDay = true) => {
  const dt = new Date(`${iso}T12:00:00+05:30`);
  const o = { day: 'numeric', month: 'long', year: 'numeric', ...(withDay ? { weekday: 'long' } : {}) };
  return t(dt.toLocaleDateString('en-IN', o), dt.toLocaleDateString('bn-IN', o));
};
export const shortDate = (iso) => {
  const p = isoParts(iso);
  return t(`${p.d} ${p.mon} ${p.y}`, `${bnNum(p.d)} ${p.monBn} ${bnNum(p.y)}`);
};
/** Whole days from today to an ISO date (negative once past). */
export const daysUntil = (iso) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(`${iso}T00:00:00`);
  return Math.round((d - today) / 86400000);
};
export const daysLabel = (n) => {
  if (n === 0) return t('Today', 'আজ');
  if (n === 1) return t('Tomorrow', 'আগামীকাল');
  if (n < 0) return t('This has ended', 'শেষ হয়ে গেছে');
  return t(`In ${n} days`, `আর ${bnNum(n)} দিন`);
};

/* ---------- Reference numbers for prototype confirmations ---------- */
export const ref = (prefix) => `${prefix}-${String(Math.floor(1000 + Math.random() * 9000))}`;

/* ---------- Form validation (bilingual, inline) ---------- */
const phoneOk = (v) => {
  const d = v.replace(/\D/g, '');
  return d.length === 10 || (d.length === 12 && d.startsWith('91'));
};
function messageFor(el) {
  const v = el.validity;
  if (el.dataset.phone !== undefined && el.value.trim() && !phoneOk(el.value)) return t('Enter a 10-digit mobile number.', '১০ সংখ্যার মোবাইল নম্বর দিন।');
  if (v.valueMissing) {
    if (el.type === 'checkbox') return t('Please tick this box to continue.', 'এগিয়ে যেতে এই ঘরে টিক দিন।');
    if (el.tagName === 'SELECT') return t('Please choose one.', 'একটি বেছে নিন।');
    return t('Please fill this in.', 'এটি পূরণ করুন।');
  }
  if (v.typeMismatch) return t('Check the email address.', 'ইমেল ঠিকানাটি দেখুন।');
  if (v.patternMismatch) return el.dataset.errEn ? t(el.dataset.errEn, el.dataset.errBn) : t('Check this entry.', 'এটি আবার দেখুন।');
  if (v.rangeUnderflow || v.rangeOverflow) {
    const lo = el.min, hi = el.max;
    if (lo && hi) return t(`Enter a number from ${lo} to ${hi}.`, `${bnNum(lo)} থেকে ${bnNum(hi)}-এর মধ্যে সংখ্যা দিন।`);
    return t(`Enter at least ${lo}.`, `অন্তত ${bnNum(lo)} দিন।`);
  }
  if (v.badInput || v.stepMismatch) return t('Enter a whole number.', 'একটি পূর্ণ সংখ্যা দিন।');
  return '';
}
const isBad = (el) => !el.checkValidity() || (el.dataset.phone !== undefined && el.value.trim() !== '' && !phoneOk(el.value));
let errSeq = 0;
function clearError(el) {
  el.removeAttribute('aria-invalid');
  const id = el.dataset.errId;
  if (id) { document.getElementById(id)?.remove(); delete el.dataset.errId; el.removeAttribute('aria-describedby'); }
}
function showError(el) {
  clearError(el);
  const id = `ferr-${++errSeq}`;
  const p = document.createElement('p');
  p.className = 'field-error'; p.id = id;
  p.innerHTML = `<i data-lucide="circle-alert"></i><span>${messageFor(el)}</span>`;
  const anchor = el.closest('label') || el.parentElement;
  anchor.after(p);
  el.setAttribute('aria-invalid', 'true');
  el.setAttribute('aria-describedby', id);
  el.dataset.errId = id;
  applyLang(p);
}
/** Validate a form; shows inline bilingual errors and focuses the first problem. */
export function validate(form) {
  const els = [...form.querySelectorAll('input, select, textarea')].filter((el) => el.willValidate && el.type !== 'radio');
  els.forEach(clearError);
  const bad = els.filter(isBad);
  bad.forEach(showError);
  refreshIcons();
  if (bad.length) {
    bad[0].focus();
    bad[0].scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  return bad.length === 0;
}
/** Turn off native bubbles and clear an error as soon as the field is fixed. */
export function enhanceForm(form) {
  form.noValidate = true;
  form.addEventListener('input', (e) => { const el = e.target; if (el.getAttribute?.('aria-invalid') === 'true' && !isBad(el)) clearError(el); });
  form.addEventListener('change', (e) => { const el = e.target; if (el.getAttribute?.('aria-invalid') === 'true' && !isBad(el)) clearError(el); });
}

/* ---------- Confirmation panel (prototype: nothing is sent) ---------- */
export function confirmPanel(form, titleEn, titleBn, steps, resetLabel, { refNo = '', onReset } = {}) {
  const kids = [...form.children];
  kids.forEach((k) => (k.style.display = 'none'));
  form.insertAdjacentHTML('beforeend', `<div data-panel class="sm:col-span-2 lg:col-span-full col-span-full relative card p-6 sm:p-8 rise" role="status" tabindex="-1">
    <div class="absolute right-4 top-4 ink-stamp" aria-hidden="true">${seal({ size: 96, rotate: -10, className: 'stamp-in' })}</div>
    <h3 class="font-display leading-tight text-[1.85rem] pr-24">${t(titleEn, titleBn)}</h3>
    ${refNo ? `<p class="mt-2 text-[15px] text-ink-2">${t('Reference', 'সূত্র নম্বর')}: <strong class="num text-ink tracking-wide">${refNo}</strong></p>` : ''}
    <ol class="mt-5 space-y-3 text-[16px] max-w-[52ch]">${steps.map(([en, bn], i) => `<li class="flex gap-3"><span class="w-7 h-7 rounded-full ${i ? 'border border-ink/40' : 'bg-ink text-white'} grid place-items-center shrink-0 font-semibold num">${i ? (lang === 'bn' ? bnNum(i + 1) : i + 1) : '<i data-lucide="check" class="w-4 h-4"></i>'}</span><span>${t(en, bn)}</span></li>`).join('')}</ol>
    <p class="mt-5 text-[13px] text-ink-3">${t('Prototype: nothing was sent.', 'প্রোটোটাইপ: কিছু পাঠানো হয়নি।')}</p>
    <button type="button" class="btn btn-line mt-5" data-again>${t(...resetLabel)}</button></div>`);
  const panel = form.querySelector('[data-panel]');
  applyLang(panel); refreshIcons();
  panel.focus({ preventScroll: true });
  panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  panel.querySelector('[data-again]').addEventListener('click', () => { panel.remove(); kids.forEach((k) => (k.style.display = '')); onReset?.(); form.querySelector('input, select, textarea')?.focus(); });
}

/* ---------- Share a page of the site ---------- */
export async function share(titleText, hash) {
  const url = `${location.origin}${location.pathname}${hash}`;
  try {
    if (navigator.share) { await navigator.share({ title: titleText, url }); return; }
    await navigator.clipboard.writeText(url);
    toast(`<i data-lucide="copy"></i>${t('Link copied', 'লিঙ্ক কপি হয়েছে')}`);
  } catch (err) {
    if (err?.name !== 'AbortError') toast(`<i data-lucide="info"></i>${t('Copy this link', 'এই লিঙ্কটি কপি করুন')}: ${url}`);
  }
}

export const initials = (c) => (lang === 'bn' ? c.nameBn[0] : c.name.split(' ').map((w) => w[0]).join('').slice(0, 2));
