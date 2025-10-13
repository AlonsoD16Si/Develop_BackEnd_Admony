const { getPool, sql } = require('../config/database');

/**
 * Crear un nuevo presupuesto
 */
const createBudget = async (userId, budgetData) => {
    const pool = getPool();
    const { categoria, monto_limite, periodo } = budgetData;

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('categoria', sql.VarChar, categoria)
        .input('monto_limite', sql.Decimal(10, 2), monto_limite)
        .input('periodo', sql.VarChar, periodo || 'mensual')
        .query(`
      INSERT INTO presupuestos (usuario_id, categoria, monto_limite, periodo)
      OUTPUT INSERTED.*
      VALUES (@userId, @categoria, @monto_limite, @periodo)
    `);

    return result.recordset[0];
};

/**
 * Obtener todos los presupuestos del usuario
 */
const getBudgets = async (userId) => {
    const pool = getPool();

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query('SELECT * FROM presupuestos WHERE usuario_id = @userId ORDER BY created_at DESC');

    return result.recordset;
};

/**
 * Obtener un presupuesto específico
 */
const getBudgetById = async (userId, budgetId) => {
    const pool = getPool();

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('budgetId', sql.Int, budgetId)
        .query('SELECT * FROM presupuestos WHERE id = @budgetId AND usuario_id = @userId');

    if (result.recordset.length === 0) {
        const error = new Error('Presupuesto no encontrado');
        error.statusCode = 404;
        throw error;
    }

    return result.recordset[0];
};

/**
 * Actualizar un presupuesto
 */
const updateBudget = async (userId, budgetId, updateData) => {
    const pool = getPool();
    const { categoria, monto_limite, periodo } = updateData;

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('budgetId', sql.Int, budgetId)
        .input('categoria', sql.VarChar, categoria)
        .input('monto_limite', sql.Decimal(10, 2), monto_limite)
        .input('periodo', sql.VarChar, periodo)
        .query(`
      UPDATE presupuestos
      SET categoria = @categoria,
          monto_limite = @monto_limite,
          periodo = @periodo
      OUTPUT INSERTED.*
      WHERE id = @budgetId AND usuario_id = @userId
    `);

    if (result.recordset.length === 0) {
        const error = new Error('Presupuesto no encontrado');
        error.statusCode = 404;
        throw error;
    }

    return result.recordset[0];
};

/**
 * Eliminar un presupuesto
 */
const deleteBudget = async (userId, budgetId) => {
    const pool = getPool();

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('budgetId', sql.Int, budgetId)
        .query('DELETE FROM presupuestos WHERE id = @budgetId AND usuario_id = @userId');

    if (result.rowsAffected[0] === 0) {
        const error = new Error('Presupuesto no encontrado');
        error.statusCode = 404;
        throw error;
    }
};

/**
 * Obtener análisis de cumplimiento de presupuestos
 */
const getBudgetAnalysis = async (userId, filters = {}) => {
    const pool = getPool();

    // Obtener presupuestos
    const budgets = await getBudgets(userId);

    // Para cada presupuesto, calcular el gasto actual
    const analysis = await Promise.all(
        budgets.map(async (budget) => {
            const result = await pool
                .request()
                .input('userId', sql.Int, userId)
                .input('categoria', sql.VarChar, budget.categoria)
                .query(`
          SELECT 
            ISNULL(SUM(monto), 0) as gasto_actual
          FROM gastos
          WHERE usuario_id = @userId
            AND categoria = @categoria
            AND fecha >= DATEADD(month, -1, GETDATE())
        `);

            const gastoActual = result.recordset[0].gasto_actual;
            const porcentajeUsado = (gastoActual / budget.monto_limite) * 100;

            return {
                ...budget,
                gasto_actual: gastoActual,
                porcentaje_usado: porcentajeUsado,
                excedido: gastoActual > budget.monto_limite,
            };
        })
    );

    return analysis;
};

module.exports = {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getBudgetAnalysis,
};

