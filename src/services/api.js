import axios from 'axios'

const API_BASE_URL = '/api' || import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000,
  withCredentials: false
})

// Interceptor para adjuntar el token en cada request
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {}
  return config
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
  login: (credenciales) => api.post('/usuarios/login', credenciales),
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
  checkoutStripe: (payload) => api.post('/pago-online/stripe/checkout', payload),
}

export const geocodeAPI = {
  geocode: (address) => api.get(`/geocode?address=${encodeURIComponent(address)}`),
}


export default api
