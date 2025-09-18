import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { pagosAPI, prestamosAPI } from '../services/api'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const map = {
    paid: { color: 'bg-eco-green-100 text-eco-green-800', label: 'Pago exitoso' },
    unpaid: { color: 'bg-red-100 text-red-800', label: 'Pago no realizado' },
    no_payment_required: { color: 'bg-eco-gray-100 text-eco-gray-800', label: 'No requiere pago' },
  }
  const info = map[status] || { color: 'bg-yellow-100 text-yellow-800', label: status || 'Desconocido' }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${info.color}`}>
      {info.label}
    </span>
  )
}

const PagosCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id') || searchParams.get('sessionId')
    if (!sessionId) {
      setError('No se encontró session_id en la URL')
      setLoading(false)
      return
    }
    const verify = async () => {
      try {
        const res = await pagosAPI.getStripeSessionStatus(sessionId)
        // Backend responde string directo o { status: 'paid' }
        const s = typeof res?.data === 'string' ? res.data : (res?.data?.status || res?.data)
        setStatus(s)

        // Crear el préstamo solo si el estado es 'paid'
        try {
          const raw = sessionStorage.getItem('pendingLoan')
          const pending = raw ? JSON.parse(raw) : null
          if (s === 'paid' && pending) {
            await prestamosAPI.crear({ ...pending, estado: 'EN_CURSO' })
            sessionStorage.removeItem('pendingLoan')
          }
          if (s !== 'paid' && pending) {
            // Si el pago no se realizó, descartamos el préstamo pendiente
            sessionStorage.removeItem('pendingLoan')
          }
        } catch (e) {
          // Si algo falla al crear el préstamo, mostramos error pero dejamos al usuario continuar
          console.error('Error creando préstamo tras pago:', e)
        }
      } catch (e) {
        setError(e?.response?.data?.message || 'Error verificando el estado del pago')
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-eco-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-eco-gray-900 mb-4">Estado del Pago</h1>
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-eco-gray-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            Verificando con Stripe...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 text-red-700">
            <XCircle className="h-8 w-8" />
            <p>{error}</p>
          </div>
        ) : status === 'paid' ? (
          <div className="flex flex-col items-center gap-2 text-eco-green-700">
            <CheckCircle2 className="h-8 w-8" />
            <StatusBadge status={status} />
            <p className="mt-2">Tu pago fue confirmado correctamente.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-eco-gray-700">
            <XCircle className="h-8 w-8" />
            <StatusBadge status={status} />
            <p className="mt-2">El pago no se completó o está pendiente.</p>
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={() => navigate('/prestamos')} className="btn-primary">Ir a Préstamos</button>
          <button onClick={() => navigate('/historial')} className="btn-secondary">Ver Historial</button>
        </div>
      </div>
    </div>
  )
}

export default PagosCallback
