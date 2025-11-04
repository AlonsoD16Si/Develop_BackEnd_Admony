const authService = require('../services/auth.service');

/**
 * Registro de nuevo usuario
 */
const register = async (req, res, next) => {
  try {
    const { email, password, nombre, apellido } = req.body;

    const result = await authService.register({ email, password, nombre, apellido });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Inicio de sesión
 */
const login = async (req, res, next) => {
  try {
    const { correo, constrasenia } = req.body;

    const result = await authService.login({ correo, constrasenia });

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await authService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Solicitar recuperación de contraseña
 */
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    await authService.requestPasswordReset(email);

    res.status(200).json({
      success: true,
      message: 'Se ha enviado un correo con instrucciones para recuperar tu contraseña',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restablecer contraseña
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  requestPasswordReset,
  resetPassword,
};
