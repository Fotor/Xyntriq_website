# AGENTS.md — Repository rules for AI agents

Instructions for any agent (AI or human) working in this repository.

## HARD RULES — do not violate

1. **`pricing.html` and `video-data.html` are permanently removed** (founder decision, 2026-09-01).
   - Do NOT re-create, re-add, or commit these files for any reason.
   - Do NOT add links to `/pricing` or `/video-data` in nav, footers, CTAs, content, `sitemap.xml`, `llms.txt`, or `_redirects`.
   - A GitHub Action (`.github/workflows/guard.yml`) auto-deletes them if they reappear.
2. **Directory badges live on `/as-seen-on` and in the site footer** (the `.foot-badges` group inside `.foot-bottom`). Founder decision 2026-10-13: badges may appear in page footers, not only on the homepage. The previous "homepage only" restriction is retired. Keep the badge row to a single right-aligned row on desktop; on mobile it centres onto two rows (see the `max-width: 640px` rule).
   - The PeerPush badge ships as a light-native PNG, so it carries `filter: invert(1) hue-rotate(180deg)` plus a soft teal glow to match the dark badge set. Do not remove the invert while the other footer badges remain dark variants.
   - Badge CSS is duplicated: `assets/style.css` **and** the `assets/style.css inlined for LCP` block inside each HTML page. Edit both, or the change silently applies to only some pages.
3. **Contributor payout amounts are not shown publicly** (removed 2026-09-01). Do not reintroduce "$5"/"US$5"/earnings-amount copy on contributor pages.

## Workflow notes
- The site deploys via Cloudflare Pages from `main`. Keep the Pages Function at `functions/news/[[path]].js` (serves /news from Stork Wire).
- Do not delete `functions/` or change the /news proxy without the founder's OK.
- Untracked WIP files (`pricing.html`, `request-sample.html` — legacy drafts) must stay OUT of commits; if they exist locally, never `git add -A` them.
