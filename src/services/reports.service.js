// services/reports.service.js
const { getPool, sql } = require('../config/database');

// Helper: consigue el Id_Saldo único del usuario
async function getUserSaldoId(pool, userId) {
    const rs = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
      SELECT s.Id_Saldo
      FROM Saldo s
      INNER JOIN Usuario u ON u.Id_Usuario = s.Id_Usuario
      WHERE u.Id_Usuario = @userId
    `);

    if (rs.recordset.length === 0) {
        const e = new Error('Saldo no encontrado para el usuario');
        e.statusCode = 404;
        throw e;
    }
    return rs.recordset[0].Id_Saldo;
}

// Helper: normaliza fechas (inclusivo en to con fin del día)
function parseDateOrNull(d) {
    return d ? new Date(d) : null;
}

const getFinancialSummary = async (userId, { from, to }) => {
    const pool = await getPool();
    const saldoId = await getUserSaldoId(pool, userId);

    const fromDt = parseDateOrNull(from);
    const toDt = parseDateOrNull(to);

    // Saldo actual desde tabla Saldo (ajusta si tu dominio calcula desde movimientos)
    const saldoActualRs = await pool
        .request()
        .input('saldoId', sql.Int, saldoId)
        .query('SELECT Monto AS saldo_actual FROM Saldo WHERE Id_Saldo = @saldoId');

    const saldo_actual = saldoActualRs.recordset[0]?.saldo_actual ?? 0;

    // Totales en el periodo
    const qTot = await pool
        .request()
        .input('saldoId', sql.Int, saldoId)
        .input('from', sql.DateTime2, fromDt)
        .input('to', sql.DateTime2, toDt)
        .query(`
      SELECT 
        SUM(CASE WHEN m.TipoMovimiento = 'Ingreso' THEN m.Monto ELSE 0 END) AS total_ingresos,
        SUM(CASE WHEN m.TipoMovimiento IN ('Egreso','Domiciliacion') THEN m.Monto ELSE 0 END) AS total_egresos,
        COUNT(*) AS total_movs
      FROM Movimiento m
      WHERE m.Id_Saldo = @saldoId
        AND (@from IS NULL OR m.FechaMovimiento >= @from)
        AND (@to   IS NULL OR m.FechaMovimiento < DATEADD(day, 1, @to))
    `);

    const { total_ingresos = 0, total_egresos = 0, total_movs = 0 } = qTot.recordset[0] || {};
    const neto_periodo = Number(total_ingresos) - Number(total_egresos);

    // Balances al inicio/fin del periodo (derivados desde saldo actual y netos)
    let balance_al_inicio = null;
    let balance_al_final = null;

    if (fromDt) {
        const rsAfterFrom = await pool
            .request()
            .input('saldoId', sql.Int, saldoId)
            .input('from', sql.DateTime2, fromDt)
            .query(`
        SELECT 
          SUM(CASE WHEN TipoMovimiento = 'Ingreso' THEN Monto ELSE -Monto END) AS neto
        FROM Movimiento
        WHERE Id_Saldo = @saldoId
          AND FechaMovimiento >= @from
      `);
        const neto_desde_inicio = rsAfterFrom.recordset[0]?.neto ?? 0;
        balance_al_inicio = Number(saldo_actual) - Number(neto_desde_inicio);
    }

    if (toDt) {
        const rsAfterTo = await pool
            .request()
            .input('saldoId', sql.Int, saldoId)
            .input('to', sql.DateTime2, toDt)
            .query(`
        SELECT 
          SUM(CASE WHEN TipoMovimiento = 'Ingreso' THEN Monto ELSE -Monto END) AS neto
        FROM Movimiento
        WHERE Id_Saldo = @saldoId
          AND FechaMovimiento > DATEADD(day, 1, @to) -- posterior estrictamente al fin del día "to"
      `);
        const neto_posterior = rsAfterTo.recordset[0]?.neto ?? 0;
        balance_al_final = Number(saldo_actual) - Number(neto_posterior);
    }

    return {
        periodo: { from: fromDt, to: toDt },
        totales: {
            ingresos: Number(total_ingresos) || 0,
            egresos: Number(total_egresos) || 0,
            neto: Number(neto_periodo) || 0,
            movimientos: Number(total_movs) || 0,
        },
        saldo_actual: Number(saldo_actual) || 0,
        balance_al_inicio,
        balance_al_final,
    };
};

const getMonthlyCashflow = async (userId, { year }) => {
    const pool = await getPool();
    const saldoId = await getUserSaldoId(pool, userId);

    const rs = await pool
        .request()
        .input('saldoId', sql.Int, saldoId)
        .input('year', sql.Int, year)
        .query(`
      WITH Meses AS (
        SELECT 1 AS mes UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
        SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
        SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
      )
      SELECT 
        m.mes,
        DATEFROMPARTS(@year, m.mes, 1) AS periodo,
        ISNULL(SUM(CASE WHEN mv.TipoMovimiento = 'Ingreso' THEN mv.Monto END), 0)  AS ingresos,
        ISNULL(SUM(CASE WHEN mv.TipoMovimiento IN ('Egreso','Domiciliacion') THEN mv.Monto END), 0) AS egresos
      FROM Meses m
      LEFT JOIN Movimiento mv
        ON mv.Id_Saldo = @saldoId
       AND YEAR(mv.FechaMovimiento) = @year
       AND MONTH(mv.FechaMovimiento) = m.mes
      GROUP BY m.mes
      ORDER BY m.mes
    `);

    return rs.recordset.map(r => ({
        month: r.mes,
        periodStart: r.periodo,
        ingresos: Number(r.ingresos) || 0,
        egresos: Number(r.egresos) || 0,
        neto: (Number(r.ingresos) || 0) - (Number(r.egresos) || 0),
    }));
};

const getCategoryBreakdown = async (userId, { from, to }) => {
    const pool = await getPool();
    const saldoId = await getUserSaldoId(pool, userId);
    const fromDt = parseDateOrNull(from);
    const toDt = parseDateOrNull(to);

    const rs = await pool
        .request()
        .input('saldoId', sql.Int, saldoId)
        .input('from', sql.DateTime2, fromDt)
        .input('to', sql.DateTime2, toDt)
        .query(`
      SELECT 
        c.Id_Categoria,
        c.Nombre AS categoria,
        m.TipoMovimiento,
        SUM(m.Monto) AS total,
        COUNT(*) AS movimientos
      FROM Movimiento m
      INNER JOIN Categoria c ON c.Id_Categoria = m.Id_Categoria
      WHERE m.Id_Saldo = @saldoId
        AND (@from IS NULL OR m.FechaMovimiento >= @from)
        AND (@to   IS NULL OR m.FechaMovimiento < DATEADD(day, 1, @to))
      GROUP BY c.Id_Categoria, c.Nombre, m.TipoMovimiento
      ORDER BY c.Nombre
    `);

    const byCat = {};
    for (const row of rs.recordset) {
        const key = row.Id_Categoria;
        if (!byCat[key]) {
            byCat[key] = {
                id: key,
                categoria: row.categoria,
                ingresos: 0,
                egresos: 0,
                domiciliaciones: 0,
                movimientos: 0,
                total: 0,
            };
        }
        const amt = Number(row.total) || 0;
        if (row.TipoMovimiento === 'Ingreso') byCat[key].ingresos += amt;
        else if (row.TipoMovimiento === 'Egreso') byCat[key].egresos += amt;
        else if (row.TipoMovimiento === 'Domiciliacion') byCat[key].domiciliaciones += amt;

        byCat[key].movimientos += Number(row.movimientos) || 0;
        byCat[key].total = byCat[key].ingresos - (byCat[key].egresos + byCat[key].domiciliaciones);
    }
    return Object.values(byCat);
};

const getRecurringPayments = async (userId, { months = 6 }) => {
    const pool = await getPool();
    const saldoId = await getUserSaldoId(pool, userId);

    const rs = await pool
        .request()
        .input('saldoId', sql.Int, saldoId)
        .input('months', sql.Int, months)
        .query(`
      WITH R AS (
        SELECT 
          m.Id_Categoria,
          c.Nombre AS categoria,
          COALESCE(NULLIF(LTRIM(RTRIM(m.Descripcion)), ''), 'Domiciliación') AS etiqueta,
          m.Monto,
          m.FechaMovimiento
        FROM Movimiento m
        INNER JOIN Categoria c ON c.Id_Categoria = m.Id_Categoria
        WHERE m.Id_Saldo = @saldoId
          AND m.TipoMovimiento = 'Domiciliacion'
          AND m.FechaMovimiento >= DATEADD(month, -@months, SYSDATETIME())
      )
      SELECT 
        Id_Categoria,
        categoria,
        etiqueta,
        COUNT(*) AS ocurrencias,
        AVG(Monto) AS promedio_monto,
        MIN(FechaMovimiento) AS primera,
        MAX(FechaMovimiento) AS ultima
      FROM R
      GROUP BY Id_Categoria, categoria, etiqueta
      ORDER BY categoria, etiqueta
    `);

    return rs.recordset.map(row => ({
        categoriaId: row.Id_Categoria,
        categoria: row.categoria,
        etiqueta: row.etiqueta,
        ocurrencias: Number(row.ocurrencias) || 0,
        monto_promedio: Number(row.promedio_monto) || 0,
        ultima: row.ultima,
        // Heurística simple: mensual -> próxima = última + 1 mes
        proxima_estimada: row.ultima ? new Date(new Date(row.ultima).setMonth(new Date(row.ultima).getMonth() + 1)) : null,
        primera: row.primera,
    }));
};

const getSavingsOverview = async (userId) => {
    const pool = await getPool();
    const saldoId = await getUserSaldoId(pool, userId);

    const rs = await pool
        .request()
        .input('saldoId', sql.Int, saldoId)
        .query(`
      SELECT 
        a.Id_Ahorro,
        a.Monto AS monto_ahorrado,
        a.FechaCreacion AS fecha_ahorro,
        o.Id_Objetivo,
        o.Nombre AS objetivo_nombre,
        o.Descripcion AS objetivo_desc,
        o.MontoMeta AS objetivo_meta,
        o.FechaCreacion AS objetivo_fecha
      FROM Ahorro a
      LEFT JOIN Objetivo o ON o.Id_Ahorro = a.Id_Ahorro
      WHERE a.Id_Saldo = @saldoId
      ORDER BY a.FechaCreacion DESC, o.FechaCreacion DESC
    `);

    const map = new Map();
    for (const r of rs.recordset) {
        if (!map.has(r.Id_Ahorro)) {
            map.set(r.Id_Ahorro, {
                id: r.Id_Ahorro,
                monto_ahorrado: Number(r.monto_ahorrado) || 0,
                fecha_ahorro: r.fecha_ahorro,
                objetivos: [],
            });
        }
        if (r.Id_Objetivo) {
            map.get(r.Id_Ahorro).objetivos.push({
                id: r.Id_Objetivo,
                nombre: r.objetivo_nombre,
                descripcion: r.objetivo_desc,
                meta: Number(r.objetivo_meta) || 0,
                fecha: r.objetivo_fecha,
                progreso_pct:
                    r.objetivo_meta && r.objetivo_meta > 0
                        ? Math.min(100, ((Number(r.monto_ahorrado) || 0) / Number(r.objetivo_meta)) * 100)
                        : 0,
            });
        }
    }
    return Array.from(map.values());
};

const getExtrasSummary = async (userId, { from, to }) => {
    const pool = await getPool();
    const saldoId = await getUserSaldoId(pool, userId);
    const fromDt = parseDateOrNull(from);
    const toDt = parseDateOrNull(to);

    const rs = await pool
        .request()
        .input('saldoId', sql.Int, saldoId)
        .input('from', sql.DateTime2, fromDt)
        .input('to', sql.DateTime2, toDt)
        .query(`
      SELECT 
        COUNT(*) AS total_registros,
        ISNULL(SUM(Monto), 0) AS total_monto
      FROM Extras
      WHERE Id_Saldo = @saldoId
        AND (@from IS NULL OR FechaCreacion >= @from)
        AND (@to   IS NULL OR FechaCreacion < DATEADD(day, 1, @to));
      
      SELECT TOP 50
        Id_Extra, Monto, Descripcion, FechaCreacion
      FROM Extras
      WHERE Id_Saldo = @saldoId
        AND (@from IS NULL OR FechaCreacion >= @from)
        AND (@to   IS NULL OR FechaCreacion < DATEADD(day, 1, @to))
      ORDER BY FechaCreacion DESC
    `);

    const header = rs.recordsets?.[0]?.[0] || { total_registros: 0, total_monto: 0 };
    const items = rs.recordsets?.[1] || [];

    return {
        periodo: { from: fromDt, to: toDt },
        total_registros: Number(header.total_registros) || 0,
        total_monto: Number(header.total_monto) || 0,
        recientes: items.map(i => ({
            id: i.Id_Extra,
            monto: Number(i.Monto) || 0,
            descripcion: i.Descripcion,
            fecha: i.FechaCreacion,
        })),
    };
};

module.exports = {
    getFinancialSummary,
    getMonthlyCashflow,
    getCategoryBreakdown,
    getRecurringPayments,
    getSavingsOverview,
    getExtrasSummary,
};
