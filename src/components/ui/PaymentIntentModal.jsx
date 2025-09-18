import React, { useState } from 'react'
import { X, CreditCard, Mail, FileText } from 'lucide-react'

const PaymentIntentModal = ({
  isOpen,
  onClose,
  onCreate,
  defaultEmail = '',
  defaultDescription = '',
  amount,
  currency = 'usd',
}) => {
  const [email, setEmail] = useState(defaultEmail)
  const [description, setDescription] = useState(defaultDescription)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onCreate({ customerEmail: email, descripcion: description, amount, currency })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-eco-green-600" />
            <h3 className="text-lg font-semibold text-eco-gray-900">Generar pago</h3>
          </div>
          <button onClick={onClose} className="text-eco-gray-500 hover:text-eco-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-eco-gray-700 mb-2">Correo del cliente</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-eco-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@correo.com"
                className="pl-9 pr-3 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-eco-gray-700 mb-2">Descripción</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-eco-gray-400" />
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del alquiler"
                className="pl-9 pr-3 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm text-eco-gray-600">Monto</span>
              <span className="text-lg font-semibold">{amount?.toFixed ? amount.toFixed(2) : amount} {currency.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={handleConfirm} disabled={loading || !email || !amount} className="btn-primary">
            {loading ? 'Creando…' : 'Crear PaymentIntent'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentIntentModal
