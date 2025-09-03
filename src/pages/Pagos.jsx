import React, { useState, useEffect } from 'react'
import { CreditCard, Search, Filter, DollarSign, Calendar, User, Clock, Eye, Download } from 'lucide-react'
import { pagosAPI, prestamosAPI } from '../services/api'
import toast from 'react-hot-toast'

const Pagos = () => {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('30')

  useEffect(() => {
    console.log('Pagos component mounted, calling cargarPagos...')
    cargarPagos()
  }, [])

  const cargarPagos = async () => {
    try {
      console.log('Iniciando carga de pagos...')
      setLoading(true)
      setError(null)
      
      const response = await pagosAPI.listar()
      console.log('Respuesta de la API:', response)
      console.log('Datos de pagos:', response.data)
      
      // Si no hay datos, usar un array vacío
      const pagosData = response.data || []
      console.log('Pagos procesados:', pagosData)
      
      setPagos(pagosData)
      
      // Si no hay pagos, mostrar un mensaje informativo
      if (pagosData.length === 0) {
        console.log('No hay pagos en el sistema')
      }
      
    } catch (error) {
      console.error('Error completo cargando pagos:', error)
      setError(error.message || 'Error desconocido al cargar pagos')
      toast.error(`Error al cargar pagos: ${error.message}`)
    } finally {
      setLoading(false)
      console.log('Estado final - loading:', false, 'pagos:', pagos.length)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETADO':
        return 'bg-eco-green-100 text-eco-green-800'
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800'
      case 'FALLIDO':
        return 'bg-red-100 text-red-800'
      case 'CANCELADO':
        return 'bg-eco-gray-100 text-eco-gray-800'
      default:
        return 'bg-eco-gray-100 text-eco-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETADO':
        return 'Completado'
      case 'PENDIENTE':
        return 'Pendiente'
      case 'FALLIDO':
        return 'Fallido'
      case 'CANCELADO':
        return 'Cancelado'
      default:
        return status || 'Sin estado'
    }
  }

  const getMetodoPagoIcon = (metodo) => {
    switch (metodo) {
      case 'EFECTIVO':
        return <DollarSign className="h-4 w-4" />
      case 'TARJETA':
        return <CreditCard className="h-4 w-4" />
      case 'TRANSFERENCIA':
        return <CreditCard className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const filteredPagos = pagos.filter(pago => {
    const matchesSearch = pago.id?.toString().includes(searchTerm) ||
                         pago.prestamoId?.toString().includes(searchTerm)
    
    const matchesStatus = !statusFilter || pago.estado === statusFilter
    
    return matchesSearch && matchesStatus
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

  const calcularTotal = () => {
    return pagos.reduce((total, pago) => total + (pago.monto || 0), 0)
  }

  const calcularPromedio = () => {
    if (pagos.length === 0) return 0
    return calcularTotal() / pagos.length
  }

  console.log('Renderizando componente Pagos, estado actual:', { loading, error, pagosCount: pagos.length })
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-eco-gray-900">Gestión de Pagos</h1>
        <p className="mt-2 text-eco-gray-600">
          Administra y consulta todos los pagos del sistema EcoMove
        </p>
      </div>

      {/* Filtros */}
      <div className="card">
        <h2 className="text-lg font-semibold text-eco-gray-900 mb-4">Filtros de Búsqueda</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-eco-gray-700 mb-2">
              Estado del pago
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Todos los estados</option>
              <option value="COMPLETADO">Completado</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="FALLIDO">Fallido</option>
              <option value="CANCELADO">Cancelado</option>
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
                placeholder="Buscar por ID de pago o préstamo..."
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

      {/* Estadísticas de pagos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-eco-green-600">
            {pagos.length}
          </div>
          <div className="text-sm text-eco-gray-600">Total de pagos</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-eco-green-600">
            ${calcularTotal().toFixed(2)}
          </div>
          <div className="text-sm text-eco-gray-600">Total recaudado</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            ${calcularPromedio().toFixed(2)}
          </div>
          <div className="text-sm text-eco-gray-600">Promedio por pago</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {pagos.filter(p => p.estado === 'PENDIENTE').length}
          </div>
          <div className="text-sm text-eco-gray-600">Pagos pendientes</div>
        </div>
      </div>

      {/* Lista de pagos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-eco-gray-900">Lista de Pagos</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                const pagosEjemplo = [
                  {
                    id: 1,
                    prestamoId: 101,
                    usuario: { nombre: 'Juan Pérez' },
                    monto: 15.50,
                    metodoPago: 'EFECTIVO',
                    estado: 'COMPLETADO',
                    fechaPago: new Date().toISOString()
                  },
                  {
                    id: 2,
                    prestamoId: 102,
                    usuario: { nombre: 'María García' },
                    monto: 22.00,
                    metodoPago: 'TARJETA',
                    estado: 'COMPLETADO',
                    fechaPago: new Date().toISOString()
                  }
                ]
                setPagos(pagosEjemplo)
                toast.success('Pagos de ejemplo cargados')
              }}
              className="btn-primary"
            >
              Cargar Ejemplos
            </button>
            <button className="btn-secondary flex items-center space-x-2">
              <Download size={16} />
              <span>Exportar</span>
            </button>
          </div>
        </div>
        
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <CreditCard className="mx-auto h-12 w-12 text-red-400" />
            </div>
            <p className="text-red-600 font-medium">Error al cargar los pagos</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <button 
              onClick={cargarPagos}
              className="mt-4 btn-primary"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green-600 mx-auto"></div>
            <p className="mt-2 text-eco-gray-600">Cargando pagos...</p>
          </div>
        ) : filteredPagos.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-eco-gray-400" />
            <p className="mt-2 text-eco-gray-600">
              {searchTerm || statusFilter ? 'No se encontraron pagos que coincidan con los filtros' : 'No hay pagos registrados'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-eco-gray-200">
              <thead className="bg-eco-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Préstamo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-eco-gray-200">
                {filteredPagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-eco-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-eco-green-100 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-eco-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-eco-gray-900">
                            #{pago.id}
                          </div>
                          <div className="text-sm text-eco-gray-500">
                            ID: {pago.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-eco-gray-400 mr-2" />
                        <span className="text-sm text-eco-gray-900">
                          #{pago.prestamoId || 'Sin préstamo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-eco-gray-400 mr-2" />
                        <span className="text-sm text-eco-gray-900">
                          {pago.usuario?.nombre || 'Usuario no encontrado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-eco-gray-900">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-eco-gray-400 mr-1" />
                        <span className="font-medium">
                          ${pago.monto ? pago.monto.toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMetodoPagoIcon(pago.metodoPago)}
                        <span className="ml-2 text-sm text-eco-gray-900">
                          {pago.metodoPago || 'Efectivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pago.estado)}`}>
                        {getStatusText(pago.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-eco-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-eco-gray-400 mr-2" />
                        <span>
                          {pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString() : 'Sin fecha'}
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

      {/* Información adicional */}
      <div className="card bg-eco-green-50 border-eco-green-200">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-eco-green-500">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-eco-green-800">
              Sistema de Pagos EcoMove
            </h3>
            <p className="text-eco-green-700">
              Todos los pagos se procesan de forma segura y se registran automáticamente en el sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pagos
