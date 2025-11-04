const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expenses.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { body, param, query } = require('express-validator');

// Todas las rutas requieren autenticación

/**
 * @route   POST /api/expenses
 * @desc    Crear un nuevo gasto
 * @access  Private
 */
router.post(
    '/',
    authenticateToken,
    [
        body('monto').isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
        body('id_categoria').notEmpty().withMessage('La categoría es requerida'),
        body('id_usuario').notEmpty().withMessage('El saldo es requerido para vincular a usuario'),
        body('tipomovimiento').optional().isIn(['Ingreso','Egreso','Domiciliacion']).withMessage('Tipo inválido'),
        validate,
    ],
    expensesController.createExpense
);

/**
 * @route   GET /api/expenses
 * @desc    Obtener todos los gastos del usuario
 * @access  Private
 */
router.get(
    '/',
    authenticateToken,
    [
        query('startDate').optional().isISO8601().withMessage('Fecha de inicio inválida'),
        query('endDate').optional().isISO8601().withMessage('Fecha de fin inválida'),
        query('category').optional().isString(),
        validate,
    ],
    expensesController.getExpenses
);
router.get(
    '/ingresos',
    [
        validate,
    ],
    expensesController.getIngresos
);
router.get(
    '/organization',
    [
        validate,
    ],
    expensesController.getMovmentsOrganization
);
router.get(
    '/organizationMontos',
    [
        validate,
    ],
    expensesController.getMontosOrganization
);

/**
 * @route   GET /api/expenses/stats
 * @desc    Obtener estadísticas de gastos
 * @access  Private
 */
router.get(
    '/stats',
    [
        query('period').optional().isIn(['monthly', 'yearly']).withMessage('Período inválido'),
        validate,
    ],
    expensesController.getExpenseStats
);

/**
 * @route   GET /api/expenses/:id
 * @desc    Obtener un gasto específico
 * @access  Private
 */
router.get(
    '/:id',
    [param('id').isInt().withMessage('ID inválido'), validate],
    expensesController.getExpenseById
);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Actualizar un gasto
 * @access  Private
 */
router.put(
    '/:id',
    [
        param('id').isInt().withMessage('ID inválido'),
        body('monto').optional().isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
        body('categoria').optional().notEmpty().withMessage('La categoría no puede estar vacía'),
        body('tipo').optional().isIn(['unico', 'recurrente']).withMessage('Tipo inválido'),
        body('fecha').optional().isISO8601().withMessage('Fecha inválida'),
        validate,
    ],
    expensesController.updateExpense
);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Eliminar un gasto
 * @access  Private
 */
router.delete(
    '/:id',
    [param('id').isInt().withMessage('ID inválido'), validate],
    expensesController.deleteExpense
);

module.exports = router;

