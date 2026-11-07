// Pantallas: h/sub = encabezado, f = campos del formulario [nombre, etiqueta, tipo, ruta del valor], fl = filtros [parametro, etiqueta, tipo], c = columnas (tabla), card = tarjetas, tabs = filtro rápido en pestañas
// Tipos: text, number, date, time, email, serv (servicios existentes), ref:coleccion, sel:valor|Etiqueta,valor|Etiqueta
const DEP = ['futbol', 'baloncesto', 'tenis', 'voleibol'], EST = ['pendiente', 'confirmada', 'cancelada'], PAGO = 'efectivo,tarjeta,transferencia';
const E = {
  reservas: { t: 'Reservas', h: 'Reserva tu cancha', sub: 'Elige cancha y fecha, toca un horario libre y confirma.', nuevo: 'Nueva reserva', editar: 'Editar reserva', cta: 'Guardar reserva', card: true, rapidos: true, tabs: 'estado',
    f: [['cancha', 'Cancha', 'ref:canchas', 'cancha._id'], ['cliente', 'Jugador', 'ref:clientes', 'cliente._id'], ['fecha', 'Fecha', 'date'], ['estado', 'Estado', 'sel:' + EST], ['horaInicio', 'Hora de inicio', 'time'], ['horaFin', 'Hora de fin', 'time'], ['metodoPago', 'Método de pago', 'sel:' + PAGO, 'pago.metodo']],
    fl: [['estado', 'Estado', 'sel:' + EST], ['sede', 'Sede', 'ref:sedes'], ['cancha', 'Cancha', 'ref:canchas'], ['deporte', 'Deporte', 'sel:' + DEP], ['cliente', 'Jugador', 'ref:clientes'],
      ['desde', 'Fecha desde', 'date'], ['hasta', 'Fecha hasta', 'date'], ['metodo', 'Método de pago', 'sel:' + PAGO], ['pagado', 'Pago', 'sel:true|Pagado,false|Sin pagar'],
      ['minTotal', 'Total mínimo', 'number'], ['maxTotal', 'Total máximo', 'number'],
      ['orden', 'Ordenar por', 'sel:fechaDesc|Fecha (más reciente),fechaAsc|Fecha (más antigua),totalDesc|Mayor total,totalAsc|Menor total']] },
  canchas: { t: 'Canchas', h: 'Nuestras canchas', sub: 'Administra canchas por sede, deporte y precio por hora.', nuevo: 'Nueva cancha', editar: 'Editar cancha', cta: 'Guardar cancha', card: true,
    f: [['nombre', 'Nombre'], ['sede', 'Sede', 'ref:sedes', 'sede._id'], ['deporte', 'Deporte', 'sel:' + DEP], ['precioHora', 'Precio por hora', 'number'], ['activa', 'Disponible', 'sel:true|Sí,false|No'], ['servicios', 'Servicios (separados por coma)']],
    fl: [['deporte', 'Deporte', 'sel:' + DEP], ['sede', 'Sede', 'ref:sedes'], ['activa', 'Disponibilidad', 'sel:true|Disponible,false|No disponible'], ['servicio', 'Servicio incluido', 'serv'],
      ['minPrecio', 'Precio mínimo', 'number'], ['maxPrecio', 'Precio máximo', 'number'],
      ['orden', 'Ordenar por', 'sel:recientes|Más recientes,nombre|Nombre,precioAsc|Precio menor,precioDesc|Precio mayor']] },
  clientes: { t: 'Jugadores', h: 'Jugadores', sub: 'Las personas que reservan en tus sedes.', nuevo: 'Nuevo jugador', editar: 'Editar jugador', cta: 'Guardar jugador',
    f: [['nombre', 'Nombre'], ['email', 'Correo', 'email'], ['telefono', 'Teléfono']], c: ['nombre', 'email', 'telefono'],
    fl: [['email', 'Correo contiene', 'text'], ['orden', 'Ordenar por', 'sel:nombre|Nombre,recientes|Más recientes']] },
  sedes: { t: 'Sedes', h: 'Sedes', sub: 'Dónde se juega.', nuevo: 'Nueva sede', editar: 'Editar sede', cta: 'Guardar sede',
    f: [['nombre', 'Nombre'], ['ciudad', 'Ciudad'], ['direccion', 'Dirección']], c: ['nombre', 'ciudad', 'direccion'],
    fl: [['ciudad', 'Ciudad', 'text'], ['orden', 'Ordenar por', 'sel:nombre|Nombre,recientes|Más recientes']] }
};
const OPCIONALES = ['direccion', 'telefono', 'servicios'];
