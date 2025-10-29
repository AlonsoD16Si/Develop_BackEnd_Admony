require('dotenv').config();
const sql = require('mssql');

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset}`, msg),
    success: (msg) => console.log(`${colors.green}✅${colors.reset}`, msg),
    error: (msg) => console.log(`${colors.red}❌${colors.reset}`, msg),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset}`, msg)
};

console.log('\n' + '='.repeat(60));
console.log(`${colors.cyan}🔍 Test de Conexión a SQL Server${colors.reset}`);
console.log('='.repeat(60) + '\n');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    instanceName: process.env.DB_INSTANCE, // 👈 esta línea es clave
  },
  connectionTimeout: 10000,
  requestTimeout: 10000,
};


// Verificar variables de entorno
log.info('Verificando variables de entorno...');

const requiredVars = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_NAME'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    log.error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
    log.warning('Asegúrate de tener un archivo .env configurado.');
    process.exit(1);
}

log.success('Variables de entorno configuradas correctamente');

// Mostrar configuración (sin contraseña)
console.log('\n📋 Configuración de conexión:');
console.log(`   Usuario: ${config.user}`);
console.log(`   Servidor: ${config.server}`);
console.log(`   Puerto: ${config.port}`);
console.log(`   Base de datos: ${config.database}`);
console.log(`   Encriptación: ${config.options.encrypt ? 'Activada' : 'Desactivada'}`);
console.log(`   Trust Certificate: ${config.options.trustServerCertificate ? 'Sí (Dev)' : 'No'}`);

// Función para probar la conexión
async function testConnection() {
    let pool;

    try {
        log.info('\n🔄 Intentando conectar...');

        pool = await sql.connect(config);

        log.success('Conexión exitosa a SQL Server!');

        // Ejecutar una consulta simple para verificar
        log.info('\n🔄 Ejecutando consulta de prueba...');
        const result = await pool.request().query('SELECT @@VERSION AS Version, GETDATE() AS FechaServidor');

        console.log('\n📊 Información del servidor:');
        console.log(`   Versión SQL Server: ${result.recordset[0].Version.split('\n')[0]}`);
        console.log(`   Fecha/Hora del servidor: ${result.recordset[0].FechaServidor}`);

        // Probar que podemos acceder a la base de datos
        log.info('\n🔄 Verificando acceso a la base de datos...');
        const dbResult = await pool.request().query('SELECT DB_NAME() AS CurrentDatabase');
        console.log(`   Base de datos actual: ${dbResult.recordset[0].CurrentDatabase}`);

        // Obtener información de tablas (si existen)
        log.info('\n🔄 Verificando tablas existentes...');
        const tablesResult = await pool.request().query(`
            SELECT TABLE_SCHEMA, TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_SCHEMA, TABLE_NAME
        `);

        if (tablesResult.recordset.length > 0) {
            console.log(`   Tablas encontradas: ${tablesResult.recordset.length}`);
            tablesResult.recordset.forEach(table => {
                console.log(`   - ${table.TABLE_SCHEMA}.${table.TABLE_NAME}`);
            });
        } else {
            log.warning('   No se encontraron tablas en la base de datos');
            log.info('   Ejecuta el script schema.sql para crear las tablas necesarias');
        }

        log.success('\n✅ Todas las pruebas pasaron exitosamente!');

    } catch (error) {
        log.error('\n❌ Error al conectar con SQL Server');
        console.log('\n📝 Detalles del error:');
        console.log(`   Mensaje: ${error.message}`);
        console.log(`   Código: ${error.code || 'N/A'}`);

        // Mensajes de ayuda según el tipo de error
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Posibles soluciones:');
            console.log('   1. Verifica que SQL Server esté corriendo');
            console.log('   2. Verifica que el puerto sea correcto (1433 por defecto)');
            console.log('   3. Verifica que el firewall permita conexiones al puerto');
        } else if (error.code === 'ELOGIN') {
            console.log('\n💡 Posibles soluciones:');
            console.log('   1. Verifica el usuario y contraseña');
            console.log('   2. Asegúrate de que el usuario tenga permisos en la base de datos');
        } else if (error.code === 'ETIMEOUT') {
            console.log('\n💡 Posibles soluciones:');
            console.log('   1. Verifica la conectividad de red');
            console.log('   2. Verifica que el servidor esté accesible');
        }

        process.exit(1);

    } finally {
        // Cerrar la conexión
        if (pool) {
            await pool.close();
            log.info('\n🔌 Conexión cerrada');
        }
    }
}

// Ejecutar el test
testConnection()
    .then(() => {
        console.log('\n' + '='.repeat(60));
        console.log(`${colors.green}✨ Test completado${colors.reset}`);
        console.log('='.repeat(60) + '\n');
        process.exit(0);
    })
    .catch((error) => {
        log.error('Error inesperado:', error);
        process.exit(1);
    });
