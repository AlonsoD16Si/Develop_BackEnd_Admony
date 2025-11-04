/**
 * GET http://localhost:3000/api/dashboard/summary  
 * Para mostrar el resumen financiero personal del usuario en tarjetas principales.
 */

/**
 * GET http://localhost:3000/api/dashboard/alerts
 * Para mostrar notificaciones inteligentes sobre la salud financiera.
 */

/**
 * GET http://localhost:3000/api/dashboard/all
 * Para usuarios individuales: Dashboard personal completo
 * Para usuarios con organización: Dashboard personal + resumen organizacional
 */

/**
 * GET http://localhost:3000/api/dashboard/charts?type=expenses
 * GET http://localhost:3000/api/dashboard/charts?type=savings  
 * GET http://localhost:3000/api/dashboard/charts?type=income
 * Para alimentar gráficas de pastel (gastos), líneas (ahorros) o barras (ingresos vs gastos).
 */


const { getPool, sql } = require('../config/database');
const { calculatePercentage, roundToDecimals } = require('../utils/helpers');


/**
 * Obtener el Id_Saldo del usuario
 */
const GetSaldo = async (userId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('Id_Usuario', sql.Int, userId)
    .query('SELECT Id_Saldo, Monto FROM Saldo WHERE Id_Usuario = @Id_Usuario');

  return result.recordset[0];
};

/**
 * Obtener datos del usuario (nombre, saldo)
 */
const getUserData = async (userId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('Id_Usuario', sql.Int, userId)
    .query(`
            SELECT u.Id_Usuario, u.Nombre, s.Id_Saldo, s.Monto
            FROM Usuario u
            INNER JOIN Saldo s ON u.Id_Usuario = s.Id_Usuario
            WHERE u.Id_Usuario = @Id_Usuario
        `);

  return result.recordset[0];
};

/**
 * Obtener movimientos detallados del usuario
 */
const getMovimientosDetallados = async (Id_Saldo) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('Id_Saldo', sql.Int, Id_Saldo)
    .query(`
            SELECT 
                m.Id_Movimiento,
                m.TipoMovimiento,
                m.Monto,
                m.Descripcion,
                m.FechaMovimiento,
                c.Nombre as Categoria,
                c.Descripcion as DescripcionCategoria
            FROM Movimiento m
            INNER JOIN Categoria c ON m.Id_Categoria = c.Id_Categoria
            WHERE m.Id_Saldo = @Id_Saldo
            AND MONTH(m.FechaMovimiento) = MONTH(GETDATE())
            AND YEAR(m.FechaMovimiento) = YEAR(GETDATE())
            ORDER BY m.FechaMovimiento DESC
        `);

  return result.recordset;
};


/**
 * Obtener ahorros y objetivos detallados
 */
const getAhorrosDetallados = async (Id_Saldo) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('Id_Saldo', sql.Int, Id_Saldo)
    .query(`
            SELECT 
                a.Id_Ahorro,
                a.Monto as MontoAhorrado,
                a.FechaCreacion,
                o.Id_Objetivo,
                o.Nombre as Objetivo,
                o.Descripcion as DescripcionObjetivo,
                o.MontoMeta,
                (a.Monto / NULLIF(o.MontoMeta, 0)) * 100 as Progreso
            FROM Ahorro a
            LEFT JOIN Objetivo o ON a.Id_Ahorro = o.Id_Ahorro
            WHERE a.Id_Saldo = @Id_Saldo
            ORDER BY a.FechaCreacion DESC
        `);

  return result.recordset;
};

/**
 * Obtener extras detallados
 */
const getExtrasDetallados = async (Id_Saldo) => {
  const pool = getPool();

  const result = await pool
    .request()
    .input('Id_Saldo', sql.Int, Id_Saldo)
    .query(`
            SELECT 
                Id_Extra,
                Monto,
                Descripcion,
                FechaCreacion
            FROM Extras
            WHERE Id_Saldo = @Id_Saldo
            AND MONTH(FechaCreacion) = MONTH(GETDATE())
            AND YEAR(FechaCreacion) = YEAR(GETDATE())
            ORDER BY FechaCreacion DESC
        `);

  return result.recordset;
};

/**
 * Obtener resumen financiero del usuario
 * Incluye ingresos, gastos, ahorros, extras, métricas de salud
 */
const getFinancialSummary = async (userId) => {
  const pool = getPool();

  try {
    const userData = await getUserData(userId);
    if (!userData) throw new Error('Usuario no encontrado o sin saldo asociado.');

    const { Id_Saldo, Nombre, Monto } = userData;

    // Obtener datos detallados
    const [movimientos, ahorros, extras] = await Promise.all([
      getMovimientosDetallados(Id_Saldo),
      getAhorrosDetallados(Id_Saldo),
      getExtrasDetallados(Id_Saldo)
    ]);

    // Separar ingresos y gastos
    const ingresos = movimientos.filter(m => m.TipoMovimiento === 'Ingreso');
    const gastos = movimientos.filter(m => m.TipoMovimiento === 'Egreso');

    // Calcular totales
    const totalIngresos = ingresos.reduce((sum, ingreso) => sum + parseFloat(ingreso.Monto), 0);
    const totalGastos = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.Monto), 0);
    const totalExtras = extras.reduce((sum, extra) => sum + parseFloat(extra.Monto), 0);
    const totalAhorros = ahorros.reduce((sum, ahorro) => sum + parseFloat(ahorro.MontoAhorrado), 0);

    const ingresosTotales = totalIngresos + totalExtras;
    const porcentajeAhorro = ingresosTotales > 0 ?
      calculatePercentage(totalAhorros, ingresosTotales) : 0;

    // Agrupar gastos por categoría
    const gastosPorCategoria = gastos.reduce((acc, gasto) => {
      const categoria = gasto.Categoria;
      if (!acc[categoria]) {
        acc[categoria] = {
          total: 0,
          transacciones: []
        };
      }
      acc[categoria].total += parseFloat(gasto.Monto);
      acc[categoria].transacciones.push({
        monto: roundToDecimals(gasto.Monto),
        descripcion: gasto.Descripcion,
        fecha: gasto.FechaMovimiento
      });
      return acc;
    }, {});

    return {
      usuario: {
        id: userId,
        nombre: Nombre,
        saldoActual: roundToDecimals(parseFloat(Monto))
      },
      resumen: {
        totalIngresos: roundToDecimals(ingresosTotales),
        totalExtras: roundToDecimals(totalExtras),
        totalGastos: roundToDecimals(totalGastos),
        saldoActual: roundToDecimals(parseFloat(Monto)),
        ahorroTotal: roundToDecimals(totalAhorros),
        porcentajeAhorro: roundToDecimals(porcentajeAhorro, 1),
        balanceNeto: roundToDecimals(ingresosTotales - totalGastos)
      },
      detalle: {
        ingresos: {
          total: roundToDecimals(totalIngresos),
          transacciones: ingresos.map(ingreso => ({
            monto: roundToDecimals(ingreso.Monto),
            descripcion: ingreso.Descripcion,
            categoria: ingreso.Categoria,
            fecha: ingreso.FechaMovimiento
          }))
        },
        gastos: {
          total: roundToDecimals(totalGastos),
          porCategoria: Object.keys(gastosPorCategoria).map(categoria => ({
            categoria: categoria,
            total: roundToDecimals(gastosPorCategoria[categoria].total),
            transacciones: gastosPorCategoria[categoria].transacciones
          })),
          transacciones: gastos.map(gasto => ({
            monto: roundToDecimals(gasto.Monto),
            descripcion: gasto.Descripcion,
            categoria: gasto.Categoria,
            fecha: gasto.FechaMovimiento
          }))
        },
        extras: {
          total: roundToDecimals(totalExtras),
          transacciones: extras.map(extra => ({
            monto: roundToDecimals(extra.Monto),
            descripcion: extra.Descripcion,
            fecha: extra.FechaCreacion
          }))
        },
        ahorros: {
          total: roundToDecimals(totalAhorros),
          objetivos: ahorros.map(ahorro => ({
            objetivo: ahorro.Objetivo || 'Ahorro general',
            montoAhorrado: roundToDecimals(ahorro.MontoAhorrado),
            montoMeta: ahorro.MontoMeta ? roundToDecimals(ahorro.MontoMeta) : null,
            progreso: ahorro.Progreso ? roundToDecimals(ahorro.Progreso, 1) : null,
            descripcion: ahorro.DescripcionObjetivo
          }))
        }
      }
    };

  } catch (error) {
    console.error('Error en getFinancialSummary:', error);
    throw error;
  }
};

/**
 *  Tendencias financieras
 * Analiza variación mes a mes de ingresos/gastos
 */
const getTrends = async (userId) => {
    const pool = getPool();
    
    try {
        const userData = await getUserData(userId);
        if (!userData) {
            return { 
                tendencia: {
                    mensaje: 'Usuario no encontrado',
                    tipo: 'error'
                }
            };
        }

        const Id_Saldo = userData.Id_Saldo;

        const result = await pool.request()
            .input('Id_Saldo', sql.Int, Id_Saldo)
            .query(`
                SELECT TOP 2
                    FORMAT(FechaMovimiento, 'yyyy-MM') AS mes,
                    SUM(CASE WHEN TipoMovimiento='Ingreso' THEN Monto ELSE 0 END) AS ingresos,
                    SUM(CASE WHEN TipoMovimiento='Egreso' THEN Monto ELSE 0 END) AS egresos
                FROM Movimiento
                WHERE Id_Saldo = @Id_Saldo
                GROUP BY FORMAT(FechaMovimiento, 'yyyy-MM')
                ORDER BY mes DESC
            `);

        if (result.recordset.length < 2) {
            return { 
                tendencia: {
                    mensaje: 'Sin datos suficientes para análisis de tendencias',
                    tipo: 'info'
                }
            };
        }

        const [actual, anterior] = result.recordset;
        const variacionGastos = anterior.egresos > 0 ? 
            ((actual.egresos - anterior.egresos) / anterior.egresos) * 100 : 0;
        const variacionIngresos = anterior.ingresos > 0 ? 
            ((actual.ingresos - anterior.ingresos) / anterior.ingresos) * 100 : 0;

        return {
            tendencia: {
                mesActual: actual.mes,
                mesAnterior: anterior.mes,
                ingresosActual: roundToDecimals(actual.ingresos),
                ingresosAnterior: roundToDecimals(anterior.ingresos),
                gastosActual: roundToDecimals(actual.egresos),
                gastosAnterior: roundToDecimals(anterior.egresos),
                variacionGastos: roundToDecimals(variacionGastos, 1),
                variacionIngresos: roundToDecimals(variacionIngresos, 1),
                mensaje: variacionGastos > 0 ?
                    ` Tus gastos aumentaron ${roundToDecimals(variacionGastos, 1)}% respecto al mes anterior` :
                    ` Tus gastos disminuyeron ${Math.abs(roundToDecimals(variacionGastos, 1))}% respecto al mes anterior`,
                tipo: variacionGastos > 0 ? 'advertencia' : 'exito'
            }
        };

    } catch (error) {
        console.error('Error en getTrends:', error);
        return { 
            tendencia: {
                mensaje: 'Error calculando tendencias',
                tipo: 'error'
            }
        };
    }
};

/**
 * Obtener datos para gráficas del dashboard
 */
const getChartData = async (userId, type, period = 'monthly') => {
  const pool = getPool();

  try {
    const saldoData = await GetSaldo(userId);
    if (!saldoData) {
      throw new Error('No se encontró el saldo del usuario');
    }

    const Id_Saldo = saldoData.Id_Saldo;

    if (type === 'expenses') {
      // Gastos por categoría (último mes)
      const result = await pool
        .request()
        .input('Id_Saldo', sql.Int, Id_Saldo)
        .query(`
                    SELECT 
                        c.Nombre as categoria,
                        ISNULL(SUM(m.Monto), 0) as total
                    FROM Movimiento m
                    INNER JOIN Categoria c ON m.Id_Categoria = c.Id_Categoria
                    WHERE m.Id_Saldo = @Id_Saldo
                    AND m.TipoMovimiento = 'Egreso'
                    AND m.FechaMovimiento >= DATEADD(MONTH, -1, GETDATE())
                    GROUP BY c.Id_Categoria, c.Nombre
                    ORDER BY total DESC
                `);

      return {
        tipo: 'gastosPorCategoria',
        datos: result.recordset
      };
    }

    if (type === 'savings') {
      // Evolución de ahorros 
      const result = await pool
        .request()
        .input('Id_Saldo', sql.Int, Id_Saldo)
        .query(`
                    SELECT 
                        FORMAT(FechaCreacion, 'yyyy-MM') as mes,
                        SUM(Monto) as ahorro
                    FROM Ahorro 
                    WHERE Id_Saldo = @Id_Saldo
                    AND FechaCreacion >= DATEADD(MONTH, -6, GETDATE())
                    GROUP BY FORMAT(FechaCreacion, 'yyyy-MM')
                    ORDER BY mes ASC
                `);

      return {
        tipo: 'evolucionAhorro',
        datos: result.recordset
      };
    }

    if (type === 'income') {
      // Ingresos vs Gastos últimos 6 meses
      const result = await pool
        .request()
        .input('Id_Saldo', sql.Int, Id_Saldo)
        .query(`
                    SELECT 
                        FORMAT(FechaMovimiento, 'yyyy-MM') as mes,
                        SUM(CASE WHEN TipoMovimiento = 'Ingreso' THEN Monto ELSE 0 END) as ingresos,
                        SUM(CASE WHEN TipoMovimiento = 'Egreso' THEN Monto ELSE 0 END) as gastos
                    FROM Movimiento 
                    WHERE Id_Saldo = @Id_Saldo
                    AND FechaMovimiento >= DATEADD(MONTH, -6, GETDATE())
                    GROUP BY FORMAT(FechaMovimiento, 'yyyy-MM')
                    ORDER BY mes ASC
                `);

      return {
        tipo: 'ingresosVsGastos',
        datos: result.recordset
      };
    }

    return { tipo: 'desconocido', datos: [] };

  } catch (error) {
    console.error('Error en getChartData:', error);
    throw error;
  }
};

/**
 *  alertas financieras inteligentes
 */
const getAlerts = async (userId) => {
  const pool = getPool();
  const alerts = [];

  try {
    const saldoData = await GetSaldo(userId);
    if (!saldoData) {
      throw new Error('No se encontró el saldo del usuario');
    }

    const Id_Saldo = saldoData.Id_Saldo;
    const saldoActual = saldoData.Monto;

    // Alerta de saldo bajo
    if (saldoActual < 100) {
      alerts.push({
        tipo: 'advertencia',
        mensaje: `Tu saldo actual es bajo: $${roundToDecimals(saldoActual)}`,
        severidad: 'alta'
      });
    }

    // Alerta de gastos altos vs ingresos
    const resumen = await getFinancialSummary(userId);
    const porcentajeGastos = resumen.resumen.totalIngresos > 0 ?
      (resumen.resumen.totalGastos / resumen.resumen.totalIngresos) * 100 : 0;

    if (resumen.resumen.totalGastos > resumen.resumen.totalIngresos * 0.8 && resumen.resumen.totalIngresos > 0) {
      alerts.push({
        tipo: 'advertencia',
        mensaje: `Estás gastando más del 80% de tus ingresos este mes (${roundToDecimals(porcentajeGastos, 1)}%)`,
        severidad: 'media'
      });
    }

    // Alerta de buen porcentaje de ahorro
    const porcentajeAhorro = resumen.resumen.totalIngresos > 0 ?
      (resumen.resumen.ahorroTotal / resumen.resumen.totalIngresos) * 100 : 0;

    if (porcentajeAhorro >= 20) {
      alerts.push({
        tipo: 'exito',
        mensaje: `¡Excelente! Estás ahorrando el ${roundToDecimals(porcentajeAhorro, 1)}% de tus ingresos`,
        severidad: 'baja'
      });
    }

    // Alerta de progreso de objetivos de ahorro
    const objetivosResult = await pool
      .request()
      .input('Id_Saldo', sql.Int, Id_Saldo)
      .query(`
                SELECT 
                    o.Nombre,
                    o.MontoMeta,
                    a.Monto as ahorroActual,
                    (a.Monto / NULLIF(o.MontoMeta, 0)) * 100 as progreso
                FROM Objetivo o
                INNER JOIN Ahorro a ON o.Id_Ahorro = a.Id_Ahorro
                WHERE a.Id_Saldo = @Id_Saldo
            `);

    objetivosResult.recordset.forEach(objetivo => {
      if (objetivo.progreso >= 100) {
        alerts.push({
          tipo: 'exito',
          mensaje: `¡Felicidades! Completaste tu objetivo: ${objetivo.Nombre}`,
          severidad: 'baja'
        });
      } else if (objetivo.progreso >= 75) {
        alerts.push({
          tipo: 'info',
          mensaje: `Estás cerca de completar tu objetivo: ${objetivo.Nombre} (${Math.round(objetivo.progreso)}%)`,
          severidad: 'baja'
        });
      }
    });

    // Alerta si no hay ahorros este mes
    const ahorrosMesResult = await pool
      .request()
      .input('Id_Saldo', sql.Int, Id_Saldo)
      .query(`
                SELECT COUNT(*) as totalAhorros
                FROM Ahorro 
                WHERE Id_Saldo = @Id_Saldo
                AND MONTH(FechaCreacion) = MONTH(GETDATE())
                AND YEAR(FechaCreacion) = YEAR(GETDATE())
            `);

    if (ahorrosMesResult.recordset[0].totalAhorros === 0) {
      alerts.push({
        tipo: 'info',
        mensaje: 'No has registrado ahorros este mes. ¡Considera empezar!',
        severidad: 'baja'
      });
    }

    //Mensaje positivo si todo está bien
    if (alerts.length === 0) {
      alerts.push({
        tipo: 'exito',
        mensaje: '¡Excelente! Tu salud financiera se ve muy bien este mes.',
        severidad: 'baja'
      });
    }

    return alerts;

  } catch (error) {
    console.error('Error en getAlerts:', error);
    throw error;
  }
};

/**
 *  organizaciones
 */

/**
 * Obtener datos de la organización del usuario
 */
const getOrganizacionData = async (userId) => {
    const pool = getPool();
    
    const result = await pool
        .request()
        .input('Id_Usuario', sql.Int, userId)
        .query(`
            SELECT 
                o.Id_Organizacion,
                o.Nombre as NombreOrganizacion,
                u.Rol
            FROM Usuario u
            INNER JOIN Organizacion o ON u.Id_Organizacion = o.Id_Organizacion
            WHERE u.Id_Usuario = @Id_Usuario
        `);

    return result.recordset[0];
};

/**
 * Obtener todos los miembros de la organización
 */
const getMiembrosOrganizacion = async (Id_Organizacion) => {
    const pool = getPool();
    
    const result = await pool
        .request()
        .input('Id_Organizacion', sql.Int, Id_Organizacion)
        .query(`
            SELECT 
                u.Id_Usuario,
                u.Nombre,
                u.Rol,
                u.Correo,
                s.Monto as SaldoActual
            FROM Usuario u
            INNER JOIN Saldo s ON u.Id_Usuario = s.Id_Usuario
            WHERE u.Id_Organizacion = @Id_Organizacion
            ORDER BY 
                CASE WHEN u.Rol = 'Administrador' THEN 1 ELSE 2 END,
                u.Nombre
        `);

    return result.recordset;
};

/**
 * Obtener resumen financiero de toda la organización
 */
const getResumenOrganizacion = async (Id_Organizacion) => {
    const pool = getPool();
    
    try {
        // Totales de la organización
        const totalesResult = await pool
            .request()
            .input('Id_Organizacion', sql.Int, Id_Organizacion)
            .query(`
                SELECT 
                    COUNT(DISTINCT u.Id_Usuario) as TotalMiembros,
                    SUM(s.Monto) as SaldoTotal,
                    SUM(a.Monto) as AhorroTotal,
                    ISNULL(SUM(CASE WHEN m.TipoMovimiento = 'Ingreso' THEN m.Monto ELSE 0 END), 0) as IngresosMes,
                    ISNULL(SUM(CASE WHEN m.TipoMovimiento = 'Egreso' THEN m.Monto ELSE 0 END), 0) as GastosMes
                FROM Usuario u
                INNER JOIN Saldo s ON u.Id_Usuario = s.Id_Usuario
                LEFT JOIN Ahorro a ON s.Id_Saldo = a.Id_Saldo
                LEFT JOIN Movimiento m ON s.Id_Saldo = m.Id_Saldo
                    AND MONTH(m.FechaMovimiento) = MONTH(GETDATE())
                    AND YEAR(m.FechaMovimiento) = YEAR(GETDATE())
                WHERE u.Id_Organizacion = @Id_Organizacion
            `);

        // Gastos por categoría en la organización
        const gastosCategoriaResult = await pool
            .request()
            .input('Id_Organizacion', sql.Int, Id_Organizacion)
            .query(`
                SELECT 
                    c.Nombre as Categoria,
                    SUM(m.Monto) as Total,
                    COUNT(*) as CantidadTransacciones
                FROM Movimiento m
                INNER JOIN Saldo s ON m.Id_Saldo = s.Id_Saldo
                INNER JOIN Usuario u ON s.Id_Usuario = u.Id_Usuario
                INNER JOIN Categoria c ON m.Id_Categoria = c.Id_Categoria
                WHERE u.Id_Organizacion = @Id_Organizacion
                AND m.TipoMovimiento = 'Egreso'
                AND MONTH(m.FechaMovimiento) = MONTH(GETDATE())
                AND YEAR(m.FechaMovimiento) = YEAR(GETDATE())
                GROUP BY c.Id_Categoria, c.Nombre
                ORDER BY Total DESC
            `);

        // Miembros con más gastos este mes
        const topGastadoresResult = await pool
            .request()
            .input('Id_Organizacion', sql.Int, Id_Organizacion)
            .query(`
                SELECT TOP 3
                    u.Nombre,
                    SUM(m.Monto) as TotalGastado
                FROM Movimiento m
                INNER JOIN Saldo s ON m.Id_Saldo = s.Id_Saldo
                INNER JOIN Usuario u ON s.Id_Usuario = u.Id_Usuario
                WHERE u.Id_Organizacion = @Id_Organizacion
                AND m.TipoMovimiento = 'Egreso'
                AND MONTH(m.FechaMovimiento) = MONTH(GETDATE())
                AND YEAR(m.FechaMovimiento) = YEAR(GETDATE())
                GROUP BY u.Id_Usuario, u.Nombre
                ORDER BY TotalGastado DESC
            `);

        const totales = totalesResult.recordset[0];
        const balanceNeto = totales.IngresosMes - totales.GastosMes;
        const porcentajeAhorro = totales.IngresosMes > 0 ? 
            (totales.AhorroTotal / totales.IngresosMes) * 100 : 0;

        return {
            resumen: {
                totalMiembros: totales.TotalMiembros,
                saldoTotal: roundToDecimals(totales.SaldoTotal),
                ahorroTotal: roundToDecimals(totales.AhorroTotal),
                ingresosMes: roundToDecimals(totales.IngresosMes),
                gastosMes: roundToDecimals(totales.GastosMes),
                balanceNeto: roundToDecimals(balanceNeto),
                porcentajeAhorro: roundToDecimals(porcentajeAhorro, 1)
            },
            analisis: {
                gastosPorCategoria: gastosCategoriaResult.recordset.map(item => ({
                    categoria: item.Categoria,
                    total: roundToDecimals(item.Total),
                    cantidadTransacciones: item.CantidadTransacciones
                })),
                topGastadores: topGastadoresResult.recordset.map(item => ({
                    nombre: item.Nombre,
                    totalGastado: roundToDecimals(item.TotalGastado)
                }))
            }
        };

    } catch (error) {
        console.error('Error en getResumenOrganizacion:', error);
        throw error;
    }
};

/**
 *  Obtener alertas para la organización
 */
const getAlertasOrganizacion = async (Id_Organizacion, userId) => {
    const pool = getPool();
    const alertas = [];

    try {
        const resumenOrg = await getResumenOrganizacion(Id_Organizacion);
        const miembros = await getMiembrosOrganizacion(Id_Organizacion);

        // Alerta si el balance de la organización es negativo
        if (resumenOrg.resumen.balanceNeto < 0) {
            alertas.push({
                tipo: 'advertencia',
                mensaje: ` La organización tiene balance negativo este mes: $${resumenOrg.resumen.balanceNeto}`,
                severidad: 'alta',
                ambito: 'organizacion'
            });
        }

        // Alerta si hay miembros con saldo muy bajo
        const miembrosSaldoBajo = miembros.filter(m => m.SaldoActual < 50);
        if (miembrosSaldoBajo.length > 0) {
            alertas.push({
                tipo: 'advertencia',
                mensaje: `${miembrosSaldoBajo.length} miembro(s) tienen saldo bajo (< $50)`,
                severidad: 'media',
                ambito: 'organizacion',
                detalles: miembrosSaldoBajo.map(m => m.Nombre)
            });
        }

        // Alerta de buen manejo grupal
        if (resumenOrg.resumen.porcentajeAhorro >= 15) {
            alertas.push({
                tipo: 'exito',
                mensaje: `🎉 ¡Excelente! La organización está ahorrando el ${resumenOrg.resumen.porcentajeAhorro}% de los ingresos`,
                severidad: 'baja',
                ambito: 'organizacion'
            });
        }

        // Alerta si hay muchos gastos en una categoría
        const categoriaAlta = resumenOrg.analisis.gastosPorCategoria.find(g => g.total > resumenOrg.resumen.ingresosMes * 0.4);
        if (categoriaAlta) {
            alertas.push({
                tipo: 'info',
                mensaje: ` Alta concentración en ${categoriaAlta.categoria}: ${categoriaAlta.total} (${Math.round((categoriaAlta.total / resumenOrg.resumen.ingresosMes) * 100)}% de ingresos)`,
                severidad: 'media',
                ambito: 'organizacion'
            });
        }

        return alertas;

    } catch (error) {
        console.error('Error en getAlertasOrganizacion:', error);
        return [];
    }
};


/**
 *  Obtener todos los datos del dashboard 
 */
const getDashboardData = async (userId) => {
    try {
        //  Obtener datos personales 
        const [summary, expensesChart, savingsChart, alerts, trends] = await Promise.all([
            getFinancialSummary(userId),
            getChartData(userId, 'expenses'),
            getChartData(userId, 'savings'),
            getAlerts(userId),
            getTrends(userId)
        ]);

        const tendenciasData = typeof trends === 'object' && trends.tendencia ? trends.tendencia : trends;

        // Estructura base del dashboard
        const dashboardData = {
            usuario: summary.usuario,
            resumen: summary.resumen,
            detalle: summary.detalle,
            graficas: {
                gastosPorCategoria: expensesChart.datos,
                evolucionAhorro: savingsChart.datos
            },
            alertas: alerts,
            tendencias: tendenciasData
        };

        //  Verificar si el usuario pertenece a una organización
        const organizacionData = await getOrganizacionData(userId);
        
        if (organizacionData && organizacionData.Id_Organizacion) {
            //  Si tiene organización, agregar datos organizacionales
            const [miembros, resumenOrg, alertasOrg] = await Promise.all([
                getMiembrosOrganizacion(organizacionData.Id_Organizacion),
                getResumenOrganizacion(organizacionData.Id_Organizacion),
                getAlertasOrganizacion(organizacionData.Id_Organizacion, userId)
            ]);

            dashboardData.organizacion = {
                id: organizacionData.Id_Organizacion,
                nombre: organizacionData.NombreOrganizacion,
                rolUsuario: organizacionData.Rol,
                miembros: miembros.map(m => ({
                    id: m.Id_Usuario,
                    nombre: m.Nombre,
                    rol: m.Rol,
                    saldoActual: roundToDecimals(m.SaldoActual)
                })),
                resumen: resumenOrg.resumen,
                analisis: resumenOrg.analisis
            };

            // alertas personales + organizacionales en caso que existan
            dashboardData.alertas = [...alerts, ...alertasOrg];
        }

        return dashboardData;

    } catch (error) {
        console.error('Error en getDashboardData:', error);
        throw error;
    }
};


module.exports = {
  getFinancialSummary,
  getChartData,
  getAlerts,
  getDashboardData,
  getTrends
};