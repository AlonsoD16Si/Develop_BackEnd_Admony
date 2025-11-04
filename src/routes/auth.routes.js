const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { body } = require('express-validator');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post(
  '/register',
  [
    body('correo')
      .isEmail()
      .withMessage('Correo inválido')
      .normalizeEmail(),
    body('contrasenia')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)'),
    body('nombre')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .isLength({ min: 3 })
      .withMessage('El nombre debe tener al menos 3 caracteres')
      .trim(),
    validate,
  ],
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post(
  '/login',
  [
    body('correo')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('contrasenia')
      .notEmpty()
      .withMessage('La contraseña es requerida'),
    validate,
  ],
  authController.login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   POST /api/auth/request-password-reset
 * @desc    Solicitar recuperación de contraseña
 * @access  Public
 */
router.post(
  '/request-password-reset',
  [
    body('correo')
      .isEmail()
      .withMessage('Correo inválido')
      .normalizeEmail(),
    validate,
  ],
  authController.requestPasswordReset
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Restablecer contraseña
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Token requerido'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)'),
    validate,
  ],
  authController.resetPassword
);

module.exports = router;