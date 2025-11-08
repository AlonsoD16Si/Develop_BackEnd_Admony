const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savings.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { body, param } = require('express-validator');

// Todas las rutas requieren autenticación

/**
 * @route   POST /api/savings
 * @desc    Crear un nuevo ahorro
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  [
  body('monto').notEmpty().withMessage('El Monto es requerido'),
  validate,
  ],
  savingsController.createSaving
);

/**
 * @route   GET /api/savings
 * @desc    Obtener todos los ahorros del usuario
 * @access  Private
 */
router.get('/', authenticateToken, [
  validate,
], savingsController.getSavings);

/**
 * @route   GET /api/savings/progress
 * @desc    Obtener progreso de ahorros
 * @access  Private
 */
router.get('/progress', savingsController.getSavingsProgress);

/**
 * @route   GET /api/savings/:id
 * @desc    Obtener un ahorro específico
 * @access  Private
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID inválido'), validate],
  savingsController.getSavingById
);

/**
 * @route   PUT /api/savings/:id
 * @desc    Actualizar un ahorro
 * @access  Private
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID inválido'),
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('objetivo')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El objetivo debe ser un número positivo'),
    body('monto_actual')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El monto actual debe ser un número positivo'),
    body('fecha_objetivo').optional().isISO8601().withMessage('Fecha inválida'),
    validate,
  ],
  savingsController.updateSaving
);

/**
 * @route   DELETE /api/savings/:id
 * @desc    Eliminar un ahorro
 * @access  Private
 */
router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID inválido'), validate],
  savingsController.deleteSaving
);

module.exports = router;
