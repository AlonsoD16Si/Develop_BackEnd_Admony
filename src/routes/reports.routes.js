// routes/reports.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { query } = require('express-validator');
const reportsController = require('../controllers/reports.controller');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @route   GET /api/reports/summary
 * @desc    Totales y balances del periodo + saldo actual
 * @query   from,to (YYYY-MM-DD opcionales)
 */
router.get(
    '/summary',
    [
        query('from').optional().isISO8601().withMessage('Fecha "from" inválida'),
        query('to').optional().isISO8601().withMessage('Fecha "to" inválida'),
        validate,
    ],
    reportsController.getFinancialSummary
);

/**
 * @route   GET /api/reports/cashflow/monthly
 * @desc    Flujo mensual (ingresos/egresos/neto) por año
 * @query   year (requerido)
 */
router.get(
    '/cashflow/monthly',
    [query('year').notEmpty().isInt({ min: 1900, max: 9999 }).withMessage('Año inválido'), validate],
    reportsController.getMonthlyCashflow
);

/**
 * @route   GET /api/reports/categories
 * @desc    Desglose por categoría y tipo
 * @query   from,to (YYYY-MM-DD opcionales)
 */
router.get(
    '/categories',
    [
        query('from').optional().isISO8601().withMessage('Fecha "from" inválida'),
        query('to').optional().isISO8601().withMessage('Fecha "to" inválida'),
        validate,
    ],
    reportsController.getCategoryBreakdown
);

/**
 * @route   GET /api/reports/recurrings
 * @desc    Domiciliaciones: promedio, última y próxima estimada
 * @query   months (opcional, por defecto 6)
 */
router.get(
    '/recurrings',
    [query('months').optional().isInt({ min: 1, max: 36 }).withMessage('Months inválido'), validate],
    reportsController.getRecurringPayments
);

/**
 * @route   GET /api/reports/savings
 * @desc    Progreso de ahorros/objetivos
 */
router.get('/savings', reportsController.getSavingsOverview);

/**
 * @route   GET /api/reports/extras
 * @desc    Resumen de extras por periodo
 * @query   from,to (YYYY-MM-DD opcionales)
 */
router.get(
    '/extras',
    [
        query('from').optional().isISO8601().withMessage('Fecha "from" inválida'),
        query('to').optional().isISO8601().withMessage('Fecha "to" inválida'),
        validate,
    ],
    reportsController.getExtrasSummary
);

module.exports = router;
