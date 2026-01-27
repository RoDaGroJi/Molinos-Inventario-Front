/**
 * Servicio API centralizado
 * Maneja todas las peticiones HTTP a la API
 */

import CONFIG from '../config';

class ApiService {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.timeout = CONFIG.API_TIMEOUT;
  }

  /**
   * Realiza una petición HTTP
   * @param {string} endpoint - Ruta del endpoint
   * @param {object} options - Opciones de la petición (method, body, headers, etc)
   * @returns {Promise<object>} Respuesta del servidor
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      ...otherOptions
    } = options;

    const token = localStorage.getItem(CONFIG.TOKEN_KEY);

    const finalHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers: finalHeaders,
      ...otherOptions,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (response.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
        window.location.href = '/';
        throw new Error(CONFIG.ERRORS.UNAUTHORIZED);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: CONFIG.ERRORS.SERVER_ERROR,
        }));
        throw new Error(error.detail || CONFIG.ERRORS.ERROR);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(CONFIG.ERRORS.NETWORK_ERROR);
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  post(endpoint, body = null, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  put(endpoint, body = null, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Endpoint de login
   */
  async login(username, password) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: CONFIG.ERRORS.INVALID_CREDENTIALS,
      }));
      throw new Error(error.detail || CONFIG.ERRORS.INVALID_CREDENTIALS);
    }

    return await response.json();
  }

  /**
   * Obtiene usuario actual
   */
  getCurrentUser() {
    return this.get('/me');
  }

  /**
   * Operaciones de Empleados
   */
  getEmpleados(search = '') {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.get(`/empleados/${params}`);
  }

  getEmpleadoById(id) {
    return this.get(`/empleados/${id}`);
  }

  createEmpleado(data) {
    return this.post('/empleados/', data);
  }

  updateEmpleado(id, data) {
    return this.put(`/empleados/${id}`, data);
  }

  deleteEmpleado(id) {
    return this.delete(`/empleados/${id}`);
  }

  /**
   * Operaciones de Productos
   */
  getProductos(search = '') {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.get(`/productos/${params}`);
  }

  getProductoById(id) {
    return this.get(`/productos/${id}`);
  }

  createProducto(data) {
    return this.post('/productos/', data);
  }

  updateProducto(id, data) {
    return this.put(`/productos/${id}`, data);
  }

  deleteProducto(id) {
    return this.delete(`/productos/${id}`);
  }

  /**
   * Operaciones de Catálogos (Áreas, Empresas, Cargos, etc)
   */
  getCatalog(type) {
    return this.get(`/${type}/`);
  }

  createCatalog(type, data) {
    return this.post(`/${type}/`, data);
  }

  updateCatalog(type, id, data) {
    return this.put(`/${type}/${id}`, data);
  }

  deleteCatalog(type, id) {
    return this.delete(`/${type}/${id}`);
  }

  /**
   * Operaciones de Inventario
   */
  getInventory(empleadoId = null) {
    const endpoint = empleadoId ? `/inventory/?empleado_id=${empleadoId}` : '/inventory/';
    return this.get(endpoint);
  }

  createInventory(data) {
    return this.post('/inventory/', data);
  }

  updateInventory(id, data) {
    return this.put(`/inventory/${id}`, data);
  }

  deleteInventory(id) {
    return this.delete(`/inventory/${id}`);
  }
}

export default new ApiService();
