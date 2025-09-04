import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Truck, Plus, Edit, Trash2, Search, Bike, Zap, MapPin } from 'lucide-react'
import { transportesAPI, estacionesAPI } from '../services/api'
import toast from 'react-hot-toast'

const Transportes = () => {
  const [transportes, setTransportes] = useState([])
  const [estaciones, setEstaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransport, setEditingTransport] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    cargarDatos()
  }, [])

  // Primero modificamos la función cargarDatos para obtener las estaciones y sus transportes
  const cargarDatos = async () => {
    try {
      setLoading(true)
      // Obtener transportes y estaciones
      const [transportesRes, estacionesRes] = await Promise.all([
        transportesAPI.listar(),
        estacionesAPI.listar()
      ])

      // Filtrar transportes activos
      const transportesActivos = transportesRes.data.filter(
        transporte => !transporte.eliminado && transporte.estado !== 'FUERA_DE_SERVICIO'
      )

      // Crear un mapa para buscar estaciones por el ID del transporte
      const estacionPorTransporte = {}
      estacionesRes.data.forEach(estacion => {
        if (estacion.transportes && Array.isArray(estacion.transportes)) {
          estacion.transportes.forEach(transporteId => {
            estacionPorTransporte[transporteId] = {
              ubicacion: estacion.ubicacion,
              capacidad: estacion.capacidad,
              id: estacion.id
            }
          })
        }
      })

      // Agregar información de la estación a cada transporte
      const transportesConEstacion = transportesActivos.map(transporte => ({
        ...transporte,
        estacion: estacionPorTransporte[transporte.id] || null
      }))

      setTransportes(transportesConEstacion)
    } catch (error) {
      toast.error('Error al cargar datos')
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingTransport) {
        // Simulamos actualización creando un nuevo registro con el mismo ID
        await transportesAPI.crear({
          ...data,
          id: editingTransport.id
        })
        toast.success('Transporte actualizado correctamente')
      } else {
        await transportesAPI.crear(data)
        toast.success('Transporte creado correctamente')
      }
      reset()
      setShowForm(false)
      setEditingTransport(null)
      cargarDatos()
    } catch (error) {
      toast.error('Error al guardar transporte')
      console.error('Error guardando transporte:', error)
    }
  }

  const handleEdit = async (transporte) => {
    try {
      const response = await transportesAPI.obtenerPorId(transporte.id)
      const transporteCompleto = response.data
      setEditingTransport(transporteCompleto)
      reset(transporteCompleto)
      setShowForm(true)
    } catch (error) {
      toast.error('Error al cargar datos del transporte')
      console.error('Error cargando transporte:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este transporte?')) {
      try {
        // Simulamos eliminación creando un nuevo registro con estado inactivo
        await transportesAPI.crear({
          id: id,
          estado: 'FUERA_DE_SERVICIO',
          eliminado: true
        })
        toast.success('Transporte eliminado correctamente')
        cargarDatos()
      } catch (error) {
        toast.error('Error al eliminar transporte')
        console.error('Error eliminando transporte:', error)
      }
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'DISPONIBLE':
        return 'bg-eco-green-100 text-eco-green-800'
      case 'EN_USO':
        return 'bg-blue-100 text-blue-800'
      case 'MANTENIMIENTO':
        return 'bg-yellow-100 text-yellow-800'
      case 'FUERA_DE_SERVICIO':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-eco-gray-100 text-eco-gray-800'
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'BICICLETA':
        return <Bike className="h-5 w-5" />
      case 'PATINETA':
        return <Zap className="h-5 w-5" />
      default:
        return <Truck className="h-5 w-5" />
    }
  }

  const filteredTransportes = transportes.filter(transporte =>
    transporte.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transporte.estado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transporte.estacion?.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-eco-gray-900">Gestión de Transportes</h1>
          <p className="mt-2 text-eco-gray-600">
            Administra los medios de transporte ecológico disponibles
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingTransport(null)
            reset()
          }}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus size={20} />
          <span>Nuevo Transporte</span>
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-eco-gray-900">
              {editingTransport ? 'Editar Transporte' : 'Nuevo Transporte'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingTransport(null)
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
                  Tipo de transporte
                </label>
                <select
                  {...register('tipo', { required: 'El tipo es requerido' })}
                  className="input-field"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="BICICLETA">Bicicleta</option>
                  <option value="SCOOTER">Scooter</option>
                </select>
                {errors.tipo && (
                  <p className="text-red-500 text-sm mt-1">{errors.tipo.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Estado
                </label>
                <select
                  {...register('estado', { required: 'El estado es requerido' })}
                  className="input-field"
                >
                  <option value="">Seleccionar estado</option>
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="EN_USO">En uso</option>
                  <option value="MANTENIMIENTO">Mantenimiento</option>
                </select>
                {errors.estado && (
                  <p className="text-red-500 text-sm mt-1">{errors.estado.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingTransport(null)
                  reset()
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingTransport ? 'Actualizar Transporte' : 'Crear Transporte'}
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
          placeholder="Buscar transportes por tipo o estado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-eco-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent"
        />
      </div>

      {/* Lista de transportes */}
      <div className="card">
        <h2 className="text-xl font-semibold text-eco-gray-900 mb-4">Lista de Transportes</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green-600 mx-auto"></div>
            <p className="mt-2 text-eco-gray-600">Cargando transportes...</p>
          </div>
        ) : filteredTransportes.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="mx-auto h-12 w-12 text-eco-gray-400" />
            <p className="mt-2 text-eco-gray-600">
              {searchTerm ? 'No se encontraron transportes que coincidan con la búsqueda' : 'No hay transportes registrados'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-eco-gray-200">
              <thead className="bg-eco-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Transporte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Información
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-eco-gray-200">
                {filteredTransportes.map((transporte) => (
                  <tr key={transporte.id} className="hover:bg-eco-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-eco-green-100 flex items-center justify-center">
                          {getTipoIcon(transporte.tipo)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-eco-gray-900">
                            Transporte {transporte.tipo}
                          </div>
                          <div className="text-sm text-eco-gray-500">
                            ID: {transporte.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTipoIcon(transporte.tipo)}
                        <span className="ml-2 text-sm text-eco-gray-900">
                          {transporte.tipo || 'Sin tipo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(transporte.estado)}`}>
                        {transporte.estado || 'Sin estado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-eco-gray-900">
                      {transporte.estacion ? (
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-eco-green-50 flex items-center justify-center mr-2">
                            <MapPin className="h-4 w-4 text-eco-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              Estación: {transporte.estacion.ubicacion}
                            </div>
                            <div className="text-eco-gray-500 text-xs">
                              Capacidad: {transporte.estacion.capacidad || 0}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-eco-gray-500 italic">Sin estación asignada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(transporte)}
                          className="text-eco-green-600 hover:text-eco-green-900 p-1"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(transporte.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

export default Transportes
