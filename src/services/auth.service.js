const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/database');
const { generateToken } = require('../config/jwt');

/**
 * Registrar un nuevo usuario
 */
const register = async ({ email, password, nombre, apellido }) => {
    const pool = getPool();

    // Verificar si el usuario ya existe
    const existingUser = await pool
        .request()
        .input('email', sql.VarChar, email)
        .query('SELECT id FROM usuarios WHERE email = @email');

    if (existingUser.recordset.length > 0) {
        const error = new Error('El email ya está registrado');
        error.statusCode = 400;
        throw error;
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const result = await pool
        .request()
        .input('email', sql.VarChar, email)
        .input('password', sql.VarChar, hashedPassword)
        .input('nombre', sql.VarChar, nombre)
        .input('apellido', sql.VarChar, apellido)
        .input('role', sql.VarChar, 'usuario')
        .query(`
      INSERT INTO usuarios (email, password, nombre, apellido, role)
      OUTPUT INSERTED.id, INSERTED.email, INSERTED.nombre, INSERTED.apellido, INSERTED.role
      VALUES (@email, @password, @nombre, @apellido, @role)
    `);

    const user = result.recordset[0];

    // Generar token
    const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
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
 * Iniciar sesión
 */
const login = async ({ correo, constrasenia}) => {
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

// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { getPool, sql } = require('../config/database');

// const JWT_SECRET = process.env.JWT_SECRET;
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// function signToken(payload) {
//     return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
// }

// /**
//  * Register: crea Usuario con pass hasheada y Saldo=0
//  */
// async function register({ email, password, nombre, apellido }) {
//     const pool = await getPool();

//     const correo = String(email).trim().toLowerCase();
//     const nombreCompleto = [nombre, apellido].filter(Boolean).join(' ').trim();

//     ¿correo ya existe?
//     const exists = await pool.request()
//         .input('correo', sql.NVarChar, correo)
//         .query(`SELECT 1 FROM Usuario WHERE Correo = @correo`);
//     if (exists.recordset.length > 0) {
//         const e = new Error('El correo ya está registrado'); e.statusCode = 409; throw e;
//     }

//     const hash = await bcrypt.hash(password, 10);

//     const tx = new sql.Transaction(pool);
//     await tx.begin();
//     try {
//         const req = new sql.Request(tx);

//         const insUser = await req
//             .input('correo', sql.NVarChar, correo)
//             .input('contrasenia', sql.NVarChar, hash)
//             .input('nombre', sql.NVarChar, nombreCompleto)
//             .query(`
//         INSERT INTO Usuario (Id_Organizacion, Rol, Nombre, Correo, Contrasenia, Estatus)
//         OUTPUT INSERTED.Id_Usuario
//         VALUES (NULL, 'Usuario', @nombre, @correo, @contrasenia, 1)
//       `);

//         const userId = insUser.recordset[0].Id_Usuario;

//         await new sql.Request(tx)
//             .input('idUsuario', sql.Int, userId)
//             .query(`
//         INSERT INTO Saldo (Id_Usuario, Monto)
//         VALUES (@idUsuario, 0.00)
//       `);

//         await tx.commit();

//         const token = signToken({ id: userId, correo });
//         return {
//             token,
//             user: { id: userId, correo, nombre: nombreCompleto, rol: 'Usuario' }
//         };
//     } catch (err) {
//         try { await tx.rollback(); } catch { }
//         throw err;
//     }
// }

// /**
//  * Login: compara bcrypt y devuelve token + user
//  */
// async function login({ correo, constrasenia }) {
//     if (!JWT_SECRET) {
//         const e = new Error('JWT_SECRET no definido'); e.statusCode = 500; throw e;
//     }

//     const pool = await getPool();
//     const rs = await pool.request()
//         .input('correo', sql.NVarChar, String(correo).trim().toLowerCase())
//         .query(`
//       SELECT Id_Usuario, Correo, Contrasenia, Rol, Nombre, Estatus
//       FROM Usuario
//       WHERE Correo = @correo
//     `);

//     const u = rs.recordset[0];
//     if (!u || u.Estatus !== true && u.Estatus !== 1) {
//         const e = new Error('Credenciales inválidas'); e.statusCode = 401; throw e;
//     }

//     const ok = await bcrypt.compare(constrasenia, u.Contrasenia);
//     if (!ok) {
//         const e = new Error('Credenciales inválidas'); e.statusCode = 401; throw e;
//     }

//     const token = signToken({ id: u.Id_Usuario, correo: u.Correo, role: u.Rol });
//     return {
//         token,
//         user: { id: u.Id_Usuario, correo: u.Correo, nombre: u.Nombre, rol: u.Rol }
//     };
// }

// /**
//  * Perfil
//  */
// async function getProfile(userId) {
//     const pool = await getPool();
//     const rs = await pool.request()
//         .input('id', sql.Int, userId)
//         .query(`
//       SELECT Id_Usuario AS id, Correo AS correo, Nombre AS nombre, Rol AS rol, Estatus
//       FROM Usuario
//       WHERE Id_Usuario = @id
//     `);
//     if (!rs.recordset[0]) {
//         const e = new Error('Usuario no encontrado'); e.statusCode = 404; throw e;
//     }
//     return rs.recordset[0];
// }

// /**
//  * (Opcional) Password reset – deja placeholders si aún no lo implementas
//  */
// async function requestPasswordReset(/* email */) {
//     const e = new Error('requestPasswordReset no implementado'); e.statusCode = 501; throw e;
// }
// async function resetPassword(/* token, newPassword */) {
//     const e = new Error('resetPassword no implementado'); e.statusCode = 501; throw e;
// }

// module.exports = {
//     register,
//     login,
//     getProfile,
//     requestPasswordReset,
//     resetPassword,
// };
