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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="estaciones" element={<Estaciones />} />
        <Route path="transportes" element={<Transportes />} />
        <Route path="prestamos" element={<Prestamos />} />
        <Route path="historial" element={<Historial />} />
        {/* <Route path="pagos" element={<Pagos />} /> */}
      </Route>
    </Routes>
  )
}

export default App
