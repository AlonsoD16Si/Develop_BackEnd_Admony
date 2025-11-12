const { getPool, sql } = require('../config/database');
const { GetSaldo } = require('./expenses.service')
const { GetAhorro } = require('../utils/helpers')

/**
 * Crear un nuevo ahorro/objetivo
 */
const createSaving = async (userId, savingData) => {
  const pool = getPool();
  const { monto } = savingData;
  const data = await GetSaldo(userId)
  const saldoActual = parseFloat(data[0].monto);
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    const request = new sql.Request(transaction);
    request.input('Id_Saldo', sql.Int, data[0].Id_Saldo)
    request.input('Monto', sql.Float, monto)
    const insertResult = await request.query(`
      INSERT INTO Ahorro (Id_Saldo, Monto)
      OUTPUT INSERTED.*
      VALUES (@Id_Saldo, @Monto)
    `);

    const updateRequest = new sql.Request(transaction);
    updateRequest.input('Id_Saldo', sql.Int, data[0].Id_Saldo);
    updateRequest.input('Monto', sql.Decimal(10, 2), monto);

    if (monto < saldoActual) {
      await updateRequest.query(`
                  UPDATE Saldo
                  SET Monto = Monto + @Monto
                  WHERE Id_Saldo = @Id_Saldo
              `);
    } else {
      throw new Error('No hay suficiente saldo');
    }

    await transaction.commit();
    return insertResult.recordset[0];
  } catch (err) {
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error('Error al hacer rollback:', rollbackErr.message);
    }

    console.error('Error en createExpense:', err);
    throw new Error('No se pudo registrar el gasto');
  }

};

/**
 * Obtener todos los ahorros del usuario
 */
const getSavings = async (userId) => {
  const pool = getPool();

  const data = await GetSaldo(userId);
  const result = await pool
    .request()
    .input('Id_Saldo', sql.Int, data[0].Id_Saldo)
    .query('SELECT * FROM Ahorro WHERE Id_Saldo = @Id_Saldo ORDER BY FechaCreacion DESC');

  return result.recordset;
};


const getObjectives = async (userId) => {
  const pool = getPool();

  const data = await GetSaldo(userId);
  const id_Ahorro = await GetAhorro(data[0].Id_Saldo);

  let query = `SELECT 
                o.Id_Objetivo,
                o.Id_Ahorro,
                o.Nombre, 
                o.MontoMeta, 
                o.Descripcion,
                a.Monto
              FROM 
              Objetivo AS O 
              LEFT JOIN Ahorro AS a 
              ON a.Id_Ahorro = @Id_Ahorro;`;
  const request = pool.request().input('Id_Ahorro', sql.Int, id_Ahorro[0].Id_Ahorro);
  const result = await request.query(query)

  return result.recordset;
}

const createObjective = async (userId, savingData) => {
  const pool = getPool();
  const { id_Ahorro, nombre, descripcion, montoMeta } = savingData;

  const result = await pool
    .request()
    .input('Id_Ahorro', sql.Int, id_Ahorro)
    .input('Nombre', sql.VarChar, nombre)
    .input('Descripcion', sql.VarChar, descripcion)
    .input('MontoMeta', sql.Float, montoMeta)
    .query(`
      INSERT INTO Objetivo (Id_Ahorro, Nombre, Descripcion, MontoMeta)
      OUTPUT INSERTED.Id_Objetivo
      VALUES (@Id_Ahorro, @Nombre, @Descripcion, @MontoMeta)
    `);

  return result.recordset
}


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
const updateSaving = async (userId, updateData) => {
  const pool = getPool();
  const data = await GetSaldo(userId)
  const saldoActual = parseFloat(data[0].monto);
  const { id_Ahorro, monto } = updateData;

  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const request = new sql.Request(transaction);
    request.input('Monto', sql.Decimal, monto)
    request.input('Id_Ahorro', sql.Int, id_Ahorro)
    const insertResult = await request.query(`
        UPDATE Ahorro
        SET Monto = Monto + @Monto 
        WHERE Id_Ahorro = @Id_Ahorro 
      `);
    const updateRequest = new sql.Request(transaction);
    updateRequest.input('Id_Saldo', sql.Int, data[0].Id_Saldo);
    updateRequest.input('Monto', sql.Decimal(10, 2), monto);

    if (monto < saldoActual) {
      await updateRequest.query(`
                  UPDATE Saldo
                  SET Monto = Monto - @Monto
                  WHERE Id_Saldo = @Id_Saldo
              `);
    } else {
      throw new Error('No hay suficiente saldo');
    }

    await transaction.commit();
    return insertResult.rowsAffected;
  } catch (err) {
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error('Error al hacer rollback:', rollbackErr.message);
    }

    console.error('Error en createExpense:', err);
    throw new Error('No se pudo registrar el gasto');
  }

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

  const result = await pool.request().input('userId', sql.Int, userId).query(`
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
  getObjectives,
  createObjective
};
