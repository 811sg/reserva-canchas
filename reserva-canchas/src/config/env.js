require('dotenv').config();
if (!process.env.MONGODB_URI) { console.error('Falta MONGODB_URI en el archivo .env'); process.exit(1); }
module.exports = { port: process.env.PORT || 3000, mongoUri: process.env.MONGODB_URI };
