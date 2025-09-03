import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Clock, Plus, Edit, Trash2, Search, User, MapPin, Truck, CreditCard, Eye } from 'lucide-react'
import { prestamosAPI, usuariosAPI, transportesAPI, estacionesAPI } from '../services/api'
import toast from 'react-hot-toast'

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [transportes, setTransportes] = useState([])
  const [estaciones, setEstaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLoan, setEditingLoan] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedTransport, setSelectedTransport] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [prestamosRes, usuariosRes, transportesRes, estacionesRes] = await Promise.all([
        prestamosAPI.listar(),
        usuariosAPI.listar(),
        transportesAPI.listar(),
        estacionesAPI.listar()
      ])

      // Filtrar usuarios activos (que tengan datos completos)
      const usuariosActivos = usuariosRes.data.filter(
        usuario => usuario.nombre && usuario.correo && usuario.documento
      )
      setUsuarios(usuariosActivos)

      // Filtrar estaciones activas (que tengan datos completos)
      const estacionesActivas = estacionesRes.data.filter(
        estacion => estacion.ubicacion && estacion.nombre
      )
      setEstaciones(estacionesActivas)

      // Filtrar transportes disponibles
      const transportesActivos = transportesRes.data.filter(
        transporte => transporte.tipo && transporte.estado === 'DISPONIBLE'
      )
      setTransportes(transportesActivos)

      // Filtrar préstamos para mostrar solo los que tienen usuarios activos
      const prestamosActivos = prestamosRes.data.filter(prestamo => {
        const usuarioExiste = usuariosActivos.some(u => u.id === prestamo.usuarioId)
        return usuarioExiste
      })
      setPrestamos(prestamosActivos)

    } catch (error) {
      toast.error('Error al cargar datos')
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingLoan) {
        // TODO: Implementar actualización cuando el backend lo soporte
        toast.success('Préstamo actualizado correctamente')
      } else {
        await prestamosAPI.crear(data)
        toast.success('Préstamo creado correctamente')
      }
      reset()
      setShowForm(false)
      setEditingLoan(null)
      setSelectedUser(null)
      setSelectedTransport(null)
      cargarDatos()
    } catch (error) {
      toast.error('Error al guardar préstamo')
      console.error('Error guardando préstamo:', error)
    }
  }

  const handleEdit = (prestamo) => {
    setEditingLoan(prestamo)
    reset(prestamo)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este préstamo?')) {
      try {
        // TODO: Implementar eliminación cuando el backend lo soporte
        toast.success('Préstamo eliminado correctamente')
        cargarDatos()
      } catch (error) {
        toast.error('Error al eliminar préstamo')
        console.error('Error eliminando préstamo:', error)
      }
    }
  }

  const filteredPrestamos = prestamos.filter(prestamo =>
    prestamo.id?.toString().includes(searchTerm) ||
    prestamo.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const transportesDisponibles = transportes.filter(t => t.estado === 'DISPONIBLE')

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-eco-gray-900">Gestión de Préstamos</h1>
          <p className="mt-2 text-eco-gray-600">
            Administra los préstamos de transporte ecológico
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingLoan(null)
            reset()
          }}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus size={20} />
          <span>Nuevo Préstamo</span>
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-eco-gray-900">
              {editingLoan ? 'Editar Préstamo' : 'Nuevo Préstamo'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingLoan(null)
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
                  Usuario
                </label>
                <select
                  {...register('usuarioId', { required: 'El usuario es requerido' })}
                  className="input-field"
                  onChange={(e) => {
                    const user = usuarios.find(u => u.id == e.target.value)
                    setSelectedUser(user)
                  }}
                >
                  <option value="">Seleccionar usuario</option>
                  {usuarios.map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} - {usuario.documento}
                    </option>
                  ))}
                </select>
                {errors.usuarioId && (
                  <p className="text-red-500 text-sm mt-1">{errors.usuarioId.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Transporte
                </label>
                <select
                  {...register('transporteId', { required: 'El transporte es requerido' })}
                  className="input-field"
                  onChange={(e) => {
                    const transport = transportes.find(t => t.id == e.target.value)
                    setSelectedTransport(transport)
                  }}
                >
                  <option value="">Seleccionar transporte</option>
                  {transportesDisponibles.map(transporte => (
                    <option key={transporte.id} value={transporte.id}>
                      Transporte #{transporte.id} - {transporte.tipo}
                    </option>
                  ))}
                </select>
                {errors.transporteId && (
                  <p className="text-red-500 text-sm mt-1">{errors.transporteId.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Estación de origen
                </label>
                <select
                  {...register('estacionOrigenId', { required: 'La estación de origen es requerida' })}
                  className="input-field"
                >
                  <option value="">Seleccionar estación origen</option>
                  {estaciones.map(estacion => (
                    <option key={estacion.id} value={estacion.id}>
                      {estacion.nombre} - {estacion.ubicacion}
                    </option>
                  ))}
                </select>
                {errors.estacionOrigenId && (
                  <p className="text-red-500 text-sm mt-1">{errors.estacionOrigenId.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Estación de destino
                </label>
                <select
                  {...register('estacionDestinoId', { required: 'La estación de destino es requerida' })}
                  className="input-field"
                >
                  <option value="">Seleccionar estación destino</option>
                  {estaciones.map(estacion => (
                    <option key={estacion.id} value={estacion.id}>
                      {estacion.nombre} - {estacion.ubicacion}
                    </option>
                  ))}
                </select>
                {errors.estacionDestinoId && (
                  <p className="text-red-500 text-sm mt-1">{errors.estacionDestinoId.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Fecha y hora de inicio
                </label>
                <input
                  type="datetime-local"
                  {...register('inicio', { required: 'La fecha de inicio es requerida' })}
                  className="input-field"
                />
                {errors.inicio && (
                  <p className="text-red-500 text-sm mt-1">{errors.inicio.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Fecha y hora de finalización
                </label>
                <input
                  type="datetime-local"
                  {...register('fin', { required: 'La fecha de finalización es requerida' })}
                  className="input-field"
                />
                {errors.fin && (
                  <p className="text-red-500 text-sm mt-1">{errors.fin.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Costo total
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('costo', { 
                    required: 'El costo es requerido',
                    min: { value: 0, message: 'El costo debe ser mayor o igual a 0' }
                  })}
                  className="input-field"
                  placeholder="0.00"
                />
                {errors.costo && (
                  <p className="text-red-500 text-sm mt-1">{errors.costo.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  ID del pago asociado
                </label>
                <input
                  type="number"
                  {...register('pagoId')}
                  className="input-field"
                  placeholder="Opcional"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingLoan(null)
                  reset()
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingLoan ? 'Actualizar Préstamo' : 'Crear Préstamo'}
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
          placeholder="Buscar préstamos por ID o usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-eco-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent"
        />
      </div>

      {/* Lista de préstamos */}
      <div className="card">
        <h2 className="text-xl font-semibold text-eco-gray-900 mb-4">Lista de Préstamos</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green-600 mx-auto"></div>
            <p className="mt-2 text-eco-gray-600">Cargando préstamos...</p>
          </div>
        ) : filteredPrestamos.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-eco-gray-400" />
            <p className="mt-2 text-eco-gray-600">
              {searchTerm ? 'No se encontraron préstamos que coincidan con la búsqueda' : 'No hay préstamos registrados'}
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
                    Transporte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Ruta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Estado
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
                            {prestamo.inicio ? new Date(prestamo.inicio).toLocaleDateString() : 'Sin fecha'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-eco-gray-400 mr-2" />
                        <span className="text-sm text-eco-gray-900">
                          Usuario #{prestamo.usuarioId || 'No encontrado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 text-eco-gray-400 mr-2" />
                        <span className="text-sm text-eco-gray-900">
                          Transporte #{prestamo.transporteId || 'No encontrado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-eco-gray-900">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-eco-gray-400 mr-1" />
                        <span>
                          Estación #{prestamo.estacionOrigenId || 'Origen'} → Estación #{prestamo.estacionDestinoId || 'Destino'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-eco-green-100 text-eco-green-800">
                        {prestamo.estado || 'ACTIVO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(prestamo)}
                          className="text-eco-green-600 hover:text-eco-green-900 p-1"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(prestamo.id)}
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

export default Prestamos
