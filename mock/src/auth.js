import { boot, t, seal, router, applyLang, refreshIcons, toast, lang } from './shared.js';
import { photo } from './photos.js';
document.querySelectorAll('[data-auth-photo]').forEach((el) => { el.innerHTML = photo(el.dataset.authPhoto, { cls: 'w-full h-full object-cover', sizes: '45vw' }); });

/*
  Auth flows for both portals. One renderer, two configs:
  - member  (login.html):        password or OTP sign-in, activate existing family, apply to join, forgot/reset.
  - committee (admin-login.html): password + OTP second step, forgot/reset, accept invite, locked.
  Prototype rules: any valid input passes. OTP 000000 and password "wrongpass" show the error states.
*/

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const portal = document.body.dataset.portal; // 'member' | 'committee'
const isCommittee = portal === 'committee';
const state = { phone: '98300 12345', purpose: 'login', attempts: 0, method: 'password', regStep: 1 };

/* ---------- side panel ---------- */
$('#auth-seal').innerHTML = seal({ size: 112, color: '#fff', rotate: -8, className: 'stamp-in' });
$('#auth-seal-sm').innerHTML = seal({ size: 40, rotate: -6 });

/* ---------- building blocks ---------- */
const head = (en, bn, subEn = '', subBn = '') => `
  <h1 class="font-display text-[2.3rem] leading-tight">${t(en, bn)}</h1>
  ${subEn ? `<p class="mt-2 text-[15px] text-ink-2">${t(subEn, subBn)}</p>` : ''}`;

const back = (href, en = 'Back', bn = 'ফিরে যান') =>
  `<a href="${href}" class="inline-flex items-center gap-1 text-sm font-semibold text-ink-2 hover:text-ink -ml-1 mb-6"><i data-lucide="chevron-left" class="w-4 h-4"></i>${t(en, bn)}</a>`;

const err = (id) => `<p class="hidden mt-1.5 text-sm font-medium text-sindoor-deep flex-wrap items-center gap-1.5" id="${id}" role="alert"></p>`;
const showErr = (id, en, bn) => {
  const el = $('#' + id);
  el.innerHTML = `<i data-lucide="circle-alert" class="w-4 h-4 shrink-0"></i>${t(en, bn)}`;
  el.classList.remove('hidden'); el.classList.add('flex');
  applyLang(el); refreshIcons();
};
const clearErr = (id) => { const el = $('#' + id); if (el) { el.classList.add('hidden'); el.classList.remove('flex'); } };

const phoneField = (id = 'phone', label = ['Mobile number', 'মোবাইল নম্বর']) => `
  <label class="block" for="${id}"><span class="label">${t(...label)}</span></label>
  <div class="flex">
    <span class="inline-flex items-center px-3 rounded-l-[4px] border border-r-0 border-rule bg-paper-2 text-ink-2 text-[15px] num">+91</span>
    <input id="${id}" class="field rounded-l-none num" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="11" placeholder="98300 12345" aria-describedby="${id}-err" />
  </div>${err(id + '-err')}`;

const passField = (id, label, { autocomplete = 'current-password', meter = false } = {}) => `
  <label class="block" for="${id}"><span class="label">${t(...label)}</span></label>
  <div class="relative">
    <input id="${id}" class="field pr-12" type="password" autocomplete="${autocomplete}" aria-describedby="${id}-err" />
    <button type="button" data-peek="${id}" class="absolute right-1 top-1 w-9 h-9 grid place-items-center rounded text-ink-2 hover:bg-paper-2" aria-label="Show password"><i data-lucide="eye" class="w-[18px] h-[18px]"></i></button>
  </div>
  ${meter ? `<div class="mt-2 flex gap-1" aria-hidden="true">${'<span class="h-1.5 flex-1 rounded-full bg-paper-3" data-bar></span>'.repeat(4)}</div><p class="mt-1 text-[13px] text-ink-2" id="${id}-hint">${t('At least 8 characters. A phrase is easier to remember.', 'অন্তত ৮টি অক্ষর। একটা ছোট বাক্য মনে রাখা সহজ।')}</p>` : ''}
  ${err(id + '-err')}`;

const otpField = () => `
  <fieldset>
    <legend class="label">${t('6-digit code', '৬ সংখ্যার কোড')}</legend>
    <div class="flex gap-2" id="otp">
      ${Array.from({ length: 6 }, (_, i) => `<input class="w-12 h-14 sm:w-14 text-center text-2xl font-semibold num rounded-[4px] border-2 border-rule bg-card focus:border-ink focus:outline-none" inputmode="numeric" maxlength="1" ${i === 0 ? 'autocomplete="one-time-code"' : 'autocomplete="off"'} aria-label="Digit ${i + 1}" />`).join('')}
    </div>
    ${err('otp-err')}
  </fieldset>`;

const primary = (en, bn, id = 'go') => `<button id="${id}" class="btn btn-primary w-full h-12 text-base">${t(en, bn)}</button>`;

const digits = (v) => v.replace(/\D/g, '');
const validPhone = (v) => /^[6-9]\d{9}$/.test(digits(v));
const fmtPhone = (v) => { const d = digits(v); return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5, 10)}` : d; };

/* ---------- screens ---------- */
const S = {};

S.login = () => isCommittee ? `
  ${head('Committee sign-in', 'কমিটি লগইন', 'For office bearers and in-charges. Members use the member app.', 'পদাধিকারী ও দায়িত্বপ্রাপ্তদের জন্য। সদস্যরা সদস্য অ্যাপ ব্যবহার করুন।')}
  <form class="mt-8 space-y-5" id="f" novalidate>
    <div>${phoneField('phone', ['Registered mobile', 'নথিভুক্ত মোবাইল'])}</div>
    <div>${passField('pass', ['Password', 'পাসওয়ার্ড'])}</div>
    <div class="flex items-center justify-between gap-3 text-[15px]">
      <label class="flex items-center gap-2"><input type="checkbox" class="w-5 h-5 accent-[#2b2f36]" checked />${t('Keep me signed in', 'লগইন রাখুন')}</label>
      <a href="#forgot" class="font-semibold text-sindoor hover:underline">${t('Forgot password?', 'পাসওয়ার্ড ভুলে গেছেন?')}</a>
    </div>
    ${primary('Continue', 'এগিয়ে যান')}
  </form>
  <p class="mt-8 text-[15px] text-ink-2">${t('Got an invite from the secretary?', 'সম্পাদকের আমন্ত্রণ পেয়েছেন?')} <a href="#invite" class="font-semibold text-sindoor hover:underline">${t('Accept it here', 'এখানে গ্রহণ করুন')}</a></p>
  <p class="mt-2 text-[15px] text-ink-2"><a href="login.html" class="font-semibold text-ink hover:underline">${t('Member sign-in', 'সদস্য লগইন')}</a></p>`
: `
  ${head('Sign in', 'লগইন', 'Members of Maitri Club, Netaji Para.', 'মৈত্রী ক্লাব, নেতাজি পাড়ার সদস্যরা।')}
  <div class="mt-8 grid grid-cols-2 p-1 rounded-[7px] bg-paper-2" role="tablist" aria-label="Sign-in method">
    <button role="tab" data-method="password" aria-selected="${state.method === 'password'}" class="h-10 rounded-[5px] text-[15px] font-semibold text-ink-2 aria-selected:bg-white aria-selected:text-ink aria-selected:shadow-[0_1px_2px_rgba(0,0,0,.12)]">${t('Password', 'পাসওয়ার্ড')}</button>
    <button role="tab" data-method="otp" aria-selected="${state.method === 'otp'}" class="h-10 rounded-[5px] text-[15px] font-semibold text-ink-2 aria-selected:bg-white aria-selected:text-ink aria-selected:shadow-[0_1px_2px_rgba(0,0,0,.12)]">${t('One-time code', 'ওটিপি')}</button>
  </div>
  <form class="mt-6 space-y-5" id="f" novalidate>
    <div>${phoneField()}</div>
    ${state.method === 'password' ? `<div>${passField('pass', ['Password', 'পাসওয়ার্ড'])}</div>
    <div class="text-right -mt-2"><a href="#forgot" class="text-[15px] font-semibold text-sindoor hover:underline">${t('Forgot password?', 'পাসওয়ার্ড ভুলে গেছেন?')}</a></div>`
    : `<p class="text-[15px] text-ink-2">${t('We’ll text a 6-digit code to this number. No password needed.', 'এই নম্বরে ৬ সংখ্যার কোড পাঠাব। পাসওয়ার্ড লাগবে না।')}</p>`}
    ${primary(state.method === 'password' ? 'Sign in' : 'Send code', state.method === 'password' ? 'লগইন' : 'কোড পাঠান')}
  </form>
  <div class="mt-8 pt-6 border-t-2 border-dotted border-sindoor/60 space-y-2 text-[15px]">
    <p class="text-ink-2">${t('Member, but first time here?', 'সদস্য, কিন্তু প্রথমবার?')} <a href="#activate" class="font-semibold text-sindoor hover:underline">${t('Activate your account', 'অ্যাকাউন্ট চালু করুন')}</a></p>
    <p class="text-ink-2">${t('Not a member yet?', 'এখনও সদস্য নন?')} <a href="#register" class="font-semibold text-sindoor hover:underline">${t('Apply to join', 'সদস্য হতে আবেদন')}</a></p>
    <p class="text-ink-2">${t('On the committee?', 'কমিটিতে আছেন?')} <a href="admin-login.html" class="font-semibold text-ink hover:underline">${t('Committee sign-in', 'কমিটি লগইন')}</a></p>
  </div>`;

S.otp = () => `
  ${back(state.purpose === 'reset' ? '#forgot' : state.purpose === 'register' ? '#register' : state.purpose === 'activate' ? '#activate' : '#login', 'Change number', 'নম্বর বদলান')}
  ${head(isCommittee && state.purpose === 'login' ? 'Second step' : 'Check your messages', isCommittee && state.purpose === 'login' ? 'দ্বিতীয় ধাপ' : 'মেসেজ দেখুন',
    `We sent a 6-digit code to +91 ${state.phone}.`, `+৯১ ${state.phone} নম্বরে ৬ সংখ্যার কোড পাঠানো হয়েছে।`)}
  <form class="mt-8 space-y-5" id="f" novalidate>
    ${otpField()}
    <p class="text-[15px] text-ink-2" id="resend-line"></p>
    ${isCommittee && state.purpose === 'login' ? `<label class="flex items-center gap-2 text-[15px]"><input type="checkbox" class="w-5 h-5 accent-[#2b2f36]" />${t('Trust this device for 30 days', '৩০ দিন এই ডিভাইসে কোড চাইবে না')}</label>` : ''}
    ${primary('Verify', 'যাচাই করুন')}
  </form>
  <p class="mt-6 text-[13px] text-ink-3">${t('Prototype: any 6 digits work. 000000 shows the error state.', 'প্রোটোটাইপ: যেকোনো ৬ সংখ্যা চলবে। 000000 দিলে ভুলের অবস্থা দেখাবে।')}</p>`;

S.forgot = () => `
  ${back('#login', 'Back to sign-in', 'লগইনে ফিরুন')}
  ${head('Reset your password', 'পাসওয়ার্ড নতুন করুন', 'Enter your registered mobile. We’ll text a code to confirm it’s you.', 'নথিভুক্ত মোবাইল নম্বর দিন। আপনি কিনা জানতে কোড পাঠাব।')}
  <form class="mt-8 space-y-5" id="f" novalidate>
    <div>${phoneField()}</div>
    ${primary('Send code', 'কোড পাঠান')}
  </form>
  <p class="mt-8 text-[15px] text-ink-2">${t('Changed your number?', 'নম্বর বদলে গেছে?')} ${isCommittee
    ? t('Ask the secretary to update it in Settings.', 'সম্পাদককে সেটিংসে বদলাতে বলুন।')
    : t('Visit the club room (6–9 pm) with your member card and Tapas-da will update it.', 'সদস্য কার্ড নিয়ে ক্লাব ঘরে আসুন (সন্ধ্যা ৬–৯টা), তাপস-দা বদলে দেবেন।')}</p>`;

S.reset = () => `
  ${head('Choose a new password', 'নতুন পাসওয়ার্ড দিন', `For +91 ${state.phone}.`, `+৯১ ${state.phone} নম্বরের জন্য।`)}
  <form class="mt-8 space-y-5" id="f" novalidate>
    <div>${passField('pass', ['New password', 'নতুন পাসওয়ার্ড'], { autocomplete: 'new-password', meter: true })}</div>
    <div>${passField('pass2', ['Type it again', 'আবার লিখুন'], { autocomplete: 'new-password' })}</div>
    <label class="flex items-start gap-2 text-[15px]"><input type="checkbox" checked class="w-5 h-5 mt-0.5 accent-[#2b2f36]" />${t('Sign me out on other phones', 'অন্য ফোন থেকে লগআউট করুন')}</label>
    ${primary('Save password', 'পাসওয়ার্ড সেভ করুন')}
  </form>`;

S.done = () => `
  <div class="text-center sm:text-left">
    <div class="inline-block ink-stamp">${seal({ size: 120, rotate: -10, className: 'stamp-in' })}</div>
    ${head('Password changed', 'পাসওয়ার্ড বদলানো হয়েছে', 'Use your new password next time you sign in.', 'পরের বার নতুন পাসওয়ার্ড দিয়ে লগইন করুন।')}
    <a href="#login" class="btn btn-primary w-full h-12 text-base mt-8">${t('Sign in', 'লগইন')}</a>
  </div>`;

/* Member: activate an existing family's account */
S.activate = () => `
  ${back('#login')}
  ${head('Activate your account', 'অ্যাকাউন্ট চালু করুন', 'Your family is already on the club register. Link your phone to it once.', 'আপনার পরিবার ক্লাবের খাতায় আছে। একবার ফোন নম্বরটা যুক্ত করুন।')}
  <form class="mt-8 space-y-5" id="f" novalidate>
    <div>
      <label class="block" for="famno"><span class="label">${t('Family number', 'পরিবার নম্বর')}</span></label>
      <input id="famno" class="field num uppercase" placeholder="MC-0104" autocomplete="off" aria-describedby="famno-hint famno-err" />
      <p class="mt-1 text-[13px] text-ink-2" id="famno-hint">${t('On your old paper receipt, or ask Tapas-da.', 'পুরনো কাগজের রসিদে আছে, বা তাপস-দাকে জিজ্ঞেস করুন।')}</p>
      ${err('famno-err')}
    </div>
    <div>${phoneField('phone', ['Mobile number on the register', 'খাতায় থাকা মোবাইল নম্বর'])}</div>
    ${primary('Send code', 'কোড পাঠান')}
  </form>`;

S.setpass = () => `
  ${head('Set a password', 'পাসওয়ার্ড দিন', 'Optional. You can always sign in with a code instead.', 'ইচ্ছে হলে। চাইলে সবসময় কোড দিয়েও লগইন করা যায়।')}
  <div class="mt-6 rounded-lg border-2 border-ink p-4 flex items-center gap-3">
    <span class="w-10 h-10 rounded-full bg-ink text-white grid place-items-center font-display" lang="bn">অ</span>
    <div><p class="font-semibold">${t('Ananya Mukherjee', 'অনন্যা মুখার্জি')}</p><p class="text-sm text-ink-2 num">MC-0104 · ${t('Lane 2 · 3 people', '২ নং গলি · ৩ জন')}</p></div>
    <i data-lucide="badge-check" class="ml-auto w-6 h-6"></i>
  </div>
  <form class="mt-6 space-y-5" id="f" novalidate>
    <div>${passField('pass', ['Password', 'পাসওয়ার্ড'], { autocomplete: 'new-password', meter: true })}</div>
    ${primary('Save and open the app', 'সেভ করে অ্যাপ খুলুন')}
  </form>
  <a href="app.html" class="btn btn-ghost w-full mt-2">${t('Skip, I’ll use codes', 'বাদ দিন, কোড ব্যবহার করব')}</a>`;

/* Member: apply to join (3 steps) */
const stepper = (n) => `
  <ol class="flex items-center gap-2 text-[13px] font-semibold mb-6" aria-label="Progress">
    ${[['Family', 'পরিবার'], ['Members', 'সদস্য'], ['Verify', 'যাচাই']].map(([en, bn], i) => `
      <li class="flex items-center gap-2 ${i + 1 === n ? 'text-ink' : 'text-ink-3'}" ${i + 1 === n ? 'aria-current="step"' : ''}>
        <span class="w-6 h-6 rounded-full grid place-items-center num ${i + 1 < n ? 'bg-ink text-white' : i + 1 === n ? 'border-2 border-ink' : 'border-2 border-rule'}">${i + 1 < n ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : i + 1}</span>${t(en, bn)}
      </li>${i < 2 ? '<span class="flex-1 h-px bg-rule"></span>' : ''}`).join('')}
  </ol>`;

S.register = () => state.regStep === 1 ? `
  ${back('#login')}
  ${stepper(1)}
  ${head('Apply to join', 'সদস্য হতে আবেদন', 'Membership is by family: ₹100 a month, ₹500 admission once.', 'সদস্যপদ পরিবার ভিত্তিক: মাসে ₹১০০, ভর্তি ফি একবার ₹৫০০।')}
  <form class="mt-8 space-y-5" id="f" novalidate>
    <div><label class="block" for="name"><span class="label">${t('Head of family', 'পরিবারের প্রধান')}</span></label><input id="name" class="field" autocomplete="name" aria-describedby="name-err" />${err('name-err')}</div>
    <div>${phoneField()}</div>
    <div><label class="block" for="lane"><span class="label">${t('Lane / area', 'গলি / এলাকা')}</span></label>
      <select id="lane" class="field"><option data-bn="১ নং গলি">Lane 1</option><option data-bn="২ নং গলি">Lane 2</option><option data-bn="৩ নং গলি">Lane 3</option><option data-bn="পুকুর পাড়">Pukur Par</option><option data-bn="স্কুল রোড">School Road</option></select></div>
    <div><label class="block" for="addr"><span class="label">${t('House address', 'বাড়ির ঠিকানা')}</span></label><input id="addr" class="field" autocomplete="street-address" /></div>
    ${primary('Next: family members', 'পরের ধাপ: পরিবারের সদস্য')}
  </form>`
: state.regStep === 2 ? `
  <button type="button" id="reg-back" class="inline-flex items-center gap-1 text-sm font-semibold text-ink-2 hover:text-ink -ml-1 mb-6"><i data-lucide="chevron-left" class="w-4 h-4"></i>${t('Back', 'ফিরে যান')}</button>
  ${stepper(2)}
  ${head('Who lives with you?', 'কারা একসঙ্গে থাকেন?', 'Everyone listed gets entry to club events on your family pass.', 'তালিকার সবাই পরিবারের পাসে অনুষ্ঠানে ঢুকতে পারবেন।')}
  <form class="mt-8 space-y-5" id="f" novalidate>
    <div id="deps" class="space-y-2"></div>
    <button type="button" id="add-dep" class="btn btn-ghost btn-sm -ml-2 text-sindoor"><i data-lucide="plus"></i>${t('Add someone', 'আরও একজন')}</button>
    <fieldset><legend class="label">${t('How will you pay?', 'কীভাবে দেবেন?')}</legend>
      <div class="grid grid-cols-2 gap-2">
        <label class="rounded-[7px] border-2 border-rule p-3 cursor-pointer has-[:checked]:border-ink"><input type="radio" name="plan" class="sr-only" checked /><span class="block font-semibold">₹100 ${t('/ month', '/ মাস')}</span><span class="text-sm text-ink-2">${t('Cash or UPI', 'নগদ বা ইউপিআই')}</span></label>
        <label class="rounded-[7px] border-2 border-rule p-3 cursor-pointer has-[:checked]:border-ink"><input type="radio" name="plan" class="sr-only" /><span class="block font-semibold">₹1,100 ${t('/ year', '/ বছর')}</span><span class="text-sm text-ink-2">${t('One month free', 'এক মাস বিনামূল্যে')}</span></label>
      </div></fieldset>
    ${primary('Next: verify your number', 'পরের ধাপ: নম্বর যাচাই')}
  </form>` : '';

S.pending = () => `
  <div>
    <div class="inline-block ink-stamp">${seal({ size: 120, rotate: -10, className: 'stamp-in' })}</div>
    ${head('Application received', 'আবেদন পেয়েছি', 'Thank you. Here is what happens next.', 'ধন্যবাদ। এরপর যা হবে।')}
    <ol class="mt-6 space-y-4 text-[15px]">
      <li class="flex gap-3"><span class="w-7 h-7 rounded-full bg-ink text-white grid place-items-center shrink-0"><i data-lucide="check" class="w-4 h-4"></i></span><span>${t('Your number is verified and your application is with the committee.', 'নম্বর যাচাই হয়েছে, আবেদন কমিটির কাছে গেছে।')}</span></li>
      <li class="flex gap-3"><span class="w-7 h-7 rounded-full border-2 border-ink grid place-items-center shrink-0 num font-semibold">2</span><span>${t('The committee approves it at the next meeting, Sunday 16 Nov. You’ll get an SMS.', 'পরের সভায় (রবি ১৬ নভে) অনুমোদন হবে। এসএমএস পাবেন।')}</span></li>
      <li class="flex gap-3"><span class="w-7 h-7 rounded-full border-2 border-rule grid place-items-center shrink-0 num font-semibold">3</span><span>${t('Pay the ₹500 admission (cash or UPI) and your member card appears in the app.', '₹৫০০ ভর্তি ফি দিন, সদস্য কার্ড অ্যাপে চলে আসবে।')}</span></li>
    </ol>
    <a href="index.html" class="btn btn-line w-full h-12 mt-8">${t('Back to the club website', 'ক্লাবের ওয়েবসাইটে ফিরুন')}</a>
  </div>`;

/* Committee: accept invite */
S.invite = () => `
  ${back('#login')}
  <div class="rounded-lg bg-paper-2 p-4 mb-6 text-[15px]"><p><strong>${t('Rajib Banerjee (Secretary)', 'রাজীব ব্যানার্জি (সম্পাদক)')}</strong> ${t('invited you to the console as', 'আপনাকে কনসোলে আমন্ত্রণ জানিয়েছেন')} <strong>${t('Puja in-charge', 'পূজা কমিটি')}</strong>.</p>
    <p class="text-sm text-ink-2 mt-1">${t('You’ll see Events, Puja chanda and Notices. Invite expires 20 Nov.', 'আপনি অনুষ্ঠান, পূজার চাঁদা ও নোটিস দেখবেন। আমন্ত্রণের মেয়াদ ২০ নভে পর্যন্ত।')}</p></div>
  ${head('Set up your sign-in', 'লগইন তৈরি করুন')}
  <form class="mt-6 space-y-5" id="f" novalidate>
    <div><label class="block" for="name"><span class="label">${t('Your name', 'আপনার নাম')}</span></label><input id="name" class="field" value="Kakoli Sen" autocomplete="name" aria-describedby="name-err" />${err('name-err')}</div>
    <div>${phoneField()}</div>
    <div>${passField('pass', ['Create a password', 'পাসওয়ার্ড দিন'], { autocomplete: 'new-password', meter: true })}</div>
    ${primary('Accept and verify number', 'গ্রহণ করে নম্বর যাচাই')}
  </form>`;

S.locked = () => `
  <div class="w-14 h-14 rounded-full border-2 border-ink grid place-items-center mb-6"><i data-lucide="lock" class="w-7 h-7"></i></div>
  ${head('Sign-in paused', 'লগইন সাময়িক বন্ধ', 'Three wrong passwords in a row. To protect the club’s accounts, this number can try again in 15 minutes.', 'পরপর তিনবার ভুল পাসওয়ার্ড। ক্লাবের হিসাব সুরক্ষিত রাখতে ১৫ মিনিট পরে আবার চেষ্টা করুন।')}
  <div class="mt-8 space-y-2">
    <a href="#forgot" class="btn btn-primary w-full h-12 text-base">${t('Reset password instead', 'পাসওয়ার্ড নতুন করুন')}</a>
    <a href="tel:+919830012345" class="btn btn-line w-full h-12">${t('Call the secretary to unlock', 'আনলক করতে সম্পাদককে ফোন করুন')}</a>
  </div>
  <p class="mt-6 text-[13px] text-ink-3">${t('We’ve sent an SMS to the account owner in case this wasn’t you.', 'আপনি না হলে, অ্যাকাউন্টের মালিককে এসএমএস পাঠানো হয়েছে।')}</p>`;

/* ---------- behaviour ---------- */
let resendTimer;
function wire(name) {
  $$('[data-peek]').forEach((b) => b.addEventListener('click', () => {
    const i = $('#' + b.dataset.peek); const show = i.type === 'password';
    i.type = show ? 'text' : 'password';
    b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    b.innerHTML = `<i data-lucide="${show ? 'eye-off' : 'eye'}" class="w-[18px] h-[18px]"></i>`; refreshIcons();
  }));
  $$('input[type=tel]').forEach((i) => i.addEventListener('input', () => { i.value = fmtPhone(i.value); clearErr(i.id + '-err'); }));
  const meterInput = $('#pass');
  if (meterInput && $$('[data-bar]').length) meterInput.addEventListener('input', () => {
    const v = meterInput.value; const score = Math.min(4, (v.length >= 8) + (v.length >= 12) + /\d/.test(v) + /[^a-zA-Z0-9]/.test(v) + /[A-Z]/.test(v) * 0);
    $$('[data-bar]').forEach((b, i) => { b.className = `h-1.5 flex-1 rounded-full ${i < score ? (score < 2 ? 'bg-sindoor' : 'bg-ink') : 'bg-paper-3'}`; });
    clearErr('pass-err');
  });
  $$('[data-method]').forEach((b) => b.addEventListener('click', () => { state.method = b.dataset.method; render('login'); }));

  if ($('#otp')) {
    const boxes = $$('#otp input');
    boxes.forEach((b, i) => {
      b.addEventListener('input', () => { b.value = digits(b.value).slice(-1); clearErr('otp-err'); if (b.value && boxes[i + 1]) boxes[i + 1].focus(); if (boxes.every((x) => x.value)) $('#go').focus(); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus(); });
      b.addEventListener('paste', (e) => { const d = digits(e.clipboardData.getData('text')).slice(0, 6); if (!d) return; e.preventDefault(); d.split('').forEach((c, k) => { if (boxes[k]) boxes[k].value = c; }); boxes[Math.min(5, d.length)].focus(); });
    });
    boxes[0].focus();
    let left = 30;
    const line = () => {
      $('#resend-line').innerHTML = left > 0
        ? t(`Didn’t get it? You can resend in 0:${String(left).padStart(2, '0')}.`, `পাননি? ০:${String(left).padStart(2, '0')} পরে আবার পাঠাতে পারবেন।`)
        : `${t('Didn’t get it?', 'পাননি?')} <button type="button" id="resend" class="font-semibold text-sindoor hover:underline">${t('Resend code', 'আবার পাঠান')}</button> · <button type="button" id="call" class="font-semibold text-sindoor hover:underline">${t('Call me with it', 'ফোনে বলুন')}</button>`;
      applyLang($('#resend-line'));
      $('#resend')?.addEventListener('click', () => { left = 30; line(); toast(`<i data-lucide="send"></i>${t('New code sent.', 'নতুন কোড পাঠানো হয়েছে।')}`); });
      $('#call')?.addEventListener('click', () => toast(`<i data-lucide="phone"></i>${t('You’ll get a call in a few seconds.', 'কয়েক সেকেন্ডে ফোন আসবে।')}`));
    };
    clearInterval(resendTimer);
    line(); resendTimer = setInterval(() => { left--; if (left >= 0) line(); else clearInterval(resendTimer); }, 1000);
  }

  if (name === 'register' && state.regStep === 2) {
    const dep = (n = '', r = 'Spouse') => {
      const d = document.createElement('div');
      d.className = 'grid grid-cols-[1fr_120px_40px] gap-2';
      d.innerHTML = `<input class="field" value="${n}" aria-label="Name" data-bn-ph="নাম" placeholder="Name" />
        <select class="field" aria-label="Relation">${[['Spouse', 'স্বামী/স্ত্রী'], ['Son', 'ছেলে'], ['Daughter', 'মেয়ে'], ['Parent', 'বাবা/মা'], ['Other', 'অন্যান্য']].map(([en, bn]) => `<option ${en === r ? 'selected' : ''} data-bn="${bn}">${en}</option>`).join('')}</select>
        <button type="button" class="btn btn-ghost px-0 w-10" aria-label="Remove"><i data-lucide="x"></i></button>`;
      d.querySelector('button').addEventListener('click', () => d.remove());
      $('#deps').append(d); applyLang(d); refreshIcons();
    };
    dep('', 'Spouse'); dep('', 'Son');
    $('#reg-back').addEventListener('click', () => { state.regStep = 1; render('register'); });
    $('#add-dep').addEventListener('click', () => dep('', 'Other'));
  }

  $('#f')?.addEventListener('submit', (e) => { e.preventDefault(); submit(name); });
}

function needPhone() {
  const p = $('#phone');
  if (!validPhone(p.value)) { showErr('phone-err', 'Enter a 10-digit mobile number, like 98300 12345.', '১০ সংখ্যার মোবাইল নম্বর দিন, যেমন 98300 12345।'); p.focus(); return false; }
  state.phone = fmtPhone(p.value); return true;
}
function needPass(id = 'pass', min = 8) {
  const p = $('#' + id);
  if (p.value.length < min) { showErr(id + '-err', `Use at least ${min} characters.`, `অন্তত ${min}টি অক্ষর দিন।`); p.focus(); return false; }
  return true;
}
const go = (hash) => { location.hash = hash; };

function submit(name) {
  if (name === 'login') {
    if (!needPhone()) return;
    if (state.method === 'otp' && !isCommittee) { state.purpose = 'login'; return go('otp'); }
    if (!$('#pass').value) { showErr('pass-err', 'Enter your password.', 'পাসওয়ার্ড দিন।'); return $('#pass').focus(); }
    if ($('#pass').value === 'wrongpass') {
      state.attempts++;
      if (state.attempts >= 3) return go('locked');
      return showErr('pass-err', `That password doesn’t match this number. ${3 - state.attempts} tries left before a 15-minute pause.`, `এই নম্বরের সঙ্গে পাসওয়ার্ড মিলছে না। আর ${3 - state.attempts} বার চেষ্টা করা যাবে।`);
    }
    if (isCommittee) { state.purpose = 'login'; return go('otp'); }
    location.href = 'app.html';
  }
  if (name === 'otp') {
    const code = $$('#otp input').map((i) => i.value).join('');
    if (code.length < 6) return showErr('otp-err', 'Enter all 6 digits.', '৬টি সংখ্যাই দিন।');
    if (code === '000000') { $$('#otp input').forEach((i) => { i.value = ''; i.classList.add('border-sindoor'); }); $$('#otp input')[0].focus(); return showErr('otp-err', 'That code didn’t match. Check the latest SMS, or resend.', 'কোড মেলেনি। সর্বশেষ এসএমএস দেখুন, বা আবার পাঠান।'); }
    clearInterval(resendTimer);
    if (state.purpose === 'reset') return go('reset');
    if (state.purpose === 'register') return go('pending');
    if (state.purpose === 'activate') return go('setpass');
    location.href = isCommittee ? 'console.html' : 'app.html';
  }
  if (name === 'forgot') { if (!needPhone()) return; state.purpose = 'reset'; go('otp'); }
  if (name === 'reset') {
    if (!needPass('pass')) return;
    if ($('#pass').value !== $('#pass2').value) { showErr('pass2-err', 'The two passwords don’t match.', 'দুটো পাসওয়ার্ড মিলছে না।'); return $('#pass2').focus(); }
    go('done');
  }
  if (name === 'activate') {
    const f = $('#famno');
    if (!/^MC-?\d{3,4}$/i.test(f.value.trim())) { showErr('famno-err', 'Family numbers look like MC-0104.', 'পরিবার নম্বর এমন হয়: MC-0104।'); return f.focus(); }
    if (!needPhone()) return; state.purpose = 'activate'; go('otp');
  }
  if (name === 'setpass') { if (!needPass()) return; location.href = 'app.html'; }
  if (name === 'register') {
    if (state.regStep === 1) {
      if (!$('#name').value.trim()) { showErr('name-err', 'Enter the name of the head of the family.', 'পরিবারের প্রধানের নাম দিন।'); return $('#name').focus(); }
      if (!needPhone()) return;
      state.regStep = 2; return render('register');
    }
    state.purpose = 'register'; go('otp');
  }
  if (name === 'invite') {
    if (!$('#name').value.trim()) { showErr('name-err', 'Enter your name.', 'আপনার নাম দিন।'); return $('#name').focus(); }
    if (!needPhone() || !needPass()) return;
    state.purpose = 'login'; go('otp');
  }
}

function render(name) {
  const host = $('#auth');
  host.dataset.view = name;
  host.innerHTML = `<div class="rise">${S[name]()}</div>`;
  applyLang(host); refreshIcons(); wire(name);
  const first = host.querySelector('input:not([type=checkbox]):not([type=radio]), select');
  if (first && name !== 'otp' && matchMedia('(min-width: 640px)').matches) first.focus();
}

window.addEventListener('hashchange', () => { const n = location.hash.slice(1) || 'login'; if (n === 'register') state.regStep = 1; render(S[n] ? n : 'login'); });
document.addEventListener('langchange', () => render($('#auth').dataset.view || 'login'));
render(S[location.hash.slice(1)] ? location.hash.slice(1) : 'login');
boot(isCommittee ? 'admin-login' : 'login');
