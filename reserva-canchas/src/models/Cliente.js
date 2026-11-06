const { Schema, model } = require('mongoose');
module.exports = model('Cliente', new Schema({
  nombre: { type: String, required: [true, 'El nombre del cliente es obligatorio'], trim: true },
  email: { type: String, required: [true, 'El correo es obligatorio'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Correo no válido'] },
  telefono: { type: String, trim: true, default: '' }
}, { timestamps: true, collection: 'clientes' }));
