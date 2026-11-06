const BaseService = require('./base.service'), AppError = require('../utils/AppError');
const { Cliente, Reserva } = require('../models');
class ClienteService extends BaseService {
  constructor() { super(Cliente, { search: ['nombre', 'email', 'telefono'], regex: { email: 'email' }, ordenes: { nombre: 'nombre', recientes: '-createdAt' }, ordenDefault: 'nombre' }); } // email único: índice unique en el modelo
  async beforeDelete(id) { if (await Reserva.exists({ cliente: id })) throw new AppError('No se puede eliminar: el cliente tiene reservas', 409); }
}
module.exports = new ClienteService();
