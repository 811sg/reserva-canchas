let cur, edit, rows = [], refs = {}, refsF = {}, tm;
const hh = h => String(h).padStart(2, '0') + ':00';
const iso = d => d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
const label = o => o.nombre + (o.sede ? ' - ' + o.sede.nombre : '');
const fechaLarga = f => new Date(f + 'T12:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
const acciones = r => `<span><button data-e="${r._id}">Editar</button><button data-d="${r._id}">Eliminar</button></span>`;
const opts = (s, vacio) => (vacio ? ['|' + vacio] : []).concat(s.split(',')).map(o => { const [v, l = v] = o.split('|'); return `<option value="${v}">${l}</option>`; }).join('');
const CARD = {
  reservas: r => `<article class="tc ${r.estado}"><div class="top"><span class="badge ${r.estado}"><i></i>${r.estado}</span><span>${fmt(r.pago?.metodo)}${r.pago?.pagado ? ' (pagado)' : ''}</span></div>
    <div class="hora">${r.horaInicio} - ${r.horaFin}</div><div class="fecha">${fechaLarga(r.fecha)}</div>
    <p><b>${r.cancha?.nombre ?? 'Cancha eliminada'}</b><br>${r.cancha?.sede?.nombre ?? ''}</p><p class="cli">${r.cliente?.nombre ?? ''}</p>
    <div class="foot"><span class="total">$ ${fmt(r.total)}</span>${acciones(r)}</div></article>`,
  canchas: r => `<article class="tc ${r.activa ? 'confirmada' : 'cancelada'}"><div class="top"><span class="badge ${r.activa ? 'confirmada' : 'cancelada'}"><i></i>${r.activa ? 'Disponible' : 'No disponible'}</span><span style="text-transform:capitalize">${r.deporte}</span></div>
    <div class="hora">${r.nombre}</div><p>${r.sede?.nombre ?? ''}</p><div class="chips">${(r.servicios || []).map(s => `<span>${s}</span>`).join('')}</div>
    <div class="foot"><span class="total">$ ${fmt(r.precioHora)} <small style="font:13px Barlow">por hora</small></span>${acciones(r)}</div></article>`
};
const field = ([k, l, t = 'text']) => `<label>${l}${t.startsWith('sel:') ? `<select name="${k}">${opts(t.slice(4))}</select>`
  : t.startsWith('ref:') ? `<select name="${k}">${refs[k].map(o => `<option value="${o._id}">${label(o)}</option>`).join('')}</select>`
  : `<input name="${k}" type="${t}" ${OPCIONALES.includes(k) ? '' : 'required'}>`}</label>`;
const filtro = ([k, l, t]) => `<label>${l}${t.startsWith('sel:') ? `<select data-f="${k}">${opts(t.slice(4), k === 'orden' ? '' : 'Todos')}</select>`
  : t.startsWith('ref:') ? `<select data-f="${k}"><option value="">Todos</option>${refsF[k].map(o => `<option value="${o._id}">${label(o)}</option>`).join('')}</select>`
  : `<input data-f="${k}" type="${t}">`}</label>`;
const rango = r => { const h = iso(new Date()); if (r === 'hoy') return [h, h]; if (r === '7') return [h, iso(new Date(Date.now() + 6 * 864e5))]; const [y, m] = h.split('-'); return [`${y}-${m}-01`, `${y}-${m}-${new Date(y, +m, 0).getDate()}`]; };

// Horarios libres/ocupados de la cancha y fecha elegidas en el formulario
async function slots() {
  const box = $('#slots'); if (!box) return;
  const c = $('#f').elements.cancha?.value, f = $('#f').elements.fecha.value;
  if (!c || !f) { box.innerHTML = '<p class="ayuda">Elige cancha y fecha para ver los horarios disponibles.</p>'; return; }
  try {
    const rs = (await api(`reservas?cancha=${c}&fecha=${f}`)).filter(r => r.estado !== 'cancelada' && r._id !== edit);
    box.innerHTML = Array.from({ length: 17 }, (_, i) => { const h = 6 + i, oc = rs.some(r => r.horaInicio < hh(h + 1) && r.horaFin > hh(h));
      return `<button type="button" class="slot ${oc ? 'ocupada' : 'libre'}" data-h="${h}" ${oc ? 'disabled' : ''}>${hh(h)}</button>`; }).join('');
  } catch (err) { note(err.message); }
}

async function show(n) {
  cur = n; edit = null; note('');
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.v === n));
  if (n === 'reportes') return reportes();
  const e = E[n];
  try {
    for (const [k, , t] of e.f) if (t?.startsWith('ref:')) refs[k] = await api(t.slice(4));
    for (const [k, , t] of e.fl) if (t.startsWith('ref:')) refsF[k] = await api(t.slice(4));
  } catch (err) { return note(err.message); }
  $('#view').innerHTML = `<section class="campo"><div class="in"><h2>${e.h}</h2><p>${e.sub}</p>
    <form id="f">${e.f.map(field).join('')}${n === 'reservas' ? '<div class="slotsbox"><small>Horarios del día (toca uno libre para elegirlo)</small><div class="slots" id="slots"></div></div>' : ''}
    <button>${e.cta}</button><button type="button" id="x" hidden>Cancelar edición</button></form></div></section>
    <div class="cuerpo"><section class="filtros"><h3>Filtrar ${e.t.toLowerCase()}</h3>
      <div class="fgrid"><label>Buscar<input id="q" placeholder="Nombre, fecha, estado…"></label>${e.fl.map(filtro).join('')}</div>
      <div class="facc">${e.rapidos ? '<button type="button" class="sec" data-r="hoy">Hoy</button><button type="button" class="sec" data-r="7">Próximos 7 días</button><button type="button" class="sec" data-r="mes">Este mes</button>' : ''}
      <button type="button" class="sec" id="lim">Limpiar filtros</button><span id="res"></span></div></section><div id="tb"></div></div>`;
  const recargar = () => { clearTimeout(tm); tm = setTimeout(load, 250); };
  document.querySelectorAll('.filtros input,.filtros select').forEach(el => { el.oninput = recargar; el.onchange = recargar; });
  $('#lim').onclick = () => { document.querySelectorAll('.filtros input').forEach(i => i.value = ''); document.querySelectorAll('.filtros select').forEach(s => s.selectedIndex = 0); load(); };
  $('.facc').onclick = ev => { const r = ev.target.dataset.r; if (r) { const [d, h] = rango(r); document.querySelector('[data-f=desde]').value = d; document.querySelector('[data-f=hasta]').value = h; load(); } };
  $('#x').onclick = () => { edit = null; $('#f').reset(); $('#x').hidden = true; slots(); };
  if (n === 'reservas') {
    $('#f').onchange = ev => { if (['cancha', 'fecha'].includes(ev.target.name)) slots(); };
    $('#slots').onclick = ev => { const h = +ev.target.dataset.h; if (h) { $('#f').elements.horaInicio.value = hh(h); $('#f').elements.horaFin.value = hh(h + 1); } };
    slots();
  }
  $('#f').onsubmit = async ev => {
    ev.preventDefault(); const b = Object.fromEntries(new FormData(ev.target));
    try { await api(n + (edit ? '/' + edit : ''), { method: edit ? 'PUT' : 'POST', body: JSON.stringify(b) }); note(edit ? 'Cambios guardados' : 'Registro creado', 1); edit = null; ev.target.reset(); $('#x').hidden = true; load(); slots(); }
    catch (err) { note(err.message); }
  };
  $('#tb').onclick = async ev => {
    const t = ev.target;
    if (t.dataset.d && confirm('¿Eliminar este registro?')) try { await api(cur + '/' + t.dataset.d, { method: 'DELETE' }); note('Registro eliminado', 1); load(); slots(); } catch (err) { note(err.message); }
    if (t.dataset.e) {
      const r = rows.find(x => x._id === t.dataset.e); edit = r._id;
      for (const [k, , , p] of E[cur].f) { const v = get(r, p || k); $('#f').elements[k].value = Array.isArray(v) ? v.join(', ') : v ?? ''; }
      $('#x').hidden = false; scrollTo({ top: 0, behavior: 'smooth' }); slots();
    }
  };
  load();
}
async function load() {
  const e = E[cur], p = new URLSearchParams();
  document.querySelectorAll('.filtros [data-f]').forEach(el => { if (el.value) p.set(el.dataset.f, el.value); });
  if ($('#q').value) p.set('q', $('#q').value);
  try { rows = await api(cur + '?' + p); } catch (err) { return note(err.message); }
  let r = `${rows.length} ${rows.length === 1 ? 'resultado' : 'resultados'}`;
  if (cur === 'reservas') r += ` - Ingresos (sin canceladas): $ ${fmt(rows.filter(x => x.estado !== 'cancelada').reduce((s, x) => s + x.total, 0))}`;
  $('#res').textContent = r;
  $('#tb').innerHTML = !rows.length ? '<p class="ayuda">Nada coincide con estos filtros. Prueba con menos filtros o pulsa "Limpiar filtros".</p>' : e.card ? `<div class="grid">${rows.map(CARD[cur]).join('')}</div>`
    : `<div class="tabla"><table><thead><tr>${e.c.map(c => `<th>${c.split('.').slice(-1)}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map(x => `<tr>${e.c.map(c => `<td>${fmt(get(x, c))}</td>`).join('')}<td>${acciones(x)}</td></tr>`).join('')}</tbody></table></div>`;
}
async function reportes() {
  try {
    const d = await api('reportes');
    const B = (t, a, k = 'ingresos') => { const m = Math.max(...a.map(x => x[k]), 1); return `<div class="rep"><h3>${t}</h3>${a.map(x => `<div class="fila"><span>${x.nombre}</span><div class="barra"><i style="width:${x[k] / m * 100}%"></i></div><b>${k === 'ingresos' ? '$ ' : ''}${fmt(x[k])}</b></div>`).join('') || '<p class="ayuda">Sin datos todavía.</p>'}</div>`; };
    $('#view').innerHTML = `<section class="campo"><div class="in"><h2>Marcador del club</h2><p>Cómo van las reservas y los ingresos.</p></div></section><div class="cuerpo">
      <div class="marcador">${Object.entries(d.resumen).map(([k, v]) => `<div><b>${k === 'ingresos' ? '$ ' : ''}${fmt(v)}</b>${k}</div>`).join('')}</div>
      <div class="reps">${B('Ingresos por sede', d.porSede)}${B('Canchas más reservadas', d.canchasTop, 'reservas')}${B('Mejores jugadores', d.clientesTop)}${B('Ingresos por mes', d.porMes)}${B('Reservas por estado', d.porEstado, 'reservas')}</div></div>`;
  } catch (err) { note(err.message); }
}
$('#nav').innerHTML = [...Object.keys(E), 'reportes'].map(k => `<button data-v="${k}" onclick="show('${k}')">${E[k]?.t || 'Reportes'}</button>`).join('');
show('reservas');
