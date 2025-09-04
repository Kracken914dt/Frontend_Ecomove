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
      
      const [usuariosRes, transportesRes, estacionesRes] = await Promise.all([
        usuariosAPI.listar(),
        transportesAPI.listar(),
        estacionesAPI.listar()
      ])

      // Filtrar usuarios activos
      const usuariosActivos = usuariosRes.data.filter(
        usuario => usuario.nombre && usuario.correo && usuario.documento
      )
      setUsuarios(usuariosActivos)

      // Filtrar transportes y crear mapa
      const transportesActivos = transportesRes.data.filter(
        transporte => Object.keys(transporte).length > 1
      )
      const transportesMap = transportesActivos.reduce((map, t) => {
        map[t.id] = t
        return map
      }, {})
      setTransportes(transportesActivos)

      // Filtrar estaciones y crear mapa
      const estacionesActivas = estacionesRes.data.filter(
        estacion => Object.keys(estacion).length > 1
      )
      const estacionesMap = estacionesActivas.reduce((map, e) => {
        map[e.id] = e
        return map
      }, {})
      setEstaciones(estacionesActivas)

      // Obtener préstamos con información relacionada
      const prestamosPromesas = usuariosActivos.map(usuario =>
        prestamosAPI.historialPorUsuario(usuario.id)
          .then(response => {
            return response.data.map(prestamo => ({
              ...prestamo,
              usuario: usuariosActivos.find(u => u.id === prestamo.usuarioId) || { nombre: 'Usuario no encontrado' },
              transporte: transportesMap[prestamo.transporteId] || { tipo: 'Sin tipo' },
              estacionOrigen: estacionesMap[prestamo.estacionOrigenId] || { nombre: 'Origen' },
              estacionDestino: estacionesMap[prestamo.estacionDestinoId] || { nombre: 'Destino' }
            }))
          })
          .catch(error => {
            console.error(`Error obteniendo préstamos del usuario ${usuario.id}:`, error)
            return []
          })
      )

      const prestamosPorUsuario = await Promise.all(prestamosPromesas)
      const todosLosPrestamos = prestamosPorUsuario.flat()
      setPrestamos(todosLosPrestamos)
      
    } catch (error) {
      toast.error('Error al cargar datos')
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Agregar una función de validación
  const validarTransporteEnEstacion = (transporteId, estacionId) => {
    const estacion = estaciones.find(e => e.id === estacionId)
    return estacion?.transportes?.includes(transporteId)
  }

  // Modificar el onSubmit para incluir la validación
  const onSubmit = async (data) => {
    try {
      if (editingLoan) {
        // Manejo de edición...
      } else {
        // 1. Validar que el transporte esté en la estación origen
        if (!validarTransporteEnEstacion(data.transporteId, data.estacionOrigenId)) {
          toast.error('El vehículo seleccionado no se encuentra en la estación de origen')
          return
        }

        // 2. Obtener la estación origen
        const estacionOrigen = estaciones.find(e => e.id === data.estacionOrigenId)
        if (!estacionOrigen) {
          toast.error('Estación de origen no encontrada')
          return
        }

        // 3. Verificar capacidad disponible
        if (estacionOrigen.capacidad <= 0) {
          toast.error('La estación de origen no tiene vehículos disponibles')
          return
        }

        // 4. Actualizar estado del transporte a EN_USO
        await transportesAPI.crear({
          ...transportes.find(t => t.id === data.transporteId),
          estado: 'EN_USO'
        })

        // 5. Actualizar capacidad de la estación origen
        await estacionesAPI.crear({
          ...estacionOrigen,
          capacidad: estacionOrigen.capacidad - 1
        })

        // 6. Crear el préstamo
        await prestamosAPI.crear({
          ...data,
          estado: 'EN_CURSO'
        })

        toast.success('Préstamo creado correctamente')
        reset()
        setShowForm(false)
        setEditingLoan(null)
        setSelectedUser(null)
        setSelectedTransport(null)
        cargarDatos()
      }
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

  const finalizarPrestamo = async (prestamo) => {
    try {
      // 1. Obtener el transporte actual
      const transporteRes = await transportesAPI.obtenerPorId(prestamo.transporteId)
      const transporte = transporteRes.data

      // 2. Verificar si el transporte ya está disponible
      if (transporte.estado === 'DISPONIBLE') {
        toast.error('Este préstamo ya ha sido finalizado')
        return
      }

      // 3. Obtener estación origen y destino actualizadas
      const estacionOrigen = estaciones.find(e => e.id === prestamo.estacionOrigenId)
      const estacionDestino = estaciones.find(e => e.id === prestamo.estacionDestinoId)

      if (!estacionDestino) {
        toast.error('Estación de destino no encontrada')
        return
      }

      // 4. Actualizar el estado del transporte a DISPONIBLE
      await transportesAPI.crear({
        ...transporte,
        estado: 'DISPONIBLE'
      })

      // 5. Actualizar estaciones
      const transportesDestinoActualizados = [
        ...(estacionDestino.transportes || []),
        prestamo.transporteId
      ]

      await estacionesAPI.crear({
        ...estacionDestino,
        capacidad: estacionDestino.capacidad + 1,
        transportes: transportesDestinoActualizados
      })

      toast.success('Préstamo finalizado correctamente')
      cargarDatos()
    } catch (error) {
      console.error('Error finalizando préstamo:', error)
      toast.error('Error al finalizar el préstamo')
    }
  }

  const filteredPrestamos = prestamos.filter(prestamo =>
    prestamo.id?.toString().includes(searchTerm) ||
    prestamo.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const transportesDisponibles = transportes.filter(t => t.estado === 'DISPONIBLE')

  return (
    <div className="space-y-6">
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
                    const transport = transportes.find(t => t.id === e.target.value)
                    setSelectedTransport(transport)
                  }}
                >
                  <option value="">Seleccionar transporte</option>
                  {transportes
                    .filter(t => t.estado === 'DISPONIBLE')
                    .map(transporte => (
                      <option key={transporte.id} value={transporte.id}>
                        Transporte {transporte.tipo}
                      </option>
                    ))
                  }
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
                  {...register('estacionOrigenId', { 
                    required: 'La estación de origen es requerida',
                    onChange: (e) => {
                      const transporteId = document.querySelector('select[name="transporteId"]').value
                      if (transporteId && !validarTransporteEnEstacion(transporteId, e.target.value)) {
                        toast.error('El vehículo seleccionado no se encuentra en esta estación')
                      }
                    }
                  })}
                  className="input-field"
                >
                  <option value="">Seleccionar estación origen</option>
                  {estaciones.map(estacion => (
                    <option 
                      key={estacion.id} 
                      value={estacion.id}
                      disabled={selectedTransport && !validarTransporteEnEstacion(selectedTransport.id, estacion.id)}
                    >
                      Estación {estacion.ubicacion} 
                      {selectedTransport && !validarTransporteEnEstacion(selectedTransport.id, estacion.id) 
                        ? ' (No tiene el vehículo seleccionado)' 
                        : ''}
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
                      Estación {estacion.ubicacion}
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
            <div className="mx-auto h-12 w-12 text-eco-gray-400">
              <Clock className="h-5 w-5 text-eco-gray-400" />
            </div>
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
                        <Truck className="h-4 w-4 text-eco-gray-400 mr-2" />
                        <span className="text-sm text-eco-gray-900">
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        prestamo.transporte?.estado === 'EN_USO' 
                          ? 'bg-eco-green-100 text-eco-green-800'
                          : 'bg-eco-gray-100 text-eco-gray-800'
                      }`}>
                        {prestamo.transporte?.estado === 'EN_USO' ? 'ACTIVO' : 'INACTIVO'}
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
                        {/* Botón de finalizar solo aparece si el transporte está EN_USO */}
                        {prestamo.transporte?.estado === 'EN_USO' && (
                          <button
                            onClick={() => finalizarPrestamo(prestamo)}
                            className="text-eco-blue-600 hover:text-eco-blue-900 p-1"
                            title="Finalizar préstamo"
                          >
                            <Eye size={16} />
                          </button>
                        )}
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
