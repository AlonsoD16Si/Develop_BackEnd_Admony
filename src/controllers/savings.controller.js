const savingsService = require('../services/savings.service');

/**
 * Crear un nuevo ahorro/objetivo
 */
const createSaving = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const savingData = req.body;

        const result = await savingsService.createSaving(userId, savingData);

        res.status(201).json({
            success: true,
            message: 'Ahorro registrado exitosamente',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener todos los ahorros del usuario
 */
const getSavings = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const savings = await savingsService.getSavings(userId);

        res.status(200).json({
            success: true,
            data: savings,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener un ahorro específico
 */
const getSavingById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const saving = await savingsService.getSavingById(userId, id);

        res.status(200).json({
            success: true,
            data: saving,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar un ahorro
 */
const updateSaving = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updateData = req.body;

        const result = await savingsService.updateSaving(userId, id, updateData);

        res.status(200).json({
            success: true,
            message: 'Ahorro actualizado exitosamente',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar un ahorro
 */
const deleteSaving = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await savingsService.deleteSaving(userId, id);

        res.status(200).json({
            success: true,
            message: 'Ahorro eliminado exitosamente',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener progreso de ahorros
 */
const getSavingsProgress = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const progress = await savingsService.getSavingsProgress(userId);

        res.status(200).json({
            success: true,
            data: progress,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSaving,
    getSavings,
    getSavingById,
    updateSaving,
    deleteSaving,
    getSavingsProgress,
};

