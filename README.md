# Pizza Pizza - Proyecto de Gestión y Órdenes Gourmet

Este archivo contiene las instrucciones generales de instalación y ejecución del proyecto, así como los detalles de las versiones utilizadas.

## Estructura del Proyecto

El proyecto está organizado en un monorrepositorio que separa de forma estricta el frontend y el backend:

```text
proyecto/
├── backend/                   # Backend de la aplicación en Node.js y MySQL
│   ├── configuracion/         # Configuración de base de datos y variables de entorno
│   ├── controladores/         # Controladores (Capa de Presentación / Controladores API)
│   ├── modelos/               # Modelos (Interacción directa con la base de datos MySQL)
│   ├── rutas/                 # Endpoints y definición del enrutador de la API
│   ├── middlewares/           # Middlewares de seguridad, validación y manejo de errores
│   ├── servicios/             # Capa de lógica de negocio (Casos de uso)
│   ├── utilidades/            # Funciones auxiliares y herramientas comunes
│   ├── README.md              # Documentación detallada del backend
│   └── servidor.js            # Punto de entrada de la aplicación
├── frontend/                  # Frontend de la aplicación en Angular
│   ├── src/                   # Código fuente de Angular
│   └── README.md              # Organización general del frontend
├── pruebas/                   # Directorio de pruebas y simulación
│   └── datos-simulados.json   # Datos de prueba para simulación
├── package.json               # Configuración de dependencias de la raíz
└── README.md                  # Este archivo (instrucciones y estructura general)
```


## Requisitos Previos

Asegúrate de tener instalado en tu sistema:
- **Node.js** (Versión recomendada: v20 o superior)
- **NPM** (Versión recomendada: v10 o superior)

---

## Instrucciones de Instalación

Sigue estos pasos para instalar y preparar el entorno de desarrollo local:

1. **Instalación de Dependencias**:
   Ejecuta el siguiente comando en la raíz del proyecto para instalar todos los paquetes y dependencias del frontend y las herramientas de construcción:
   ```bash
   npm install
   ```

2. **Verificación de Herramientas**:
   Asegúrate de que la CLI de Angular esté disponible. Se instalará localmente con el proyecto.

---

## Ejecución del Proyecto en Desarrollo

Para arrancar el servidor de desarrollo local y previsualizar la aplicación:

1. **Iniciar el Servidor de Desarrollo**:
   Corre el comando de inicio configurado:
   ```bash
   npm run start
   ```
   *Este comando compilará la aplicación y la mantendrá en escucha en el puerto por defecto (habitualmente [http://localhost:4200](http://localhost:4200)).*

2. **Compilación para Producción**:
   Si deseas compilar los archivos finales y optimizados para su despliegue:
   ```bash
   npm run build
   ```

---

## Tecnologías y Versiones Utilizadas

- **Angular**: ^21.2.0 (Componentes Standalone y Signals reactivos)
- **Tailwind CSS**: ^4.1.12 (Directivas nativas e importaciones globales CSS)
- **PostCSS**: ^8.5.3
- **TypeScript**: ~5.9.2
- **NPM**: v11.9.0
