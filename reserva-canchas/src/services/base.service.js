const AppError = require('../utils/AppError');
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// CRUD genérico con filtros. Cada entidad lo extiende y define:
//  filters {parametro: campo} igualdad · rangos {campo: [min, max]} · regex {parametro: campo} "contiene"
//  search [campos] búsqueda libre · ordenes {clave: orden} · beforeSave / beforeDelete (reglas de negocio)
module.exports = class BaseService {
  constructor(Model, opts = {}) {
    Object.assign(this, { Model, populate: [], filters: {}, rangos: {}, regex: {}, search: [], ordenes: { recientes: '-createdAt' }, ordenDefault: 'recientes' }, opts);
  }
  async beforeSave() {}
  async beforeDelete() {}
  async buildFilter(q) {
    const f = {}, val = v => (!isNaN(v) ? Number(v) : v);
    for (const [p, campo] of Object.entries(this.filters)) if (q[p]) f[campo] = q[p];
    for (const [campo, [min, max]] of Object.entries(this.rangos)) {
      const r = {}; if (q[min]) r.$gte = val(q[min]); if (q[max]) r.$lte = val(q[max]);
      if (Object.keys(r).length) f[campo] = r;
    }
    for (const [p, campo] of Object.entries(this.regex)) if (q[p]) f[campo] = { $regex: esc(q[p]), $options: 'i' };
    if (q.q && this.search.length) { const rx = new RegExp(esc(q.q), 'i'); f.$or = this.search.map(k => ({ [k]: rx })); }
    return f;
  }
  async list(q = {}) {
    const orden = this.ordenes[q.orden] || this.ordenes[this.ordenDefault];
    return this.Model.find(await this.buildFilter(q)).populate(this.populate).sort(orden).lean();
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
