# Pizza Pizza - Backend de la Aplicación

Este directorio contiene la estructura del backend de la aplicación, desarrollada en Node.js, Express y MySQL.

## Arquitectura de Directorios

El backend está diseñado siguiendo una arquitectura limpia y modular en capas, lo que permite separar adecuadamente las responsabilidades:

- **`configuracion/`**: Contiene los archivos de configuración global del sistema, tales como la conexión a la base de datos MySQL (`conexion.js`) y la configuración de variables de entorno.
- **`controladores/`**: Recibe las solicitudes HTTP del frontend, delega el procesamiento a los servicios correspondientes y retorna la respuesta con el formato estandarizado.
- **`modelos/`**: Modela las entidades de datos y contiene las consultas SQL (SELECT, INSERT, UPDATE, DELETE) directamente relacionadas con la base de datos MySQL.
- **`rutas/`**: Define los endpoints públicos y privados expuestos por la API, delegando la ejecución a los controladores y protegiéndolos mediante middlewares.
- **`middlewares/`**: Intermediarios que se ejecutan antes de que la petición llegue a los controladores (por ejemplo, validación de sesión con JWT y control de excepciones global).
- **`servicios/`**: Implementa la lógica de negocio y las reglas específicas del sistema (por ejemplo, reglas de pedido, creación de usuario, verificación de roles).
- **`utilidades/`**: Funciones comunes y auxiliares no vinculadas a la lógica de negocio, como formateadores de respuesta y encriptadores de contraseñas.
- **`servidor.js`**: Archivo de entrada principal donde se inicializa la aplicación Express y se levanta el servidor HTTP.
