# RealtyOps — UI & Build Spec

Build a production-quality internal dashboard for a real estate agency using Next.js, React, TypeScript, TanStack Table, TanStack Query, Zod, and Tailwind CSS.

REFERENCE MOOD: a title company's deed room crossed with a well-run ops tool — the confidence of a paper trail, not the gloss of a marketing site. This is a *tool*, not a pitch. Speed, legibility, and trust matter more than flourish.

Do not default to a generic SaaS dashboard look (soft shadows, rounded cards, blue-and-white, colored pill badges everywhere). This should feel like nothing else in a "10 React dashboards" template pack.

---

## 1. CONCEPT

**"THE LEDGER."** Every lead and listing is a line in a ledger — something that exists on paper before it exists on a screen: a filed record, a stamped status, a parcel of information someone is accountable for. The UI borrows from the physical vernacular of real estate paperwork — deed stamps, filing tabs, ruled lines, tabular figures — without literally skeuomorphing into "fake paper."

The one signature element: **status as a stamp, not a pill.** ACTIVE / PENDING / CLOSED / LOST render as small monospace ink-stamp marks (slightly rotated, hard edge, no gradient) instead of the default colored rounded badge. Used sparingly — only for status — so it stays a signature, not a gimmick.

---

## 2. VISUAL SYSTEM

**Color (name every value, don't drift from these):**
- `Ink` `#1C2333` — primary text, dark UI surfaces, table headers
- `Paper` `#F4F3EE` — app background (cool off-white, not warm cream)
- `Manila` `#D8C79A` — filing-tab accents, active-tab indicators, hover fills
- `Stamp Red` `#A6392C` — urgent / overdue / lost (used only on stamps + critical alerts)
- `Ledger Green` `#3B6B4C` — closed / won / confirmed states
- `Hairline` `#C9C6BC` — all borders and rules (never a default gray-200)

Rule: the app is ~90% Ink/Paper/Hairline. Manila, Stamp Red, and Ledger Green are accents earned by meaning (a filed tab, a stamp, a closed deal) — never decorative.

**Typography:**
- UI/body: **Inter** or **IBM Plex Sans** — clean, no personality contest with the data
- Tabular data (prices, sqft, dates, parcel/lead IDs): **IBM Plex Mono** with `font-variant-numeric: tabular-nums` — every number column aligns like a ledger
- Section labels / stamps: the mono face, uppercase, letter-spaced (`0.08em`), small (11–12px)

No display serif, no hero headline treatment anywhere — this product doesn't have a "hero," it has a first useful screen.

**Structural devices:**
- Table rows separated by hairlines, not card shadows or zebra striping
- Filter bar reads like a filing-cabinet tab strip: active filter = manila fill + small tab notch, not a rounded chip
- Status stamps rotated -2° to +2° per instance (deterministic hash of the record id, not random per render) so repeated stamps don't look mechanically identical

---

## 3. SCREENS

**A. Listings view** (default view)
- Toolbar: search, filters (status, price range, agent, bedrooms), sort, "New Listing"
- Table: address, price (tabular), status (stamp), agent, days-on-market, lead count, row actions
- Row hover reveals action icons (edit, view leads, archive) — no always-visible icon clutter

**B. Leads view**
- Same filter/table pattern for consistency, filtered by lead status instead of listing status
- Row actions: mark contacted, reassign agent, schedule showing, close/lose (with reason)

**C. Lead detail (side drawer, not a new page)**
- Opens over the table (table stays visible, dimmed) so context is never lost
- Activity timeline (ledger-style: timestamp, actor, action, in a single mono column)
- Showing scheduler inline

**D. Empty & error states**
- Empty: "No leads match these filters" + a one-line suggestion (clear filters), never a mascot illustration
- Error/conflict: inline on the row itself — see optimistic update spec below, not a generic toast

---

## 4. DATA MODEL

```
Listing  { id, address, price, status: 'active'|'pending'|'closed', beds, sqft, agentId, photos[] }
Lead     { id, name, email, phone, listingId, status: 'new'|'contacted'|'showing'|'offer'|'closed'|'lost',
           assignedAgentId, createdAt, lastActivityAt, lostReason? }
Agent    { id, name, activeLeadCount }
Showing  { id, leadId, listingId, scheduledTime, status: 'confirmed'|'completed'|'cancelled' }
```

---

## 5. URL-DRIVEN STATE

Every filter, sort, and page lives in the query string — never in component state alone:

```
/leads?status=new,contacted&agent=3&sort=lastActivity&dir=desc&page=2
```

- On mount: hydrate all filter/sort/pagination UI from `useSearchParams`
- On change: push to the URL (replace, not push, for filter tweaks — don't fill browser history with every keystroke)
- Payoff to document in your case study: a sales manager can Slack a teammate a fully-filtered view

---

## 6. PAGINATION

Server-side, page-based (`?page=2&pageSize=25`). Document *why* page-based over cursor: leads/listings are browsed and re-sorted constantly by staff, and page-based pagination makes "jump to page 4" and stable sort columns simpler to reason about than a cursor would — a real tradeoff call, worth a paragraph in the writeup.

---

## 7. OPTIMISTIC UPDATES + CONFLICT HANDLING (your best case-study material)

- Row actions (mark contacted, reassign, close) update the row **instantly** in the UI while the request fires in the background
- On success: reconcile silently
- On failure: **roll the row back**, show an inline error chip on that row with a **Retry** button — never a toast that disappears while money/deadlines are on the line
- **The conflict scenario to build and screenshot:** two agents act on the same lead within seconds. Server returns a 409 with the current record. UI shows: *"Updated by [Agent] moments ago"* with the new state, and discards the stale optimistic write.
- Document your resolution choice explicitly (last-write-wins with a visible notice is the honest, defensible choice for this scope) and note in the writeup what you'd do with more time (e.g., version field + server-side merge).

`useLeadMutation` hook should own: optimistic write → rollback → retry → conflict-notice logic, reused across every row action.

---

## 8. COMPONENT BREAKDOWN

```
DashboardLayout
 ├─ FilterBar          (controlled entirely by URL params)
 ├─ DataTable          (generic, TanStack Table; listings & leads both use it)
 │   └─ Row
 │       ├─ StatusStamp
 │       └─ RowActions  (uses useLeadMutation)
 ├─ Pagination
 └─ LeadDetailDrawer
     ├─ ActivityTimeline
     └─ ShowingScheduler
```

---

## 9. MOTION

Restrained and functional, not cinematic:
- Row update: 120ms background-color flash on optimistic write, no bounce/spring
- Drawer: slides in at 200ms ease-out, background dims — no blur
- Stamp appearance on status change: a quick 80ms scale-in (0.9 → 1), like a stamp hitting paper — the one moment of personality
- Respect `prefers-reduced-motion`: disable the stamp scale-in and drawer slide, keep instant state changes

---

## 10. RESPONSIVE & ACCESSIBILITY

- Below 768px: table collapses to stacked record cards (address/price/status up top, actions in a bottom row) — not a horizontally-scrolling table
- Full keyboard access to filters, row actions, and drawer (focus trap while open, `Esc` to close)
- Status conveyed by text label inside the stamp, never by color alone
- Visible focus rings using the Ink color, 2px, offset — no default browser blue

---

## 11. STRICTLY AVOID

- Rounded colored status pills (the stamp *is* the status treatment — don't also add a pill)
- Card-shadow table rows / zebra striping
- Gradient backgrounds or glassmorphism anywhere
- Generic dashboard icon-and-number "stat cards" with no real meaning behind the number
- Toast-only error handling for anything involving money or deadlines
- A "01 / 02 / 03" numbered feature layout — nothing here is a marketing sequence

---

## 12. CASE-STUDY CAPTURE LIST

Screenshot/GIF these while building, for the portfolio writeup:
1. URL updating live as filters change (shareable state)
2. The optimistic update + rollback + retry on a failed request
3. The two-agents-same-lead conflict notice
4. Mobile stacked-card view vs. desktop table
5. Reduced-motion mode side-by-side with default
