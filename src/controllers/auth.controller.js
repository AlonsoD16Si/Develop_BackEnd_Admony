const authService = require('../services/auth.service');

/**
 * Registro de nuevo usuario
 */
const register = async (req, res, next) => {
    try {
        const { correo, contrasenia, nombre} = req.body;

        const result = await authService.register({ correo, contrasenia, nombre});

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
        const { correo, contrasenia } = req.body;

        const result = await authService.login({ correo, contrasenia });

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
        const Id_Usuario = req.user.Id_Usuario;

        const profile = await authService.getProfile(Id_Usuario);

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
        const { correo } = req.body;

        await authService.requestPasswordReset(correo);

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
