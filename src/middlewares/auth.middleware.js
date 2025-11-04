const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: err,
      });
    }

    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.Rol !== 'Administrador') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de Administrador',
    });
  }
  next();
};

module.exports = { authenticateToken, isAdmin };