const express = require('express'), cors = require('cors'), path = require('path');
const errorHandler = require('./middlewares/errorHandler');
const app = express();
app.use(cors(), express.json());
app.use('/api', require('./routes'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(errorHandler);
module.exports = app;
