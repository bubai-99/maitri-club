// Sample data for the prototype. Placeholders until the club confirms real details.

export const club = {
  name: 'Gede Maitree Club',
  nameBn: 'গেদে মৈত্রী ক্লাব',
  para: 'Netaji Para',
  paraBn: 'নেতাজি পাড়া',
  estd: 2014,
  regNo: 'S-0027153 / 2022-23',
  address: '14/2 Netaji Subhas Road, Netaji Para, Kolkata 700 084',
  addressBn: '১৪/২ নেতাজি সুভাষ রোড, নেতাজি পাড়া, কলকাতা ৭০০ ০৮৪',
  phone: '+91 98300 12345',
  whatsapp: '919830012345',
  upi: 'maitriclub@sbi',
  monthlyFee: 100,
  admissionFee: 500,
};

export const events = [
  { id: 'blood', date: '2026-11-28', day: '28', mon: 'Nov', monBn: 'নভে', title: 'Blood Donation Camp', titleBn: 'রক্তদান শিবির', time: '9 am – 2 pm', place: 'Club room', placeBn: 'ক্লাব ঘর', kind: 'service', pass: false },
  { id: 'sports', date: '2026-12-13', day: '13', mon: 'Dec', monBn: 'ডিসে', title: 'Annual Sports Day', titleBn: 'বার্ষিক ক্রীড়া', time: '7 am onwards', place: 'Netaji Para ground', placeBn: 'নেতাজি পাড়া মাঠ', kind: 'sports', pass: true },
  { id: 'picnic', date: '2027-01-03', day: '03', mon: 'Jan', monBn: 'জানু', title: 'Members’ Winter Picnic', titleBn: 'শীতের পিকনিক', time: 'Bus leaves 6:30 am', place: 'Gadiara', placeBn: 'গাদিয়াড়া', kind: 'social', pass: true },
  { id: 'saraswati', date: '2027-02-11', day: '11', mon: 'Feb', monBn: 'ফেব্রু', title: 'Saraswati Puja', titleBn: 'সরস্বতী পূজা', time: 'Pushpanjali 9:30 am', place: 'Club pandal', placeBn: 'ক্লাব প্যান্ডেল', kind: 'puja', pass: false },
];

/**
 * Panjika dates the committee enters from the club's panjika (admin console → Panjika).
 * kind: 'puja' | 'parbon' (solar days, sankranti) | 'wedding'. tithi: the tithi the day is kept on (0–29), for the times shown.
 * PROTOTYPE SAMPLES: the committee checks every date and time against its panjika before launch.
 */
export const panjikaSource = { en: 'the club’s panjika', bn: 'ক্লাবের পঞ্জিকা' };
export const panjikaDates = [
  { id: 'pj1', kind: 'puja', date: '2026-11-19', tithi: 8, en: 'Jagaddhatri Puja', bn: 'জগদ্ধাত্রী পূজা' },
  { id: 'pj2', kind: 'puja', date: '2026-11-24', tithi: 14, en: 'Rash Purnima', bn: 'রাসপূর্ণিমা' },
  { id: 'pj3', kind: 'parbon', date: '2027-01-14', en: 'Poush Sankranti · pithe-puli', bn: 'পৌষ সংক্রান্তি · পিঠে-পুলি' },
  { id: 'pj4', kind: 'puja', date: '2027-02-11', tithi: 4, en: 'Saraswati Puja', bn: 'সরস্বতী পূজা', event: 'saraswati' },
  { id: 'pj5', kind: 'puja', date: '2027-03-22', tithi: 14, en: 'Dol Purnima', bn: 'দোলপূর্ণিমা' },
  { id: 'pj6', kind: 'parbon', date: '2027-04-14', en: 'Choitro Sankranti · Charak', bn: 'চৈত্র সংক্রান্তি · চড়ক' },
  { id: 'pj7', kind: 'parbon', date: '2027-04-15', en: 'Poila Boishakh · Bengali New Year 1434', bn: 'পয়লা বৈশাখ · নববর্ষ ১৪৩৪' },
  { id: 'w1', kind: 'wedding', date: '2026-11-22', en: 'Wedding day', bn: 'বিয়ের দিন', lagna: ['8:10 pm – 1:40 am', 'রাত ৮:১০ – ১:৪০'] },
  { id: 'w2', kind: 'wedding', date: '2026-11-27', en: 'Wedding day', bn: 'বিয়ের দিন', lagna: ['7:25 pm – 11:50 pm', 'সন্ধ্যা ৭:২৫ – রাত ১১:৫০'] },
  { id: 'w3', kind: 'wedding', date: '2026-12-03', en: 'Wedding day', bn: 'বিয়ের দিন', lagna: ['9:05 pm – 2:20 am', 'রাত ৯:০৫ – ২:২০'] },
  { id: 'w4', kind: 'wedding', date: '2026-12-07', en: 'Wedding day', bn: 'বিয়ের দিন', lagna: ['6:50 pm – 10:30 pm', 'সন্ধ্যা ৬:৫০ – রাত ১০:৩০'] },
  { id: 'w5', kind: 'wedding', date: '2027-01-22', en: 'Wedding day', bn: 'বিয়ের দিন', lagna: ['8:40 pm – 3:10 am', 'রাত ৮:৪০ – ৩:১০'] },
  { id: 'w6', kind: 'wedding', date: '2027-01-28', en: 'Wedding day', bn: 'বিয়ের দিন', lagna: ['7:55 pm – 12:30 am', 'সন্ধ্যা ৭:৫৫ – রাত ১২:৩০'] },
  { id: 'w7', kind: 'wedding', date: '2027-02-04', en: 'Wedding day', bn: 'বিয়ের দিন', lagna: ['9:30 pm – 4:00 am', 'রাত ৯:৩০ – ভোর ৪:০০'] },
  { id: 'w8', kind: 'wedding', date: '2027-02-19', en: 'Wedding day', bn: 'বিয়ের দিন', lagna: ['8:15 pm – 1:05 am', 'রাত ৮:১৫ – ১:০৫'] },
  { id: 'w9', kind: 'wedding', date: '2027-03-03', en: 'Wedding day', bn: 'বিয়ের দিন', lagna: ['7:40 pm – 11:15 pm', 'সন্ধ্যা ৭:৪০ – রাত ১১:১৫'] },
];

export const pastEvents = [
  { title: 'Durga Puja 2026', titleBn: 'দুর্গাপূজা ২০২৬', when: '17–21 Oct', note: '4,200 bhog served · 61 volunteers', noteBn: '৪,২০০ জনকে ভোগ · ৬১ জন স্বেচ্ছাসেবক' },
  { title: 'Kali Puja & Bhai Phonta', titleBn: 'কালীপূজা ও ভাইফোঁটা', when: '8–10 Nov', note: 'Green-crackers-only night', noteBn: 'শুধু সবুজ বাজি' },
];

const lanes = ['Lane 1', 'Lane 2', 'Lane 3', 'Pukur Par', 'School Road'];
const lanesBn = ['১ নং গলি', '২ নং গলি', '৩ নং গলি', 'পুকুর পাড়', 'স্কুল রোড'];

const heads = [
  ['Subrata Ghosh', 'সুব্রত ঘোষ'], ['Ananya Mukherjee', 'অনন্যা মুখার্জি'], ['Pradip Saha', 'প্রদীপ সাহা'],
  ['Mithu Das', 'মিঠু দাস'], ['Rajib Banerjee', 'রাজীব ব্যানার্জি'], ['Kakoli Sen', 'কাকলি সেন'],
  ['Debashis Pal', 'দেবাশিস পাল'], ['Shampa Roy', 'শম্পা রায়'], ['Tapas Mondal', 'তাপস মণ্ডল'],
  ['Rina Chatterjee', 'রিনা চ্যাটার্জি'], ['Bapi Halder', 'বাপি হালদার'], ['Sutapa Bose', 'সুতপা বসু'],
  ['Arindam Dey', 'অরিন্দম দে'], ['Moumita Kar', 'মৌমিতা কর'], ['Gopal Biswas', 'গোপাল বিশ্বাস'],
  ['Jhuma Sarkar', 'ঝুমা সরকার'], ['Nirmal Dutta', 'নির্মল দত্ত'], ['Payel Majumdar', 'পায়েল মজুমদার'],
  ['Sanjay Nandi', 'সঞ্জয় নন্দী'], ['Tumpa Guha', 'টুম্পা গুহ'], ['Ashok Chakraborty', 'অশোক চক্রবর্তী'],
  ['Rupa Bhattacharya', 'রূপা ভট্টাচার্য'], ['Manas Kundu', 'মানস কুণ্ডু'], ['Lipika Paul', 'লিপিকা পাল'],
];
const dueMonths = [0, 2, 0, 0, 5, 1, 0, 0, 3, 0, 0, 1, 0, 8, 0, 0, 2, 0, 0, 0, 4, 0, 1, 0];
const sizes = [4, 3, 5, 2, 4, 3, 6, 2, 4, 3, 5, 4, 3, 2, 5, 3, 4, 2, 3, 4, 5, 3, 2, 4];

export const families = heads.map(([en, bn], i) => ({
  no: `MC-${String(101 + i * 3).padStart(4, '0')}`,
  head: en,
  headBn: bn,
  lane: lanes[i % lanes.length],
  laneBn: lanesBn[i % lanes.length],
  phone: `98${(31000000 + i * 734917) % 100000000}`.slice(0, 10),
  size: sizes[i],
  dueMonths: dueMonths[i],
  due: dueMonths[i] * club.monthlyFee,
  since: 2014 + ((i * 5) % 13),
  status: dueMonths[i] === 0 ? 'paid' : dueMonths[i] >= 6 ? 'lapsed' : 'due',
}));

// Logged-in member for the app
export const me = {
  family: families[1],
  name: 'Ananya Mukherjee',
  nameBn: 'অনন্যা মুখার্জি',
  dependents: [
    { name: 'Sourav Mukherjee', nameBn: 'সৌরভ মুখার্জি', rel: 'Spouse', relBn: 'স্বামী' },
    { name: 'Ishaan Mukherjee', nameBn: 'ঈশান মুখার্জি', rel: 'Son, 12', relBn: 'ছেলে, ১২' },
  ],
  dues: [
    { month: 'Oct 2026', monthBn: 'অক্টো ২০২৬', amount: 100 },
    { month: 'Nov 2026', monthBn: 'নভে ২০২৬', amount: 100 },
  ],
  history: [
    { date: '12 Sep 2026', receipt: 'MC-26-0388', amount: 300, mode: 'Cash', by: 'Tapas Mondal' },
    { date: '04 Jun 2026', receipt: 'MC-26-0214', amount: 300, mode: 'UPI', by: 'Tapas Mondal' },
    { date: '09 Mar 2026', receipt: 'MC-26-0097', amount: 300, mode: 'Cash', by: 'Tapas Mondal' },
  ],
};

export const committee = [
  { role: 'President', roleBn: 'সভাপতি', name: 'Ashok Chakraborty', nameBn: 'অশোক চক্রবর্তী', since: 2023 },
  { role: 'Secretary', roleBn: 'সম্পাদক', name: 'Rajib Banerjee', nameBn: 'রাজীব ব্যানার্জি', since: 2024 },
  { role: 'Treasurer', roleBn: 'কোষাধ্যক্ষ', name: 'Tapas Mondal', nameBn: 'তাপস মণ্ডল', since: 2021 },
  { role: 'Puja in-charge', roleBn: 'পূজা কমিটি', name: 'Kakoli Sen', nameBn: 'কাকলি সেন', since: 2025 },
  { role: 'Catering in-charge', roleBn: 'ক্যাটারিং দায়িত্বে', name: 'Debashis Pal', nameBn: 'দেবাশিস পাল', since: 2022 },
  { role: 'Nursery in-charge', roleBn: 'নার্সারি দায়িত্বে', name: 'Sutapa Bose', nameBn: 'সুতপা বসু', since: 2024 },
  { role: 'Sports secretary', roleBn: 'ক্রীড়া সম্পাদক', name: 'Arindam Dey', nameBn: 'অরিন্দম দে', since: 2025 },
];

// Catering is a serving service only (poribeshon): the club does not cook. Rates are per guest and are placeholders.
export const cateringPackages = [
  {
    id: 'team', name: 'Serving team', nameBn: 'পরিবেশন', rate: 35, min: 50,
    for: 'You have the food and the plates', forBn: 'খাবার ও থালা আপনার',
    menu: ['Serving team in club uniform', 'One server for every 15 guests', 'A team leader on site', 'Water and salad rounds', 'Clearing between batches'],
    menuBn: ['ক্লাবের পোশাকে পরিবেশনকারী দল', 'প্রতি ১৫ জন অতিথিতে একজন', 'জায়গায় একজন দলনেতা', 'জল ও স্যালাড পরিবেশন', 'প্রতি ব্যাচের পর পরিষ্কার'],
  },
  {
    id: 'tableware', name: 'Team + tableware', nameBn: 'পরিবেশন ও থালা-গেলাস', rate: 60, min: 50, popular: true,
    for: 'Annaprashan, pujas, birthdays', forBn: 'অন্নপ্রাশন, পূজা, জন্মদিন',
    menu: ['Everything in Serving team', 'Banana-leaf or paper plates', 'Glasses and bowls', 'Water jugs on every table', 'Wash-up after the event'],
    menuBn: ['পরিবেশনের সব কিছু', 'কলাপাতা বা কাগজের থালা', 'গেলাস ও বাটি', 'প্রতি টেবিলে জলের জগ', 'অনুষ্ঠানের পর ধোয়ামোছা'],
  },
  {
    id: 'full', name: 'Full setup', nameBn: 'সম্পূর্ণ ব্যবস্থা', rate: 95, min: 80,
    for: 'Weddings, receptions, large gatherings', forBn: 'বিয়ে, বউভাত, বড় অনুষ্ঠান',
    menu: ['Everything in Team + tableware', 'Tables laid with covers', 'Buffet counters', 'Chafing dishes to keep food hot', 'Set up 2 hours before, packed away after'],
    menuBn: ['পরিবেশন ও থালা-গেলাসের সব কিছু', 'ঢাকা দেওয়া টেবিল সাজানো', 'বুফে কাউন্টার', 'খাবার গরম রাখার চেফিং ডিশ', '২ ঘণ্টা আগে সাজানো, পরে গুছিয়ে নেওয়া'],
  },
];
export const serversFor = (guests) => Math.max(2, Math.ceil(guests / 15));
export const memberRate = (rate, member) => (member ? Math.round(rate * 0.9) : rate);

export const cateringOrders = [
  { id: 'CT-26-0041', customer: 'Sen family', customerBn: 'সেন পরিবার', member: true, occasion: 'Annaprashan', date: '22 Nov', guests: 70, pkg: 'tableware', status: 'advance', amount: 3780, paid: 800 },
  { id: 'CT-26-0042', customer: 'Riya & Arka wedding', customerBn: 'রিয়া ও অর্কর বিয়ে', member: false, occasion: 'Wedding reception', date: '6 Dec', guests: 220, pkg: 'full', status: 'quoted', amount: 20900, paid: 0 },
  { id: 'CT-26-0043', customer: 'Lipika Paul', customerBn: 'লিপিকা পাল', member: true, occasion: '60th birthday', date: '29 Nov', guests: 45, pkg: 'team', status: 'enquiry', amount: 1440, paid: 0 },
  { id: 'CT-26-0039', customer: 'Bose Hardware', customerBn: 'বোস হার্ডওয়্যার', member: false, occasion: 'Staff lunch', date: '15 Nov', guests: 35, pkg: 'team', status: 'done', amount: 1225, paid: 300 },
  { id: 'CT-26-0044', customer: 'Kar family', customerBn: 'কর পরিবার', member: true, occasion: 'Shraddha', date: '3 Dec', guests: 90, pkg: 'tableware', status: 'advance', amount: 4860, paid: 1000 },
  { id: 'CT-26-0045', customer: 'School alumni', customerBn: 'স্কুলের প্রাক্তনী', member: false, occasion: 'Reunion', date: '20 Dec', guests: 120, pkg: 'full', status: 'enquiry', amount: 11400, paid: 0 },
  { id: 'CT-26-0036', customer: 'Dey family', customerBn: 'দে পরিবার', member: true, occasion: 'Wedding', date: '1 Nov', guests: 160, pkg: 'full', status: 'settled', amount: 13760, paid: 13760 },
];

export const cateringStatus = {
  enquiry: { en: 'Enquiry', bn: 'জিজ্ঞাসা' },
  quoted: { en: 'Quoted', bn: 'কোটেশন' },
  advance: { en: 'Advance paid', bn: 'অগ্রিম' },
  done: { en: 'Served, bill due', bn: 'পরিবেশিত, বিল বাকি' },
  settled: { en: 'Settled', bn: 'মিটেছে' },
};

export const plants = [
  { id: 'p1', name: 'Hibiscus (Joba)', nameBn: 'জবা', cat: 'flowering', pot: '8"', price: 120, stock: 34, icon: 'flower-2' },
  { id: 'p2', name: 'Night jasmine (Shiuli)', nameBn: 'শিউলি', cat: 'flowering', pot: '10"', price: 180, stock: 12, icon: 'flower' },
  { id: 'p3', name: 'Rajanigandha', nameBn: 'রজনীগন্ধা', cat: 'flowering', pot: 'Bulbs ×10', price: 90, stock: 60, icon: 'flower' },
  { id: 'p4', name: 'Marigold (Gada)', nameBn: 'গাঁদা', cat: 'seasonal', pot: 'Seedling tray', price: 60, stock: 140, icon: 'sun' },
  { id: 'p5', name: 'Dahlia', nameBn: 'ডালিয়া', cat: 'seasonal', pot: '10"', price: 150, stock: 26, icon: 'flower-2', isNew: true },
  { id: 'p6', name: 'Chrysanthemum', nameBn: 'চন্দ্রমল্লিকা', cat: 'seasonal', pot: '8"', price: 130, stock: 4, icon: 'flower', isNew: true },
  { id: 'p7', name: 'Tulsi', nameBn: 'তুলসী', cat: 'medicinal', pot: '6"', price: 50, stock: 48, icon: 'leaf' },
  { id: 'p8', name: 'Aloe vera', nameBn: 'ঘৃতকুমারী', cat: 'medicinal', pot: '6"', price: 70, stock: 30, icon: 'sprout' },
  { id: 'p9', name: 'Lemon (Kagzi)', nameBn: 'কাগজি লেবু', cat: 'fruit', pot: '12"', price: 260, stock: 9, icon: 'citrus' },
  { id: 'p10', name: 'Guava (grafted)', nameBn: 'পেয়ারা (কলম)', cat: 'fruit', pot: '12"', price: 320, stock: 7, icon: 'apple' },
  { id: 'p11', name: 'Money plant', nameBn: 'মানি প্ল্যান্ট', cat: 'indoor', pot: '6"', price: 80, stock: 52, icon: 'leaf' },
  { id: 'p12', name: 'Snake plant', nameBn: 'স্নেক প্ল্যান্ট', cat: 'indoor', pot: '8"', price: 220, stock: 3, icon: 'sprout' },
  { id: 'p13', name: 'Bougainvillea', nameBn: 'বাগানবিলাস', cat: 'flowering', pot: '10"', price: 200, stock: 18, icon: 'flower-2' },
  { id: 'p14', name: 'Curry leaf', nameBn: 'কারিপাতা', cat: 'medicinal', pot: '8"', price: 110, stock: 0, icon: 'leaf' },
];
export const plantCats = {
  all: { en: 'All', bn: 'সব' },
  seasonal: { en: 'Winter seasonal', bn: 'শীতের ফুল' },
  flowering: { en: 'Flowering', bn: 'ফুলের গাছ' },
  fruit: { en: 'Fruit', bn: 'ফলের গাছ' },
  medicinal: { en: 'Medicinal', bn: 'ঔষধি' },
  indoor: { en: 'Indoor', bn: 'ঘরের গাছ' },
};
export const memberDiscount = 0.1;

// Khata entries (Nov 2026)
export const ledger = [
  { date: '13 Nov', book: 'club', type: 'in', head: 'Subscription — MC-0110, 3 months', headBn: 'চাঁদা — MC-0110, ৩ মাস', amount: 300, by: 'Tapas M.', ref: 'MC-26-0412' },
  { date: '13 Nov', book: 'nursery', type: 'in', head: 'Counter sale — 6 items', headBn: 'কাউন্টার বিক্রি — ৬টি', amount: 830, by: 'Sutapa B.', ref: 'NS-26-0311' },
  { date: '12 Nov', book: 'catering', type: 'out', head: 'Paper plates & glasses — wholesale', headBn: 'কাগজের থালা ও গেলাস — পাইকারি', amount: 6420, by: 'Debashis P.', ref: 'Bill', bill: true },
  { date: '12 Nov', book: 'club', type: 'out', head: 'Electricity — CESC, Oct', headBn: 'বিদ্যুৎ — সিইএসসি, অক্টো', amount: 1870, by: 'Tapas M.', ref: 'Bill', bill: true },
  { date: '11 Nov', book: 'catering', type: 'in', head: 'Advance — CT-26-0044 Kar family', headBn: 'অগ্রিম — CT-26-0044 কর পরিবার', amount: 10000, by: 'Debashis P.', ref: 'CT-26-0044' },
  { date: '10 Nov', book: 'nursery', type: 'out', head: 'Saplings — Galiff Street wholesale', headBn: 'চারাগাছ — গ্যালিফ স্ট্রিট', amount: 3250, by: 'Sutapa B.', ref: 'Bill', bill: true },
  { date: '10 Nov', book: 'club', type: 'in', head: 'Subscription — MC-0131, 6 months', headBn: 'চাঁদা — MC-0131, ৬ মাস', amount: 600, by: 'Tapas M.', ref: 'MC-26-0409' },
  { date: '09 Nov', book: 'club', type: 'out', head: 'Kali Puja — decorator balance', headBn: 'কালীপূজা — ডেকোরেটর বাকি', amount: 8000, by: 'Kakoli S.', ref: 'Bill', bill: true },
  { date: '08 Nov', book: 'nursery', type: 'in', head: 'Counter sale — 11 items', headBn: 'কাউন্টার বিক্রি — ১১টি', amount: 1460, by: 'Sutapa B.', ref: 'NS-26-0302' },
  { date: '07 Nov', book: 'catering', type: 'in', head: 'Final bill — CT-26-0036 Dey family', headBn: 'চূড়ান্ত বিল — CT-26-0036 দে পরিবার', amount: 37200, by: 'Debashis P.', ref: 'CT-26-0036' },
  { date: '07 Nov', book: 'catering', type: 'out', head: 'Serving team wages', headBn: 'পরিবেশনকারীদের মজুরি', amount: 9600, by: 'Debashis P.', ref: 'Voucher' },
  { date: '05 Nov', book: 'club', type: 'in', head: 'Kali Puja chanda — Lane 2', headBn: 'কালীপূজা চাঁদা — ২ নং গলি', amount: 7350, by: 'Bapi H.', ref: 'Book 4' },
];

export const books = {
  club: { en: 'Club', bn: 'ক্লাব', income: 41250, expense: 23980, prefix: 'MC' },
  catering: { en: 'Catering', bn: 'ক্যাটারিং', income: 96400, expense: 61850, prefix: 'CT' },
  nursery: { en: 'Nursery', bn: 'নার্সারি', income: 18940, expense: 9120, prefix: 'NS' },
};

export const chanda = {
  event: 'Saraswati Puja 2027',
  eventBn: 'সরস্বতী পূজা ২০২৭',
  target: 85000,
  budget: [
    { head: 'Idol', headBn: 'প্রতিমা', amount: 18000 },
    { head: 'Pandal & lights', headBn: 'প্যান্ডেল ও আলো', amount: 24000 },
    { head: 'Bhog (600 plates)', headBn: 'ভোগ (৬০০ প্লেট)', amount: 21000 },
    { head: 'Purohit & puja items', headBn: 'পুরোহিত ও পূজার সামগ্রী', amount: 8500 },
    { head: 'Cultural evening', headBn: 'সাংস্কৃতিক সন্ধ্যা', amount: 9500 },
    { head: 'Misc. & contingency', headBn: 'বিবিধ', amount: 4000 },
  ],
  areas: [
    { lane: 'Lane 1', laneBn: '১ নং গলি', volunteer: 'Bapi Halder', target: 15000, got: 11200, houses: 48, visited: 37 },
    { lane: 'Lane 2', laneBn: '২ নং গলি', volunteer: 'Moumita Kar', target: 15000, got: 14100, houses: 44, visited: 42 },
    { lane: 'Lane 3', laneBn: '৩ নং গলি', volunteer: 'Manas Kundu', target: 12000, got: 5400, houses: 39, visited: 16 },
    { lane: 'Pukur Par', laneBn: 'পুকুর পাড়', volunteer: 'Tumpa Guha', target: 10000, got: 8650, houses: 31, visited: 27 },
    { lane: 'School Road', laneBn: 'স্কুল রোড', volunteer: 'Sanjay Nandi', target: 13000, got: 6100, houses: 52, visited: 20 },
  ],
  sponsors: [
    { name: 'Bose Hardware', nameBn: 'বোস হার্ডওয়্যার', amount: 10000, gives: 'Gate banner', givesBn: 'গেট ব্যানার', status: 'paid' },
    { name: 'Annapurna Sweets', nameBn: 'অন্নপূর্ণা মিষ্টান্ন', amount: 5000, gives: 'Bhog counter board', givesBn: 'ভোগ কাউন্টার বোর্ড', status: 'promised' },
    { name: 'Dr. N. Dutta Clinic', nameBn: 'ডাঃ এন. দত্ত ক্লিনিক', amount: 3000, gives: 'Stage mention', givesBn: 'মঞ্চে ঘোষণা', status: 'paid' },
  ],
};

export const notices = [
  { id: 'n1', date: '12 Nov', pinned: true, tag: 'Meeting', tagBn: 'সভা', title: 'Committee meeting — Saraswati Puja planning', titleBn: 'কমিটি সভা — সরস্বতী পূজার প্রস্তুতি', body: 'Sunday 16 Nov, 6 pm at the club room. Budget and volunteer list will be finalised.', bodyBn: 'রবিবার ১৬ নভেম্বর, সন্ধ্যা ৬টা, ক্লাব ঘরে। বাজেট ও স্বেচ্ছাসেবক তালিকা চূড়ান্ত হবে।' },
  { id: 'n2', date: '10 Nov', tag: 'Sports', tagBn: 'খেলা', title: 'Sports Day entries open', titleBn: 'বার্ষিক ক্রীড়ার নাম জমা শুরু', body: 'Register children and adults in the app before 7 Dec. Sack race is back.', bodyBn: '৭ ডিসেম্বরের আগে অ্যাপে নাম দিন। এবার বস্তা দৌড় ফিরছে।' },
  { id: 'n3', date: '06 Nov', tag: 'Nursery', tagBn: 'নার্সারি', title: 'Winter flowers have arrived', titleBn: 'শীতের ফুলের চারা এসে গেছে', body: 'Dahlia and chrysanthemum in stock. Members get 10% off at the counter.', bodyBn: 'ডালিয়া ও চন্দ্রমল্লিকা এসেছে। সদস্যদের জন্য ১০% ছাড়।' },
  { id: 'n4', date: '28 Oct', tag: 'Accounts', tagBn: 'হিসাব', title: 'Durga Puja 2026 accounts published', titleBn: 'দুর্গাপূজা ২০২৬-এর হিসাব প্রকাশিত', body: 'Full income and expenditure is available in the app under Notices.', bodyBn: 'সম্পূর্ণ আয়-ব্যয়ের হিসাব অ্যাপে দেখা যাবে।' },
];

/* ---------- Committee console: admin registers (added; sample data only) ---------- */

// Who holds club cash right now. Collectors hand over to the treasurer, who banks it.
export const cashHolders = [
  { id: 'tapas', name: 'Tapas Mondal', nameBn: 'তাপস মণ্ডল', role: 'Treasurer', roleBn: 'কোষাধ্যক্ষ', book: 'club', amount: 4850, since: '9 Nov', sinceBn: '৯ নভে', receipts: 11, treasurer: true },
  { id: 'bapi', name: 'Bapi Halder', nameBn: 'বাপি হালদার', role: 'Chanda volunteer · Lane 1', roleBn: 'চাঁদা স্বেচ্ছাসেবক · ১ নং গলি', book: 'club', amount: 7350, since: '5 Nov', sinceBn: '৫ নভে', receipts: 42 },
  { id: 'debashis', name: 'Debashis Pal', nameBn: 'দেবাশিস পাল', role: 'Catering in-charge', roleBn: 'ক্যাটারিং দায়িত্বে', book: 'catering', amount: 3200, since: '11 Nov', sinceBn: '১১ নভে', receipts: 2 },
  { id: 'sutapa', name: 'Sutapa Bose', nameBn: 'সুতপা বসু', role: 'Nursery in-charge', roleBn: 'নার্সারি দায়িত্বে', book: 'nursery', amount: 2290, since: '8 Nov', sinceBn: '৮ নভে', receipts: 17 },
];

export const bank = {
  name: 'State Bank of India · Netaji Para branch', nameBn: 'স্টেট ব্যাংক · নেতাজি পাড়া শাখা',
  account: 'Savings ••••4417', ifsc: 'SBIN0011823',
  balance: 184320, lastImport: '14 Nov', lastImportBn: '১৪ নভে',
  statement: [
    { id: 'b1', date: '13 Nov', desc: 'UPI/431298765012/RAJIB BANERJEE', amount: 500, type: 'in', match: 'MC-26-0411' },
    { id: 'b2', date: '13 Nov', desc: 'UPI/431277120934/ANANYA MUKHERJEE', amount: 200, type: 'in', match: null },
    { id: 'b3', date: '12 Nov', desc: 'BILLPAY/CESC/OCT-26', amount: 1870, type: 'out', match: 'Electricity — CESC, Oct' },
    { id: 'b4', date: '11 Nov', desc: 'NEFT/KAR SUBHASIS/CATERING ADV', amount: 10000, type: 'in', match: 'CT-26-0044' },
    { id: 'b5', date: '10 Nov', desc: 'CASH DEPOSIT/SELF/SLIP 20981', amount: 12000, type: 'in', match: 'Cash deposit, slip 20981' },
    { id: 'b6', date: '09 Nov', desc: 'CHQ 000148/MAA TARA DECORATORS', amount: 8000, type: 'out', match: 'Kali Puja — decorator balance' },
    { id: 'b7', date: '07 Nov', desc: 'IMPS/DEY ARUP/WEDDING FINAL', amount: 37200, type: 'in', match: 'CT-26-0036' },
    { id: 'b8', date: '05 Nov', desc: 'SMS ALERT CHARGES Q3', amount: 18, type: 'out', match: null },
    { id: 'b9', date: '01 Nov', desc: 'CREDIT INTEREST', amount: 412, type: 'in', match: null },
  ],
};

export const auditLog = [
  { id: 'a01', at: '15 Nov, 2:00 am', atBn: '১৫ নভে, রাত ২:০০', who: 'System', whoBn: 'সিস্টেম', mod: 'data', en: 'Nightly backup completed · 4.2 MB', bn: 'রাতের ব্যাকআপ সম্পূর্ণ · ৪.২ MB', device: 'Server' },
  { id: 'a02', at: '13 Nov, 7:42 pm', atBn: '১৩ নভে, সন্ধ্যা ৭:৪২', who: 'Tapas Mondal', whoBn: 'তাপস মণ্ডল', mod: 'collect', en: 'Recorded ₹300 cash from MC-0110 · receipt MC-26-0412', bn: 'MC-0110 থেকে ₹৩০০ নগদ · রসিদ MC-26-0412', device: 'Club-room laptop' },
  { id: 'a03', at: '13 Nov, 7:10 pm', atBn: '১৩ নভে, সন্ধ্যা ৭:১০', who: 'Rajib Banerjee', whoBn: 'রাজীব ব্যানার্জি', mod: 'settings', en: 'Invited Kakoli Sen as Puja in-charge', bn: 'কাকলি সেনকে পূজা দায়িত্বে আমন্ত্রণ', device: 'Android phone' },
  { id: 'a04', at: '13 Nov, 6:55 pm', atBn: '১৩ নভে, সন্ধ্যা ৬:৫৫', who: 'Sutapa Bose', whoBn: 'সুতপা বসু', mod: 'nursery', en: 'Counter sale NS-26-0311 · 6 items · ₹830', bn: 'কাউন্টার বিক্রি NS-26-0311 · ৬টি · ₹৮৩০', device: 'Nursery tablet' },
  { id: 'a05', at: '12 Nov, 8:20 pm', atBn: '১২ নভে, রাত ৮:২০', who: 'Debashis Pal', whoBn: 'দেবাশিস পাল', mod: 'khata', en: 'Expense ₹6,420 · paper plates & glasses · bill photo attached', bn: 'খরচ ₹৬,৪২০ · কাগজের থালা ও গেলাস · বিলের ছবি', device: 'Android phone' },
  { id: 'a06', at: '12 Nov, 8:05 pm', atBn: '১২ নভে, রাত ৮:০৫', who: 'Tapas Mondal', whoBn: 'তাপস মণ্ডল', mod: 'khata', en: 'Cancelled receipt MC-26-0405 · wrong family · reissued as MC-26-0406', bn: 'রসিদ MC-26-0405 বাতিল · ভুল পরিবার · নতুন রসিদ MC-26-0406', device: 'Club-room laptop', flag: true },
  { id: 'a07', at: '12 Nov, 11:40 am', atBn: '১২ নভে, সকাল ১১:৪০', who: 'Rajib Banerjee', whoBn: 'রাজীব ব্যানার্জি', mod: 'members', en: 'Approved application AP-26-016 · new family MC-0172', bn: 'আবেদন AP-26-016 অনুমোদিত · নতুন পরিবার MC-0172', device: 'Android phone' },
  { id: 'a08', at: '11 Nov, 9:14 pm', atBn: '১১ নভে, রাত ৯:১৪', who: 'Unknown', whoBn: 'অজানা', mod: 'security', en: '3 wrong passwords for Sutapa Bose · sign-in paused 15 min', bn: 'সুতপা বসুর ৩ বার ভুল পাসওয়ার্ড · ১৫ মিনিট লগইন বন্ধ', device: 'Chrome · Howrah', flag: true },
  { id: 'a09', at: '11 Nov, 6:30 pm', atBn: '১১ নভে, সন্ধ্যা ৬:৩০', who: 'Debashis Pal', whoBn: 'দেবাশিস পাল', mod: 'catering', en: 'Advance ₹10,000 recorded for CT-26-0044 Kar family', bn: 'CT-26-0044 কর পরিবারের অগ্রিম ₹১০,০০০', device: 'Android phone' },
  { id: 'a10', at: '10 Nov, 7:50 pm', atBn: '১০ নভে, সন্ধ্যা ৭:৫০', who: 'Tapas Mondal', whoBn: 'তাপস মণ্ডল', mod: 'cash', en: 'Deposited ₹12,000 cash to SBI · slip 20981', bn: 'SBI-তে ₹১২,০০০ নগদ জমা · স্লিপ ২০৯৮১', device: 'Club-room laptop' },
  { id: 'a11', at: '10 Nov, 10:02 am', atBn: '১০ নভে, সকাল ১০:০২', who: 'Rajib Banerjee', whoBn: 'রাজীব ব্যানার্জি', mod: 'settings', en: 'Changed lapse rule from 9 to 6 months due', bn: 'মেয়াদোত্তীর্ণের নিয়ম ৯ থেকে ৬ মাস', device: 'Android phone', flag: true },
  { id: 'a12', at: '09 Nov, 8:45 pm', atBn: '০৯ নভে, রাত ৮:৪৫', who: 'Kakoli Sen', whoBn: 'কাকলি সেন', mod: 'khata', en: 'Expense ₹8,000 · Kali Puja decorator balance · signed by Tapas Mondal', bn: 'খরচ ₹৮,০০০ · কালীপূজা ডেকোরেটর · তাপস মণ্ডলের সই', device: 'Android phone' },
  { id: 'a13', at: '08 Nov, 5:10 pm', atBn: '০৮ নভে, বিকেল ৫:১০', who: 'Bapi Halder', whoBn: 'বাপি হালদার', mod: 'events', en: 'Gate scanner synced 286 passes · Sports Day', bn: 'গেট স্ক্যানারে ২৮৬টি পাস সিঙ্ক · ক্রীড়া দিবস', device: 'Android phone' },
  { id: 'a14', at: '06 Nov, 4:00 pm', atBn: '০৬ নভে, বিকেল ৪:০০', who: 'Rajib Banerjee', whoBn: 'রাজীব ব্যানার্জি', mod: 'members', en: 'Waived 3 months (₹300) for MC-0125 · death in the family', bn: 'MC-0125-এর ৩ মাস (₹৩০০) মকুব · পরিবারে শোক', device: 'Club-room laptop' },
];

// Club property: chairs, tableware for catering, pandal material, sports kit.
export const assets = [
  { id: 'AS-01', name: 'Plastic chairs', nameBn: 'প্লাস্টিকের চেয়ার', book: 'club', qty: 220, out: 40, place: 'Club godown', placeBn: 'ক্লাবের গুদাম', cond: 'good', value: 66000 },
  { id: 'AS-02', name: 'Folding tables (6 ft)', nameBn: 'ভাঁজ করা টেবিল (৬ ফুট)', book: 'club', qty: 24, out: 0, place: 'Club godown', placeBn: 'ক্লাবের গুদাম', cond: 'good', value: 43200 },
  { id: 'AS-03', name: 'Chafing dishes', nameBn: 'চেফিং ডিশ', book: 'catering', qty: 18, out: 6, place: 'Catering store', placeBn: 'ক্যাটারিং স্টোর', cond: 'good', value: 37800 },
  { id: 'AS-04', name: 'Steel serving buckets', nameBn: 'স্টিলের পরিবেশন বালতি', book: 'catering', qty: 30, out: 0, place: 'Catering store', placeBn: 'ক্যাটারিং স্টোর', cond: 'worn', value: 12000 },
  { id: 'AS-05', name: 'Server uniforms (aprons + caps)', nameBn: 'পরিবেশনকারীর পোশাক (অ্যাপ্রন ও টুপি)', book: 'catering', qty: 26, out: 0, place: 'Catering store', placeBn: 'ক্যাটারিং স্টোর', cond: 'good', value: 9100 },
  { id: 'AS-06', name: 'Sound system (2 speakers + mixer)', nameBn: 'সাউন্ড সিস্টেম (২ স্পিকার ও মিক্সার)', book: 'club', qty: 1, out: 0, place: 'Club room', placeBn: 'ক্লাব ঘর', cond: 'repair', value: 48000 },
  { id: 'AS-07', name: 'Pandal bamboo & cloth', nameBn: 'প্যান্ডেলের বাঁশ ও কাপড়', book: 'club', qty: 1, out: 0, place: 'Roof store', placeBn: 'ছাদের স্টোর', cond: 'good', value: 22000 },
  { id: 'AS-08', name: 'Carrom boards', nameBn: 'ক্যারম বোর্ড', book: 'club', qty: 4, out: 1, place: 'Club room', placeBn: 'ক্লাব ঘর', cond: 'good', value: 8800 },
  { id: 'AS-09', name: 'First-aid kit & stretcher', nameBn: 'ফার্স্ট-এড বাক্স ও স্ট্রেচার', book: 'club', qty: 1, out: 0, place: 'Club room', placeBn: 'ক্লাব ঘর', cond: 'good', value: 6500 },
  { id: 'AS-10', name: 'Nursery tools & sprayers', nameBn: 'নার্সারির যন্ত্রপাতি ও স্প্রেয়ার', book: 'nursery', qty: 12, out: 0, place: 'Nursery shed', placeBn: 'নার্সারি শেড', cond: 'worn', value: 7400 },
];
export const assetLoans = [
  { id: 'LN-031', asset: 'AS-01', qty: 40, to: 'Sen family (MC-0116)', toBn: 'সেন পরিবার (MC-0116)', out: '12 Nov', due: '14 Nov', deposit: 400, overdue: true },
  { id: 'LN-032', asset: 'AS-03', qty: 6, to: 'Catering CT-26-0041 · Sen Annaprashan', toBn: 'ক্যাটারিং CT-26-0041 · সেন অন্নপ্রাশন', out: '15 Nov', due: '23 Nov', deposit: 0 },
  { id: 'LN-033', asset: 'AS-08', qty: 1, to: 'Lane 3 youth (Manas Kundu)', toBn: '৩ নং গলির যুবক (মানস কুণ্ডু)', out: '1 Nov', due: '30 Nov', deposit: 0 },
];

export const volunteers = [
  { name: 'Bapi Halder', nameBn: 'বাপি হালদার', lane: 'Lane 1', laneBn: '১ নং গলি', skills: ['gate', 'chanda'], hours: 64, phone: '9831204411' },
  { name: 'Moumita Kar', nameBn: 'মৌমিতা কর', lane: 'Lane 2', laneBn: '২ নং গলি', skills: ['chanda', 'registration', 'first-aid'], hours: 51, phone: '9831977720' },
  { name: 'Manas Kundu', nameBn: 'মানস কুণ্ডু', lane: 'Lane 3', laneBn: '৩ নং গলি', skills: ['gate', 'sports'], hours: 38, phone: '9830077145' },
  { name: 'Tumpa Guha', nameBn: 'টুম্পা গুহ', lane: 'Pukur Par', laneBn: 'পুকুর পাড়', skills: ['bhog', 'registration'], hours: 45, phone: '9874411209' },
  { name: 'Sanjay Nandi', nameBn: 'সঞ্জয় নন্দী', lane: 'School Road', laneBn: 'স্কুল রোড', skills: ['serving', 'gate'], hours: 72, phone: '9903310087' },
  { name: 'Arindam Dey', nameBn: 'অরিন্দম দে', lane: 'Lane 1', laneBn: '১ নং গলি', skills: ['sports', 'sound'], hours: 29, phone: '9830551908' },
  { name: 'Payel Majumdar', nameBn: 'পায়েল মজুমদার', lane: 'Lane 3', laneBn: '৩ নং গলি', skills: ['first-aid', 'registration'], hours: 22, phone: '9836620193' },
  { name: 'Gopal Biswas', nameBn: 'গোপাল বিশ্বাস', lane: 'Pukur Par', laneBn: 'পুকুর পাড়', skills: ['serving', 'bhog'], hours: 58, phone: '9831188026' },
  { name: 'Nirmal Dutta', nameBn: 'নির্মল দত্ত', lane: 'Lane 2', laneBn: '২ নং গলি', skills: ['serving', 'sound'], hours: 34, phone: '9830465521' },
  { name: 'Jhuma Sarkar', nameBn: 'ঝুমা সরকার', lane: 'School Road', laneBn: 'স্কুল রোড', skills: ['bhog', 'chanda'], hours: 40, phone: '9874002315' },
];
export const volunteerSkills = {
  gate: { en: 'Gate & scanner', bn: 'গেট ও স্ক্যানার' },
  chanda: { en: 'Chanda', bn: 'চাঁদা' },
  registration: { en: 'Registration desk', bn: 'নাম লেখার টেবিল' },
  'first-aid': { en: 'First aid', bn: 'প্রাথমিক চিকিৎসা' },
  sports: { en: 'Sports', bn: 'খেলাধুলা' },
  bhog: { en: 'Bhog & kitchen', bn: 'ভোগ ও রান্নাঘর' },
  serving: { en: 'Serving & set-up', bn: 'পরিবেশন ও সাজানো' },
  sound: { en: 'Sound & lights', bn: 'সাউন্ড ও আলো' },
};
export const duties = {
  blood: [
    { duty: 'Registration desk', dutyBn: 'নাম লেখার টেবিল', time: '8:30 am – 2 pm', skill: 'registration', need: 3, who: ['Moumita Kar', 'Payel Majumdar'] },
    { duty: 'Donor care & refreshments', dutyBn: 'রক্তদাতার যত্ন ও জলখাবার', time: '9 am – 2 pm', skill: 'first-aid', need: 2, who: ['Payel Majumdar'] },
    { duty: 'Chairs & set-up', dutyBn: 'চেয়ার ও সাজানো', time: '7:30 – 9 am', skill: 'serving', need: 4, who: ['Sanjay Nandi', 'Gopal Biswas', 'Nirmal Dutta', 'Bapi Halder'] },
  ],
  sports: [
    { duty: 'Gate & pass scanner', dutyBn: 'গেট ও পাস স্ক্যানার', time: '6:30 am – 1 pm', skill: 'gate', need: 3, who: ['Bapi Halder', 'Manas Kundu'] },
    { duty: 'Track & events', dutyBn: 'ট্র্যাক ও খেলা', time: '7 am – 12 pm', skill: 'sports', need: 4, who: ['Arindam Dey', 'Manas Kundu'] },
    { duty: 'First-aid tent', dutyBn: 'ফার্স্ট-এড তাঁবু', time: '7 am – 1 pm', skill: 'first-aid', need: 2, who: ['Moumita Kar'] },
    { duty: 'Breakfast counter', dutyBn: 'জলখাবারের কাউন্টার', time: '8 – 10 am', skill: 'bhog', need: 3, who: ['Tumpa Guha', 'Jhuma Sarkar', 'Gopal Biswas'] },
    { duty: 'Sound & announcements', dutyBn: 'সাউন্ড ও ঘোষণা', time: '6:30 am – 1 pm', skill: 'sound', need: 1, who: ['Nirmal Dutta'] },
  ],
  picnic: [
    { duty: 'Bus attendance', dutyBn: 'বাসে হাজিরা', time: '6 – 6:30 am', skill: 'registration', need: 2, who: [] },
    { duty: 'Lunch serving', dutyBn: 'দুপুরের খাবার পরিবেশন', time: '1 – 3 pm', skill: 'serving', need: 5, who: ['Sanjay Nandi', 'Gopal Biswas'] },
  ],
};

// What each committee role can do. full = add and change, own = only their own book or entries, view = read only.
export const rolePerms = {
  roles: [
    { id: 'secretary', en: 'Secretary (admin)', bn: 'সম্পাদক (অ্যাডমিন)', people: 'Rajib Banerjee', peopleBn: 'রাজীব ব্যানার্জি' },
    { id: 'treasurer', en: 'Treasurer', bn: 'কোষাধ্যক্ষ', people: 'Tapas Mondal', peopleBn: 'তাপস মণ্ডল' },
    { id: 'puja', en: 'Puja in-charge', bn: 'পূজা দায়িত্বে', people: 'Kakoli Sen', peopleBn: 'কাকলি সেন' },
    { id: 'catering', en: 'Catering in-charge', bn: 'ক্যাটারিং দায়িত্বে', people: 'Debashis Pal', peopleBn: 'দেবাশিস পাল' },
    { id: 'nursery', en: 'Nursery in-charge', bn: 'নার্সারি দায়িত্বে', people: 'Sutapa Bose', peopleBn: 'সুতপা বসু' },
    { id: 'volunteer', en: 'Volunteer', bn: 'স্বেচ্ছাসেবক', people: 'Bapi Halder', peopleBn: 'বাপি হালদার' },
  ],
  modules: [
    { id: 'members', en: 'Families, applications & cards', bn: 'পরিবার, আবেদন ও কার্ড', screens: ['applications', 'members', 'cards', 'donors'], p: { secretary: 'full', treasurer: 'full', puja: 'view', catering: 'none', nursery: 'none', volunteer: 'none' } },
    { id: 'money', en: 'Collect, dues & receipts', bn: 'জমা, বকেয়া ও রসিদ', screens: ['collect', 'dues', 'receipts'], p: { secretary: 'view', treasurer: 'full', puja: 'none', catering: 'none', nursery: 'none', volunteer: 'none' } },
    { id: 'khata', en: 'Khata', bn: 'খাতা', screens: ['khata'], p: { secretary: 'view', treasurer: 'full', puja: 'own', catering: 'own', nursery: 'own', volunteer: 'none' } },
    { id: 'cash', en: 'Cash & bank', bn: 'নগদ ও ব্যাংক', screens: ['cash'], p: { secretary: 'view', treasurer: 'full', puja: 'own', catering: 'own', nursery: 'own', volunteer: 'own' } },
    { id: 'chanda', en: 'Puja chanda', bn: 'পূজার চাঁদা', screens: ['chanda'], p: { secretary: 'full', treasurer: 'full', puja: 'full', catering: 'none', nursery: 'none', volunteer: 'own' } },
    { id: 'catering', en: 'Catering', bn: 'ক্যাটারিং', screens: ['catering'], p: { secretary: 'view', treasurer: 'view', puja: 'none', catering: 'full', nursery: 'none', volunteer: 'none' } },
    { id: 'nursery', en: 'Nursery', bn: 'নার্সারি', screens: ['nursery'], p: { secretary: 'view', treasurer: 'view', puja: 'none', catering: 'none', nursery: 'full', volunteer: 'none' } },
    { id: 'events', en: 'Events, volunteers, assets & gallery', bn: 'অনুষ্ঠান, স্বেচ্ছাসেবক, সম্পত্তি ও ছবি', screens: ['events', 'panjika', 'volunteers', 'assets', 'gallery'], p: { secretary: 'full', treasurer: 'view', puja: 'full', catering: 'view', nursery: 'none', volunteer: 'view' } },
    { id: 'notices', en: 'Notices & meetings', bn: 'নোটিস ও সভা', screens: ['meetings'], p: { secretary: 'full', treasurer: 'full', puja: 'full', catering: 'view', nursery: 'view', volunteer: 'view' } },
    { id: 'admin', en: 'Reports, audit log & settings', bn: 'রিপোর্ট, অডিট লগ ও সেটিংস', screens: ['reports', 'audit', 'settings'], p: { secretary: 'full', treasurer: 'full', puja: 'none', catering: 'none', nursery: 'none', volunteer: 'none' } },
  ],
};

/* Bengali for free-text sample fields (pot sizes, occasions, times). Use bnText(value) when lang is bn. */
const BN_TEXT = {
  '6"': '৬ ইঞ্চি', '8"': '৮ ইঞ্চি', '10"': '১০ ইঞ্চি', '12"': '১২ ইঞ্চি', 'Bulbs ×10': '১০টি কন্দ', 'Seedling tray': 'চারার ট্রে',
  '60th birthday': '৬০তম জন্মদিন', Annaprashan: 'অন্নপ্রাশন', Reunion: 'পুনর্মিলন', Shraddha: 'শ্রাদ্ধ', 'Staff lunch': 'কর্মীদের দুপুরের খাওয়া', 'Wedding reception': 'বৌভাত', Wedding: 'বিয়ে',
  '1 – 3 pm': 'দুপুর ১টা – ৩টা', '6 – 6:30 am': 'ভোর ৬টা – ৬:৩০', '6:30 am – 1 pm': 'সকাল ৬:৩০ – দুপুর ১টা', '7 am onwards': 'সকাল ৭টা থেকে', '7 am – 1 pm': 'সকাল ৭টা – দুপুর ১টা',
  '7 am – 12 pm': 'সকাল ৭টা – দুপুর ১২টা', '7:30 – 9 am': 'সকাল ৭:৩০ – ৯টা', '8 – 10 am': 'সকাল ৮টা – ১০টা', '8:30 am – 2 pm': 'সকাল ৮:৩০ – দুপুর ২টা', '9 am – 2 pm': 'সকাল ৯টা – দুপুর ২টা',
  'Bus leaves 6:30 am': 'বাস ছাড়বে সকাল ৬:৩০', 'Pushpanjali 9:30 am': 'পুষ্পাঞ্জলি সকাল ৯:৩০',
  'Club-room laptop': 'ক্লাব ঘরের ল্যাপটপ', 'Android phone': 'অ্যান্ড্রয়েড ফোন', 'Chrome · Howrah': 'ক্রোম · হাওড়া', 'Nursery tablet': 'নার্সারির ট্যাবলেট', Server: 'সার্ভার',
  'Savings ••••4417': 'সঞ্চয় ••••৪৪১৭', 'Ashtami morning, our lane': 'অষ্টমীর সকাল, আমাদের গলি', 'Sent on WhatsApp': 'হোয়াটসঅ্যাপে পাঠানো',
  Wife: 'স্ত্রী', Husband: 'স্বামী', Son: 'ছেলে', Daughter: 'মেয়ে', Mother: 'মা', Father: 'বাবা', 'Mother-in-law': 'শাশুড়ি', 'Son, 9': 'ছেলে, ৯', 'Daughter, 16': 'মেয়ে, ১৬',
};
export const bnText = (s) => BN_TEXT[s] ?? s;
plants.forEach((p) => { p.potBn = bnText(p.pot); });
cateringOrders.forEach((o) => { o.occasionBn = bnText(o.occasion); });
events.forEach((e) => { e.timeBn = bnText(e.time); });
