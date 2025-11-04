const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { connectDB } = require('./src/config/database');
const routes = require('./src/routes');
const { errorHandler, notFound } = require('./src/middlewares/error.middleware');

const app = express();

// ====================
// CONFIGURACIÓN GLOBAL
// ====================

// Puerto
const PORT = process.env.PORT || 3000;

// ====================
// MIDDLEWARES
// ====================

// Seguridad
app.use(helmet());

// CORS - Configuración para permitir requests desde frontend
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Parseo de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compresión de respuestas
app.use(compression());

// Logger (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ====================
// RUTAS
// ====================

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenido a AdmonY API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// API Routes
app.use('/api', routes);

// ====================
// MANEJO DE ERRORES
// ====================

// Ruta no encontrada
app.use(notFound);

// Manejador global de errores
app.use(errorHandler);

// ====================
// INICIO DEL SERVIDOR
// ====================

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log('==========================================');
      console.log(`🚀 Servidor AdmonY iniciado`);
      console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📚 Health Check: http://localhost:${PORT}/api/health`);
      console.log('==========================================');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado (Unhandled Rejection):', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada (Uncaught Exception):', err);
  process.exit(1);
});

// Iniciar servidor
startServer();

module.exports = app;
