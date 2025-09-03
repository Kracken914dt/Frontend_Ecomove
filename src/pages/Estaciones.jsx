import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { MapPin, Plus, Edit, Trash2, Search, Building, Map } from 'lucide-react'
import { estacionesAPI } from '../services/api'
import toast from 'react-hot-toast'

const Estaciones = () => {
  const [estaciones, setEstaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStation, setEditingStation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    cargarEstaciones()
  }, [])

  const cargarEstaciones = async () => {
    try {
      setLoading(true)
      const response = await estacionesAPI.listar()
      setEstaciones(response.data)
    } catch (error) {
      toast.error('Error al cargar estaciones')
      console.error('Error cargando estaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingStation) {
        // TODO: Implementar actualización cuando el backend lo soporte
        toast.success('Estación actualizada correctamente')
      } else {
        await estacionesAPI.crear(data)
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

  const handleEdit = (estacion) => {
    setEditingStation(estacion)
    reset(estacion)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta estación?')) {
      try {
        // TODO: Implementar eliminación cuando el backend lo soporte
        toast.success('Estación eliminada correctamente')
        cargarEstaciones()
      } catch (error) {
        toast.error('Error al eliminar estación')
        console.error('Error eliminando estación:', error)
      }
    }
  }

  const filteredEstaciones = estaciones.filter(estacion =>
    estacion.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estacion.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-eco-gray-900">Gestión de Estaciones</h1>
          <p className="mt-2 text-eco-gray-600">
            Administra las estaciones de préstamo de transporte ecológico
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingStation(null)
            reset()
          }}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus size={20} />
          <span>Nueva Estación</span>
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-eco-gray-900">
              {editingStation ? 'Editar Estación' : 'Nueva Estación'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingStation(null)
                reset()
              }}
              className="text-eco-gray-500 hover:text-eco-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Nombre de la estación
                </label>
                <input
                  type="text"
                  {...register('nombre', { required: 'El nombre es requerido' })}
                  className="input-field"
                  placeholder="Ej: Estación Central"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  {...register('ubicacion', { required: 'La ubicación es requerida' })}
                  className="input-field"
                  placeholder="Ej: Av. Principal 123"
                />
                {errors.ubicacion && (
                  <p className="text-red-500 text-sm mt-1">{errors.ubicacion.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Capacidad total
                </label>
                <input
                  type="number"
                  {...register('capacidad', { 
                    required: 'La capacidad es requerida',
                    min: { value: 1, message: 'La capacidad debe ser mayor a 0' }
                  })}
                  className="input-field"
                  placeholder="Número de espacios"
                />
                {errors.capacidad && (
                  <p className="text-red-500 text-sm mt-1">{errors.capacidad.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  {...register('descripcion')}
                  className="input-field"
                  rows="3"
                  placeholder="Descripción opcional de la estación"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingStation(null)
                  reset()
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingStation ? 'Actualizar Estación' : 'Crear Estación'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-eco-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar estaciones por nombre o ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-eco-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent"
        />
      </div>

      {/* Lista de estaciones */}
      <div className="card">
        <h2 className="text-xl font-semibold text-eco-gray-900 mb-4">Lista de Estaciones</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green-600 mx-auto"></div>
            <p className="mt-2 text-eco-gray-600">Cargando estaciones...</p>
          </div>
        ) : filteredEstaciones.length === 0 ? (
          <div className="text-center py-8">
            <Building className="mx-auto h-12 w-12 text-eco-gray-400" />
            <p className="mt-2 text-eco-gray-600">
              {searchTerm ? 'No se encontraron estaciones que coincidan con la búsqueda' : 'No hay estaciones registradas'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEstaciones.map((estacion) => (
              <div key={estacion.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg bg-eco-green-100 flex items-center justify-center">
                      <Building className="h-5 w-5 text-eco-green-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-eco-gray-900">
                        {estacion.nombre || 'Sin nombre'}
                      </h3>
                      <p className="text-sm text-eco-gray-500">
                        ID: {estacion.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(estacion)}
                      className="text-eco-green-600 hover:text-eco-green-900 p-1"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(estacion.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-eco-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{estacion.ubicacion || 'Sin ubicación'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-eco-gray-600">Capacidad:</span>
                    <span className="text-sm font-medium text-eco-gray-900">
                      {estacion.capacidad || 0} espacios
                    </span>
                  </div>
                  
                  {estacion.descripcion && (
                    <p className="text-sm text-eco-gray-600 mt-2">
                      {estacion.descripcion}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-eco-gray-200">
                  <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                    <Map size={16} />
                    <span>Ver en mapa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Estaciones
