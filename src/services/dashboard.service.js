const { getPool, sql } = require('../config/database');

/**
 * Obtener resumen financiero del usuario
 */
const getFinancialSummary = async (userId) => {
    const pool = getPool();

    // Obtener total de gastos del mes actual
    const expensesResult = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
      SELECT ISNULL(SUM(monto), 0) as total_gastos
      FROM gastos
      WHERE usuario_id = @userId
        AND MONTH(fecha) = MONTH(GETDATE())
        AND YEAR(fecha) = YEAR(GETDATE())
    `);

    // Obtener total de ahorros
    const savingsResult = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
      SELECT ISNULL(SUM(monto_actual), 0) as total_ahorros
      FROM ahorros
      WHERE usuario_id = @userId
    `);

    // Obtener ingresos del mes (si existe tabla de ingresos)
    // Por ahora, retornamos un placeholder

    return {
        total_gastos: expensesResult.recordset[0].total_gastos,
        total_ahorros: savingsResult.recordset[0].total_ahorros,
        saldo_disponible: 0, // Calcular según ingresos - gastos
    };
};

/**
 * Obtener datos para gráficas
 */
const getChartData = async (userId, type, period) => {
    const pool = getPool();

    if (type === 'expenses') {
        // Gastos por categoría
        const result = await pool
            .request()
            .input('userId', sql.Int, userId)
            .query(`
        SELECT 
          categoria,
          SUM(monto) as total
        FROM gastos
        WHERE usuario_id = @userId
          AND fecha >= DATEADD(month, -1, GETDATE())
        GROUP BY categoria
        ORDER BY total DESC
      `);

        return result.recordset;
    }

    if (type === 'savings') {
        // Progreso de ahorros
        const result = await pool
            .request()
            .input('userId', sql.Int, userId)
            .query(`
        SELECT 
          nombre,
          objetivo,
          monto_actual,
          (monto_actual / NULLIF(objetivo, 0) * 100) as porcentaje
        FROM ahorros
        WHERE usuario_id = @userId
        ORDER BY created_at DESC
      `);

        return result.recordset;
    }

    return [];
};

/**
 * Obtener alertas y notificaciones
 */
const getAlerts = async (userId) => {
    const pool = getPool();
    const alerts = [];

    // Verificar presupuestos excedidos
    const budgetsResult = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
      SELECT 
        p.categoria,
        p.monto_limite,
        ISNULL(SUM(g.monto), 0) as gasto_actual
      FROM presupuestos p
      LEFT JOIN gastos g ON g.categoria = p.categoria 
        AND g.usuario_id = p.usuario_id
        AND g.fecha >= DATEADD(month, -1, GETDATE())
      WHERE p.usuario_id = @userId
      GROUP BY p.categoria, p.monto_limite
    `);

    budgetsResult.recordset.forEach((budget) => {
        if (budget.gasto_actual > budget.monto_limite) {
            alerts.push({
                tipo: 'presupuesto_excedido',
                mensaje: `Has excedido el presupuesto de ${budget.categoria}`,
                categoria: budget.categoria,
            });
        } else if (budget.gasto_actual > budget.monto_limite * 0.8) {
            alerts.push({
                tipo: 'presupuesto_alerta',
                mensaje: `Estás cerca de exceder el presupuesto de ${budget.categoria}`,
                categoria: budget.categoria,
            });
        }
    });

    return alerts;
};

module.exports = {
    getFinancialSummary,
    getChartData,
    getAlerts,
};

