const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { query } = require('express-validator');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @route   GET /api/dashboard/summary
 * @desc    Obtener resumen financiero del usuario
 * @access  Private
 */
router.get('/summary', dashboardController.getFinancialSummary);

/**
 * @route   GET /api/dashboard/charts
 * @desc    Obtener datos para gráficas (type: expenses, savings, income)
 * @access  Private
 */
router.get(
  '/charts',
  [
    query('type')
      .isIn(['expenses', 'savings', 'income'])
      .withMessage('Tipo inválido'),
    query('period')
      .optional()
      .isIn(['monthly', '6m', 'yearly'])
      .withMessage('Período inválido'),
    validate
  ],
  dashboardController.getChartData
);

/**
 * @route   GET /api/dashboard/alerts
 * @desc    Obtener alertas y notificaciones financieras
 * @access  Private
 */
router.get('/alerts', dashboardController.getAlerts);

/**
 * @route   GET /api/dashboard/all
 * @desc    Obtener todos los datos del dashboard (resumen, gráficas, alertas)
 * @access  Private
 */
router.get('/all', dashboardController.getDashboardData);

module.exports = router;