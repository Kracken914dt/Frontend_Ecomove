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
  X
} from 'lucide-react'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Leaf },
    { name: 'Usuarios', href: '/usuarios', icon: Users },
    { name: 'Estaciones', href: '/estaciones', icon: MapPin },
    { name: 'Transportes', href: '/transportes', icon: Truck },
    { name: 'Préstamos', href: '/prestamos', icon: Clock },
    { name: 'Historial', href: '/historial', icon: Clock },
    { name: 'Pagos', href: '/pagos', icon: CreditCard },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-eco-gray-50">
      {/* Header */}
      <header className="bg-eco-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-eco-gray-400 hover:text-white hover:bg-eco-gray-700"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <Leaf className="h-8 w-8 text-eco-green-400" />
                <span className="ml-2 text-xl font-bold">EcoMove</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-eco-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 bg-eco-gray-700 border border-eco-gray-600 rounded-lg text-white placeholder-eco-gray-400 focus:outline-none focus:ring-2 focus:ring-eco-green-500"
                />
              </div>
              <button className="btn-primary flex items-center space-x-2">
                <Plus size={20} />
                <span>Nueva estación</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-eco-green-100 transform transition-transform duration-300 ease-in-out lg:transition-none`}>
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-3 text-eco-gray-700 rounded-lg transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'bg-eco-green-200 text-eco-green-800 font-medium'
                          : 'hover:bg-eco-green-200 hover:text-eco-green-800'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={20} className="mr-3" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout
