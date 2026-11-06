let cur, edit, rows = [], refs = {};
const label = o => o.nombre + (o.sede ? ' - ' + o.sede.nombre : '');
const field = ([k, l, t = 'text']) => `<label>${l}${t.startsWith('sel:') ? `<select name="${k}">${t.slice(4).split(',').map(o => `<option>${o}</option>`).join('')}</select>`
  : t.startsWith('ref:') ? `<select name="${k}">${refs[k].map(o => `<option value="${o._id}">${label(o)}</option>`).join('')}</select>`
  : `<input name="${k}" type="${t}" ${OPCIONALES.includes(k) ? '' : 'required'}>`}</label>`;

async function show(n) {
  cur = n; edit = null; note('');
  if (n === 'reportes') return reportes();
  const e = E[n];
  try { for (const [k, , t] of e.f) if (t?.startsWith('ref:')) refs[k] = await api(t.slice(4)); } catch (err) { return note(err.message); }
  $('#view').innerHTML = `<h2>${e.t}</h2><form id="f">${e.f.map(field).join('')}<button>Guardar</button><button type="button" id="x" hidden>Cancelar</button></form>
  <div class="bar"><input id="q" placeholder="Buscar en ${e.t.toLowerCase()}…">${e.fl ? `<select id="fl"><option value="">Todos</option>${e.fl[1].map(o => `<option>${o}</option>`).join('')}</select>` : ''}</div><div class="wrap" id="tb"></div>`;
  $('#q').oninput = load; if ($('#fl')) $('#fl').onchange = load;
  $('#x').onclick = () => { edit = null; $('#f').reset(); $('#x').hidden = true; };
  $('#f').onsubmit = async ev => {
    ev.preventDefault(); const b = Object.fromEntries(new FormData(ev.target));
    try { await api(n + (edit ? '/' + edit : ''), { method: edit ? 'PUT' : 'POST', body: JSON.stringify(b) }); note(edit ? 'Cambios guardados' : 'Registro creado', 1); edit = null; ev.target.reset(); $('#x').hidden = true; load(); }
    catch (err) { note(err.message); }
  };
  $('#tb').onclick = async ev => {
    const t = ev.target;
    if (t.dataset.d && confirm('¿Eliminar este registro?')) try { await api(cur + '/' + t.dataset.d, { method: 'DELETE' }); note('Registro eliminado', 1); load(); } catch (err) { note(err.message); }
    if (t.dataset.e) {
      const r = rows.find(x => x._id === t.dataset.e); edit = r._id;
      for (const [k, , , p] of E[cur].f) $('#f').elements[k].value = fmt(get(r, p || k));
      $('#x').hidden = false; scrollTo(0, 0);
    }
  };
  load();
}
async function load() {
  const e = E[cur], p = new URLSearchParams();
  if ($('#q').value) p.set('q', $('#q').value); if ($('#fl')?.value) p.set(e.fl[0], $('#fl').value);
  try { rows = await api(cur + '?' + p); } catch (err) { return note(err.message); }
  $('#tb').innerHTML = rows.length ? `<table><thead><tr>${e.c.map(c => `<th>${c.split('.').slice(-1)}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map(r => `<tr>${e.c.map(c => `<td>${fmt(get(r, c))}</td>`).join('')}<td><button data-e="${r._id}">Editar</button><button data-d="${r._id}">Eliminar</button></td></tr>`).join('')}</tbody></table>` : '<p>No hay registros que mostrar. Crea el primero con el formulario.</p>';
}
async function reportes() {
  try {
    const d = await api('reportes');
    const T = (t, a) => `<h3>${t}</h3><div class="wrap"><table><tr><th>Nombre</th><th>Reservas</th><th>Ingresos</th></tr>${a.map(x => `<tr><td>${x.nombre}</td><td>${x.reservas}</td><td>${fmt(x.ingresos)}</td></tr>`).join('')}</table></div>`;
    $('#view').innerHTML = `<h2>Reportes</h2><div class="kpi">${Object.entries(d.resumen).map(([k, v]) => `<div><b>${fmt(v)}</b>${k}</div>`).join('')}</div>` + T('Ingresos por sede', d.porSede) + T('Canchas más reservadas', d.canchasTop) + T('Mejores clientes', d.clientesTop) + T('Ingresos por mes', d.porMes) + T('Reservas por estado', d.porEstado);
  } catch (err) { note(err.message); }
}
$('#nav').innerHTML = [...Object.keys(E), 'reportes'].map(k => `<button onclick="show('${k}')">${E[k]?.t || 'Reportes'}</button>`).join('');
show('reservas');
