/**
 * Pure, dependency-free core for dsh-plugin-compat-lab (Plugin Compatibility Lab).
 * Reads only metadata from session events; never prompts, tool bodies or file contents.
 */

const SECRET_RE = /((?:token|key|secret|password|authorization|bearer)[^\s:=]{0,24}[:=]\s*)[^\s&]+/gi
const QUERY_RE = /([?&](?:token|key|secret|password|auth)=)[^&#\s]+/gi
/** Strip credential-looking substrings before anything is printed. */
export function redact(value: unknown): string {
  const text = value instanceof Error ? value.stack || value.message : String(value)
  return text.replace(SECRET_RE, '$1[redacted]').replace(QUERY_RE, '$1[redacted]')
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function analyze(events: readonly unknown[]): any {
  const list = Array.isArray(events) ? events : []
  const plugins = new Map<any, any>()
  const scenarios = new Set()
  let residue = 0
  for (const e of list) {
    if (!isRecord(e) || !isRecord(e.data)) continue
    if (typeof e.data.package === 'string') {
      const p = e.data.package
      const row = plugins.get(p) || { package: p, installed: false, loaded: false, uninstalled: false }
      if (typeof e.type === 'string') {
        if (e.type.includes('install')) row.installed = true
        if (e.type.includes('load') || e.type.includes('apply')) row.loaded = true
        if (e.type.includes('uninstall') || e.type.includes('remove')) row.uninstalled = true
      }
      plugins.set(p, row)
    }
    if (typeof e.data.scenario === 'string') scenarios.add(e.data.scenario)
    if (typeof e.type === 'string' && e.type.includes('residue')) residue++
  }
  const rows = [...plugins.values()]
  const clean = rows.filter(r => r.installed && r.loaded && r.uninstalled).length
  return {
    sampledEvents: list.length,
    plugins: rows,
    scenarios: [...scenarios].slice(0, 10),
    total: rows.length,
    clean,
    residue,
    versionMatrix: 'node ^22.19.0||>=24 · dsh >=0.2.0-rc.2<0.3.0 · cordis >=4<5',
  }
}

export function formatReport(a: any, opts: { json?: boolean } = {}): string {
  if (opts.json) return JSON.stringify(a, null, 2)
  const head = '[compat-lab] ' + a.clean + '/' + a.total + ' plugin(s) clean · ' +
    a.scenarios.length + ' scenario(s) · ' + a.residue + ' residue finding(s)'
  if (a.plugins.length === 0) return head + '\n  no install/uninstall events observed yet'
  const lines = a.plugins.slice(0, 12).map(r =>
    '  ' + redact(r.package) + '  install=' + r.installed + ' load=' + r.loaded + ' uninstall=' + r.uninstalled)
  return [head, ...lines, '  matrix: ' + a.versionMatrix].join('\n')
}
