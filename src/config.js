/**
 * Configuración global de la aplicación
 */

const CONFIG = {
  // API
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://molinos-inventario-back.onrender.com',
  API_TIMEOUT: 30000,

  // Autenticación
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  
  // UI
  ITEMS_PER_PAGE: 10,
  LOADING_DELAY: 300,

  // Mensajes
  MESSAGES: {
    SUCCESS: 'Operación realizada exitosamente',
    ERROR: 'Ocurrió un error. Por favor intente nuevamente',
    LOADING: 'Cargando...',
    CONFIRM_DELETE: '¿Está seguro que desea eliminar este elemento?',
  },

  // Errores comunes
  ERRORS: {
    INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Operación no permitida',
    NOT_FOUND: 'Recurso no encontrado',
    NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
    SERVER_ERROR: 'Error del servidor. Por favor intente más tarde',
  },
};

export default CONFIG;
