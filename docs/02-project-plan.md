# Maitri Club: Project Plan

_Companion to [01-design-brief.md](01-design-brief.md). Solo developer, low budget. Time estimates assume part-time work (~15 hrs/week)._

---

## Phase overview

| # | Phase | Output | Est. |
|---|---|---|---|
| 0 | Discovery & brief | Design brief (done), open questions answered | Done / 2 days |
| 1 | **HTML mock** (clickable prototype) | All four surfaces, EN/বাংলা toggle, sample data | 1–1.5 weeks |
| 2 | Committee review | Feedback round on the mock, sign-off | 1 week |
| 3 | Foundation | Next.js + Supabase project, auth, roles, design tokens, i18n | 1 week |
| 4 | **MVP: Members & Fees** | Members, cash entry, receipts, dues, WhatsApp reminders, member app basics | 2–3 weeks |
| 5 | Public website | Home, Events, Catering, Nursery, Committee, Join | 1–2 weeks |
| 6 | Events & Chanda + Gate scanner | Puja budget, chanda book, passes, offline scanner | 2 weeks |
| 7 | Catering + Nursery | Enquiry → bill flow; catalogue, counter sale, stock | 2–3 weeks |
| 8 | Accounts (Khata) + AGM report | Three books, P&L, yearly report | 1–2 weeks |
| 9 | Notices, meetings, polls, push | Notices, minutes, AGM polls, PWA push | 1 week |
| 10 | Data migration & launch | Import register/Excel, train treasurer, soft launch | 1 week |

**Recommended launch point:** go live after **Phase 5**, so the treasurer and members get value before Puja season. Later phases ship as updates.

---

## Phase 1: HTML mock (next step)

Single prototype with a top switcher: **Website · Member App · Console · Scanner**, and an **EN / বাংলা** toggle.

**Website**
- Home (next-event hero + countdown, about, three activities: Club / Catering / Nursery)
- Events & Puja
- Catering (menu, packages, enquiry form)
- Nursery (catalogue, Order on WhatsApp)
- Committee
- Join / Membership

**Member app** (phone frames)
- Home (dues card, next event, notices)
- Pay (UPI QR + reference entry)
- Digital ID (seal + QR)
- Events & passes
- Notices
- Nursery tile

**Console**
- Dashboard (collection this month, dues, three-book summary)
- Members list + family detail
- Collect payment (2-tap cash entry → receipt)
- Dues & WhatsApp reminders
- Puja chanda book
- Catering orders (pipeline + quotation)
- Nursery counter sale + stock
- Khata (three books)
- Meetings & notices

**Scanner**
- Scan screen
- Allowed / denied / already-entered states
- Offline indicator

Files: `mock/index.html` + `mock/assets/` (static, opens directly in a browser).

---

## Roles & permissions

| Role | Can do |
|---|---|
| Admin (Secretary) | Everything, manages roles |
| Treasurer | Members, fees, all three books, reports |
| Puja in-charge | Events, chanda book, passes |
| Catering in-charge | Catering orders, Catering book (own entries) |
| Nursery in-charge | Catalogue, stock, counter sale, Nursery book (own entries) |
| Volunteer | Gate scanner, record chanda (own area) |
| Member | Own profile, family, dues, pay, ID, events, notices, polls |

Enforced with Supabase Row-Level Security, not only in the UI.

---

## Data model (first cut)

```
families          id, family_no, head_name, address, area, phone, status, joined_on
members           id, family_id, name, name_bn, relation, dob, phone, photo_url
fee_plans         id, name, amount, period (monthly|yearly), admission_fee
dues              id, family_id, period, amount, status (due|paid|waived)
payments          id, family_id, amount, mode (cash|upi), upi_ref, received_by, receipt_no, created_at
                  -> links to one or more dues

books             id, code (club|catering|nursery)
ledger_entries    id, book_id, type (income|expense), head, amount, note, bill_url,
                  source (payment|chanda|catering|nursery|manual), source_id, recorded_by, created_at

events            id, title, title_bn, starts_at, venue, budget, pass_required
chanda_entries    id, event_id, donor_name, area, amount, collected_by, receipt_no
sponsors          id, event_id, name, amount, deliverable
passes            id, event_id, member_id, qr_token, used_at, scanned_by

catering_orders   id, customer_name, phone, is_member, event_date, guests, status
                  (enquiry|quoted|advance|done|settled|lost), venue
catering_items    id, order_id, dish, dish_bn, per_plate_rate, qty
catering_payments id, order_id, amount, kind (advance|final), mode

plants            id, name, name_bn, category, pot_size, price, member_price, photo_url, active
stock_moves       id, plant_id, qty, kind (in|sale|loss|adjust), ref_id, created_at
nursery_sales     id, buyer_name, member_id, total, mode, receipt_no, created_at
nursery_sale_items id, sale_id, plant_id, qty, rate

notices           id, title, title_bn, body, body_bn, audience, pinned, published_at
meetings          id, kind (committee|agm), held_on, minutes, attendees
polls / votes     id, meeting_id, question, options, closes_at / poll_id, member_id, choice

audit_log         id, actor, action, table, row_id, at
```

Receipt numbers are sequential per book, e.g. `MC-25-0142`, `CT-25-0018`, `NS-25-0311`.

---

## Project structure (Phase 3+)

```
maitri-club/
  app/
    (site)/           public website, bilingual routes
    (member)/app/     member PWA
    (console)/console/ committee console
    scan/             gate scanner (offline-first)
  components/ui/      tokens-based components (khata table, seal, receipt)
  lib/supabase/       client, server, RLS-aware queries
  messages/           en.json, bn.json
  supabase/
    migrations/       SQL schema + RLS policies
    seed.sql          sample data
  public/manifest.webmanifest, icons, sw
```

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Treasurer prefers the paper register | 2-tap cash entry, phone-friendly console, printable monthly sheet that looks like the old register |
| Members don't install the app | Website works without installing. Reminders go through WhatsApp anyway |
| Weak network at puja gate | Offline scanner with cached passes, syncs later |
| SMS OTP cost | Low volume (under 300 families). Long-lived sessions |
| Supabase free tier pauses after inactivity | Weekly cron ping, or upgrade if usage grows |
| Bengali in PDFs | Embed Anek Bangla in the receipt template, test on Android printers |

---

## Immediate next steps

1. Answer the open questions in the brief, or approve placeholders.
2. Build the **Phase 1 HTML mock**.
3. Share the mock with the committee and collect feedback.
