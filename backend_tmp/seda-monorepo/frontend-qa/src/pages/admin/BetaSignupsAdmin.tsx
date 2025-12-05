import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';
import { getBetaSignups, type BetaSignupRecord } from '../../services/betaSignup';

async function fetchFromApi<T>(path: string, adminKey?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (adminKey) headers.Authorization = `Bearer ${adminKey}`;
  const res = await fetch(path, { headers, credentials: 'include' });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return (await res.json()) as T;
}

function parseUTMFromUA(ua?: string): { source?: string; medium?: string; campaign?: string; term?: string; content?: string; ref?: string } {
  if (!ua) return {};
  const out: any = {};
  const re = /(utm_source|utm_medium|utm_campaign|utm_term|utm_content|ref)=([^\s]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(ua))) {
    out[m[1].replace('utm_', '')] = decodeURIComponent(m[2]);
  }
  return out;
}

function toCSV(rows: BetaSignupRecord[]) {
  // Mailchimp minimally needs an Email Address column; include UTM if available
  const header = ['Email Address', 'Signup Timestamp', 'UTM Source', 'UTM Medium', 'UTM Campaign'];
  const lines = [header.join(',')];
  for (const r of rows) {
    // Simple CSV escaping for email and ts
    const email = '"' + (r.email?.replaceAll('"', '""') || '') + '"';
    const ts = '"' + (r.ts?.replaceAll('"', '""') || '') + '"';
    const utm = r.utm || parseUTMFromUA(r.ua);
    const src = '"' + ((utm?.source || '').replaceAll('"', '""')) + '"';
    const med = '"' + ((utm?.medium || '').replaceAll('"', '""')) + '"';
    const camp = '"' + ((utm?.campaign || '').replaceAll('"', '""')) + '"';
    lines.push([email, ts, src, med, camp].join(','));
  }
  return lines.join('\n');
}

export default function BetaSignupsAdmin() {
  const [loading, setLoading] = useState(true);
  const [signups, setSignups] = useState<BetaSignupRecord[]>([]);
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState<{ total: number; last24h: number; last7d: number; byDay: { date: string; count: number }[] }>({ total: 0, last24h: 0, last7d: 0, byDay: [] });
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const [health, setHealth] = useState<any>(null);

  const expectedKey = (import.meta as any).env?.VITE_ADMIN_KEY as string | undefined;
  const [adminKey, setAdminKey] = useState<string>(() => sessionStorage.getItem('admin_key') || '');
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (!expectedKey) return true;
    const saved = sessionStorage.getItem('admin_key');
    return saved === expectedKey;
  });

  const load = async (key?: string) => {
    setLoading(true);
    try {
      if (key) {
        const rows = await fetchFromApi<BetaSignupRecord[]>(`/api/beta-signups`, key);
        setSignups(rows);
      } else if (unlocked) {
        const rows = await fetchFromApi<BetaSignupRecord[]>(`/api/beta-signups`);
        setSignups(rows);
      } else {
        const rows = await getBetaSignups();
        setSignups(rows);
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load signups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(adminKey || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/health', { credentials: 'include' });
        if (!res.ok) throw new Error('Health check failed');
        const data = await res.json();
        setHealth(data);
      } catch {
        setHealth(null);
      }
    })();
  }, []);

  useEffect(() => {
    // Compute simple stats
    const now = Date.now();
    const ms24h = 24 * 60 * 60 * 1000;
    const ms7d = 7 * ms24h;
    const total = signups.length;
    let last24h = 0;
    let last7d = 0;
    const map = new Map<string, number>();
    for (const r of signups) {
      const t = new Date(r.ts).getTime();
      if (now - t <= ms24h) last24h++;
      if (now - t <= ms7d) last7d++;
      const day = new Date(r.ts).toISOString().slice(0, 10);
      map.set(day, (map.get(day) || 0) + 1);
    }
    const byDay: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * ms24h).toISOString().slice(0, 10);
      byDay.push({ date: d, count: map.get(d) || 0 });
    }
    setStats({ total, last24h, last7d, byDay });
  }, [signups]);

  useEffect(() => {
    // Draw simple line chart onto canvas for PNG export
    const c = chartRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const w = (c.width = 560);
    const h = (c.height = 180);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, w, h);
    // axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 16);
    ctx.lineTo(32, h - 28);
    ctx.lineTo(w - 8, h - 28);
    ctx.stroke();
    const data = stats.byDay;
    if (!data.length) return;
    const max = Math.max(1, ...data.map((d) => d.count));
    const plotW = w - 48;
    const plotH = h - 48;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = 32 + (plotW * i) / (data.length - 1);
      const y = 16 + plotH - (plotH * d.count) / max;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    // points
    ctx.fillStyle = '#a3a3a3';
    data.forEach((d, i) => {
      const x = 32 + (plotW * i) / (data.length - 1);
      const y = 16 + plotH - (plotH * d.count) / max;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    // labels
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '10px system-ui, -apple-system, Segoe UI, Roboto';
    data.forEach((d, i) => {
      const x = 32 + (plotW * i) / (data.length - 1);
      const label = d.date.slice(5);
      ctx.fillText(label, x - 10, h - 14);
    });
  }, [stats]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return signups;
    return signups.filter((r) => r.email.includes(q));
  }, [filter, signups]);

  const exportCSV = async () => {
    try {
      if (adminKey) {
        // Let serverless function stream a CSV
        const res = await fetch('/api/export-beta', {
          headers: { Authorization: `Bearer ${adminKey}` },
        });
        if (!res.ok) throw new Error(`Export failed ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `seda-beta-signups-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
      // Client-side fallback
      const csv = toCSV(filtered);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seda-beta-signups-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e?.message || 'Export failed');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Beta Signups</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Settings / Health */}
            <div className="border border-border rounded-lg p-3 mb-4">
              <div className="text-sm font-medium mb-2">Settings</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="bg-card/40 border border-border rounded p-2">
                  <div className="text-xs text-muted-foreground">CAPTCHA</div>
                  <div>
                    {health?.checks?.captcha?.hasSecret ? 'Configured' : 'Not configured'}
                  </div>
                  <div className="text-xs text-muted-foreground">Provider: {health?.checks?.captcha?.provider || '—'}</div>
                  <div className="text-xs text-muted-foreground">SiteKey: {((import.meta as any).env?.VITE_HCAPTCHA_SITE_KEY || (import.meta as any).env?.VITE_CAPTCHA_SITE_KEY) ? 'present' : 'missing'}</div>
                </div>
                <div className="bg-card/40 border border-border rounded p-2">
                  <div className="text-xs text-muted-foreground">Supabase</div>
                  <div>{health?.checks?.supabase?.configured ? 'Configured' : 'Not configured'}</div>
                  <div className="text-xs text-muted-foreground">Reachable: {health?.checks?.supabase?.reachable ? 'yes' : 'no'}</div>
                </div>
                <div className="bg-card/40 border border-border rounded p-2">
                  <div className="text-xs text-muted-foreground">Redis (Upstash)</div>
                  <div>{health?.checks?.redis?.configured ? 'Configured' : 'Not configured'}</div>
                  <div className="text-xs text-muted-foreground">Reachable: {health?.checks?.redis?.reachable ? 'yes' : 'no'}</div>
                </div>
                <div className="bg-card/40 border border-border rounded p-2">
                  <div className="text-xs text-muted-foreground">Resend (Email)</div>
                  <div>{health?.checks?.resend?.configured ? 'Configured' : 'Not configured'}</div>
                </div>
              </div>
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="border border-border rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-2xl font-medium">{stats.total}</div>
              </div>
              <div className="border border-border rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Last 24h</div>
                <div className="text-2xl font-medium">{stats.last24h}</div>
              </div>
              <div className="border border-border rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Last 7d</div>
                <div className="text-2xl font-medium">{stats.last7d}</div>
              </div>
            </div>
            {/* Mini bar chart for last 7 days */}
            <div className="flex items-end gap-1 h-16 mb-2">
              {stats.byDay.map((d) => {
                const max = Math.max(1, ...stats.byDay.map((x) => x.count));
                const height = Math.round((d.count / max) * 60);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-primary/30" style={{ height: `${height}px` }} />
                    <div className="text-[10px] text-muted-foreground mt-1">{d.date.slice(5)}</div>
                  </div>
                );
              })}
            </div>
            {/* Canvas for PNG export */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-muted-foreground">Trend (7d) PNG export</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const c = chartRef.current;
                    if (!c) return;
                    const url = c.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `seda-beta-trend-${new Date().toISOString().slice(0,10)}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  Download PNG
                </Button>
              </div>
            </div>
            <canvas ref={chartRef} style={{ width: '100%', maxWidth: 560, height: 180, display: 'block' }} />
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                {loading ? 'Loading…' : `${filtered.length} of ${signups.length} signups`}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Filter by email…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="sm:w-64"
                />
                <Button onClick={exportCSV}>Export CSV</Button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between mb-4">
              <div className="text-xs text-muted-foreground">
                Use admin key to fetch from server. Leave blank to use client fallback.
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  type="password"
                  placeholder="Admin key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="sm:w-64"
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    sessionStorage.setItem('admin_key', adminKey);
                    if (expectedKey) {
                      if (adminKey === expectedKey) {
                        setUnlocked(true);
                        load(adminKey || undefined);
                      } else {
                        setUnlocked(false);
                        toast.error('Invalid admin key');
                        return;
                      }
                    } else {
                      load(adminKey || undefined);
                    }
                  }}
                >
                  Apply (Header)
                </Button>
                <Button
                  variant="default"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: adminKey }),
                        credentials: 'include',
                      });
                      if (!res.ok) throw new Error('Login failed');
                      setUnlocked(true);
                      toast.success('Admin cookie set');
                      load(undefined);
                    } catch (e: any) {
                      toast.error(e?.message || 'Login failed');
                    }
                  }}
                >
                  Sign in (Cookie)
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
                      setUnlocked(false);
                      toast.success('Signed out');
                    } catch {}
                  }}
                >
                  Sign out
                </Button>
              </div>
            </div>
            {expectedKey && !unlocked ? (
              <div className="text-center text-sm text-muted-foreground">
                Enter the admin key to view signups.
              </div>
            ) : null}
            <Separator className="mb-4" />
            {!expectedKey || unlocked ? (
            <div className="overflow-auto border border-border rounded-lg max-h-[60vh]">
              <table className="w-full text-sm">
                <thead className="bg-card sticky top-0">
                  <tr>
                    <th className="text-left p-3 border-b border-border">Email</th>
                    <th className="text-left p-3 border-b border-border">Timestamp</th>
                    <th className="text-left p-3 border-b border-border">User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td className="p-4 text-muted-foreground" colSpan={3}>No signups found.</td>
                    </tr>
                  )}
                  {filtered.map((r) => (
                    <tr key={`${r.email}-${r.ts}`} className="hover:bg-secondary/30">
                      <td className="p-3 align-top">{r.email}</td>
                      <td className="p-3 align-top">{new Date(r.ts).toLocaleString()}</td>
                      <td className="p-3 align-top text-muted-foreground break-all">{r.ua || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
