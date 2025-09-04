import React, { useState, useEffect } from 'react'
import { DollarSign, Search, User } from 'lucide-react'
import { prestamosAPI, usuariosAPI } from '../services/api'
import toast from 'react-hot-toast'

const Pagos = () => {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    cargarPagos()
  }, [])

  const cargarPagos = async () => {
    try {
      setLoading(true)
      
      // Obtener usuarios para tener la información
      const usuariosRes = await usuariosAPI.listar()
      const usuariosMap = usuariosRes.data.reduce((map, usuario) => {
        map[usuario.id] = usuario
        return map
      }, {})

      // Obtener préstamos con costo
      const prestamosPromesas = Object.keys(usuariosMap).map(usuarioId =>
        prestamosAPI.historialPorUsuario(usuarioId)
          .then(response => {
            return response.data.map(prestamo => ({
              ...prestamo,
              usuario: usuariosMap[prestamo.usuarioId]
            }))
          })
          .catch(() => [])
      )

      const todosLosPrestamos = (await Promise.all(prestamosPromesas)).flat()
      
      // Filtrar préstamos con costo y añadir información necesaria
      const pagosFormateados = todosLosPrestamos
        .filter(prestamo => prestamo.costo > 0)
        .map(prestamo => ({
          id: prestamo.id,
          usuarioNombre: prestamo.usuario?.nombre || 'Usuario no encontrado',
          costo: prestamo.costo,
          fecha: new Date(prestamo.inicio).toLocaleDateString(),
          metodoPago: 'Efectivo'
        }))

      setPagos(pagosFormateados)
    } catch (error) {
      console.error('Error cargando pagos:', error)
      toast.error('Error al cargar los pagos')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar pagos por búsqueda
  const pagosFiltrados = pagos.filter(pago =>
    pago.usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pago.fecha.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-eco-gray-900">Pagos</h1>
        <p className="mt-2 text-eco-gray-600">
          Historial de pagos por préstamos
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-eco-gray-400" />
        <input
          type="text"
          placeholder="Buscar por usuario o fecha..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-eco-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent"
        />
      </div>

      {/* Tabla de pagos */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green-600 mx-auto"></div>
          <p className="mt-2 text-eco-gray-600">Cargando pagos...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-eco-gray-200">
            <thead className="bg-eco-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                  Costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-eco-gray-200">
              {pagosFiltrados.map((pago) => (
                <tr key={pago.id} className="hover:bg-eco-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-eco-gray-400 mr-2" />
                      <span className="text-sm text-eco-gray-900">
                        {pago.usuarioNombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-eco-green-500 mr-1" />
                      <span className="text-sm font-medium text-eco-gray-900">
                        ${pago.costo.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-eco-blue-100 text-eco-blue-800">
                      {pago.metodoPago}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-eco-gray-500">
                    {pago.fecha}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagosFiltrados.length === 0 && (
            <div className="text-center py-8 text-eco-gray-500">
              No se encontraron pagos
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Pagos
