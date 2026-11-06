// Error de negocio con código HTTP (400 validación, 404 no existe, 409 conflicto)
module.exports = class AppError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
};
