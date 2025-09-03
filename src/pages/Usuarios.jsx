import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Users, Plus, Edit, Trash2, Search, UserPlus } from 'lucide-react'
import { usuariosAPI } from '../services/api'
import toast from 'react-hot-toast'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    cargarUsuarios()
  }, [])

   const cargarUsuarios = async () => {
    try {
      setLoading(true)
      const response = await usuariosAPI.listar()
      // Filtramos usuarios activos (no eliminados)
      const usuariosActivos = response.data.filter(
        usuario => !usuario.eliminado && usuario.estado !== 'INACTIVO'
      )
      setUsuarios(usuariosActivos)
    } catch (error) {
      toast.error('Error al cargar usuarios')
      console.error('Error cargando usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  // ...existing code...

  const onSubmit = async (data) => {
    try {
      if (editingUser) {
        // Simulamos actualización creando un nuevo registro con el mismo ID
        await usuariosAPI.crear({
          ...data,
          id: editingUser.id
        })
        toast.success('Usuario actualizado correctamente')
      } else {
        await usuariosAPI.crear(data)
        toast.success('Usuario creado correctamente')
      }
      reset()
      setShowForm(false)
      setEditingUser(null)
      cargarUsuarios()
    } catch (error) {
      toast.error('Error al guardar usuario')
      console.error('Error guardando usuario:', error)
    }
  }

  const handleEdit = async (usuario) => {
    try {
      const response = await usuariosAPI.obtenerPorId(usuario.id)
      const usuarioCompleto = response.data
      setEditingUser(usuarioCompleto)
      reset(usuarioCompleto)
      setShowForm(true)
    } catch (error) {
      toast.error('Error al cargar datos del usuario')
      console.error('Error cargando usuario:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        // Simulamos eliminación creando un nuevo registro con estado inactivo
        await usuariosAPI.crear({
          id: id,
          estado: 'INACTIVO',
          eliminado: true
        })
        toast.success('Usuario eliminado correctamente')
        cargarUsuarios()
      } catch (error) {
        toast.error('Error al eliminar usuario')
        console.error('Error eliminando usuario:', error)
      }
    }
  }

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.documento?.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-eco-gray-900">Gestión de Usuarios</h1>
          <p className="mt-2 text-eco-gray-600">
            Administra los usuarios registrados en la plataforma EcoMove
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingUser(null)
            reset()
          }}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <UserPlus size={20} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-eco-gray-900">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingUser(null)
                reset()
              }}
              className="text-eco-gray-500 hover:text-eco-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  {...register('nombre', { required: 'El nombre es requerido' })}
                  className="input-field"
                  placeholder="Ingrese el nombre completo"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  {...register('correo', { 
                    required: 'El correo es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Correo electrónico inválido'
                    }
                  })}
                  className="input-field"
                  placeholder="usuario@ejemplo.com"
                />
                {errors.correo && (
                  <p className="text-red-500 text-sm mt-1">{errors.correo.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-eco-gray-700 mb-2">
                  Documento de identidad
                </label>
                <input
                  type="text"
                  {...register('documento', { required: 'El documento es requerido' })}
                  className="input-field"
                  placeholder="Número de documento"
                />
                {errors.documento && (
                  <p className="text-red-500 text-sm mt-1">{errors.documento.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingUser(null)
                  reset()
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-eco-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar usuarios por nombre, correo o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-eco-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent"
        />
      </div>

      {/* Lista de usuarios */}
      <div className="card">
        <h2 className="text-xl font-semibold text-eco-gray-900 mb-4">Lista de Usuarios</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green-600 mx-auto"></div>
            <p className="mt-2 text-eco-gray-600">Cargando usuarios...</p>
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-eco-gray-400" />
            <p className="mt-2 text-eco-gray-600">
              {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-eco-gray-200">
              <thead className="bg-eco-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-eco-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-eco-gray-200">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-eco-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-eco-green-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-eco-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-eco-gray-900">
                            {usuario.nombre || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-eco-gray-500">
                            ID: {usuario.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-eco-gray-900">
                      {usuario.correo || 'Sin correo'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-eco-gray-900">
                      {usuario.documento || 'Sin documento'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="text-eco-green-600 hover:text-eco-green-900 p-1"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Usuarios
