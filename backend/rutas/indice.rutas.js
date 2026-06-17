const express = require('express');
const router = express.Router();

const productosRutas = require('./productos.rutas');
const autenticacionRutas = require('./autenticacion.rutas');
const pedidosRutas = require('./pedidos.rutas');

/**
 * Mapeo de rutas raíz a sub-rutas específicas del sistema
 */
router.use('/productos', productosRutas);
router.use('/autenticacion', autenticacionRutas);
router.use('/pedidos', pedidosRutas);

module.exports = router;
