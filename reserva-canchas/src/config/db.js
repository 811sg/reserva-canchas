const mongoose = require('mongoose');
const { mongoUri } = require('./env');
module.exports = async () => { await mongoose.connect(mongoUri); console.log('Conectado a MongoDB Atlas'); };
