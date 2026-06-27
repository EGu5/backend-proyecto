const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { probarConexion } = require('./configuracion/conexion');
const { inicializarTablas } = require('./configuracion/inicializarTablas');
const registrador = require('./utilidades/registrador.utilidad');
const registrarSolicitud = require('./middlewares/solicitudes.middleware');
const manejadorErroresGlobal = require('./middlewares/error.middleware');
const CorreoServicio = require('./servicios/correo.servicio');
const swaggerUi = require('swagger-ui-express');
const especificacionSwagger = require('./configuracion/swagger');

const app = express();
const PUERTO = process.env.PUERTO || 3000;

app.use(helmet({
  contentSecurityPolicy: false
}));

const origenPermitido = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: origenPermitido === '*' ? '*' : origenPermitido.split(','),
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(registrarSolicitud);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(especificacionSwagger));

const rutasDeLaApi = require('./rutas/indice.rutas');
app.use('/api', rutasDeLaApi);

app.get('/api/estado', async (peticion, respuesta) => {
  const baseDatosActiva = await probarConexion();
  
  respuesta.json({
    exito: true,
    mensaje: 'Servidor en funcionamiento correctamente.',
    servicios: {
      servidor: 'ACTIVO',
      baseDatos: baseDatosActiva ? 'CONECTADO' : 'DESCONECTADO'
    },
    marcaTiempo: new Date().toISOString()
  });
});

app.use(manejadorErroresGlobal);

app.listen(PUERTO, async () => {
  registrador.info(`Servidor backend corriendo exitosamente en el puerto ${PUERTO}`);
  
  const baseDatosConectada = await probarConexion();
  if (baseDatosConectada) {
    registrador.info('Conexión inicial a la base de datos MySQL establecida correctamente.');
    try {
      await inicializarTablas();
    } catch (error) {
      registrador.error('No se pudieron inicializar las tablas de la base de datos en el arranque.', { error: error.message });
    }
  } else {
    registrador.error('No se pudo establecer la conexión inicial a la base de datos MySQL.');
  }

  try {
    await CorreoServicio.verificarConexion();
  } catch (error) {
    registrador.error('[pizza pizza backend] El servicio de correo SMTP no está disponible.', { error: error.message });
  }
});

module.exports = app;