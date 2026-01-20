import React, { useState, useEffect } from 'react';
import {
  Package, Search, RefreshCw, PlusCircle, Edit3, Eye, Trash2,
  ShieldCheck, X, Save, Users, Laptop
} from 'lucide-react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';
//const API_BASE_URL = 'http://localhost:8000';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export default function ProductosView() {
  const [productos, setProductos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [catalogs, setCatalogs] = useState({
    tipos: []
  });
  const [formData, setFormData] = useState({
    tipo_producto_id: '',
    marca: '',
    referencia: '',
    ram: '',
    procesador: '',
    disco_duro: '',
    serial: '',
    empleado_id: ''
  });

  useEffect(() => {
    fetchProductos();
    fetchCatalogs();
    fetchEmpleados();
  }, []);

  const fetchCatalogs = async () => {
    const headers = authHeaders();
    try {
      const res = await fetch(`${API_BASE_URL}/equipo_tipos/`, { headers });
      if (res.ok) {
        setCatalogs({ tipos: await res.json() });
      }
    } catch (error) {
      console.error("Error cargando catálogos:", error);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/empleados/`, { headers: authHeaders() });
      if (res.ok) setEmpleados(await res.json());
    } catch (error) {
      console.error("Error cargando empleados:", error);
    }
  };

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/productos/`, { headers: authHeaders() });
      if (res.ok) setProductos(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const filteredProductos = productos.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.marca || '').toLowerCase().includes(q) ||
      (p.serial || '').toLowerCase().includes(q) ||
      (p.empleado?.nombre_completo || '').toLowerCase().includes(q) ||
      (p.tipo_producto?.nombre || '').toLowerCase().includes(q)
    );
  });

  const handleSave = async (e) => {
    e.preventDefault();
    const url = editingProducto 
      ? `${API_BASE_URL}/productos/${editingProducto.id}` 
      : `${API_BASE_URL}/productos/`;
    const method = editingProducto ? 'PUT' : 'POST';
    
    const payload = {
      tipo_producto_id: parseInt(formData.tipo_producto_id),
      marca: formData.marca,
      referencia: formData.referencia || null,
      ram: formData.ram || null,
      procesador: formData.procesador || null,
      disco_duro: formData.disco_duro || null,
      serial: formData.serial,
      empleado_id: parseInt(formData.empleado_id)
    };

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert(editingProducto ? "Producto actualizado exitosamente" : "Producto creado exitosamente");
      setIsModalOpen(false);
      setEditingProducto(null);
      setFormData({ tipo_producto_id: '', marca: '', referencia: '', ram: '', procesador: '', disco_duro: '', serial: '', empleado_id: '' });
      fetchProductos();
    } else {
      const error = await response.json();
      alert(error.detail || "Error al guardar producto");
    }
  };

  const handleRetirar = async (id) => {
    if (!window.confirm("¿Desea retirar este producto?")) return;
    const response = await fetch(`${API_BASE_URL}/productos/${id}/retirar`, {
      method: 'PATCH',
      headers: authHeaders()
    });
    if (response.ok) fetchProductos();
  };

  const handleActivar = async (id) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}/activar`, {
      method: 'PATCH',
      headers: authHeaders()
    });
    if (response.ok) fetchProductos();
  };

  const openModal = (producto = null, readOnly = false) => {
    if (producto) {
      setFormData({
        tipo_producto_id: producto.tipo_producto?.id || producto.tipo_producto_id || '',
        marca: producto.marca || '',
        referencia: producto.referencia || '',
        ram: producto.ram || '',
        procesador: producto.procesador || '',
        disco_duro: producto.disco_duro || '',
        serial: producto.serial || '',
        empleado_id: producto.empleado?.id || producto.empleado_id || ''
      });
      setEditingProducto(producto);
    } else {
      setFormData({ tipo_producto_id: '', marca: '', referencia: '', ram: '', procesador: '', disco_duro: '', serial: '', empleado_id: '' });
      setEditingProducto(null);
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
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Productos</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                  Inventario de equipos
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchProductos}
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
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="py-4 pr-6">Producto</th>
                    <th className="py-4 pr-6">Especificaciones</th>
                    <th className="py-4 pr-6">Empleado</th>
                    <th className="py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProductos.map((p) => {
                    const isInactive = p.is_active === false;
                    return (
                      <tr key={p.id} className={`group transition-all ${isInactive ? 'bg-red-50/70 border-l-4 border-l-red-500' : 'hover:bg-blue-50/30'}`}>
                        <td className="py-4 pr-6">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${isInactive ? 'bg-red-200 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                              <Package size={18} />
                            </div>
                            <div>
                              <div className={`font-black ${isInactive ? 'text-red-800' : 'text-slate-800'}`}>
                                {p.tipo_producto?.nombre || '-'}
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold">{p.marca}</div>
                              <div className="text-[9px] text-slate-500 font-bold">Serial: {p.serial}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-6">
                          <div className="text-sm font-bold text-slate-700">
                            {p.ram && <span>RAM: {p.ram}</span>}
                            {p.procesador && <span className="ml-2">CPU: {p.procesador}</span>}
                            {p.disco_duro && <div className="text-xs text-slate-500">HDD: {p.disco_duro}</div>}
                            {p.referencia && <div className="text-xs text-slate-500">Ref: {p.referencia}</div>}
                          </div>
                        </td>
                        <td className="py-4 pr-6">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-slate-400" />
                            <div className="font-bold text-slate-700">{p.empleado?.nombre_completo || '-'}</div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => openModal(p, true)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                              <Eye size={20} />
                            </button>
                            {isInactive ? (
                              <button onClick={() => handleActivar(p.id)} className="p-3 bg-white border border-green-100 text-green-500 hover:bg-green-500 hover:text-white rounded-xl transition-all">
                                <ShieldCheck size={20} />
                              </button>
                            ) : (
                              <>
                                <button onClick={() => openModal(p, false)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-amber-600 rounded-xl transition-all">
                                  <Edit3 size={20} />
                                </button>
                                <button onClick={() => handleRetirar(p.id)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-600 rounded-xl transition-all">
                                  <Trash2 size={20} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProductos.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400 font-bold">
                        {loading ? 'Cargando...' : 'Sin productos para mostrar'}
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
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {isReadOnly ? 'Detalle del Producto' : editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
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
                  <Laptop size={16} className="text-blue-500" /> Información del Producto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Tipo de Producto *</label>
                    <select
                      required
                      disabled={isReadOnly}
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                        isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                      }`}
                      value={formData.tipo_producto_id}
                      onChange={e => setFormData({ ...formData, tipo_producto_id: e.target.value })}
                    >
                      <option value="">Seleccione...</option>
                      {catalogs.tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Marca *</label>
                    <input
                      required
                      disabled={isReadOnly}
                      type="text"
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                        isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                      }`}
                      value={formData.marca}
                      onChange={e => setFormData({ ...formData, marca: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Serial *</label>
                    <input
                      required
                      disabled={isReadOnly}
                      type="text"
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                        isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                      }`}
                      value={formData.serial}
                      onChange={e => setFormData({ ...formData, serial: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Referencia (Opcional)</label>
                    <input
                      disabled={isReadOnly}
                      type="text"
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                        isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                      }`}
                      value={formData.referencia}
                      onChange={e => setFormData({ ...formData, referencia: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">RAM (Opcional)</label>
                    <input
                      disabled={isReadOnly}
                      type="text"
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                        isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                      }`}
                      value={formData.ram}
                      onChange={e => setFormData({ ...formData, ram: e.target.value })}
                      placeholder="Ej: 8GB DDR4"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Procesador (Opcional)</label>
                    <input
                      disabled={isReadOnly}
                      type="text"
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                        isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                      }`}
                      value={formData.procesador}
                      onChange={e => setFormData({ ...formData, procesador: e.target.value })}
                      placeholder="Ej: Intel i5-10400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Disco Duro (Opcional)</label>
                    <input
                      disabled={isReadOnly}
                      type="text"
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                        isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                      }`}
                      value={formData.disco_duro}
                      onChange={e => setFormData({ ...formData, disco_duro: e.target.value })}
                      placeholder="Ej: 500GB SSD"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Empleado *</label>
                    <select
                      required
                      disabled={isReadOnly}
                      className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
                        isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
                      }`}
                      value={formData.empleado_id}
                      onChange={e => setFormData({ ...formData, empleado_id: e.target.value })}
                    >
                      <option value="">Seleccione...</option>
                      {empleados.filter(e => e.is_active).map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.nombre_completo}</option>
                      ))}
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
                    <Save size={18} /> {editingProducto ? 'Actualizar' : 'Guardar'}
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
