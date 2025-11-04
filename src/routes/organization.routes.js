const express = require('express');
const router = express.Router();
const organizacionController = require('../controllers/organization.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { body, param } = require('express-validator');

/**
 * @route   POST /api/organization
 * @desc    Crear organización
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  [
    body('nombre')
      .notEmpty()
      .withMessage('El nombre de la organización es requerido')
      .isLength({ min: 3 })
      .withMessage('El nombre debe tener al menos 3 caracteres'),
    validate,
  ],
  organizacionController.crearOrganizacion
);

/**
 * @route   POST /api/organization/miembros
 * @desc    Agregar miembro a la organización
 * @access  Private (Admin)
 */
router.post(
  '/miembros',
  authenticateToken,
  isAdmin,
  [
    body('correo')
      .isEmail()
      .withMessage('Correo inválido'),
    body('contrasenia')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)'),
    body('nombre')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .isLength({ min: 3 })
      .withMessage('El nombre debe tener al menos 3 caracteres'),
    body('idOrganizacion')
      .isInt()
      .withMessage('ID de organización inválido'),
    validate,
  ],
  organizacionController.agregarMiembro
);

/**
 * @route   GET /api/organization/:idOrganizacion/miembros
 * @desc    Obtener miembros de la organización
 * @access  Private (Admin)
 */
router.get(
  '/:idOrganizacion/miembros',
  authenticateToken,
  isAdmin,
  [
    param('idOrganizacion')
      .isInt()
      .withMessage('ID de organización inválido'),
    validate,
  ],
  organizacionController.obtenerMiembros
);

/**
 * @route   DELETE /api/organization/:idOrganizacion/miembros/:idMiembro
 * @desc    Eliminar miembro de la organización
 * @access  Private (Admin)
 */
router.delete(
  '/:idOrganizacion/miembros/:idMiembro',
  authenticateToken,
  isAdmin,
  [
    param('idOrganizacion')
      .isInt()
      .withMessage('ID de organización inválido'),
    param('idMiembro')
      .isInt()
      .withMessage('ID de miembro inválido'),
    validate,
  ],
  organizacionController.eliminarMiembro
);

module.exports = router;