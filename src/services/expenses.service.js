const { getPool, sql } = require('../config/database');

/**
 * Crear un nuevo gasto
 */
const createExpense = async (userId, expenseData) => {
    const pool = getPool();
    const { monto, categoria, descripcion, tipo, fecha } = expenseData;

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('monto', sql.Decimal(10, 2), monto)
        .input('categoria', sql.VarChar, categoria)
        .input('descripcion', sql.VarChar, descripcion || null)
        .input('tipo', sql.VarChar, tipo || 'unico')
        .input('fecha', sql.DateTime, fecha || new Date())
        .query(`
      INSERT INTO gastos (usuario_id, monto, categoria, descripcion, tipo, fecha)
      OUTPUT INSERTED.*
      VALUES (@userId, @monto, @categoria, @descripcion, @tipo, @fecha)
    `);

    return result.recordset[0];
};

/**
 * Obtener gastos del usuario con filtros
 */
const getExpenses = async (userId, filters = {}) => {
    const pool = getPool();
    let query = 'SELECT * FROM gastos WHERE usuario_id = @userId';
    const request = pool.request().input('userId', sql.Int, userId);

    if (filters.startDate) {
        query += ' AND fecha >= @startDate';
        request.input('startDate', sql.DateTime, filters.startDate);
    }

    if (filters.endDate) {
        query += ' AND fecha <= @endDate';
        request.input('endDate', sql.DateTime, filters.endDate);
    }

    if (filters.category) {
        query += ' AND categoria = @category';
        request.input('category', sql.VarChar, filters.category);
    }

    query += ' ORDER BY fecha DESC';

    const result = await request.query(query);
    return result.recordset;
};

/**
 * Obtener un gasto específico
 */
const getExpenseById = async (userId, expenseId) => {
    const pool = getPool();

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('expenseId', sql.Int, expenseId)
        .query('SELECT * FROM gastos WHERE id = @expenseId AND usuario_id = @userId');

    if (result.recordset.length === 0) {
        const error = new Error('Gasto no encontrado');
        error.statusCode = 404;
        throw error;
    }

    return result.recordset[0];
};

/**
 * Actualizar un gasto
 */
const updateExpense = async (userId, expenseId, updateData) => {
    const pool = getPool();
    const { monto, categoria, descripcion, tipo, fecha } = updateData;

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('expenseId', sql.Int, expenseId)
        .input('monto', sql.Decimal(10, 2), monto)
        .input('categoria', sql.VarChar, categoria)
        .input('descripcion', sql.VarChar, descripcion)
        .input('tipo', sql.VarChar, tipo)
        .input('fecha', sql.DateTime, fecha)
        .query(`
      UPDATE gastos
      SET monto = @monto,
          categoria = @categoria,
          descripcion = @descripcion,
          tipo = @tipo,
          fecha = @fecha
      OUTPUT INSERTED.*
      WHERE id = @expenseId AND usuario_id = @userId
    `);

    if (result.recordset.length === 0) {
        const error = new Error('Gasto no encontrado');
        error.statusCode = 404;
        throw error;
    }

    return result.recordset[0];
};

/**
 * Eliminar un gasto
 */
const deleteExpense = async (userId, expenseId) => {
    const pool = getPool();

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('expenseId', sql.Int, expenseId)
        .query('DELETE FROM gastos WHERE id = @expenseId AND usuario_id = @userId');

    if (result.rowsAffected[0] === 0) {
        const error = new Error('Gasto no encontrado');
        error.statusCode = 404;
        throw error;
    }
};

/**
 * Obtener estadísticas de gastos
 */
const getExpenseStats = async (userId, period = 'monthly') => {
    const pool = getPool();

    // Implementar lógica según el período
    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
      SELECT 
        categoria,
        SUM(monto) as total,
        COUNT(*) as cantidad
      FROM gastos
      WHERE usuario_id = @userId
        AND fecha >= DATEADD(month, -1, GETDATE())
      GROUP BY categoria
      ORDER BY total DESC
    `);

    return result.recordset;
};

module.exports = {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpenseStats,
};

