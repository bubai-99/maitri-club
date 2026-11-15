import { t, seal, qr, lang } from './shared.js';

/*
  Member ID card, CR80 (85.6 × 54 mm). Everything inside is sized in container-query
  units (cqw) so the same markup works in the app, the console preview and on paper.
*/

const FIRST = {
  m: ['Sourav', 'Arjun', 'Rohit', 'Amit', 'Sayan', 'Partha', 'Ishaan', 'Rana'],
  f: ['Rupa', 'Mousumi', 'Priya', 'Ankita', 'Sreya', 'Tania', 'Riya', 'Puja'],
};
const FIRST_BN = {
  Sourav: 'সৌরভ', Arjun: 'অর্জুন', Rohit: 'রোহিত', Amit: 'অমিত', Sayan: 'সায়ন', Partha: 'পার্থ', Ishaan: 'ঈশান', Rana: 'রানা',
  Rupa: 'রূপা', Mousumi: 'মৌসুমী', Priya: 'প্রিয়া', Ankita: 'অঙ্কিতা', Sreya: 'শ্রেয়া', Tania: 'তানিয়া', Riya: 'রিয়া', Puja: 'পূজা',
};
const BLOOD = ['B+', 'O+', 'A+', 'AB+', 'B+', 'O-', 'A-', 'B-'];
const REL = [['Spouse', 'স্বামী/স্ত্রী'], ['Son', 'ছেলে'], ['Daughter', 'মেয়ে'], ['Mother', 'মা'], ['Father', 'বাবা'], ['Son', 'ছেলে']];

/** Everyone on a family's register, with a personal member ID (family no. + person no.). */
export function peopleOf(f, i = 0) {
  const surname = f.head.split(' ').pop();
  const surnameBn = f.headBn.split(' ').pop();
  const known = f.no === 'MC-0104'
    ? [['Sourav', 'Spouse', 'স্বামী', 'O+'], ['Ishaan', 'Son, 12', 'ছেলে, ১২', 'B+']]
    : null;
  const people = [{ name: f.head, nameBn: f.headBn, rel: 'Head of family', relBn: 'পরিবারের প্রধান', blood: BLOOD[i % 8] }];
  for (let k = 1; k < f.size; k++) {
    if (known && known[k - 1]) {
      const [fn, rel, relBn, blood] = known[k - 1];
      people.push({ name: `${fn} ${surname}`, nameBn: `${FIRST_BN[fn]} ${surnameBn}`, rel, relBn, blood });
      continue;
    }
    const [rel, relBn] = REL[(k - 1 + i) % REL.length];
    const pool = rel === 'Daughter' || rel === 'Mother' || (rel === 'Spouse' && (i + k) % 2) ? FIRST.f : FIRST.m;
    const fn = pool[(i * 3 + k) % pool.length];
    people.push({ name: `${fn} ${surname}`, nameBn: `${FIRST_BN[fn]} ${surnameBn}`, rel, relBn, blood: BLOOD[(i + k) % 8] });
  }
  return people.map((p, k) => ({
    ...p,
    id: `${f.no}-${String(k + 1).padStart(2, '0')}`,
    family: f.no,
    lane: f.lane, laneBn: f.laneBn,
    since: f.since,
    valid: 'Mar 2027', validBn: 'মার্চ ২০২৭',
    photo: (i * 7 + k) % 13 !== 5, // a few people still have no photo on file
    token: `MAITRI:${f.no}-${String(k + 1).padStart(2, '0')}:${((i + 7) * (k + 3) * 2654435761 >>> 0).toString(16).slice(0, 8)}`,
  }));
}

const initials = (p) => (lang === 'bn' ? p.nameBn : p.name).split(' ').map((w) => w[0]).join('').slice(0, 2);

/** Card front. Wrap in an element with an explicit width; height follows the CR80 ratio. */
export function cardFront(p) {
  return `
  <div class="idc" role="img" aria-label="Member card front for ${p.name}, ${p.id}">
    <div class="idc-band">
      <span class="idc-seal">${seal({ size: 100, color: '#fff', rotate: -6 })}</span>
      <span class="idc-club"><span class="font-display">${t('Gede Maitree Club', 'গেদে মৈত্রী ক্লাব')}</span><span class="idc-sub">GEDE MAITREE CLUB · NETAJI PARA · ESTD 1972</span></span>
      <span class="idc-kind">MEMBER</span>
    </div>
    <div class="idc-body">
      <div class="idc-photo">${p.photo
        ? `<span class="idc-initials">${initials(p)}</span>`
        : `<span class="idc-nophoto">${t('Photo', 'ছবি')}<br>${t('needed', 'লাগবে')}</span>`}</div>
      <div class="idc-info">
        <p class="idc-name">${t(p.name, p.nameBn)}</p>
        <p class="idc-rel">${t(p.rel, p.relBn)}</p>
        <dl class="idc-grid">
          <div><dt>${t('Member ID', 'সদস্য নং')}</dt><dd class="num">${p.id}</dd></div>
          <div><dt>${t('Blood', 'রক্ত')}</dt><dd class="num">${p.blood}</dd></div>
          <div><dt>${t('Family', 'পরিবার')}</dt><dd class="num">${p.family}</dd></div>
          <div><dt>${t('Valid to', 'মেয়াদ')}</dt><dd>${t(p.valid, p.validBn)}</dd></div>
        </dl>
      </div>
    </div>
  </div>`;
}

export function cardBack(p) {
  return `
  <div class="idc idc-back" role="img" aria-label="Member card back for ${p.name}">
    <div class="idc-back-body">
      <div class="idc-qr" data-qr="${p.token}"></div>
      <div class="idc-terms">
        <p class="idc-terms-h">${t('Show this card at the gate', 'গেটে এই কার্ড দেখান')}</p>
        <p>${t('For club events and member prices at the nursery and kitchen. Not transferable.', 'ক্লাবের অনুষ্ঠান এবং নার্সারি ও রান্নাঘরে সদস্য মূল্যের জন্য। হস্তান্তরযোগ্য নয়।')}</p>
        <p class="idc-found">${t('If found, please return to', 'কুড়িয়ে পেলে ফেরত দিন')}: 14/2 Netaji Subhas Road, Kolkata 700 084 · +91 98300 12345</p>
        <div class="idc-sign"><span class="idc-signature">R. Banerjee</span><span class="idc-sign-l">${t('Secretary', 'সম্পাদক')}</span></div>
      </div>
    </div>
    <div class="idc-strip num">${p.id}</div>
  </div>`;
}

/** Render every pending QR inside root (async; safe to call repeatedly). */
export function fillQrs(root = document) {
  root.querySelectorAll('[data-qr]').forEach((el) => {
    if (el.dataset.done === el.dataset.qr) return;
    el.dataset.done = el.dataset.qr;
    qr(el, el.dataset.qr, { margin: 0 });
  });
}

/* ---------- Print & download ---------- */
const waitQrs = (root) => new Promise((res) => {
  const tick = () => ([...root.querySelectorAll('[data-qr]')].every((q) => q.querySelector('svg')) ? res() : setTimeout(tick, 30));
  tick();
});

/** Print cards at true size on A4: each row is front + back, ready to cut, fold and laminate. */
export async function printCards(people) {
  let sheet = document.getElementById('print-sheet');
  if (!sheet) { sheet = document.createElement('div'); sheet.id = 'print-sheet'; document.body.append(sheet); }
  sheet.innerHTML = people.map((p) => `<div class="print-row"><div class="idc-wrap">${cardFront(p)}</div><div class="idc-wrap">${cardBack(p)}</div></div>`).join('');
  fillQrs(sheet);
  await Promise.all([waitQrs(sheet), document.fonts.ready]);
  window.print();
}

/** Download one person's card (front above back) as a 300-dpi PNG. */
export async function downloadCard(p) {
  const { toPng } = await import('html-to-image');
  const stage = document.createElement('div');
  stage.style.cssText = 'position:fixed;left:-10000px;top:0;width:1011px;background:#fff;padding:40px;display:flex;flex-direction:column;gap:40px;';
  stage.innerHTML = `<div class="idc-wrap">${cardFront(p)}</div><div class="idc-wrap">${cardBack(p)}</div>`;
  document.body.append(stage);
  fillQrs(stage);
  await Promise.all([waitQrs(stage), document.fonts.ready]);
  try {
    const url = await toPng(stage, { pixelRatio: 1, cacheBust: true, backgroundColor: '#ffffff', style: { position: 'static', left: '0', top: '0' } });
    const a = document.createElement('a');
    a.href = url; a.download = `${p.id}-gede-maitree-club-card.png`; a.click();
  } finally { stage.remove(); }
}
