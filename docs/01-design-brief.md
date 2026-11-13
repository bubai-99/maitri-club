# Maitri Club (মৈত্রী ক্লাব): Design & Technology Brief

_Status: Draft v1, 13 Nov 2026. Open items are marked **TBD**._

---

## 1. The club

| | |
|---|---|
| **Name** | Maitri Club / মৈত্রী ক্লাব ("Maitri" = friendship) |
| **Type** | Neighbourhood (para) club: Durga/Kali Puja, cultural programmes, sports, social work |
| **Members** | Under 300 families |
| **Fees today** | Collected in cash and written in a register; the treasurer chases dues by hand |
| **Businesses run by the club** | **Catering** (event food orders) and a **Nursery** (plant sales) |
| **Language** | English + Bengali, switchable |
| **Brand assets** | None yet. Identity is designed from scratch |
| **Locality / Estd. year** | **TBD** (placeholder: Netaji Para, Estd. 1972) |

---

## 2. Surfaces

One system, four surfaces. Each has its own job, so each is designed differently.

| Surface | Who | Device | Design mode |
|---|---|---|---|
| **Public website** | Para residents, prospective members, catering & nursery customers | Phone first | Persuade: expressive, puja-poster energy |
| **Member app** | Members | Phone (installable PWA) | Operate: fast and calm (dues, pay, ID, notices) |
| **Committee console** | Secretary, treasurer, puja / catering / nursery in-charges | Laptop + phone | Operate: dense, precise, ledger-like |
| **Gate scanner** | Event volunteers | Phone, outdoors, at night, weak network | Operate: huge targets, high contrast, offline |

---

## 3. Design direction: "Lal Khata meets the para notice board"

This is designed around how the club actually works, not a generic SaaS dashboard.

- **Console = a modern *lal khata*.** The treasurer's red cloth-bound register becomes the visual language: cream paper, faint ruled lines, ink-blue figures, vermilion for dues and totals. Every entry shows who recorded it and when, so it is ready for the AGM.
- **The rubber-stamp seal is the identity.** A round seal ("মৈত্রী ক্লাব • ESTD ____") appears on receipts, ID cards and the site. It works as the logo and grows out of a real club ritual.
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

**Recommended: Next.js (App Router) + Supabase + Tailwind CSS, as a PWA. Hosted on Vercel + Supabase free tiers.**

| Concern | Choice | Why |
|---|---|---|
| Codebase | Next.js, TypeScript | One project for all four surfaces |
| Database & auth | Supabase (Postgres, Row-Level Security, Storage) | Roles enforced in the database. Bill photos and gallery in Storage |
| Login | Phone OTP via MSG91 (~₹0.2 per SMS) | Members know their phone number, not passwords |
| Mobile app | PWA (installable, push notifications) | No Play Store needed at launch. Wrap with Capacitor/TWA later if wanted |
| Payments | UPI QR + manual confirm | Zero fees. Razorpay can be added later without a redesign |
| Reminders | WhatsApp `wa.me` deep links | Free |
| Receipts | Print CSS / PDF with embedded Bengali font | Works on any phone |
| Offline scanner | Service worker + cached member list | Pujas have weak network |

**Running cost:** about ₹0/month at this size, plus a domain at about ₹800/year.

**Alternative:** Laravel + Filament (PHP) gives a strong admin panel quickly, but the member PWA and the offline scanner are harder to do well, and it needs paid hosting.

---

## 6. Open questions

1. Locality / para name and year the club was founded.
2. Fee structure: monthly or yearly amount, admission fee.
3. Catering: members only or outside customers too? Per-plate pricing?
4. Nursery: roughly how many varieties? Delivery or pickup only?
