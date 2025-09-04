import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { MapPin, Plus, Edit, Trash2, Search, Building, Map } from 'lucide-react'
import { estacionesAPI, transportesAPI } from '../services/api'
import toast from 'react-hot-toast'

const Estaciones = () => {
  const [estaciones, setEstaciones] = useState([])
  const [transportes, setTransportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStation, setEditingStation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [transportesAsignados, setTransportesAsignados] = useState({})

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    cargarEstaciones()
  }, [])

  const cargarEstaciones = async () => {
    try {
      setLoading(true)
      const [estacionesRes, transportesRes] = await Promise.all([
        estacionesAPI.listar(),
        transportesAPI.listar()
      ])
      
      // Filtramos estaciones activas
      const estacionesActivas = estacionesRes.data.filter(
        estacion => !estacion.eliminado && estacion.estado !== 'INACTIVO'
      )
      setEstaciones(estacionesActivas)

      // Crear mapa de transportes asignados
      const transportesAsignadosMap = {}
      estacionesActivas.forEach(estacion => {
        if (estacion.transportes) {
          estacion.transportes.forEach(transporteId => {
            transportesAsignadosMap[transporteId] = estacion.id
          })
        }
      })
      setTransportesAsignados(transportesAsignadosMap)

      // Filtramos transportes disponibles
      const transportesDisponibles = transportesRes.data.filter(
        transporte => transporte.estado === 'DISPONIBLE'
      )
      setTransportes(transportesDisponibles)
    } catch (error) {
      toast.error('Error al cargar datos')
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      // Validar que los transportes seleccionados no estén asignados a otras estaciones
      const transportesSeleccionados = Array.isArray(data.transportes) ? 
        data.transportes : [data.transportes]

      const transportesInvalidos = transportesSeleccionados.filter(transporteId => {
        const estacionAsignada = transportesAsignados[transporteId]
        return estacionAsignada && (!editingStation || estacionAsignada !== editingStation.id)
      })

      if (transportesInvalidos.length > 0) {
        toast.error('Algunos transportes seleccionados ya están asignados a otras estaciones')
        return
      }

      const estacionData = {
        ...data,
        capacidad: parseInt(data.capacidad),
        transportes: transportesSeleccionados
      }

      if (editingStation) {
        await estacionesAPI.crear({
          ...estacionData,
          id: editingStation.id
        })
        toast.success('Estación actualizada correctamente')
      } else {
        await estacionesAPI.crear(estacionData)
        toast.success('Estación creada correctamente')
      }
      reset()
      setShowForm(false)
      setEditingStation(null)
      cargarEstaciones()
    } catch (error) {
      toast.error('Error al guardar estación')
      console.error('Error guardando estación:', error)
    }
  }

  const handleEdit = async (estacion) => {
    try {
      const response = await estacionesAPI.obtenerPorId(estacion.id)
      const estacionCompleta = response.data
      setEditingStation(estacionCompleta)
      reset(estacionCompleta)
      setShowForm(true)
    } catch (error) {
      toast.error('Error al cargar datos de la estación')
      console.error('Error cargando estación:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta estación?')) {
      try {
        // Simulamos eliminación creando un nuevo registro con estado inactivo
        await estacionesAPI.crear({
          id: id,
          estado: 'INACTIVO',
          eliminado: true
        })
        toast.success('Estación eliminada correctamente')
        cargarEstaciones()
      } catch (error) {
        toast.error('Error al eliminar estación')
        console.error('Error eliminando estación:', error)
      }
    }
  }

  const filteredEstaciones = estaciones.filter(estacion =>
    estacion.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-eco-green-600 to-eco-green-700 rounded-2xl p-8 text-white animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">🏢 Gestión de Estaciones</h1>
            <p className="text-eco-green-100 text-lg">
              Administra las estaciones de préstamo de transporte ecológico de EcoMove
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingStation(null)
              reset()
            }}
            className="bg-white text-eco-green-700 hover:bg-eco-green-50 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mt-6 lg:mt-0 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus size={24} />
            <span>Nueva Estación</span>
          </button>
        </div>
      </div>

      {/* Formulario mejorado */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-eco-gray-900">
                {editingStation ? '✏️ Editar Estación' : '🏗️ Nueva Estación'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingStation(null)
                  reset()
                }}
                className="text-eco-gray-500 hover:text-eco-gray-700 p-2 hover:bg-eco-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-eco-gray-700 mb-3">
                    📍 Ubicación *
                  </label>
                  <input
                    type="text"
                    {...register('ubicacion', { required: 'La ubicación es requerida' })}
                    className="w-full px-4 py-3 border border-eco-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ej: Av. Principal 123, Centro"
                  />
                  {errors.ubicacion && (
                    <p className="text-red-500 text-sm mt-2">{errors.ubicacion.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-eco-gray-700 mb-3">
                    🚗 Capacidad total *
                  </label>
                  <input
                    type="number"
                    {...register('capacidad', { 
                      required: 'La capacidad es requerida',
                      min: { value: 1, message: 'La capacidad debe ser mayor a 0' }
                    })}
                    className="w-full px-4 py-3 border border-eco-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Número de espacios disponibles"
                  />
                  {errors.capacidad && (
                    <p className="text-red-500 text-sm mt-2">{errors.capacidad.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-eco-gray-700 mb-3">
                    🚲 Transportes Disponibles *
                  </label>
                  <select
                    multiple
                    {...register('transportes', { required: 'Seleccione al menos un transporte' })}
                    className="w-full px-4 py-3 border border-eco-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
                  >
                    {transportes.map((transporte) => {
                      const estacionAsignada = transportesAsignados[transporte.id]
                      const estacionActual = editingStation ? editingStation.id : null
                      const estaAsignadoAOtraEstacion = estacionAsignada && estacionAsignada !== estacionActual
                      
                      return (
                        <option 
                          key={transporte.id} 
                          value={transporte.id}
                          disabled={estaAsignadoAOtraEstacion}
                          className={estaAsignadoAOtraEstacion ? 'text-gray-400' : ''}
                        >
                          {transporte.tipo} 
                          {estaAsignadoAOtraEstacion ? ' (Asignado a otra estación)' : ''}
                        </option>
                      )
                    })}
                  </select>
                  {errors.transportes && (
                    <p className="text-red-500 text-sm mt-2">{errors.transportes.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingStation(null)
                    reset()
                  }}
                  className="px-6 py-3 border border-eco-gray-300 text-eco-gray-700 rounded-xl font-medium hover:bg-eco-gray-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-eco-green-600 text-white rounded-xl font-medium hover:bg-eco-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  {editingStation ? '🔄 Actualizar Estación' : '✅ Crear Estación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Búsqueda mejorada */}
      <div className="relative animate-fade-in">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-eco-gray-400 transition-all duration-300 group-hover:scale-110" size={20} />
        <input
          type="text"
          placeholder="🔍 Buscar estaciones por ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 w-full border border-eco-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent transition-all duration-300 hover:shadow-md focus:shadow-lg"
        />
      </div>

      {/* Lista de estaciones mejorada */}
      <div className="bg-white rounded-2xl shadow-lg border border-eco-gray-100 overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-eco-gray-200">
          <h2 className="text-2xl font-bold text-eco-gray-900 flex items-center">
            <Building className="h-6 w-6 mr-3 text-eco-green-600" />
            Lista de Estaciones ({filteredEstaciones.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="text-center py-16">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-eco-green-100 to-eco-green-200 flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-eco-gray-900 mb-2">Cargando estaciones</h3>
            <p className="text-eco-gray-600 text-lg">Obteniendo información del sistema...</p>
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-eco-green-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-eco-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-eco-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : filteredEstaciones.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-eco-green-100 to-eco-green-200 flex items-center justify-center mb-6">
              <Building className="h-12 w-12 text-eco-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-eco-gray-900 mb-2">
              {searchTerm ? 'No se encontraron estaciones' : 'No hay estaciones registradas'}
            </h3>
            <p className="text-eco-gray-600 text-lg mb-6">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Comienza creando tu primera estación para gestionar transportes ecológicos'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setShowForm(true)
                  setEditingStation(null)
                  reset()
                }}
                className="px-8 py-4 bg-gradient-to-r from-eco-green-600 to-eco-green-700 text-white rounded-xl font-medium hover:from-eco-green-700 hover:to-eco-green-800 transition-all duration-200 shadow-lg hover:shadow-xl animate-bounce-in"
              >
                🏗️ Crear primera estación
              </button>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEstaciones.map((estacion) => (
                <div key={estacion.id} className="bg-gradient-to-br from-white to-eco-green-50 rounded-2xl p-6 shadow-lg border border-eco-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-eco-green-500 to-eco-green-600 flex items-center justify-center">
                        <Building className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-eco-gray-900">
                          {estacion.ubicacion || 'Sin ubicación'}
                        </h3>
                        <p className="text-sm text-eco-gray-500">
                          ID: {estacion.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(estacion)}
                        className="p-2 text-eco-green-600 hover:text-eco-green-800 hover:bg-eco-green-100 rounded-lg transition-colors duration-200"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(estacion.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-eco-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-eco-green-500" />
                      <span className="font-medium">{estacion.ubicacion || 'Sin ubicación'}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-eco-green-100 rounded-lg">
                        <p className="text-xs text-eco-gray-600">Capacidad</p>
                        <p className="text-lg font-bold text-eco-green-700">
                          {estacion.capacidad || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-blue-100 rounded-lg">
                        <p className="text-xs text-eco-gray-600">Disponibles</p>
                        <p className="text-lg font-bold text-blue-700">
                          {estacion.capacidad || 0}
                        </p>
                      </div>
                    </div>
                    
                    {estacion.transportes && estacion.transportes.length > 0 && (
                      <div className="mt-3 p-3 bg-eco-gray-50 rounded-lg">
                        <p className="text-sm text-eco-gray-600 font-semibold mb-2">
                          Transportes asignados:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {estacion.transportes.map((transporteId) => {
                            const transporte = transportes.find(t => t.id === transporteId)
                            return (
                              <span key={transporteId} className="px-2 py-1 bg-eco-green-100 text-eco-green-800 rounded-lg text-sm">
                                {transporte ? transporte.tipo : 'Transporte'} 
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-eco-gray-200">
                    <button className="w-full bg-gradient-to-r from-eco-green-600 to-eco-green-700 text-white py-3 rounded-xl font-medium hover:from-eco-green-700 hover:to-eco-green-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                      <Map size={18} />
                      <span>Ver detalles</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Estaciones
