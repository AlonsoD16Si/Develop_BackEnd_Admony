# 🚀 Inicio Rápido - AdmonY Backend

Esta guía te ayudará a poner en marcha el proyecto en menos de 5 minutos.

---

## ⚡ Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/admony-backend.git
cd admony-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo (renombrar env.example.txt a .env)
# En Windows PowerShell:
Copy-Item env.example.txt .env

# En Linux/Mac:
cp env.example.txt .env
```

Editar `.env` con tus credenciales:

```env
NODE_ENV=development
PORT=3000

DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_SERVER=localhost
DB_NAME=Addmony

JWT_SECRET=mi_clave_secreta_super_segura
JWT_EXPIRES_IN=7d
```

### 4. Crear la base de datos

Abre SQL Server Management Studio (SSMS) o Azure Data Studio y ejecuta:

```sql
-- Crear la base de datos
CREATE DATABASE Addmony;
GO
```

Luego ejecuta el script completo que se encuentra en `database/schema.sql`.

### 5. Iniciar el servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: **http://localhost:3000**

---

## 🧪 Probar la API

### Verificar que funciona

```bash
curl http://localhost:3000/api/health
```

Deberías recibir:

```json
{
  "success": true,
  "message": "API de AddmonY funcionando correctamente",
  "timestamp": "2025-10-13T..."
}
```

### Registrar un usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "123456",
    "nombre": "Usuario",
    "apellido": "Prueba"
  }'
```

### Iniciar sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "123456"
  }'
```

Copia el `token` de la respuesta.

### Crear un gasto

```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "monto": 150.50,
    "categoria": "Alimentación",
    "descripcion": "Compras del supermercado"
  }'
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start

# Tests
npm test

# Tests en modo watch
npm run test:watch

# Linter
npm run lint

# Formatear código
npm run format
```

---

## 📁 Estructura del Proyecto

```
admony-backend/
├── src/
│   ├── config/          # Configuraciones (DB, JWT)
│   ├── controllers/     # Controladores MVC
│   ├── middlewares/     # Middlewares (auth, error)
│   ├── routes/          # Rutas de la API
│   ├── services/        # Lógica de negocio
│   └── utils/           # Utilidades
├── database/            # Scripts SQL
├── docs/               # Documentación
├── app.js              # Punto de entrada
├── package.json        # Dependencias
└── .env                # Variables de entorno
```

---

## 📚 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Gastos
- `POST /api/expenses` - Crear gasto
- `GET /api/expenses` - Listar gastos
- `GET /api/expenses/:id` - Obtener gasto
- `PUT /api/expenses/:id` - Actualizar gasto
- `DELETE /api/expenses/:id` - Eliminar gasto
- `GET /api/expenses/stats` - Estadísticas

### Ahorros
- `POST /api/savings` - Crear ahorro
- `GET /api/savings` - Listar ahorros
- `GET /api/savings/progress` - Ver progreso

### Presupuestos
- `POST /api/budgets` - Crear presupuesto
- `GET /api/budgets` - Listar presupuestos
- `GET /api/budgets/analysis` - Análisis de cumplimiento

### Dashboard
- `GET /api/dashboard/summary` - Resumen financiero
- `GET /api/dashboard/charts` - Datos para gráficas
- `GET /api/dashboard/alerts` - Alertas

---

## 🔍 Solución de Problemas

### Error: "Cannot connect to SQL Server"

**Solución:**
1. Verifica que SQL Server esté corriendo
2. Revisa las credenciales en `.env`
3. Asegúrate de que el firewall permita conexiones

### Error: "Port 3000 is already in use"

**Solución:**
```bash
# Cambiar el puerto en .env
PORT=3001
```

### Error: "JWT token invalid"

**Solución:**
- Verifica que el token no haya expirado
- Asegúrate de enviar el header: `Authorization: Bearer TOKEN`

---

## 📖 Documentación Completa

- [README.md](README.md) - Documentación general
- [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) - Documentación de la API
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Guía de despliegue
- [CONTRIBUTING.md](CONTRIBUTING.md) - Guía de contribución

---

## 💡 Próximos Pasos

1. ✅ Explorar la API con Postman/Insomnia
2. ✅ Leer la documentación completa
3. ✅ Conectar con el frontend
4. ✅ Configurar CI/CD
5. ✅ Desplegar en la nube

---

## 🆘 ¿Necesitas Ayuda?

- 📧 Email: soporte@admony.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/admony-backend/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/tu-usuario/admony-backend/discussions)

---

¡Listo para empezar! 🎉

