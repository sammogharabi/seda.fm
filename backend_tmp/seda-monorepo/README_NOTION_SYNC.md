Notion → Markdown Sync

This adds a zero-dependency Node script to sync Notion pages/databases into Markdown files under `docs/prd/`.

Requirements
- Node 18+ (for built-in `fetch`)
- A Notion internal integration token with access to the target pages/databases

Setup
1) Create a Notion integration: https://www.notion.so/my-integrations
2) Share the desired pages/databases with the integration.
3) In your shell, export the token:

   export NOTION_API_TOKEN=secret_XXXXXXXXXXXXXXXXXXXXXXXX

4) Configure IDs in `notion.config.json` (use page/database IDs from the Notion URL or copy link):

   {
     "outputDir": "docs/prd",
     "pages": ["<PAGE_ID>"],
     "databases": ["<DATABASE_ID>"]
   }

Run
- One-off sync: `node scripts/notion-sync.mjs`
 - Find a database ID: `node scripts/notion-sync.mjs --search "PRDs"`
 - Only write changed files: `node scripts/notion-sync.mjs --changed-only` (also enabled via `changedOnly: true` in config)
 - Status: `node scripts/notion-status.mjs` (add `--write-md` to update `docs/prd/_status.md`)
 - Diff since last sync: `node scripts/notion-diff.mjs`

Notes
- Converts headings, paragraphs, lists, to-dos, code, quote, callout, divider, images, simple tables.
- Child pages/databases are traversed when `recurseChildPages` is true (suppresses noisy warnings).
- Optional asset download: when `assets.download` is true, images/files are saved to `docs/prd/assets` and links are rewritten.
- Files include frontmatter: title, notionId, lastSynced, url.
- Output filenames: `<slug>-<notionIdPrefix>.md`.

Changed-only writes
- The script compares the full output against any existing file and logs `Unchanged` when identical; it does not touch timestamps or re-add files.

Asset deduplication
- Asset filenames include a content hash (sha256 first 10 chars) to avoid duplicates and ensure stable references across re-syncs.

Pre-commit hook (optional)
- We include `.githooks/pre-commit` to auto-run the sync before committing and stage `docs/prd`.
- Enable it in your repo: `git config core.hooksPath .githooks`
- To disable temporarily, run: `git commit --no-verify`
- Smart behavior: If last sync is within `NOTION_SYNC_MAX_AGE_MIN` (default 10 minutes), the hook skips. Otherwise it runs a quick status check and only syncs if there are stale/missing pages.

GitHub Action (optional)
- Workflow at `.github/workflows/notion-sync.yml` runs daily and on demand.
- Add a repo secret `NOTION_API_TOKEN` with your integration token.
- The action syncs with `--changed-only`, regenerates the status report, and opens a PR with any changes.

Troubleshooting
- 401/403: Ensure the integration is shared to the page/database and token is correct.
- Empty title: Some databases use non-standard title props; the script looks for the first `title` property.
- Images: Notion signed URLs expire; for long-lived docs, download images separately.
