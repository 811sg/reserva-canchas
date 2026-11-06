// Traduce cualquier error (negocio, Mongoose, Mongo) a una respuesta JSON clara
module.exports = (err, req, res, next) => {
  let status = err.status || 500, msg = err.message;
  if (err.name === 'ValidationError') { status = 400; msg = Object.values(err.errors).map(e => e.message).join('. '); }
  else if (err.name === 'CastError') { status = 400; msg = `Valor no válido para "${err.path}"`; }
  else if (err.code === 11000) { status = 409; msg = `Ya existe un registro con ese valor único (${Object.keys(err.keyPattern || {}).join(', ')})`; }
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Error interno del servidor' : msg });
};
