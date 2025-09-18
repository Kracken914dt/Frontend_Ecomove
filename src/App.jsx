import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Estaciones from './pages/Estaciones'
import Transportes from './pages/Transportes'
import Prestamos from './pages/Prestamos'
import Historial from './pages/Historial'
import Pagos from './pages/Pagos'
import Login from './pages/Login'
import PrivateRoute from './components/auth/PrivateRoute'
import PagosCallback from './pages/PagosCallback'

function App() {
  return (
    <Routes>
      {/* Ruta pública de login sin el Layout */}
      <Route path="/login" element={<Login />} />
      {/* Ruta pública para callback de Stripe */}
      <Route path="/pagos/callback" element={<PagosCallback />} />
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="estaciones" element={<Estaciones />} />
          <Route path="transportes" element={<Transportes />} />
          <Route path="prestamos" element={<Prestamos />} />
          <Route path="historial" element={<Historial />} />
          {/* <Route path="pagos" element={<Pagos />} /> */}
        </Route>
      </Route>
    </Routes>
  )
}

export default App
