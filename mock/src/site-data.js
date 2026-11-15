// Website-only content: event details, public notices, chanda, documents, contact topics, search index.
// Sample text. Names, amounts and places are placeholders until the club confirms them.
import { notices as appNotices, events, chanda, committee } from './data.js';

/* ---------- Event details (keyed by events[].id in data.js) ---------- */
export const eventInfo = {
  blood: {
    photo: 'blood', timeBn: 'সকাল ৯টা – দুপুর ২টা', who: 'open', contact: 'Secretary',
    about: 'Our yearly camp with the district hospital blood bank. Anyone aged 18 to 65 who weighs over 45 kg can give. It takes about 40 minutes, and every donor gets a donor card and refreshments.',
    aboutBn: 'জেলা হাসপাতালের ব্লাড ব্যাংকের সঙ্গে আমাদের বার্ষিক শিবির। ১৮ থেকে ৬৫ বছর বয়সী, ৪৫ কেজির বেশি ওজনের যে কেউ রক্ত দিতে পারেন। প্রায় ৪০ মিনিট লাগে। প্রত্যেক দাতা ডোনার কার্ড ও জলখাবার পাবেন।',
    schedule: [['9:00 am', '৯:০০', 'Registration opens', 'নাম লেখানো শুরু'], ['9:30 am', '৯:৩০', 'Doctor’s check-up and donation', 'ডাক্তারি পরীক্ষা ও রক্তদান'], ['1:30 pm', '১:৩০', 'Last registration', 'শেষ নাম লেখানো'], ['2:00 pm', '২:০০', 'Camp closes', 'শিবির শেষ']],
    bring: [['A photo ID', 'একটি ছবিসহ পরিচয়পত্র'], ['A light breakfast before you come', 'আসার আগে হালকা জলখাবার'], ['A list of any medicines you take', 'যে ওষুধ খান তার তালিকা']],
  },
  sports: {
    photo: 'race', timeBn: 'সকাল ৭টা থেকে', who: 'pass', contact: 'Sports secretary',
    about: 'A full day of races and games on the para ground for children, adults and seniors. Entries close on 7 December in the member app. Non-members are welcome to watch from the boundary.',
    aboutBn: 'পাড়ার মাঠে সারা দিন ছোট, বড় ও প্রবীণদের দৌড় আর খেলা। ৭ ডিসেম্বর পর্যন্ত সদস্য অ্যাপে নাম দেওয়া যাবে। সদস্য না হলেও মাঠের ধারে বসে দেখতে পারেন।',
    schedule: [['7:00 am', '৭:০০', 'Flag and march past', 'পতাকা উত্তোলন ও কুচকাওয়াজ'], ['7:30 am', '৭:৩০', 'Under-8 and under-12 races', 'অনূর্ধ্ব-৮ ও অনূর্ধ্ব-১২ দৌড়'], ['10:00 am', '১০:০০', 'Sack race, lemon-and-spoon', 'বস্তা দৌড়, চামচে লেবু'], ['12:00 pm', '১২:০০', 'Tug of war, adults', 'দড়ি টানাটানি, বড়দের'], ['1:30 pm', '১:৩০', 'Lunch and prizes', 'দুপুরের খাওয়া ও পুরস্কার']],
    bring: [['Your member pass (in the app)', 'সদস্য পাস (অ্যাপে)'], ['Sports shoes', 'খেলার জুতো'], ['A water bottle and a cap', 'জলের বোতল ও টুপি']],
  },
  picnic: {
    photo: 'runners', timeBn: 'বাস ছাড়বে সকাল ৬:৩০', who: 'pass', contact: 'Secretary',
    about: 'The members’ winter picnic by the river at Gadiara. The bus leaves from the club gate and is back by 8 pm. Seats are limited, so book your family’s passes in the app by 20 December.',
    aboutBn: 'গাদিয়াড়ায় নদীর ধারে সদস্যদের শীতের পিকনিক। বাস ছাড়বে ক্লাবের গেট থেকে, ফিরবে রাত ৮টার মধ্যে। আসন সীমিত, তাই ২০ ডিসেম্বরের মধ্যে অ্যাপে পরিবারের পাস নিন।',
    schedule: [['6:30 am', '৬:৩০', 'Bus leaves the club gate', 'ক্লাবের গেট থেকে বাস ছাড়বে'], ['10:00 am', '১০:০০', 'Reach Gadiara, breakfast', 'গাদিয়াড়া পৌঁছে জলখাবার'], ['1:30 pm', '১:৩০', 'Lunch', 'দুপুরের খাওয়া'], ['4:00 pm', '৪:০০', 'Bus leaves for home', 'বাড়ির পথে বাস'], ['8:00 pm', '৮:০০', 'Back at the club gate', 'ক্লাবের গেটে ফেরা']],
    bring: [['A pass for each person', 'প্রত্যেকের জন্য একটি পাস'], ['Warm clothes and a shawl', 'গরম জামা ও শাল'], ['Any medicines you need', 'দরকারি ওষুধ']],
  },
  saraswati: {
    photo: 'pujaMorning', timeBn: 'পুষ্পাঞ্জলি সকাল ৯:৩০', who: 'open', contact: 'Puja in-charge',
    about: 'Saraswati Puja at the club pandal, open to everyone. Bring books and pens for the blessing. Bhog at noon needs a member pass; the cultural evening is for all.',
    aboutBn: 'ক্লাব প্যান্ডেলে সরস্বতী পূজা, সবার জন্য খোলা। আশীর্বাদের জন্য বই-খাতা-কলম আনুন। দুপুরের ভোগে সদস্য পাস লাগবে, সাংস্কৃতিক সন্ধ্যা সবার জন্য।',
    schedule: [['9:30 am', '৯:৩০', 'Pushpanjali', 'পুষ্পাঞ্জলি'], ['12:30 pm', '১২:৩০', 'Bhog (member pass)', 'ভোগ (সদস্য পাস)'], ['4:00 pm', '৪:০০', 'Hate khori for little ones', 'ছোটদের হাতেখড়ি'], ['7:00 pm', '৭:০০', 'Cultural evening', 'সাংস্কৃতিক সন্ধ্যা']],
    bring: [['Books and pens for the blessing', 'আশীর্বাদের জন্য বই ও কলম'], ['A member pass for bhog', 'ভোগের জন্য সদস্য পাস']],
    chanda: true,
  },
};

export const pastWhenBn = { 'Durga Puja 2026': '১৭–২১ অক্টোবর', 'Kali Puja & Bhai Phonta': '৮–১০ নভেম্বর' };
export const pastAlbum = { 'Durga Puja 2026': 'puja', 'Kali Puja & Bhai Phonta': 'kali' };

/* ---------- Who to ask (committee role → topics) ---------- */
export const askAbout = {
  President: ['Club direction, disputes, the AGM', 'ক্লাবের দিশা, বিবাদ, এজিএম'],
  Secretary: ['Membership, meetings, notices, privacy', 'সদস্যপদ, সভা, নোটিস, গোপনীয়তা'],
  Treasurer: ['Subscriptions, receipts, the accounts', 'চাঁদা, রসিদ, হিসাব'],
  'Puja in-charge': ['Pujas, chanda, bhog passes', 'পূজা, চাঁদা, ভোগের পাস'],
  'Catering in-charge': ['Serving quotes and bookings', 'পরিবেশনের কোটেশন ও বুকিং'],
  'Nursery in-charge': ['Plants, orders, stock', 'গাছ, অর্ডার, স্টক'],
  'Sports secretary': ['Sports day, coaching, the ground', 'ক্রীড়া দিবস, প্রশিক্ষণ, মাঠ'],
};
export const person = (role) => committee.find((c) => c.role === role) || committee[1];

/* ---------- Public notices ---------- */
const iso = { n1: '2026-11-12', n2: '2026-11-10', n3: '2026-11-06', n4: '2026-10-28' };
const more = {
  n1: { more: 'All members are welcome. The puja in-charge, Kakoli Sen, presents the draft budget of ₹85,000 and the lane-wise chanda plan. Volunteers for the pandal, bhog and the cultural evening will be listed.', moreBn: 'সব সদস্য আমন্ত্রিত। পূজা কমিটির কাকলি সেন ₹৮৫,০০০-এর খসড়া বাজেট আর গলি ধরে চাঁদা তোলার পরিকল্পনা পেশ করবেন। প্যান্ডেল, ভোগ ও সাংস্কৃতিক সন্ধ্যার স্বেচ্ছাসেবকদের তালিকা হবে।', link: ['#chanda', 'See the chanda drive', 'চাঁদা সংগ্রহ দেখুন'] },
  n2: { more: 'Races for under-8, under-12, adults and seniors. One entry per person per race. Entries close at 9 pm on 7 December. Non-members can watch from the boundary.', moreBn: 'অনূর্ধ্ব-৮, অনূর্ধ্ব-১২, বড় ও প্রবীণদের দৌড়। প্রতি দৌড়ে একজনের একটিই নাম। ৭ ডিসেম্বর রাত ৯টায় নাম জমা বন্ধ। সদস্য না হলেও মাঠের ধার থেকে দেখতে পারেন।', link: ['#event/sports', 'Sports Day details', 'ক্রীড়া দিবসের বিস্তারিত'] },
  n3: { more: 'Seedlings sell out in the first two weeks. Message Sutapa-di on WhatsApp and she will set some aside for you.', moreBn: 'প্রথম দুই সপ্তাহেই চারা শেষ হয়ে যায়। হোয়াটসঅ্যাপে সুতপা-দিকে জানালে আপনার জন্য সরিয়ে রাখবেন।', link: ['#nursery', 'Browse the nursery', 'নার্সারি দেখুন'] },
  n4: { more: 'Income was ₹4,82,000 from 312 households and 9 sponsors. What it was spent on, and the ₹62,000 kept for Saraswati Puja, is on the Chanda & accounts page. Every bill is in the khata.', moreBn: '৩১২টি পরিবার ও ৯ জন স্পনসরের কাছ থেকে আয় ₹৪,৮২,০০০। কোথায় খরচ হল, আর সরস্বতী পূজার জন্য রাখা ₹৬২,০০০, সব চাঁদা ও হিসাব পাতায়। প্রতিটি বিল খাতায় তোলা আছে।', link: ['#chanda', 'Chanda & accounts', 'চাঁদা ও হিসাব'] },
};
const extra = [
  { id: 'n5', date: '14 Nov', iso: '2026-11-14', tag: 'Service', tagBn: 'সেবা', title: 'Donors wanted for 28 November', titleBn: '২৮ নভেম্বরের জন্য রক্তদাতা চাই', body: 'We are aiming for 60 donors this year. Give your name at the club room, or just come on the day.', bodyBn: 'এ বছর ৬০ জন দাতার লক্ষ্য। ক্লাব ঘরে নাম দিন, বা সেদিন সরাসরি চলে আসুন।', more: 'Last year 58 people gave blood. If you have given in the last three months, please wait for the next camp.', moreBn: 'গত বছর ৫৮ জন রক্ত দিয়েছিলেন। গত তিন মাসের মধ্যে রক্ত দিয়ে থাকলে পরের শিবিরের জন্য অপেক্ষা করুন।', link: ['#event/blood', 'Camp details', 'শিবিরের বিস্তারিত'] },
  { id: 'n6', date: '03 Nov', iso: '2026-11-03', tag: 'General', tagBn: 'সাধারণ', title: 'Found after Kali Puja: a child’s blue bicycle', titleBn: 'কালীপূজার পরে পাওয়া গেছে: ছোটদের নীল সাইকেল', body: 'It is kept at the club room. Describe it to collect it, any evening 6 to 9 pm.', bodyBn: 'ক্লাব ঘরে রাখা আছে। বর্ণনা দিয়ে যেকোনো সন্ধ্যা ৬টা থেকে ৯টার মধ্যে নিয়ে যান।', link: ['#contact', 'Contact the club', 'ক্লাবে যোগাযোগ'] },
  { id: 'n7', date: '20 Oct', iso: '2026-10-20', tag: 'Members', tagBn: 'সদস্য', title: 'Pay your subscription by UPI', titleBn: 'ইউপিআই-তে চাঁদা দিন', body: 'Members can now pay ₹100 a month by UPI in the member app. The treasurer confirms within a day.', bodyBn: 'সদস্যরা এখন অ্যাপে ইউপিআই দিয়ে মাসে ₹১০০ দিতে পারেন। কোষাধ্যক্ষ এক দিনের মধ্যে নিশ্চিত করবেন।', more: 'Your receipt comes on WhatsApp. Cash at the club room is still fine.', moreBn: 'রসিদ হোয়াটসঅ্যাপে আসবে। ক্লাব ঘরে নগদেও দেওয়া যায়।', link: ['#join', 'Not a member yet? Join', 'এখনও সদস্য নন? যোগ দিন'] },
];
export const publicNotices = [
  ...appNotices.map((n) => ({ ...n, iso: iso[n.id] || '2026-10-01', ...(more[n.id] || {}) })),
  ...extra,
].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.iso.localeCompare(a.iso));

/* ---------- Chanda ---------- */
export const pujaSpend = [
  { en: 'Idol & pandal', bn: 'প্রতিমা ও প্যান্ডেল', v: 168000, c: '#d21f1b' },
  { en: 'Bhog for 4,200', bn: '৪,২০০ জনের ভোগ', v: 121000, c: '#f2a516' },
  { en: 'Lights & sound', bn: 'আলো ও শব্দ', v: 64000, c: '#2b2f36' },
  { en: 'Cultural nights', bn: 'সাংস্কৃতিক সন্ধ্যা', v: 38000, c: '#2c6a3a' },
  { en: 'Puja & purohit', bn: 'পূজা ও পুরোহিত', v: 29000, c: '#9a6400' },
  { en: 'Kept for Saraswati Puja', bn: 'সরস্বতী পূজার জন্য রাখা', v: 62000, c: '#b9b2a0' },
];
const lanesGot = chanda.areas.reduce((a, b) => a + b.got, 0);
const sponsorsPaid = chanda.sponsors.filter((s) => s.status === 'paid').reduce((a, b) => a + b.amount, 0);
export const drive = {
  ...chanda,
  collected: lanesGot + sponsorsPaid,
  houses: chanda.areas.reduce((a, b) => a + b.houses, 0),
  visited: chanda.areas.reduce((a, b) => a + b.visited, 0),
  updated: '15 Nov 2026', updatedBn: '১৫ নভেম্বর ২০২৬',
  date: '11 Feb 2027', dateBn: '১১ ফেব্রুয়ারি ২০২৭',
};

export const documents = [
  { en: 'Registration certificate', bn: 'নথিভুক্তির শংসাপত্র', note: 'Reg. No. S-0027153 / 2022-23', noteBn: 'রেজি. নং S-0027153 / 2022-23', size: '1 page' , sizeBn: '১ পাতা' },
  { en: 'Rules of the club (bye-laws)', bn: 'ক্লাবের নিয়মাবলী', note: 'Bengali, adopted at the 2022 AGM', noteBn: 'বাংলায়, ২০২২-এর এজিএম-এ গৃহীত', size: '6 pages', sizeBn: '৬ পাতা' },
  { en: 'Durga Puja 2026 accounts', bn: 'দুর্গাপূজা ২০২৬-এর হিসাব', note: 'Income, spending and bills', noteBn: 'আয়, খরচ ও বিল', size: '4 pages', sizeBn: '৪ পাতা' },
  { en: 'AGM report and audited accounts 2025–26', bn: 'এজিএম রিপোর্ট ও অডিট করা হিসাব ২০২৫–২৬', note: 'All three books: Club, Catering, Nursery', noteBn: 'তিনটি খাতাই: ক্লাব, ক্যাটারিং, নার্সারি', size: '12 pages', sizeBn: '১২ পাতা' },
];

/* ---------- Contact topics → who handles them ---------- */
export const contactTopics = [
  { key: 'membership', en: 'Membership', bn: 'সদস্যপদ', role: 'Secretary' },
  { key: 'serving', en: 'Serving team booking', bn: 'পরিবেশন দলের বুকিং', role: 'Catering in-charge' },
  { key: 'nursery', en: 'Nursery and plants', bn: 'নার্সারি ও গাছ', role: 'Nursery in-charge' },
  { key: 'chanda', en: 'Chanda, sponsorship or donation', bn: 'চাঁদা, স্পনসর বা দান', role: 'Treasurer' },
  { key: 'events', en: 'Events and volunteering', bn: 'অনুষ্ঠান ও স্বেচ্ছাসেবা', role: 'Puja in-charge' },
  { key: 'photo', en: 'Remove a photo of me', bn: 'আমার ছবি সরাতে চাই', role: 'Secretary' },
  { key: 'other', en: 'Something else', bn: 'অন্য কিছু', role: 'Secretary' },
];

/* ---------- Search: pages and questions (events, notices, plants, people are added at runtime) ---------- */
export const searchPages = [
  { href: '#home', en: 'Home', bn: 'প্রথম পাতা', k: 'club about story history' },
  { href: '#events', en: 'Events', bn: 'অনুষ্ঠান', k: 'calendar puja sports picnic what’s on' },
  { href: '#notices', en: 'Notices', bn: 'নোটিস', k: 'news notice board announcements' },
  { href: '#catering', en: 'Maitree Serving (catering)', bn: 'মৈত্রী পরিবেশন (ক্যাটারিং)', k: 'catering serving wedding annaprashan quote ক্যাটারিং পরিবেশন বিয়ে' },
  { href: '#nursery', en: 'Maitree Nursery', bn: 'মৈত্রী নার্সারি', k: 'plants nursery garden গাছ' },
  { href: '#gallery', en: 'Gallery', bn: 'ছবি', k: 'photos videos pictures album ছবি ভিডিও' },
  { href: '#committee', en: 'Committee', bn: 'কমিটি', k: 'president secretary treasurer people' },
  { href: '#chanda', en: 'Chanda & accounts', bn: 'চাঁদা ও হিসাব', k: 'donate donation chanda accounts sponsor money transparency দান টাকা হিসাব' },
  { href: '#join', en: 'Become a member', bn: 'সদস্য হোন', k: 'join membership form fee admission সদস্য ফর্ম' },
  { href: '#contact', en: 'Contact & directions', bn: 'যোগাযোগ ও পথ', k: 'address phone map whatsapp hours ঠিকানা ফোন' },
  { href: '#privacy', en: 'Privacy & terms', bn: 'গোপনীয়তা ও শর্ত', k: 'privacy data aadhaar terms' },
  { href: 'login.html', en: 'Member login', bn: 'সদস্য লগইন', k: 'sign in app dues id card pass' },
];
export const searchFaq = [
  { href: '#faq-who', en: 'Who can become a member?', bn: 'কারা সদস্য হতে পারেন?' },
  { href: '#faq-nonmembers', en: 'Can non-members come to the pujas?', bn: 'সদস্য না হলে কি পূজায় আসা যায়?' },
  { href: '#faq-serving', en: 'How do I book the serving team?', bn: 'পরিবেশনের দল কীভাবে বুক করব?' },
  { href: '#faq-pay', en: 'How do I pay my subscription?', bn: 'চাঁদা কীভাবে দেব?' },
  { href: '#faq-chanda', en: 'Can I give puja chanda without being a member?', bn: 'সদস্য না হয়েও কি পূজার চাঁদা দিতে পারি?' },
  { href: '#give', en: 'How to give chanda (UPI, cash, a volunteer visits)', bn: 'কীভাবে চাঁদা দেবেন (ইউপিআই, নগদ, স্বেচ্ছাসেবক)' },
];

export { events };
