# 🚀 Guía de Despliegue - AdmonY Backend

Esta guía te ayudará a desplegar la API de AdmonY en diferentes plataformas cloud.

---

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Preparación](#preparación)
- [Despliegue en Azure](#despliegue-en-azure)
- [Despliegue en AWS](#despliegue-en-aws)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Despliegue con Docker](#despliegue-con-docker)
- [CI/CD con GitHub Actions](#cicd-con-github-actions)
- [Monitoreo y Logs](#monitoreo-y-logs)

---

## ✅ Requisitos Previos

- Cuenta en la plataforma cloud elegida
- Git instalado
- Node.js >= 18
- SQL Server configurado
- Variables de entorno configuradas

---

## 🛠️ Preparación

### 1. Verificar que todo funcione localmente

```bash
# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Ejecutar linter
npm run lint

# Iniciar en modo desarrollo
npm run dev
```

### 2. Preparar variables de entorno

Asegúrate de tener todas las variables de entorno necesarias:

```env
NODE_ENV=production
PORT=3000
DB_USER=usuario_produccion
DB_PASSWORD=contraseña_segura
DB_SERVER=servidor.database.windows.net
DB_NAME=admony_prod
JWT_SECRET=clave_super_segura_diferente_a_desarrollo
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://tu-frontend.com
```

### 3. Optimizar para producción

- Configurar logs apropiados
- Habilitar compresión
- Configurar límites de rate limiting
- Revisar configuración de CORS
- Asegurar que las contraseñas estén hasheadas

---

## ☁️ Despliegue en Azure

### Opción 1: Azure App Service

#### 1. Crear App Service

```bash
# Instalar Azure CLI
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Crear grupo de recursos
az group create --name admony-rg --location eastus

# Crear App Service Plan
az appservice plan create \
  --name admony-plan \
  --resource-group admony-rg \
  --sku B1 \
  --is-linux

# Crear Web App
az webapp create \
  --resource-group admony-rg \
  --plan admony-plan \
  --name admony-api \
  --runtime "NODE|18-lts"
```

#### 2. Configurar Variables de Entorno

```bash
az webapp config appsettings set \
  --resource-group admony-rg \
  --name admony-api \
  --settings \
    NODE_ENV=production \
    DB_USER="tu_usuario" \
    DB_PASSWORD="tu_contraseña" \
    DB_SERVER="servidor.database.windows.net" \
    DB_NAME="admony_db" \
    JWT_SECRET="tu_clave_secreta"
```

#### 3. Desplegar desde Git

```bash
# Configurar despliegue desde repositorio
az webapp deployment source config \
  --name admony-api \
  --resource-group admony-rg \
  --repo-url https://github.com/tu-usuario/admony-backend \
  --branch main \
  --manual-integration
```

### Opción 2: Azure Container Instances

```bash
# Crear registro de contenedores
az acr create \
  --resource-group admony-rg \
  --name admonycr \
  --sku Basic

# Build y push de la imagen
az acr build \
  --registry admonycr \
  --image admony-api:v1 .

# Desplegar contenedor
az container create \
  --resource-group admony-rg \
  --name admony-api \
  --image admonycr.azurecr.io/admony-api:v1 \
  --dns-name-label admony-api \
  --ports 3000
```

### Crear Azure SQL Database

```bash
# Crear servidor SQL
az sql server create \
  --name admony-sql-server \
  --resource-group admony-rg \
  --location eastus \
  --admin-user adminuser \
  --admin-password TuContraseñaSegura123!

# Crear base de datos
az sql db create \
  --resource-group admony-rg \
  --server admony-sql-server \
  --name admony_db \
  --service-objective S0

# Configurar firewall
az sql server firewall-rule create \
  --resource-group admony-rg \
  --server admony-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

---

## 🌐 Despliegue en AWS

### Opción 1: AWS Elastic Beanstalk

#### 1. Instalar EB CLI

```bash
pip install awsebcli
```

#### 2. Inicializar aplicación

```bash
# Inicializar EB
eb init -p node.js admony-api --region us-east-1

# Crear entorno
eb create admony-prod

# Configurar variables de entorno
eb setenv \
  NODE_ENV=production \
  DB_USER=tu_usuario \
  DB_PASSWORD=tu_contraseña \
  DB_SERVER=tu-servidor.rds.amazonaws.com \
  DB_NAME=admony_db \
  JWT_SECRET=tu_clave_secreta

# Desplegar
eb deploy
```

### Opción 2: AWS ECS (Fargate)

#### 1. Crear ECR Repository

```bash
# Crear repositorio
aws ecr create-repository --repository-name admony-api

# Autenticar Docker
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  tu-id.dkr.ecr.us-east-1.amazonaws.com

# Build y push
docker build -t admony-api .
docker tag admony-api:latest \
  tu-id.dkr.ecr.us-east-1.amazonaws.com/admony-api:latest
docker push tu-id.dkr.ecr.us-east-1.amazonaws.com/admony-api:latest
```

#### 2. Crear tarea y servicio ECS

Usar la consola de AWS o AWS CLI para crear:
- Cluster ECS
- Task Definition
- Service con Load Balancer

### Crear RDS (SQL Server)

```bash
aws rds create-db-instance \
  --db-instance-identifier admony-db \
  --db-instance-class db.t3.micro \
  --engine sqlserver-ex \
  --master-username admin \
  --master-user-password TuContraseñaSegura123! \
  --allocated-storage 20
```

---

## ⚡ Despliegue en Vercel

**Nota**: Vercel es mejor para aplicaciones serverless. Para una API tradicional como esta, considera Azure o AWS.

### Configuración para Vercel

1. Crear archivo `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

2. Desplegar:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Configurar variables de entorno en dashboard de Vercel
```

---

## 🐳 Despliegue con Docker

### 1. Crear Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Crear docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_SERVER=sqlserver
      - DB_NAME=admony_db
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - sqlserver
    restart: unless-stopped

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd
    ports:
      - "1433:1433"
    volumes:
      - sqldata:/var/opt/mssql
    restart: unless-stopped

volumes:
  sqldata:
```

### 3. Build y Run

```bash
# Build
docker build -t admony-api .

# Run
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_USER=usuario \
  -e DB_PASSWORD=password \
  admony-api

# O con docker-compose
docker-compose up -d
```

---

## 🔄 CI/CD con GitHub Actions

### Crear `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: admony-api
          package: .
```

### Configurar Secrets en GitHub

1. Ir a Settings > Secrets and variables > Actions
2. Agregar secrets:
   - `AZURE_CREDENTIALS`
   - `DB_PASSWORD`
   - `JWT_SECRET`

---

## 📊 Monitoreo y Logs

### Application Insights (Azure)

```javascript
// Agregar al app.js
const appInsights = require('applicationinsights');
appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING);
appInsights.start();
```

### CloudWatch (AWS)

Configurar CloudWatch Logs en la tarea ECS o instancia EC2.

### Logging Personalizado

```javascript
// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

---

## 🔒 Seguridad en Producción

### Checklist de Seguridad

- [ ] Variables de entorno configuradas correctamente
- [ ] JWT_SECRET fuerte y único
- [ ] HTTPS habilitado
- [ ] CORS configurado correctamente
- [ ] Rate limiting implementado
- [ ] Helmet.js configurado
- [ ] SQL Injection protegido (prepared statements)
- [ ] Validación de entrada habilitada
- [ ] Logs de seguridad activos
- [ ] Backup de base de datos configurado

### Configurar HTTPS

En Azure/AWS, se configura a nivel de load balancer o App Service.

### Rate Limiting

```javascript
// Agregar al app.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de requests
});

app.use('/api/', limiter);
```

---

## 🧪 Testing en Producción

```bash
# Health check
curl https://tu-api.azurewebsites.net/api/health

# Test de autenticación
curl -X POST https://tu-api.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

---

## 📚 Recursos Adicionales

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

¡Tu API está lista para producción! 🎉

