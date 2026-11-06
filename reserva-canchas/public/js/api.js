const $ = s => document.querySelector(s), get = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
const fmt = v => Array.isArray(v) ? v.join(', ') : typeof v === 'boolean' ? (v ? 'Sí' : 'No') : typeof v === 'number' ? v.toLocaleString('es-CO') : v ?? '';
const note = (m, ok) => { $('#msg').className = ok ? 'ok' : 'err'; $('#msg').textContent = m; };
async function api(path, opt) {
  const r = await fetch('/api/' + path, { headers: { 'Content-Type': 'application/json' }, ...opt }), d = await r.json();
  if (!r.ok) throw new Error(d.error);
  return d;
}
