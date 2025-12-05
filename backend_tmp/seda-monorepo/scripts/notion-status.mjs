#!/usr/bin/env node
// Notion sync status reporter: compares local frontmatter lastSynced vs Notion last_edited_time
// Node 18+, no external deps.

import fs from 'node:fs';
import path from 'node:path';

const NOTION_VERSION = '2022-06-28';

function log(...args) { console.log('[notion-status]', ...args); }
function warn(...args) { console.warn('[notion-status:warn]', ...args); }
function die(msg, code = 1) { console.error('[notion-status:error]', msg); process.exit(code); }

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function loadEnv() {
  const candidates = ['.env.local', '.env'];
  for (const name of candidates) {
    const p = path.resolve(process.cwd(), name);
    if (!fs.existsSync(p)) continue;
    try {
      const raw = fs.readFileSync(p, 'utf-8');
      for (const line of raw.split(/\r?\n/)) {
        const s = line.trim();
        if (!s || s.startsWith('#')) continue;
        const m = s.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (!m) continue;
        let [, k, v] = m;
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (!(k in process.env)) process.env[k] = v;
      }
    } catch (e) { warn('env read failed', name, e.message); }
  }
}

function normalizeId(id) {
  if (!id) return id;
  const clean = String(id).replace(/-/g, '');
  if (/^[a-f0-9]{32}$/i.test(clean)) {
    return `${clean.slice(0,8)}-${clean.slice(8,12)}-${clean.slice(12,16)}-${clean.slice(16,20)}-${clean.slice(20)}`;
  }
  return id;
}

async function notionFetch(pathname, { method = 'GET', body } = {}) {
  const token = process.env.NOTION_API_TOKEN;
  if (!token) die('Missing NOTION_API_TOKEN');
  const res = await fetch(`https://api.notion.com/v1${pathname}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`Notion API ${method} ${pathname} -> ${res.status}: ${t}`); }
  return res.json();
}

async function fetchAllBlocks(blockId) {
  const blocks = [];
  let cursor;
  while (true) {
    const res = await notionFetch(`/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`);
    blocks.push(...res.results);
    if (!res.has_more) break;
    cursor = res.next_cursor;
  }
  return blocks;
}

async function collectChildPages(rootPageId) {
  const queue = [normalizeId(rootPageId)];
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
        if (b.type === 'child_page' && b.id && !seen.has(b.id)) queue.push(b.id);
      }
    } catch (e) {
      warn('child scan failed for', pid, e.message);
    }
  }
  return collected;
}

async function fetchDatabasePages(databaseId) {
  const ids = [];
  let cursor;
  while (true) {
    const res = await notionFetch(`/databases/${normalizeId(databaseId)}/query`, { method: 'POST', body: cursor ? { start_cursor: cursor } : {} });
    ids.push(...res.results.map(r => r.id));
    if (!res.has_more) break;
    cursor = res.next_cursor;
  }
  return ids;
}

async function pageMeta(pageId) {
  const p = await notionFetch(`/pages/${normalizeId(pageId)}`);
  // derive title
  let title = 'Untitled';
  const props = p.properties || {};
  for (const [_, prop] of Object.entries(props)) {
    if (prop.type === 'title') {
      const t = (prop.title || []).map(t => t.plain_text).join('');
      if (t) title = t;
      break;
    }
  }
  return { id: p.id, title, last_edited_time: p.last_edited_time, url: p.url };
}

function loadConfig() {
  const cfgPath = path.resolve(process.cwd(), 'notion.config.json');
  if (!fs.existsSync(cfgPath)) die('Missing notion.config.json');
  const cfg = readJson(cfgPath);
  if (!cfg.outputDir) cfg.outputDir = 'docs/prd';
  if (typeof cfg.recurseChildPages !== 'boolean') cfg.recurseChildPages = false;
  return cfg;
}

function pageFilename(title, pageId) { return `${String(title).toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-')}-${pageId.slice(0,6)}.md`; }

function readLastSynced(mdPath) {
  if (!fs.existsSync(mdPath)) return null;
  const text = fs.readFileSync(mdPath, 'utf-8');
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const fm = text.slice(3, end).trim();
  const lines = fm.split(/\r?\n/);
  const map = {};
  for (const line of lines) {
    const i = line.indexOf(':'); if (i === -1) continue;
    const k = line.slice(0,i).trim(); const v = line.slice(i+1).trim();
    map[k] = v;
  }
  return map.lastSynced || null;
}

async function main() {
  loadEnv();
  const cfg = loadConfig();
  const outDir = path.resolve(process.cwd(), cfg.outputDir);
  ensureDir(outDir);
  const argv = process.argv.slice(2);
  const writeMd = argv.includes('--write-md');
  const quiet = argv.includes('--quiet');
  const exitNonzero = argv.includes('--exit-nonzero');

  const targetIds = [];
  if (Array.isArray(cfg.pages)) {
    for (const p of cfg.pages) {
      if (cfg.recurseChildPages) {
        const all = await collectChildPages(p);
        targetIds.push(...all);
      } else {
        targetIds.push(p);
      }
    }
  }
  if (Array.isArray(cfg.databases)) {
    for (const d of cfg.databases) {
      const ids = await fetchDatabasePages(d);
      targetIds.push(...ids);
    }
  }

  const uniq = Array.from(new Set(targetIds));
  log('Checking', uniq.length, 'pages');
  const summary = { upToDate: 0, stale: 0, missing: 0 };
  const staleList = [];
  const missingList = [];

  for (const id of uniq) {
    try {
      const meta = await pageMeta(id);
      const filename = pageFilename(meta.title, meta.id);
      const filePath = path.join(outDir, filename);
      const lastSynced = readLastSynced(filePath);
      if (!lastSynced) {
        summary.missing++; missingList.push(filePath); continue;
      }
      const remote = new Date(meta.last_edited_time).getTime();
      const local = new Date(lastSynced).getTime();
      if (isFinite(remote) && isFinite(local) && local >= remote) summary.upToDate++;
      else { summary.stale++; staleList.push({ file: filePath, notionLastEdited: meta.last_edited_time }); }
    } catch (e) {
      warn('status check failed for', id, e.message);
    }
  }

  console.log('[notion-status] Summary:', `${summary.upToDate} up-to-date, ${summary.stale} stale, ${summary.missing} missing`);
  if (!quiet) {
    if (staleList.length) {
      console.log('[notion-status] Stale files:');
      for (const s of staleList) console.log('-', s.file, '→ Notion last edited:', s.notionLastEdited);
    }
    if (missingList.length) {
      console.log('[notion-status] Missing files:');
      for (const f of missingList) console.log('-', f);
    }
  }

  if (writeMd) {
    const lines = [];
    lines.push('# PRD Sync Status', '');
    const now = new Date().toISOString();
    lines.push(`Last checked: ${now}`, '');
    lines.push(`Summary: ${summary.upToDate} up-to-date, ${summary.stale} stale, ${summary.missing} missing`, '');
    if (staleList.length) {
      lines.push('## Stale', '');
      for (const s of staleList) lines.push(`- ${s.file} (Notion last edited: ${s.notionLastEdited})`);
      lines.push('');
    }
    if (missingList.length) {
      lines.push('## Missing', '');
      for (const f of missingList) lines.push(`- ${f}`);
      lines.push('');
    }
    const mdPath = path.join(outDir, '_status.md');
    fs.writeFileSync(mdPath, lines.join('\n'), 'utf-8');
    if (!quiet) console.log('[notion-status] Wrote', path.relative(process.cwd(), mdPath));
  }

  if (exitNonzero && (summary.stale > 0 || summary.missing > 0)) process.exit(2);
}

main().catch(err => { console.error(err.stack || String(err)); process.exit(1); });
