// Free photos under the Unsplash License, hotlinked from Unsplash's image CDN as Unsplash asks.
// Swap for the club's own photos when they arrive; keep the same keys.

const u = (id) => (w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const PHOTOS = {
  pujaNight: { src: u('1733038382444-9bd64e1df0de'), by: 'Dibakar Roy', page: 'https://unsplash.com/photos/zltEt617b78', alt: 'A Durga Puja pandal in Kolkata at night, people gathered around the stage', altBn: 'রাতে কলকাতার দুর্গাপূজার প্যান্ডেল' },
  pujaIdol: { src: u('1666159682323-e02a2c1795c6'), by: 'Anirban Sarkar', page: 'https://unsplash.com/photos/4chOzq_4s-w', alt: 'Durga Puja in Kolkata, evening', altBn: 'কলকাতার দুর্গাপূজা, সন্ধ্যা' },
  pujaCrowd: { src: u('1730028346011-1543dd5f5b1e'), by: 'Nishant Singh', page: 'https://unsplash.com/photos/JwLGMXPcIZo', alt: 'Evening Durga Puja procession with the idol and a crowd under festival lights', altBn: 'সন্ধ্যায় প্রতিমা নিয়ে শোভাযাত্রা' },
  sindoor: { src: u('1644476533751-f5691b78f9c9'), by: 'Sushmita Nag', page: 'https://unsplash.com/photos/tN-D7gP_TmM', alt: 'Women playing Sindoor Khela on the last day of Durga Puja, Kolkata', altBn: 'দশমীতে সিঁদুর খেলা, কলকাতা' },
  pujaMorning: { src: u('1640281694730-df0af5ca7bd2'), by: 'Sushmita Nag', page: 'https://unsplash.com/photos/hIJhbDP8Nio', alt: 'People in front of the Durga idol in the morning, Kolkata', altBn: 'সকালে প্রতিমার সামনে ভক্তরা, কলকাতা' },
  race: { src: u('1646399362077-01c5647f2308'), by: 'Anil Sharma', page: 'https://unsplash.com/photos/JVHOhx_AF2w', alt: 'A boy running an obstacle race on a sports field', altBn: 'মাঠে বাধা দৌড়ে একটি ছেলে' },
  runners: { src: u('1594388771969-a72da086806d'), by: 'Moon Bhuyan', page: 'https://unsplash.com/photos/nSL6ZFJNJl4', alt: 'Two children running on a road', altBn: 'রাস্তায় দৌড়চ্ছে দুটি শিশু' },
  feast: { src: u('1777613112862-f9ca6d6fa56e'), by: 'Adil Murshed', page: 'https://unsplash.com/photos/m2DOFYJCINw', alt: 'Bengali festive food in clay pots with marigolds', altBn: 'মাটির পাত্রে বাঙালি উৎসবের খাবার' },
  feast2: { src: u('1777613112895-139720bd43c9'), by: 'Adil Murshed', page: 'https://unsplash.com/photos/6QNkA7P3EhI', alt: 'Rice and curries served in clay pots', altBn: 'মাটির পাত্রে ভাত ও তরকারি' },
  kadai: { src: u('1769030471026-2053279edaa7'), by: 'Zoshua Colah', page: 'https://unsplash.com/photos/H5pw3LutKSc', alt: 'Frying in a large kadai', altBn: 'বড় কড়াইয়ে ভাজা' },
  potted: { src: u('1653129391403-18f5edfa0124'), by: 'Girish B', page: 'https://unsplash.com/photos/93wOBFYDSUs', alt: 'Flowering plants in pots', altBn: 'টবে ফুলের গাছ' },
  nurseryTable: { src: u('1653129443759-95554c6e3434'), by: 'Girish B', page: 'https://unsplash.com/photos/_QDw8h1CCyE', alt: 'A variety of potted plants on display', altBn: 'নানা রকম টবের গাছ' },
  diyas: { src: u('1792664024678-576272475f2a'), by: 'Brijender Dua', page: 'https://unsplash.com/photos/rX4KWO6lAB0', alt: 'Lit clay lamps on a rangoli at night', altBn: 'রাতে আলপনার ওপর প্রদীপ' },
  diyaTray: { src: u('1577083753695-e010191bacb5'), by: 'Udayaditya Barua', page: 'https://unsplash.com/photos/xisPXJqwQkA', alt: 'Lit diyas and petals on a tray', altBn: 'থালায় প্রদীপ ও ফুলের পাপড়ি' },
  blood: { src: u('1536856136534-bb679c52a9aa'), by: 'LuAnn Hunt', page: 'https://unsplash.com/photos/X20g2GQsVdA', alt: 'A volunteer donating blood at a blood drive', altBn: 'রক্তদান শিবিরে রক্ত দিচ্ছেন একজন' },
  garlands: { src: u('1789971649660-eefc756ee5dd'), by: 'Sangram Rakate', page: 'https://unsplash.com/photos/V15kJDxvqKk', alt: 'Garlands of marigold and jasmine', altBn: 'গাঁদা ও জুঁইয়ের মালা' },
  marigold: { src: u('1716747449890-d3f1cfa83d2f'), by: 'Aravind Reddy Tarugu', page: 'https://unsplash.com/photos/F0jsLyrEnQI', alt: 'A marigold in full bloom', altBn: 'পূর্ণ প্রস্ফুটিত গাঁদা ফুল' },
/* Maitree Serving */
  catBuffet: { src: u('1555244162-803834f70033'), by: 'Saile Ilyas', page: 'https://unsplash.com/photos/SiwrpBnxDww', alt: 'A buffet table with silver chafing dishes', altBn: 'রুপোলি চাফিং ডিশে সাজানো বুফে টেবিল' },
  catBanana: { src: u('1678781416302-d59ed9ed46d0'), by: 'Nidhin K S', page: 'https://unsplash.com/photos/m7ltD98UTHY', alt: 'A meal served on a banana leaf', altBn: 'কলাপাতায় পরিবেশন করা খাবার' },
  catWaiter: { src: u('1719573019827-d06944a0c2be'), by: 'Roshan Chakkeeri', page: 'https://unsplash.com/photos/H9q_XcRpHNo', alt: 'A server in uniform carrying a tray', altBn: 'পোশাক পরা পরিবেশনকারী, হাতে ট্রে' },
  catPlating: { src: u('1687369595840-e96a912586f1'), by: 'Gastro Editorial', page: 'https://unsplash.com/photos/Rp0KQRcQfDc', alt: 'Gloved hands setting out plates', altBn: 'দস্তানা পরা হাতে প্লেট সাজানো' },
  catTable: { src: u('1562050344-f7ad946cee35'), by: 'Nadia Valko', page: 'https://unsplash.com/photos/0hAdietsUrE', alt: 'A long table laid with plates and glasses', altBn: 'প্লেট ও গ্লাসে সাজানো লম্বা টেবিল' },
  catThali: { src: u('1589778655375-3e622a9fc91c'), by: 'Barun Ghosh', page: 'https://unsplash.com/photos/wClFKcjhNcI', alt: 'A full thali on a steel plate', altBn: 'স্টিলের থালায় পুরো থালি' },
  /* Nursery: one photo per plant (key = plant id) */
  p1: { src: u('1567990989224-6441e1483ac8'), by: 'Robert Thiemann', page: 'https://unsplash.com/photos/TTaxId0Im2s', alt: 'A red hibiscus flower', altBn: 'লাল জবা ফুল' },
  p2: { src: u('1728046591877-95c5cce10910'), by: 'Anindita Barma', page: 'https://unsplash.com/photos/Pnj57CLXSec', alt: 'Shiuli flowers with orange stems on a white cloth', altBn: 'সাদা কাপড়ে কমলা বোঁটার শিউলি ফুল' },
  p3: { src: u('1728046726837-9798a510fe36'), by: 'Anindita Barma', page: 'https://unsplash.com/photos/BQ301L37Cm0', alt: 'White rajanigandha flowers in a wooden bowl', altBn: 'কাঠের বাটিতে রজনীগন্ধা' },
  p4: { src: u('1716747449890-d3f1cfa83d2f'), by: 'Aravind Reddy Tarugu', page: 'https://unsplash.com/photos/F0jsLyrEnQI', alt: 'A marigold in full bloom', altBn: 'পূর্ণ প্রস্ফুটিত গাঁদা ফুল' },
  p5: { src: u('1601021215663-ee72b7063578'), by: 'Timo C. Dinger', page: 'https://unsplash.com/photos/GjQ9mpJg4OQ', alt: 'A dahlia flower', altBn: 'ডালিয়া ফুল' },
  p6: { src: u('1724073339133-938ada52e511'), by: 'Anh Tuan Thomas', page: 'https://unsplash.com/photos/Pyx3V0XO0gU', alt: 'Yellow chrysanthemum flowers', altBn: 'হলুদ চন্দ্রমল্লিকা' },
  p7: { src: u('1669131080043-f69be198e64f'), by: 'Liz Pullan Pattathy', page: 'https://unsplash.com/photos/sotuQuIBxKM', alt: 'A tulsi plant', altBn: 'তুলসী গাছ' },
  p8: { src: u('1509423350716-97f9360b4e09'), by: 'Stephanie Harvey', page: 'https://unsplash.com/photos/T0inbt7nRME', alt: 'Aloe vera in a white pot', altBn: 'সাদা টবে ঘৃতকুমারী' },
  p9: { src: u('1526438281712-35d96b8586e5'), by: 'Dan Gold', page: 'https://unsplash.com/photos/cUaXzFXVKkA', alt: 'Lemons on the tree', altBn: 'গাছে লেবু' },
  p10: { src: u('1633349202776-39545fa23de7'), by: 'Anisa Wulan Asri', page: 'https://unsplash.com/photos/dSb8R7QAeLM', alt: 'Green guavas on a branch', altBn: 'ডালে সবুজ পেয়ারা' },
  p11: { src: u('1579621970795-87facc2f976d'), by: 'micheile henderson', page: 'https://unsplash.com/photos/ZVprbBmT8QA', alt: 'A money plant in a glass vase', altBn: 'কাচের পাত্রে মানি প্ল্যান্ট' },
  p12: { src: u('1593482892290-f54927ae1bb6'), by: 'Jake Goossen', page: 'https://unsplash.com/photos/iIuyXTcEBTI', alt: 'A snake plant in a pot', altBn: 'টবে স্নেক প্ল্যান্ট' },
  p13: { src: u('1637924925587-2551d0661c52'), by: 'Ilham Abitama', page: 'https://unsplash.com/photos/0vZz7v9bFEA', alt: 'Pink bougainvillea flowers', altBn: 'গোলাপি বাগানবিলাস' },
  p14: { src: u('1758649094570-9dc3b30ce80d'), by: 'Santhosh Sethumadhavan', page: 'https://unsplash.com/photos/qklO7VepVZw', alt: 'Curry leaves on a branch', altBn: 'ডালে কারিপাতা' },
};
/* About page group photo. Sample for now: replace with the club's own group picture
   (e.g. src: () => '/group.jpg', by: 'Gede Maitree Club', page: '#committee'). */
PHOTOS.group = { src: u('1771998829261-4aee91696b5c'), by: 'Speedy Sandy', page: 'https://unsplash.com/photos/group-of-people-posing-for-a-photo-outdoors-zVlHozIFphk', alt: 'Young volunteers and children posing together outdoors', altBn: 'বাইরে একসাথে ছবি তুলছেন তরুণ স্বেচ্ছাসেবক ও ছোটরা' };

/* Albums are the kinds of event; the gallery filters by them. */
export const ALBUMS = [
  { key: 'puja', en: 'Durga Puja', bn: 'দুর্গাপূজা' },
  { key: 'kali', en: 'Kali Puja', bn: 'কালীপূজা' },
  { key: 'sports', en: 'Sports Day', bn: 'ক্রীড়া দিবস' },
  { key: 'kitchen', en: 'Maitree Serving', bn: 'মৈত্রী পরিবেশন' },
  { key: 'nursery', en: 'Nursery', bn: 'নার্সারি' },
  { key: 'service', en: 'Blood donation', bn: 'রক্তদান' },
];

/*
 * Gallery, date-wise: one entry per event day, newest first.
 * Each item is a photo ({ p }) or a video ({ v }). Videos carry a poster photo and a duration;
 * in the real app `src` is an uploaded file or a YouTube link set by the committee.
 */
export const GALLERY = [
  { id: 'nursery-winter-26', album: 'nursery', date: '2026-11-06', en: 'Winter flowers arrive', bn: 'শীতের ফুল এল', when: '6 Nov 2026', whenBn: '৬ নভে ২০২৬',
    items: [{ p: 'nurseryTable' }, { p: 'marigold' }, { p: 'potted' }] },
  { id: 'kali-26', album: 'kali', date: '2026-11-08', en: 'Kali Puja & Bhai Phonta', bn: 'কালীপূজা ও ভাইফোঁটা', when: '8–10 Nov 2026', whenBn: '৮–১০ নভে ২০২৬',
    items: [{ v: 'Green-crackers night at the pandal', vBn: 'প্যান্ডেলে সবুজ বাজির রাত', poster: 'diyas', dur: '2:14' }, { p: 'diyas' }, { p: 'diyaTray' }] },
  { id: 'dey-wedding-26', album: 'kitchen', date: '2026-11-01', en: 'Serving at the Dey family wedding, 160 guests', bn: 'দে পরিবারের বিয়েতে পরিবেশন, ১৬০ জন', when: '1 Nov 2026', whenBn: '১ নভে ২০২৬',
    items: [{ p: 'feast' }, { v: 'The serving team’s first batch', vBn: 'পরিবেশন দলের প্রথম ব্যাচ', poster: 'kadai', dur: '0:48' }, { p: 'feast2' }] },
  { id: 'durga-26', album: 'puja', date: '2026-10-17', en: 'Durga Puja', bn: 'দুর্গাপূজা', when: '17–21 Oct 2026', whenBn: '১৭–২১ অক্টো ২০২৬',
    items: [{ p: 'pujaNight' }, { v: 'Dhunuchi naach on Navami night', vBn: 'নবমীর রাতে ধুনুচি নাচ', poster: 'pujaCrowd', dur: '1:58' }, { p: 'pujaIdol' }, { p: 'pujaMorning' }, { v: 'Sindoor khela on Dashami', vBn: 'দশমীর সিঁদুর খেলা', poster: 'sindoor', dur: '3:42' }, { p: 'sindoor' }, { p: 'pujaCrowd' }, { p: 'garlands' }] },
  { id: 'blood-26', album: 'service', date: '2026-08-15', en: 'Blood donation camp · 58 donors', bn: 'রক্তদান শিবির · ৫৮ জন দাতা', when: '15 Aug 2026', whenBn: '১৫ আগ ২০২৬',
    items: [{ p: 'blood' }] },
  { id: 'sports-25', album: 'sports', date: '2025-12-14', en: 'Annual Sports Day', bn: 'বার্ষিক ক্রীড়া', when: '14 Dec 2025', whenBn: '১৪ ডিসে ২০২৫',
    items: [{ v: 'Under-12 sack race', vBn: 'অনূর্ধ্ব-১২ বস্তা দৌড়', poster: 'race', dur: '1:12' }, { p: 'race' }, { p: 'runners' }] },
].sort((a, b) => b.date.localeCompare(a.date));

/** <img> with lazy loading, responsive srcset and Bengali alt support. */
export function photo(key, { w = 1200, cls = '', eager = false, sizes = '100vw' } = {}) {
  const p = PHOTOS[key];
  return `<img src="${p.src(w)}" srcset="${p.src(640)} 640w, ${p.src(1200)} 1200w, ${p.src(1800)} 1800w" sizes="${sizes}"
    alt="${p.alt}" data-alt-bn="${p.altBn}" class="${cls}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`;
}

export const credit = (key) => `<a href="${PHOTOS[key].page}" target="_blank" rel="noopener" class="hover:underline">${PHOTOS[key].by} / Unsplash</a>`;
