const { pool } = require('./conexion');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Intención: Crear las tablas de la base de datos si no existen e insertar datos semilla si las tablas están vacías.
 * Parámetros: Ninguno.
 * Retorno: Promise<void>
 * Casos límite (edge cases):
 *   - Si una tabla ya existe, no se vuelve a crear ni altera su estructura.
 *   - Si ya existen registros, no se vuelven a insertar datos semilla para evitar duplicados.
 *   - Si ocurre algún error en las consultas, se lanza una excepción para que el servidor la maneje.
 */
async function inicializarTablas() {
  const conexion = await pool.getConnection();

  try {
    registrador.info('Iniciando verificación e inicialización de tablas de la base de datos...');

    // 1. Crear Tabla Sucursal
    await conexion.query(`
      CREATE TABLE IF NOT EXISTS Sucursal (
        idSucursal INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        direccion VARCHAR(200) NOT NULL,
        telefono VARCHAR(15) NOT NULL,
        horario VARCHAR(100) NOT NULL,
        PRIMARY KEY (idSucursal)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
    `);

    // 2. Crear Tabla Usuario
    await conexion.query(`
      CREATE TABLE IF NOT EXISTS Usuario (
        idUsuario INT NOT NULL AUTO_INCREMENT,
        correo VARCHAR(120) NOT NULL UNIQUE,
        contrasena VARCHAR(255) NOT NULL,
        rol VARCHAR(30) NOT NULL DEFAULT 'cliente',
        fechaRegistro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (idUsuario)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
    `);

    // 3. Crear Tabla Empleado
    await conexion.query(`
      CREATE TABLE IF NOT EXISTS Empleado (
        idEmpleado INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(80) NOT NULL,
        apellido VARCHAR(80) NOT NULL,
        puesto VARCHAR(50) NOT NULL,
        salario DECIMAL(10,2) NOT NULL CHECK (salario >= 0),
        idSucursal INT NOT NULL,
        idUsuario INT UNIQUE,
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
        PRIMARY KEY (idEmpleado),
        FOREIGN KEY (idSucursal)
          REFERENCES Sucursal(idSucursal)
          ON UPDATE CASCADE
          ON DELETE RESTRICT,
        FOREIGN KEY (idUsuario)
          REFERENCES Usuario(idUsuario)
          ON UPDATE CASCADE
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
    `);

    // 4. Crear Tabla Cliente
    await conexion.query(`
      CREATE TABLE IF NOT EXISTS Cliente (
        idCliente INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(80) NOT NULL,
        apellido VARCHAR(80) NOT NULL,
        telefono VARCHAR(150) NOT NULL UNIQUE,
        direccion VARCHAR(200),
        idUsuario INT UNIQUE,
        PRIMARY KEY (idCliente),
        FOREIGN KEY (idUsuario)
          REFERENCES Usuario(idUsuario)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
    `);

    // 5. Crear Tabla Producto
    await conexion.query(`
      CREATE TABLE IF NOT EXISTS Producto (
        idProducto INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion VARCHAR(255),
        precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
        categoria VARCHAR(50) NOT NULL,
        disponible BOOLEAN NOT NULL DEFAULT TRUE,
        PRIMARY KEY (idProducto)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
    `);

    // 6. Crear Tabla Pedido
    await conexion.query(`
      CREATE TABLE IF NOT EXISTS Pedido (
        idPedido INT NOT NULL AUTO_INCREMENT,
        fechaPedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
        estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
        idCliente INT NOT NULL,
        idSucursal INT NOT NULL,
        PRIMARY KEY (idPedido),
        FOREIGN KEY (idCliente)
          REFERENCES Cliente(idCliente)
          ON UPDATE CASCADE
          ON DELETE RESTRICT,
        FOREIGN KEY (idSucursal)
          REFERENCES Sucursal(idSucursal)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
    `);

    // 7. Crear Tabla DetallePedido
    await conexion.query(`
      CREATE TABLE IF NOT EXISTS DetallePedido (
        idDetalle INT NOT NULL AUTO_INCREMENT,
        cantidad INT NOT NULL CHECK (cantidad > 0),
        precioUnitario DECIMAL(10,2) NOT NULL CHECK (precioUnitario >= 0),
        subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
        idPedido INT NOT NULL,
        idProducto INT NOT NULL,
        PRIMARY KEY (idDetalle),
        FOREIGN KEY (idPedido)
          REFERENCES Pedido(idPedido)
          ON UPDATE CASCADE
          ON DELETE CASCADE,
        FOREIGN KEY (idProducto)
          REFERENCES Producto(idProducto)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
    `);

    // 8. Crear Tabla Ingrediente
    await conexion.query(`
      CREATE TABLE IF NOT EXISTS Ingrediente (
        idIngrediente INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        stockActual DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (stockActual >= 0),
        stockMinimo DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (stockMinimo >= 0),
        unidad VARCHAR(30) NOT NULL,
        PRIMARY KEY (idIngrediente)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
    `);

    // 9. Crear Tabla Factura
    await conexion.query(`
      CREATE TABLE IF NOT EXISTS Factura (
        idFactura VARCHAR(30) NOT NULL,
        fechaHora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        pedidoId INT NOT NULL,
        rfc VARCHAR(15) NOT NULL,
        razonSocial VARCHAR(150) NOT NULL,
        usoCfdi VARCHAR(100) NOT NULL,
        total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
        estado VARCHAR(30) NOT NULL DEFAULT 'Emitida' CHECK (estado IN ('Emitida', 'Cancelada')),
        PRIMARY KEY (idFactura),
        FOREIGN KEY (pedidoId)
          REFERENCES Pedido(idPedido)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
    `);

    // 10. Crear Tabla CorteCaja
    await conexion.query(`
      CREATE TABLE IF NOT EXISTS CorteCaja (
        idCorte INT NOT NULL AUTO_INCREMENT,
        fecha DATE NOT NULL,
        idEmpleado INT NOT NULL,
        totalVentas DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (totalVentas >= 0),
        cantidadPedidos INT NOT NULL DEFAULT 0 CHECK (cantidadPedidos >= 0),
        observaciones VARCHAR(255),
        estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado')),
        PRIMARY KEY (idCorte),
        FOREIGN KEY (idEmpleado)
          REFERENCES Empleado(idEmpleado)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
    `);

    registrador.info('Tablas verificadas correctamente en la base de datos.');

    // 11. Carga de Semillas si la tabla Sucursal está vacía
    const [sucursales] = await conexion.query('SELECT COUNT(*) AS total FROM Sucursal');
    if (sucursales[0].total === 0) {
      registrador.info('Poblando base de datos con registros semilla...');

      // Sucursales
      await conexion.query(`
        INSERT INTO Sucursal (idSucursal, nombre, direccion, telefono, horario) VALUES
        (1, 'Sucursal Centro', 'Av. Juárez #102, Col. Centro', '5512345678', '11:00 AM - 10:00 PM'),
        (2, 'Sucursal Norte', 'Blvd. Diaz Ordaz #405, Col. Las Torres', '5587654321', '11:00 AM - 11:00 PM'),
        (3, 'Sucursal Sur', 'Calzada Tlalpan #2030, Col. Portales', '5598765432', '12:00 PM - 10:00 PM')
      `);

      // Usuarios (Bcrypt hashes para 'contrasena123')
      await conexion.query(`
        INSERT INTO Usuario (idUsuario, correo, contrasena, rol, fechaRegistro) VALUES
        (1, 'admin@pizzapizza.com', '$2b$10$Y1r7Rk/nIeX42s8LwTjOeu2tM4NveXJc3oY/mN0/iM4vVlhGj8lX2', 'administrador', '2026-01-01 10:00:00'),
        (2, 'gerente.centro@pizzapizza.com', '$2b$10$Y1r7Rk/nIeX42s8LwTjOeu2tM4NveXJc3oY/mN0/iM4vVlhGj8lX2', 'empleado', '2026-01-10 11:00:00'),
        (3, 'cajero.norte@pizzapizza.com', '$2b$10$Y1r7Rk/nIeX42s8LwTjOeu2tM4NveXJc3oY/mN0/iM4vVlhGj8lX2', 'empleado', '2026-01-12 11:30:00'),
        (4, 'repartidor.sur@pizzapizza.com', '$2b$10$Y1r7Rk/nIeX42s8LwTjOeu2tM4NveXJc3oY/mN0/iM4vVlhGj8lX2', 'empleado', '2026-01-15 12:00:00'),
        (5, 'juan.lopez@correo.com', '$2b$10$Y1r7Rk/nIeX42s8LwTjOeu2tM4NveXJc3oY/mN0/iM4vVlhGj8lX2', 'cliente', '2026-02-01 14:22:00'),
        (6, 'maria.rodriguez@correo.com', '$2b$10$Y1r7Rk/nIeX42s8LwTjOeu2tM4NveXJc3oY/mN0/iM4vVlhGj8lX2', 'cliente', '2026-02-15 16:45:00'),
        (7, 'carlos.sanchez@correo.com', '$2b$10$Y1r7Rk/nIeX42s8LwTjOeu2tM4NveXJc3oY/mN0/iM4vVlhGj8lX2', 'cliente', '2026-03-01 18:10:00')
      `);

      // Empleados
      await conexion.query(`
        INSERT INTO Empleado (idEmpleado, nombre, apellido, puesto, salario, idSucursal, idUsuario, estado) VALUES
        (1, 'Carlos', 'Gómez', 'Gerente General', 18500.00, 1, 2, 'Activo'),
        (2, 'Ana', 'Martínez', 'Cajera Turno Matutino', 9200.00, 2, 3, 'Activo'),
        (3, 'Luis', 'Hernández', 'Repartidor Principal', 7800.00, 3, 4, 'Activo')
      `);

      // Clientes
      await conexion.query(`
        INSERT INTO Cliente (idCliente, nombre, apellido, telefono, direccion, idUsuario) VALUES
        (1, 'Juan', 'López', '5511223344', 'Av. Insurgentes Sur #4120, Col. Roma', 5),
        (2, 'María', 'Rodríguez', '5599887766', 'Calle Florencia #45, Col. Juárez', 6),
        (3, 'Carlos', 'Sánchez', '5544332211', 'Avenida Universidad #102, Col. Del Valle', 7)
      `);

      // Productos
      await conexion.query(`
        INSERT INTO Producto (idProducto, nombre, descripcion, precio, categoria, disponible) VALUES
        (1, 'Pepperoni Supreme', 'Pizza clásica con pepperoni premium y champiñones frescos.', 185.00, 'pizza', TRUE),
        (2, 'Hawaiana Real', 'Combinación dulce de jamón York y piña caramelizada.', 175.00, 'pizza', TRUE),
        (3, 'Mexicana Premium', 'Sabor mexicano con frijoles, chorizo y jalapeños.', 195.00, 'pizza', TRUE),
        (4, 'Tiramisú Casero', 'Postre de café expreso con queso mascarpone.', 65.00, 'postre', TRUE),
        (5, 'Cerveza Artesanal Porter', 'Cerveza oscura artesanal malteada nacional.', 45.00, 'bebida', TRUE),
        (6, 'Refresco de Cola Familiar', 'Refresco de cola embotellado de 1.5 litros.', 35.00, 'bebida', TRUE),
        (7, 'Cuatro Quesos Gourmet', 'Mezcla fina de queso mozzarella, parmesano, provolone y azul.', 210.00, 'pizza', TRUE),
        (8, 'Volcán de Chocolate', 'Bizcocho tibio de chocolate relleno de fudge fundido.', 75.00, 'postre', TRUE),
        (9, 'Agua Mineral de Manantial', 'Agua gasificada refrescante de 600 ml.', 25.00, 'bebida', TRUE),
        (10, 'Cheesecake de Fresa', 'Tarta cremosa de queso Philadelphia con jarabe de fresas naturales.', 60.00, 'postre', TRUE)
      `);

      // Pedidos
      await conexion.query(`
        INSERT INTO Pedido (idPedido, fechaPedido, total, estado, idCliente, idSucursal) VALUES
        (1, '2026-05-10 14:30:00', 425.00, 'entregado', 1, 1),
        (2, '2026-05-15 19:15:00', 250.00, 'entregado', 2, 2),
        (3, '2026-06-01 20:00:00', 210.00, 'entregado', 3, 3),
        (4, '2026-06-20 13:45:00', 185.00, 'entregado', 1, 1),
        (5, '2026-06-24 12:00:00', 280.00, 'preparacion', 2, 1)
      `);

      // Detalles
      await conexion.query(`
        INSERT INTO DetallePedido (idDetalle, cantidad, precioUnitario, subtotal, idPedido, idProducto) VALUES
        (1, 2, 185.00, 370.00, 1, 1),
        (2, 1, 55.00, 55.00, 1, 5),
        (3, 1, 175.00, 175.00, 2, 2),
        (4, 1, 75.00, 75.00, 2, 8),
        (5, 1, 210.00, 210.00, 3, 7),
        (6, 1, 185.00, 185.00, 4, 1),
        (7, 1, 210.00, 210.00, 5, 7),
        (8, 1, 70.00, 70.00, 5, 8)
      `);

      // Ingredientes
      await conexion.query(`
        INSERT INTO Ingrediente (idIngrediente, nombre, stockActual, stockMinimo, unidad) VALUES
        (1, 'Harina de Trigo Premium', 150.00, 30.00, 'kg'),
        (2, 'Queso Mozzarella Rallado', 80.00, 15.00, 'kg'),
        (3, 'Pepperoni Rebanado', 40.00, 8.00, 'kg'),
        (4, 'Piña en Almíbar', 25.00, 5.00, 'kg'),
        (5, 'Jamón York Premium', 35.00, 8.00, 'kg'),
        (6, 'Salsa de Tomate de la Casa', 120.00, 20.00, 'litros')
      `);

      // Facturas
      await conexion.query(`
        INSERT INTO Factura (idFactura, fechaHora, pedidoId, rfc, razonSocial, usoCfdi, total, estado) VALUES
        ('FAC-3491', '2026-05-10 14:45:00', 1, 'XAXX010101000', 'JUAN LOPEZ PEREZ', 'G03 - Gastos en general', 425.00, 'Emitida'),
        ('FAC-8271', '2026-05-15 19:30:00', 2, 'XAXX010101000', 'MARIA RODRIGUEZ SOTO', 'G03 - Gastos en general', 250.00, 'Emitida'),
        ('FAC-1903', '2026-06-01 20:15:00', 3, 'XAXX010101000', 'CARLOS SANCHEZ RUIZ', 'P01 - Por definir', 210.00, 'Emitida')
      `);

      // Cortes de Caja
      await conexion.query(`
        INSERT INTO CorteCaja (idCorte, fecha, idEmpleado, totalVentas, cantidadPedidos, observaciones, estado) VALUES
        (1, '2026-06-20', 2, 185.00, 1, 'Corte de caja matutino sin diferencias.', 'aprobado'),
        (2, '2026-06-24', 2, 280.00, 1, 'Corte del día de hoy en preparación de auditoría.', 'pendiente')
      `);

      registrador.info('Registros semilla poblaron la base de datos con éxito.');
    }
  } catch (error) {
    registrador.error('Error crítico al inicializar las tablas de la base de datos:', {
      mensaje: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    if (conexion) {
      conexion.release();
    }
  }
}

module.exports = {
  inicializarTablas
};
