import axios from 'axios'

const API_BASE_URL = 'https://ecomove-v1.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// Usuarios
export const usuariosAPI = {
  crear: (usuario) => api.post('/usuarios', usuario),
  listar: () => api.get('/usuarios'),
  obtenerPorId: (id) => api.get(`/usuarios/${id}`),
}

// Estaciones
export const estacionesAPI = {
  crear: (estacion) => api.post('/estaciones', estacion),
  listar: () => api.get('/estaciones'),
  obtenerPorId: (id) => api.get(`/estaciones/${id}`),
}

// Transportes
export const transportesAPI = {
  crear: (transporte) => api.post('/transportes', transporte),
  listar: () => api.get('/transportes'),
  obtenerPorId: (id) => api.get(`/transportes/${id}`),
}

// Préstamos
export const prestamosAPI = {
  crear: (prestamo) => api.post('/prestamos', prestamo),
  finalizar: (id, datos) => api.put(`/prestamos/${id}/finalizar`, datos),
  historialPorUsuario: (usuarioId) => api.get(`/prestamos/usuario/${usuarioId}`)
}

// Pagos
export const pagosAPI = {
  listar: () => api.get('/pagos'),
  obtenerPorId: (id) => api.get(`/pagos/${id}`),
}

export default api
