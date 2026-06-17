const ProductoModelo = require('../modelos/producto.modelo');

/**
 * Servicio: ProductosServicio
 * Intención: Alojar la lógica de negocio relacionada con la gestión y consulta del catálogo de productos.
 */
class ProductosServicio {
  /**
   * Intención: Recuperar todos los productos aptos para la venta.
   * Parámetros: Ninguno.
   * Retorno: Promise<Array<Object>> - Arreglo de productos procesados.
   */
  static async obtenerCatalogo() {
    return await ProductoModelo.obtenerTodos();
  }
}

module.exports = ProductosServicio;
