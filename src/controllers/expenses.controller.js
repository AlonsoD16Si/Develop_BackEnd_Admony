const expensesService = require('../services/expenses.service');

/**
 * Crear un nuevo gasto
 */
const createExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const expenseData = req.body;
    const result = await expensesService.createExpense(userId, expenseData);

    res.status(201).json({
      success: true,
      message: 'Gasto registrado exitosamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los gastos del usuario
 */
const getExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category } = req.query;

    const expenses = await expensesService.getExpenses(userId, { startDate, endDate, category });

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};
const getIngresos = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category } = req.query;

    const expenses = await expensesService.getIngresos(userId, { startDate, endDate, category });

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

const getMovmentsOrganization = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const expenses = await expensesService.getMovmentsOrganization(userId);

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};
const getMontosOrganization = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const expenses = await expensesService.getMontosOrganization(userId);

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un gasto específico
 */
const getExpenseById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const expense = await expensesService.getExpenseById(userId, id);

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar un gasto
 */
const updateExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    const result = await expensesService.updateExpense(userId, id, updateData);

    res.status(200).json({
      success: true,
      message: 'Gasto actualizado exitosamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un gasto
 */
const deleteExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await expensesService.deleteExpense(userId, id);

    res.status(200).json({
      success: true,
      message: 'Gasto eliminado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de gastos
 */
const getExpenseStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period } = req.query; // monthly, yearly

    const stats = await expensesService.getExpenseStats(userId, period);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getIngresos,
  getMovmentsOrganization,
  getMontosOrganization,
};
