-- =============================================
-- SISTEMA DE GESTIÓN PARA PIZZERÍA
-- Script de Creación de Base de Datos
-- 1.1 | Junio 2026
-- =============================================

CREATE DATABASE IF NOT EXISTS pizzeria_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_spanish_ci;

USE pizzeria_db;

-- Tabla: Sucursal
CREATE TABLE Sucursal (
    idSucursal INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    horario VARCHAR(100) NOT NULL,
    PRIMARY KEY (idSucursal)
);

-- Tabla: Usuario (Para autenticación y control de roles)
CREATE TABLE Usuario (
    idUsuario INT NOT NULL AUTO_INCREMENT,
    correo VARCHAR(120) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL, -- Almacena el hash encriptado (Bcrypt)
    rol VARCHAR(30) NOT NULL DEFAULT 'cliente', -- 'cliente', 'empleado', 'administrador'
    fechaRegistro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (idUsuario)
);

-- Tabla: Empleado
CREATE TABLE Empleado (
    idEmpleado INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    puesto VARCHAR(50) NOT NULL,
    salario DECIMAL(10,2) NOT NULL CHECK (salario >= 0),
    idSucursal INT NOT NULL,
    idUsuario INT UNIQUE, -- Asociación con sus credenciales de acceso
    PRIMARY KEY (idEmpleado),
    FOREIGN KEY (idSucursal)
        REFERENCES Sucursal(idSucursal)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- Tabla: Cliente
CREATE TABLE Cliente (
    idCliente INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    telefono VARCHAR(150) NOT NULL UNIQUE,
    direccion VARCHAR(200),
    idUsuario INT UNIQUE, -- Asociación con sus credenciales de acceso (evita duplicar el correo)
    PRIMARY KEY (idCliente),
    FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Tabla: Producto
CREATE TABLE Producto (
    idProducto INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    categoria VARCHAR(50) NOT NULL,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (idProducto)
);

-- Tabla: Pedido
CREATE TABLE Pedido (
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
);

-- Tabla: DetallePedido
CREATE TABLE DetallePedido (
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
);

-- =============================================
-- INSERCIÓN DE DATOS SEMILLA (SEEDS)
-- =============================================

-- 1. Sucursales
INSERT INTO Sucursal (idSucursal, nombre, direccion, telefono, horario) VALUES
(1, 'Sucursal Centro', 'Av. Juárez #102, Col. Centro', '5512345678', '11:00 AM - 10:00 PM'),
(2, 'Sucursal Norte', 'Blvd. Diaz Ordaz #405, Col. Las Torres', '5587654321', '11:00 AM - 11:00 PM'),
(3, 'Sucursal Sur', 'Calzada Tlalpan #2030, Col. Portales', '5598765432', '12:00 PM - 10:00 PM');

-- 2. Usuarios (Contraseña de prueba encriptada por defecto para todos: '123456')
-- Hash bcrypt de '123456': $2b$10$EPY93KbOOC.hK97jM.74oOXo/k3HwQdCsnUpxu05/eW30T78X/06q
-- Correos cifrados con AES-256-CBC determinista
INSERT INTO Usuario (idUsuario, correo, contrasena, rol) VALUES
(1, '40ef1cf9f8a70cd3b5af85beedf8cb0f5706f37263a633cbcd39e9af5075b573', '$2b$10$EPY93KbOOC.hK97jM.74oOXo/k3HwQdCsnUpxu05/eW30T78X/06q', 'administrador'),
(2, 'b64117393e6dafb6acb227497ff541ebacda4531d4b505bf094f596f43e47fb1', '$2b$10$EPY93KbOOC.hK97jM.74oOXo/k3HwQdCsnUpxu05/eW30T78X/06q', 'empleado'),
(3, 'c7dd30683b1b6a999faba21e3f6f050172838485f8792aa3e2899fd40e4f2f46', '$2b$10$EPY93KbOOC.hK97jM.74oOXo/k3HwQdCsnUpxu05/eW30T78X/06q', 'empleado'),
(4, '69980dbe7cd6414f178c515609c7a064feffe96099d534cf55b5aee4074a2127', '$2b$10$EPY93KbOOC.hK97jM.74oOXo/k3HwQdCsnUpxu05/eW30T78X/06q', 'cliente'),
(5, '622afff451e43cb83e1c30697b894f533bdfe1e9b748d6325d93042ee88c62cc', '$2b$10$EPY93KbOOC.hK97jM.74oOXo/k3HwQdCsnUpxu05/eW30T78X/06q', 'cliente');

-- 3. Empleados
INSERT INTO Empleado (idEmpleado, nombre, apellido, puesto, salario, idSucursal, idUsuario) VALUES
(1, 'Alejandro', 'Gómez', 'Chef Pizzero', 12500.00, 1, 2),
(2, 'Beatriz', 'Solís', 'Cajera General', 9800.00, 1, 3);

-- 4. Clientes
-- Telefono y dirección cifrados con AES-256-CBC aleatorio (no determinista)
INSERT INTO Cliente (idCliente, nombre, apellido, telefono, direccion, idUsuario) VALUES
(1, 'Juan', 'Pérez', 'ba898758a84b833c43d8bc494a6c697b:227aba4b83a9ecd5c407549fad9c24f2', '6ce0e858e35b305578902ae65f224777:9a24238d890808a60a42227d32996f1f4a8ea4cd206fc7679d293560c28edc2e', 4),
(2, 'Karen', 'López', '7f5196fc10a4f94e5fb1320ebe66f3b1:a5ada33d7f1c7a2426d3b87e23509606', '595c8f49eb23a16c24d7a9e76ed6438e:6354555da91a55865d4194776378651be75304d9950e1f36abd7a8866fd1bf9cd6863a81c0c0484ea321f91645740a24', 5);

-- 5. Productos
INSERT INTO Producto (idProducto, nombre, descripcion, precio, categoria, disponible) VALUES
(1, 'Pepperoni Supreme', 'Pizza clásica con pepperoni premium y champiñones frescos.', 185.00, 'pizza', TRUE),
(2, 'Hawaiana Real', 'Combinación dulce de jamón York y piña caramelizada.', 175.00, 'pizza', TRUE),
(3, 'Mexicana Premium', 'Sabor mexicano con frijoles, chorizo y jalapeños.', 195.00, 'pizza', TRUE),
(4, 'Tiramisú Casero', 'Postre de café expreso con queso mascarpone.', 65.00, 'postre', TRUE),
(5, 'Cerveza Artesanal Porter', 'Cerveza oscura artesanal malteada nacional.', 45.00, 'bebida', TRUE);