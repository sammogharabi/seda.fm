/*
  Production start wrapper
  - Performs brief DNS/TCP checks for Supabase based on DATABASE_URL
  - Optional: set SKIP_MIGRATIONS_ON_BOOT=1 to skip Prisma migrations while debugging
  - Then starts the Nest app
*/

const dns = require('node:dns');
const net = require('node:net');
const { spawnSync, spawn } = require('node:child_process');

function log(...args) {
  const ts = new Date().toISOString();
  console.log(`[start-prod ${ts}]`, ...args);
}

function parseDb(urlStr) {
  try {
    const u = new URL(urlStr);
    return { host: u.hostname, port: u.port ? Number(u.port) : undefined };
  } catch {
    return null;
  }
}

function altHost(host) {
  if (host.endsWith('.pooler.supabase.com')) {
    const ref = host.replace('.pooler.supabase.com', '');
    return `db.${ref}.supabase.co`;
  }
  if (host.startsWith('db.') && host.endsWith('.supabase.co')) {
    const ref = host.replace(/^db\./, '').replace('.supabase.co', '');
    return `${ref}.pooler.supabase.com`;
  }
  return null;
}

function dnsResolve(host, label) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      log(`[DNS ${label}]`, host, 'timeout');
      resolve();
    }, 2500);
    dns.resolve4(host, (err, addrs) => {
      clearTimeout(timer);
      if (err) log(`[DNS ${label}]`, host, err.code || String(err));
      else log(`[DNS ${label}]`, host, addrs);
      resolve();
    });
  });
}

function tcpCheck(host, port, label) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port, timeout: 2500 });
    socket.on('connect', () => {
      log(`[TCP ${label}]`, `${host}:${port}`, 'ok');
      socket.end();
      resolve();
    });
    socket.on('timeout', () => {
      log(`[TCP ${label}]`, `${host}:${port}`, 'timeout');
      socket.destroy();
      resolve();
    });
    socket.on('error', (err) => {
      log(`[TCP ${label}]`, `${host}:${port}`, err.code || String(err));
      resolve();
    });
  });
}

async function preflight() {
  const url = process.env.DATABASE_URL || '';
  const cur = parseDb(url);
  try {
    const u = new URL(url);
    const db = u.pathname && u.pathname !== '/' ? u.pathname.slice(1) : '';
    log('Database (sanitized)', {
      protocol: u.protocol,
      host: u.hostname,
      port: u.port || '(default)',
      database: db || '(none)',
      params: u.search || ''
    });
  } catch {}
  if (!cur) {
    log('DATABASE_URL missing/invalid — skipping checks');
    return;
  }
  const targets = [];
  targets.push({ label: 'configured', host: cur.host, port: cur.port || (cur.host.endsWith('.pooler.supabase.com') ? 6543 : 5432) });
  const alt = altHost(cur.host);
  if (alt) targets.push({ label: 'alternate', host: alt, port: alt.endsWith('.pooler.supabase.com') ? 6543 : 5432 });

  for (const t of targets) {
    await dnsResolve(t.host, t.label);
    await tcpCheck(t.host, t.port, t.label);
  }
}

async function main() {
  log('Starting production with preflight checks');
  await preflight();

  if (process.env.SKIP_MIGRATIONS_ON_BOOT === '1' || /^true$/i.test(process.env.SKIP_MIGRATIONS_ON_BOOT || '')) {
    log('SKIP_MIGRATIONS_ON_BOOT=1 — skipping Prisma migrate on boot');
  } else {
    log('Running: npx prisma generate');
    const gen = spawnSync('npx', ['prisma', 'generate'], { stdio: 'inherit' });
    if (gen.status !== 0) process.exit(gen.status || 1);

    log('Running: npx prisma migrate deploy');
    const mig = spawnSync('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit' });
    if (mig.status !== 0) process.exit(mig.status || 1);
  }

  log('Starting application');
  const app = spawn(process.execPath, ['dist/main.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    log('Received SIGTERM, shutting down gracefully');
    app.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    log('Received SIGINT, shutting down gracefully');
    app.kill('SIGINT');
  });

  app.on('exit', (code) => {
    log('Application exited with code', code);
    process.exit(code || 0);
  });
}

main().catch((e) => {
  log('Fatal error', e);
  process.exit(1);
});
