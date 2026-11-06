// Punto de entrada: conecta a MongoDB Atlas y levanta el servidor
const { port } = require('./src/config/env');
const connectDB = require('./src/config/db');
const app = require('./src/app');

connectDB()
  .then(() => app.listen(port, () => console.log(`App en http://localhost:${port}`)))
  .catch(err => { console.error('No se pudo conectar a MongoDB:', err.message); process.exit(1); });
