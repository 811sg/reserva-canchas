const BaseService = require('./base.service'), AppError = require('../utils/AppError');
const { Cancha, Cliente, Reserva } = require('../models');
const min = t => +t.split(':')[0] * 60 + +t.split(':')[1];
const hoy = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });

class ReservaService extends BaseService {
  constructor() {
    super(Reserva, {
      populate: [{ path: 'cancha', select: 'nombre deporte', populate: { path: 'sede', select: 'nombre' } }, { path: 'cliente', select: 'nombre email' }],
      filters: { estado: 'estado', fecha: 'fecha', cliente: 'cliente', metodo: 'pago.metodo', pagado: 'pago.pagado' },
      rangos: { fecha: ['desde', 'hasta'], total: ['minTotal', 'maxTotal'] }, search: ['fecha', 'estado'],
      ordenes: { fechaDesc: '-fecha -horaInicio', fechaAsc: 'fecha horaInicio', totalDesc: '-total', totalAsc: 'total', recientes: '-createdAt' }, ordenDefault: 'fechaDesc'
    });
  }
  // sede, deporte y cancha viven en la colección canchas: se resuelven a una lista de ids; la búsqueda libre también mira nombres
  async buildFilter(q) {
    const f = await super.buildFilter(q);
    if (q.sede || q.deporte || q.cancha) {
      const c = {}; if (q.sede) c.sede = q.sede; if (q.deporte) c.deporte = q.deporte; if (q.cancha) c._id = q.cancha;
      f.cancha = { $in: await Cancha.find(c).distinct('_id') };
    }
    if (q.q) {
      const rx = new RegExp(q.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const [cl, ca] = await Promise.all([Cliente.find({ nombre: rx }).distinct('_id'), Cancha.find({ nombre: rx }).distinct('_id')]);
      f.$or = [...(f.$or || []), { cliente: { $in: cl } }, { cancha: { $in: ca } }];
    }
    return f;
  }
  // Reglas de negocio de la reserva
  async beforeSave(d, id) {
    const cancha = await Cancha.findById(d.cancha);
    if (!cancha) throw new AppError('La cancha no existe');
    if (!cancha.activa) throw new AppError('La cancha no está disponible');
    if (!await Cliente.exists({ _id: d.cliente })) throw new AppError('El cliente no existe');
    const { fecha, horaInicio: a, horaFin: z } = d;
    if (!id && fecha < hoy()) throw new AppError('No se puede reservar en una fecha pasada');
    if (!(a && z && a < z)) throw new AppError('La hora de fin debe ser posterior a la de inicio');
    if (a < '06:00' || z > '23:00') throw new AppError('El horario permitido es de 06:00 a 23:00');
    if ((d.estado || 'pendiente') !== 'cancelada') { // sin traslapes en la misma cancha y fecha
      const f = { cancha: cancha._id, fecha, estado: { $ne: 'cancelada' }, horaInicio: { $lt: z }, horaFin: { $gt: a } };
      if (id) f._id = { $ne: id };
      if (await Reserva.exists(f)) throw new AppError('La cancha ya está reservada en ese horario', 409);
    }
    d.precioHora = cancha.precioHora;
    d.total = ((min(z) - min(a)) / 60) * cancha.precioHora;
    if (d.metodoPago) { d['pago.metodo'] = d.metodoPago; delete d.metodoPago; }
  }
}
module.exports = new ReservaService();
