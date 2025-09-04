import React, { useState, useEffect } from 'react'
import { Clock, Search, Filter, Calendar, User, MapPin, Truck, DollarSign, Eye } from 'lucide-react'
import { prestamosAPI, usuariosAPI, transportesAPI, estacionesAPI } from '../services/api'
import toast from 'react-hot-toast'

const Historial = () => {
  const [prestamos, setPrestamos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [dateFilter, setDateFilter] = useState('30')

  useEffect(() => {
    cargarDatos()
  }, [])

const cargarDatos = async () => {
  try {
    setLoading(true)
    
    // 1. Primero obtenemos usuarios y datos maestros
    const [usuariosRes, transportesRes, estacionesRes] = await Promise.all([
      usuariosAPI.listar(),
      transportesAPI.listar(),
      estacionesAPI.listar()
    ])

    // 2. Filtramos usuarios activos
    const usuariosActivos = usuariosRes.data.filter(
      usuario => usuario.nombre && usuario.correo
    )
    setUsuarios(usuariosActivos)

    // 3. Crear mapas para búsqueda rápida
    const transportesMap = transportesRes.data.reduce((map, t) => {
      if (t.tipo) map[t.id] = t
      return map
    }, {})

    const estacionesMap = estacionesRes.data.reduce((map, e) => {
      if (e.ubicacion) map[e.id] = e
      return map
    }, {})

    // 4. Obtener préstamos solo del usuario seleccionado si hay uno
    let todosLosPrestamos = []
    
    if (selectedUser) {
      // Si hay un usuario seleccionado, solo traemos sus préstamos
      try {
        const prestamosRes = await prestamosAPI.historialPorUsuario(selectedUser)
        todosLosPrestamos = prestamosRes.data
      } catch (error) {
        console.error('Error obteniendo préstamos del usuario:', error)
      }
    } else {
      // Si no hay usuario seleccionado, traemos los préstamos de todos
      const prestamosPromesas = usuariosActivos.map(usuario =>
        prestamosAPI.historialPorUsuario(usuario.id)
          .then(response => response.data)
          .catch(() => [])
      )
      const resultados = await Promise.all(prestamosPromesas)
      todosLosPrestamos = resultados.flat()
    }

    // 5. Enriquecer los préstamos con información relacionada
    const prestamosConInfo = todosLosPrestamos.map(prestamo => {
      const usuario = usuariosActivos.find(u => u.id === prestamo.usuarioId)
      return {
        ...prestamo,
        usuario: usuario || { nombre: 'Usuario no encontrado' },
        transporte: transportesMap[prestamo.transporteId] || { tipo: 'Sin tipo' },
        estacionOrigen: estacionesMap[prestamo.estacionOrigenId] || { ubicacion: 'No disponible' },
        estacionDestino: estacionesMap[prestamo.estacionDestinoId] || { ubicacion: 'No disponible' }
      }
    })

    setPrestamos(prestamosConInfo)
    
  } catch (error) {
    console.error('Error cargando datos:', error)
    toast.error('Error al cargar los datos del historial')
  } finally {
    setLoading(false)
  }
}

// Actualizar useEffect para recargar cuando cambie el usuario seleccionado
useEffect(() => {
  cargarDatos()
}, [selectedUser]) // Agregamos selectedUser como dependencia

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'COMPLETADO':
        return 'bg-eco-green-100 text-eco-green-800'
      case 'EN_CURSO':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELADO':
        return 'bg-red-100 text-red-800'
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-eco-gray-100 text-eco-gray-800'
    }
  }

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'COMPLETADO':
        return 'Completado'
      case 'EN_CURSO':
        return 'En curso'
      case 'CANCELADO':
        return 'Cancelado'
      case 'PENDIENTE':
        return 'Pendiente'
      default:
        return estado || 'Sin estado'
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'BICICLETA':
        return <Truck className="h-4 w-4" />
      case 'PATINETA':
        return <Truck className="h-4 w-4" />
      default:
        return <Truck className="h-4 w-4" />
    }
  }

  const filteredPrestamos = prestamos.filter(prestamo => {
    const matchesSearch = prestamo.id?.toString().includes(searchTerm) ||
                         prestamo.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesUser = !selectedUser || prestamo.usuarioId == selectedUser
    
    return matchesSearch && matchesUser
  })

  const getDateFilterText = (days) => {
    switch (days) {
      case '7':
        return 'Últimos 7 días'
      case '30':
        return 'Últimos 30 días'
      case '90':
        return 'Últimos 90 días'
      case '365':
        return 'Último año'
      default:
        return 'Todos los días'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-eco-gray-900">Historial de Préstamos</h1>
        <p className="mt-2 text-eco-gray-600">
          Consulta el historial completo de préstamos de transporte ecológico
        </p>
      </div>

      {/* Filtros */}
      <div className="card">
        <h2 className="text-lg font-semibold text-eco-gray-900 mb-4">Filtros de Búsqueda</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por usuario */}
          <div>
            <label className="block text-sm font-medium text-eco-gray-700 mb-2">
              Filtrar por usuario
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="input-field"
            >
              <option value="">Todos los usuarios</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre} - {usuario.documento}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por fecha */}
          <div>
            <label className="block text-sm font-medium text-eco-gray-700 mb-2">
              Período de tiempo
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="365">Último año</option>
              <option value="all">Todos los días</option>
            </select>
          </div>

          {/* Búsqueda por ID */}
          <div>
            <label className="block text-sm font-medium text-eco-gray-700 mb-2">
              Buscar por ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-eco-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-eco-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tag de filtro activo */}
        <div className="mt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-eco-green-100 text-eco-green-800">
            <Calendar className="h-4 w-4 mr-2" />
            {getDateFilterText(dateFilter)}
          </span>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-eco-green-600">
            {filteredPrestamos.length}
          </div>
          <div className="text-sm text-eco-gray-600">Total de préstamos</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {filteredPrestamos.filter(p => p.estado === 'COMPLETADO').length}
          </div>
          <div className="text-sm text-eco-gray-600">Completados</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredPrestamos.filter(p => p.estado === 'EN_CURSO').length}
          </div>
          <div className="text-sm text-eco-gray-600">En curso</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {filteredPrestamos.filter(p => p.estado === 'CANCELADO').length}
          </div>
          <div className="text-sm text-eco-gray-600">Cancelados</div>
        </div>
      </div>

      {/* Lista de préstamos */}
      <div className="card">
        <h2 className="text-xl font-semibold text-eco-gray-900 mb-4">Historial de Préstamos</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green-600 mx-auto"></div>
            <p className="mt-2 text-eco-gray-600">Cargando historial...</p>
          </div>
        ) : filteredPrestamos.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-eco-gray-400" />
            <p className="mt-2 text-eco-gray-600">
              {searchTerm || selectedUser ? 'No se encontraron préstamos que coincidan con los filtros' : 'No hay préstamos en el historial'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-eco-gray-200">
              <thead className="bg-eco-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Préstamo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Ruta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-eco-gray-200">
                {filteredPrestamos.map((prestamo) => (
                  <tr key={prestamo.id} className="hover:bg-eco-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-eco-green-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-eco-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-eco-gray-900">
                            #{prestamo.id}
                          </div>
                          <div className="text-sm text-eco-gray-500">
                            {prestamo.inicio ? new Date(prestamo.inicio).toLocaleDateString() : 'Sin fecha'} - {prestamo.fin ? new Date(prestamo.fin).toLocaleDateString() : 'Sin fecha'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-eco-gray-400 mr-2" />
                        <span className="text-sm text-eco-gray-900">
                          {prestamo.usuario?.nombre || 'Usuario no encontrado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTipoIcon(prestamo.transporte?.tipo)}
                        <span className="ml-2 text-sm text-eco-gray-900">
                          {prestamo.transporte?.tipo || 'Sin tipo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-eco-gray-900">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-eco-gray-400 mr-1" />
                        <span>
                          Estación {prestamo.estacionOrigen?.ubicacion || 'No disponible'} 
                          <span className="mx-2">→</span> 
                          Estación {prestamo.estacionDestino?.ubicacion || 'No disponible'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(prestamo.transporte?.estado)}`}>
                        {getEstadoText(prestamo.transporte?.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-eco-gray-900">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-eco-gray-400 mr-1" />
                        <span>
                          ${prestamo.costo ? prestamo.costo.toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-eco-green-600 hover:text-eco-green-900 p-1">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Historial
