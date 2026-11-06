// Carga datos de ejemplo (borra y recrea las colecciones): npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const { Sede, Cancha, Cliente, Reserva } = require('../src/models');
const R = a => a[Math.floor(Math.random() * a.length)];
const day = d => new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);
const hh = h => String(h).padStart(2, '0') + ':00';
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([Sede, Cancha, Cliente, Reserva].map(M => M.deleteMany({})));
  const sedes = await Sede.insertMany([{ nombre: 'Sede Norte', ciudad: 'Medellín', direccion: 'Cra 70 #45-10' }, { nombre: 'Sede Centro', ciudad: 'Medellín', direccion: 'Cl 50 #30-22' }, { nombre: 'Sede Sur', ciudad: 'Envigado', direccion: 'Cl 37S #43A-15' }]);
  const dep = ['futbol', 'baloncesto', 'tenis', 'voleibol'];
  const canchas = await Cancha.insertMany(sedes.flatMap((s, si) => [0, 1, 2].map(i => ({ nombre: 'Cancha ' + (i + 1), sede: s._id, deporte: dep[(si * 3 + i) % 4], precioHora: 40000 + 10000 * ((si * 3 + i) % 6), servicios: R([['vestuarios', 'parqueadero'], ['iluminación'], ['vestuarios', 'cafetería', 'iluminación']]) }))));
  const nombres = ['Ana Ruiz', 'Luis Mora', 'Sara Gil', 'Juan Peña', 'Laura Ríos', 'Pedro Soto', 'Marta Díaz', 'Carlos Vélez', 'Diana Ossa', 'Andrés Cano', 'Paula Henao', 'Felipe Arias', 'Camila Toro', 'Jorge Mejía', 'Valeria Pino', 'Mateo Zapata'];
  const clientes = await Cliente.insertMany(nombres.map((nombre, i) => ({ nombre, email: `cliente${i + 1}@correo.com`, telefono: '3' + String(100000000 + i * 7919).slice(0, 9) })));
  const ocup = new Set(), reservas = [];
  for (let i = 0; i < 150; i++) {
    const c = R(canchas), cl = R(clientes), d = Math.floor(Math.random() * 41) - 20, fecha = day(d), h = 6 + Math.floor(Math.random() * 16), dur = R([1, 2]);
    const keys = Array.from({ length: dur }, (_, k) => `${c._id}|${fecha}|${h + k}`);
    if (h + dur > 23 || keys.some(k => ocup.has(k))) continue;
    keys.forEach(k => ocup.add(k));
    const estado = d < 0 ? R(['confirmada', 'confirmada', 'cancelada']) : R(['pendiente', 'confirmada']);
    reservas.push({ cancha: c._id, cliente: cl._id, fecha, horaInicio: hh(h), horaFin: hh(h + dur), estado, precioHora: c.precioHora, total: dur * c.precioHora, pago: { metodo: R(['efectivo', 'tarjeta', 'transferencia']), pagado: estado === 'confirmada' } });
  }
  await Reserva.insertMany(reservas);
  console.log(`Listo: ${sedes.length} sedes, ${canchas.length} canchas, ${clientes.length} clientes, ${reservas.length} reservas`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
