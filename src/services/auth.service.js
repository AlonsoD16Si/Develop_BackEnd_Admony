const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/database');
const { generateToken } = require('../config/jwt');

/**
 * Registrar un nuevo usuario
 */
const register = async ({ correo, password, nombre, apellido }) => {
  const pool = getPool();

  // Verificar si el usuario ya existe
  const existingUser = await pool
    .request()
    .input('correo', sql.VarChar, correo)
    .query('SELECT id FROM usuario WHERE correo = @correo');

  if (existingUser.recordset.length > 0) {
    const error = new Error('El correo ya está registrado');
    error.statusCode = 400;
    throw error;
  }

  // Encriptar contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insertar usuario
  const result = await pool
    .request()
    .input('correo', sql.VarChar, correo)
    .input('contrasenia', sql.VarChar, hashedPassword)
    .input('nombre', sql.VarChar, nombre)
    .input('apellido', sql.VarChar, apellido)
    .input('rol', sql.VarChar, 'usuario').query(`
      INSERT INTO usuario (correo, contrasenia, nombre, rol)
      OUTPUT INSERTED.id, INSERTED.correo, INSERTED.nombre, INSERTED.rol
      VALUES (@correo, @contrasenia, @nombre, @rol)
    `);

  const user = result.recordset[0];

  // Generar token
  const token = generateToken({
    id_usuario: user.id_usuario,
    correo: user.correo,
    rol: user.rol,
  });

  return {
    user: {
      id_usuario: user.id_usuario,
      correo: user.correo,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
    },
    token,
  };
};

/**
 * Iniciar sesión
 */
const login = async ({ correo, constrasenia }) => {
  const pool = getPool();

  // Buscar usuario
  const result = await pool
    .request()
    .input('correo', sql.VarChar, correo)
    .query('SELECT * FROM usuario WHERE correo = @correo');

  if (result.recordset.length === 0) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const user = result.recordset[0];

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(constrasenia, user.Contrasenia);

  if (!isPasswordValid) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  // Generar token
  const token = generateToken({
    id: user.Id_Usuario,
    email: user.Correo,
    role: user.Rol,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      role: user.role,
    },
    token,
  };
};

/**
 * Obtener perfil de usuario
 */
const getProfile = async (userId) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query('SELECT id, email, nombre, apellido, role, created_at FROM usuarios WHERE id = @userId');

  if (result.recordset.length === 0) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return result.recordset[0];
};

/**
 * Solicitar recuperación de contraseña
 */
const requestPasswordReset = async (email) => {
  // TODO: Implementar lógica de envío de email con token de recuperación
  const pool = getPool();

  const result = await pool
    .request()
    .input('email', sql.VarChar, email)
    .query('SELECT id FROM usuarios WHERE email = @email');

  if (result.recordset.length === 0) {
    // Por seguridad, no revelar si el email existe o no
    return { message: 'Si el email existe, recibirás instrucciones' };
  }

  // Aquí se generaría un token temporal y se enviaría por email
  return { message: 'Email de recuperación enviado' };
};

/**
 * Restablecer contraseña
 */
const resetPassword = async (token, newPassword) => {
  // TODO: Implementar verificación de token y actualización de contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Aquí se verificaría el token y se actualizaría la contraseña
  return { message: 'Contraseña actualizada exitosamente' };
};

module.exports = {
  register,
  login,
  getProfile,
  requestPasswordReset,
  resetPassword,
};
