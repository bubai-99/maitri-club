// Member-app sample data and in-memory state. Prototype only: nothing is sent or saved on a server.
import { me, club } from './data.js';
import { peopleOf } from './idcard.js';

export const TODAY = '2026-11-15';

/* ---------- The signed-in member ---------- */
export const profile = {
  name: me.name,
  nameBn: me.nameBn,
  family: me.family.no,
  mobile: '98301 73491',
  email: 'ananya.m@example.com',
  dob: '1984-03-12',
  blood: 'O+',
  address: '12/4 Netaji Para, Lane 2, Kolkata 700 084',
  addressBn: '১২/৪ নেতাজি পাড়া, ২ নং গলি, কলকাতা ৭০০ ০৮৪',
  aadhaar4: '4821',
  since: 2015,
  donor: true,
  lastDonation: '2026-06-14',
  photoUrl: null,
};

const base = peopleOf(me.family, 1);
const extra = [
  { rel: 'Head of family', relBn: 'পরিবারের প্রধান', relKey: 'head', dob: profile.dob, mobile: profile.mobile, blood: 'O+' },
  { rel: 'Spouse', relBn: 'স্বামী', relKey: 'spouse', dob: '1981-08-02', mobile: '98302 44810', blood: 'O+' },
  { rel: 'Son', relBn: 'ছেলে', relKey: 'son', dob: '2014-05-21', mobile: '', blood: 'B+', photo: false },
];
/** Everyone in the household, with their own member ID card. */
export const household = base.map((p, k) => ({ ...p, ...extra[k], photoUrl: null, status: 'active' }));

export const relations = [
  ['spouse', 'Spouse', 'স্বামী/স্ত্রী'], ['son', 'Son', 'ছেলে'], ['daughter', 'Daughter', 'মেয়ে'],
  ['mother', 'Mother', 'মা'], ['father', 'Father', 'বাবা'], ['other', 'Other relative', 'অন্য আত্মীয়'],
];
export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/* ---------- Money ---------- */
export const fee = club.monthlyFee;

/** Months still owed. Advance months are offered on the Pay screen. */
export const store = {
  dues: ['2026-10', '2026-11'],
  pending: null, // { utr, amount, months, at }
  offline: false,
  simulatedOffline: false,
  installDismissed: false,
  readNotices: new Set(['n3', 'n4']),
  passes: [],
  eventRegs: {}, // eventId -> details
  agmRsvp: null,
  ballot: null, // { r1: 'yes', ... , id }
  pollVote: null,
  basket: {},
  notifyMe: new Set(),
  nextReceipt: 419,
};

export const receipts = [
  { no: 'MC-26-0388', date: '2026-09-12', amount: 300, mode: 'cash', kind: 'sub', months: ['2026-07', '2026-08', '2026-09'], by: 'Tapas Mondal', byBn: 'তাপস মণ্ডল' },
  { no: 'EV-26-0042', date: '2026-10-15', amount: 600, mode: 'upi', kind: 'event', note: ['Durga Puja · 4 bhog coupons', 'দুর্গাপূজা · ৪টি ভোগ কুপন'], by: 'Kakoli Sen', byBn: 'কাকলি সেন', utr: '628915300417' },
  { no: 'NS-26-0277', date: '2026-10-19', amount: 243, mode: 'upi', kind: 'nursery', note: ['Nursery · Tulsi, marigold tray, hibiscus', 'নার্সারি · তুলসী, গাঁদার ট্রে, জবা'], by: 'Sutapa Bose', byBn: 'সুতপা বসু', utr: '629304118762' },
  { no: 'CT-26-0031', date: '2026-08-24', amount: 1920, mode: 'cash', kind: 'catering', note: ['Maitree Serving · birthday, 60 guests', 'মৈত্রী পরিবেশন · জন্মদিন, ৬০ জন'], by: 'Debashis Pal', byBn: 'দেবাশিস পাল' },
  { no: 'MC-26-0214', date: '2026-06-04', amount: 300, mode: 'upi', kind: 'sub', months: ['2026-04', '2026-05', '2026-06'], by: 'Tapas Mondal', byBn: 'তাপস মণ্ডল', utr: '615204338190' },
  { no: 'MC-26-0097', date: '2026-03-09', amount: 300, mode: 'cash', kind: 'sub', months: ['2026-01', '2026-02', '2026-03'], by: 'Tapas Mondal', byBn: 'তাপস মণ্ডল' },
  { no: 'MC-25-0431', date: '2025-12-14', amount: 300, mode: 'cash', kind: 'sub', months: ['2025-10', '2025-11', '2025-12'], by: 'Tapas Mondal', byBn: 'তাপস মণ্ডল' },
  { no: 'MC-25-0322', date: '2025-09-21', amount: 300, mode: 'upi', kind: 'sub', months: ['2025-07', '2025-08', '2025-09'], by: 'Tapas Mondal', byBn: 'তাপস মণ্ডল', utr: '526117094452' },
  { no: 'MC-25-0190', date: '2025-06-08', amount: 300, mode: 'cash', kind: 'sub', months: ['2025-04', '2025-05', '2025-06'], by: 'Tapas Mondal', byBn: 'তাপস মণ্ডল' },
].sort((a, b) => b.date.localeCompare(a.date));

export const receiptKinds = {
  all: ['All', 'সব'],
  sub: ['Subscription', 'চাঁদা'],
  event: ['Events', 'অনুষ্ঠান'],
  nursery: ['Nursery', 'নার্সারি'],
  catering: ['Catering', 'পরিবেশন'],
};
export const bookOf = (no) => ({ MC: ['Club book', 'ক্লাব খাতা'], EV: ['Club book', 'ক্লাব খাতা'], NS: ['Nursery book', 'নার্সারি খাতা'], CT: ['Catering book', 'ক্যাটারিং খাতা'] }[no.slice(0, 2)] || ['Club book', 'ক্লাব খাতা']);

/* ---------- Events ---------- */
export const eventInfo = {
  blood: {
    timeBn: 'সকাল ৯টা – দুপুর ২টা',
    about: ['With the Lions Blood Bank, Barasat. Donors get a certificate, a light lunch and a free health check.', 'লায়ন্স ব্লাড ব্যাঙ্ক, বারাসতের সঙ্গে। রক্তদাতারা পাবেন শংসাপত্র, হালকা খাবার ও বিনামূল্যে স্বাস্থ্য পরীক্ষা।'],
    slots: [['9–10 am', 'সকাল ৯–১০টা'], ['10–11 am', 'সকাল ১০–১১টা'], ['11 am–12 pm', 'সকাল ১১–১২টা'], ['12–1 pm', 'দুপুর ১২–১টা'], ['1–2 pm', 'দুপুর ১–২টা']],
  },
  sports: {
    timeBn: 'সকাল ৭টা থেকে',
    closes: '2026-12-07',
    about: ['Races and games for every age on the Netaji Para ground. Breakfast for every registered family member; prizes at 1 pm.', 'নেতাজি পাড়া মাঠে সব বয়সের দৌড় ও খেলা। নাম দেওয়া প্রত্যেকের জন্য জলখাবার; পুরস্কার দুপুর ১টায়।'],
    kid: [['sack', 'Sack race', 'বস্তা দৌড়'], ['spoon', 'Lemon and spoon', 'চামচে লেবু'], ['sprint', '50 m sprint', '৫০ মিটার দৌড়'], ['draw', 'Sit-and-draw', 'বসে আঁকো']],
    adult: [['chairs', 'Musical chairs', 'মিউজিক্যাল চেয়ার'], ['tug', 'Tug of war', 'দড়ি টানাটানি'], ['walk', '100 m walk', '১০০ মিটার হাঁটা'], ['carrom', 'Carrom', 'ক্যারম']],
  },
  picnic: {
    timeBn: 'বাস ছাড়বে সকাল ৬:৩০',
    closes: '2026-12-20',
    adult: 450,
    child: 250,
    seatsLeft: 38,
    about: ['A day by the river at Gadiara. Bus, breakfast, lunch and evening snacks included. Children under 5 travel free.', 'গাদিয়াড়ায় নদীর ধারে একটা দিন। বাস, জলখাবার, দুপুরের খাবার ও বিকেলের টিফিন সহ। ৫ বছরের কম বয়সীদের খরচ লাগবে না।'],
  },
  saraswati: {
    timeBn: 'পুষ্পাঞ্জলি সকাল ৯:৩০',
    about: ['Pushpanjali at 9:30 am, hate-khori for little ones at 11 am, bhog from 1 pm. Open to all in the para.', 'সকাল ৯:৩০-এ পুষ্পাঞ্জলি, ১১টায় হাতেখড়ি, দুপুর ১টা থেকে ভোগ। পাড়ার সবার জন্য খোলা।'],
    roles: [['bhog', 'Bhog serving', 'ভোগ পরিবেশন'], ['decor', 'Decoration (the evening before)', 'সাজসজ্জা (আগের সন্ধ্যা)'], ['gate', 'Gate and queue', 'গেট ও লাইন'], ['clean', 'Clean-up after', 'পরে পরিষ্কার']],
  },
};

/* ---------- Notices, AGM, polls ---------- */
export const noticeExtra = {
  n1: { more: ['Agenda: Saraswati Puja budget, volunteer list, chanda areas. All members may attend; only committee members vote.', 'আলোচ্য: সরস্বতী পূজার বাজেট, স্বেচ্ছাসেবক তালিকা, চাঁদার এলাকা। সব সদস্য আসতে পারেন; ভোট দেবেন কমিটির সদস্যরা।'], link: ['#polls', 'AGM & polls', 'সাধারণ সভা ও ভোট'] },
  n2: { more: ['Children and adults can enter up to two items each. Breakfast coupons are on the family pass.', 'ছোট-বড় প্রত্যেকে দুটি পর্যন্ত খেলায় নাম দিতে পারেন। জলখাবারের কুপন পরিবারের পাসেই থাকবে।'], link: ['#event/sports', 'Register for Sports Day', 'ক্রীড়ায় নাম দিন'] },
  n3: { more: ['Open Saturday and Sunday, 7–10 am, behind the club room.', 'শনি ও রবি, সকাল ৭–১০টা, ক্লাব ঘরের পেছনে।'], link: ['#nursery', 'See member prices', 'সদস্য মূল্য দেখুন'] },
  n4: { more: ['Income ₹4,86,200 · expenditure ₹4,61,750 · surplus ₹24,450 carried to the Puja fund.', 'আয় ₹৪,৮৬,২০০ · ব্যয় ₹৪,৬১,৭৫০ · উদ্বৃত্ত ₹২৪,৪৫০ পূজা তহবিলে।'], link: ['#docs/acc-durga', 'Open the accounts', 'হিসাব দেখুন'] },
};

export const agm = {
  date: '2026-12-14',
  time: ['5 pm', 'বিকেল ৫টা'],
  place: ['Club room, 14/2 Netaji Subhas Road', 'ক্লাব ঘর, ১৪/২ নেতাজি সুভাষ রোড'],
  closes: ['14 Dec, 5 pm', '১৪ ডিসে, বিকেল ৫টা'],
  agenda: [
    ['Secretary’s report for 2025–26', '২০২৫–২৬-এর সম্পাদকের প্রতিবেদন'],
    ['Audited accounts of the three books', 'তিন খাতার নিরীক্ষিত হিসাব'],
    ['Subscription for 2027', '২০২৭-এর চাঁদা'],
    ['Appointment of auditor', 'নিরীক্ষক নিয়োগ'],
    ['Any other business', 'অন্যান্য বিষয়'],
  ],
  resolutions: [
    { id: 'r1', en: 'Adopt the audited accounts for 2025–26', bn: '২০২৫–২৬-এর নিরীক্ষিত হিসাব গ্রহণ', noteEn: 'Club, Catering and Nursery books, as published in Documents.', noteBn: 'ক্লাব, ক্যাটারিং ও নার্সারি খাতা, ডকুমেন্টসে প্রকাশিত।' },
    { id: 'r2', en: 'Keep the subscription at ₹100 a month per household for 2027', bn: '২০২৭-এ বাড়ি পিছু মাসিক চাঁদা ₹১০০-ই থাকবে', noteEn: 'Admission stays ₹500.', noteBn: 'ভর্তি ফি ₹৫০০-ই থাকবে।' },
    { id: 'r3', en: 'Appoint S. Ghosh & Co. as auditor for 2026–27', bn: '২০২৬–২৭-এর নিরীক্ষক এস. ঘোষ অ্যান্ড কোং', noteEn: 'Fee ₹6,000, unchanged from last year.', noteBn: 'ফি ₹৬,০০০, গত বছরের মতোই।' },
  ],
};

export const pollOpts = [
  { en: 'Gadiara', bn: 'গাদিয়াড়া', v: 61 },
  { en: 'Mukutmanipur', bn: 'মুকুটমণিপুর', v: 34 },
  { en: 'Bakkhali', bn: 'বকখালি', v: 48 },
];
export const closedPolls = [
  { q: ['Durga Puja 2026 pandal theme', 'দুর্গাপূজা ২০২৬-এর প্যান্ডেলের থিম'], closed: '2026-07-31', opts: [['Terracotta temples', 'টেরাকোটা মন্দির', 58], ['Patachitra', 'পটচিত্র', 32], ['Kantha stitch', 'কাঁথা স্টিচ', 10]] },
];

/* ---------- Documents ---------- */
export const docs = [
  { id: 'rules', icon: 'book-open', en: 'Rule book (constitution)', bn: 'নিয়মাবলি (গঠনতন্ত্র)', metaEn: '6 sections · amended at AGM 2025', metaBn: '৬টি অংশ · সাধারণ সভা ২০২৫-এ সংশোধিত', date: '2025-12-14' },
  { id: 'reg', icon: 'landmark', en: 'Society registration', bn: 'সোসাইটি নিবন্ধন', metaEn: 'Reg. No. S-0027153 / 2022-23', metaBn: 'নিবন্ধন নং S-0027153 / 2022-23', date: '2022-09-30' },
  { id: 'acc-durga', icon: 'calculator', en: 'Durga Puja 2026 accounts', bn: 'দুর্গাপূজা ২০২৬-এর হিসাব', metaEn: 'Income and expenditure', metaBn: 'আয় ও ব্যয়', date: '2026-10-28' },
  { id: 'minutes', icon: 'file-text', en: 'AGM 2025 minutes', bn: 'সাধারণ সভা ২০২৫-এর কার্যবিবরণী', metaEn: 'Decisions and attendance', metaBn: 'সিদ্ধান্ত ও উপস্থিতি', date: '2025-12-20' },
  { id: 'form', icon: 'clipboard-list', en: 'Membership form (blank)', bn: 'সদস্য ফর্ম (ফাঁকা)', metaEn: 'For neighbours who want to join', metaBn: 'যে প্রতিবেশীরা যোগ দিতে চান', date: '2026-01-10' },
];

export const rulebook = [
  ['Name and aims', 'নাম ও উদ্দেশ্য', 'Gede Maitree Club, Netaji Para, established 2014, works for friendship, culture, sport and service in the para. It is non-political and non-profit.', 'গেদে মৈত্রী ক্লাব, নেতাজি পাড়া, প্রতিষ্ঠা ২০১৪, পাড়ার বন্ধুত্ব, সংস্কৃতি, খেলাধুলো ও সেবার জন্য কাজ করে। ক্লাব অরাজনৈতিক ও অলাভজনক।'],
  ['Membership', 'সদস্যপদ', 'Any resident aged 18 or over may apply on the membership form. Family members at the same address may join on the same form. The committee approves applications at its next meeting.', '১৮ বছর বা তার বেশি বয়সী যেকোনো বাসিন্দা সদস্য ফর্মে আবেদন করতে পারেন। একই ঠিকানার পরিবারের সদস্যরা একই ফর্মে যোগ দিতে পারেন। কমিটি পরের সভায় আবেদন অনুমোদন করে।'],
  ['Fees', 'চাঁদা', 'Admission ₹500 once per household. Subscription ₹100 a month per household, paid monthly or in advance, by UPI or cash at the club room. A household six months behind becomes inactive until it pays.', 'ভর্তি ফি বাড়ি পিছু একবার ₹৫০০। মাসিক চাঁদা বাড়ি পিছু ₹১০০, প্রতি মাসে বা অগ্রিম, ইউপিআই বা ক্লাব ঘরে নগদে। ছয় মাস বকেয়া থাকলে পরিবার নিষ্ক্রিয় হবে, টাকা দিলে আবার সক্রিয়।'],
  ['Conduct', 'আচরণ', 'Members follow the rules and collective decisions of the club. Any anti-social activity ends membership. Member cards are not transferable.', 'সদস্যরা ক্লাবের নিয়ম ও সম্মিলিত সিদ্ধান্ত মেনে চলবেন। কোনো সমাজবিরোধী কাজে সদস্যপদ বাতিল হবে। সদস্য কার্ড হস্তান্তরযোগ্য নয়।'],
  ['Meetings and voting', 'সভা ও ভোট', 'The Annual General Meeting is held every December. Each household in good standing has one vote, cast in person or in the member app before the meeting.', 'প্রতি ডিসেম্বরে বার্ষিক সাধারণ সভা হয়। নিয়মিত চাঁদা দেওয়া প্রতিটি পরিবারের একটি ভোট, সভায় বা সভার আগে সদস্য অ্যাপে।'],
  ['Accounts', 'হিসাব', 'The club keeps three books: Club, Catering (Maitree Serving) and Nursery. Accounts are audited every year and shown to members at the AGM.', 'ক্লাব তিনটি খাতা রাখে: ক্লাব, ক্যাটারিং (মৈত্রী পরিবেশন) ও নার্সারি। প্রতি বছর হিসাব নিরীক্ষা হয় এবং সাধারণ সভায় সদস্যদের দেখানো হয়।'],
];

export const durgaAccounts = {
  income: [['Chanda from the para', 'পাড়ার চাঁদা', 312400], ['Sponsors', 'স্পনসর', 98000], ['Bhog coupons', 'ভোগ কুপন', 75800]],
  expense: [['Idol', 'প্রতিমা', 85000], ['Pandal and lights', 'প্যান্ডেল ও আলো', 168000], ['Bhog (4,200 plates)', 'ভোগ (৪,২০০ প্লেট)', 121500], ['Purohit and puja items', 'পুরোহিত ও পূজার সামগ্রী', 32250], ['Cultural programme', 'সাংস্কৃতিক অনুষ্ঠান', 41000], ['Miscellaneous', 'বিবিধ', 14000]],
};

/* ---------- Help ---------- */
export const contacts = [
  { role: 'Treasurer', roleBn: 'কোষাধ্যক্ষ', name: 'Tapas Mondal', nameBn: 'তাপস মণ্ডল', phone: '98300 21456', for: 'Dues, receipts, UPI checks', forBn: 'চাঁদা, রসিদ, ইউপিআই যাচাই' },
  { role: 'Secretary', roleBn: 'সম্পাদক', name: 'Rajib Banerjee', nameBn: 'রাজীব ব্যানার্জি', phone: '98300 12345', for: 'Membership, family, ID cards', forBn: 'সদস্যপদ, পরিবার, আইডি কার্ড' },
  { role: 'Puja in-charge', roleBn: 'পূজা কমিটি', name: 'Kakoli Sen', nameBn: 'কাকলি সেন', phone: '98300 33718', for: 'Events, passes, volunteering', forBn: 'অনুষ্ঠান, পাস, স্বেচ্ছাসেবা' },
  { role: 'Catering in-charge', roleBn: 'ক্যাটারিং দায়িত্বে', name: 'Debashis Pal', nameBn: 'দেবাশিস পাল', phone: '98300 40927', for: 'Maitree Serving bookings', forBn: 'মৈত্রী পরিবেশনের বুকিং' },
  { role: 'Nursery in-charge', roleBn: 'নার্সারি দায়িত্বে', name: 'Sutapa Bose', nameBn: 'সুতপা বসু', phone: '98300 55162', for: 'Plants and reservations', forBn: 'গাছ ও রিজার্ভেশন' },
];

export const faq = [
  ['I paid by UPI. When do I get the receipt?', 'ইউপিআই-এ দিয়েছি। রসিদ কখন পাব?', 'Once the treasurer matches your UTR with the club’s bank statement, usually the same evening. You get a notification and the stamped receipt appears in Receipts.', 'কোষাধ্যক্ষ ক্লাবের ব্যাঙ্ক স্টেটমেন্টের সঙ্গে আপনার UTR মিলিয়ে নিলেই, সাধারণত সেদিন সন্ধ্যায়। নোটিফিকেশন আসবে এবং রসিদে স্ট্যাম্প দেওয়া রসিদ দেখা যাবে।'],
  ['Where do I find the UTR?', 'UTR কোথায় পাব?', 'Open the payment in your UPI app (GPay, PhonePe, Paytm, BHIM). The 12-digit UTR or UPI reference number is on the payment details.', 'আপনার ইউপিআই অ্যাপে (জিপে, ফোনপে, পেটিএম, ভীম) পেমেন্টটি খুলুন। পেমেন্টের বিবরণে ১২ সংখ্যার UTR বা UPI রেফারেন্স নম্বর থাকে।'],
  ['Can I pay several months in advance?', 'কয়েক মাস অগ্রিম দেওয়া যায়?', 'Yes. Tick the advance months on the Pay screen. Your statement shows them as paid ahead.', 'হ্যাঁ। চাঁদা দেওয়ার পাতায় অগ্রিম মাসগুলোয় টিক দিন। স্টেটমেন্টে সেগুলো অগ্রিম হিসেবে দেখাবে।'],
  ['Does each family member pay separately?', 'পরিবারের প্রত্যেককে আলাদা দিতে হবে?', 'No. ₹100 a month covers the whole household. Each person still gets their own ID card.', 'না। মাসে ₹১০০-তে পুরো পরিবার। তবে প্রত্যেকে নিজের আইডি কার্ড পান।'],
  ['How do I add my mother or a newborn?', 'মা বা নবজাতককে কীভাবে যোগ করব?', 'Go to Family & profile, then Add a family member. The committee checks the details before the card appears.', 'পরিবার ও প্রোফাইলে গিয়ে “সদস্য যোগ করুন” চাপুন। কমিটি যাচাই করলে কার্ড চলে আসবে।'],
  ['I lost my laminated card.', 'ল্যামিনেট করা কার্ড হারিয়ে গেছে।', 'The card in the app still works at the gate. Use “Report lost card” on the Member cards screen and collect a new one at the club room.', 'অ্যাপের কার্ড গেটে চলবে। সদস্য কার্ডের পাতায় “কার্ড হারিয়েছে” জানান এবং ক্লাব ঘর থেকে নতুন কার্ড নিন।'],
  ['Is my Aadhaar number stored?', 'আমার আধার নম্বর কি রাখা হয়?', 'Only the last 4 digits, to tell people with the same name apart. The full number is never asked for.', 'শুধু শেষ ৪ সংখ্যা, একই নামের লোকদের আলাদা করতে। পুরো নম্বর কখনো চাওয়া হয় না।'],
  ['Does the app work without internet?', 'ইন্টারনেট ছাড়া অ্যাপ চলে?', 'Your member cards, gate QR and passes open offline once you have opened them once. Paying and forms need a connection.', 'একবার খোলা থাকলে সদস্য কার্ড, গেটের QR ও পাস ইন্টারনেট ছাড়াও খোলে। চাঁদা দেওয়া ও ফর্ম জমা দিতে ইন্টারনেট লাগবে।'],
];

/* ---------- Catering (Maitree Serving) ---------- */
export const cateringRequests = [
  { id: 'CT-26-0031', occasion: ['Birthday', 'জন্মদিন'], date: '2026-08-24', guests: 60, pkg: 'team', status: 'settled', amount: 1920 },
];

/* ---------- Notifications ---------- */
export const alerts = [
  { icon: 'megaphone', en: 'Committee meeting on Sunday 16 Nov, 6 pm', bn: 'কমিটি সভা রবি ১৬ নভে, সন্ধ্যা ৬টা', date: '2026-11-12', unread: true, href: '#notice/n1' },
  { icon: 'vote', en: 'AGM ballot is open. Vote before 14 Dec.', bn: 'সাধারণ সভার ব্যালট খোলা। ১৪ ডিসের আগে ভোট দিন।', date: '2026-11-11', unread: true, href: '#polls' },
  { icon: 'ticket', en: 'Sports Day entries are open. They close 7 Dec.', bn: 'ক্রীড়া দিবসে নাম দেওয়া শুরু। শেষ ৭ ডিসে।', date: '2026-11-10', unread: false, href: '#event/sports' },
  { icon: 'sprout', en: 'Dahlia and chrysanthemum have arrived at the nursery', bn: 'নার্সারিতে ডালিয়া ও চন্দ্রমল্লিকা এসেছে', date: '2026-11-06', unread: false, href: '#nursery' },
  { icon: 'bell-ring', en: 'Reminder: ₹200 subscription due for Oct–Nov', bn: 'মনে করানো: অক্টো–নভে ₹২০০ বকেয়া', date: '2026-11-05', unread: false, href: '#pay' },
  { icon: 'receipt-text', en: 'Receipt MC-26-0388 · ₹300 received in cash', bn: 'রসিদ MC-26-0388 · নগদে ₹৩০০ পাওয়া গেছে', date: '2026-09-12', unread: false, href: '#receipt/MC-26-0388' },
];

export const prefs = {
  channels: { push: true, whatsapp: true, sms: false },
  topics: [
    ['dues', 'Dues reminders', 'বকেয়ার তাগাদা', 'Once a month, never more', 'মাসে একবার, তার বেশি নয়', true],
    ['receipts', 'Receipts', 'রসিদ', 'When the treasurer records a payment', 'কোষাধ্যক্ষ জমা নিলে', true],
    ['events', 'Events & pujas', 'অনুষ্ঠান ও পূজা', 'New events and pass openings', 'নতুন অনুষ্ঠান ও পাস', true],
    ['meetings', 'Meetings & votes', 'সভা ও ভোট', 'AGM notices and ballots', 'সাধারণ সভার নোটিস ও ব্যালট', true],
    ['nursery', 'Nursery arrivals', 'নার্সারিতে নতুন গাছ', 'Seasonal plants, member prices', 'মরসুমি গাছ, সদস্য মূল্য', false],
    ['blood', 'Blood requests', 'রক্তের অনুরোধ', 'Urgent requests for your blood group', 'আপনার গ্রুপের জরুরি অনুরোধ', true],
  ],
};

export const devices = [
  { en: 'This phone · Chrome on Android', bn: 'এই ফোন · অ্যান্ড্রয়েডে ক্রোম', whenEn: 'Active now', whenBn: 'এখন চালু', icon: 'smartphone', current: true },
  { en: 'Laptop · Edge on Windows', bn: 'ল্যাপটপ · উইন্ডোজে এজ', whenEn: 'Yesterday, 9:12 pm', whenBn: 'গতকাল, রাত ৯:১২', icon: 'laptop' },
];
