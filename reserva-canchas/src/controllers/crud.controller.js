const ah = require('../utils/asyncHandler');
// Controlador genérico: recibe un servicio y expone los handlers HTTP
module.exports = s => ({
  list: ah(async (req, res) => res.json(await s.list(req.query))),
  get: ah(async (req, res) => res.json(await s.get(req.params.id))),
  create: ah(async (req, res) => res.status(201).json(await s.create(req.body))),
  update: ah(async (req, res) => res.json(await s.update(req.params.id, req.body))),
  remove: ah(async (req, res) => { await s.remove(req.params.id); res.json({ ok: true }); })
});
