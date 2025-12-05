#!/usr/bin/env node
// Minimal Notion → Markdown sync without external deps (Node 18+)
// Reads config from `notion.config.json` and env `NOTION_API_TOKEN`.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const NOTION_VERSION = '2022-06-28';

function log(...args) {
  console.log('[notion-sync]', ...args);
}

function warn(...args) {
  console.warn('[notion-sync:warn]', ...args);
}

function die(msg, code = 1) {
  console.error('[notion-sync:error]', msg);
  process.exit(code);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function loadEnv() {
  const candidates = [
    '.env.local',
    '.env',
  ];
  for (const name of candidates) {
    const p = path.resolve(process.cwd(), name);
    if (!fs.existsSync(p)) continue;
    try {
      const raw = fs.readFileSync(p, 'utf-8');
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const m = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (!m) continue;
        let [, key, val] = m;
        // Strip surrounding single/double quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = val;
      }
    } catch (e) {
      warn('Failed reading env file', name, e.message);
    }
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function frontmatter(obj) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(obj)) {
    lines.push(`${k}: ${String(v).replace(/\n/g, ' ')}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

function normalizeId(id) {
  if (!id) return id;
  const clean = String(id).replace(/-/g, '');
  if (/^[a-f0-9]{32}$/i.test(clean)) {
    return (
      clean.slice(0, 8) +
      '-' +
      clean.slice(8, 12) +
      '-' +
      clean.slice(12, 16) +
      '-' +
      clean.slice(16, 20) +
      '-' +
      clean.slice(20)
    );
  }
  return id;
}

async function notionFetch(pathname, { method = 'GET', body } = {}) {
  const token = process.env.NOTION_API_TOKEN;
  if (!token) die('Missing NOTION_API_TOKEN in environment');
  const res = await fetch(`https://api.notion.com/v1${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API ${method} ${pathname} -> ${res.status}: ${text}`);
  }
  return res.json();
}

function richTextToMarkdown(rt = []) {
  return rt
    .map((t) => {
      const content = t.plain_text || '';
      const a = t.annotations || {};
      let out = content;
      if (a.code) out = '`' + out + '`';
      if (a.bold) out = '**' + out + '**';
      if (a.italic) out = '*' + out + '*';
      if (a.strikethrough) out = '~~' + out + '~~';
      if (a.underline) out = '<u>' + out + '</u>';
      if (t.href) out = `[${out}](${t.href})`;
      return out;
    })
    .join('');
}

function codeLanguage(tag) {
  if (!tag) return '';
  return String(tag).toLowerCase();
}

async function fetchAllBlocks(blockId) {
  const blocks = [];
  let cursor = undefined;
  while (true) {
    const res = await notionFetch(`/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`);
    blocks.push(...res.results);
    if (!res.has_more) break;
    cursor = res.next_cursor;
  }
  return blocks;
}

async function blocksToMarkdown(blocks, depth = 0, ctx = {}) {
  const lines = [];
  const indent = '  '.repeat(depth);
  const downloadAssets = !!ctx.downloadAssets;
  const assetsDirAbs = ctx.assetsDirAbs || '';
  const assetsRelFromDocs = ctx.assetsRelFromDocs || 'assets';

  async function downloadAsset(url, preferredName = '') {
    try {
      const res = await fetch(url);
      if (!res.ok) return { rel: url };
      const buf = Buffer.from(await res.arrayBuffer());
      const ct = res.headers.get('content-type') || '';
      const ext = ct.includes('png') ? '.png' : ct.includes('jpeg') || ct.includes('jpg') ? '.jpg' : ct.includes('gif') ? '.gif' : ct.includes('webp') ? '.webp' : ct.includes('pdf') ? '.pdf' : '';
      const baseName = slugify(preferredName || path.basename(new URL(url).pathname)) || 'asset';
      const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
      const name = `${baseName}-${hash}${ext}`;
      const abs = path.join(assetsDirAbs, name);
      if (!fs.existsSync(abs)) {
        fs.writeFileSync(abs, buf);
      }
      return { rel: path.posix.join(assetsRelFromDocs, name) };
    } catch (e) {
      warn('asset download failed', e.message);
      return { rel: url };
    }
  }
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const { type, has_children } = b;
    const data = b[type] || {};

    switch (type) {
      case 'paragraph': {
        const text = richTextToMarkdown(data.rich_text);
        if (text) lines.push(text, '');
        break;
      }
      case 'heading_1':
      case 'heading_2':
      case 'heading_3': {
        const level = type === 'heading_1' ? '#' : type === 'heading_2' ? '##' : '###';
        lines.push(`${level} ${richTextToMarkdown(data.rich_text)}`, '');
        break;
      }
      case 'bulleted_list_item': {
        lines.push(`${indent}- ${richTextToMarkdown(data.rich_text)}`);
        if (has_children) {
          const children = await fetchAllBlocks(b.id);
          const childMd = await blocksToMarkdown(children, depth + 1);
          if (childMd) lines.push(childMd);
        }
        break;
      }
      case 'numbered_list_item': {
        lines.push(`${indent}1. ${richTextToMarkdown(data.rich_text)}`);
        if (has_children) {
          const children = await fetchAllBlocks(b.id);
          const childMd = await blocksToMarkdown(children, depth + 1);
          if (childMd) lines.push(childMd);
        }
        break;
      }
      case 'to_do': {
        const checked = data.checked ? 'x' : ' ';
        lines.push(`${indent}- [${checked}] ${richTextToMarkdown(data.rich_text)}`);
        break;
      }
      case 'toggle': {
        lines.push(`${indent}<details><summary>${richTextToMarkdown(data.rich_text)}</summary>`);
        if (has_children) {
          const children = await fetchAllBlocks(b.id);
          const childMd = await blocksToMarkdown(children, depth + 1);
          if (childMd) lines.push(childMd);
        }
        lines.push(`${indent}</details>`);
        break;
      }
      case 'quote': {
        lines.push(`> ${richTextToMarkdown(data.rich_text)}`, '');
        break;
      }
      case 'callout': {
        const emoji = data.icon?.emoji ? `${data.icon.emoji} ` : '';
        lines.push(`> ${emoji}${richTextToMarkdown(data.rich_text)}`, '');
        break;
      }
      case 'code': {
        const lang = codeLanguage(data.language);
        lines.push('```' + lang, (data.rich_text || []).map((t) => t.plain_text).join(''), '```', '');
        break;
      }
      case 'divider': {
        lines.push('---', '');
        break;
      }
      case 'image': {
        const cap = richTextToMarkdown(data.caption || []);
        const src = data.type === 'external' ? data.external.url : data.file?.url;
        if (src) lines.push(`![${cap}](${src})`, '');
        break;
      }
      case 'bookmark': {
        lines.push(`[${data.url}](${data.url})`, '');
        break;
      }
      case 'table': {
        // Minimal: flatten table rows to pipe table if possible
        const children = await fetchAllBlocks(b.id);
        const rows = children.filter((c) => c.type === 'table_row');
        for (let r = 0; r < rows.length; r++) {
          const cells = rows[r].table_row.cells || [];
          const md = '|' + cells.map((cell) => ' ' + richTextToMarkdown(cell) + ' ').join('|') + '|';
          lines.push(md);
          if (r === 0) lines.push('|' + cells.map(() => ' --- ').join('|') + '|');
        }
        lines.push('');
        break;
      }
      default: {
        if (type === 'child_page' || type === 'child_database') {
          // Suppress noisy warnings; these are represented via recursion.
          break;
        }
        if (type === 'image') break; // handled above
        if (type === 'file') {
          const src = data.type === 'external' ? data.external?.url : data.file?.url;
          const cap = richTextToMarkdown(data.caption || []);
          if (src) {
            if (downloadAssets && assetsDirAbs) {
              const saved = await downloadAsset(src, cap || 'file');
              lines.push(`[${cap || 'file'}](${saved.rel})`);
            } else {
              lines.push(`[${cap || 'file'}](${src})`);
            }
            lines.push('');
          }
          break;
        }
        warn('Unsupported block type:', type);
        break;
      }
    }
  }
  return lines.join('\n');
}

async function fetchPage(pageId, ctx = {}) {
  const page = await notionFetch(`/pages/${normalizeId(pageId)}`);
  // Try to get the title from common properties or plain URL fallback
  let title = 'Untitled';
  // Attempt: Notion titles usually live in a property of type 'title'
  const props = page.properties || {};
  for (const [name, prop] of Object.entries(props)) {
    if (prop.type === 'title') {
      const t = prop.title?.map((t) => t.plain_text).join('') || '';
      if (t) title = t;
      break;
    }
  }
  const blocks = await fetchAllBlocks(pageId);
  const md = await blocksToMarkdown(blocks, 0, ctx);
  return { page, title, markdown: md };
}

async function fetchDatabasePages(databaseId) {
  const pages = [];
  let cursor = undefined;
  while (true) {
    const res = await notionFetch(`/databases/${normalizeId(databaseId)}/query`, {
      method: 'POST',
      body: cursor ? { start_cursor: cursor } : {},
    });
    pages.push(...res.results);
    if (!res.has_more) break;
    cursor = res.next_cursor;
  }
  return pages;
}

async function collectChildPages(rootPageId) {
  const queue = [rootPageId];
  const seen = new Set();
  const collected = [];
  while (queue.length) {
    const pid = queue.shift();
    if (seen.has(pid)) continue;
    seen.add(pid);
    collected.push(pid);
    try {
      const blocks = await fetchAllBlocks(pid);
      for (const b of blocks) {
        if (b.type === 'child_page' && b.id && !seen.has(b.id)) {
          queue.push(b.id);
        }
      }
    } catch (e) {
      warn('Failed to inspect child pages for', pid, e.message);
    }
  }
  return collected;
}

function loadConfig() {
  const configPath = path.resolve(process.cwd(), 'notion.config.json');
  if (!fs.existsSync(configPath)) die('Missing notion.config.json in project root');
  const cfg = readJson(configPath);
  if (!cfg.outputDir) cfg.outputDir = 'docs/prd';
  if (typeof cfg.recurseChildPages !== 'boolean') cfg.recurseChildPages = false;
  return cfg;
}

function pageFilename(title, pageId) {
  return `${slugify(title)}-${pageId.slice(0, 6)}.md`;
}

async function writePageMarkdown(outDir, info, opts = {}) {
  const { page, title, markdown } = info;
  const fm = frontmatter({
    title,
    notionId: page.id,
    lastSynced: new Date().toISOString(),
    url: page.url || '',
  });
  const file = path.join(outDir, pageFilename(title, page.id));
  const content = fm + markdown;
  if (opts.changedOnly && fs.existsSync(file)) {
    const existing = fs.readFileSync(file, 'utf-8');
    if (existing === content) return { file, changed: false };
  }
  fs.writeFileSync(file, content, 'utf-8');
  return { file, changed: true };
}

async function main() {
  // Load .env before anything else
  loadEnv();

  // Simple arg parsing for --search "query"
  const argv = process.argv.slice(2);
  const si = argv.indexOf('--search');
  if (si !== -1) {
    const query = argv[si + 1] || '';
    if (!query) die('Usage: node scripts/notion-sync.mjs --search "PRDs"');
    const res = await notionFetch('/search', {
      method: 'POST',
      body: { query, filter: { property: 'object', value: 'database' }, page_size: 50 },
    });
    const items = res.results || [];
    if (items.length === 0) {
      console.log('No databases found for query:', query);
    } else {
      console.log('Databases:');
      for (const it of items) {
        const title = (it.title || []).map((t) => t.plain_text).join('') || 'Untitled';
        console.log('-', title, '|', it.id.replace(/-/g, ''));
      }
    }
    return;
  }

  const cfg = loadConfig();
  const outDir = path.resolve(process.cwd(), cfg.outputDir);
  ensureDir(outDir);
  const assetsDirAbs = path.resolve(outDir, 'assets');
  if (cfg.assets?.download) ensureDir(assetsDirAbs);
  const ctxBase = {
    downloadAssets: !!(cfg.assets && cfg.assets.download),
    assetsDirAbs,
    assetsRelFromDocs: 'assets',
  };

  // Flags
  const changedOnly = argv.includes('--changed-only') || !!cfg.changedOnly;
  const summary = { changed: [], unchanged: [] };

  const picked = [];
  if (Array.isArray(cfg.pages)) picked.push(...cfg.pages.map((p) => ({ type: 'page', id: p })));
  if (Array.isArray(cfg.databases)) picked.push(...cfg.databases.map((d) => ({ type: 'database', id: d })));
  if (picked.length === 0) die('Config must include `pages` or `databases`');

  log('Sync start →', outDir);
  for (const item of picked) {
    if (item.type === 'page') {
      if (cfg.recurseChildPages) {
        const allPages = await collectChildPages(item.id);
        log('Page tree size:', allPages.length);
        for (const pid of allPages) {
          const info = await fetchPage(pid, ctxBase);
          const res = await writePageMarkdown(outDir, info, { changedOnly });
          const rel = path.relative(process.cwd(), res.file);
          if (res.changed) { log('Wrote', rel); summary.changed.push(rel); }
          else { log('Unchanged', rel); summary.unchanged.push(rel); }
        }
      } else {
        log('Page', item.id);
        const info = await fetchPage(item.id, ctxBase);
        const res = await writePageMarkdown(outDir, info, { changedOnly });
        const rel = path.relative(process.cwd(), res.file);
        if (res.changed) { log('Wrote', rel); summary.changed.push(rel); }
        else { log('Unchanged', rel); summary.unchanged.push(rel); }
      }
    } else if (item.type === 'database') {
      log('Database', item.id);
      const pages = await fetchDatabasePages(item.id);
      log('Found pages:', pages.length);
      for (const p of pages) {
        const info = await fetchPage(p.id, ctxBase);
        const res = await writePageMarkdown(outDir, info, { changedOnly });
        const rel = path.relative(process.cwd(), res.file);
        if (res.changed) { log('Wrote', rel); summary.changed.push(rel); }
        else { log('Unchanged', rel); summary.unchanged.push(rel); }
      }
    }
  }

  log('Sync complete');
  console.log('[notion-sync] Summary:', `${summary.changed.length} changed, ${summary.unchanged.length} unchanged`);
  if (summary.changed.length) {
    console.log('[notion-sync] Changed files:');
    for (const f of summary.changed) console.log('-', f);
  }

  // Persist last sync timestamp and basic meta
  try {
    const syncMetaPath = path.resolve(outDir, '.last-sync.json');
    const payload = {
      lastSynced: new Date().toISOString(),
      changed: summary.changed,
      unchanged: summary.unchanged,
    };
    fs.writeFileSync(syncMetaPath, JSON.stringify(payload, null, 2));
  } catch (e) {
    warn('Failed to write last-sync metadata', e.message);
  }
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
