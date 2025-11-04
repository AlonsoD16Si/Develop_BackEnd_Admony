const dashboardService = require('../services/dashboard.service');

/**
 * Obtener resumen financiero del usuario
 */
const getFinancialSummary = async (req, res, next) => {
  try {
    const userId = req.user.Id_Usuario;
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
 * Obtener datos para gráficas del dashboard
 */
const getChartData = async (req, res, next) => {
  try {
    const userId = req.user.Id_Usuario;
    const { type, period } = req.query;

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
 * Obtener alertas financieras del usuario
 */
const getAlerts = async (req, res, next) => {
  try {
    const userId = req.user.Id_Usuario;
    const alerts = await dashboardService.getAlerts(userId);

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los datos del dashboard
 */
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.Id_Usuario;
    const dashboardData = await dashboardService.getDashboardData(userId);

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFinancialSummary,
  getChartData,
  getAlerts,
  getDashboardData
};