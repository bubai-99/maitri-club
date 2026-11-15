# Gede Maitree Club: HTML prototype

A clickable prototype covering all four surfaces from [docs/01-design-brief.md](../docs/01-design-brief.md). It is built with Vite and Tailwind CSS v4, and uses sample data only.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static output in dist/
```

The dark bar at the top switches between surfaces and between English and বাংলা.

| Page | What to try |
|---|---|
| `index.html`: website | Home, `#events`, `#catering` (live estimate, enquiry), `#nursery` (add plants, then Order on WhatsApp), `#gallery` (albums + photo viewer), `#committee`, `#join`, `#privacy` · `404.html` |
| `app.html`: member app | Dues, `#pay`, `#id` (a card per person: flip, Gate QR, Download PNG, Print), `#events`, `#notices`, `#nursery`, `#receipts`, `#alerts`, `#profile` (family), `#settings` (language, notifications, password, sign out) |
| `console.html`: committee console | `#dashboard` (confirm UPI), `#members` (filter, open a family), `#collect` (record a payment and see the stamped receipt), `#dues`, `#khata`, `#chanda`, `#catering`, `#nursery` (counter sale and `#nursery/stock`), `#events`, `#meetings`, `#reports`, `#settings` (club, fees, users & roles, security), `#profile`, `#cards` (print/download ID cards, reissue lost). Press `/` to search. Every button opens a working form |
| `login.html`: member sign-in | Password or one-time code, `#otp`, `#activate` (existing family), `#register` (3 steps → `#pending`), `#forgot` → `#otp` → `#reset` → `#done`. Password `wrongpass` shows the error, 3 times locks; code `000000` shows the OTP error |
| `admin-login.html`: committee sign-in | Password + second-step code, `#forgot`/`#reset`, `#invite` (accept a role invite), `#locked` |
| `scan.html`: gate scanner | Use the simulate buttons for the four scan results |

## Files
- `src/styles.css`: design tokens (white paper, charcoal ink, poster red, marigold, turmeric, tulsi), ID card and print styles
- `src/idcard.js`: member ID card (CR80), print sheet and PNG download
- `src/photos.js`: free Unsplash photos (hotlinked, credited); swap for the club's own photos using the same keys
- `src/auth.js`: sign-in, OTP, register, reset password flows for both portals
- `src/shared.js`: language toggle, seal SVG, QR codes, hash router, toast, prototype bar
- `src/data.js`: sample data. Replace the placeholders (Netaji Para, Estd. 1972, ₹100/month) once the club confirms the real details
- `src/site.js`, `src/app.js`, `src/console.js`, `src/scan.js`: the script for each page

Fonts: Tiro Bangla for display text and Anek Bangla for the interface, both self-hosted through Fontsource. Icons come from Lucide.
