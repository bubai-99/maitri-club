# Gede Maitree Club: HTML prototype

A clickable prototype covering all four surfaces from [docs/01-design-brief.md](../docs/01-design-brief.md). It is built with Vite and Tailwind CSS v4, and uses sample data only. Nothing is sent or saved: forms confirm on screen and everything resets on reload. CSV exports really download.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static output in dist/
```

The dark bar at the top switches between surfaces and between English and বাংলা.

| Page | What to try |
|---|---|
| `index.html`: website | Home, `#events` and `#event/sports` (programme, add to calendar), `#catering` (serving packages, live estimate, enquiry), `#nursery` (add plants, then Order on WhatsApp), `#gallery` (date-wise, photos and videos), `#notices` and `#notice/n1`, `#chanda` (puja chanda and open accounts), `#committee`, `#contact`, `#join` (membership form), `#privacy`, `#terms`. Search with `/` or Ctrl+K · `404.html` |
| `app.html`: member app | Sidebar on laptop, tab bar on phone. `#home`, `#pay` (UPI or cash, then the treasurer confirms), `#statement`, `#receipts` and `#receipt/<no>`, `#id` (a card per person: flip, Gate QR, PNG, print, report lost), `#events` (`/passes`, `/past`, `#event/<id>` registration), `#polls` (AGM ballot), `#docs`, `#catering` (book Maitree Serving), `#nursery` (basket), `#notices`, `#alerts`, `#help`, `#profile` (photo, family, blood donor), `#settings` (language, notifications, install, offline, devices, export), `#more` |
| `console.html`: committee console | `#dashboard`, `#applications` (approve, or enter a paper form), `#members`, `#collect`, `#dues` (filters, remind selected), `#khata`, `#cash` (cash in hand, bank matching), `#receipts` (register, gap check), `#chanda`, `#catering` (serving team roster), `#nursery`, `#events`, `#volunteers`, `#donors` (blood groups), `#assets`, `#meetings` (notices with preview, polls), `#gallery`, `#reports` (AGM pack), `#audit`, `#settings` (`/roles` with View as, `/data` export and backup), `#profile`, `#cards`. Press `/` to search, `?` for shortcuts |
| `login.html`: member sign-in | Password or one-time code, `#otp`, `#activate` (existing family), `#register` (You → Family → Verify → `#pending`), `#forgot` → `#otp` → `#reset` → `#done`. Password `wrongpass` shows the error, 3 times locks; code `000000` shows the OTP error |
| `admin-login.html`: committee sign-in | Password + second-step code, `#forgot`/`#reset`, `#invite` (accept a role invite), `#locked` |
| `scan.html`: gate scanner | Simulate buttons for each result, typed family number, head count, undo, end-of-shift summary |

## Installable apps
`public/member.webmanifest` (member app and member sign-in) and `public/admin.webmanifest` (console, committee sign-in, scanner) give each app its own name and icon. `public/sw.js` serves pages network first with a cache fallback, so a page already opened still loads on a weak network. PNG icons (180, 192, 512) are in `public/icons`; they are a simple seal mark until the club has a logo.

## Files
- `src/styles.css`: design tokens (white paper, charcoal ink, poster red, marigold, turmeric, tulsi), ID card and print styles
- `src/shared.js`: language toggle, seal SVG, QR codes, hash router, toast, prototype bar
- `src/data.js`: shared sample data and `bnText()` for Bengali of free-text fields. Real facts: Est. 2014, Reg. No. S-0027153 / 2022-23. Placeholders: Netaji Para, address, phone numbers, UPI ID, fees
- Website: `src/site.js`, `src/site-pages.js` (notices, events, chanda, contact, search), `src/site-ui.js`, `src/site-data.js`, `src/photos.js` (Unsplash photos, hotlinked and credited; swap for the club's own using the same keys)
- Member app: `src/app.js`, `src/app-ui.js`, `src/app-community.js` (events, notices, polls, docs), `src/app-services.js` (catering, nursery, help), `src/app-account.js` (profile, settings, install, offline), `src/member-data.js`
- Console: `src/console.js`, `src/console-admin.js` (audit, cash & bank, receipts, donors, volunteers, assets, roles, data)
- `src/auth.js`: sign-in, OTP, register, reset password flows for both portals
- `src/idcard.js`: member ID card (CR80), print sheet and PNG download
- `src/scan.js`: gate scanner

Fonts: Tiro Bangla for display text and Anek Bangla for the interface, both self-hosted through Fontsource. Icons come from Lucide.
