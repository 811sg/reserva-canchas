# Reserva de canchas — Proyecto Final BD II
Node.js + Express + MongoDB Atlas (Mongoose) + interfaz web. Arquitectura por capas: ver `docs/ARQUITECTURA.md`.

## Ejecutar
1. `npm install`
2. Copia`.env` y pon tu cadena de conexión de Atlas en `MONGODB_URI`
3. `npm run seed` (carga datos de ejemplo; borra y recrea las colecciones)
4. `npm start` → http://localhost:3000

## Despliegue (Render)
Web Service con este repo · Build `npm install` · Start `node server.js` · Variable de entorno `MONGODB_URI`.
