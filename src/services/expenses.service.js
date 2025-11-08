const { getPool, sql } = require('../config/database');

/**
 * Crear un nuevo gasto
 */
const createExpense = async (Id_Usuario, expenseData) => {
  const pool = getPool();
  const data = await GetSaldo(Id_Usuario);
  const { monto, id_categoria, descripcion, tipomovimiento } = expenseData;

  if (!data || data.length === 0) {
    throw new Error('No se encontró el saldo del usuario');
  }

  const saldoActual = parseFloat(data[0].monto);

  if (isNaN(monto) || monto <= 0) {
    throw new Error('El monto debe ser un número positivo');
  }

  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const request = new sql.Request(transaction);
    request.input('Id_Saldo', sql.Int, data[0].Id_Saldo);
    request.input('Monto', sql.Decimal(10, 2), monto);
    request.input('Id_Categoria', sql.Int, id_categoria);
    request.input('Descripcion', sql.VarChar, descripcion || null);
    request.input('TipoMovimiento', sql.VarChar, tipomovimiento);

    const insertResult = await request.query(`
            INSERT INTO Movimiento (Id_Saldo, Id_Categoria, TipoMovimiento, Monto, Descripcion)
            OUTPUT INSERTED.*
            VALUES (@Id_Saldo, @Id_Categoria, @TipoMovimiento, @Monto, @Descripcion)
        `);

    const updateRequest = new sql.Request(transaction);
    updateRequest.input('Id_Saldo', sql.Int, data[0].Id_Saldo);
    updateRequest.input('Monto', sql.Decimal(10, 2), monto);

    if (tipomovimiento === 'Ingreso') {
      await updateRequest.query(`
                UPDATE Saldo
                SET Monto = Monto + @Monto
                WHERE Id_Saldo = @Id_Saldo
            `);
    } else if (tipomovimiento === 'Egreso') {
      if (monto > saldoActual) {
        throw new Error('No hay suficiente saldo');
      }
      await updateRequest.query(`
                UPDATE Saldo
                SET Monto = Monto - @Monto
                WHERE Id_Saldo = @Id_Saldo
            `);
    }

    await transaction.commit();
    return insertResult.recordset[0];
  } catch (err) {
    try {
      await transaction.rollback(); // rollback solo si se inició correctamente
    } catch (rollbackErr) {
      console.error('Error al hacer rollback:', rollbackErr.message);
    }

    console.error('Error en createExpense:', err);
    throw new Error('No se pudo registrar el gasto');
  }
};

const GetSaldo = async (id) => {
  const pool = getPool();
  let query = `SELECT Id_Saldo, monto FROM Saldo WHERE Id_Usuario = @Id_Usuario`;
  const request = pool.request().input('Id_Usuario', sql.Int, id);
  const result = await request.query(query);
  return result.recordset;
};

/* Obtener gastos */
const getExpenses = async (Id_Usuario, filters = {}) => {
  const data = await GetSaldo(Id_Usuario);
  const pool = getPool();

  let query = `SELECT Id_Movimiento, c.nombre AS Categoria, TipoMovimiento, Monto, m.Descripcion, FechaMovimiento, c.Descripcion AS Cat_desc
        FROM Movimiento AS m
        LEFT JOIN Categoria AS c ON c.Id_Categoria = m.Id_Categoria
		    WHERE TipoMovimiento = 'Egreso' and Id_Saldo = @Id_Saldo
        ORDER BY FechaMovimiento DESC `;
  const request = pool.request().input('Id_Saldo', sql.Int, data[0].Id_Saldo);

  const result = await request.query(query);
  console.log(result);
  return result.recordset;
};

const getIngresos = async (Id_Usuario, filters = {}) => {
  const data = await GetSaldo(Id_Usuario);
  const pool = getPool();

  let query = `SELECT Id_Movimiento, c.nombre AS Categoria, TipoMovimiento, Monto, m.Descripcion, FechaMovimiento, c.Descripcion AS Cat_desc
        FROM Movimiento AS m
        LEFT JOIN Categoria AS c ON c.Id_Categoria = m.Id_Categoria
		    WHERE TipoMovimiento = 'Ingreso' and Id_Saldo = @Id_Saldo
        ORDER BY FechaMovimiento DESC`;
  const request = pool.request().input('Id_Saldo', sql.Int, data[0].Id_Saldo);

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
  const data = await GetSaldo(Id_Usuario);
  // Implementar lógica según el período
  const result = await pool.request().input('Id_Saldo', sql.Int, data[0].Id_Saldo).query(`
      SELECT 
        categoria,
        SUM(monto) as total,
        COUNT(*) as cantidad
      FROM Movimiento
      WHERE Id_Saldo = @Id_Saldo
        AND FechaMovimiento >= DATEADD(month, -1, GETDATE())
      FROM Movimiento
      WHERE Id_Saldo = @Id_Saldo
        AND FechaMovimiento >= DATEADD(month, -1, GETDATE())
      GROUP BY categoria
      ORDER BY total DESC
    `);

  return result.recordset;
};

const GetOrgaId = async (id) => {
  const pool = getPool();
  let query = `SELECT Id_Organizacion FROM Usuario WHERE Id_Usuario = @Id_Usuario`;
  const request = pool.request().input('Id_Usuario', sql.Int, id);
  const result = await request.query(query);
  return result.recordset;
};
const GetUserIdByOrga = async (id) => {
  const pool = getPool();
  let query = `SELECT Id_Usuario FROM Usuario WHERE Id_Organizacion = @Id_Organizacion`;
  const request = pool.request().input('Id_Organizacion', sql.Int, id);
  const result = await request.query(query);
  return result.recordset;
};

const getMovmentsOrganization = async (Id_Usuario) => {
  const pool = getPool();
  let result = [];
  const id_org = await GetOrgaId(Id_Usuario);
  const users = await GetUserIdByOrga(id_org[0].Id_Organizacion);
  try {
    for (us in users) {
      const saldo = await GetSaldo(users[us].Id_Usuario);
      let query = `SELECT * FROM  Movimiento WHERE Id_Saldo = @Id_Saldo`;
      const req = pool.request().input('Id_Saldo', sql.Int, saldo[0].Id_Saldo);
      const fin = await req.query(query);
      result.push(fin.recordset);
    }

    return result;
  } catch (error) {
    console.error('Error en createExpense:', error);
    throw new Error('No se pudo traer la información de la organización');
  }
};

const getMontosOrganization = async (Id_Usuario) => {
  const pool = getPool();
  let result = [];
  const id_org = await GetOrgaId(Id_Usuario);
  const users = await GetUserIdByOrga(id_org[0].Id_Organizacion);
  try {
    for (us in users) {
      const saldo = await GetSaldo(users[us].Id_Usuario);
      result.push(saldo[0].monto);
    }

    return result;
  } catch (error) {
    console.error('Error en createExpense:', error);
    throw new Error('No se pudo traer la información de la organización');
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  deleteExpense,
  getExpenseStats,
  getIngresos,
  getMovmentsOrganization,
  GetSaldo,
  getMontosOrganization,
};
