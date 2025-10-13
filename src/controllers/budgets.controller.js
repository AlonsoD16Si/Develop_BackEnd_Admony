const budgetsService = require('../services/budgets.service');

/**
 * Crear un nuevo presupuesto
 */
const createBudget = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const budgetData = req.body;

        const result = await budgetsService.createBudget(userId, budgetData);

        res.status(201).json({
            success: true,
            message: 'Presupuesto creado exitosamente',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener todos los presupuestos del usuario
 */
const getBudgets = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const budgets = await budgetsService.getBudgets(userId);

        res.status(200).json({
            success: true,
            data: budgets,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener un presupuesto específico
 */
const getBudgetById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const budget = await budgetsService.getBudgetById(userId, id);

        res.status(200).json({
            success: true,
            data: budget,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar un presupuesto
 */
const updateBudget = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updateData = req.body;

        const result = await budgetsService.updateBudget(userId, id, updateData);

        res.status(200).json({
            success: true,
            message: 'Presupuesto actualizado exitosamente',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar un presupuesto
 */
const deleteBudget = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await budgetsService.deleteBudget(userId, id);

        res.status(200).json({
            success: true,
            message: 'Presupuesto eliminado exitosamente',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener análisis de cumplimiento de presupuestos
 */
const getBudgetAnalysis = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;

        const analysis = await budgetsService.getBudgetAnalysis(userId, { month, year });

        res.status(200).json({
            success: true,
            data: analysis,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getBudgetAnalysis,
};

