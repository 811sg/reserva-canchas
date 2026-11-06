const ah = require('../utils/asyncHandler'), reportes = require('../services/reportes.service');
exports.todos = ah(async (req, res) => res.json(await reportes.generar()));
