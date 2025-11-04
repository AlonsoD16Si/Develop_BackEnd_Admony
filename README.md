# AdmonY - Backend API

<div align="center">
  <h3>🚀 API Backend para la gestión inteligente de finanzas personales</h3>
  <p>Aplicación web progresiva y móvil para administración financiera</p>
</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts Disponibles](#scripts-disponibles)
- [Endpoints de la API](#endpoints-de-la-api)
- [Base de Datos](#base-de-datos)
- [Contribuir](#contribuir)

---

## 📖 Descripción

**AdmonY** es una plataforma integral para la gestión de finanzas personales que permite a los usuarios:

- ✅ Registrar y categorizar gastos
- 💰 Definir y seguir objetivos de ahorro
- 📊 Crear presupuestos personalizados
- 📈 Visualizar estadísticas financieras
- 🔔 Recibir alertas sobre presupuestos excedidos
- 🤖 Obtener recomendaciones inteligentes (chatbot - próximamente)

---

## ✨ Características

### Módulos Implementados

1. **Autenticación y Autorización**
   - Registro de usuarios
   - Login con JWT
   - Recuperación de contraseña
   - Roles de usuario (Usuario/Administrador)

2. **Gestión de Gastos**
   - CRUD completo de gastos
   - Categorización
   - Gastos únicos y recurrentes
   - Estadísticas por categoría

3. **Gestión de Ahorros**
   - Definición de objetivos
   - Seguimiento de progreso
   - Metas con fechas límite

4. **Gestión de Presupuestos**
   - Presupuestos por categoría
   - Análisis de cumplimiento
   - Alertas de exceso

5. **Dashboard**
   - Resumen financiero
   - Gráficas interactivas
   - Alertas y notificaciones

---

## 🛠️ Tecnologías

| Tecnología        | Versión | Uso                         |
| ----------------- | ------- | --------------------------- |
| Node.js           | ≥18.0.0 | Runtime de JavaScript       |
| Express           | ^4.19.2 | Framework web               |
| SQL Server        | ≥2019   | Base de datos relacional    |
| JWT               | ^9.0.2  | Autenticación               |
| Bcrypt            | ^2.4.3  | Encriptación de contraseñas |
| Helmet            | ^7.1.0  | Seguridad HTTP              |
| CORS              | ^2.8.5  | Manejo de CORS              |
| Express-Validator | ^7.0.1  | Validación de datos         |

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v18 o superior)
- **npm** o **yarn**
- **SQL Server** (2019 o superior)
- **Git**

---

## 🚀 Instalación

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

Copia el archivo `.env.example` a `.env` y configura tus variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
NODE_ENV=development
PORT=3000

DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_SERVER=localhost
DB_NAME=admony_db

JWT_SECRET=clave_secreta_segura
JWT_EXPIRES_IN=7d
```

### 4. Crear la base de datos

Ejecuta el script SQL para crear las tablas necesarias (ver sección [Base de Datos](#base-de-datos)).

### 5. Iniciar el servidor

**Modo desarrollo (con nodemon):**

```bash
npm run dev
```

**Modo producción:**

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

---

## ⚙️ Configuración

### Variables de Entorno

| Variable         | Descripción                    | Valor por defecto |
| ---------------- | ------------------------------ | ----------------- |
| `NODE_ENV`       | Entorno de ejecución           | `development`     |
| `PORT`           | Puerto del servidor            | `3000`            |
| `DB_USER`        | Usuario de SQL Server          | -                 |
| `DB_PASSWORD`    | Contraseña de la BD            | -                 |
| `DB_SERVER`      | Servidor de la BD              | `localhost`       |
| `DB_NAME`        | Nombre de la BD                | `admony_db`       |
| `JWT_SECRET`     | Clave secreta para JWT         | -                 |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `7d`              |
| `CORS_ORIGIN`    | Orígenes permitidos            | `*`               |

---

## 📁 Estructura del Proyecto

```
admony-backend/
├── src/
│   ├── config/              # Configuraciones (DB, JWT)
│   │   ├── database.js
│   │   └── jwt.js
│   ├── controllers/         # Controladores MVC
│   │   ├── auth.controller.js
│   │   ├── expenses.controller.js
│   │   ├── savings.controller.js
│   │   ├── budgets.controller.js
│   │   └── dashboard.controller.js
│   ├── middlewares/         # Middlewares personalizados
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validator.middleware.js
│   ├── routes/              # Definición de rutas
│   │   ├── auth.routes.js
│   │   ├── expenses.routes.js
│   │   ├── savings.routes.js
│   │   ├── budgets.routes.js
│   │   ├── dashboard.routes.js
│   │   └── index.js
│   └── services/            # Lógica de negocio
│       ├── auth.service.js
│       ├── expenses.service.js
│       ├── savings.service.js
│       ├── budgets.service.js
│       └── dashboard.service.js
├── .env.example             # Ejemplo de variables de entorno
├── .gitignore              # Archivos ignorados por Git
├── app.js                  # Punto de entrada de la aplicación
├── package.json            # Dependencias y scripts
└── README.md              # Este archivo
```

---

## 📜 Scripts Disponibles

| Script     | Comando          | Descripción                           |
| ---------- | ---------------- | ------------------------------------- |
| Desarrollo | `npm run dev`    | Inicia el servidor con nodemon        |
| Producción | `npm start`      | Inicia el servidor en modo producción |
| Tests      | `npm test`       | Ejecuta los tests con Jest            |
| Lint       | `npm run lint`   | Analiza el código con ESLint          |
| Formato    | `npm run format` | Formatea el código con Prettier       |

---

## 🔌 Endpoints de la API

### Autenticación

| Método | Endpoint                           | Descripción             | Auth |
| ------ | ---------------------------------- | ----------------------- | ---- |
| POST   | `/api/auth/register`               | Registrar nuevo usuario | No   |
| POST   | `/api/auth/login`                  | Iniciar sesión          | No   |
| GET    | `/api/auth/profile`                | Obtener perfil          | Sí   |
| POST   | `/api/auth/request-password-reset` | Solicitar recuperación  | No   |
| POST   | `/api/auth/reset-password`         | Restablecer contraseña  | No   |

### Gastos

| Método | Endpoint              | Descripción      | Auth |
| ------ | --------------------- | ---------------- | ---- |
| POST   | `/api/expenses`       | Crear gasto      | Sí   |
| GET    | `/api/expenses`       | Listar gastos    | Sí   |
| GET    | `/api/expenses/:id`   | Obtener gasto    | Sí   |
| PUT    | `/api/expenses/:id`   | Actualizar gasto | Sí   |
| DELETE | `/api/expenses/:id`   | Eliminar gasto   | Sí   |
| GET    | `/api/expenses/stats` | Estadísticas     | Sí   |

### Ahorros

| Método | Endpoint                | Descripción         | Auth |
| ------ | ----------------------- | ------------------- | ---- |
| POST   | `/api/savings`          | Crear ahorro        | Sí   |
| GET    | `/api/savings`          | Listar ahorros      | Sí   |
| GET    | `/api/savings/:id`      | Obtener ahorro      | Sí   |
| PUT    | `/api/savings/:id`      | Actualizar ahorro   | Sí   |
| DELETE | `/api/savings/:id`      | Eliminar ahorro     | Sí   |
| GET    | `/api/savings/progress` | Progreso de ahorros | Sí   |

### Presupuestos

| Método | Endpoint                | Descripción              | Auth |
| ------ | ----------------------- | ------------------------ | ---- |
| POST   | `/api/budgets`          | Crear presupuesto        | Sí   |
| GET    | `/api/budgets`          | Listar presupuestos      | Sí   |
| GET    | `/api/budgets/:id`      | Obtener presupuesto      | Sí   |
| PUT    | `/api/budgets/:id`      | Actualizar presupuesto   | Sí   |
| DELETE | `/api/budgets/:id`      | Eliminar presupuesto     | Sí   |
| GET    | `/api/budgets/analysis` | Análisis de presupuestos | Sí   |

### Dashboard

| Método | Endpoint                 | Descripción         | Auth |
| ------ | ------------------------ | ------------------- | ---- |
| GET    | `/api/dashboard/summary` | Resumen financiero  | Sí   |
| GET    | `/api/dashboard/charts`  | Datos para gráficas | Sí   |
| GET    | `/api/dashboard/alerts`  | Alertas             | Sí   |

### Health Check

| Método | Endpoint      | Descripción      | Auth |
| ------ | ------------- | ---------------- | ---- |
| GET    | `/api/health` | Estado de la API | No   |

---



## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👥 Equipo

Desarrollado por el equipo de **AdmonY** 🚀

---

## 📞 Contacto

Para preguntas o soporte, contacta a: [tu-email@ejemplo.com]

---

<div align="center">
  <p>⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐</p>
  <p>Hecho con ❤️ para mejorar la salud financiera de las personas</p>
</div>
