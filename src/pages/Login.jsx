import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Leaf, Eye, EyeOff } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm()
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data) => {
    const payload = { correo: data.correo, password: data.password }
    const result = await login(payload)
    if (result.ok) {
      toast.success('Inicio de sesión exitoso')
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } else {
      const msg = result.error?.response?.data?.message || 'Credenciales inválidas o error en el servidor'
      setError('password', { type: 'server', message: msg })
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-green-50 via-white to-eco-green-100 flex items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-eco-green-400 via-emerald-400 to-lime-400 rounded-3xl blur opacity-30"></div>
        <div className="relative bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-eco-green-600 flex items-center justify-center shadow-md">
              <Leaf className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-eco-gray-900">
            Bienvenido a EcoMove
          </h1>
          <p className="text-center text-eco-gray-600 mt-1 mb-8">
            Inicia sesión para continuar
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-eco-gray-400" />
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  {...register('correo', { required: 'El correo es requerido' })}
                  className="pl-10 pr-4 py-3 w-full rounded-xl border border-eco-gray-300 focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent bg-white/80"
                />
              </div>
              {errors.correo && (
                <p className="text-red-500 text-sm mt-1">{errors.correo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-eco-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { required: 'La contraseña es requerida' })}
                  className="pl-10 pr-4 py-3 w-full rounded-xl border border-eco-gray-300 focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent bg-white/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-eco-gray-500 hover:text-eco-gray-700"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-eco-green-600 to-eco-green-700 text-white font-semibold shadow-lg hover:from-eco-green-700 hover:to-eco-green-800 transition-colors disabled:opacity-60"
            >
              {isSubmitting || loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-eco-gray-500">
            © {new Date().getFullYear()} EcoMove. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
