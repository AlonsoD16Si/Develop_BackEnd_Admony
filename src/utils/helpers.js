/**
 * Funciones auxiliares y helpers
 */

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (USD, MXN, etc.)
 * @returns {string} Cantidad formateada
 */
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

/**
 * Formatea una fecha
 * @param {Date|string} date - Fecha a formatear
 * @param {string} locale - Locale para el formato
 * @returns {string} Fecha formateada
 */
const formatDate = (date, locale = 'es-MX') => {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
};

/**
 * Calcula el porcentaje
 * @param {number} part - Parte del total
 * @param {number} total - Total
 * @returns {number} Porcentaje
 */
const calculatePercentage = (part, total) => {
    if (total === 0) return 0;
    return (part / total) * 100;
};

/**
 * Genera un código aleatorio
 * @param {number} length - Longitud del código
 * @returns {string} Código generado
 */
const generateRandomCode = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};

/**
 * Valida si una fecha está en el futuro
 * @param {Date|string} date - Fecha a validar
 * @returns {boolean} True si está en el futuro
 */
const isFutureDate = (date) => {
    return new Date(date) > new Date();
};

/**
 * Obtiene el primer día del mes actual
 * @returns {Date} Primer día del mes
 */
const getFirstDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Obtiene el último día del mes actual
 * @returns {Date} Último día del mes
 */
const getLastDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
};

/**
 * Sanitiza un string para evitar inyecciones
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
const sanitizeString = (str) => {
    return str.trim().replace(/[<>]/g, '');
};

/**
 * Verifica si un email es válido
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Redondea un número a decimales específicos
 * @param {number} num - Número a redondear
 * @param {number} decimals - Cantidad de decimales
 * @returns {number} Número redondeado
 */
const roundToDecimals = (num, decimals = 2) => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

module.exports = {
    formatCurrency,
    formatDate,
    calculatePercentage,
    generateRandomCode,
    isFutureDate,
    getFirstDayOfMonth,
    getLastDayOfMonth,
    sanitizeString,
    isValidEmail,
    roundToDecimals,
};

