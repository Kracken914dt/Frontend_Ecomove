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

const Dashboard = () => {
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

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-eco-gray-600">{title}</p>
          <p className="text-2xl font-bold text-eco-gray-900">{loading ? '...' : value}</p>
          {subtitle && <p className="text-sm text-eco-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  const QuickActionCard = ({ title, description, icon: Icon, action, color }) => (
    <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={action}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-eco-gray-900">{title}</h3>
          <p className="text-eco-gray-600">{description}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-eco-gray-900">Dashboard</h1>
        <p className="mt-2 text-eco-gray-600">
          Bienvenido a EcoMove. Gestiona tu plataforma de transporte ecológico.
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Usuarios"
          value={stats.usuarios}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Estaciones"
          value={stats.estaciones}
          icon={MapPin}
          color="bg-eco-green-500"
        />
        <StatCard
          title="Transportes"
          value={stats.transportes}
          icon={Truck}
          color="bg-purple-500"
        />
        <StatCard
          title="Préstamos Activos"
          value={stats.prestamosActivos}
          icon={Clock}
          color="bg-orange-500"
        />
      </div>

      {/* Estadísticas de disponibilidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Bicicletas Disponibles"
          value={stats.bicicletasDisponibles}
          icon={Bike}
          color="bg-eco-green-600"
          subtitle="Listas para préstamo"
        />
        <StatCard
          title="Patinetas Disponibles"
          value={stats.patinetasDisponibles}
          icon={Zap}
          color="bg-yellow-500"
          subtitle="Listas para préstamo"
        />
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="text-xl font-semibold text-eco-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Nuevo Usuario"
            description="Registrar un nuevo usuario en el sistema"
            icon={Users}
            color="bg-blue-500"
            action={() => window.location.href = '/usuarios'}
          />
          <QuickActionCard
            title="Nueva Estación"
            description="Agregar una nueva estación de préstamo"
            icon={MapPin}
            color="bg-eco-green-500"
            action={() => window.location.href = '/estaciones'}
          />
          <QuickActionCard
            title="Nuevo Transporte"
            description="Agregar un nuevo medio de transporte"
            icon={Truck}
            color="bg-purple-500"
            action={() => window.location.href = '/transportes'}
          />
          <QuickActionCard
            title="Nuevo Préstamo"
            description="Crear un nuevo préstamo de transporte"
            icon={Clock}
            color="bg-orange-500"
            action={() => window.location.href = '/prestamos'}
          />
          <QuickActionCard
            title="Ver Historial"
            description="Consultar historial de préstamos"
            icon={TrendingUp}
            color="bg-indigo-500"
            action={() => window.location.href = '/historial'}
          />
          <QuickActionCard
            title="Gestionar Pagos"
            description="Ver y gestionar pagos del sistema"
            icon={DollarSign}
            color="bg-green-500"
            action={() => window.location.href = '/pagos'}
          />
        </div>
      </div>

      {/* Información adicional */}
      <div className="card bg-eco-green-50 border-eco-green-200">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-eco-green-500">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-eco-green-800">
              EcoMove - Transporte Sostenible
            </h3>
            <p className="text-eco-green-700">
              Contribuyendo a ciudades más limpias y sostenibles a través del transporte ecológico compartido.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
