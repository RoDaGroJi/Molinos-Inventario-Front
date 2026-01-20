import React, { useState, useEffect, useRef } from 'react';
import {
  Package, Users, Settings, LogOut, PlusCircle, Search,
  Layers, MapPin, ShieldCheck, Laptop, Edit3, Eye, Trash2,
  Briefcase, Building2, FileSpreadsheet, Upload, RefreshCw, Menu, X,
  UserPlus, Box as BoxIcon, FileText, Download
} from 'lucide-react';
import InventoryModal from './InventoryModal';

//const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';
 const API_BASE_URL = 'http://localhost:8000';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// --- SUB-COMPONENTE: VISTA DE USUARIOS (LISTADO + CREACIÓN) ---
const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [userForm, setUserForm] = useState({ username: '', full_name: '', password: '', is_admin: false });

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/`, { headers: authHeaders() });
      if (res.ok) setUsers(await res.json());
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.username || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q)
    );
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(userForm),
    });
    if (response.ok) {
      alert("Usuario creado exitosamente");
      setUserForm({ username: '', full_name: '', password: '', is_admin: false });
      fetchUsers();
    } else {
      const errorData = await response.json().catch(() => ({ detail: 'Error al crear usuario' }));
      alert(errorData.detail || "No se pudo crear el usuario");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* LISTADO */}
        <div className="w-full lg:flex-1 bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-6 sm:px-10 py-6 sm:py-8 bg-slate-50/50 border-b border-slate-100">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Usuarios</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                  Listado y administración
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar usuario..."
                    className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchUsers}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black bg-white border border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-600 shadow-sm transition-all"
                >
                  <RefreshCw size={16} className={usersLoading ? 'animate-spin' : ''} />
                  ACTUALIZAR
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[520px] text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="py-4 pr-6">Usuario</th>
                    <th className="py-4 pr-6">Nombre</th>
                    <th className="py-4 text-center">Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((u) => (
                    <tr key={u.id || u.username} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                            <Users size={18} />
                          </div>
                          <div className="font-black text-slate-800">{u.username}</div>
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        <div className="font-bold text-slate-700">{u.full_name || '-'}</div>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-black uppercase ${
                          u.is_admin ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.is_admin ? 'ADMIN' : 'OPERADOR'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-10 text-center text-slate-400 font-bold">
                        {usersLoading ? 'Cargando...' : 'Sin usuarios para mostrar'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CREACIÓN */}
        <div className="w-full lg:w-[420px] bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-6 sm:px-10 py-6 sm:py-8 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <ShieldCheck size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Crear Usuario</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                  Nuevo acceso al sistema
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="p-6 sm:p-10 space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-4">Usuario (Login)</label>
              <input
                type="text"
                placeholder="Ej: admin"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl p-4 outline-none font-medium text-slate-700 transition-all"
                onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                value={userForm.username}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-4">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl p-4 outline-none font-medium text-slate-700 transition-all"
                onChange={e => setUserForm({ ...userForm, full_name: e.target.value })}
                value={userForm.full_name}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-4">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl p-4 outline-none font-medium text-slate-700 transition-all"
                onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                value={userForm.password}
                required
              />
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="is_admin"
                checked={userForm.is_admin}
                onChange={e => setUserForm({ ...userForm, is_admin: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="is_admin" className="text-sm font-bold text-slate-700 cursor-pointer">
                Administrador (permisos completos)
              </label>
            </div>
            <button className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-black hover:bg-black transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-slate-200 uppercase tracking-widest text-sm cursor-pointer">
              CREAR ACCESO
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const CATALOGS = [
  { key: 'areas', title: 'Áreas', icon: Layers },
  { key: 'empresas', title: 'Empresas', icon: Building2 },
  { key: 'cargos', title: 'Cargos', icon: Briefcase },
  { key: 'ciudades', title: 'Ciudades', icon: MapPin },
  { key: 'equipo_tipos', title: 'Tipos de Equipo', icon: Laptop },
];

// --- SUB-COMPONENTE: VISTA DE CATÁLOGOS (LISTADO + CRUD) ---
const CatalogsView = () => {
  const [activeKey, setActiveKey] = useState('areas');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const activeCatalog = CATALOGS.find((c) => c.key === activeKey) || CATALOGS[0];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/${activeKey}/`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    setNombre('');
    setSearch('');
    setEditingItem(null);
    setIsCreating(false);
  }, [activeKey]);

  const filteredItems = items.filter((it) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (it.nombre || '').toLowerCase().includes(q);
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/${activeKey}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ nombre }),
    });
    if (res.ok) {
      alert("Registro creado exitosamente");
      setNombre('');
      setIsCreating(false);
      fetchItems();
    } else {
      alert("No se pudo crear el registro");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/${activeKey}/${editingItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ nombre }),
    });
    if (res.ok) {
      alert("Registro actualizado exitosamente");
      setNombre('');
      setEditingItem(null);
      fetchItems();
    } else {
      alert("No se pudo actualizar el registro");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este registro?")) return;
    const res = await fetch(`${API_BASE_URL}/${activeKey}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      alert("Registro eliminado exitosamente");
      fetchItems();
    } else {
      alert("No se pudo eliminar el registro");
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setNombre(item.nombre);
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setNombre('');
    setIsCreating(false);
  };

  const ActiveIcon = activeCatalog.icon;

  return (
    <div className="animate-in fade-in duration-500 space-y-4">
      {/* SELECTOR DE CATÁLOGO */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50/50 border-b border-slate-100">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Catálogos</h2>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] mt-0.5">
            Gestión por categoría
          </p>
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATALOGS.map((c) => {
              const Icon = c.icon;
              const isActive = c.key === activeKey;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setActiveKey(c.key)}
                  className={`shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-black transition-all border text-xs sm:text-sm cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:text-blue-600"
                  }`}
                >
                  <Icon size={14} />
                  <span>{c.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BUSCADOR Y BOTÓN CREAR */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar en ${activeCatalog.title.toLowerCase()}...`}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-8 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => { setIsCreating(true); setEditingItem(null); setNombre(''); }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-black hover:bg-blue-700 transition-all text-xs sm:text-sm cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Crear</span>
          </button>
        </div>
      </div>

      {/* FORMULARIO CREAR/EDITAR */}
      {(isCreating || editingItem) && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4">
          <form onSubmit={editingItem ? handleEdit : handleCreate} className="space-y-3">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
                {editingItem ? 'Editar' : 'Nuevo'} {activeCatalog.title}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={`Nombre del ${activeCatalog.title.toLowerCase()}`}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-black hover:bg-blue-700 transition-all text-xs cursor-pointer"
                >
                  {editingItem ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-black hover:bg-slate-200 transition-all text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] border-b border-slate-100">
                <th className="px-3 py-2 sm:px-4 sm:py-2.5">ID</th>
                <th className="px-3 py-2 sm:px-4 sm:py-2.5">Nombre</th>
                <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-center">Estado</th>
                <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((it) => (
                <tr key={it.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-black">
                      {it.id}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                    <div className="font-bold text-slate-800 text-xs sm:text-sm">{it.nombre}</div>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black ${
                      it.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {it.is_active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => startEdit(it)}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(it.id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-bold text-xs sm:text-sm">
                    {loading ? 'Cargando...' : 'Sin registros para mostrar'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTE: VISTA DE EMPLEADOS (LISTADO + CRUD) ---
const EmpleadosView = () => {
  const [empleados, setEmpleados] = useState([]);
  const [search, setSearch] = useState('');
  const [empleadoForm, setEmpleadoForm] = useState({
    nombre: '',
    cargo_id: '',
    area_id: '',
    empresa_id: '',
    ciudad_id: ''
  });
  const [catalogs, setCatalogs] = useState({
    cargos: [],
    areas: [],
    empresas: [],
    ciudades: []
  });
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchEmpleados = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/empleados/`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setEmpleados(data);
      }
    } catch (error) {
      console.error("Error cargando empleados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCatalogs = async () => {
      const headers = authHeaders();
      try {
        const [resCargos, resAreas, resEmpresas, resCiudades] = await Promise.all([
          fetch(`${API_BASE_URL}/cargos/`, { headers }),
          fetch(`${API_BASE_URL}/areas/`, { headers }),
          fetch(`${API_BASE_URL}/empresas/`, { headers }),
          fetch(`${API_BASE_URL}/ciudades/`, { headers })
        ]);
        setCatalogs({
          cargos: resCargos.ok ? await resCargos.json() : [],
          areas: resAreas.ok ? await resAreas.json() : [],
          empresas: resEmpresas.ok ? await resEmpresas.json() : [],
          ciudades: resCiudades.ok ? await resCiudades.json() : []
        });
      } catch (error) {
        console.error("Error cargando catálogos:", error);
      }
    };
    fetchCatalogs();
    fetchEmpleados();
  }, []);

  const filteredEmpleados = empleados.filter((emp) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (emp.nombre || '').toLowerCase().includes(q);
  });

  const handleCreateEmpleado = async (e) => {
    e.preventDefault();
    const url = editingItem ? `${API_BASE_URL}/empleados/${editingItem.id}` : `${API_BASE_URL}/empleados/`;
    const method = editingItem ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(empleadoForm),
    });
    if (response.ok) {
      alert(editingItem ? "Empleado actualizado exitosamente" : "Empleado creado exitosamente");
      setEmpleadoForm({ nombre: '', cargo_id: '', area_id: '', empresa_id: '', ciudad_id: '' });
      setEditingItem(null);
      setIsCreating(false);
      fetchEmpleados();
    } else {
      const errorData = await response.json().catch(() => ({ detail: 'Error al guardar empleado' }));
      alert(errorData.detail || "No se pudo guardar el empleado");
    }
  };

  const handleDeleteEmpleado = async (id) => {
    if (!window.confirm("¿Está seguro de desactivar este empleado?")) return;
    const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (response.ok) {
      alert("Empleado desactivado exitosamente");
      fetchEmpleados();
    } else {
      alert("No se pudo desactivar el empleado");
    }
  };

  const startEdit = (empleado) => {
    setEditingItem(empleado);
    setEmpleadoForm({
      nombre: empleado.nombre || '',
      cargo_id: empleado.cargo_id || '',
      area_id: empleado.area_id || '',
      empresa_id: empleado.empresa_id || '',
      ciudad_id: empleado.ciudad_id || ''
    });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEmpleadoForm({ nombre: '', cargo_id: '', area_id: '', empresa_id: '', ciudad_id: '' });
    setIsCreating(false);
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-4">
      {/* BUSCADOR Y BOTÓN CREAR */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar empleados..."
              className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-8 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => { setIsCreating(true); setEditingItem(null); setEmpleadoForm({ nombre: '', cargo_id: '', area_id: '', empresa_id: '', ciudad_id: '' }); }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-black hover:bg-blue-700 transition-all text-xs sm:text-sm cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Crear</span>
          </button>
        </div>
      </div>

      {/* FORMULARIO CREAR/EDITAR */}
      {isCreating && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <UserPlus size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {editingItem ? 'Editar Empleado' : 'Crear Empleado'}
              </h3>
            </div>
          </div>
          <form onSubmit={handleCreateEmpleado} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nombre Completo *</label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                className="w-full bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-700 transition-all"
                value={empleadoForm.nombre}
                onChange={e => setEmpleadoForm({ ...empleadoForm, nombre: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Cargo *</label>
                <select
                  className="w-full bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-700 transition-all cursor-pointer"
                  value={empleadoForm.cargo_id}
                  onChange={e => setEmpleadoForm({ ...empleadoForm, cargo_id: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  {catalogs.cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Área *</label>
                <select
                  className="w-full bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-700 transition-all cursor-pointer"
                  value={empleadoForm.area_id}
                  onChange={e => setEmpleadoForm({ ...empleadoForm, area_id: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  {catalogs.areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Empresa *</label>
                <select
                  className="w-full bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-700 transition-all cursor-pointer"
                  value={empleadoForm.empresa_id}
                  onChange={e => setEmpleadoForm({ ...empleadoForm, empresa_id: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  {catalogs.empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Ciudad *</label>
                <select
                  className="w-full bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-700 transition-all cursor-pointer"
                  value={empleadoForm.ciudad_id}
                  onChange={e => setEmpleadoForm({ ...empleadoForm, ciudad_id: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  {catalogs.ciudades.map(city => <option key={city.id} value={city.id}>{city.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-black hover:bg-blue-700 shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs cursor-pointer">
                {editingItem ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={cancelEdit} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-black hover:bg-slate-200 transition-all text-xs cursor-pointer">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] border-b border-slate-100">
                <th className="px-3 py-2 sm:px-4 sm:py-2.5">ID</th>
                <th className="px-3 py-2 sm:px-4 sm:py-2.5">Nombre</th>
                <th className="px-3 py-2 sm:px-4 sm:py-2.5">Cargo / Área</th>
                <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-center">Estado</th>
                <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmpleados.map((emp) => (
                <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-black">
                      {emp.id}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                    <div className="font-bold text-slate-800 text-xs sm:text-sm">{emp.nombre}</div>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                    <div className="text-xs text-slate-600">{emp.cargo?.nombre || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400">{emp.area?.nombre || 'N/A'}</div>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black ${
                      emp.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {emp.is_active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => startEdit(emp)}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteEmpleado(emp.id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors cursor-pointer"
                        title="Desactivar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmpleados.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-bold text-xs sm:text-sm">
                    {loading ? 'Cargando...' : 'Sin empleados para mostrar'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTE: VISTA DE PRODUCTOS (LISTADO + CRUD) ---
const ProductosView = () => {
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [productoForm, setProductoForm] = useState({
    marca: '',
    referencia: '',
    memoria_ram: '',
    disco_duro: '',
    serial: '',
    observaciones: '',
    tipo_id: ''
  });
  const [equipoTipos, setEquipoTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/productos/`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchEquipoTipos = async () => {
      const headers = authHeaders();
      try {
        const res = await fetch(`${API_BASE_URL}/equipo_tipos/`, { headers });
        if (res.ok) {
          const data = await res.json();
          setEquipoTipos(data);
        }
      } catch (error) {
        console.error("Error cargando tipos de equipo:", error);
      }
    };
    fetchEquipoTipos();
    fetchProductos();
  }, []);

  const filteredProductos = productos.filter((prod) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (prod.marca || '').toLowerCase().includes(q) ||
      (prod.referencia || '').toLowerCase().includes(q) ||
      (prod.serial || '').toLowerCase().includes(q)
    );
  });

  const handleCreateProducto = async (e) => {
    e.preventDefault();
    const url = editingItem ? `${API_BASE_URL}/productos/${editingItem.id}` : `${API_BASE_URL}/productos/`;
    const method = editingItem ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        marca: productoForm.marca,
        referencia: productoForm.referencia || null,
        memoria_ram: productoForm.memoria_ram || null,
        disco_duro: productoForm.disco_duro || null,
        serial: productoForm.serial || null,
        observaciones: productoForm.observaciones || null,
        tipo_id: productoForm.tipo_id
      }),
    });
    if (response.ok) {
      alert(editingItem ? "Producto actualizado exitosamente" : "Producto creado exitosamente");
      setProductoForm({ marca: '', referencia: '', memoria_ram: '', disco_duro: '', serial: '', observaciones: '', tipo_id: '' });
      setEditingItem(null);
      setIsCreating(false);
      fetchProductos();
    } else {
      const errorData = await response.json().catch(() => ({ detail: 'Error al guardar producto' }));
      alert(errorData.detail || "No se pudo guardar el producto");
    }
  };

  const handleDeleteProducto = async (id) => {
    if (!window.confirm("¿Está seguro de desactivar este producto?")) return;
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (response.ok) {
      alert("Producto desactivado exitosamente");
      fetchProductos();
    } else {
      alert("No se pudo desactivar el producto");
    }
  };

  const startEdit = (producto) => {
    setEditingItem(producto);
    setProductoForm({
      marca: producto.marca || '',
      referencia: producto.referencia || '',
      memoria_ram: producto.memoria_ram || '',
      disco_duro: producto.disco_duro || '',
      serial: producto.serial || '',
      observaciones: producto.observaciones || '',
      tipo_id: producto.tipo_id || ''
    });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setProductoForm({ marca: '', referencia: '', memoria_ram: '', disco_duro: '', serial: '', observaciones: '', tipo_id: '' });
    setIsCreating(false);
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-4">
      {/* BUSCADOR Y BOTÓN CREAR */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos por marca, referencia o serial..."
              className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-8 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => { setIsCreating(true); setEditingItem(null); setProductoForm({ marca: '', referencia: '', memoria_ram: '', disco_duro: '', serial: '', observaciones: '', tipo_id: '' }); }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-black hover:bg-blue-700 transition-all text-xs sm:text-sm cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Crear</span>
          </button>
        </div>
      </div>

      {/* FORMULARIO CREAR/EDITAR */}
      {isCreating && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BoxIcon size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {editingItem ? 'Editar Producto' : 'Crear Producto'}
              </h3>
            </div>
          </div>
          <form onSubmit={handleCreateProducto} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Marca *</label>
              <input
                type="text"
                placeholder="Ej: HP, Dell, Lenovo"
                className="w-full bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-700 transition-all"
                value={productoForm.marca}
                onChange={e => setProductoForm({ ...productoForm, marca: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tipo de Equipo *</label>
              <select
                className="w-full bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-700 transition-all cursor-pointer"
                value={productoForm.tipo_id}
                onChange={e => setProductoForm({ ...productoForm, tipo_id: e.target.value })}
                required
              >
                <option value="">Seleccione...</option>
                {equipoTipos.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Referencia</label>
              <input
                type="text"
                placeholder="Ej: ProBook 450 G8"
                className="w-full bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-700 transition-all"
                value={productoForm.referencia}
                onChange={e => setProductoForm({ ...productoForm, referencia: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Serial</label>
              <input
                type="text"
                placeholder="Número de serie"
                className="w-full bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-700 transition-all"
                value={productoForm.serial}
                onChange={e => setProductoForm({ ...productoForm, serial: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Memoria RAM</label>
              <input
                type="text"
                placeholder="Ej: 8GB, 16GB"
                className="w-full bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-700 transition-all"
                value={productoForm.memoria_ram}
                onChange={e => setProductoForm({ ...productoForm, memoria_ram: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Disco Duro</label>
              <input
                type="text"
                placeholder="Ej: 256GB SSD, 500GB HDD"
                className="w-full bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-700 transition-all"
                value={productoForm.disco_duro}
                onChange={e => setProductoForm({ ...productoForm, disco_duro: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Observaciones</label>
            <textarea
              placeholder="Notas adicionales sobre el producto..."
              className="w-full bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-700 transition-all"
              rows={2}
              value={productoForm.observaciones}
              onChange={e => setProductoForm({ ...productoForm, observaciones: e.target.value })}
            />
          </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-black hover:bg-blue-700 shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs cursor-pointer">
                {editingItem ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={cancelEdit} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-black hover:bg-slate-200 transition-all text-xs cursor-pointer">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] border-b border-slate-100">
                <th className="px-3 py-2 sm:px-4 sm:py-2.5">ID</th>
                <th className="px-3 py-2 sm:px-4 sm:py-2.5">Marca / Referencia</th>
                <th className="px-3 py-2 sm:px-4 sm:py-2.5">Tipo / Serial</th>
                <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-center">Estado</th>
                <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProductos.map((prod) => (
                <tr key={prod.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-black">
                      {prod.id}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                    <div className="font-bold text-slate-800 text-xs sm:text-sm">{prod.marca}</div>
                    {prod.referencia && <div className="text-[10px] text-slate-500">{prod.referencia}</div>}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                    <div className="text-xs text-slate-600">{prod.tipo?.nombre || 'N/A'}</div>
                    {prod.serial && <div className="text-[10px] text-slate-400">S/N: {prod.serial}</div>}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black ${
                      prod.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {prod.is_active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => startEdit(prod)}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProducto(prod.id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors cursor-pointer"
                        title="Desactivar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProductos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-bold text-xs sm:text-sm">
                    {loading ? 'Cargando...' : 'Sin productos para mostrar'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function Dashboard({ onLogout }) {
  const [inventory, setInventory] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [view, setView] = useState('inventory');
  const [currentUser, setCurrentUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchMe = async () => {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) setCurrentUser(await response.json());
    };
    fetchMe();
  }, []);

  const isAdmin = currentUser?.is_admin;

  const fetchInventory = async () => {
    const skip = (currentPage - 1) * pageSize;
    const response = await fetch(`${API_BASE_URL}/inventory/?skip=${skip}&limit=${pageSize}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
      const data = await response.json();
      setInventory(data);
    }
    
    // Obtener total
    const countResponse = await fetch(`${API_BASE_URL}/inventory/count`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (countResponse.ok) {
      const countData = await countResponse.json();
      setTotalItems(countData.total);
    }
  };

  useEffect(() => { if (view === 'inventory') fetchInventory(); }, [view, currentPage, pageSize]);

  // Resetear a página 1 cuando cambia el tamaño de página
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // Cerrar sidebar móvil al cambiar de vista
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [view]);

  const filteredInventory = inventory.filter(item =>
    item.empleado?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    item.is_active !== false
  );
  
  const totalPages = Math.ceil(totalItems / pageSize);

  const handleSaveInventory = async (formData) => {
    // Si hay múltiples productos (tanto en creación como edición)
    if (formData.productos && Array.isArray(formData.productos) && formData.productos.length > 0) {
        // Validar empleado_id
        const empleadoId = parseInt(formData.empleado_id);
        if (isNaN(empleadoId)) {
          alert('Error: ID de empleado inválido');
          return;
        }
        
        const promises = formData.productos.map((producto, index) => {
          // Validar producto_id
          const productoId = parseInt(producto.id);
          if (isNaN(productoId)) {
            return Promise.reject(new Error(`Producto ${index + 1} tiene ID inválido`));
          }
          
          // Construir objeto solo con campos válidos
          const itemData = {
            empleado_id: empleadoId,
            producto_id: productoId
          };
          
          // Agregar campos opcionales solo si tienen valor
          if (formData.sede_id && formData.sede_id !== '') {
            const sedeIdParsed = parseInt(formData.sede_id);
            if (!isNaN(sedeIdParsed)) {
              itemData.sede_id = sedeIdParsed;
            }
          }
          
          if (formData.quien_entrega && formData.quien_entrega.trim() !== '') {
            itemData.quien_entrega = formData.quien_entrega.trim();
          }
          
          if (formData.observacion && formData.observacion.trim() !== '') {
            itemData.observacion = formData.observacion.trim();
          }
          
          return fetch(`${API_BASE_URL}/inventory/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(itemData)
          });
        });
        
        try {
          const responses = await Promise.all(promises);
          const successful = responses.filter(r => r.ok);
          const failed = responses.filter(r => !r.ok);
          
          // Si al menos uno fue exitoso o todos son duplicados, considerar éxito parcial
          if (successful.length > 0 || failed.length > 0) {
            const errors = await Promise.all(failed.map(async (r, i) => {
              const originalIndex = responses.indexOf(r);
              const errorData = await r.json().catch(() => ({}));
              return {
                index: originalIndex,
                message: errorData.detail || JSON.stringify(errorData),
                isDuplicate: r.status === 400 && 'Ya existe' in (errorData.detail || '')
              };
            }));
            
            const duplicateErrors = errors.filter(e => e.isDuplicate);
            const criticalErrors = errors.filter(e => !e.isDuplicate);
            
            if (criticalErrors.length > 0) {
              const errorMessages = criticalErrors.map(e => 
                `Producto ${e.index + 1}: ${e.message}`
              );
              alert(`Error al crear algunos registros: ${errorMessages.join('; ')}`);
            } else if (duplicateErrors.length > 0 && successful.length > 0) {
              // Hay duplicados pero también se crearon algunos nuevos
              alert(`${successful.length} registro(s) creado(s) correctamente. ${duplicateErrors.length} producto(s) ya estaban asignados al empleado.`);
            } else if (duplicateErrors.length === responses.length) {
              // Todos son duplicados
              alert('Todos los productos seleccionados ya estaban asignados a este empleado.');
            }
            
            // Actualizar la lista si hubo al menos un éxito
            if (successful.length > 0) {
              setIsModalOpen(false);
              setEditingItem(null);
              fetchInventory();
            }
          } else {
            // No hubo ningún éxito ni error (caso raro)
            alert('No se pudieron crear los registros. Ver consola para más detalles.');
          }
        } catch (error) {
          alert(`Error al crear registros: ${error.message}`);
        }
      } else {
        // Si es nuevo con un solo producto o edición con un solo producto
        // Validar y convertir IDs
        const empleadoId = parseInt(formData.empleado_id);
        const productoId = formData.producto_id ? parseInt(formData.producto_id) : null;
        
        if (isNaN(empleadoId) || !productoId || isNaN(productoId)) {
          alert('Error: IDs de empleado o producto inválidos');
          return;
        }
        
        const itemData = {
          empleado_id: empleadoId,
          producto_id: productoId
        };
        
        // Agregar campos opcionales solo si tienen valor
        if (formData.sede_id && formData.sede_id !== '') {
          const sedeIdParsed = parseInt(formData.sede_id);
          if (!isNaN(sedeIdParsed)) {
            itemData.sede_id = sedeIdParsed;
          }
        }
        
        if (formData.quien_entrega && formData.quien_entrega.trim() !== '') {
          itemData.quien_entrega = formData.quien_entrega.trim();
        }
        
        if (formData.observacion && formData.observacion.trim() !== '') {
          itemData.observacion = formData.observacion.trim();
        }
        
        // Si es edición, usar PUT, si no, usar POST
        const url = editingItem ? `${API_BASE_URL}/inventory/${editingItem.id}` : `${API_BASE_URL}/inventory/`;
        const method = editingItem ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(itemData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          alert(`Error al guardar: ${JSON.stringify(errorData.detail || errorData, null, 2)}`);
          return;
        }
        
        setIsModalOpen(false);
        setEditingItem(null);
        fetchInventory();
      }
  };

  const generateReport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reporte/excel`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('No se pudo generar el reporte');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fecha = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Reporte_Inventario_Molinos_${fecha}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error al descargar el Excel del servidor.");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/upload-masivo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchInventory();
      } else {
        alert("Error en el cargue masivo");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleRetirar = async (id) => {
    const fechaRetiro = prompt("Ingrese la fecha de retiro (YYYY-MM-DD) o deje vacío para fecha actual:");
    let fecha = null;
    if (fechaRetiro && fechaRetiro.trim()) {
      fecha = new Date(fechaRetiro + 'T00:00:00').toISOString();
    }
    
    if (fechaRetiro === null) return; // Usuario canceló
    
    const url = `${API_BASE_URL}/inventory/${id}/retirar${fecha ? '?fecha_retiro=' + fecha : ''}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) fetchInventory();
  };

  const handleActivar = async (id) => {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}/activar`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) fetchInventory();
  };

  const handleDownloadPDF = async (id, tipo) => {
    const endpoint = tipo === 'asignacion' 
      ? `${API_BASE_URL}/inventory/${id}/pdf-asignacion`
      : `${API_BASE_URL}/inventory/${id}/pdf-retiro`;
    
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fecha = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Acta_${tipo === 'asignacion' ? 'Asignacion' : 'Retiro'}_${id}_${fecha}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      alert("Error al descargar el PDF");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* OVERLAY (MÓVIL) */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={[
          "w-72 bg-[#0f172a] text-white flex flex-col fixed h-full z-50",
          "top-0 left-0",
          "transform transition-transform duration-200 ease-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          "overflow-y-auto",
        ].join(" ")}
        aria-hidden={!isSidebarOpen ? "true" : "false"}
      >
        <div className="p-8 flex flex-col items-center shrink-0">
          {/* CERRAR (MÓVIL) */}
          <div className="w-full flex justify-end lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-xl text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>

          <div className="bg-white/5 p-4 rounded-3xl mb-4 backdrop-blur-sm border border-white/10">
            <img src="https://molinosdelatlantico.com/wp-content/uploads/2023/06/logo-web.png" alt="Logo" className="w-32 h-auto object-contain" />
          </div>
          <div className="h-1 w-10 bg-blue-600 rounded-full"></div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-4">
            {isAdmin ? 'ADMINISTRADOR' : 'OPERADOR'}
          </p>
        </div>

        <nav className="flex-1 px-6 space-y-3 mt-4 overflow-y-auto">
          <button onClick={() => setView('inventory')} className={`w-full flex items-center py-4 px-5 rounded-2xl transition-all cursor-pointer ${view === 'inventory' ? 'bg-blue-600 shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Package size={20} className="mr-3" /> <span className="font-bold">Inventario</span>
          </button>
          {isAdmin && (
            <>
              <button onClick={() => setView('users')} className={`w-full flex items-center py-4 px-5 rounded-2xl transition-all cursor-pointer ${view === 'users' ? 'bg-blue-600 shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
                <Users size={20} className="mr-3" /> <span className="font-bold">Usuarios</span>
              </button>
              <button onClick={() => setView('catalogs')} className={`w-full flex items-center py-4 px-5 rounded-2xl transition-all cursor-pointer ${view === 'catalogs' ? 'bg-blue-600 shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
                <Settings size={20} className="mr-3" /> <span className="font-bold">Catálogos</span>
              </button>
              <button onClick={() => setView('empleados')} className={`w-full flex items-center py-4 px-5 rounded-2xl transition-all cursor-pointer ${view === 'empleados' ? 'bg-blue-600 shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
                <UserPlus size={20} className="mr-3" /> <span className="font-bold">Empleados</span>
              </button>
              <button onClick={() => setView('productos')} className={`w-full flex items-center py-4 px-5 rounded-2xl transition-all cursor-pointer ${view === 'productos' ? 'bg-blue-600 shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
                <BoxIcon size={20} className="mr-3" /> <span className="font-bold">Productos</span>
              </button>
              <button onClick={generateReport} className="w-full flex items-center py-4 px-5 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-green-400 transition-all group cursor-pointer">
                <div className="p-2 bg-slate-800 rounded-lg mr-3 group-hover:bg-green-500/10">
                  <FileSpreadsheet size={18} className="group-hover:text-green-400" />
                </div>
                <span className="font-bold">Reporte Excel</span>
              </button>
            </>
          )}
        </nav>
        <div className="p-8 border-t border-slate-800/50 shrink-0">
          <button onClick={onLogout} className="w-full flex items-center text-slate-400 hover:text-red-400 font-bold transition-all cursor-pointer">
            <LogOut size={20} className="mr-3" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-12 min-h-screen overflow-auto">
        {/* TOPBAR (MÓVIL) */}
        <div className="lg:hidden sticky top-0 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 pt-3 pb-4 bg-[#f8fafc]/80 backdrop-blur border-b border-slate-100 mb-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-600 shadow-sm active:scale-95 transition"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
            <div className="text-center">
              <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                {isAdmin ? 'Administrador' : 'Operador'}
              </div>
              <div className="text-lg font-black text-slate-900 tracking-tight">
                {view === 'inventory' ? 'Inventario' : view === 'users' ? 'Usuarios' : view === 'catalogs' ? 'Catálogos' : view === 'empleados' ? 'Empleados' : view === 'productos' ? 'Productos' : 'Inventario'}
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-600 shadow-sm active:scale-95 transition cursor-pointer"
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {view === 'inventory' && (
          <div className="animate-in fade-in duration-700">
            <header className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end mb-8 lg:mb-12">
              <div>
                <h1 className="hidden lg:block text-5xl font-black text-slate-900 tracking-tighter">Inventario</h1>
                <div className="relative mt-4 lg:mt-8 w-full sm:w-[450px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full bg-white border-none rounded-[1.25rem] sm:rounded-[1.5rem] py-4 sm:py-5 pl-12 sm:pl-14 pr-5 sm:pr-6 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 rounded-[1.25rem] sm:rounded-[1.5rem] font-bold transition-all border-2 ${isUploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border-blue-50 text-blue-600 hover:border-blue-200 shadow-sm cursor-pointer'}`}>
                  {isUploading ? <RefreshCw size={20} className="animate-spin" /> : <Upload size={20} />}
                  <span>{isUploading ? 'CARGANDO...' : 'CARGA MASIVA'}</span>
                </button>
                <button onClick={() => { setEditingItem(null); setIsReadOnly(false); setIsModalOpen(true); }} className="w-full sm:w-auto bg-blue-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[1.25rem] sm:rounded-[1.5rem] font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <PlusCircle size={22} /> NUEVO REGISTRO
                </button>
              </div>
            </header>

            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[900px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">
                    <th className="px-6 sm:px-10 py-6 sm:py-8 text-center">Responsable / Cargo</th>
                    <th className="px-6 sm:px-8 py-6 sm:py-8 text-center">Marca / Tipo</th>
                    <th className="px-6 sm:px-8 py-6 sm:py-8 text-center">Area / Ubicación</th>
                    <th className="px-6 sm:px-10 py-6 sm:py-8 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInventory.map((item) => {
                    const isInactive = item.is_active === false;
                    return (
                      <tr key={item.id} className={`group transition-all duration-500 ${isInactive ? 'bg-red-50/70 border-l-4 border-l-red-500' : 'hover:bg-blue-50/30'}`}>
                        <td className="px-6 sm:px-10 py-6 sm:py-8">
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isInactive ? 'bg-red-200 text-red-600' : 'bg-slate-100 text-slate-400'}`}><Users size={20} /></div>
                            <div>
                              <div className={`text-base font-black uppercase ${isInactive ? 'text-red-800' : 'text-slate-800'}`}>{item.empleado?.nombre || 'N/A'}</div>
                              <div className="text-[10px] font-bold uppercase text-slate-400">{item.empleado?.cargo?.nombre || 'Sin Cargo'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 sm:px-8 py-6 sm:py-8 text-center">
                          <div className={`text-sm font-black ${isInactive ? 'text-red-700' : 'text-slate-700'}`}>
                            {item.producto?.marca || 'N/A'} {item.producto?.referencia ? `- ${item.producto.referencia}` : ''}
                          </div>
                          <div className="text-[11px] text-slate-400 font-bold uppercase">{item.producto?.tipo?.nombre || 'Sin Tipo'}</div>
                          {item.producto?.serial && <div className="text-[9px] text-slate-500 mt-0.5">S/N: {item.producto.serial}</div>}
                        </td>
                        <td className="px-6 sm:px-8 py-6 sm:py-8 text-center">
                          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-black uppercase">{item.empleado?.area?.nombre || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400 font-bold block mt-1"><MapPin size={10} className="inline mr-1" /> {item.sede?.nombre || item.empleado?.ciudad?.nombre || 'N/A'}</div>
                        </td>
                        <td className="px-6 sm:px-10 py-6 sm:py-8">
                          <div className="flex justify-center gap-1.5 flex-wrap">
                            <button 
                              onClick={() => handleDownloadPDF(item.id, 'asignacion')} 
                              className="p-2 bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer" 
                              title="PDF Asignación"
                            >
                              <FileText size={16} />
                            </button>
                            {isInactive && (
                              <button 
                                onClick={() => handleDownloadPDF(item.id, 'retiro')} 
                                className="p-2 bg-white border border-red-100 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer" 
                                title="PDF Retiro"
                              >
                                <Download size={16} />
                              </button>
                            )}
                            <button onClick={() => { setEditingItem(item); setIsReadOnly(true); setIsModalOpen(true); }} className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition-all cursor-pointer" title="Ver"><Eye size={16} /></button>
                            {isAdmin && (
                              <>
                                {isInactive ? (
                                  <button onClick={() => handleActivar(item.id)} className="p-2 bg-white border border-green-100 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all cursor-pointer" title="Activar"><ShieldCheck size={16} /></button>
                                ) : (
                                  <>
                                    <button onClick={() => { setEditingItem(item); setIsReadOnly(false); setIsModalOpen(true); }} className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-amber-600 rounded-lg transition-all cursor-pointer" title="Editar"><Edit3 size={16} /></button>
                                    <button onClick={() => handleRetirar(item.id)} className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer" title="Retirar"><Trash2 size={16} /></button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 sm:px-10 py-12 text-center text-slate-400 font-bold">
                        {searchTerm ? 'No se encontraron resultados para la búsqueda' : 'No hay registros para mostrar'}
                      </td>
                    </tr>
                  )}
                </tbody>
                </table>
              </div>
              
              {/* PAGINACIÓN */}
              <div className="px-6 sm:px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 font-medium">Mostrar:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-slate-500">de {totalItems} registros</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      currentPage === 1
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                    }`}
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-slate-700">
                    Página {currentPage} de {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      currentPage >= totalPages
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {view === 'users' && isAdmin && <UsersView />}
        {view === 'catalogs' && isAdmin && <CatalogsView />}
        {view === 'empleados' && isAdmin && <EmpleadosView />}
        {view === 'productos' && isAdmin && <ProductosView />}
      </main>

      <InventoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveInventory} initialData={editingItem} readOnly={isReadOnly} />
    </div>
  );
}