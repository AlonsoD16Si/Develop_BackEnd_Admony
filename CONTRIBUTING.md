# Guía de Contribución - AdmonY

¡Gracias por tu interés en contribuir a AdmonY! 🎉

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)

---

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código.

- Sé respetuoso y considerado
- Acepta críticas constructivas
- Enfócate en lo que es mejor para la comunidad
- Muestra empatía hacia otros miembros

---

## 🤝 ¿Cómo puedo contribuir?

### Reportar Bugs

Si encuentras un bug, por favor:

1. Verifica que no haya sido reportado anteriormente
2. Crea un issue con:
   - Descripción clara del problema
   - Pasos para reproducirlo
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del entorno (OS, Node version, etc.)

### Sugerir Mejoras

Para sugerir nuevas funcionalidades:

1. Crea un issue con la etiqueta `enhancement`
2. Describe la funcionalidad en detalle
3. Explica por qué sería útil
4. Si es posible, proporciona ejemplos

### Contribuir con Código

1. Haz fork del repositorio
2. Crea una rama para tu feature
3. Implementa tus cambios
4. Escribe tests si aplica
5. Asegúrate de que todos los tests pasen
6. Haz commit de tus cambios
7. Push a tu fork
8. Abre un Pull Request

---

## 🛠️ Configuración del Entorno

### Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- SQL Server >= 2019
- Git

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/admony-backend.git
cd admony-backend

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Configurar variables de entorno
# Edita el archivo .env con tus credenciales

# Crear base de datos
# Ejecuta el script database/schema.sql en tu SQL Server

# Iniciar en modo desarrollo
npm run dev
```

---

## 🔄 Proceso de Desarrollo

### Workflow de Git

1. **Actualiza tu fork**
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Crea una rama**
   ```bash
   git checkout -b feature/nombre-de-tu-feature
   ```

3. **Realiza tus cambios**
   - Escribe código limpio y bien documentado
   - Sigue los estándares de código
   - Añade tests si es necesario

4. **Haz commit**
   ```bash
   git add .
   git commit -m "feat: descripción de tu cambio"
   ```

5. **Push a tu fork**
   ```bash
   git push origin feature/nombre-de-tu-feature
   ```

6. **Abre un Pull Request**

---

## 📝 Estándares de Código

### Estilo de Código

- Usamos **ESLint** y **Prettier** para mantener consistencia
- Ejecuta `npm run lint` antes de hacer commit
- Ejecuta `npm run format` para formatear el código

### Convenciones

1. **Nombres de Variables y Funciones**
   - camelCase para variables y funciones: `getUserById`
   - PascalCase para clases: `UserService`
   - UPPERCASE para constantes: `MAX_RETRIES`

2. **Archivos**
   - kebab-case para nombres de archivo: `auth.controller.js`
   - Un módulo por archivo

3. **Comentarios**
   - JSDoc para funciones públicas
   - Comentarios explicativos para lógica compleja

### Ejemplo de Función Documentada

```javascript
/**
 * Obtiene un usuario por su ID
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Usuario encontrado
 * @throws {Error} Si el usuario no existe
 */
const getUserById = async (userId) => {
  // Implementación
};
```

---

## 💬 Commits

### Formato de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[pie opcional]
```

### Tipos de Commit

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan el código)
- `refactor`: Refactorización de código
- `test`: Añadir o modificar tests
- `chore`: Cambios en el proceso de build o herramientas

### Ejemplos

```bash
feat(auth): agregar recuperación de contraseña
fix(expenses): corregir cálculo de totales
docs(readme): actualizar instrucciones de instalación
refactor(services): simplificar lógica de ahorros
```

---

## 🔀 Pull Requests

### Antes de Abrir un PR

- [ ] El código compila sin errores
- [ ] Todos los tests pasan
- [ ] El código sigue los estándares establecidos
- [ ] La documentación está actualizada
- [ ] Los commits siguen el formato establecido

### Plantilla de PR

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se ha probado?
Describe las pruebas realizadas

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado una auto-revisión
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He añadido tests que prueban mi fix/feature
- [ ] Tests nuevos y existentes pasan
```

### Revisión de Código

- Sé constructivo en tus comentarios
- Explica el "por qué" de tus sugerencias
- Distingue entre cambios obligatorios y opcionales
- Aprecia el trabajo de los demás

---

## 🐛 Debug

### Logging

```javascript
// Usar diferentes niveles de log
console.log('Info general');
console.warn('Advertencia');
console.error('Error');
```

### Variables de Entorno

```bash
# Activar logs detallados
DEBUG=* npm run dev

# Modo desarrollo
NODE_ENV=development npm run dev
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm test -- --coverage
```

### Escribir Tests

```javascript
describe('AuthService', () => {
  test('debe registrar un nuevo usuario', async () => {
    const userData = {
      email: 'test@test.com',
      password: '123456',
      nombre: 'Test',
      apellido: 'User',
    };
    
    const result = await authService.register(userData);
    
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('token');
  });
});
```

---

## 📚 Recursos Adicionales

- [Documentación de Express](https://expressjs.com/)
- [Documentación de SQL Server](https://docs.microsoft.com/en-us/sql/)
- [Guía de JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ❓ Preguntas

Si tienes preguntas:

1. Revisa la documentación
2. Busca en issues cerrados
3. Abre un nuevo issue con la etiqueta `question`
4. Contacta al equipo

---

¡Gracias por contribuir a AdmonY! 🚀

