/*
  Connectivity checker for Railway → Supabase
  - Resolves DNS and attempts TCP connections to both the configured DATABASE_URL host
    and the alternative Supabase host (pooler <-> direct), then keeps the process alive.
  - Prints only non-sensitive details (never logs DB password).
*/

const dns = require('node:dns');
const net = require('node:net');

function log(...args) {
  const ts = new Date().toISOString();
  console.log(`[net-check ${ts}]`, ...args);
}

function sanitizeDbUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    const db = u.pathname && u.pathname !== '/' ? u.pathname.slice(1) : '';
    return {
      protocol: u.protocol,
      host: u.hostname,
      port: u.port || '(default)',
      database: db || '(none)',
      params: u.search || ''
    };
  } catch (e) {
    return null;
  }
}

function deriveAltHost(host) {
  // Convert between pooler and direct hosts for the same project ref
  // db.<ref>.supabase.co <-> <ref>.pooler.supabase.com
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
    }, 5000);
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
    const socket = net.connect({ host, port, timeout: 5000 });
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

async function main() {
  log('Node version', process.version);
  log('NODE_ENV', process.env.NODE_ENV || '(unset)');
  const info = sanitizeDbUrl(process.env.DATABASE_URL || '');
  if (!info) {
    log('DATABASE_URL is missing or invalid');
  } else {
    log('Database (sanitized)', info);
  }

  const targets = [];
  if (info) {
    // Current configured host
    const curPort = Number(info.port && info.port !== '(default)') || (info.host.endsWith('.pooler.supabase.com') ? 6543 : 5432);
    targets.push({ label: 'configured', host: info.host, port: curPort });

    // Alternate host
    const alt = deriveAltHost(info.host);
    if (alt) {
      const altPort = alt.endsWith('.pooler.supabase.com') ? 6543 : 5432;
      targets.push({ label: 'alternate', host: alt, port: altPort });
    }
  } else {
    // Fallback to known hosts if parsing failed
    targets.push({ label: 'direct', host: 'db.ifrbbfqabeeyxrrliank.supabase.co', port: 5432 });
    targets.push({ label: 'pooler', host: 'ifrbbfqabeeyxrrliank.pooler.supabase.com', port: 6543 });
  }

  for (const t of targets) {
    await dnsResolve(t.host, t.label);
    await tcpCheck(t.host, t.port, t.label);
  }

  log('Checks complete. Keeping process alive for Shell/Logs...');
  // Keep process alive so the service is "Running" and you can read logs or open Shell.
  setInterval(() => {}, 1 << 30);
}

main().catch((e) => {
  log('Unexpected error', e);
  setInterval(() => {}, 1 << 30);
});

