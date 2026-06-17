const { pool } = require('../configuracion/conexion');

/**
 * Modelo: ProductoModelo
 * Intención: Proveer métodos de acceso a la tabla Producto en la base de datos MySQL.
 */
class ProductoModelo {
  /**
   * Intención: Obtener todos los productos registrados en la base de datos que se encuentren disponibles.
   * Parámetros: Ninguno.
   * Retorno: Promise<Array<Object>> - Listado de productos de la base de datos.
   */
  static async obtenerTodos() {
    const query = 'SELECT idProducto AS id, nombre, descripcion, precio, categoria, disponible FROM Producto WHERE disponible = TRUE';
    const [filas] = await pool.query(query);
    return filas;
  }
}

module.exports = ProductoModelo;
