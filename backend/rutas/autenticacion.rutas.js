const express = require('express');
const router = express.Router();
const AutenticacionControlador = require('../controladores/autenticacion.controlador');

/**
 * Rutas del módulo de autenticación
 */
router.post('/login', AutenticacionControlador.login);
router.post('/registro', AutenticacionControlador.registro);

module.exports = router;
