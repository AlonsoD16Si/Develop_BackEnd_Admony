const express = require('express');
const router = express.Router();
const budgetsController = require('../controllers/budgets.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { body, param, query } = require('express-validator');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @route   POST /api/budgets
 * @desc    Crear un nuevo presupuesto
 * @access  Private
 */
router.post(
    '/',
    [
        body('categoria').notEmpty().withMessage('La categoría es requerida'),
        body('monto_limite').isFloat({ min: 0 }).withMessage('El monto límite debe ser un número positivo'),
        body('periodo').optional().isIn(['mensual', 'semanal', 'anual']).withMessage('Período inválido'),
        validate,
    ],
    budgetsController.createBudget
);

/**
 * @route   GET /api/budgets
 * @desc    Obtener todos los presupuestos del usuario
 * @access  Private
 */
router.get('/', budgetsController.getBudgets);

/**
 * @route   GET /api/budgets/analysis
 * @desc    Obtener análisis de cumplimiento de presupuestos
 * @access  Private
 */
router.get(
    '/analysis',
    [
        query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Mes inválido'),
        query('year').optional().isInt({ min: 2000 }).withMessage('Año inválido'),
        validate,
    ],
    budgetsController.getBudgetAnalysis
);

/**
 * @route   GET /api/budgets/:id
 * @desc    Obtener un presupuesto específico
 * @access  Private
 */
router.get(
    '/:id',
    [param('id').isInt().withMessage('ID inválido'), validate],
    budgetsController.getBudgetById
);

/**
 * @route   PUT /api/budgets/:id
 * @desc    Actualizar un presupuesto
 * @access  Private
 */
router.put(
    '/:id',
    [
        param('id').isInt().withMessage('ID inválido'),
        body('categoria').optional().notEmpty().withMessage('La categoría no puede estar vacía'),
        body('monto_limite').optional().isFloat({ min: 0 }).withMessage('El monto límite debe ser un número positivo'),
        body('periodo').optional().isIn(['mensual', 'semanal', 'anual']).withMessage('Período inválido'),
        validate,
    ],
    budgetsController.updateBudget
);

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Eliminar un presupuesto
 * @access  Private
 */
router.delete(
    '/:id',
    [param('id').isInt().withMessage('ID inválido'), validate],
    budgetsController.deleteBudget
);

module.exports = router;

