# 📚 Documentación de la API - AdmonY

## 📋 Información General

- **Base URL**: `http://localhost:3000/api`
- **Versión**: 1.0.0
- **Formato**: JSON
- **Autenticación**: JWT (Bearer Token)

---

## 🔐 Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT. El token debe enviarse en el header:

```
Authorization: Bearer <token>
```

---

## 📍 Endpoints

### 🔑 Autenticación

#### Registrar Usuario

```http
POST /api/auth/register
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "nombre": "Juan",
  "apellido": "Pérez"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@ejemplo.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "role": "usuario"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Iniciar Sesión

```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@ejemplo.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "role": "usuario"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Obtener Perfil

```http
GET /api/auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "role": "usuario",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Solicitar Recuperación de Contraseña

```http
POST /api/auth/request-password-reset
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Se ha enviado un correo con instrucciones para recuperar tu contraseña"
}
```

---

### 💰 Gastos

#### Crear Gasto

```http
POST /api/expenses
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "monto": 150.50,
  "categoria": "Alimentación",
  "descripcion": "Compras del supermercado",
  "tipo": "unico",
  "fecha": "2025-10-13T12:00:00.000Z"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Gasto registrado exitosamente",
  "data": {
    "id": 1,
    "usuario_id": 1,
    "monto": 150.50,
    "categoria": "Alimentación",
    "descripcion": "Compras del supermercado",
    "tipo": "unico",
    "fecha": "2025-10-13T12:00:00.000Z",
    "created_at": "2025-10-13T12:00:00.000Z"
  }
}
```

#### Listar Gastos

```http
GET /api/expenses?startDate=2025-10-01&endDate=2025-10-31&category=Alimentación
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (opcional): Fecha de inicio (ISO 8601)
- `endDate` (opcional): Fecha de fin (ISO 8601)
- `category` (opcional): Categoría específica

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "monto": 150.50,
      "categoria": "Alimentación",
      "descripcion": "Compras del supermercado",
      "tipo": "unico",
      "fecha": "2025-10-13T12:00:00.000Z"
    }
  ]
}
```

#### Obtener Gasto por ID

```http
GET /api/expenses/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": 1,
    "monto": 150.50,
    "categoria": "Alimentación",
    "descripcion": "Compras del supermercado",
    "tipo": "unico",
    "fecha": "2025-10-13T12:00:00.000Z"
  }
}
```

#### Actualizar Gasto

```http
PUT /api/expenses/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "monto": 175.00,
  "categoria": "Alimentación",
  "descripcion": "Compras del supermercado (actualizado)",
  "tipo": "unico",
  "fecha": "2025-10-13T12:00:00.000Z"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Gasto actualizado exitosamente",
  "data": {
    "id": 1,
    "monto": 175.00,
    "categoria": "Alimentación",
    "descripcion": "Compras del supermercado (actualizado)"
  }
}
```

#### Eliminar Gasto

```http
DELETE /api/expenses/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Gasto eliminado exitosamente"
}
```

#### Obtener Estadísticas de Gastos

```http
GET /api/expenses/stats?period=monthly
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (opcional): `monthly` o `yearly`

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "categoria": "Alimentación",
      "total": 1250.00,
      "cantidad": 15
    },
    {
      "categoria": "Transporte",
      "total": 450.00,
      "cantidad": 8
    }
  ]
}
```

---

### 💵 Ahorros

#### Crear Ahorro

```http
POST /api/savings
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre": "Vacaciones 2026",
  "objetivo": 5000.00,
  "monto_actual": 1200.00,
  "fecha_objetivo": "2026-06-30T00:00:00.000Z"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Ahorro registrado exitosamente",
  "data": {
    "id": 1,
    "usuario_id": 1,
    "nombre": "Vacaciones 2026",
    "objetivo": 5000.00,
    "monto_actual": 1200.00,
    "fecha_objetivo": "2026-06-30T00:00:00.000Z",
    "created_at": "2025-10-13T12:00:00.000Z"
  }
}
```

#### Listar Ahorros

```http
GET /api/savings
```

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "nombre": "Vacaciones 2026",
      "objetivo": 5000.00,
      "monto_actual": 1200.00,
      "fecha_objetivo": "2026-06-30T00:00:00.000Z"
    }
  ]
}
```

#### Obtener Progreso de Ahorros

```http
GET /api/savings/progress
```

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Vacaciones 2026",
      "objetivo": 5000.00,
      "monto_actual": 1200.00,
      "porcentaje_completado": 24.00
    }
  ]
}
```

---

### 📊 Presupuestos

#### Crear Presupuesto

```http
POST /api/budgets
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "categoria": "Alimentación",
  "monto_limite": 3000.00,
  "periodo": "mensual"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Presupuesto creado exitosamente",
  "data": {
    "id": 1,
    "usuario_id": 1,
    "categoria": "Alimentación",
    "monto_limite": 3000.00,
    "periodo": "mensual",
    "created_at": "2025-10-13T12:00:00.000Z"
  }
}
```

#### Obtener Análisis de Presupuestos

```http
GET /api/budgets/analysis?month=10&year=2025
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `month` (opcional): Mes (1-12)
- `year` (opcional): Año

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "categoria": "Alimentación",
      "monto_limite": 3000.00,
      "gasto_actual": 2750.00,
      "porcentaje_usado": 91.67,
      "excedido": false
    },
    {
      "id": 2,
      "categoria": "Transporte",
      "monto_limite": 1000.00,
      "gasto_actual": 1150.00,
      "porcentaje_usado": 115.00,
      "excedido": true
    }
  ]
}
```

---

### 📈 Dashboard

#### Obtener Resumen Financiero

```http
GET /api/dashboard/summary
```

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "total_gastos": 4250.00,
    "total_ahorros": 12000.00,
    "saldo_disponible": 1750.00
  }
}
```

#### Obtener Datos para Gráficas

```http
GET /api/dashboard/charts?type=expenses&period=monthly
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `type` (requerido): `expenses`, `savings`, `income`
- `period` (opcional): `weekly`, `monthly`, `yearly`

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "categoria": "Alimentación",
      "total": 2750.00
    },
    {
      "categoria": "Transporte",
      "total": 1150.00
    }
  ]
}
```

#### Obtener Alertas

```http
GET /api/dashboard/alerts
```

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "tipo": "presupuesto_excedido",
      "mensaje": "Has excedido el presupuesto de Transporte",
      "categoria": "Transporte"
    },
    {
      "tipo": "presupuesto_alerta",
      "mensaje": "Estás cerca de exceder el presupuesto de Alimentación",
      "categoria": "Alimentación"
    }
  ]
}
```

---

### 🏥 Health Check

#### Verificar Estado de la API

```http
GET /api/health
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "API de AdmonY funcionando correctamente",
  "timestamp": "2025-10-13T12:00:00.000Z"
}
```

---

## ⚠️ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Error de validación |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

### Formato de Respuesta de Error

```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

---

## 🔄 Ejemplos con cURL

### Registrar Usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123",
    "nombre": "Juan",
    "apellido": "Pérez"
  }'
```

### Crear Gasto (con autenticación)
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "monto": 150.50,
    "categoria": "Alimentación",
    "descripcion": "Compras del supermercado"
  }'
```

---

## 📦 Colecciones de Postman/Insomnia

Se recomienda crear una colección con todos los endpoints para facilitar las pruebas. Incluye:

1. Variables de entorno (base_url, token)
2. Pre-request scripts para autenticación
3. Tests automatizados
4. Ejemplos de todas las respuestas

---

## 🔗 Recursos Adicionales

- [Código Fuente](https://github.com/tu-usuario/admony-backend)
- [Issues](https://github.com/tu-usuario/admony-backend/issues)
- [Wiki](https://github.com/tu-usuario/admony-backend/wiki)

---

**Versión de la documentación**: 1.0.0  
**Última actualización**: Octubre 2025

