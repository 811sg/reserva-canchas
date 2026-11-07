let cur, edit, rows = [], refs = {}, refsF = {}, serv = [], tm;
const hh = h => String(h).padStart(2, '0') + ':00';
const iso = d => d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
const sano = s => String(s).replace(/[<>&]/g, '');
const label = o => o.nombre + (o.sede ? ' - ' + o.sede.nombre : '');
const fechaLarga = f => new Date(f + 'T12:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' });
const acciones = r => `<span class="acc"><button class="sec" data-e="${r._id}">Editar</button><button class="sec peligro" data-d="${r._id}">Eliminar</button></span>`;
const opts = (s, vacio) => (vacio ? ['|' + vacio] : []).concat(s.split(',')).map(o => { const [v, l = v] = o.split('|'); return `<option value="${v}">${l}</option>`; }).join('');
const CARD = {
  reservas: r => `<article class="tc ${r.estado}"><div class="top"><div class="hora">${r.horaInicio} - ${r.horaFin}</div><span class="badge ${r.estado}"><i></i>${r.estado}</span></div>
    <div class="fecha">${fechaLarga(r.fecha)}</div>
    <div class="lugar"><b>${r.cancha?.nombre ?? 'Cancha eliminada'}</b><span>${r.cancha?.sede?.nombre ?? ''}</span></div>
    <div class="quien">${r.cliente?.nombre ?? ''}<small>${fmt(r.pago?.metodo)}${r.pago?.pagado ? ', pagado' : ''}</small></div>
    <div class="foot"><span class="total">$ ${fmt(r.total)}</span>${acciones(r)}</div></article>`,
  canchas: r => `<article class="tc ${r.activa ? 'confirmada' : 'cancelada'}"><div class="top"><div class="hora">${r.nombre}</div><span class="badge ${r.activa ? 'confirmada' : 'cancelada'}"><i></i>${r.activa ? 'Disponible' : 'No disponible'}</span></div>
    <div class="fecha">${r.deporte}</div><div class="lugar"><b>${r.sede?.nombre ?? ''}</b></div>
    <div class="tags">${(r.servicios || []).map(s => `<span>${s}</span>`).join('')}</div>
    <div class="foot"><span class="total">$ ${fmt(r.precioHora)}<small> por hora</small></span>${acciones(r)}</div></article>`
};
const field = ([k, l, t = 'text']) => `<label>${l}${t.startsWith('sel:') ? `<select name="${k}">${opts(t.slice(4))}</select>`
  : t.startsWith('ref:') ? `<select name="${k}">${refs[k].map(o => `<option value="${o._id}">${label(o)}</option>`).join('')}</select>`
  : `<input name="${k}" type="${t}" ${OPCIONALES.includes(k) ? '' : 'required'}>`}</label>`;
const filtro = ([k, l, t]) => `<label>${l}${t.startsWith('sel:') ? `<select data-f="${k}">${opts(t.slice(4), 'Todos')}</select>`
  : t.startsWith('ref:') ? `<select data-f="${k}"><option value="">Todos</option>${refsF[k].map(o => `<option value="${o._id}">${label(o)}</option>`).join('')}</select>`
  : t === 'serv' ? `<select data-f="${k}"><option value="">Todos</option>${serv.map(s => `<option>${s}</option>`).join('')}</select>`
  : `<input data-f="${k}" type="${t}">`}</label>`;
const rango = r => { const h = iso(new Date()); if (r === 'hoy') return [h, h]; if (r === '7') return [h, iso(new Date(Date.now() + 6 * 864e5))]; const [y, m] = h.split('-'); return [`${y}-${m}-01`, `${y}-${m}-${new Date(y, +m, 0).getDate()}`]; };
const drawer = on => { $('#drawer')?.classList.toggle('open', on); $('#scrim')?.classList.toggle('on', on); };
const quitar = k => { if (k === 'q') return $('#q').value = ''; const el = document.querySelector(`[data-f="${k}"]`); el.tagName === 'SELECT' ? el.selectedIndex = 0 : el.value = ''; };
const limpiar = () => { document.querySelectorAll('.drawer [data-f]').forEach(el => quitar(el.dataset.f)); $('#q').value = ''; if ($('#tabv')) $('#tabv').value = ''; load(); };

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
function abrir(r) {
  const e = E[cur], f = $('#f'); edit = r ? r._id : null; f.reset();
  $('#dt').textContent = r ? e.editar : e.nuevo;
  if (r) for (const [k, , , p] of e.f) { const v = get(r, p || k); f.elements[k].value = Array.isArray(v) ? v.join(', ') : v ?? ''; }
  $('#dlg').showModal(); slots();
}

async function show(n) {
  cur = n; edit = null; note('');
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.v === n));
  if (n === 'reportes') return reportes();
  const e = E[n], ord = e.fl.find(x => x[0] === 'orden'), dr = e.fl.filter(x => x[0] !== 'orden' && x[0] !== e.tabs);
  try {
    for (const [k, , t] of e.f) if (t?.startsWith('ref:')) refs[k] = await api(t.slice(4));
    for (const [k, , t] of e.fl) if (t.startsWith('ref:')) refsF[k] = await api(t.slice(4));
    if (e.fl.some(x => x[2] === 'serv')) serv = [...new Set((await api('canchas')).flatMap(c => c.servicios || []))].sort();
  } catch (err) { return note(err.message); }
  const tabs = e.tabs ? `<div class="seg" id="tabs">${[['', 'Todas'], ...EST.map(s => [s, s[0].toUpperCase() + s.slice(1) + 's'])].map(([v, l]) => `<button data-t="${v}">${l}</button>`).join('')}</div><input type="hidden" data-f="${e.tabs}" id="tabv">` : '';
  $('#view').innerHTML = `<section class="campo"><div class="in"><div><h2>${e.h}</h2><p>${e.sub}</p></div><button class="cta" id="nuevo">+ ${e.nuevo}</button></div></section>
  <div class="cuerpo"><div class="toolbar"><input class="busca" id="q" type="search" placeholder="Buscar en ${e.t.toLowerCase()}…" aria-label="Buscar">${tabs}
    <button class="sec" id="fbtn">Filtros<span class="count" id="nf" hidden>0</span></button>
    <label class="ord">Ordenar<select data-f="orden">${opts(ord[2].slice(4))}</select></label></div>
    <div id="activos" class="chips"></div><div id="res" class="res"></div><div id="tb"></div></div>
  <div id="scrim"></div>
  <aside class="drawer" id="drawer" aria-label="Filtros"><div class="dh"><h3>Filtros</h3><button class="x" id="dx" aria-label="Cerrar">✕</button></div>
    <div class="dbody">${e.rapidos ? '<div class="atajos"><small>Atajos de fecha</small><div><button type="button" class="sec" data-r="hoy">Hoy</button><button type="button" class="sec" data-r="7">Próximos 7 días</button><button type="button" class="sec" data-r="mes">Este mes</button></div></div>' : ''}${dr.map(filtro).join('')}</div>
    <div class="dfoot"><button class="sec" id="lim">Limpiar</button><button id="apl">Aplicar filtros</button></div></aside>
  <dialog id="dlg"><form id="f"><div class="dh full"><h3 id="dt"></h3><button type="button" class="x" id="cx" aria-label="Cerrar">✕</button></div>
    ${e.f.map(field).join('')}${n === 'reservas' ? '<div class="slotsbox full"><small>Horarios del día (toca uno libre para elegirlo)</small><div class="slots" id="slots"></div></div>' : ''}
    <div class="dfoot full"><button type="button" class="sec" id="cancel">Cancelar</button><button>${e.cta}</button></div></form></dialog>`;
  $('#nuevo').onclick = () => abrir();
  $('#fbtn').onclick = () => drawer(true); $('#dx').onclick = $('#scrim').onclick = () => drawer(false);
  $('#apl').onclick = () => { drawer(false); load(true); }; $('#lim').onclick = limpiar;
  $('#q').oninput = () => { clearTimeout(tm); tm = setTimeout(load, 300); };
  document.querySelector('select[data-f=orden]').onchange = () => load();
  if (e.tabs) $('#tabs').onclick = ev => { const t = ev.target.dataset.t; if (t !== undefined) { $('#tabv').value = t; load(); } };
  const at = document.querySelector('.atajos');
  if (at) at.onclick = ev => { const r = ev.target.dataset.r; if (r) { const [d, h] = rango(r); document.querySelector('[data-f=desde]').value = d; document.querySelector('[data-f=hasta]').value = h; } };
  $('#activos').onclick = ev => { const k = ev.target.closest('[data-x]')?.dataset.x; if (k) { quitar(k); load(); } };
  $('#cancel').onclick = $('#cx').onclick = () => $('#dlg').close();
  if (n === 'reservas') {
    $('#f').onchange = ev => { if (['cancha', 'fecha'].includes(ev.target.name)) slots(); };
    $('#slots').onclick = ev => { const h = +ev.target.dataset.h; if (h) { $('#f').elements.horaInicio.value = hh(h); $('#f').elements.horaFin.value = hh(h + 1); } };
  }
  $('#f').onsubmit = async ev => {
    ev.preventDefault(); const b = Object.fromEntries(new FormData(ev.target));
    try { await api(n + (edit ? '/' + edit : ''), { method: edit ? 'PUT' : 'POST', body: JSON.stringify(b) }); $('#dlg').close(); note(edit ? 'Cambios guardados' : 'Registro creado', 1); edit = null; load(); }
    catch (err) { note(err.message); }
  };
  $('#tb').onclick = async ev => {
    const t = ev.target;
    if (t.dataset.d && confirm('¿Eliminar este registro?')) try { await api(cur + '/' + t.dataset.d, { method: 'DELETE' }); note('Registro eliminado', 1); load(); } catch (err) { note(err.message); }
    if (t.dataset.e) abrir(rows.find(x => x._id === t.dataset.e));
    if (t.dataset.n !== undefined) abrir();
    if (t.dataset.l !== undefined) limpiar();
  };
  load();
}
async function load(aviso) {
  const e = E[cur], p = new URLSearchParams(), on = {};
  document.querySelectorAll('[data-f]').forEach(el => { if (el.value) { p.set(el.dataset.f, el.value); on[el.dataset.f] = el; } });
  if ($('#q').value) p.set('q', $('#q').value);
  try { rows = await api(cur + '?' + p); } catch (err) { return note(err.message); }
  const act = e.fl.filter(([k]) => k !== 'orden' && k !== e.tabs && on[k]);
  $('#activos').innerHTML = act.map(([k, l]) => `<button class="chip" data-x="${k}">${l}: ${sano(on[k].tagName === 'SELECT' ? on[k].selectedOptions[0].textContent : on[k].value)} ✕</button>`).join('')
    + ($('#q').value ? `<button class="chip" data-x="q">Búsqueda: ${sano($('#q').value)} ✕</button>` : '');
  $('#nf').textContent = act.length; $('#nf').hidden = !act.length;
  if (e.tabs) document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === ($('#tabv').value || '')));
  let r = `<b>${rows.length}</b> ${rows.length === 1 ? 'resultado' : 'resultados'}`;
  if (cur === 'reservas') r += `<span class="sep"></span>Ingresos sin canceladas: <b>$ ${fmt(rows.filter(x => x.estado !== 'cancelada').reduce((s, x) => s + x.total, 0))}</b>`;
  $('#res').innerHTML = r;
  if (aviso) note(rows.length ? `Filtros aplicados: ${rows.length} ${rows.length === 1 ? 'resultado' : 'resultados'}` : 'Ningún resultado con esos filtros', 1);
  const filtrado = act.length || $('#q').value || (e.tabs && on[e.tabs]);
  $('#tb').innerHTML = !rows.length ? (filtrado ? '<div class="vacio"><p>Nada coincide con estos filtros.</p><button class="sec" data-l>Limpiar filtros</button></div>'
      : `<div class="vacio"><p>Todavía no hay registros aquí.</p><button data-n>+ ${e.nuevo}</button></div>`)
    : e.card ? `<div class="grid">${rows.map(CARD[cur]).join('')}</div>`
    : `<div class="tabla"><table><thead><tr>${e.c.map(c => `<th>${c.split('.').slice(-1)}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map(x => `<tr>${e.c.map(c => `<td>${fmt(get(x, c))}</td>`).join('')}<td>${acciones(x)}</td></tr>`).join('')}</tbody></table></div>`;
}
async function reportes() {
  try {
    const d = await api('reportes');
    const B = (t, a, k = 'ingresos') => { const m = Math.max(...a.map(x => x[k]), 1); return `<div class="rep"><h3>${t}</h3>${a.map(x => `<div class="fila"><span>${x.nombre}</span><div class="barra"><i style="width:${x[k] / m * 100}%"></i></div><b>${k === 'ingresos' ? '$ ' : ''}${fmt(x[k])}</b></div>`).join('') || '<p class="ayuda">Sin datos todavía.</p>'}</div>`; };
    $('#view').innerHTML = `<section class="campo"><div class="in"><div><h2>Marcador del club</h2><p>Cómo van las reservas y los ingresos.</p></div></div></section><div class="cuerpo">
      <div class="marcador">${Object.entries(d.resumen).map(([k, v]) => `<div><b>${k === 'ingresos' ? '$ ' : ''}${fmt(v)}</b>${k}</div>`).join('')}</div>
      <div class="reps">${B('Ingresos por sede', d.porSede)}${B('Canchas más reservadas', d.canchasTop, 'reservas')}${B('Mejores jugadores', d.clientesTop)}${B('Ingresos por mes', d.porMes)}${B('Reservas por estado', d.porEstado, 'reservas')}</div></div>`;
  } catch (err) { note(err.message); }
}
document.addEventListener('keydown', ev => { if (ev.key === 'Escape') drawer(false); });
api('salud').catch(() => { $('#aviso').textContent = 'El servidor no responde o está desactualizado: copia la carpeta src del zip nuevo y reinícialo (Ctrl+C y luego npm start).'; });
$('#nav').innerHTML = [...Object.keys(E), 'reportes'].map(k => `<button data-v="${k}" onclick="show('${k}')">${E[k]?.t || 'Reportes'}</button>`).join('');
show('reservas');
