const { Sede, Cancha, Cliente, Reserva } = require('../models');
const activas = { $match: { estado: { $ne: 'cancelada' } } };
const lookup = (from, localField, as) => [{ $lookup: { from, localField, foreignField: '_id', as } }, { $unwind: '$' + as }];
const salida = { $project: { _id: 0, nombre: '$_id', reservas: 1, ingresos: 1 } };
const suma = { reservas: { $sum: 1 }, ingresos: { $sum: '$total' } };

// Reportes con Aggregation Pipeline ($match, $lookup, $unwind, $group, $project, $sort, $limit)
exports.generar = async () => {
  const [resumen, porSede, canchasTop, clientesTop, porMes, porEstado] = await Promise.all([
    Promise.all([Sede.countDocuments(), Cancha.countDocuments(), Cliente.countDocuments(), Reserva.countDocuments(),
      Reserva.aggregate([activas, { $group: { _id: null, t: { $sum: '$total' } } }])]),
    Reserva.aggregate([activas, ...lookup('canchas', 'cancha', 'c'), ...lookup('sedes', 'c.sede', 's'),
      { $group: { _id: '$s.nombre', ...suma } }, salida, { $sort: { ingresos: -1 } }]),
    Reserva.aggregate([activas, ...lookup('canchas', 'cancha', 'c'), ...lookup('sedes', 'c.sede', 's'),
      { $group: { _id: { $concat: ['$c.nombre', ' (', '$s.nombre', ')'] }, ...suma } }, salida, { $sort: { reservas: -1 } }, { $limit: 5 }]),
    Reserva.aggregate([activas, ...lookup('clientes', 'cliente', 'k'),
      { $group: { _id: '$k.nombre', ...suma } }, salida, { $sort: { ingresos: -1 } }, { $limit: 5 }]),
    Reserva.aggregate([activas, { $group: { _id: { $substr: ['$fecha', 0, 7] }, ...suma } }, salida, { $sort: { nombre: 1 } }]),
    Reserva.aggregate([{ $group: { _id: '$estado', ...suma } }, salida, { $sort: { reservas: -1 } }])
  ]);
  const [sedes, canchas, clientes, reservas, ing] = resumen;
  return { resumen: { sedes, canchas, clientes, reservas, ingresos: ing[0]?.t || 0 }, porSede, canchasTop, clientesTop, porMes, porEstado };
};
