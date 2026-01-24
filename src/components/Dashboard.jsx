import React, { useState, useEffect, useRef } from 'react';
import {
  Package, Users, Settings, LogOut, PlusCircle, Search,
  Layers, MapPin, ShieldCheck, Laptop, Edit3, Eye, Trash2,
  Briefcase, Building2, FileSpreadsheet, Upload, RefreshCw, Menu, X,
  UserPlus, Box as BoxIcon, FileText, Download
} from 'lucide-react';
import InventoryModal from './InventoryModal';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';
// const API_BASE_URL = 'http://localhost:8000';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ... (usuarios, catálogos, empleados, productos subcomponentes igual) ...

// --- COMPONENTE PRINCIPAL ---
export default function Dashboard({ onLogout }) {
  const [inventory, setInventory] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  // Eliminamos paginación
  // const [currentPage, setCurrentPage] = useState(1);
  // const [pageSize, setPageSize] = useState(10);
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
    // Traer todos los registros SIN paginación
    const response = await fetch(`${API_BASE_URL}/inventory/`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
      const data = await response.json();
      setInventory(data);
      setTotalItems(data.length);
    }
    // La obtención de totalItems es ahora data.length (no es necesario el endpoint /count)
  };

  // Solo usar view como dependencia, sin currentPage/pageSize
  useEffect(() => { if (view === 'inventory') fetchInventory(); }, [view]);

  // Ya no se requiere efecto para resetear página cuando cambia pageSize

  // Cerrar sidebar móvil al cambiar de vista
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [view]);

  // FILTRO MEJORADO: mostrar todos los registros activos si search vacío, o filtrar multi-campo si searchTerm
  const filteredInventory = React.useMemo(() => {
    if (!searchTerm.trim()) {
      // Si no hay término de búsqueda, mostrar todos los activos
      return inventory.filter(item => item.is_active !== false);
    }
    // Convertir a minúsculas para comparar
    const term = searchTerm.toLowerCase();

    return inventory.filter(item => {
      if (item.is_active === false) return false;
      // Buscar coincidencias en múltiples campos útiles
      return (
        (item.empleado?.nombre?.toLowerCase().includes(term) || '') ||
        (item.empleado?.cargo?.nombre?.toLowerCase().includes(term) || '') ||
        (item.producto?.marca?.toLowerCase().includes(term) || '') ||
        (item.producto?.referencia?.toLowerCase().includes(term) || '') ||
        (item.producto?.serial?.toLowerCase().includes(term) || '') ||
        (item.producto?.tipo?.nombre?.toLowerCase().includes(term) || '') ||
        (item.empleado?.area?.nombre?.toLowerCase().includes(term) || '') ||
        (item.sede?.nombre?.toLowerCase().includes(term) || '') ||
        (item.empleado?.ciudad?.nombre?.toLowerCase().includes(term) || '')
      );
    });
  }, [inventory, searchTerm]);

  // const totalPages = Math.ceil(totalItems / pageSize);

  const handleSaveInventory = async (formData) => {
    // ...no cambia nada aquí...
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
            alert(`${successful.length} registro(s) creado(s) correctamente. ${duplicateErrors.length} producto(s) ya estaban asignados al empleado.`);
          } else if (duplicateErrors.length === responses.length) {
            alert('Todos los productos seleccionados ya estaban asignados a este empleado.');
          }

          if (successful.length > 0) {
            setIsModalOpen(false);
            setEditingItem(null);
            fetchInventory();
          }
        } else {
          alert('No se pudieron crear los registros. Ver consola para más detalles.');
        }
      } catch (error) {
        alert(`Error al crear registros: ${error.message}`);
      }
    } else {
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

              {/* ELIMINADO: PAGINACIÓN */}
              {/* 
              <div className="px-6 sm:px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                ...
              </div>
              */}
            </div>
          </div>
        )}
        {view === 'users' && isAdmin && <UserAdmin />}
        {view === 'catalogs' && isAdmin && <CatalogsView />}
        {view === 'empleados' && isAdmin && <EmpleadosView />}
        {view === 'productos' && isAdmin && <ProductosView />}
      </main>

      <InventoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveInventory} initialData={editingItem} readOnly={isReadOnly} />
    </div>
  );
}