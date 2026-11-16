/* Get involved: open volunteer places for the coming events, year-round roles, and a sign-up form.
   Open places come from the same duty lists the committee fills in the console. */
import { t, dn, applyLang, refreshIcons, lang, demo } from './shared.js';
import { events, duties, volunteerSkills, chanda, committee } from './data.js';
import { validate, enhanceForm, confirmPanel, ref, bnNum, daysUntil } from './site-ui.js';

const $ = (s) => document.querySelector(s);

/* Roles that run all year, not tied to one event day. */
export const yearRoles = [
  { icon: 'hand-coins', skill: 'chanda', en: 'Lane chanda volunteer', bn: 'গলির চাঁদা স্বেচ্ছাসেবক',
    when: 'Sept to Oct, a few evenings', whenBn: 'সেপ্টেম্বর–অক্টোবর, কয়েক সন্ধ্যা',
    what: 'Visit the houses in your own lane before Durga Puja and give app receipts for chanda.', whatBn: 'দুর্গাপূজার আগে নিজের গলির বাড়িগুলোতে গিয়ে চাঁদা নেওয়া ও অ্যাপে রসিদ দেওয়া।' },
  { icon: 'utensils', skill: 'serving', en: 'Maitree Serving team', bn: 'মৈত্রী পরিবেশন দল',
    when: 'Weddings and occasions, booked ahead', whenBn: 'বিয়ে ও অনুষ্ঠান, আগে থেকে ঠিক করা',
    what: 'Set up, serve and clear at the para’s family occasions. You choose which dates you can do.', whatBn: 'পাড়ার পারিবারিক অনুষ্ঠানে সাজানো, পরিবেশন ও গোছানো। কোন দিন পারবেন আপনি ঠিক করবেন।' },
  { icon: 'sprout', skill: 'nursery', en: 'Nursery helper', bn: 'নার্সারি সহায়ক',
    when: 'Weekend mornings', whenBn: 'সপ্তাহান্তের সকাল',
    what: 'Water the plants, help buyers choose and pack orders at the club gate.', whatBn: 'গাছে জল দেওয়া, ক্রেতাকে বাছতে সাহায্য করা, ক্লাবের গেটে অর্ডার প্যাক করা।' },
  { icon: 'speaker', skill: 'sound', en: 'Sound & lights', bn: 'সাউন্ড ও আলো',
    when: 'Pujas and sports day', whenBn: 'পূজা ও ক্রীড়া দিবস',
    what: 'Run the mic, the speakers and the pandal lights. Someone will show you the panel.', whatBn: 'মাইক, স্পিকার ও প্যান্ডেলের আলো চালানো। প্যানেল কেউ দেখিয়ে দেবেন।' },
];

const skillName = (k) => (k === 'nursery' ? t('Nursery', 'নার্সারি') : t(volunteerSkills[k].en, volunteerSkills[k].bn));

/* Upcoming events that still have empty places, with each duty's gap. */
function openDuties() {
  return events
    .filter((e) => duties[e.id] && daysUntil(e.date) >= 0)
    .map((e) => ({ e, list: duties[e.id].map((d, i) => ({ ...d, i, left: Math.max(0, d.need - d.who.length) })) }))
    .filter(({ list }) => list.some((d) => d.left));
}

let picked = ''; // "eventId:index" chosen from an Open now card

export function renderVolunteer() {
  const box = $('#vol-open');
  if (!box) return;
  const open = openDuties();
  const totalLeft = open.reduce((n, { list }) => n + list.reduce((m, d) => m + d.left, 0), 0);
  $('#vol-open-count').innerHTML = t(`${totalLeft} places to fill`, `${bnNum(totalLeft)}টি জায়গা খালি`);
  box.innerHTML = open.map(({ e, list }) => {
    const d = daysUntil(e.date);
    return `<article class="card p-5 sm:p-6">
      <div class="flex items-start gap-4">
        <span class="w-14 shrink-0 rounded-xl bg-sindoor-wash text-sindoor-deep text-center py-2"><span class="block font-display text-[1.6rem] leading-none num">${dn(e.day)}</span><span class="block text-[12px] font-semibold uppercase mt-1">${t(e.mon, e.monBn)}</span></span>
        <div class="min-w-0 flex-1">
          <h3 class="font-display text-[1.45rem] leading-tight"><a href="#event/${e.id}" class="hover:text-sindoor">${t(e.title, e.titleBn)}</a></h3>
          <p class="text-[14px] text-ink-3 mt-1">${t(e.place, e.placeBn)} · <span class="num">${d === 0 ? t('today', 'আজ') : t(`in ${d} days`, `${bnNum(d)} দিন পরে`)}</span></p>
        </div>
      </div>
      <ul class="mt-4 divide-y divide-rule">
        ${list.map((x) => {
          const filled = x.need - x.left;
          return `<li class="py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div class="min-w-0 flex-1 basis-[12rem]">
              <p class="font-semibold leading-snug">${t(x.duty, x.dutyBn)}</p>
              <p class="text-[13.5px] text-ink-3 num">${dn(x.time)} · ${skillName(x.skill)}</p>
            </div>
            <div class="w-28 shrink-0">
              <div class="h-1.5 rounded-full bg-paper-2 overflow-hidden" aria-hidden="true"><div class="h-full rounded-full ${x.left ? 'bg-marigold' : 'bg-tulsi'}" style="width:${Math.round((filled / x.need) * 100)}%"></div></div>
              <p class="mt-1 text-[12.5px] ${x.left ? 'text-sindoor-deep font-semibold' : 'text-ink-3'} num">${x.left ? t(`${x.left} of ${x.need} open`, `${bnNum(x.need)}টির ${bnNum(x.left)}টি খালি`) : t('Full', 'পূর্ণ')}</p>
            </div>
            ${x.left ? `<button type="button" class="btn btn-line btn-sm shrink-0" data-take="${e.id}:${x.i}"><span>${t('I’ll do this', 'আমি করব')}</span></button>` : '<span class="w-[92px] shrink-0"></span>'}
          </li>`;
        }).join('')}
      </ul>
    </article>`;
  }).join('') || `<p class="card p-6 text-ink-2">${t('Every place for the coming events is filled. Sign up below and we’ll call you for the next one.', 'আসন্ন অনুষ্ঠানের সব জায়গা পূর্ণ। নিচে নাম লেখান, পরের বার ফোন করব।')}</p>`;

  $('#vol-roles').innerHTML = yearRoles.map((r) => `
    <li class="rounded-2xl bg-paper-2 p-5 flex flex-col">
      <i data-lucide="${r.icon}" class="w-6 h-6 text-sindoor"></i>
      <h3 class="mt-3 font-semibold text-[17px] leading-snug">${t(r.en, r.bn)}</h3>
      <p class="mt-1 text-[13.5px] font-semibold text-ink-3">${t(r.when, r.whenBn)}</p>
      <p class="mt-2 text-[15px] text-ink-2 flex-1">${t(r.what, r.whatBn)}</p>
      <button type="button" class="mt-4 self-start text-[14.5px] font-semibold text-sindoor hover:underline inline-flex items-center gap-1" data-role-skill="${r.skill}"><span>${t('Sign up for this', 'এতে নাম লেখান')}</span><i data-lucide="arrow-right" class="w-4 h-4"></i></button>
    </li>`).join('');

  // Form options follow the language
  const lane = $('#vol-lane'); const laneNow = lane.value;
  lane.innerHTML = `<option value="">${lang === 'bn' ? 'বাছুন' : 'Choose'}</option>${chanda.areas.map((a) => `<option value="${a.lane}">${lang === 'bn' ? a.laneBn : a.lane}</option>`).join('')}<option value="other">${lang === 'bn' ? 'পাড়ার বাইরে' : 'Outside the para'}</option>`;
  lane.value = laneNow;
  const sk = $('#vol-skills'); const on = new Set([...sk.querySelectorAll('input:checked')].map((i) => i.value));
  sk.innerHTML = [...Object.keys(volunteerSkills), 'nursery'].map((k) => `<label class="cursor-pointer"><input type="checkbox" name="skills" value="${k}" class="peer sr-only" ${on.has(k) ? 'checked' : ''} /><span class="inline-flex items-center h-9 px-3.5 rounded-full border border-rule text-[14.5px] peer-checked:bg-ink peer-checked:text-white peer-checked:border-ink peer-focus-visible:outline-2 peer-focus-visible:outline-sindoor">${skillName(k)}</span></label>`).join('');
  const sel = $('#vol-duty');
  sel.innerHTML = `<option value="">${lang === 'bn' ? 'যে কোনো, ফোন করে ঠিক করুন' : 'Any, call me and we’ll decide'}</option>${open.map(({ e, list }) => `<optgroup label="${lang === 'bn' ? e.titleBn : e.title}">${list.filter((x) => x.left).map((x) => `<option value="${e.id}:${x.i}">${lang === 'bn' ? x.dutyBn : x.duty} · ${lang === 'bn' ? bnNum(x.time) : x.time}</option>`).join('')}</optgroup>`).join('')}`;
  sel.value = picked;

  box.querySelectorAll('[data-take]').forEach((b) => b.addEventListener('click', () => {
    picked = b.dataset.take; sel.value = picked;
    const [eid, i] = picked.split(':');
    const want = duties[eid][Number(i)].skill;
    const cb = sk.querySelector(`input[value="${want}"]`); if (cb) cb.checked = true;
    goToForm();
  }));
  $('#vol-roles').querySelectorAll('[data-role-skill]').forEach((b) => b.addEventListener('click', () => {
    const cb = sk.querySelector(`input[value="${b.dataset.roleSkill}"]`); if (cb) cb.checked = true;
    goToForm();
  }));
  applyLang(box.closest('[data-screen]')); refreshIcons();
}

function goToForm() {
  const f = $('#vol-form');
  f.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  setTimeout(() => f.querySelector('input[name="name"]').focus({ preventScroll: true }), 400);
}

export function initVolunteerForm() {
  const form = $('#vol-form');
  if (!form) return;
  enhanceForm(form);
  $('#vol-duty').addEventListener('change', (e) => { picked = e.target.value; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const skillsBox = $('#vol-skills');
    const none = !skillsBox.querySelector('input:checked');
    $('#vol-skills-err').classList.toggle('hidden', !none);
    if (!validate(form) || none) { if (none && form.querySelectorAll('[aria-invalid="true"]').length === 0) skillsBox.scrollIntoView({ block: 'center' }); return; }
    const fd = new FormData(form);
    const [eid, i] = (fd.get('duty') || '').split(':');
    const d = eid ? duties[eid][Number(i)] : null;
    const ev = eid ? events.find((x) => x.id === eid) : null;
    const lead = committee.find((c) => c.role === 'Secretary') || committee[0];
    demo.set({ volunteer: { name: fd.get('name'), phone: String(fd.get('phone')).replace(/\D/g, '').slice(-10), lane: fd.get('lane'), skills: fd.getAll('skills'), duty: fd.get('duty') || null, free: fd.get('free') } });
    confirmPanel(form, 'Thank you for signing up', 'নাম লেখানোর জন্য ধন্যবাদ', [
      d ? [`You’re down for ${d.duty} at ${ev.title}, ${ev.day} ${ev.mon}, ${d.time}.`, `${ev.titleBn}-এ ${d.dutyBn}, ${bnNum(ev.day)} ${ev.monBn}, ${bnNum(d.time)}। আপনার নাম লেখা হলো।`]
        : ['Your name is on the volunteer list.', 'স্বেচ্ছাসেবকের তালিকায় আপনার নাম উঠেছে।'],
      [`${lead.name} will call or WhatsApp you within two days to settle the details.`, `দুই দিনের মধ্যে ${lead.nameBn} ফোন বা হোয়াটসঅ্যাপে কথা বলে ঠিক করবেন।`],
      ['You’ll get a reminder the day before your duty.', 'কাজের আগের দিন মনে করিয়ে দেওয়া হবে।'],
    ], ['Sign up someone else', 'আরেকজনের নাম লেখান'], { refNo: ref('VOL'), onReset: () => { picked = ''; form.reset(); renderVolunteer(); } });
  });
}
