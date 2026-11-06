const { Schema, model } = require('mongoose');
module.exports = model('Sede', new Schema({
  nombre: { type: String, required: [true, 'El nombre de la sede es obligatorio'], trim: true },
  ciudad: { type: String, required: [true, 'La ciudad es obligatoria'], trim: true },
  direccion: { type: String, trim: true, default: '' }
}, { timestamps: true, collection: 'sedes' }));
