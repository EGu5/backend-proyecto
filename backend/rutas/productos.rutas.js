const express = require('express');
const router = express.Router();
const ProductosControlador = require('../controladores/productos.controlador');

/**
 * Rutas de catálogo de productos
 */
router.get('/', ProductosControlador.obtenerProductos);

module.exports = router;
