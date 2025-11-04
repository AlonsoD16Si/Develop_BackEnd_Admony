const { verifyToken } = require('../config/jwt');

/**
 * Middleware para verificar autenticación
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para acceder a este recurso',
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
