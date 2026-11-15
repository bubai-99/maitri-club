# Gede Maitree Club: Design Direction (Refero research)

_Applied to the prototype in [mock/](../mock/) on 13 Nov 2026._

## Research
- **Styles reviewed:** 5 searches, 3 read in full
  - Roberta's Pizza: "neighbourhood poster" look
  - Hungry Tiger: "spice-soaked poster theatre"
  - re_ grocery: "printed shop" look
  - Also seen in search results: Eventbrite, Luma, Partiful, Houseplant, Alison Roman
- **Screens reviewed:** web transaction ledgers (Monarch Money) and iOS membership passes (Nike Training Club)

**Why Roberta's leads.** A para club is a neighbourhood institution. Its real visual language is the hand-printed puja poster and the notice board, and Roberta's was the only reference built on exactly that (neighbourhood posters, community bands, hospitality).
- **Hungry Tiger** is too loud for the admin and fee side of the system.
- **re_ grocery** is close to the earlier cream-and-vermilion look, which the Refero skill flags as a generic "calm editorial" default.

## What the design keeps
- **Primary direction:** neighbourhood poster (Roberta's).
- **Kept from that style:**
  - white paper and charcoal sections
  - poster red only for actions, dotted menu lines and full-width community bands
  - chunky serif capitals stacked tightly for headings
  - square photo frames with a 2px charcoal border
- **Borrowed:** a giant club name at the bottom of the page (Hungry Tiger).
- **Kept from our brief:** the rubber-stamp seal, the ledger rules in the khata, one colour per book, and Bengali + English.
- **Each colour has one job:**
  - **Poster red:** buttons, the Club book, dotted menu lines, and the Join section.
  - **Marigold:** only the next-event notice card and the star marks.
  - **Turmeric and tulsi green:** only to mark the Catering and Nursery books.
- **Photos:** none yet. Each photo space is a framed placeholder with a caption describing the photo needed. The opening section is charcoal with halftone dots until a Durga Puja night photo arrives.
- **Avoided:**
  - cream backgrounds
  - a blue-violet ink colour
  - rows of identical feature cards
  - soft drop shadows on cards
  - icon-plus-text card grids

## Decision log
| Decision | Source | Why |
|---|---|---|
| White background, charcoal text `#2b2f36` | Roberta's | Replaces cream, which the Refero skill flags as a generic look |
| Poster red `#d21f1b`, only on buttons, dotted lines and community bands | Roberta's (darkened slightly for readability) | Red stays a signal; its original `#ed2023` fails the contrast standard on small text |
| DM Serif Display capitals with tight line spacing; Bengali in Tiro Bangla | Roberta's (its suggested fallback font) | Puja-poster feel; Bengali text is unaffected by capitals |
| Big poster buttons (64px tall, 7px corners) on the website only | Roberta's | Clear buttons for visitors; the app and console keep compact ones |
| Opening section: centred title with star marks, buttons along the bottom | Roberta's | Replaces the text-beside-card layout |
| Club, Serving and Nursery as alternating photo-and-text sections | Roberta's | Replaces three rows that all looked alike |
| Red dotted lines between catering package items | Roberta's | Looks like a printed price list |
| Charcoal halftone sign-up section, then a giant "গেদে মৈত্রী ক্লাব" | Roberta's + Hungry Tiger | An ending you remember, not a thin legal strip |
| Member card: centred, large QR code | Nike membership-pass screens | Scans faster at the gate, especially at night |
| Khata shows each date once, with a rule between days | Monarch Money ledger screens | Easier to scan, and still looks like a handwritten register |
