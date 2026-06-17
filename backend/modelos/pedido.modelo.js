const { pool } = require('../configuracion/conexion');

/**
 * Modelo: PedidoModelo
 * Intención: Realizar operaciones en las tablas Pedido y DetallePedido en MySQL.
 */
class PedidoModelo {
  /**
   * Intención: Insertar un nuevo pedido y sus detalles en una transacción.
   * Parámetros:
   *   - idCliente (number): ID del cliente.
   *   - idSucursal (number): ID de la sucursal.
   *   - total (number): Total de la orden.
   *   - productos (Array<{idProducto, cantidad, precioUnitario}>): Detalles de los productos comprados.
   * Retorno: Promise<number> - ID del pedido creado.
   */
  static async crear(idCliente, idSucursal, total, productos) {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();

      // 1. Insertar el Pedido
      const queryPedido = 'INSERT INTO Pedido (total, estado, idCliente, idSucursal) VALUES (?, ?, ?, ?)';
      const [resultadoPedido] = await conexion.query(queryPedido, [total, 'pendiente', idCliente, idSucursal]);
      const idPedido = resultadoPedido.insertId;

      // 2. Insertar los detalles
      const queryDetalle = 'INSERT INTO DetallePedido (cantidad, precioUnitario, subtotal, idPedido, idProducto) VALUES (?, ?, ?, ?, ?)';
      for (const p of productos) {
        const subtotal = p.precioUnitario * p.cantidad;
        await conexion.query(queryDetalle, [p.cantidad, p.precioUnitario, subtotal, idPedido, p.idProducto]);
      }

      await conexion.commit();
      return idPedido;
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }

  /**
   * Intención: Obtener el historial completo de pedidos de un cliente.
   * Parámetros:
   *   - idCliente (number): ID del cliente.
   * Retorno: Promise<Array<Object>> - Lista de pedidos históricos con detalles.
   */
  static async obtenerHistorial(idCliente) {
    const query = `
      SELECT p.idPedido AS id, p.fechaPedido AS fechaHora, p.total, p.estado,
             dp.cantidad, dp.precioUnitario, prod.idProducto, prod.nombre, prod.categoria, prod.descripcion
      FROM Pedido p
      JOIN DetallePedido dp ON p.idPedido = dp.idPedido
      JOIN Producto prod ON dp.idProducto = prod.idProducto
      WHERE p.idCliente = ?
      ORDER BY p.fechaPedido DESC
    `;
    const [filas] = await pool.query(query, [idCliente]);
    return filas;
  }
}

module.exports = PedidoModelo;
