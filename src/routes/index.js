const express = require('express');
const router = express.Router();

// Importar todas las rutas
const authRoutes = require('./auth.routes');
const expensesRoutes = require('./expenses.routes');
const savingsRoutes = require('./savings.routes');
const budgetsRoutes = require('./budgets.routes');
const dashboardRoutes = require('./dashboard.routes');
const organizationRoutes = require('./organization.routes');

// Definir las rutas base
router.use('/auth', authRoutes);
router.use('/expenses', expensesRoutes);
router.use('/savings', savingsRoutes);
router.use('/budgets', budgetsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/organization', organizationRoutes);

// Ruta de prueba para verificar que la API está funcionando
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de AdmonY funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
