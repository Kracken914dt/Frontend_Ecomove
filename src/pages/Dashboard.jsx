import React, { useState, useEffect } from 'react'
import { 
  Users, 
  MapPin, 
  Truck, 
  Clock, 
  TrendingUp, 
  DollarSign,
  Bike,
  Zap,
  Leaf
} from 'lucide-react'
import { estacionesAPI, transportesAPI, prestamosAPI, usuariosAPI } from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  const isAdmin = user?.tipo === 'ADMIN'
  const isUsuario = user?.tipo === 'USUARIO'
  const [stats, setStats] = useState({
    usuarios: 0,
    estaciones: 0,
    transportes: 0,
    prestamosActivos: 0,
    ingresosHoy: 0,
    bicicletasDisponibles: 0,
    patinetasDisponibles: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)
      
      // Cargar datos en paralelo
      const [usuarios, estaciones, transportes] = await Promise.all([
        usuariosAPI.listar(),
        estacionesAPI.listar(),
        transportesAPI.listar()
      ])

      // Calcular estadísticas
      const totalUsuarios = usuarios.data.length
      const totalEstaciones = estaciones.data.length
      const totalTransportes = transportes.data.length
      
      // Contar transportes por tipo
      const bicicletas = transportes.data.filter(t => t.tipo === 'BICICLETA' && t.estado === 'DISPONIBLE').length
      const patinetas = transportes.data.filter(t => t.tipo === 'PATINETA' && t.estado === 'DISPONIBLE').length

      setStats({
        usuarios: totalUsuarios,
        estaciones: totalEstaciones,
        transportes: totalTransportes,
        prestamosActivos: 0, // TODO: Implementar cuando el backend lo soporte
        ingresosHoy: 0, // TODO: Implementar cuando el backend lo soporte
        bicicletasDisponibles: bicicletas,
        patinetasDisponibles: patinetas
      })
    } catch (error) {
      toast.error('Error al cargar estadísticas')
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }


  const StatCard = ({ title, value, icon: Icon, color, subtitle, index = 0 }) => (
    <div 
      className="stat-card group fade-in-up stagger-animation" 
      style={{ '--stagger': index }}
    >
      <div className="flex items-center">
        <div className={`icon-container ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div className="ml-6">
          <p className="text-sm font-semibold text-eco-gray-600 uppercase tracking-wide">{title}</p>
          <div className="mt-1">
            {loading ? (
              <div className="loading-skeleton h-8 w-16 rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-eco-gray-900 bg-gradient-to-r from-eco-gray-900 to-eco-gray-700 bg-clip-text text-transparent">
                {value}
              </p>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-eco-gray-500 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-10 -mt-10"></div>
    </div>
  )

  const QuickActionCard = ({ title, description, icon: Icon, action, color, index = 0 }) => (
    <div 
      className="quick-action-card group fade-in-up stagger-animation" 
      onClick={action}
      style={{ '--stagger': index + 4 }}
    >
      <div className="flex items-center relative z-10">
        <div className={`icon-container ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div className="ml-6">
          <h3 className="text-xl font-bold text-eco-gray-900 group-hover:text-eco-green-700 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-eco-gray-600 group-hover:text-eco-gray-700 transition-colors duration-300 mt-1">
            {description}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-eco-green-100/20 to-transparent rounded-full -mr-8 -mb-8"></div>
    </div>
  )

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center lg:text-left">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-eco-green-500 to-eco-green-600 rounded-2xl shadow-lg">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-eco-gray-900 via-eco-green-700 to-eco-gray-900 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        {isAdmin ? (
          <p className="text-lg text-eco-gray-600 max-w-2xl">
            Bienvenido a <span className="font-semibold text-eco-green-600">EcoMove</span>.
            Gestiona tu plataforma de transporte ecológico de manera inteligente y sostenible.
          </p>
        ) : (
          <p className="text-lg text-eco-gray-600 max-w-2xl">
            Bienvenido a <span className="font-semibold text-eco-green-600">EcoMove</span>.
            Aquí podrás consultar la disponibilidad de vehículos y revisar tus préstamos e historial.
          </p>
        )}
      </div>

      {/* Estadísticas principales */}
      <div>
        <h2 className="text-2xl font-bold text-eco-gray-900 mb-6 flex items-center">
          <TrendingUp className="h-6 w-6 mr-3 text-eco-green-600" />
          Estadísticas Generales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            title="Total Usuarios"
            value={stats.usuarios}
            icon={Users}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            index={0}
          />
          <StatCard
            title="Estaciones"
            value={stats.estaciones}
            icon={MapPin}
            color="bg-gradient-to-br from-eco-green-500 to-eco-green-600"
            index={1}
          />
          <StatCard
            title="Transportes"
            value={stats.transportes}
            icon={Truck}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            index={2}
          />
          <StatCard
            title="Préstamos Activos"
            value={stats.prestamosActivos}
            icon={Clock}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            index={3}
          />
        </div>
      </div>

      {/* Estadísticas de disponibilidad */}
      <div>
        <h2 className="text-2xl font-bold text-eco-gray-900 mb-6 flex items-center">
          <Bike className="h-6 w-6 mr-3 text-eco-green-600" />
          Disponibilidad de Transportes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatCard
            title="Bicicletas Disponibles"
            value={stats.bicicletasDisponibles}
            icon={Bike}
            color="bg-gradient-to-br from-eco-green-600 to-eco-green-700"
            subtitle="Listas para préstamo"
            index={0}
          />
          <StatCard
            title="Patinetas Disponibles"
            value={stats.patinetasDisponibles}
            icon={Zap}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            subtitle="Listas para préstamo"
            index={1}
          />
        </div>
      </div>

      {/* Acciones rápidas: solo administradores */}
      {isAdmin && (
        <div>
          <h2 className="text-2xl font-bold text-eco-gray-900 mb-6 flex items-center">
            <Zap className="h-6 w-6 mr-3 text-eco-green-600" />
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <QuickActionCard
              title="Nuevo Usuario"
              description="Registrar un nuevo usuario en el sistema"
              icon={Users}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              action={() => window.location.href = '/usuarios'}
              index={0}
            />
            <QuickActionCard
              title="Nueva Estación"
              description="Agregar una nueva estación de préstamo"
              icon={MapPin}
              color="bg-gradient-to-br from-eco-green-500 to-eco-green-600"
              action={() => window.location.href = '/estaciones'}
              index={1}
            />
            <QuickActionCard
              title="Nuevo Transporte"
              description="Agregar un nuevo medio de transporte"
              icon={Truck}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              action={() => window.location.href = '/transportes'}
              index={2}
            />
            <QuickActionCard
              title="Nuevo Préstamo"
              description="Crear un nuevo préstamo de transporte"
              icon={Clock}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              action={() => window.location.href = '/prestamos'}
              index={3}
            />
            <QuickActionCard
              title="Ver Historial"
              description="Consultar historial de préstamos"
              icon={TrendingUp}
              color="bg-gradient-to-br from-indigo-500 to-indigo-600"
              action={() => window.location.href = '/historial'}
              index={4}
            />
            <QuickActionCard
              title="Gestionar Pagos"
              description="Ver y gestionar pagos del sistema"
              icon={DollarSign}
              color="bg-gradient-to-br from-green-500 to-green-600"
              action={() => window.location.href = '/pagos'}
              index={5}
            />
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="relative overflow-hidden bg-gradient-to-br from-eco-green-50 via-white to-eco-green-100 rounded-3xl shadow-xl border border-eco-green-200/50 p-8">
        <div className="relative z-10">
          <div className="flex items-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-eco-green-500 to-eco-green-600 shadow-lg">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <div className="ml-6">
              <h3 className="text-2xl font-bold text-eco-green-800 mb-2">
                EcoMove - Transporte Sostenible
              </h3>
              <p className="text-eco-green-700 text-lg leading-relaxed">
                Contribuyendo a ciudades más limpias y sostenibles a través del transporte ecológico compartido.
                <span className="block mt-2 text-eco-green-600 font-medium">
                  🌱 Menos emisiones • 🚴‍♀️ Más salud • 🌍 Mejor futuro
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-eco-green-200/30 to-transparent rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-eco-green-300/20 to-transparent rounded-full -ml-12 -mb-12"></div>
      </div>

    </div>
  )
}

export default Dashboard
