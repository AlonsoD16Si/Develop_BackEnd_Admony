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
        body('email').isEmail().withMessage('Email inválido'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('nombre').notEmpty().withMessage('El nombre es requerido'),
        body('apellido').notEmpty().withMessage('El apellido es requerido'),
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
        body('email').isEmail().withMessage('Email inválido'),
        body('password').notEmpty().withMessage('La contraseña es requerida'),
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
    [body('email').isEmail().withMessage('Email inválido'), validate],
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
        body('token').notEmpty().withMessage('Token requerido'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres'),
        validate,
    ],
    authController.resetPassword
);

module.exports = router;

