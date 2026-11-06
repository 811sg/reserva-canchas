// Definición de las pantallas: f = campos del formulario [nombre, etiqueta, tipo, ruta del valor]; c = columnas; fl = filtro
const DEP = ['futbol', 'baloncesto', 'tenis', 'voleibol'], EST = ['pendiente', 'confirmada', 'cancelada'];
const E = {
  reservas: { t: 'Reservas', f: [['cancha', 'Cancha', 'ref:canchas', 'cancha._id'], ['cliente', 'Cliente', 'ref:clientes', 'cliente._id'], ['fecha', 'Fecha', 'date'], ['horaInicio', 'Inicio', 'time'], ['horaFin', 'Fin', 'time'], ['estado', 'Estado', 'sel:' + EST], ['metodoPago', 'Método de pago', 'sel:efectivo,tarjeta,transferencia', 'pago.metodo']],
    c: ['cancha.nombre', 'cancha.sede.nombre', 'cliente.nombre', 'fecha', 'horaInicio', 'horaFin', 'total', 'estado', 'pago.metodo'], fl: ['estado', EST] },
  canchas: { t: 'Canchas', f: [['nombre', 'Nombre'], ['sede', 'Sede', 'ref:sedes', 'sede._id'], ['deporte', 'Deporte', 'sel:' + DEP], ['precioHora', 'Precio por hora', 'number'], ['activa', 'Disponible', 'sel:true,false'], ['servicios', 'Servicios (separados por coma)']],
    c: ['nombre', 'sede.nombre', 'deporte', 'precioHora', 'activa', 'servicios'], fl: ['deporte', DEP] },
  clientes: { t: 'Clientes', f: [['nombre', 'Nombre'], ['email', 'Correo', 'email'], ['telefono', 'Teléfono']], c: ['nombre', 'email', 'telefono'] },
  sedes: { t: 'Sedes', f: [['nombre', 'Nombre'], ['ciudad', 'Ciudad'], ['direccion', 'Dirección']], c: ['nombre', 'ciudad', 'direccion'] }
};
const OPCIONALES = ['direccion', 'telefono', 'servicios'];
