# AGENTS.md — Repository rules for AI agents

Instructions for any agent (AI or human) working in this repository.

## HARD RULES — do not violate

1. **`pricing.html` and `video-data.html` are permanently removed** (founder decision, 2026-09-01).
   - Do NOT re-create, re-add, or commit these files for any reason.
   - Do NOT add links to `/pricing` or `/video-data` in nav, footers, CTAs, content, `sitemap.xml`, `llms.txt`, or `_redirects`.
   - A GitHub Action (`.github/workflows/guard.yml`) auto-deletes them if they reappear.
2. **Directory badges live only on `/as-seen-on`** — except the Stork.ai badge, which also sits in the homepage footer (Stork's verifier requires homepage placement). Do not add badges to other footers.
3. **Contributor payout amounts are not shown publicly** (removed 2026-09-01). Do not reintroduce "$5"/"US$5"/earnings-amount copy on contributor pages.

## Workflow notes
- The site deploys via Cloudflare Pages from `main`. Keep the Pages Function at `functions/news/[[path]].js` (serves /news from Stork Wire).
- Do not delete `functions/` or change the /news proxy without the founder's OK.
- Untracked WIP files (`pricing.html`, `request-sample.html` — legacy drafts) must stay OUT of commits; if they exist locally, never `git add -A` them.
