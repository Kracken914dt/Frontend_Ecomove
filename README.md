# EcoMove Frontend

Frontend de React para la plataforma EcoMove de gestión de transporte ecológico.

## 🚀 Características

- **Dashboard completo** con estadísticas y métricas
- **Gestión de usuarios** con CRUD completo
- **Gestión de estaciones** de préstamo
- **Gestión de transportes** (bicicletas, patinetas, scooters)
- **Sistema de préstamos** con cálculo automático de costos
- **Historial de préstamos** con filtros avanzados
- **Gestión de pagos** y transacciones
- **Interfaz responsive** optimizada para móviles y desktop
- **Diseño moderno** con Tailwind CSS
- **Integración completa** con el backend de EcoMove

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework de interfaz de usuario
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Framework de CSS utilitario
- **React Router** - Enrutamiento de la aplicación
- **Axios** - Cliente HTTP para API
- **React Hook Form** - Manejo de formularios
- **Lucide React** - Iconos modernos
- **React Hot Toast** - Notificaciones elegantes

## 📋 Prerrequisitos

- Node.js 16+ 
- npm o yarn
- Backend de EcoMove ejecutándose en el puerto 8080

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd ecomove-frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   El proyecto está configurado para conectarse automáticamente al backend en `http://localhost:8080` a través del proxy de Vite.

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Construcción para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## 📱 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── Layout.jsx      # Layout principal con header y sidebar
├── pages/              # Páginas de la aplicación
│   ├── Dashboard.jsx   # Dashboard principal
│   ├── Usuarios.jsx    # Gestión de usuarios
│   ├── Estaciones.jsx  # Gestión de estaciones
│   ├── Transportes.jsx # Gestión de transportes
│   ├── Prestamos.jsx   # Gestión de préstamos
│   ├── Historial.jsx   # Historial de préstamos
│   └── Pagos.jsx       # Gestión de pagos
├── services/           # Servicios de API
│   └── api.js         # Cliente HTTP y endpoints
├── App.jsx            # Componente principal con routing
├── main.jsx           # Punto de entrada de React
└── index.css          # Estilos globales y Tailwind
```

## 🔌 API Endpoints

El frontend se conecta a los siguientes endpoints del backend:

### Usuarios
- `POST /api/usuarios` - Crear usuario
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/{id}` - Obtener usuario por ID

### Estaciones
- `POST /api/estaciones` - Crear estación
- `GET /api/estaciones` - Listar estaciones
- `GET /api/estaciones/{id}` - Obtener estación por ID

### Transportes
- `POST /api/transportes` - Crear transporte
- `GET /api/transportes` - Listar transportes
- `GET /api/transportes/{id}` - Obtener transporte por ID

### Préstamos
- `POST /api/prestamos` - Crear préstamo
- `PUT /api/prestamos/{id}/finalizar` - Finalizar préstamo
- `GET /api/prestamos/usuario/{usuarioId}` - Historial por usuario

### Pagos
- `GET /api/pagos` - Listar pagos
- `GET /api/pagos/{id}` - Obtener pago por ID

## 🎨 Personalización

### Colores
El proyecto utiliza una paleta de colores personalizada definida en `tailwind.config.js`:

- **eco-green**: Verde ecológico para elementos principales
- **eco-gray**: Grises para textos y fondos

### Componentes
Los estilos base están definidos en `src/index.css` con clases utilitarias:

- `.btn-primary` - Botón principal
- `.btn-secondary` - Botón secundario
- `.card` - Contenedor de tarjeta
- `.input-field` - Campo de entrada

## 📱 Responsive Design

La aplicación está completamente optimizada para dispositivos móviles y desktop:

- **Mobile-first** approach
- **Sidebar colapsable** en dispositivos móviles
- **Grid responsivo** que se adapta a diferentes tamaños de pantalla
- **Tablas con scroll horizontal** en pantallas pequeñas

## 🔧 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la construcción
- `npm run lint` - Ejecutar linter

## 🚨 Solución de Problemas

### Error de conexión al backend
- Verificar que el backend esté ejecutándose en el puerto 8080
- Revisar la consola del navegador para errores de red
- Verificar la configuración del proxy en `vite.config.js`

### Problemas de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de puerto ocupado
Si el puerto 3000 está ocupado, modificar `vite.config.js`:
```javascript
server: {
  port: 3001, // Cambiar a otro puerto disponible
  // ... resto de configuración
}
```