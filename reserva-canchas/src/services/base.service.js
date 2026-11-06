const AppError = require('../utils/AppError');
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// CRUD genérico. Cada entidad lo extiende y sobrescribe beforeSave / beforeDelete (reglas de negocio)
module.exports = class BaseService {
  constructor(Model, { populate = [], filters = [], search = [] } = {}) { Object.assign(this, { Model, populate, filters, search }); }
  async beforeSave() {}
  async beforeDelete() {}
  async list(query = {}) {
    const f = {};
    for (const k of this.filters) if (query[k]) f[k] = query[k];
    if (query.q && this.search.length) { const rx = new RegExp(esc(query.q), 'i'); f.$or = this.search.map(k => ({ [k]: rx })); }
    return this.Model.find(f).populate(this.populate).sort({ createdAt: -1 }).lean();
  }
  async get(id) {
    const d = await this.Model.findById(id).populate(this.populate).lean();
    if (!d) throw new AppError('Registro no encontrado', 404);
    return d;
  }
  async create(data) { await this.beforeSave(data); const d = await this.Model.create(data); return this.get(d._id); }
  async update(id, data) {
    const d = await this.Model.findById(id); if (!d) throw new AppError('Registro no encontrado', 404);
    await this.beforeSave(data, id); d.set(data); await d.save(); return this.get(id);
  }
  async remove(id) {
    const d = await this.Model.findById(id); if (!d) throw new AppError('Registro no encontrado', 404);
    await this.beforeDelete(id); await d.deleteOne();
  }
};
