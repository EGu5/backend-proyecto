const express = require('express');
const router = express.Router();
const PedidosControlador = require('../controladores/pedidos.controlador');

/**
 * Rutas de pedidos
 */
router.post('/', PedidosControlador.crear);
router.get('/historial/:idCliente', PedidosControlador.obtenerHistorial);

module.exports = router;
