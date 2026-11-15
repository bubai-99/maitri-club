// Member app: family & profile, settings, notifications, the phone "More" menu, install prompt, offline state.
import { t, dn, lang, setLang, toast } from './shared.js';
import { profile, household, relations, bloodGroups, store, alerts, prefs, devices, receipts, TODAY } from './member-data.js';
import {
  $, $$, L, esc, paint, fdate, bnD, ageOn, pageHead, sectionTitle, empty, segmented, statusChip, avatar, openSheet, closeSheet,
  sheetHead, donePanel, confirmSheet, ok, needOnline, fieldError, downloadText, imageUrl, notify, rerender,
} from './app-ui.js';

const pendingMembers = [];
const digits = (v) => v.replace(/\D/g, '');
const fmtPhone = (v) => { const d = digits(v).slice(0, 10); return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d; };

/* ---------- Family & profile ---------- */
function memberForm(p = null) {
  const isHead = p && p.relKey === 'head';
  const rel = p?.relKey || 'daughter';
  return `
  <form id="mem-form" class="mt-5 space-y-4" novalidate>
    <div class="flex items-center gap-4">
      <span id="mem-photo-prev">${p ? avatar(p, 'w-20 h-20 text-3xl', 'bg-paper-2 text-ink') : '<span class="w-20 h-20 rounded-full bg-paper-2 grid place-items-center shrink-0"><i data-lucide="user-round" class="w-8 h-8 text-ink-3"></i></span>'}</span>
      <div>
        <label class="btn btn-line btn-sm cursor-pointer focus-within:outline-2 focus-within:outline-sindoor"><i data-lucide="camera"></i>${p?.photoUrl || p?.photo ? t('Change photo', 'ছবি বদলান') : t('Add photo', 'ছবি দিন')}<input type="file" accept="image/*" capture="user" class="sr-only" id="mem-photo" /></label>
        <p class="text-[13px] text-ink-3 mt-1.5">${t('A clear face photo, like a passport photo. Used on the ID card.', 'পাসপোর্ট ছবির মতো স্পষ্ট মুখের ছবি। আইডি কার্ডে ব্যবহার হবে।')}</p>
      </div>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <div data-field class="sm:col-span-2"><label class="label" for="mem-name">${t('Full name', 'পুরো নাম')}</label><input id="mem-name" class="field" autocomplete="off" value="${p ? esc(L(p.name, p.nameBn)) : ''}" ${isHead ? 'readonly aria-describedby="name-note"' : ''} />${isHead ? `<p class="text-[13px] text-ink-3 mt-1" id="name-note">${t('To correct the head of family’s name, write to the secretary.', 'পরিবারের প্রধানের নাম ঠিক করতে সম্পাদককে লিখুন।')}</p>` : ''}</div>
      <div><label class="label" for="mem-rel">${t('Relation to you', 'আপনার সঙ্গে সম্পর্ক')}</label>
        <select id="mem-rel" class="field" ${isHead ? 'disabled' : ''}>${isHead ? `<option>${L('Head of family', 'পরিবারের প্রধান')}</option>` : relations.map(([k, en, bn]) => `<option value="${k}" ${k === rel ? 'selected' : ''}>${L(en, bn)}</option>`).join('')}</select></div>
      <div data-field><label class="label" for="mem-dob">${t('Date of birth', 'জন্মতারিখ')}</label><input id="mem-dob" type="date" class="field num" max="${TODAY}" value="${p?.dob || ''}" /></div>
      <div><label class="label" for="mem-blood">${t('Blood group', 'রক্তের গ্রুপ')}</label>
        <select id="mem-blood" class="field"><option value="">${L('Don’t know', 'জানা নেই')}</option>${bloodGroups.map((b) => `<option ${p?.blood === b ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
      <div data-field><label class="label" for="mem-mobile">${t('Mobile (optional)', 'মোবাইল (ঐচ্ছিক)')}</label><input id="mem-mobile" type="tel" inputmode="numeric" class="field num" placeholder="98300 12345" value="${p?.mobile || ''}" ${isHead ? 'readonly' : ''} /></div>
    </div>
    ${p ? '' : `<label class="flex items-start gap-3 rounded-lg bg-paper-2 p-4 text-[15px] leading-relaxed cursor-pointer" data-field><input type="checkbox" id="mem-decl" class="mt-1.5 w-4 h-4 shrink-0 accent-[#d21f1b]" /><span>${t('They live at our address and want to join of their own free will, and will abide by the club’s rules and collective decisions.', 'তিনি আমাদের ঠিকানায় থাকেন, স্বেচ্ছায় যোগ দিতে চান এবং ক্লাবের নিয়ম ও সম্মিলিত সিদ্ধান্ত মেনে চলবেন।')}</span></label>
    <p class="text-sm text-ink-2">${t('No extra fee: ₹100 a month already covers your household. The committee checks new names before the card appears.', 'বাড়তি খরচ নেই: মাসে ₹১০০-তেই পুরো পরিবার। নতুন নাম কমিটি যাচাই করলে কার্ড আসবে।')}</p>`}
    <button class="btn btn-primary w-full h-12">${p ? t('Save changes', 'বদল সেভ করুন') : t('Send to committee', 'কমিটিকে পাঠান')}</button>
    ${p && !isHead ? `<button type="button" class="btn btn-ghost w-full text-sindoor-deep" id="mem-remove">${t('Remove from family', 'পরিবার থেকে বাদ দিন')}</button>` : ''}
  </form>`;
}

function openMemberSheet(idx = null) {
  const p = idx === null ? null : household[idx];
  let newPhoto = null;
  openSheet(`${sheetHead(p ? 'Edit family member' : 'Add a family member', p ? 'সদস্যের বিবরণ বদলান' : 'সদস্য যোগ করুন', p ? '' : 'Anyone living at your address.', p ? '' : 'আপনার ঠিকানায় থাকেন এমন যে কেউ।')}${memberForm(p)}`, {
    wide: true,
    onMount: (b) => {
      const mob = b.querySelector('#mem-mobile');
      mob.addEventListener('input', () => { mob.value = fmtPhone(mob.value); });
      b.querySelector('#mem-photo').addEventListener('change', (e) => {
        newPhoto = imageUrl(e.target);
        if (newPhoto) paint(b.querySelector('#mem-photo-prev'), `<img src="${newPhoto}" alt="" class="w-20 h-20 rounded-full object-cover border border-rule" />`);
      });
      b.querySelector('#mem-remove')?.addEventListener('click', () => confirmSheet({
        en: `Remove ${p.name.split(' ')[0]}?`, bn: `${p.nameBn.split(' ')[0]}-কে বাদ দেবেন?`, subEn: 'Their card stops working at the gate once the committee approves. Their receipts stay with the family.', subBn: 'কমিটি অনুমোদন করলে তাঁর কার্ড গেটে আর চলবে না। রসিদ পরিবারের কাছেই থাকবে।', yesEn: 'Send request', yesBn: 'অনুরোধ পাঠান', danger: true,
        onYes: () => { if (!needOnline()) return; p.status = 'removing'; closeSheet(); rerender(); ok('Request sent to the secretary.', 'সম্পাদককে অনুরোধ পাঠানো হয়েছে।', 'send'); },
      }));
      b.querySelector('#mem-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = b.querySelector('#mem-name');
        const dob = b.querySelector('#mem-dob');
        if (name.value.trim().split(/\s+/).length < 2) return fieldError(name, 'Enter first name and surname.', 'নাম ও পদবি দুটোই দিন।');
        if (!dob.value) return fieldError(dob, 'Enter the date of birth.', 'জন্মতারিখ দিন।');
        if (mob.value && !/^[6-9]\d{9}$/.test(digits(mob.value))) return fieldError(mob, 'Enter a 10-digit mobile number, or leave it empty.', '১০ সংখ্যার মোবাইল নম্বর দিন, বা ফাঁকা রাখুন।');
        if (!p && !b.querySelector('#mem-decl').checked) return fieldError(b.querySelector('#mem-decl'), 'Please confirm the declaration.', 'ঘোষণাটি নিশ্চিত করুন।');
        if (!needOnline()) return;
        const relKey = b.querySelector('#mem-rel').value;
        const relRow = relations.find((r) => r[0] === relKey);
        if (p) {
          const nameChanged = name.value.trim() !== L(p.name, p.nameBn);
          if (nameChanged) { if (lang === 'bn') p.nameBn = name.value.trim(); else p.name = name.value.trim(); }
          p.dob = dob.value; p.blood = b.querySelector('#mem-blood').value || p.blood; p.mobile = mob.value;
          if (relRow && p.relKey !== 'head') { p.relKey = relKey; p.rel = relRow[1]; p.relBn = relRow[2]; }
          if (newPhoto) { p.photoUrl = newPhoto; p.photo = true; }
          if (p.relKey === 'head') { profile.photoUrl = p.photoUrl; profile.dob = p.dob; profile.blood = p.blood; }
          closeSheet(); notify(); rerender();
          ok(nameChanged ? 'Saved. The name change is checked by the committee before it’s printed.' : 'Saved', nameChanged ? 'সেভ হয়েছে। নাম বদল প্রিন্টের আগে কমিটি যাচাই করবে।' : 'সেভ হয়েছে');
        } else {
          const n = name.value.trim();
          pendingMembers.push({ name: n, nameBn: n, rel: relRow[1], relBn: relRow[2], dob: dob.value, blood: b.querySelector('#mem-blood').value, photoUrl: newPhoto });
          rerender();
          paint(b, donePanel({ icon: 'user-plus', en: 'Sent to the committee', bn: 'কমিটিকে পাঠানো হয়েছে', subEn: `${n.split(' ')[0]}’s card appears in the app once the secretary approves, usually after the next meeting.`, subBn: `সম্পাদক অনুমোদন করলে ${n.split(' ')[0]}-এর কার্ড অ্যাপে আসবে, সাধারণত পরের সভার পর।`, ref: `FM-${profile.family.slice(3)}-${pendingMembers.length + 3}` }));
        }
      });
    },
  });
}

function openDetailsSheet() {
  openSheet(`
    ${sheetHead('Your details', 'আপনার বিবরণ')}
    <form id="det-form" class="mt-5 space-y-4" novalidate>
      <div data-field><label class="label" for="d-email">${t('Email', 'ইমেল')}</label><input id="d-email" type="email" class="field" autocomplete="email" value="${esc(profile.email)}" /></div>
      <div class="grid grid-cols-2 gap-3">
        <div data-field><label class="label" for="d-dob">${t('Date of birth', 'জন্মতারিখ')}</label><input id="d-dob" type="date" class="field num" max="${TODAY}" value="${profile.dob}" /></div>
        <div><label class="label" for="d-blood">${t('Blood group', 'রক্তের গ্রুপ')}</label><select id="d-blood" class="field">${bloodGroups.map((b) => `<option ${profile.blood === b ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
      </div>
      <div data-field><label class="label" for="d-addr">${t('Address', 'ঠিকানা')}</label><textarea id="d-addr" rows="2" class="field">${esc(L(profile.address, profile.addressBn))}</textarea><p class="text-[13px] text-ink-3 mt-1">${t('Address changes are checked by the secretary, since they move you to another lane’s chanda list.', 'ঠিকানা বদল সম্পাদক যাচাই করবেন, কারণ এতে চাঁদার গলি বদলে যায়।')}</p></div>
      <p class="text-sm text-ink-2">${t('Mobile number is changed from Settings, with a code.', 'মোবাইল নম্বর সেটিংস থেকে কোড দিয়ে বদলান।')} <a href="#settings" class="font-semibold text-sindoor hover:underline" data-close>${t('Go to Settings', 'সেটিংসে যান')}</a></p>
      <button class="btn btn-primary w-full h-12">${t('Save', 'সেভ করুন')}</button>
    </form>`, {
    onMount: (b) => b.querySelector('#det-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const em = b.querySelector('#d-email');
      if (em.value && !/^\S+@\S+\.\S+$/.test(em.value)) return fieldError(em, 'That email doesn’t look right.', 'ইমেল ঠিক মনে হচ্ছে না।');
      if (!needOnline()) return;
      const addrChanged = b.querySelector('#d-addr').value.trim() !== L(profile.address, profile.addressBn);
      profile.email = em.value.trim(); profile.dob = b.querySelector('#d-dob').value; profile.blood = b.querySelector('#d-blood').value;
      household[0].dob = profile.dob; household[0].blood = profile.blood;
      closeSheet(); rerender();
      ok(addrChanged ? 'Saved. The new address goes to the secretary for approval.' : 'Details saved', addrChanged ? 'সেভ হয়েছে। নতুন ঠিকানা অনুমোদনের জন্য সম্পাদকের কাছে গেছে।' : 'বিবরণ সেভ হয়েছে');
    }),
  });
}

function renderProfile() {
  const head = household[0];
  paint('#s-profile', `
    ${pageHead({ en: 'Family & profile', bn: 'পরিবার ও প্রোফাইল' })}
    <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
      <div class="min-w-0 space-y-6">
        <section class="rounded-lg border border-rule bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="relative w-fit">
            ${avatar(head, 'w-20 h-20 text-3xl', 'bg-sindoor text-white')}
            <label class="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-ink text-paper grid place-items-center cursor-pointer border-2 border-card focus-within:outline-2 focus-within:outline-sindoor" title="${L('Change photo', 'ছবি বদলান')}"><i data-lucide="camera" class="w-4 h-4"></i><span class="sr-only">${t('Change profile photo', 'প্রোফাইল ছবি বদলান')}</span><input type="file" accept="image/*" class="sr-only" id="pf-photo" /></label>
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="font-display text-[1.6rem] leading-tight">${t(profile.name, profile.nameBn)}</h2>
            <p class="text-[15px] text-ink-2"><span class="num">${profile.family}</span> · ${t(`member since ${profile.since}`, `${bnD(profile.since)} থেকে সদস্য`)}</p>
            <p class="mt-2 flex flex-wrap gap-1.5">${statusChip('ok', 'Active member', 'সক্রিয় সদস্য', 'badge-check')}${profile.donor ? statusChip('due', `Blood donor · ${profile.blood}`, `রক্তদাতা · ${profile.blood}`, 'droplet') : ''}</p>
          </div>
        </section>

        <section aria-labelledby="fam-h">
          ${sectionTitle('Family on this membership', 'এই সদস্যপদে পরিবার', `<span class="text-sm text-ink-3">${t(`${household.length} people`, `${bnD(household.length)} জন`)}</span>`)}
          <h2 id="fam-h" class="sr-only">${t('Family', 'পরিবার')}</h2>
          <ul class="mt-2 rounded-lg border border-rule bg-card divide-y divide-rule overflow-hidden">
            ${household.map((p, i) => `<li class="flex items-center gap-3 px-4 py-3">
              ${avatar(p, 'w-11 h-11 text-base', i ? 'bg-paper-2 text-ink' : 'bg-ink text-white')}
              <span class="flex-1 min-w-0"><span class="block font-semibold truncate">${t(p.name, p.nameBn)}</span>
                <span class="block text-sm text-ink-2">${t(p.rel, p.relBn)} · ${t(`${ageOn(p.dob)} yrs`, `${bnD(ageOn(p.dob))} বছর`)} · <span class="num">${p.blood}</span></span></span>
              ${p.status === 'removing' ? statusChip('wait', 'Removal requested', 'বাদের অনুরোধ') : !p.photo && !p.photoUrl ? statusChip('due', 'Photo needed', 'ছবি লাগবে') : ''}
              <button type="button" class="w-10 h-10 grid place-items-center rounded-full hover:bg-paper-2 shrink-0" data-edit="${i}" aria-label="${L(`Edit ${p.name}`, `${p.nameBn}-এর বিবরণ বদলান`)}"><i data-lucide="pencil" class="w-4 h-4"></i></button>
            </li>`).join('')}
            ${pendingMembers.map((p) => `<li class="flex items-center gap-3 px-4 py-3 bg-paper-2/40">
              ${avatar(p, 'w-11 h-11 text-base', 'bg-paper-2 text-ink-3')}
              <span class="flex-1 min-w-0"><span class="block font-semibold truncate">${esc(p.name)}</span><span class="block text-sm text-ink-2">${t(p.rel, p.relBn)}${p.dob ? ` · ${t(`${ageOn(p.dob)} yrs`, `${bnD(ageOn(p.dob))} বছর`)}` : ''}</span></span>
              ${statusChip('wait', 'Awaiting committee', 'কমিটির অনুমোদন বাকি', 'hourglass')}
            </li>`).join('')}
          </ul>
          <button type="button" class="btn btn-line w-full sm:w-auto mt-3" id="add-member"><i data-lucide="user-plus"></i>${t('Add a family member', 'সদস্য যোগ করুন')}</button>
        </section>

        <section aria-labelledby="me-h">
          ${sectionTitle('Your details', 'আপনার বিবরণ', `<button type="button" class="text-sm font-semibold text-sindoor hover:underline" id="edit-details">${t('Edit', 'বদলান')}</button>`)}
          <h2 id="me-h" class="sr-only">${t('Your details', 'আপনার বিবরণ')}</h2>
          <dl class="mt-2 rounded-lg border border-rule bg-card divide-y divide-rule text-[15px]">
            ${[
              ['Mobile', 'মোবাইল', `<span class="num">+91 ${dn(profile.mobile)}</span>`],
              ['Email', 'ইমেল', esc(profile.email) || `<span class="text-ink-3">${t('Not added', 'দেওয়া নেই')}</span>`],
              ['Date of birth', 'জন্মতারিখ', fdate(profile.dob)],
              ['Blood group', 'রক্তের গ্রুপ', `<span class="num">${profile.blood}</span>`],
              ['Address', 'ঠিকানা', t(profile.address, profile.addressBn)],
              ['Aadhaar', 'আধার', `<span class="num tracking-wider">•••• ${dn(profile.aadhaar4)}</span>`],
            ].map(([en, bn, v]) => `<div class="flex justify-between gap-4 px-4 py-3"><dt class="text-ink-3 shrink-0">${t(en, bn)}</dt><dd class="text-right min-w-0 break-words">${v}</dd></div>`).join('')}
          </dl>
        </section>
      </div>

      <aside class="min-w-0 space-y-4 lg:sticky lg:top-24">
        <section class="rounded-lg border-2 ${profile.donor ? 'border-sindoor' : 'border-rule'} bg-card p-4" aria-labelledby="donor-h">
          <div class="flex items-start gap-3">
            <i data-lucide="droplet" class="w-6 h-6 text-sindoor shrink-0 mt-0.5"></i>
            <div class="flex-1 min-w-0"><h2 id="donor-h" class="font-semibold"><label for="donor-sw">${t('Blood donor list', 'রক্তদাতার তালিকা')}</label></h2>
            <p class="text-sm text-ink-2 mt-0.5">${t('When a neighbour urgently needs your group, the committee may call you. Only the committee sees this list.', 'প্রতিবেশীর জরুরি দরকারে আপনার গ্রুপের রক্ত লাগলে কমিটি ফোন করতে পারে। তালিকা শুধু কমিটি দেখে।')}</p></div>
            <input type="checkbox" role="switch" class="switch" id="donor-sw" ${profile.donor ? 'checked' : ''} />
          </div>
          ${profile.donor ? `<div class="mt-3 pt-3 border-t border-rule flex items-center justify-between gap-3 text-[15px]"><span class="text-ink-2">${t('Last donated', 'শেষ রক্তদান')}</span><span>${profile.lastDonation ? fdate(profile.lastDonation) : '—'}</span></div>
          <a href="#event/blood" class="btn btn-line btn-sm w-full mt-3">${t('Donation camp, 28 Nov', 'রক্তদান শিবির, ২৮ নভে')}</a>` : ''}
        </section>
        <a href="#id" class="flex items-center gap-3 rounded-lg border border-rule bg-card p-4 hover:border-ink/30"><i data-lucide="id-card" class="w-6 h-6 text-sindoor"></i><span class="flex-1 font-semibold">${t('Member cards', 'সদস্য কার্ড')}</span><i data-lucide="chevron-right" class="w-4 h-4 text-ink-3"></i></a>
        <a href="#settings" class="flex items-center gap-3 rounded-lg border border-rule bg-card p-4 hover:border-ink/30"><i data-lucide="settings" class="w-6 h-6"></i><span class="flex-1 font-semibold">${t('Settings & security', 'সেটিংস ও নিরাপত্তা')}</span><i data-lucide="chevron-right" class="w-4 h-4 text-ink-3"></i></a>
      </aside>
    </div>`);
  $('#add-member').addEventListener('click', () => openMemberSheet());
  $$('[data-edit]').forEach((b) => b.addEventListener('click', () => (b.dataset.edit === '0' ? openMemberSheet(0) : openMemberSheet(Number(b.dataset.edit)))));
  $('#edit-details').addEventListener('click', openDetailsSheet);
  $('#pf-photo').addEventListener('change', (e) => {
    const url = imageUrl(e.target); if (!url) return;
    profile.photoUrl = url; household[0].photoUrl = url; household[0].photo = true;
    notify(); renderProfile(); ok('Profile photo updated. It’s also used on your ID card.', 'প্রোফাইল ছবি বদলেছে। আইডি কার্ডেও এটাই থাকবে।');
  });
  $('#donor-sw').addEventListener('change', (e) => {
    profile.donor = e.target.checked; renderProfile();
    ok(profile.donor ? 'You’re on the blood donor list. Thank you.' : 'Removed from the blood donor list.', profile.donor ? 'আপনি রক্তদাতার তালিকায় আছেন। ধন্যবাদ।' : 'রক্তদাতার তালিকা থেকে বাদ দেওয়া হয়েছে।', profile.donor ? 'heart-handshake' : 'info');
  });
}

/* ---------- Settings ---------- */
let deferredInstall = null;
function openChangePassword() {
  openSheet(`
    ${sheetHead('Change password', 'পাসওয়ার্ড বদলান', 'You can always sign in with a one-time code instead.', 'চাইলে সবসময় ওটিপি দিয়েও লগইন করা যায়।')}
    <form id="pw-form" class="mt-5 space-y-4" novalidate>
      <div data-field><label class="label" for="pw-old">${t('Current password', 'বর্তমান পাসওয়ার্ড')}</label><input id="pw-old" type="password" class="field" autocomplete="current-password" /></div>
      <div data-field><label class="label" for="pw-new">${t('New password', 'নতুন পাসওয়ার্ড')}</label><input id="pw-new" type="password" class="field" autocomplete="new-password" aria-describedby="pw-hint" />
        <div class="mt-2 flex gap-1" aria-hidden="true">${'<span class="h-1.5 flex-1 rounded-full bg-paper-3" data-bar></span>'.repeat(4)}</div>
        <p class="mt-1 text-[13px] text-ink-2" id="pw-hint">${t('At least 8 characters. A phrase is easier to remember.', 'অন্তত ৮টি অক্ষর। একটা ছোট বাক্য মনে রাখা সহজ।')}</p></div>
      <div data-field><label class="label" for="pw-new2">${t('Type it again', 'আবার লিখুন')}</label><input id="pw-new2" type="password" class="field" autocomplete="new-password" /></div>
      <label class="flex items-center gap-2 text-[15px]"><input type="checkbox" checked class="w-4 h-4 accent-[#2b2f36]" />${t('Sign me out on other devices', 'অন্য ডিভাইস থেকে লগআউট করুন')}</label>
      <button class="btn btn-primary w-full h-12">${t('Save password', 'পাসওয়ার্ড সেভ করুন')}</button>
      <a href="login.html#forgot" class="block text-center text-sm font-semibold text-sindoor hover:underline">${t('Forgot your current password?', 'বর্তমান পাসওয়ার্ড ভুলে গেছেন?')}</a>
    </form>`, {
    onMount: (b) => {
      const n = b.querySelector('#pw-new');
      n.addEventListener('input', () => {
        const v = n.value; const score = Math.min(4, (v.length >= 8) + (v.length >= 12) + /\d/.test(v) + /[^a-zA-Z0-9]/.test(v));
        $$('[data-bar]', b).forEach((x, i) => { x.className = `h-1.5 flex-1 rounded-full ${i < score ? (score < 2 ? 'bg-sindoor' : 'bg-ink') : 'bg-paper-3'}`; });
      });
      b.querySelector('#pw-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const o = b.querySelector('#pw-old'); const n2 = b.querySelector('#pw-new2');
        if (!o.value) return fieldError(o, 'Enter your current password.', 'বর্তমান পাসওয়ার্ড দিন।');
        if (o.value === 'wrongpass') return fieldError(o, 'That isn’t your current password.', 'এটি আপনার বর্তমান পাসওয়ার্ড নয়।');
        if (n.value.length < 8) return fieldError(n, 'Use at least 8 characters.', 'অন্তত ৮টি অক্ষর দিন।');
        if (n.value !== n2.value) return fieldError(n2, 'The two passwords don’t match.', 'দুটো পাসওয়ার্ড মিলছে না।');
        if (!needOnline()) return;
        paint(b, donePanel({ icon: 'key-round', en: 'Password changed', bn: 'পাসওয়ার্ড বদলানো হয়েছে', subEn: 'Other devices have been signed out. We sent an SMS to confirm.', subBn: 'অন্য ডিভাইস থেকে লগআউট করা হয়েছে। নিশ্চিত করতে এসএমএস পাঠানো হয়েছে।' }));
      });
    },
  });
}

function openChangeNumber() {
  let step = 1; let num = '';
  const body = () => step === 1 ? `
    ${sheetHead('Change mobile number', 'মোবাইল নম্বর বদলান', 'We’ll send a code to the new number, then a confirmation to the old one. Your card, receipts and family stay the same.', 'নতুন নম্বরে কোড পাঠাব, পুরনো নম্বরে নিশ্চিতকরণ যাবে। কার্ড, রসিদ ও পরিবার একই থাকবে।')}
    <form id="cn-form" class="mt-5 space-y-4" novalidate>
      <div data-field><label class="label" for="cn-num">${t('New mobile number', 'নতুন মোবাইল নম্বর')}</label>
        <div class="flex"><span class="inline-flex items-center px-3 rounded-l-[4px] border border-r-0 border-rule bg-paper-2 text-ink-2 text-[15px] num">+91</span><input id="cn-num" class="field rounded-l-none num" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="98300 12345" /></div></div>
      <button class="btn btn-primary w-full h-12">${t('Send code', 'কোড পাঠান')}</button>
    </form>` : `
    ${sheetHead('Enter the code', 'কোড লিখুন', `Sent to +91 ${num}.`, `+৯১ ${num} নম্বরে পাঠানো হয়েছে।`)}
    <form id="cn-form" class="mt-5 space-y-4" novalidate>
      <div data-field><label class="label" for="cn-otp">${t('6-digit code', '৬ সংখ্যার কোড')}</label><input id="cn-otp" class="field num text-center text-2xl tracking-[0.5em] h-14" inputmode="numeric" maxlength="6" autocomplete="one-time-code" /></div>
      <p class="text-[13px] text-ink-3">${t('Prototype: any 6 digits work. 000000 shows the error.', 'প্রোটোটাইপ: যেকোনো ৬ সংখ্যা চলবে। 000000 দিলে ভুল দেখাবে।')}</p>
      <button class="btn btn-primary w-full h-12">${t('Verify and change', 'যাচাই করে বদলান')}</button>
    </form>`;
  const mount = (b) => {
    const f = b.querySelector('#cn-form');
    const i = b.querySelector('#cn-num') || b.querySelector('#cn-otp');
    i.addEventListener('input', () => { i.value = step === 1 ? fmtPhone(i.value) : digits(i.value).slice(0, 6); });
    i.focus();
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (step === 1) {
        if (!/^[6-9]\d{9}$/.test(digits(i.value))) return fieldError(i, 'Enter a 10-digit mobile number, like 98300 12345.', '১০ সংখ্যার মোবাইল নম্বর দিন, যেমন 98300 12345।');
        if (digits(i.value) === digits(profile.mobile)) return fieldError(i, 'That’s already your number.', 'এটাই আপনার বর্তমান নম্বর।');
        if (!needOnline()) return;
        num = fmtPhone(i.value); step = 2; paint(b, body()); mount(b); return;
      }
      if (i.value.length < 6) return fieldError(i, 'Enter all 6 digits.', '৬টি সংখ্যাই দিন।');
      if (i.value === '000000') return fieldError(i, 'That code didn’t match. Check the latest SMS.', 'কোড মেলেনি। সর্বশেষ এসএমএস দেখুন।');
      profile.mobile = num; household[0].mobile = num;
      rerender();
      paint(b, donePanel({ icon: 'smartphone', en: 'Mobile number changed', bn: 'মোবাইল নম্বর বদলেছে', subEn: `Sign in with +91 ${num} from now on.`, subBn: `এখন থেকে +৯১ ${num} দিয়ে লগইন করুন।` }));
    });
  };
  openSheet(body(), { onMount: mount });
}

function renderSettings() {
  const sw = (id, on, en, bn, subEn, subBn, icon = '') => `
    <li class="flex items-center gap-3 px-4 py-3">
      ${icon ? `<i data-lucide="${icon}" class="w-5 h-5 text-ink-2 shrink-0"></i>` : ''}
      <label for="${id}" class="flex-1 min-w-0 cursor-pointer"><span class="block font-semibold text-[15px]">${t(en, bn)}</span>${subEn ? `<span class="block text-sm text-ink-2">${t(subEn, subBn)}</span>` : ''}</label>
      <input id="${id}" type="checkbox" role="switch" ${on ? 'checked' : ''} class="switch" />
    </li>`;
  const row = (attrs, icon, en, bn, right = '<i data-lucide="chevron-right" class="ml-auto w-4 h-4 text-ink-3"></i>') => `<li><${attrs.startsWith('href') ? 'a' : 'button type="button"'} ${attrs} class="w-full flex items-center gap-3 px-4 py-3.5 text-left text-[15px] hover:bg-paper-2/50"><i data-lucide="${icon}" class="w-5 h-5 text-ink-2 shrink-0"></i><span>${t(en, bn)}</span>${right}</${attrs.startsWith('href') ? 'a' : 'button'}></li>`;
  const standalone = matchMedia('(display-mode: standalone)').matches;
  paint('#s-settings', `
    ${pageHead({ en: 'Settings', bn: 'সেটিংস' })}
    <div class="mt-5 grid gap-6 lg:grid-cols-2 items-start">
      <div class="min-w-0 space-y-6">
        <section>${sectionTitle('Language', 'ভাষা')}
          <div class="mt-2 grid grid-cols-2 p-1 rounded-[7px] bg-paper-2" role="group" aria-label="${L('Language', 'ভাষা')}">
            <button type="button" data-lang-btn="en" aria-pressed="${lang === 'en'}" class="h-10 rounded-[5px] text-[15px] font-semibold text-ink-2 aria-pressed:bg-white aria-pressed:text-ink" data-set-lang>English</button>
            <button type="button" data-lang-btn="bn" aria-pressed="${lang === 'bn'}" class="h-10 rounded-[5px] text-[15px] font-semibold text-ink-2 aria-pressed:bg-white aria-pressed:text-ink" lang="bn" data-set-lang>বাংলা</button>
          </div></section>

        <section>${sectionTitle('How we reach you', 'কীভাবে জানাব')}
          <ul class="mt-2 rounded-lg border border-rule bg-card divide-y divide-rule">
            ${sw('ch-push', prefs.channels.push, 'App notifications', 'অ্যাপ নোটিফিকেশন', 'On this phone', 'এই ফোনে', 'bell')}
            ${sw('ch-whatsapp', prefs.channels.whatsapp, 'WhatsApp', 'হোয়াটসঅ্যাপ', `Reminders and receipts to +91 ${profile.mobile}`, `+৯১ ${profile.mobile}-এ তাগাদা ও রসিদ`, 'message-circle')}
            ${sw('ch-sms', prefs.channels.sms, 'SMS', 'এসএমএস', 'Only if WhatsApp fails', 'হোয়াটসঅ্যাপ না গেলে তবেই', 'message-square')}
          </ul>
          <button type="button" class="mt-2 text-sm font-semibold text-sindoor hover:underline" id="test-notif">${t('Send me a test notification', 'একটি পরীক্ষামূলক নোটিফিকেশন পাঠান')}</button></section>

        <section>${sectionTitle('What we tell you about', 'কী কী জানাব')}
          <ul class="mt-2 rounded-lg border border-rule bg-card divide-y divide-rule">${prefs.topics.map(([k, en, bn, sEn, sBn, on]) => sw(`tp-${k}`, on, en, bn, sEn, sBn)).join('')}</ul></section>
      </div>

      <div class="min-w-0 space-y-6">
        <section>${sectionTitle('App', 'অ্যাপ')}
          <ul class="mt-2 rounded-lg border border-rule bg-card divide-y divide-rule">
            ${standalone ? `<li class="flex items-center gap-3 px-4 py-3.5 text-[15px]"><i data-lucide="badge-check" class="w-5 h-5 text-tulsi"></i>${t('Installed on this device', 'এই ডিভাইসে ইনস্টল করা')}</li>` : row('data-install', 'download', 'Install the app', 'অ্যাপ ইনস্টল করুন')}
            ${sw('sim-offline', store.simulatedOffline, 'Simulate offline', 'অফলাইন অবস্থা দেখুন', 'Prototype: see how the app behaves without internet', 'প্রোটোটাইপ: ইন্টারনেট ছাড়া অ্যাপ কেমন চলে দেখুন', 'wifi-off')}
          </ul></section>

        <section>${sectionTitle('Security', 'নিরাপত্তা')}
          <ul class="mt-2 rounded-lg border border-rule bg-card divide-y divide-rule">
            ${row('id="change-pw"', 'key-round', 'Change password', 'পাসওয়ার্ড বদলান')}
            ${row('id="change-number"', 'smartphone', 'Change mobile number', 'মোবাইল নম্বর বদলান', `<span class="ml-auto text-sm text-ink-3 num">${dn(profile.mobile)}</span><i data-lucide="chevron-right" class="w-4 h-4 text-ink-3"></i>`)}
          </ul>
          <h3 class="mt-4 text-sm font-semibold text-ink-2">${t('Signed in on', 'যেখানে লগইন করা')}</h3>
          <ul class="mt-2 rounded-lg border border-rule bg-card divide-y divide-rule" id="devices">
            ${devices.map((d, i) => `<li class="flex items-center gap-3 px-4 py-3"><i data-lucide="${d.icon}" class="w-5 h-5 text-ink-2 shrink-0"></i><span class="flex-1 min-w-0"><span class="block text-[15px] font-semibold">${t(d.en, d.bn)}</span><span class="block text-sm ${d.current ? 'text-tulsi' : 'text-ink-3'}">${t(d.whenEn, d.whenBn)}</span></span>${d.current ? '' : `<button type="button" class="btn btn-ghost btn-sm text-sindoor-deep" data-signout-dev="${i}">${t('Sign out', 'লগআউট')}</button>`}</li>`).join('')}
          </ul></section>

        <section>${sectionTitle('Your data', 'আপনার তথ্য')}
          <ul class="mt-2 rounded-lg border border-rule bg-card divide-y divide-rule">
            ${row('id="dl-data"', 'file-down', 'Download my data', 'আমার তথ্য ডাউনলোড')}
            ${row('href="index.html#privacy"', 'shield-check', 'Privacy policy', 'গোপনীয়তা নীতি')}
            ${row('id="leave"', 'user-x', 'Leave the club', 'ক্লাব ছেড়ে দিন')}
          </ul></section>

        <button type="button" class="btn btn-line w-full h-12" id="signout"><i data-lucide="log-out"></i>${t('Sign out', 'লগআউট')}</button>
        <p class="text-center text-[13px] text-ink-3">${t('Gede Maitree Club member app · v0.2 prototype', 'গেদে মৈত্রী ক্লাব সদস্য অ্যাপ · v0.2 প্রোটোটাইপ')}<br />${t('Regd. No. S-0027153 / 2022-23 · Est. 2014', 'নিবন্ধন নং S-0027153 / 2022-23 · প্রতিষ্ঠা ২০১৪')}</p>
      </div>
    </div>`);
  $$('[data-set-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.langBtn)));
  ['push', 'whatsapp', 'sms'].forEach((k) => $(`#ch-${k}`).addEventListener('change', (e) => {
    const on = Object.entries(prefs.channels).filter(([c, v]) => (c === k ? e.target.checked : v)).length;
    if (!on) { e.target.checked = true; return ok('Keep at least one way for the club to reach you.', 'ক্লাব যাতে যোগাযোগ করতে পারে, অন্তত একটি মাধ্যম রাখুন।', 'info'); }
    prefs.channels[k] = e.target.checked; ok('Saved', 'সেভ হয়েছে');
  }));
  prefs.topics.forEach((p) => $(`#tp-${p[0]}`).addEventListener('change', (e) => { p[5] = e.target.checked; ok('Saved', 'সেভ হয়েছে'); }));
  $('#test-notif').addEventListener('click', () => toast(`<i data-lucide="bell-ring" class="w-5 h-5 shrink-0"></i><span>${t('Gede Maitree Club: notifications are working.', 'গেদে মৈত্রী ক্লাব: নোটিফিকেশন চলছে।')}</span>`));
  $('#sim-offline').addEventListener('change', (e) => { store.simulatedOffline = e.target.checked; syncOffline(true); });
  $('#change-pw').addEventListener('click', openChangePassword);
  $('#change-number').addEventListener('click', openChangeNumber);
  $$('[data-signout-dev]').forEach((b) => b.addEventListener('click', () => { devices.splice(Number(b.dataset.signoutDev), 1); renderSettings(); ok('Signed out of that device', 'ওই ডিভাইস থেকে লগআউট হয়েছে', 'log-out'); }));
  $('#dl-data').addEventListener('click', () => {
    const data = { exported: TODAY, household: profile.family, profile: { ...profile, photoUrl: undefined, aadhaar: `XXXX-XXXX-${profile.aadhaar4}` }, members: household.map(({ name, rel, dob, blood, id }) => ({ id, name, rel, dob, blood })), receipts };
    delete data.profile.aadhaar4;
    downloadText(`${profile.family}-my-data.json`, JSON.stringify(data, null, 2), 'application/json');
    ok('Your data file is saved', 'আপনার তথ্যের ফাইল সেভ হয়েছে', 'file-down');
  });
  $('#leave').addEventListener('click', () => confirmSheet({
    en: 'Leave Gede Maitree Club?', bn: 'গেদে মৈত্রী ক্লাব ছেড়ে দেবেন?', subEn: 'This sends a request to the secretary, who will call you first. Receipts stay in the club’s books as the law requires; everything else is deleted.', subBn: 'সম্পাদকের কাছে অনুরোধ যাবে, উনি আগে ফোন করবেন। আইন অনুযায়ী রসিদ ক্লাবের খাতায় থাকবে; বাকি সব মুছে ফেলা হবে।', yesEn: 'Send request', yesBn: 'অনুরোধ পাঠান', danger: true,
    onYes: (b) => { if (!needOnline()) return; paint(b, donePanel({ icon: 'send', tone: 'wait', en: 'Request sent', bn: 'অনুরোধ পাঠানো হয়েছে', subEn: 'Rajib Banerjee will call you within a week. You can keep using the app until then.', subBn: 'রাজীব ব্যানার্জি এক সপ্তাহের মধ্যে ফোন করবেন। ততদিন অ্যাপ ব্যবহার করতে পারবেন।' })); },
  }));
  $('#signout').addEventListener('click', signOut);
}

const signOut = () => confirmSheet({ en: 'Sign out?', bn: 'লগআউট করবেন?', subEn: 'Your cards won’t open offline on this device until you sign in again.', subBn: 'আবার লগইন না করা পর্যন্ত এই ডিভাইসে অফলাইনে কার্ড খুলবে না।', yesEn: 'Sign out', yesBn: 'লগআউট', onYes: () => { location.href = 'login.html'; } });

/* ---------- Notifications ---------- */
function renderAlerts() {
  const fresh = alerts.filter((a) => a.unread);
  const old = alerts.filter((a) => !a.unread);
  const item = (a, i) => `<li><a href="${a.href}" data-alert="${alerts.indexOf(a)}" class="flex gap-3 px-4 py-3.5 hover:bg-paper-2/50">
    <span class="w-10 h-10 rounded-full ${a.unread ? 'bg-ink text-white' : 'bg-paper-2 text-ink'} grid place-items-center shrink-0"><i data-lucide="${a.icon}" class="w-[18px] h-[18px]"></i></span>
    <span class="flex-1 min-w-0"><span class="block text-[15px] ${a.unread ? 'font-semibold' : ''}">${t(a.en, a.bn)}</span><span class="block text-sm text-ink-3">${a.date === TODAY ? t('Today', 'আজ') : fdate(a.date, { year: a.date.slice(0, 4) !== TODAY.slice(0, 4) })}</span></span>
    ${a.unread ? `<span class="w-2.5 h-2.5 rounded-full bg-sindoor mt-2 shrink-0"><span class="sr-only">${t('Unread', 'না-পড়া')}</span></span>` : ''}
  </a></li>`;
  paint('#s-alerts', `
    ${pageHead({ en: 'Notifications', bn: 'নোটিফিকেশন', actions: `${fresh.length ? `<button type="button" class="btn btn-line btn-sm" id="mark-read"><i data-lucide="check-check"></i>${t('Mark all read', 'সব পড়া হয়েছে')}</button>` : ''}<a href="#settings" class="btn btn-ghost btn-sm"><i data-lucide="sliders-horizontal"></i>${t('Settings', 'সেটিংস')}</a>` })}
    <div class="mt-5 max-w-3xl space-y-5">
      ${fresh.length ? `<section>${sectionTitle('New', 'নতুন')}<ul class="mt-2 rounded-lg border border-rule bg-card divide-y divide-rule overflow-hidden">${fresh.map(item).join('')}</ul></section>`
        : `<div class="rounded-lg bg-tulsi-wash text-tulsi px-4 py-3 flex items-center gap-2 font-semibold"><i data-lucide="check-check" class="w-5 h-5"></i>${t('You’re all caught up', 'সব পড়া হয়ে গেছে')}</div>`}
      ${old.length ? `<section>${sectionTitle('Earlier', 'আগের')}<ul class="mt-2 rounded-lg border border-rule bg-card divide-y divide-rule overflow-hidden">${old.map(item).join('')}</ul></section>` : ''}
      ${!alerts.length ? empty({ icon: 'bell-off', en: 'No notifications', bn: 'কোনো নোটিফিকেশন নেই' }) : ''}
    </div>`);
  $('#mark-read')?.addEventListener('click', () => { alerts.forEach((a) => (a.unread = false)); notify(); renderAlerts(); });
  $$('[data-alert]').forEach((a) => a.addEventListener('click', () => { alerts[a.dataset.alert].unread = false; notify(); }));
}

/* ---------- More (phone) ---------- */
function renderMore() {
  const groups = [
    [['Money', 'টাকা'], [['statement', 'scroll-text', 'Statement', 'হিসাব বিবরণী'], ['receipts', 'receipt-text', 'Receipts', 'রসিদ']]],
    [['Club', 'ক্লাব'], [['notices', 'megaphone', 'Notices', 'নোটিস'], ['polls', 'vote', 'AGM & polls', 'সাধারণ সভা ও ভোট'], ['docs', 'folder-open', 'Documents', 'ডকুমেন্টস']]],
    [['Services', 'পরিষেবা'], [['catering', 'utensils-crossed', 'Maitree Serving', 'মৈত্রী পরিবেশন'], ['nursery', 'sprout', 'Nursery', 'নার্সারি']]],
    [['Account', 'অ্যাকাউন্ট'], [['alerts', 'bell', 'Notifications', 'নোটিফিকেশন'], ['help', 'life-buoy', 'Help & contact', 'সাহায্য ও যোগাযোগ'], ['settings', 'settings', 'Settings', 'সেটিংস']]],
  ];
  const unread = alerts.filter((a) => a.unread).length;
  paint('#s-more', `
    <a href="#profile" class="flex items-center gap-4 rounded-lg border border-rule bg-card p-4 hover:border-ink/30">
      ${avatar(household[0], 'w-14 h-14 text-2xl', 'bg-sindoor text-white')}
      <span class="min-w-0 flex-1"><span class="block font-display text-xl leading-tight">${t(profile.name, profile.nameBn)}</span><span class="block text-sm text-ink-2"><span class="num">${profile.family}</span> · ${t('Family & profile', 'পরিবার ও প্রোফাইল')}</span></span>
      <i data-lucide="chevron-right" class="w-5 h-5 text-ink-3"></i>
    </a>
    ${groups.map(([g, items]) => `<section class="mt-6">${sectionTitle(...g)}
      <ul class="mt-2 rounded-lg border border-rule bg-card divide-y divide-rule overflow-hidden">${items.map(([k, icon, en, bn]) => `<li><a href="#${k}" class="flex items-center gap-3 px-4 h-14 text-[15px] hover:bg-paper-2/50"><i data-lucide="${icon}" class="w-5 h-5 text-ink-2"></i><span class="font-medium">${t(en, bn)}</span>${k === 'alerts' && unread ? `<span class="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-sindoor text-white text-[11.5px] font-bold grid place-items-center num">${dn(unread)}</span>` : k === 'polls' && !store.ballot ? `<span class="ml-auto">${statusChip('wait', 'Vote open', 'ভোট চলছে')}</span>` : ''}<i data-lucide="chevron-right" class="${(k === 'alerts' && unread) || (k === 'polls' && !store.ballot) ? '' : 'ml-auto'} w-4 h-4 text-ink-3"></i></a></li>`).join('')}</ul></section>`).join('')}
    <button type="button" class="btn btn-line w-full h-12 mt-6" id="more-signout"><i data-lucide="log-out"></i>${t('Sign out', 'লগআউট')}</button>
    <p class="mt-4 text-center text-[13px] text-ink-3">${t('Regd. No. S-0027153 / 2022-23 · Est. 2014', 'নিবন্ধন নং S-0027153 / 2022-23 · প্রতিষ্ঠা ২০১৪')}</p>`);
  $('#more-signout').addEventListener('click', signOut);
}

/* ---------- Install prompt ---------- */
export function initInstall() {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; });
  window.addEventListener('appinstalled', () => { store.installDismissed = true; ok('Installed. Open Maitree Club from your home screen.', 'ইনস্টল হয়েছে। হোম স্ক্রিন থেকে মৈত্রী ক্লাব খুলুন।'); rerender(); });
  document.addEventListener('click', async (e) => {
    if (!e.target.closest('[data-install]')) return;
    if (deferredInstall) { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; return; }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const steps = [
      ['smartphone', 'Android (Chrome)', 'অ্যান্ড্রয়েড (ক্রোম)', 'Tap the ⋮ menu, then “Install app” or “Add to Home screen”.', '⋮ মেনুতে চাপ দিন, তারপর “Install app” বা “Add to Home screen”।'],
      ['tablet-smartphone', 'iPhone (Safari)', 'আইফোন (সাফারি)', 'Tap Share, then “Add to Home Screen”.', 'শেয়ার বোতামে চাপ দিন, তারপর “Add to Home Screen”।'],
      ['laptop', 'Laptop (Chrome or Edge)', 'ল্যাপটপ (ক্রোম বা এজ)', 'Click the install icon at the right end of the address bar.', 'অ্যাড্রেস বারের ডান দিকের ইনস্টল আইকনে ক্লিক করুন।'],
    ];
    if (ios) steps.unshift(steps.splice(1, 1)[0]);
    openSheet(`
      ${sheetHead('Install the club app', 'ক্লাবের অ্যাপ ইনস্টল করুন', 'No app store needed. It takes a few seconds and uses almost no space.', 'অ্যাপ স্টোর লাগবে না। কয়েক সেকেন্ড লাগে, জায়গাও প্রায় লাগে না।')}
      <ol class="mt-5 space-y-3">${steps.map(([icon, en, bn, sEn, sBn]) => `<li class="flex gap-3 rounded-lg border border-rule p-4"><i data-lucide="${icon}" class="w-6 h-6 shrink-0"></i><span><span class="block font-semibold">${t(en, bn)}</span><span class="block text-[15px] text-ink-2">${t(sEn, sBn)}</span></span></li>`).join('')}</ol>
      <p class="mt-4 text-sm text-ink-3">${t('Prototype: the real app ships with an install manifest, so your browser offers this automatically.', 'প্রোটোটাইপ: আসল অ্যাপে ইনস্টল ম্যানিফেস্ট থাকবে, ব্রাউজার নিজেই এটা দেখাবে।')}</p>
      <button type="button" class="btn btn-ink w-full h-12 mt-5" data-close>${t('Got it', 'বুঝেছি')}</button>`);
  });
}

/* ---------- Offline ---------- */
function syncOffline(announce = false) {
  const was = store.offline;
  store.offline = !navigator.onLine || store.simulatedOffline;
  $('#offline-bar').classList.toggle('hidden', !store.offline);
  if (announce && was !== store.offline) {
    toast(store.offline
      ? `<i data-lucide="wifi-off" class="w-5 h-5 shrink-0"></i><span>${t('You’re offline', 'আপনি অফলাইন')}</span>`
      : `<i data-lucide="wifi" class="w-5 h-5 shrink-0"></i><span>${t('Back online', 'আবার অনলাইন')}</span>`);
  }
}
export function initOffline() {
  window.addEventListener('online', () => syncOffline(true));
  window.addEventListener('offline', () => syncOffline(true));
  syncOffline();
}

export const screens = { profile: renderProfile, settings: renderSettings, alerts: renderAlerts, more: renderMore };
