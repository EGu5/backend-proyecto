const PedidosServicio = require('../servicios/pedidos.servicio');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Controlador: PedidosControlador
 * Intención: Mediar las peticiones HTTP relativas a la compra e historial de pedidos.
 */
class PedidosControlador {
  /**
   * Intención: Registrar un nuevo pedido.
   * Parámetros: req, res, next.
   */
  static async crear(req, res, next) {
    try {
      const { idCliente, idSucursal, total, productos } = req.body;
      if (!idCliente || !total || !productos || productos.length === 0) {
        return res.status(400).json({
          exito: false,
          codigo: 'DATOS_INCOMPLETOS',
          mensaje: 'Faltan parámetros esenciales para registrar la orden.'
        });
      }

      const idPedido = await PedidosServicio.crearPedido(idCliente, idSucursal || 1, total, productos);
      res.status(201).json({
        exito: true,
        datos: { idPedido }
      });
    } catch (error) {
      registrador.error('Error en PedidosControlador.crear', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Intención: Obtener el historial de pedidos de un cliente.
   * Parámetros: req, res, next.
   */
  static async obtenerHistorial(req, res, next) {
    try {
      const { idCliente } = req.params;
      if (!idCliente) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Se requiere el ID del cliente.'
        });
      }

      const historial = await PedidosServicio.obtenerHistorialCliente(parseInt(idCliente, 10));
      res.json({
        exito: true,
        datos: historial
      });
    } catch (error) {
      registrador.error('Error en PedidosControlador.obtenerHistorial', { mensaje: error.message });
      next(error);
    }
  }
}

module.exports = PedidosControlador;
