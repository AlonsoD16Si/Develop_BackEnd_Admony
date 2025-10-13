const { getPool, sql } = require('../config/database');

/**
 * Crear un nuevo ahorro/objetivo
 */
const createSaving = async (userId, savingData) => {
    const pool = getPool();
    const { nombre, objetivo, monto_actual, fecha_objetivo } = savingData;

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('nombre', sql.VarChar, nombre)
        .input('objetivo', sql.Decimal(10, 2), objetivo)
        .input('monto_actual', sql.Decimal(10, 2), monto_actual || 0)
        .input('fecha_objetivo', sql.DateTime, fecha_objetivo || null)
        .query(`
      INSERT INTO ahorros (usuario_id, nombre, objetivo, monto_actual, fecha_objetivo)
      OUTPUT INSERTED.*
      VALUES (@userId, @nombre, @objetivo, @monto_actual, @fecha_objetivo)
    `);

    return result.recordset[0];
};

/**
 * Obtener todos los ahorros del usuario
 */
const getSavings = async (userId) => {
    const pool = getPool();

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query('SELECT * FROM ahorros WHERE usuario_id = @userId ORDER BY created_at DESC');

    return result.recordset;
};

/**
 * Obtener un ahorro específico
 */
const getSavingById = async (userId, savingId) => {
    const pool = getPool();

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('savingId', sql.Int, savingId)
        .query('SELECT * FROM ahorros WHERE id = @savingId AND usuario_id = @userId');

    if (result.recordset.length === 0) {
        const error = new Error('Ahorro no encontrado');
        error.statusCode = 404;
        throw error;
    }

    return result.recordset[0];
};

/**
 * Actualizar un ahorro
 */
const updateSaving = async (userId, savingId, updateData) => {
    const pool = getPool();
    const { nombre, objetivo, monto_actual, fecha_objetivo } = updateData;

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('savingId', sql.Int, savingId)
        .input('nombre', sql.VarChar, nombre)
        .input('objetivo', sql.Decimal(10, 2), objetivo)
        .input('monto_actual', sql.Decimal(10, 2), monto_actual)
        .input('fecha_objetivo', sql.DateTime, fecha_objetivo)
        .query(`
      UPDATE ahorros
      SET nombre = @nombre,
          objetivo = @objetivo,
          monto_actual = @monto_actual,
          fecha_objetivo = @fecha_objetivo
      OUTPUT INSERTED.*
      WHERE id = @savingId AND usuario_id = @userId
    `);

    if (result.recordset.length === 0) {
        const error = new Error('Ahorro no encontrado');
        error.statusCode = 404;
        throw error;
    }

    return result.recordset[0];
};

/**
 * Eliminar un ahorro
 */
const deleteSaving = async (userId, savingId) => {
    const pool = getPool();

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('savingId', sql.Int, savingId)
        .query('DELETE FROM ahorros WHERE id = @savingId AND usuario_id = @userId');

    if (result.rowsAffected[0] === 0) {
        const error = new Error('Ahorro no encontrado');
        error.statusCode = 404;
        throw error;
    }
};

/**
 * Obtener progreso de ahorros
 */
const getSavingsProgress = async (userId) => {
    const pool = getPool();

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
      SELECT 
        *,
        CASE 
          WHEN objetivo > 0 THEN (monto_actual / objetivo * 100)
          ELSE 0
        END as porcentaje_completado
      FROM ahorros
      WHERE usuario_id = @userId
      ORDER BY created_at DESC
    `);

    return result.recordset;
};

module.exports = {
    createSaving,
    getSavings,
    getSavingById,
    updateSaving,
    deleteSaving,
    getSavingsProgress,
};

