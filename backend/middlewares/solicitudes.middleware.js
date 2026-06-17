const registrador = require('../utilidades/registrador.utilidad');

/**
 * Middleware para registrar las peticiones HTTP entrantes de forma estructurada y controlada.
 * 
 * Intención: Registrar información clave de las solicitudes (método, URL, IP y tiempo de respuesta) usando el registrador central.
 * Parámetros:
 *   - peticion: {Object} Solicitud de Express (Request).
 *   - respuesta: {Object} Respuesta de Express (Response).
 *   - siguiente: {Function} Callback para pasar al siguiente middleware (NextFunction).
 * Retorno: Ninguno.
 * Casos límite (edge cases):
 *   - Calcula correctamente el tiempo de respuesta incluso si la conexión del cliente finaliza abruptamente.
 */
function registrarSolicitud(peticion, respuesta, siguiente) {
  const tiempoInicio = Date.now();

  respuesta.on('finish', () => {
    const duracion = Date.now() - tiempoInicio;
    const mensaje = `${peticion.method} ${peticion.originalUrl} - Estado: ${respuesta.statusCode} - IP: ${peticion.ip} - Duración: ${duracion}ms`;
    
    if (respuesta.statusCode >= 500) {
      registrador.error(mensaje);
    } else if (respuesta.statusCode >= 400) {
      registrador.warn(mensaje);
    } else {
      // Peticiones exitosas (2xx o 3xx) se guardan solo en nivel debug
      registrador.debug(mensaje);
    }
  });

  siguiente();
}

module.exports = registrarSolicitud;
