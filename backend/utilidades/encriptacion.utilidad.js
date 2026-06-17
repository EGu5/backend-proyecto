const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

// Algoritmo de cifrado y clave secreta
const ALGORITMO = 'aes-256-cbc';
const CLAVE_SECRETA = process.env.CLAVE_ENCRIPTACION || '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c';

// Ajustar clave a exactamente 32 bytes (256 bits) para cumplir requerimiento de aes-256
const CLAVE_BUFFER = Buffer.alloc(32, CLAVE_SECRETA, 'utf8');

// Vector de Inicialización (IV) estático para la encriptación determinista del correo (búsquedas por ID unico)
const IV_ESTATICO_CORREO = Buffer.alloc(16, 'pizzapizza_mail_iv', 'utf8');

/**
 * Genera un hash asíncrono y seguro para almacenar contraseñas de manera irreversible.
 * 
 * Intención: Almacenar passwords cifradas bajo estándar industrial.
 * Parámetros:
 *   - contrasena: {string} La contraseña en texto plano.
 * Retorno: {Promise<string>} Hash generado mediante bcrypt.
 * Casos límite (edge cases):
 *   - Si la contraseña no es una cadena válida, el método generará una excepción.
 */
async function hashContrasena(contrasena) {
  const sal = await bcrypt.genSalt(10);
  return await bcrypt.hash(contrasena, sal);
}

/**
 * Realiza la comparación segura de una contraseña en texto plano contra su hash almacenado.
 * 
 * Intención: Autenticar el acceso comprobando la contraseña provista.
 * Parámetros:
 *   - contrasena: {string} Contraseña ingresada por el usuario.
 *   - hash: {string} Hash almacenado previamente.
 * Retorno: {Promise<boolean>} True si son equivalentes, false en caso contrario.
 * Casos límite (edge cases):
 *   - Si la contraseña o el hash están vacíos, retorna false.
 */
async function compararContrasena(contrasena, hash) {
  try {
    return await bcrypt.compare(contrasena, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Encripta un campo de texto (ej. dirección o teléfono) de manera no determinista (IV aleatorio).
 * 
 * Intención: Proteger datos sensibles (PII) en reposo impidiendo análisis de patrones.
 * Parámetros:
 *   - texto: {string} El texto plano a proteger.
 * Retorno: {string} Cadena en formato 'ivHexadecimal:textoEncriptadoHexadecimal'.
 * Casos límite (edge cases):
 *   - Si el texto está vacío, retorna una cadena vacía.
 */
function encriptarTexto(texto) {
  if (!texto) return '';
  const iv = crypto.randomBytes(16);
  const cifrador = crypto.createCipheriv(ALGORITMO, CLAVE_BUFFER, iv);
  let encriptado = cifrador.update(texto, 'utf8', 'hex');
  encriptado += cifrador.final('hex');
  return `${iv.toString('hex')}:${encriptado}`;
}

/**
 * Desencripta una cadena formateada como 'ivHexadecimal:textoEncriptadoHexadecimal'.
 * 
 * Intención: Recuperar el valor original legible del dato personal.
 * Parámetros:
 *   - textoCifrado: {string} Cadena con el formato de encriptación.
 * Retorno: {string} Texto original desencriptado.
 * Casos límite (edge cases):
 *   - Si la clave, IV o formato son inválidos, retorna una cadena vacía.
 */
function desencriptarTexto(textoCifrado) {
  if (!textoCifrado) return '';
  try {
    const partes = textoCifrado.split(':');
    if (partes.length !== 2) return '';
    
    const iv = Buffer.from(partes[0], 'hex');
    const textoEncriptado = partes[1];
    const descifrador = crypto.createDecipheriv(ALGORITMO, CLAVE_BUFFER, iv);
    
    let desencriptado = descifrador.update(textoEncriptado, 'hex', 'utf8');
    desencriptado += descifrador.final('utf8');
    return desencriptado;
  } catch (error) {
    return '';
  }
}

/**
 * Encripta el correo electrónico de forma determinista para indexación y búsquedas eficientes.
 * 
 * Intención: Proteger el correo permitiendo comprobar duplicidad de manera exacta mediante el hash constante de salida.
 * Parámetros:
 *   - correo: {string} Correo electrónico a encriptar.
 * Retorno: {string} Correo encriptado en formato hexadecimal.
 * Casos límite (edge cases):
 *   - Si el correo es nulo o vacío, retorna vacío.
 */
function encriptarCorreo(correo) {
  if (!correo) return '';
  const correoNormalizado = correo.trim().toLowerCase();
  const cifrador = crypto.createCipheriv(ALGORITMO, CLAVE_BUFFER, IV_ESTATICO_CORREO);
  let encriptado = cifrador.update(correoNormalizado, 'utf8', 'hex');
  encriptado += cifrador.final('hex');
  return encriptado;
}

/**
 * Desencripta un correo electrónico cifrado de forma determinista.
 * 
 * Intención: Obtener la dirección de correo legible para notificaciones o interfaz.
 * Parámetros:
 *   - correoCifrado: {string} Cadena hexadecimal encriptada.
 * Retorno: {string} Correo desencriptado.
 * Casos límite (edge cases):
 *   - Retorna vacío si el descifrado falla.
 */
function desencriptarCorreo(correoCifrado) {
  if (!correoCifrado) return '';
  try {
    const descifrador = crypto.createDecipheriv(ALGORITMO, CLAVE_BUFFER, IV_ESTATICO_CORREO);
    let desencriptado = descifrador.update(correoCifrado, 'hex', 'utf8');
    desencriptado += descifrador.final('utf8');
    return desencriptado;
  } catch (error) {
    return '';
  }
}

module.exports = {
  hashContrasena,
  compararContrasena,
  encriptarTexto,
  desencriptarTexto,
  encriptarCorreo,
  desencriptarCorreo
};
