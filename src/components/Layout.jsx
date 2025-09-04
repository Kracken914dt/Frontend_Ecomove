import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  Leaf, 
  Search, 
  Plus, 
  Users, 
  MapPin, 
  Truck, 
  CreditCard, 
  Clock, 
  Menu,
  X,
  Home,
  BarChart3,
  Settings,
  LogOut,
  User
} from 'lucide-react'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: Home, 
      description: 'Vista general del sistema'
    },
    { 
      name: 'Usuarios', 
      href: '/usuarios', 
      icon: Users, 
      description: 'Gestión de usuarios'
    },
    { 
      name: 'Estaciones', 
      href: '/estaciones', 
      icon: MapPin, 
      description: 'Administrar estaciones'
    },
    { 
      name: 'Transportes', 
      href: '/transportes', 
      icon: Truck, 
      description: 'Gestionar transportes'
    },
    { 
      name: 'Préstamos', 
      href: '/prestamos', 
      icon: Clock, 
      description: 'Nuevos préstamos'
    },
    { 
      name: 'Historial', 
      href: '/historial', 
      icon: BarChart3, 
      description: 'Historial de préstamos'
    },
    //{ 
      //name: 'Pagos', 
      //href: '/pagos', 
      //icon: CreditCard, 
      //description: 'Gestión de pagos'
    //},
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen h-screen bg-eco-gray-50 flex flex-col overflow-hidden">
      {/* Header mejorado */}
      <header className="bg-eco-gray-800 text-white shadow-lg border-b border-eco-green-500 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-eco-gray-400 hover:text-white hover:bg-eco-gray-700 transition-all duration-200"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-eco-green-400 to-eco-green-600 flex items-center justify-center animate-fade-in">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-eco-green-400 to-white bg-clip-text text-transparent">
                  EcoMove
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Perfil de usuario */}
              <div className="flex items-center space-x-2 group">
                <div className="h-8 w-8 rounded-full bg-eco-green-500 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-eco-green-400">
                  <User size={16} className="text-white" />
                </div>
                <span className="hidden sm:inline text-sm font-medium transition-all duration-300 group-hover:text-eco-green-300">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden"> {/* Quitamos altura fija y usamos flex-1 */}
        {/* Sidebar mejorado */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-eco-green-50 to-eco-green-100 border-r border-eco-green-200 transform transition-all duration-500 ease-in-out lg:transition-none shadow-xl lg:shadow-none h-full flex-shrink-0 overflow-y-auto`}>
          <div className="flex flex-col h-full">
            {/* Logo del sidebar */}
            <div className="p-6 border-b border-eco-green-200">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-eco-green-500 to-eco-green-600 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-lg font-bold text-eco-gray-800">Navegación</span>
              </div>
            </div>

            {/* Navegación principal */}
            <nav className="flex-1 px-4 py-6">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActiveRoute = isActive(item.href)
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`group flex items-center px-4 py-3 text-eco-gray-700 rounded-xl transition-all duration-300 hover:scale-105 ${
                          isActiveRoute
                            ? 'bg-gradient-to-r from-eco-green-500 to-eco-green-600 text-white shadow-lg transform scale-105 animate-bounce-in'
                            : 'hover:bg-eco-green-200 hover:text-eco-green-800 hover:shadow-md'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className={`p-2 rounded-lg ${isActiveRoute ? 'bg-white bg-opacity-20' : 'bg-eco-green-100 group-hover:bg-eco-green-200'}`}>
                          <Icon size={20} className={isActiveRoute ? 'text-white' : 'text-eco-green-600'} />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${isActiveRoute ? 'text-white' : 'text-eco-gray-800'}`}>
                              {item.name}
                            </span>
                          </div>
                          <p className={`text-sm ${isActiveRoute ? 'text-eco-green-100' : 'text-eco-gray-500'}`}>
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Footer del sidebar */}
            <div className="p-4 border-t border-eco-green-200">
              <div className="space-y-2">
                <button className="w-full flex items-center px-4 py-3 text-eco-gray-600 hover:text-eco-gray-800 hover:bg-eco-green-200 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <Settings size={18} className="mr-3 transition-transform duration-300 group-hover:rotate-45" />
                  <span className="font-medium">Configuración</span>
                </button>
                <button className="w-full flex items-center px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <LogOut size={18} className="mr-3 transition-transform duration-300 group-hover:-translate-x-1" />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout
