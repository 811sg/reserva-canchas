const router = require('express').Router();
const crud = require('../controllers/crud.controller');
const reportes = require('../controllers/reportes.controller');

const entidades = { sedes: 'sede', canchas: 'cancha', clientes: 'cliente', reservas: 'reserva' };
for (const [ruta, n] of Object.entries(entidades)) {
  const c = crud(require(`../services/${n}.service`));
  router.route('/' + ruta).get(c.list).post(c.create);
  router.route(`/${ruta}/:id`).get(c.get).put(c.update).delete(c.remove);
}
router.get('/salud', (req, res) => res.json({ ok: true, version: 2 })); // la interfaz lo usa para detectar un servidor desactualizado
router.get('/reportes', reportes.todos);
module.exports = router;
