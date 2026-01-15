import React, { useState, useEffect, useRef } from 'react';
import {
  Package, Users, Settings, LogOut, PlusCircle, Search,
  Layers, MapPin, ShieldCheck, Laptop, Edit3, Eye, Trash2,
  Briefcase, Building2, FileSpreadsheet, Upload, RefreshCw, Menu, X
} from 'lucide-react';
import InventoryModal from './InventoryModal';

const API_BASE_URL = 'http://localhost:8000';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// --- SUB-COMPONENTE: VISTA DE USUARIOS (LISTADO + CREACIÓN) ---
const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [userForm, setUserForm] = useState({ username: '', full_name: '', password: '' });

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
      setUserForm({ username: '', full_name: '', password: '' });
      fetchUsers();
    } else {
      alert("No se pudo crear el usuario");
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
            <button className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-black hover:bg-black transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-slate-200 uppercase tracking-widest text-sm">
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

// --- SUB-COMPONENTE: VISTA DE CATÁLOGOS (SEPARADOS, LISTADO + CREACIÓN) ---
const CatalogsView = () => {
  const [activeKey, setActiveKey] = useState('areas');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [search, setSearch] = useState('');

  const activeCatalog = CATALOGS.find((c) => c.key === activeKey) || CATALOGS[0];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/${activeKey}/`, { headers: authHeaders() });
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    setNombre('');
    setSearch('');
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
      fetchItems();
    } else {
      alert("No se pudo crear el registro");
    }
  };

  const ActiveIcon = activeCatalog.icon;

  return (
    <div className="animate-in fade-in duration-500">
      {/* SELECTOR DE CATÁLOGO */}
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-8">
        <div className="px-6 sm:px-10 py-6 sm:py-8 bg-slate-50/50 border-b border-slate-100">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Catálogos</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Listado y creación por categoría
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex gap-2 overflow-x-auto">
            {CATALOGS.map((c) => {
              const Icon = c.icon;
              const isActive = c.key === activeKey;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setActiveKey(c.key)}
                  className={[
                    "shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-black transition-all border",
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200"
                      : "bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:text-blue-600 shadow-sm",
                  ].join(" ")}
                >
                  <Icon size={18} />
                  <span>{c.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENIDO (LISTADO + CREACIÓN) */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* LISTADO */}
        <div className="w-full lg:flex-1 bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-6 sm:px-10 py-6 sm:py-8 bg-slate-50/50 border-b border-slate-100">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <ActiveIcon size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{activeCatalog.title}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                    Listado
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Buscar en ${activeCatalog.title.toLowerCase()}...`}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchItems}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black bg-white border border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-600 shadow-sm transition-all"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  ACTUALIZAR
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[420px] text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="py-4 pr-6">Nombre</th>
                    <th className="py-4 text-right">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredItems.map((it) => (
                    <tr key={it.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-4 pr-6">
                        <div className="font-black text-slate-800 uppercase">{it.nombre}</div>
                      </td>
                      <td className="py-4 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-black">
                          {it.id}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-10 text-center text-slate-400 font-bold">
                        {loading ? 'Cargando...' : 'Sin registros para mostrar'}
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
                <PlusCircle size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Crear en {activeCatalog.title}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                  Nuevo registro
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreate} className="p-6 sm:p-10 space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-4">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={`Ej: ${activeKey === 'ciudades' ? 'Barranquilla' : 'Contabilidad'}`}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl p-4 outline-none font-medium text-slate-700 transition-all"
                required
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-sm">
              GUARDAR EN CATÁLOGO
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function Dashboard({ onLogout }) {
  const [inventory, setInventory] = useState([]);
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
      const response = await fetch('http://localhost:8000/users/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) setCurrentUser(await response.json());
    };
    fetchMe();
  }, []);

  const isAdmin = currentUser?.is_admin;

  const fetchInventory = async () => {
    const response = await fetch('http://localhost:8000/inventory/', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) setInventory(await response.json());
  };

  useEffect(() => { if (view === 'inventory') fetchInventory(); }, [view]);

  // Cerrar sidebar móvil al cambiar de vista
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [view]);

  const filteredInventory = inventory.filter(item =>
    item.empleado_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    item.estado !== 2
  );

  const handleSaveInventory = async (formData) => {
    const url = editingItem ? `http://localhost:8000/inventory/${editingItem.id}` : 'http://localhost:8000/inventory/';
    const method = editingItem ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(formData)
    });
    if (response.ok) { setIsModalOpen(false); setEditingItem(null); fetchInventory(); }
  };

  const generateReport = async () => {
    try {
      const response = await fetch('http://localhost:8000/reporte/excel', {
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
      const response = await fetch('http://localhost:8000/inventory/upload-masivo', {
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
    if (!window.confirm("¿Desea retirar este equipo?")) return;
    const response = await fetch(`http://localhost:8000/inventory/${id}/retirar`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) fetchInventory();
  };

  const handleActivar = async (id) => {
    const response = await fetch(`http://localhost:8000/inventory/${id}/activar`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) fetchInventory();
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
        ].join(" ")}
        aria-hidden={!isSidebarOpen ? "true" : "false"}
      >
        <div className="p-8 flex flex-col items-center">
          {/* CERRAR (MÓVIL) */}
          <div className="w-full flex justify-end lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-xl text-slate-300 hover:bg-white/10 transition-colors"
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

        <nav className="flex-1 px-6 space-y-3 mt-4">
          <button onClick={() => setView('inventory')} className={`w-full flex items-center py-4 px-5 rounded-2xl transition-all ${view === 'inventory' ? 'bg-blue-600 shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Package size={20} className="mr-3" /> <span className="font-bold">Inventario</span>
          </button>
          {isAdmin && (
            <>
              <button onClick={() => setView('users')} className={`w-full flex items-center py-4 px-5 rounded-2xl transition-all ${view === 'users' ? 'bg-blue-600 shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
                <Users size={20} className="mr-3" /> <span className="font-bold">Usuarios</span>
              </button>
              <button onClick={() => setView('catalogs')} className={`w-full flex items-center py-4 px-5 rounded-2xl transition-all ${view === 'catalogs' ? 'bg-blue-600 shadow-xl' : 'text-slate-400 hover:bg-slate-800'}`}>
                <Settings size={20} className="mr-3" /> <span className="font-bold">Catálogos</span>
              </button>
              <button onClick={generateReport} className="w-full flex items-center py-4 px-5 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-green-400 transition-all group">
                <div className="p-2 bg-slate-800 rounded-lg mr-3 group-hover:bg-green-500/10">
                  <FileSpreadsheet size={18} className="group-hover:text-green-400" />
                </div>
                <span className="font-bold">Reporte Excel</span>
              </button>
            </>
          )}
        </nav>
        <div className="p-8 border-t border-slate-800/50">
          <button onClick={onLogout} className="w-full flex items-center text-slate-400 hover:text-red-400 font-bold transition-all">
            <LogOut size={20} className="mr-3" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-12">
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
                {view === 'inventory' ? 'Inventario' : view === 'users' ? 'Usuarios' : 'Catálogos'}
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-600 shadow-sm active:scale-95 transition"
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
                <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 rounded-[1.25rem] sm:rounded-[1.5rem] font-bold transition-all border-2 ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-white border-blue-50 text-blue-600 hover:border-blue-200 shadow-sm'}`}>
                  {isUploading ? <RefreshCw size={20} className="animate-spin" /> : <Upload size={20} />}
                  <span>{isUploading ? 'CARGANDO...' : 'CARGA MASIVA'}</span>
                </button>
                <button onClick={() => { setEditingItem(null); setIsReadOnly(false); setIsModalOpen(true); }} className="w-full sm:w-auto bg-blue-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[1.25rem] sm:rounded-[1.5rem] font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
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
                              <div className={`text-base font-black uppercase ${isInactive ? 'text-red-800' : 'text-slate-800'}`}>{item.empleado_nombre}</div>
                              <div className="text-[10px] font-bold uppercase text-slate-400">{item.cargo?.nombre || 'Sin Cargo'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 sm:px-8 py-6 sm:py-8 text-center">
                          <div className={`text-sm font-black ${isInactive ? 'text-red-700' : 'text-slate-700'}`}>{item.marca}</div>
                          <div className="text-[11px] text-slate-400 font-bold uppercase">{item.equipo?.nombre}</div>
                        </td>
                        <td className="px-6 sm:px-8 py-6 sm:py-8 text-center">
                          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-black uppercase">{item.area?.nombre}</div>
                          <div className="text-[10px] text-slate-400 font-bold block mt-1"><MapPin size={10} className="inline mr-1" /> {item.ciudad?.nombre}</div>
                        </td>
                        <td className="px-6 sm:px-10 py-6 sm:py-8">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => { setEditingItem(item); setIsReadOnly(true); setIsModalOpen(true); }} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Eye size={20} /></button>
                            {isAdmin && (
                              <>
                                {isInactive ? (
                                  <button onClick={() => handleActivar(item.id)} className="p-3 bg-white border border-green-100 text-green-500 hover:bg-green-500 hover:text-white rounded-xl transition-all"><ShieldCheck size={20} /></button>
                                ) : (
                                  <>
                                    <button onClick={() => { setEditingItem(item); setIsReadOnly(false); setIsModalOpen(true); }} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-amber-600 rounded-xl transition-all"><Edit3 size={20} /></button>
                                    <button onClick={() => handleRetirar(item.id)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-600 rounded-xl transition-all"><Trash2 size={20} /></button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {view === 'users' && isAdmin && <UsersView />}
        {view === 'catalogs' && isAdmin && <CatalogsView />}
      </main>

      <InventoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveInventory} initialData={editingItem} readOnly={isReadOnly} />
    </div>
  );
}