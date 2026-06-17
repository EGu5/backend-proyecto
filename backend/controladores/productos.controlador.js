const ProductosServicio = require('../servicios/productos.servicio');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Controlador: ProductosControlador
 * Intención: Recibir peticiones HTTP y mapear respuestas JSON para el catálogo de productos.
 */
class ProductosControlador {
  /**
   * Intención: Listar todos los productos del menú.
   * Parámetros:
   *   - req (Object): Objeto request.
   *   - res (Object): Objeto response.
   *   - next (Function): Callback middleware de error.
   * Retorno: Promise<void>
   */
  static async obtenerProductos(req, res, next) {
    try {
      const productos = await ProductosServicio.obtenerCatalogo();
      res.json({
        exito: true,
        datos: productos
      });
    } catch (error) {
      registrador.error('Error en ProductosControlador.obtenerProductos', { mensaje: error.message });
      next(error);
    }
  }
}

module.exports = ProductosControlador;
