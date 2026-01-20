import React, { useState, useEffect } from 'react';
import {
  Users, Search, RefreshCw, PlusCircle, Edit3, Eye, Trash2,
  ShieldCheck, X, Save
} from 'lucide-react';

 const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';
//const API_BASE_URL = 'http://localhost:8000';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export default function EmpleadosView() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [catalogs, setCatalogs] = useState({
    cargos: [],
    areas: [],
    empresas: [],
    ciudades: []
  });
  const [formData, setFormData] = useState({
    nombre_completo: '',
    cargo_id: '',
    area_id: '',
    empresa_id: '',
    sede_id: ''
  });

  useEffect(() => {
    fetchEmpleados();
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    const headers = authHeaders();
    try {
      const [cargos, areas, empresas, ciudades] = await Promise.all([
        fetch(`${API_BASE_URL}/cargos/`, { headers }),
        fetch(`${API_BASE_URL}/areas/`, { headers }),
        fetch(`${API_BASE_URL}/empresas/`, { headers }),
        fetch(`${API_BASE_URL}/ciudades/`, { headers })
      ]);
      setCatalogs({
        cargos: cargos.ok ? await cargos.json() : [],
        areas: areas.ok ? await areas.json() : [],
        empresas: empresas.ok ? await empresas.json() : [],
        ciudades: ciudades.ok ? await ciudades.json() : []
      });
    } catch (error) {
      console.error("Error cargando catálogos:", error);
    }
  };

  const fetchEmpleados = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/empleados/`, { headers: authHeaders() });
      if (res.ok) setEmpleados(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const filteredEmpleados = empleados.filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (e.nombre_completo || '').toLowerCase().includes(q) ||
      (e.cargo?.nombre || '').toLowerCase().includes(q) ||
      (e.area?.nombre || '').toLowerCase().includes(q)
    );
  });

  const handleSave = async (e) => {
    e.preventDefault();
    const url = editingEmpleado 
      ? `${API_BASE_URL}/empleados/${editingEmpleado.id}` 
      : `${API_BASE_URL}/empleados/`;
    const method = editingEmpleado ? 'PUT' : 'POST';
    
    const payload = {
      ...formData,
      cargo_id: parseInt(formData.cargo_id),
      sede_id: parseInt(formData.sede_id),
      area_id: formData.area_id ? parseInt(formData.area_id) : null,
      empresa_id: formData.empresa_id ? parseInt(formData.empresa_id) : null
    };

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert(editingEmpleado ? "Empleado actualizado exitosamente" : "Empleado creado exitosamente");
      setIsModalOpen(false);
      setEditingEmpleado(null);
      setFormData({ nombre_completo: '', cargo_id: '', area_id: '', empresa_id: '', sede_id: '' });
      fetchEmpleados();
    } else {
      const error = await response.json();
      alert(error.detail || "Error al guardar empleado");
    }
  };

  const handleRetirar = async (id) => {
    if (!window.confirm("¿Desea retirar este empleado?")) return;
    const response = await fetch(`${API_BASE_URL}/empleados/${id}/retirar`, {
      method: 'PATCH',
      headers: authHeaders()
    });
    if (response.ok) fetchEmpleados();
  };

  const handleActivar = async (id) => {
    const response = await fetch(`${API_BASE_URL}/empleados/${id}/activar`, {
      method: 'PATCH',
      headers: authHeaders()
    });
    if (response.ok) fetchEmpleados();
  };

  const openModal = (empleado = null, readOnly = false) => {
    if (empleado) {
      setFormData({
        nombre_completo: empleado.nombre_completo || '',
        cargo_id: empleado.cargo?.id || empleado.cargo_id || '',
        area_id: empleado.area?.id || empleado.area_id || '',
        empresa_id: empleado.empresa?.id || empleado.empresa_id || '',
        sede_id: empleado.sede?.id || empleado.sede_id || ''
      });
      setEditingEmpleado(empleado);
    } else {
      setFormData({ nombre_completo: '', cargo_id: '', area_id: '', empresa_id: '', sede_id: '' });
      setEditingEmpleado(null);
    }
    setIsReadOnly(readOnly);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* LISTADO */}
        <div className="w-full lg:flex-1 bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-6 sm:px-10 py-6 sm:py-8 bg-slate-50/50 border-b border-slate-100">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Empleados</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                  Gestión de personal
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar empleado..."
                    className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchEmpleados}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black bg-white border border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-600 shadow-sm transition-all"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  ACTUALIZAR
                </button>
                <button
                  onClick={() => openModal(null, false)}
                  className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle size={18} /> NUEVO
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[600px] text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="py-4 pr-6">Empleado</th>
                    <th className="py-4 pr-6">Cargo / Área</th>
                    <th className="py-4 pr-6">Empresa / Sede</th>
                    <th className="py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEmpleados.map((e) => {
                    const isInactive = e.is_active === false;
                    return (
                      <tr key={e.id} className={`group transition-all ${isInactive ? 'bg-red-50/70 border-l-4 border-l-red-500' : 'hover:bg-blue-50/30'}`}>
                        <td className="py-4 pr-6">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${isInactive ? 'bg-red-200 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                              <Users size={18} />
                            </div>
                            <div className={`font-black ${isInactive ? 'text-red-800' : 'text-slate-800'}`}>
                              {e.nombre_completo}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-6">
                          <div className="font-bold text-slate-700">{e.cargo?.nombre || '-'}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{e.area?.nombre || 'Sin área'}</div>
                        </td>
                        <td className="py-4 pr-6">
                          <div className="font-bold text-slate-700">{e.empresa?.nombre || '-'}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{e.sede?.nombre || '-'}</div>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => openModal(e, true)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                              <Eye size={20} />
                            </button>
                            {isInactive ? (
                              <button onClick={() => handleActivar(e.id)} className="p-3 bg-white border border-green-100 text-green-500 hover:bg-green-500 hover:text-white rounded-xl transition-all">
                                <ShieldCheck size={20} />
                              </button>
                            ) : (
                              <>
                                <button onClick={() => openModal(e, false)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-amber-600 rounded-xl transition-all">
                                  <Edit3 size={20} />
                                </button>
                                <button onClick={() => handleRetirar(e.id)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-600 rounded-xl transition-all">
                                  <Trash2 size={20} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEmpleados.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400 font-bold">
                        {loading ? 'Cargando...' : 'Sin empleados para mostrar'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {isReadOnly ? 'Detalle del Empleado' : editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
                </h2>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Molinos del Atlántico</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                  <Users size={16} className="text-blue-500" /> Información del Empleado
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Nombre Completo *</label>
                  <input
                    required
                    disabled={isReadOnly}
                    type="text"
                    className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                      isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                    }`}
                    value={formData.nombre_completo}
                    onChange={e => setFormData({ ...formData, nombre_completo: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Cargo *</label>
                    <select
                      required
                      disabled={isReadOnly}
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                        isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                      }`}
                      value={formData.cargo_id}
                      onChange={e => setFormData({ ...formData, cargo_id: e.target.value })}
                    >
                      <option value="">Seleccione...</option>
                      {catalogs.cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Sede *</label>
                    <select
                      required
                      disabled={isReadOnly}
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                        isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                      }`}
                      value={formData.sede_id}
                      onChange={e => setFormData({ ...formData, sede_id: e.target.value })}
                    >
                      <option value="">Seleccione...</option>
                      {catalogs.ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Área (Opcional)</label>
                    <select
                      disabled={isReadOnly}
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                        isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                      }`}
                      value={formData.area_id}
                      onChange={e => setFormData({ ...formData, area_id: e.target.value })}
                    >
                      <option value="">Seleccione...</option>
                      {catalogs.areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Empresa (Opcional)</label>
                    <select
                      disabled={isReadOnly}
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                        isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                      }`}
                      value={formData.empresa_id}
                      onChange={e => setFormData({ ...formData, empresa_id: e.target.value })}
                    >
                      <option value="">Seleccione...</option>
                      {catalogs.empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nombre}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-slate-400 font-bold hover:bg-slate-50 transition-all text-[11px] uppercase">
                    Cancelar
                  </button>
                  <button type="submit" className="flex items-center gap-2 px-10 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl transition-all text-[11px] uppercase">
                    <Save size={18} /> {editingEmpleado ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
