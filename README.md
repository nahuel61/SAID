# Dashboard de Agregadurías de Defensa

Sistema de gestión y visualización de agregadurías militares en el exterior para las Fuerzas Armadas Argentinas.

## 🚀 Características

- **Dashboard Interactivo** con KPIs y métricas clave
- **Mapa Mundial** con despliegue de agregadurías por país
- **Gestión CRUD completa** de personal desplegado
- **Tabla dinámica** con búsqueda, filtros y ordenamiento
- **Cálculo automático** de días restantes de comisión
- **Importación/Exportación CSV**
- **Modo oscuro** con paleta institucional
- **Persistencia local** mediante localStorage

## 🛠️ Stack Tecnológico

- **React 18.3** - Framework UI
- **Vite 6.0** - Build tool y dev server
- **Tailwind CSS 3.4** - Estilos utility-first
- **Lucide React** - Iconografía
- **Material Icons** - Iconos adicionales
- **date-fns 4.1** - Manejo de fechas
- **Recharts 2.15** - Visualización de gráficos

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <tu-repo-url>
cd dashboard-agregadurias

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:5173/`

## 🏗️ Build para Producción

```bash
# Generar build optimizado
npm run build

# Preview del build de producción
npm run preview
```

Los archivos se generarán en la carpeta `dist/` y estarán listos para deployar en cualquier servidor web estático.

## 📝 Uso

### Agregar Agregaduría

1. Click en el botón **"Nueva Misión"**
2. Completar el formulario con los datos del personal
3. Guardar - el sistema calculará automáticamente los días restantes

### Importar desde CSV

1. Click en el ícono de configuración (⚙️)
2. Seleccionar **"Importar desde CSV"**
3. Elegir el archivo CSV (formato compatible con el original)
4. Previsualizar y confirmar importación

### Exportar Datos

1. Configuración → **"Exportar a CSV"**
2. Se descargará un archivo con todos los registros actuales

## 🗺️ Mapa Mundial

El mapa muestra automáticamente pins en los países donde hay agregadurías desplegadas:

- 🟢 **Verde (EA):** Ejército Argentino
- 🔵 **Azul (ARA):** Armada Argentina
- 🔷 **Cyan (FAA):** Fuerza Aérea Argentina

Pasa el mouse sobre los pins para ver detalles del país.

## 💾 Persistencia de Datos

Los datos se guardan automáticamente en el navegador usando `localStorage`. Para hacer backup:

1. Usar la opción **"Exportar a CSV"** regularmente
2. Los datos persisten entre sesiones del navegador

## 🎨 Personalización

### Colores

Los colores se pueden ajustar en:
- `src/index.css` - Variables CSS
- `tailwind.config.js` - Configuración de Tailwind

### Agregar Países al Mapa

Editar `src/utils/mapHelpers.js` y agregar coordenadas en el objeto `countryCoordinates`.

## 📄 Estructura del Proyecto

```
dashboard-agregadurias/
├── src/
│   ├── components/
│   │   ├── Dashboard/        # KPIs, Gráficos, Mapa
│   │   ├── Forms/             # Formulario de agregadurías
│   │   ├── ImportExport/      # CSV import/export
│   │   ├── Layout/            # Header, Sidebar, Modales
│   │   └── Table/             # Tabla maestra
│   ├── context/
│   │   └── DataContext.jsx    # Estado global
│   ├── utils/
│   │   ├── csvParser.js       # Parsing y limpieza de CSV
│   │   ├── dataHelpers.js     # Filtrado y búsqueda
│   │   ├── dateHelpers.js     # Cálculos de fechas
│   │   └── mapHelpers.js      # Coordenadas de países
│   ├── App.jsx                # Componente principal
│   ├── main.jsx               # Entry point
│   └── index.css              # Estilos globales
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🔒 Seguridad

⚠️ **Importante:** Este sistema usa `localStorage` para persistencia. No es adecuado para datos sensibles o multi-usuario. Para un entorno de producción, considerar:

- Backend con base de datos (PostgreSQL/MySQL)
- Autenticación y autorización
- API REST/GraphQL
- Backup automático

## 📝 Licencia

Proyecto interno - Fuerzas Armadas Argentinas

## 👨‍💻 Desarrollo

Desarrollado para el Estado Mayor Conjunto (EMCO)

---

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026
