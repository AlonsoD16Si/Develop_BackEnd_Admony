require('dotenv').config();
const sql = require('mssql');

const hasInstance = !!process.env.DB_INSTANCE;

const config = {
    server: process.env.DB_SERVER || '127.0.0.1',
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ...(hasInstance ? {} : { port: Number(process.env.DB_PORT || 1433) }),
    options: {
        encrypt: (process.env.DB_ENCRYPT || 'false') === 'true',
        trustServerCertificate: true,
        ...(hasInstance ? { instanceName: process.env.DB_INSTANCE } : {}),
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let poolPromise;

async function connectDB() {
    if (!poolPromise) poolPromise = sql.connect(config);
    const pool = await poolPromise;
    await pool.request().query('SELECT 1');
    console.log('✅ Conectado a SQL Server:', {
        server: config.server,
        database: config.database,
        instance: process.env.DB_INSTANCE || null,
        port: config.port || null,
        encrypt: config.options.encrypt,
        tsc: config.options.trustServerCertificate,
    });
    return pool;
}

function getPool() {
    if (!poolPromise) poolPromise = sql.connect(config);
    return poolPromise;
}

module.exports = { connectDB, getPool, sql };
