import React, { useEffect, useMemo, useState } from 'react'
import { Clock, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { prestamosAPI, estacionesAPI, transportesAPI } from '../services/api'
import toast from 'react-hot-toast'

const MisPrestamos = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [prestamos, setPrestamos] = useState([])
  const [estaciones, setEstaciones] = useState([])
  const [transportes, setTransportes] = useState([])

  useEffect(() => {
    const cargar = async () => {
      if (!user?.id) return
      setLoading(true)
      try {
        const [histRes, estRes, transRes] = await Promise.all([
          // historial sólo de este usuario
          prestamosAPI.historialPorUsuario(user.id).catch(() => ({ data: [] })),
          estacionesAPI.listar().catch(() => ({ data: [] })),
          transportesAPI.listar().catch(() => ({ data: [] })),
        ])
        const raw = histRes?.data
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])
        setPrestamos(list)
        setEstaciones(Array.isArray(estRes?.data) ? estRes.data : [])
        setTransportes(Array.isArray(transRes?.data) ? transRes.data : [])
      } catch (e) {
        console.error(e)
        toast.error('No se pudo cargar tu información')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [user?.id])

  const mapEstacion = useMemo(() => {
    const m = new Map()
    estaciones.forEach(e => m.set(e.id, e))
    return m
  }, [estaciones])

  const mapTransporte = useMemo(() => {
    const m = new Map()
    transportes.forEach(t => m.set(t.id, t))
    return m
  }, [transportes])

  // Se elimina la sección de viaje actual

  const renderEstacion = (id) => {
    const est = mapEstacion.get(id)
    if (!est) return 'No asignada'
    return est.nombre || `Estación ${est.id}`
  }

  const renderTransporte = (id) => {
    const t = mapTransporte.get(id)
    if (!t) return `Vehículo ${id || '-'} `
    return `${t.tipo || 'Vehículo'} ${t.codigo || t.id}`
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-eco-gray-800">Mis Préstamos</h1>
        <p className="text-eco-gray-600">Visualiza tus préstamos e historial.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-eco-gray-600">
          <Loader2 className="animate-spin" size={18} /> Cargando...
        </div>
      ) : (
        <>
          {/* Mis préstamos (incluye activos y pasados) */}
          <div className="bg-white rounded-xl shadow p-5 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-eco-green-600" />
              <h2 className="font-semibold text-eco-gray-800">Mis préstamos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-eco-gray-200">
                <thead className="bg-eco-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">Desde</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">Hasta</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">Vehículo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-eco-gray-100">
                  {prestamos.map(p => (
                    <tr key={`${p.id}-${p.transporteId || 't'}`} className="hover:bg-eco-gray-50">
                      <td className="px-4 py-2 text-sm text-eco-gray-700">{p.fecha || p.createdAt || '-'}</td>
                      <td className="px-4 py-2 text-sm text-eco-gray-700">{renderEstacion(p.estacionOrigenId)}</td>
                      <td className="px-4 py-2 text-sm text-eco-gray-700">{renderEstacion(p.estacionDestinoId)}</td>
                      <td className="px-4 py-2 text-sm text-eco-gray-700">{renderTransporte(p.transporteId)}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${p.estado === 'EN_CURSO' ? 'bg-eco-green-100 text-eco-green-800' : 'bg-eco-gray-100 text-eco-gray-800'}`}>
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historial (finalizados) */}
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-eco-green-600" />
              <h2 className="font-semibold text-eco-gray-800">Mi historial</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-eco-gray-200">
                <thead className="bg-eco-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">Desde</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">Hasta</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">Vehículo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-eco-gray-100">
                  {prestamos
                    .filter(p => p.estado !== 'EN_CURSO')
                    .map(p => (
                      <tr key={`hist-${p.id}-${p.transporteId || 't'}`} className="hover:bg-eco-gray-50">
                        <td className="px-4 py-2 text-sm text-eco-gray-700">{p.fechaFin || p.fecha || p.updatedAt || '-'}</td>
                        <td className="px-4 py-2 text-sm text-eco-gray-700">{renderEstacion(p.estacionOrigenId)}</td>
                        <td className="px-4 py-2 text-sm text-eco-gray-700">{renderEstacion(p.estacionDestinoId)}</td>
                        <td className="px-4 py-2 text-sm text-eco-gray-700">{renderTransporte(p.transporteId)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MisPrestamos
