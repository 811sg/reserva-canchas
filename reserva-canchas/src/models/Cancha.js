const { Schema, model } = require('mongoose');
module.exports = model('Cancha', new Schema({
  nombre: { type: String, required: [true, 'El nombre de la cancha es obligatorio'], trim: true },
  sede: { type: Schema.Types.ObjectId, ref: 'Sede', required: [true, 'La sede es obligatoria'] }, // REFERENCING
  deporte: { type: String, enum: { values: ['futbol', 'baloncesto', 'tenis', 'voleibol'], message: 'Deporte no válido' }, required: true },
  precioHora: { type: Number, required: true, min: [1, 'El precio por hora debe ser mayor que 0'] },
  activa: { type: Boolean, default: true },
  servicios: [String] // EMBEDDING: lista de servicios dentro del documento
}, { timestamps: true, collection: 'canchas' }));
