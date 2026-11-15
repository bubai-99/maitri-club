# Gede Maitree Club (গেদে মৈত্রী ক্লাব): Design & Technology Brief

_Status: Draft v1, 13 Nov 2026. Open items are marked **TBD**._

---

## 1. The club

| | |
|---|---|
| **Name** | Gede Maitree Club / গেদে মৈত্রী ক্লাব ("Maitree" = friendship) |
| **Type** | Neighbourhood (para) club: Durga/Kali Puja, cultural programmes, sports, social work |
| **Members** | Under 300 families |
| **Fees today** | Collected in cash and written in a register; the treasurer chases dues by hand |
| **Businesses run by the club** | **Catering** (event food orders) and a **Nursery** (plant sales) |
| **Language** | English + Bengali, switchable |
| **Brand assets** | None yet. Identity is designed from scratch |
| **Locality / Estd. year** | **TBD** (placeholder: Netaji Para, Estd. 1972) |

---

## 2. Surfaces

One codebase, four surfaces. Each has its own job, so each is designed differently.

| Surface | Who | Runs as | Design mode |
|---|---|---|---|
| **Public website** | Para residents, prospective members, catering & nursery customers | Website, phone first | Persuade: expressive, puja-poster energy |
| **Member app** | Members | **Web app** (any browser, phone or laptop) **+ installable app** (Android, iPhone) | Operate: fast and calm (dues, pay, ID, notices) |
| **Committee console** (admin) | Secretary, treasurer, puja / catering / nursery in-charges | **Web app** (laptop first) **+ installable app** (phone) | Operate: dense, precise, ledger-like |
| **Gate scanner** | Event volunteers | Part of the admin app, offline | Operate: huge targets, high contrast, offline |

### Member and admin are separate apps
- **Separate apps, separate sign-in.** Members use the Member app; committee members use the Admin app. Each has its own address, its own login page and its own installable icon, so a member never sees admin screens.
- **Both are full web apps.** Everything works in a browser on a laptop or phone with no install. A member can pay dues or download their ID card from a computer.
- **Both are also installable apps.** The same web app installs to the home screen (PWA) at launch, and is published to the Play Store / App Store later from the same code.
- **One codebase.** Website, Member app, Admin app and scanner share one project, one database, one design system and one set of translations. A fix or a new feature is written once.
- **Responsive, not two designs.** The Member app uses a bottom tab bar on phones and a sidebar on laptops. The Admin app uses a sidebar on laptops and a bottom bar with the most-used actions on phones.
- **A committee member who is also a member** signs in to each app separately with the same phone number, and can switch between them from the profile menu.

---

## 3. Design direction: "Lal Khata meets the para notice board"

This is designed around how the club actually works, not a generic SaaS dashboard.

- **Console = a modern *lal khata*.** The treasurer's red cloth-bound register becomes the visual language: cream paper, faint ruled lines, ink-blue figures, vermilion for dues and totals. Every entry shows who recorded it and when, so it is ready for the AGM.
- **The rubber-stamp seal is the identity.** A round seal ("গেদে মৈত্রী ক্লাব • ESTD ____") appears on receipts, ID cards and the site. It works as the logo and grows out of a real club ritual.
- **Website = puja-poster energy.** Large Bengali display type, vermilion and marigold on warm paper. The next event is the hero, with a countdown.
- **One colour per book.** Club = sindoor vermilion · Catering = turmeric · Nursery = tulsi green. The same colour marks each business on the site, in the console and in the accounts.

### Typography
- **Tiro Bangla** for display and headings (Bengali + Latin).
- **Anek Bangla** for UI and body text (Bengali + Latin, variable).
- Both cover both scripts, so switching language does not break the layout. Amounts use tabular figures.

### Palette (indicative)
| Token | Use |
|---|---|
| Sindoor vermilion | Primary, Club book, dues, primary actions |
| Marigold | Festival highlights, event accents |
| Turmeric | Catering book |
| Tulsi green | Nursery book |
| Ink indigo | Body text, ledger figures |
| Khata cream | Paper background |

No gradients, no glassmorphism, no stock 3D illustrations.

---

## 4. Modules

1. **Members**: families with dependents, digital ID with QR, status (active / due / lapsed).
2. **Fees & dues**: monthly or yearly subscription. **2-tap cash entry** with an instant receipt. Members can pay by UPI QR (no gateway fee), and the treasurer confirms.
3. **Reminders**: one tap opens WhatsApp with a prefilled Bengali reminder. Free, and WhatsApp is where members already are.
4. **Puja & event chanda**: budget, chanda book by area or volunteer, sponsors, target vs. collected.
5. **Catering**: enquiry → quotation (menu × plates) → advance → event → final bill → profit to the Catering book.
6. **Nursery**:
   - Catalogue (Bengali/English names, pot size, price, stock).
   - Counter sale with receipt.
   - Stock in / losses / low-stock alerts.
   - Member discount.
   - Website catalogue with "Order on WhatsApp".
7. **Accounts (Khata)**: three books (Club, Catering, Nursery), each with income, expenses, bill photos and P&L. They roll up into one AGM report.
8. **Notices & meetings**: push notices, meeting minutes, AGM polls.
9. **Gate scanner**: scans member or pass QR codes, works offline, gives a clear allowed / denied result.

---

## 5. Technology

**Recommended: Next.js (App Router) + Supabase + Tailwind CSS. One codebase that serves the website and two web apps (Member, Admin), each installable as a PWA and later packaged for the stores with Capacitor. Hosted on Vercel + Supabase free tiers.**

| Concern | Choice | Why |
|---|---|---|
| Codebase | Next.js, TypeScript, one repository | One project for the website, Member app, Admin app and scanner |
| Separation | Separate route groups, layouts and sign-in per app: `/` website, `/app` Member, `/admin` Admin (or `app.` / `admin.` subdomains) | Member and admin never share screens or menus |
| Database & auth | Supabase (Postgres, Row-Level Security, Storage) | Roles enforced in the database, so the Member app can only ever read the member's own data. Bill photos and gallery in Storage |
| Login | Phone OTP via MSG91 (~₹0.2 per SMS) | Members know their phone number, not passwords. Admins also need a role assigned by the secretary |
| Web apps | Responsive Next.js pages | Work in any browser, laptop or phone, no install |
| Installable apps | One PWA manifest per app (Member, Admin) with its own name and icon | Installs from the browser at launch, with push notifications |
| Store apps (later) | Capacitor wrap of the same web apps, two store listings | Play Store / App Store presence without a second codebase |
| Payments | UPI QR + manual confirm | Zero fees. Razorpay can be added later without a redesign |
| Reminders | WhatsApp `wa.me` deep links | Free |
| Receipts | Print CSS / PDF with embedded Bengali font | Works on any phone |
| Offline scanner | Service worker + cached member list | Pujas have weak network |

**Running cost:** about ₹0/month at this size, plus a domain at about ₹800/year.

**Alternative:** Laravel + Filament (PHP) gives a strong admin panel quickly, but the member PWA and the offline scanner are harder to do well, and it needs paid hosting.

**Not recommended:** separate native apps (Flutter / React Native) next to a web codebase. That is two or three codebases for one solo developer, and members would lose the no-install web option.

---

## 6. Open questions

1. Locality / para name and year the club was founded.
2. Fee structure: monthly or yearly amount, admission fee.
3. Catering: members only or outside customers too? Per-plate pricing?
4. Nursery: roughly how many varieties? Delivery or pickup only?
