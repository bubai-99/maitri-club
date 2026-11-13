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
};

export const ALBUMS = [
  { key: 'puja', en: 'Durga Puja', bn: 'দুর্গাপূজা', photos: ['pujaNight', 'sindoor', 'pujaIdol', 'pujaMorning', 'pujaCrowd'] },
  { key: 'sports', en: 'Sports Day', bn: 'ক্রীড়া দিবস', photos: ['race', 'runners'] },
  { key: 'kitchen', en: 'Maitri Kitchen', bn: 'মৈত্রী রান্নাঘর', photos: ['feast', 'feast2', 'kadai'] },
  { key: 'nursery', en: 'Nursery', bn: 'নার্সারি', photos: ['potted', 'nurseryTable', 'garlands', 'marigold'] },
  { key: 'kali', en: 'Kali Puja', bn: 'কালীপূজা', photos: ['diyas', 'diyaTray'] },
  { key: 'service', en: 'Blood donation', bn: 'রক্তদান', photos: ['blood'] },
];

/** <img> with lazy loading, responsive srcset and Bengali alt support. */
export function photo(key, { w = 1200, cls = '', eager = false, sizes = '100vw' } = {}) {
  const p = PHOTOS[key];
  return `<img src="${p.src(w)}" srcset="${p.src(640)} 640w, ${p.src(1200)} 1200w, ${p.src(1800)} 1800w" sizes="${sizes}"
    alt="${p.alt}" data-alt-bn="${p.altBn}" class="${cls}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`;
}

export const credit = (key) => `<a href="${PHOTOS[key].page}" target="_blank" rel="noopener" class="hover:underline">${PHOTOS[key].by} / Unsplash</a>`;
