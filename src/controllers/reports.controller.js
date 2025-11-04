// controllers/reports.controller.js
const reportsService = require('../services/reports.service');

/**
 * GET /api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
const getFinancialSummary = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { from, to } = req.query;

        const data = await reportsService.getFinancialSummary(userId, { from, to });

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/reports/cashflow/monthly?year=2025
 */
const getMonthlyCashflow = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { year } = req.query;

        const data = await reportsService.getMonthlyCashflow(userId, { year: Number(year) });

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/reports/categories?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
const getCategoryBreakdown = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { from, to } = req.query;

        const data = await reportsService.getCategoryBreakdown(userId, { from, to });

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/reports/recurrings?months=6
 */
const getRecurringPayments = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const months = req.query.months ? Number(req.query.months) : 6;

        const data = await reportsService.getRecurringPayments(userId, { months });

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/reports/savings
 */
const getSavingsOverview = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const data = await reportsService.getSavingsOverview(userId);

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/reports/extras?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
const getExtrasSummary = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { from, to } = req.query;

        const data = await reportsService.getExtrasSummary(userId, { from, to });

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getFinancialSummary,
    getMonthlyCashflow,
    getCategoryBreakdown,
    getRecurringPayments,
    getSavingsOverview,
    getExtrasSummary,
};
