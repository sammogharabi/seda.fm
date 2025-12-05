#!/usr/bin/env node
// Notion diff: list pages changed in Notion since the last sync run

import fs from 'node:fs';
import path from 'node:path';

const NOTION_VERSION = '2022-06-28';

function warn(...a){ console.warn('[notion-diff:warn]', ...a); }
function die(m){ console.error('[notion-diff:error]', m); process.exit(1); }
function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf-8')); }

function loadEnv(){ for (const n of ['.env.local','.env']) { const p=path.resolve(process.cwd(),n); if (!fs.existsSync(p)) continue; const r=fs.readFileSync(p,'utf-8'); for (const line of r.split(/\r?\n/)) { const s=line.trim(); if(!s||s.startsWith('#')) continue; const m=s.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/); if(!m) continue; let[,k,v]=m; if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1); if(!(k in process.env)) process.env[k]=v; } } }

function normalizeId(id){ if(!id) return id; const c=String(id).replace(/-/g,''); if(/^[a-f0-9]{32}$/i.test(c)) return `${c.slice(0,8)}-${c.slice(8,12)}-${c.slice(12,16)}-${c.slice(16,20)}-${c.slice(20)}`; return id; }

async function notionFetch(pathname,{method='GET',body}={}){
  const token=process.env.NOTION_API_TOKEN; if(!token) die('Missing NOTION_API_TOKEN');
  const res=await fetch(`https://api.notion.com/v1${pathname}`,{method,headers:{Authorization:`Bearer ${token}`,'Notion-Version':NOTION_VERSION,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  if(!res.ok){ const t=await res.text(); throw new Error(`Notion API ${method} ${pathname} -> ${res.status}: ${t}`); }
  return res.json();
}

async function fetchAllBlocks(blockId){ const out=[]; let cursor; while(true){ const r=await notionFetch(`/blocks/${blockId}/children?page_size=100${cursor?`&start_cursor=${cursor}`:''}`); out.push(...r.results); if(!r.has_more) break; cursor=r.next_cursor; } return out; }

async function collectChildPages(rootPageId){ const q=[normalizeId(rootPageId)]; const seen=new Set(); const ids=[]; while(q.length){ const id=q.shift(); if(seen.has(id)) continue; seen.add(id); ids.push(id); try{ const blocks=await fetchAllBlocks(id); for(const b of blocks){ if(b.type==='child_page'&&b.id&&!seen.has(b.id)) q.push(b.id); } }catch(e){ warn('child scan failed for',id,e.message);} } return ids; }

async function fetchDatabasePages(databaseId){ const ids=[]; let cursor; while(true){ const r=await notionFetch(`/databases/${normalizeId(databaseId)}/query`,{method:'POST',body:cursor?{start_cursor:cursor}:{}}); ids.push(...r.results.map(x=>x.id)); if(!r.has_more) break; cursor=r.next_cursor; } return ids; }

async function pageMeta(id){ const p=await notionFetch(`/pages/${normalizeId(id)}`); let title='Untitled'; const props=p.properties||{}; for(const k in props){ const pr=props[k]; if(pr?.type==='title'){ const t=(pr.title||[]).map(t=>t.plain_text).join(''); if(t) title=t; break; } } return { id:p.id, title, last_edited_time:p.last_edited_time, url:p.url }; }

function loadConfig(){ const cfgPath=path.resolve(process.cwd(),'notion.config.json'); if(!fs.existsSync(cfgPath)) die('Missing notion.config.json'); const cfg=readJson(cfgPath); if(!cfg.outputDir) cfg.outputDir='docs/prd'; if(typeof cfg.recurseChildPages!=='boolean') cfg.recurseChildPages=false; return cfg; }

async function main(){
  loadEnv();
  const cfg=loadConfig();
  const outDir=path.resolve(process.cwd(),cfg.outputDir);
  const lastPath=path.join(outDir,'.last-sync.json');
  if(!fs.existsSync(lastPath)) die('No .last-sync.json found. Run a sync once to create it.');
  const meta=readJson(lastPath);
  const sinceTs=Date.parse(meta.lastSynced||'');
  if(!Number.isFinite(sinceTs)) die('Invalid lastSynced timestamp in .last-sync.json');

  const targets=[];
  if(Array.isArray(cfg.pages)){
    for(const p of cfg.pages){
      if(cfg.recurseChildPages) targets.push(...await collectChildPages(p)); else targets.push(p);
    }
  }
  if(Array.isArray(cfg.databases)){
    for(const d of cfg.databases){ targets.push(...await fetchDatabasePages(d)); }
  }
  const uniq=[...new Set(targets)];
  const changed=[];
  for(const id of uniq){ try{ const m=await pageMeta(id); const remote=Date.parse(m.last_edited_time); if(Number.isFinite(remote)&&remote>sinceTs) changed.push(m); }catch(e){ warn('meta failed for',id,e.message); } }
  console.log(`[notion-diff] Since ${new Date(sinceTs).toISOString()}: ${changed.length} changed`);
  for(const m of changed){ console.log('-', m.title, '|', m.id.replace(/-/g,''), '|', m.last_edited_time); }
}

main().catch(err=>{ console.error(err.stack||String(err)); process.exit(1); });

