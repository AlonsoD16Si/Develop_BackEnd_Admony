const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Para Azure
        trustServerCertificate: process.env.NODE_ENV === 'development',
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

let pool;

const connectDB = async () => {
    try {
        pool = await sql.connect(config);
        console.log('✅ Conexión exitosa a SQL Server');
        return pool;
    } catch (error) {
        console.error('❌ Error al conectar con SQL Server:', error);
        process.exit(1);
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error('La conexión a la base de datos no ha sido inicializada');
    }
    return pool;
};

module.exports = {
    connectDB,
    getPool,
    sql,
};

