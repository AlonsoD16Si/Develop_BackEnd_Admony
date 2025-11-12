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

router.post(
  '/objectives',
  authenticateToken,
  [
  body('id_Ahorro').notEmpty().withMessage('El nombre es requerido'),
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('montoMeta').notEmpty().withMessage('El monto es requerido'),
  body('descripcion').notEmpty().withMessage('La Descripción es requerido'),
  validate,
  ],
  savingsController.createObjective
);



router.get('/objectives',
  authenticateToken,
  savingsController.getObjectives
)

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
  '/',
  authenticateToken,
  [
    body('id_Ahorro').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('monto')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El objetivo debe ser un número positivo'),
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
