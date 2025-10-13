const dashboardService = require('../services/dashboard.service');

/**
 * Obtener resumen financiero del usuario
 */
const getFinancialSummary = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const summary = await dashboardService.getFinancialSummary(userId);

        res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener datos para gráficas
 */
const getChartData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { type, period } = req.query; // type: expenses, savings, income | period: weekly, monthly, yearly

        const chartData = await dashboardService.getChartData(userId, type, period);

        res.status(200).json({
            success: true,
            data: chartData,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener alertas y notificaciones
 */
const getAlerts = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const alerts = await dashboardService.getAlerts(userId);

        res.status(200).json({
            success: true,
            data: alerts,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFinancialSummary,
    getChartData,
    getAlerts,
};

