const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/database');
const { generateToken } = require('../config/jwt');

/**
 * Registrar un nuevo usuario
 */
const register = async ({ correo, contrasenia, nombre }) => {
  const pool = getPool();

  // Verificar si el usuario ya existe
  const existingUser = await pool
    .request()
    .input('correo', sql.VarChar, correo)
    .query('SELECT id_usuario FROM Usuario WHERE correo = @correo');

  if (existingUser.recordset.length > 0) {
    const error = new Error('El correo ya está registrado');
    error.statusCode = 400;
    throw error;
  }

  // Encriptar contraseña
  const hashedPassword = await bcrypt.hash(contrasenia, 10);

  // Insertar usuario
  const result = await pool
    .request()
    .input('correo', sql.VarChar, correo)
    .input('contrasenia', sql.VarChar, hashedPassword)
    .input('nombre', sql.VarChar, nombre)
    .input('rol', sql.VarChar, 'usuario')
    .query(`
      INSERT INTO usuario (correo, contrasenia, nombre, rol, Estatus)
      OUTPUT INSERTED.id_usuario, INSERTED.correo, INSERTED.nombre, INSERTED.rol
      VALUES (@correo, @contrasenia, @nombre, @rol, 1)
    `);

  const user = result.recordset[0];

  // Generar token
  const token = generateToken({
    Id_Usuario: user.Id_Usuario,
    Correo: user.Correo,
    Rol: user.Rol,
  });

  return {
    user: {
      Id_Usuario: user.Id_Usuario,
      Correo: user.Correo,
      Nombre: user.Nombre,
      Rol: user.Rol,
    },
    token,
  };
};

/**
 * Iniciar sesión
 */
const login = async ({ correo, contrasenia }) => {
  const pool = getPool();

  // Buscar usuario
  const result = await pool
    .request()
    .input('correo', sql.VarChar, correo)
    .query('SELECT * FROM Usuario WHERE correo = @correo');

  if (result.recordset.length === 0) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const user = result.recordset[0];

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(contrasenia, user.Contrasenia);

  if (!isPasswordValid) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  // Generar token
  const token = generateToken({
    Id_Usuario: user.Id_Usuario,
    Correo: user.Correo,
    Rol: user.Rol,
  });

  return {
    user: {
      Id_Usuario: user.Id_Usuario,
      Correo: user.Correo,
      Nombre: user.Nombre,
      Rol: user.Rol,
    },
    token,
  };
};

/**
 * Obtener perfil de usuario
 */
const getProfile = async (Id_Usuario) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('Id_Usuario', sql.Int, Id_Usuario)
    .query('SELECT Id_Usuario as id_usuario, Correo as correo, Nombre as nombre, Rol as rol, Estatus as estatus FROM Usuario WHERE Id_Usuario = @Id_Usuario');

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
const requestPasswordReset = async (correo) => {
  // TODO: Implementar lógica de envío de email con token de recuperación
  const pool = getPool();

  const result = await pool
    .request()
    .input('correo', sql.VarChar, correo)
    .query('SELECT Id_Usuario FROM Usuario WHERE Correo = @correo');

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
