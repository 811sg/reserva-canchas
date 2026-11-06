const { Schema, model } = require('mongoose');
const schema = new Schema({
  cancha: { type: Schema.Types.ObjectId, ref: 'Cancha', required: true },   // REFERENCING
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true }, // REFERENCING
  fecha: { type: String, required: true, match: [/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida'] },
  horaInicio: { type: String, required: true, match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora de inicio no válida'] },
  horaFin: { type: String, required: true, match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora de fin no válida'] },
  estado: { type: String, enum: { values: ['pendiente', 'confirmada', 'cancelada'], message: 'Estado no válido' }, default: 'pendiente' },
  precioHora: Number, // copia del precio vigente al reservar (histórico)
  total: Number,
  pago: { // EMBEDDING: subdocumento
    metodo: { type: String, enum: ['efectivo', 'tarjeta', 'transferencia'], default: 'efectivo' },
    pagado: { type: Boolean, default: false }
  }
}, { timestamps: true, collection: 'reservas' });
schema.index({ cancha: 1, fecha: 1 });
module.exports = model('Reserva', schema);
