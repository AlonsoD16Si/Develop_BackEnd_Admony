const { getPool, sql } = require('../config/database');

/**
 * Crear un nuevo gasto
 */
const createExpense = async (Id_Usuario, expenseData) => {
    const pool = getPool();
    const saldo = await GetSaldo(Id_Usuario);
    const { monto, id_categoria, descripcion, tipo } = expenseData;

    const result = await pool
        .request()
        .input('Id_Saldo', sql.Int, saldo[0].Id_Saldo)
        .input('Monto', sql.Decimal(10, 2), monto)
        .input('Id_Categoria', sql.Int, id_categoria)
        .input('Descripcion', sql.VarChar, descripcion || null)
        .input('TipoMovimiento', sql.VarChar, tipo || 'Egreso')
        .query(`
      INSERT INTO Movimiento (Id_Saldo ,Id_Categoria, TipoMovimiento, Monto, Descripcion)
      OUTPUT INSERTED.*
      VALUES (@Id_Saldo, @Id_Categoria, @TipoMovimiento, @Monto, @Descripcion)
    `);

    return result.recordset[0];
};

const GetSaldo = async (id) => {
    const pool = getPool();
    let query = `SELECT Id_Saldo FROM Saldo WHERE Id_Usuario = @Id_Usuario`;
    const request = pool.request().input('Id_Usuario', sql.Int, id);
    const result = await request.query(query);
    return result.recordset;
}

/* Obtener gastos */
const getExpenses = async (Id_Usuario, filters = {}) => {

    const saldo = await GetSaldo(Id_Usuario);
    const pool = getPool();

    let query = `SELECT Id_Movimiento, Id_Categoria, TipoMovimiento, Monto, Descripcion, FechaMovimiento
        FROM Movimiento WHERE TipoMovimiento = 'Egreso' and Id_Saldo = @Id_Saldo ORDER BY FechaMovimiento DESC `;
    const request = pool.request().input('Id_Saldo', sql.Int, saldo[0].Id_Saldo);

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
    deleteExpense,
    getExpenseStats,
};

