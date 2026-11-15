// Sample data for the prototype. Placeholders until the club confirms real details.

export const club = {
  name: 'Gede Maitree Club',
  nameBn: 'গেদে মৈত্রী ক্লাব',
  para: 'Netaji Para',
  paraBn: 'নেতাজি পাড়া',
  estd: 1972,
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
  since: 1982 + ((i * 7) % 42),
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

export const cateringPackages = [
  {
    id: 'gharoa', name: 'Gharoa', nameBn: 'ঘরোয়া', rate: 280, min: 50,
    for: 'Annaprashan, small pujas, shraddha', forBn: 'অন্নপ্রাশন, ছোট পূজা, শ্রাদ্ধ',
    menu: ['Basanti pulao', 'Shukto', 'Moong dal with fish head', 'Aloo posto', 'Rui kalia', 'Chutney & papad', 'Rosogolla'],
    menuBn: ['বাসন্তী পোলাও', 'শুক্তো', 'মুড়িঘণ্ট', 'আলু পোস্ত', 'রুই কালিয়া', 'চাটনি ও পাঁপড়', 'রসগোল্লা'],
  },
  {
    id: 'utsab', name: 'Utsab', nameBn: 'উৎসব', rate: 420, min: 80, popular: true,
    for: 'Weddings, birthdays, reunions', forBn: 'বিয়ে, জন্মদিন, পুনর্মিলন',
    menu: ['Radhaballavi & cholar dal', 'Fish fry', 'Fried rice', 'Chingri malaikari', 'Kosha mangsho', 'Chutney & papad', 'Mishti doi & sandesh'],
    menuBn: ['রাধাবল্লভী ও ছোলার ডাল', 'ফিশ ফ্রাই', 'ফ্রায়েড রাইস', 'চিংড়ি মালাইকারি', 'কষা মাংস', 'চাটনি ও পাঁপড়', 'মিষ্টি দই ও সন্দেশ'],
  },
  {
    id: 'bhoj', name: 'Bhoj', nameBn: 'ভোজ', rate: 650, min: 100,
    for: 'Weddings & receptions', forBn: 'বিয়ে ও বউভাত',
    menu: ['Welcome drink & 2 starters', 'Luchi & aloor dom', 'Basanti pulao', 'Bhetki paturi', 'Golda chingri malaikari', 'Mutton biryani', 'Mishti doi, rosogolla, ice cream'],
    menuBn: ['ওয়েলকাম ড্রিংক ও ২টি স্টার্টার', 'লুচি ও আলুর দম', 'বাসন্তী পোলাও', 'ভেটকি পাতুরি', 'গলদা চিংড়ি মালাইকারি', 'মাটন বিরিয়ানি', 'মিষ্টি দই, রসগোল্লা, আইসক্রিম'],
  },
];

export const cateringOrders = [
  { id: 'CT-26-0041', customer: 'Sen family', customerBn: 'সেন পরিবার', member: true, occasion: 'Annaprashan', date: '22 Nov', guests: 70, pkg: 'gharoa', status: 'advance', amount: 19600, paid: 8000 },
  { id: 'CT-26-0042', customer: 'Riya & Arka wedding', customerBn: 'রিয়া ও অর্কর বিয়ে', member: false, occasion: 'Wedding reception', date: '6 Dec', guests: 220, pkg: 'bhoj', status: 'quoted', amount: 143000, paid: 0 },
  { id: 'CT-26-0043', customer: 'Lipika Paul', customerBn: 'লিপিকা পাল', member: true, occasion: '60th birthday', date: '29 Nov', guests: 45, pkg: 'gharoa', status: 'enquiry', amount: 12600, paid: 0 },
  { id: 'CT-26-0039', customer: 'Bose Hardware', customerBn: 'বোস হার্ডওয়্যার', member: false, occasion: 'Staff lunch', date: '15 Nov', guests: 35, pkg: 'gharoa', status: 'done', amount: 9800, paid: 4000 },
  { id: 'CT-26-0044', customer: 'Kar family', customerBn: 'কর পরিবার', member: true, occasion: 'Shraddha', date: '3 Dec', guests: 90, pkg: 'gharoa', status: 'advance', amount: 25200, paid: 10000 },
  { id: 'CT-26-0045', customer: 'School alumni', customerBn: 'স্কুলের প্রাক্তনী', member: false, occasion: 'Reunion', date: '20 Dec', guests: 120, pkg: 'utsab', status: 'enquiry', amount: 50400, paid: 0 },
  { id: 'CT-26-0036', customer: 'Dey family', customerBn: 'দে পরিবার', member: true, occasion: 'Wedding', date: '1 Nov', guests: 160, pkg: 'utsab', status: 'settled', amount: 67200, paid: 67200 },
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
  { date: '12 Nov', book: 'catering', type: 'out', head: 'Fish & prawn — Jagu Bazar', headBn: 'মাছ ও চিংড়ি — যদুবাজার', amount: 6420, by: 'Debashis P.', ref: 'Bill', bill: true },
  { date: '12 Nov', book: 'club', type: 'out', head: 'Electricity — CESC, Oct', headBn: 'বিদ্যুৎ — সিইএসসি, অক্টো', amount: 1870, by: 'Tapas M.', ref: 'Bill', bill: true },
  { date: '11 Nov', book: 'catering', type: 'in', head: 'Advance — CT-26-0044 Kar family', headBn: 'অগ্রিম — CT-26-0044 কর পরিবার', amount: 10000, by: 'Debashis P.', ref: 'CT-26-0044' },
  { date: '10 Nov', book: 'nursery', type: 'out', head: 'Saplings — Galiff Street wholesale', headBn: 'চারাগাছ — গ্যালিফ স্ট্রিট', amount: 3250, by: 'Sutapa B.', ref: 'Bill', bill: true },
  { date: '10 Nov', book: 'club', type: 'in', head: 'Subscription — MC-0131, 6 months', headBn: 'চাঁদা — MC-0131, ৬ মাস', amount: 600, by: 'Tapas M.', ref: 'MC-26-0409' },
  { date: '09 Nov', book: 'club', type: 'out', head: 'Kali Puja — decorator balance', headBn: 'কালীপূজা — ডেকোরেটর বাকি', amount: 8000, by: 'Kakoli S.', ref: 'Bill', bill: true },
  { date: '08 Nov', book: 'nursery', type: 'in', head: 'Counter sale — 11 items', headBn: 'কাউন্টার বিক্রি — ১১টি', amount: 1460, by: 'Sutapa B.', ref: 'NS-26-0302' },
  { date: '07 Nov', book: 'catering', type: 'in', head: 'Final bill — CT-26-0036 Dey family', headBn: 'চূড়ান্ত বিল — CT-26-0036 দে পরিবার', amount: 37200, by: 'Debashis P.', ref: 'CT-26-0036' },
  { date: '07 Nov', book: 'catering', type: 'out', head: 'Cook & helpers wages', headBn: 'রাঁধুনি ও জোগাড়ের মজুরি', amount: 9600, by: 'Debashis P.', ref: 'Voucher' },
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
