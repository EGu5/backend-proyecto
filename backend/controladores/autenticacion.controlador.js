const AutenticacionServicio = require('../servicios/autenticacion.servicio');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Controlador: AutenticacionControlador
 * Intención: Recibir peticiones HTTP y mapear respuestas JSON para el módulo de Autenticación.
 */
class AutenticacionControlador {
  /**
   * Intención: Iniciar sesión del usuario.
   * Parámetros:
   *   - req (Object): Petición.
   *   - res (Object): Respuesta.
   *   - next (Function): Siguiente middleware.
   * Retorno: Promise<void>
   */
  static async login(req, res, next) {
    try {
      const { correo, contrasena } = req.body;
      if (!correo || !contrasena) {
        return res.status(400).json({
          exito: false,
          codigo: 'CREDENCIALES_INCOMPLETAS',
          mensaje: 'Por favor, proporciona el correo y la contraseña.'
        });
      }

      const usuario = await AutenticacionServicio.iniciarSesion(correo, contrasena);

      if (!usuario) {
        return res.status(401).json({
          exito: false,
          codigo: 'CREDENCIALES_INCORRECTAS',
          mensaje: 'Correo electrónico o contraseña incorrectos.'
        });
      }

      res.json({
        exito: true,
        datos: usuario
      });
    } catch (error) {
      registrador.error('Error en AutenticacionControlador.login', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Intención: Registrar un nuevo cliente.
   * Parámetros:
   *   - req (Object): Petición.
   *   - res (Object): Respuesta.
   *   - next (Function): Siguiente middleware.
   * Retorno: Promise<void>
   */
  static async registro(req, res, next) {
    try {
      const { nombre, apellido, correo, contrasena, telefono, direccion } = req.body;
      if (!nombre || !apellido || !correo || !contrasena || !telefono) {
        return res.status(400).json({
          exito: false,
          codigo: 'CAMPOS_INCOMPLETOS',
          mensaje: 'Todos los campos obligatorios del registro deben ser completados.'
        });
      }

      const nuevoUsuario = await AutenticacionServicio.registrar(
        nombre,
        apellido,
        correo,
        contrasena,
        telefono,
        direccion
      );

      res.status(201).json({
        exito: true,
        datos: nuevoUsuario
      });
    } catch (error) {
      registrador.error('Error en AutenticacionControlador.registro', { mensaje: error.message });
      if (error.status) {
        return res.status(error.status).json({
          exito: false,
          codigo: 'CORREO_DUPLICADO',
          mensaje: error.message
        });
      }
      next(error);
    }
  }
}

module.exports = AutenticacionControlador;
