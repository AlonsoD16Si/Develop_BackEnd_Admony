/**
 * Constantes de la aplicación
 */

// Roles de usuario
const USER_ROLES = {
    USUARIO: 'usuario',
    ADMIN: 'administrador',
    PADRE: 'padre',
};

// Categorías de gastos predeterminadas
const EXPENSE_CATEGORIES = [
    'Alimentación',
    'Transporte',
    'Vivienda',
    'Servicios',
    'Entretenimiento',
    'Salud',
    'Educación',
    'Ropa',
    'Tecnología',
    'Otros',
];

// Tipos de gastos
const EXPENSE_TYPES = {
    UNICO: 'unico',
    RECURRENTE: 'recurrente',
};

// Períodos de presupuesto
const BUDGET_PERIODS = {
    SEMANAL: 'semanal',
    MENSUAL: 'mensual',
    ANUAL: 'anual',
};

// Tipos de alertas
const ALERT_TYPES = {
    PRESUPUESTO_EXCEDIDO: 'presupuesto_excedido',
    PRESUPUESTO_ALERTA: 'presupuesto_alerta',
    OBJETIVO_ALCANZADO: 'objetivo_alcanzado',
    PAGO_PENDIENTE: 'pago_pendiente',
};

// Mensajes de error comunes
const ERROR_MESSAGES = {
    UNAUTHORIZED: 'No autorizado. Por favor, inicia sesión.',
    FORBIDDEN: 'No tienes permisos para acceder a este recurso.',
    NOT_FOUND: 'Recurso no encontrado.',
    VALIDATION_ERROR: 'Error de validación en los datos enviados.',
    SERVER_ERROR: 'Error interno del servidor. Intenta nuevamente más tarde.',
    INVALID_CREDENTIALS: 'Credenciales inválidas.',
    EMAIL_EXISTS: 'El email ya está registrado.',
};

// Mensajes de éxito comunes
const SUCCESS_MESSAGES = {
    CREATED: 'Recurso creado exitosamente.',
    UPDATED: 'Recurso actualizado exitosamente.',
    DELETED: 'Recurso eliminado exitosamente.',
    LOGIN_SUCCESS: 'Inicio de sesión exitoso.',
    REGISTER_SUCCESS: 'Usuario registrado exitosamente.',
};

module.exports = {
    USER_ROLES,
    EXPENSE_CATEGORIES,
    EXPENSE_TYPES,
    BUDGET_PERIODS,
    ALERT_TYPES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
};

