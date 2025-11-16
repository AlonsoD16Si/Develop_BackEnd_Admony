// controllers/reports.controller.js
const reportsService = require('../services/reports.service');
const { getUserIdFromReq } = require('../utils/helpers');
const getFinancialSummary = async (req, res, next) => {
    try {
        console.log('req.user en getFinancialSummary:', req.user);
        const userId = getUserIdFromReq(req);
        console.log('userId que se manda al service:', userId);

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

        const result = await reportsService.getFinancialSummary(userId, req.query);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

const getMonthlyCashflow = async (req, res, next) => {
    try {
        const userId = getUserIdFromReq(req);
        const { year } = req.query;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

        const data = await reportsService.getMonthlyCashflow(userId, { year: Number(year) });
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

const getCategoryBreakdown = async (req, res, next) => {
    try {
        const userId = getUserIdFromReq(req);
        const { from, to } = req.query;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

        const data = await reportsService.getCategoryBreakdown(userId, { from, to });
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

const getRecurringPayments = async (req, res, next) => {
    try {
        const userId = getUserIdFromReq(req);
        const months = req.query.months ? Number(req.query.months) : 6;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

        const data = await reportsService.getRecurringPayments(userId, { months });
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

const getSavingsOverview = async (req, res, next) => {
    try {
        const userId = getUserIdFromReq(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

        const data = await reportsService.getSavingsOverview(userId);
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

const getExtrasSummary = async (req, res, next) => {
    try {
        const userId = getUserIdFromReq(req);
        const { from, to } = req.query;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

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
