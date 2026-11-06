const BaseService = require('./base.service'), AppError = require('../utils/AppError');
const { Sede, Cancha } = require('../models');
class SedeService extends BaseService {
  constructor() { super(Sede, { search: ['nombre', 'ciudad', 'direccion'] }); }
  async beforeDelete(id) { if (await Cancha.exists({ sede: id })) throw new AppError('No se puede eliminar: la sede tiene canchas', 409); }
}
module.exports = new SedeService();
