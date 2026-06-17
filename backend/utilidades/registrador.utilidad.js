require('dotenv').config();

// Definición de los niveles de log permitidos y su prioridad de visualización
const NIVELES = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Determinar el nivel de log activo desde las variables de entorno
const NIVEL_ACTIVO = (process.env.NIVEL_LOG || (process.env.NODE_ENV === 'production' ? 'error' : 'info')).toLowerCase();
const PRIORIDAD_ACTIVA = NIVELES[NIVEL_ACTIVO] !== undefined ? NIVELES[NIVEL_ACTIVO] : 1;

/**
 * Escribe un mensaje estructurado en la salida de consola si el nivel de severidad cumple con la configuración del entorno.
 * 
 * Intención: Centralizar e impedir la sobreimpresión de console.logs innecesarios en producción.
 * Parámetros:
 *   - nivel: {string} Nivel del mensaje a registrar ('debug', 'info', 'warn', 'error').
 *   - mensaje: {string} Mensaje informativo que describe el evento.
 *   - metadatos: {*} Parámetro opcional que puede ser un objeto JSON o una instancia de Error con detalles adicionales.
 * Retorno: Ninguno.
 * Casos límite (edge cases):
 *   - Si el nivel ingresado no es válido, se asume por defecto el nivel 'info'.
 *   - Si el metadato es una instancia de Error, se formatea e imprime la traza completa (stack trace).
 */
function registrar(nivel, mensaje, metadatos = null) {
  const nivelNormalizado = nivel.toLowerCase();
  const prioridadMensaje = NIVELES[nivelNormalizado] !== undefined ? NIVELES[nivelNormalizado] : 1;

  if (prioridadMensaje >= PRIORIDAD_ACTIVA) {
    const marcaTiempo = new Date().toISOString();
    const etiquetaNivel = nivelNormalizado.toUpperCase().padEnd(5, ' ');
    
    let mensajeCompleto = `[${marcaTiempo}] [${etiquetaNivel}]: ${mensaje}`;
    
    if (metadatos !== null && metadatos !== undefined) {
      if (metadatos instanceof Error) {
        mensajeCompleto += `\n[Detalles del Error]: ${metadatos.stack}`;
      } else if (typeof metadatos === 'object') {
        mensajeCompleto += `\n[Metadatos]: ${JSON.stringify(metadatos, null, 2)}`;
      } else {
        mensajeCompleto += `\n[Detalles]: ${metadatos}`;
      }
    }

    // Direccionar al método nativo correspondiente de console
    if (prioridadMensaje === NIVELES.error) {
      console.error(mensajeCompleto);
    } else if (prioridadMensaje === NIVELES.warn) {
      console.warn(mensajeCompleto);
    } else {
      console.log(mensajeCompleto);
    }
  }
}

const registrador = {
  debug: (mensaje, metadatos) => registrar('debug', mensaje, metadatos),
  info: (mensaje, metadatos) => registrar('info', mensaje, metadatos),
  warn: (mensaje, metadatos) => registrar('warn', mensaje, metadatos),
  error: (mensaje, metadatos) => registrar('error', mensaje, metadatos)
};

module.exports = registrador;
