const BaseService = require('./base.service'), AppError = require('../utils/AppError');
const { Sede, Cancha, Reserva } = require('../models');
class CanchaService extends BaseService {
  constructor() { super(Cancha, { populate: [{ path: 'sede', select: 'nombre' }], filters: ['deporte', 'sede', 'activa'], search: ['nombre', 'deporte'] }); }
  async beforeSave(d) {
    if (!await Sede.exists({ _id: d.sede })) throw new AppError('La sede no existe');
    if (typeof d.servicios === 'string') d.servicios = d.servicios.split(',').map(s => s.trim()).filter(Boolean);
  }
  async beforeDelete(id) { if (await Reserva.exists({ cancha: id })) throw new AppError('No se puede eliminar: la cancha tiene reservas', 409); }
}
module.exports = new CanchaService();
