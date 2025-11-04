const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/database');
const dayjs = require('dayjs');

const crearOrganizacion = async ({ nombre, idUsuario }) => {
  const pool = getPool();
  const fechaCreacion = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const estatus = '1';

  // Insertar organización
  const result = await pool
    .request()
    .input('nombre', sql.VarChar, nombre)
    .input('estatus', sql.VarChar, estatus)
    .input('fechaCreacion', sql.DateTime, fechaCreacion)
    .query(`
      INSERT INTO Organizacion (Nombre, Estatus, FechaCreacion)
      OUTPUT INSERTED.Id_Organizacion
      VALUES (@nombre, @estatus, @fechaCreacion)
    `);

  const idOrganizacion = result.recordset[0].Id_Organizacion;

  // Actualizar usuario como admin
  await pool
    .request()
    .input('idOrganizacion', sql.Int, idOrganizacion)
    .input('idUsuario', sql.Int, idUsuario)
    .query(`
      UPDATE Usuario
      SET Rol = 'Administrador', Id_Organizacion = @idOrganizacion
      WHERE Id_Usuario = @idUsuario
    `);

  return {
    Id_Organizacion: idOrganizacion,
    Nombre: nombre,
    Estatus: estatus,
    FechaCreacion: fechaCreacion,
    Admin: idUsuario,
  };
};

/**
 * Agregar miembro a la organización
 */
const agregarMiembro = async ({ correo, contrasenia, nombre, idOrganizacion, idAdmin }) => {
  const pool = getPool();

  // Verificar que el admin pertenece a la organización
  const adminCheck = await pool
    .request()
    .input('idAdmin', sql.Int, idAdmin)
    .input('idOrganizacion', sql.Int, idOrganizacion)
    .query(`
      SELECT Id_Usuario, Rol, Id_Organizacion 
      FROM Usuario 
      WHERE Id_Usuario = @idAdmin 
      AND Id_Organizacion = @idOrganizacion 
      AND Rol = 'Administrador'
    `);

  if (adminCheck.recordset.length === 0) {
    const error = new Error('No tienes permisos para agregar miembros a esta organización');
    error.statusCode = 403;
    throw error;
  }

  // Verificar si el usuario ya existe
  const existingUser = await pool
    .request()
    .input('correo', sql.VarChar, correo)
    .query('SELECT Id_Usuario, Id_Organizacion FROM Usuario WHERE Correo = @correo');

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
    .input('idOrganizacion', sql.Int, idOrganizacion)
    .query(`
      INSERT INTO Usuario (Correo, Contrasenia, Nombre, Rol, Estatus, Id_Organizacion)
      OUTPUT INSERTED.Id_Usuario, INSERTED.Correo, INSERTED.Nombre, INSERTED.Rol, INSERTED.Id_Organizacion
      VALUES (@correo, @contrasenia, @nombre, @rol, 1, @idOrganizacion)
    `);

  const user = result.recordset[0];

  return {
    Id_Usuario: user.Id_Usuario,
    Correo: user.Correo,
    Nombre: user.Nombre,
    Rol: user.Rol,
    Id_Organizacion: user.Id_Organizacion,
  };
};

/**
 * Obtener miembros de la organización
 */
const obtenerMiembros = async ({ idOrganizacion, idAdmin }) => {
  const pool = getPool();

  // Verificar que el admin pertenece a la organización
  const adminCheck = await pool
    .request()
    .input('idAdmin', sql.Int, idAdmin)
    .input('idOrganizacion', sql.Int, idOrganizacion)
    .query(`
      SELECT Id_Usuario 
      FROM Usuario 
      WHERE Id_Usuario = @idAdmin 
      AND Id_Organizacion = @idOrganizacion 
      AND Rol = 'Administrador'
    `);

  if (adminCheck.recordset.length === 0) {
    const error = new Error('No tienes permisos para ver los miembros de esta organización');
    error.statusCode = 403;
    throw error;
  }

  // Obtener miembros
  const result = await pool
    .request()
    .input('idOrganizacion', sql.Int, idOrganizacion)
    .query(`
      SELECT Id_Usuario, Correo, Nombre, Rol, Estatus
      FROM Usuario
      WHERE Id_Organizacion = @idOrganizacion
      ORDER BY Rol DESC, Nombre ASC
    `);

  return result.recordset;
};

/**
 * Eliminar miembro de la organización
 */
const eliminarMiembro = async ({ idMiembro, idOrganizacion, idAdmin }) => {
  const pool = getPool();

  // Verificar que el admin pertenece a la organización
  const adminCheck = await pool
    .request()
    .input('idAdmin', sql.Int, idAdmin)
    .input('idOrganizacion', sql.Int, idOrganizacion)
    .query(`
      SELECT Id_Usuario 
      FROM Usuario 
      WHERE Id_Usuario = @idAdmin 
      AND Id_Organizacion = @idOrganizacion 
      AND Rol = 'Administrador'
    `);

  if (adminCheck.recordset.length === 0) {
    const error = new Error('No tienes permisos para eliminar miembros');
    error.statusCode = 403;
    throw error;
  }

  // Verificar que no se está intentando eliminar a sí mismo
  if (idMiembro === idAdmin) {
    const error = new Error('No puedes eliminarte a ti mismo');
    error.statusCode = 400;
    throw error;
  }

  // Verificar que el miembro pertenece a la organización
  const memberCheck = await pool
    .request()
    .input('idMiembro', sql.Int, idMiembro)
    .input('idOrganizacion', sql.Int, idOrganizacion)
    .query(`
      SELECT Id_Usuario, Rol
      FROM Usuario
      WHERE Id_Usuario = @idMiembro
      AND Id_Organizacion = @idOrganizacion
    `);

  if (memberCheck.recordset.length === 0) {
    const error = new Error('El miembro no pertenece a esta organización');
    error.statusCode = 404;
    throw error;
  }

  // Eliminar miembro (o desactivar)
  await pool
    .request()
    .input('idMiembro', sql.Int, idMiembro)
    .query(`
      UPDATE Usuario
      SET Estatus = 0, Id_Organizacion = NULL
      WHERE Id_Usuario = @idMiembro
    `);

  return { message: 'Miembro eliminado exitosamente' };
};

module.exports = { 
  crearOrganizacion, 
  agregarMiembro, 
  obtenerMiembros,
  eliminarMiembro 
};