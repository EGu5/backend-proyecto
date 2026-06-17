const registrador = require('../utilidades/registrador.utilidad');

/**
 * Middleware global para el manejo y formateo de errores y excepciones en la API.
 * 
 * Intención: Capturar cualquier error no controlado en el ciclo de solicitud-respuesta y responder con un formato estructurado.
 * Parámetros:
 *   - error: {Error} Objeto de error que contiene los detalles de la excepción.
 *   - peticion: {Object} Solicitud de Express (Request).
 *   - respuesta: {Object} Respuesta de Express (Response).
 *   - siguiente: {Function} Callback para pasar al siguiente middleware (NextFunction).
 * Retorno: Envía una respuesta HTTP en formato JSON con la información detallada del error.
 * Casos límite (edge cases):
 *   - Si el error no especifica un código de estado, se asigna por defecto el estado 500 (Internal Server Error).
 *   - Si la aplicación está en entorno de producción, se oculta la traza técnica para evitar fugas de información sensible.
 */
function manejadorErroresGlobal(error, peticion, respuesta, siguiente) {
  const codigoEstado = error.statusCode || 500;
  
  // Formato unificado de manejo de errores según la Regla 8
  const estructuraError = {
    exito: false,
    codigo: codigoEstado,
    error: {
      explicacionUsuario: error.explicacionUsuario || 'Ha ocurrido un inconveniente al procesar su solicitud. Por favor, intente más tarde.',
      explicacionDesarrollador: error.explicacionDesarrollador || error.message || 'Error interno del servidor no manejado.',
      descripcionTecnica: process.env.NODE_ENV === 'development' ? error.stack : 'Detalles ocultos en entorno de producción.'
    }
  };

  // Registrar el error en los logs del servidor para auditoría interna usando la utilidad centralizada
  registrador.error(`Error del Servidor en ${peticion.method} ${peticion.url} - Código: ${codigoEstado}`, error);

  respuesta.status(codigoEstado).json(estructuraError);
}

module.exports = manejadorErroresGlobal;
