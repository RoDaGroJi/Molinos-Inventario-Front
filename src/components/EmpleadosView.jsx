import React, { useState, useEffect } from 'react';
import {
  Users, Search, RefreshCw, PlusCircle, Edit3, Eye, Trash2,
  ShieldCheck, X, Save
} from 'lucide-react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';

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
    try {
      const headers = authHeaders();
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
      console.error('Error cargando catálogos:', error);
    }
  };

  const fetchEmpleados = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/empleados/`, {
        headers: authHeaders()
      });
      if (res.ok) setEmpleados(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const filteredEmpleados = empleados.filter(e => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      e.nombre_completo?.toLowerCase().includes(q) ||
      e.cargo?.nombre?.toLowerCase().includes(q) ||
      e.area?.nombre?.toLowerCase().includes(q)
    );
  });

  const handleSave = async (e) => {
    e.preventDefault();

    const url = editingEmpleado
      ? `${API_BASE_URL}/empleados/${editingEmpleado.id}`
      : `${API_BASE_URL}/empleados/`;

    const method = editingEmpleado ? 'PUT' : 'POST';

    const payload = {
      nombre_completo: formData.nombre_completo,
      cargo_id: parseInt(formData.cargo_id),
      sede_id: parseInt(formData.sede_id),
      area_id: formData.area_id ? parseInt(formData.area_id) : null,
      empresa_id: formData.empresa_id ? parseInt(formData.empresa_id) : null
    };

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setIsModalOpen(false);
      setEditingEmpleado(null);
      setFormData({
        nombre_completo: '',
        cargo_id: '',
        area_id: '',
        empresa_id: '',
        sede_id: ''
      });
      fetchEmpleados();
    } else {
      const error = await response.json();
      alert(error.detail || 'Error al guardar empleado');
    }
  };

  const handleRetirar = async (id) => {
    if (!window.confirm('¿Desea retirar este empleado?')) return;

    await fetch(`${API_BASE_URL}/empleados/${id}/retirar`, {
      method: 'PATCH',
      headers: authHeaders()
    });

    fetchEmpleados();
  };

  const handleActivar = async (id) => {
    await fetch(`${API_BASE_URL}/empleados/${id}/activar`, {
      method: 'PATCH',
      headers: authHeaders()
    });

    fetchEmpleados();
  };

  const openModal = (empleado = null, readOnly = false) => {
    if (empleado) {
      setFormData({
        nombre_completo: empleado.nombre_completo || '',
        cargo_id: empleado.cargo?.id || '',
        area_id: empleado.area?.id || '',
        empresa_id: empleado.empresa?.id || '',
        sede_id: empleado.sede?.id || ''
      });
      setEditingEmpleado(empleado);
    } else {
      setFormData({
        nombre_completo: '',
        cargo_id: '',
        area_id: '',
        empresa_id: '',
        sede_id: ''
      });
      setEditingEmpleado(null);
    }

    setIsReadOnly(readOnly);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">

        {/* HEADER */}
        <div className="p-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Empleados</h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">
              Gestión de personal
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="pl-10 pr-4 py-3 rounded-xl border border-slate-100"
              />
            </div>

            <button
              onClick={fetchEmpleados}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Cargando' : 'Actualizar'}
            </button>

            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2"
            >
              <PlusCircle size={18} /> Nuevo
            </button>
          </div>
        </div>

        {/* TABLA */}
        <div className="p-8 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th>Empleado</th>
                <th>Cargo / Área</th>
                <th>Empresa / Sede</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmpleados.map(e => (
                <tr key={e.id} className="border-t">
                  <td>{e.nombre_completo}</td>
                  <td>{e.cargo?.nombre} / {e.area?.nombre || '—'}</td>
                  <td>{e.empresa?.nombre} / {e.sede?.nombre}</td>
                  <td className="text-center flex justify-center gap-2 py-2">
                    <button onClick={() => openModal(e, true)}><Eye /></button>
                    {e.is_active ? (
                      <>
                        <button onClick={() => openModal(e)}><Edit3 /></button>
                        <button onClick={() => handleRetirar(e.id)}><Trash2 /></button>
                      </>
                    ) : (
                      <button onClick={() => handleActivar(e.id)}><ShieldCheck /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-black">
                {isReadOnly ? 'Detalle' : editingEmpleado ? 'Editar' : 'Nuevo'} Empleado
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <input
                disabled={isReadOnly}
                value={formData.nombre_completo}
                onChange={e => setFormData({ ...formData, nombre_completo: e.target.value })}
                className="w-full p-3 border rounded-xl"
                placeholder="Nombre completo"
                required
              />

              <select
                disabled={isReadOnly}
                value={formData.cargo_id}
                onChange={e => setFormData({ ...formData, cargo_id: e.target.value })}
                className="w-full p-3 border rounded-xl"
                required
              >
                <option value="">Cargo</option>
                {catalogs.cargos.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>

              {!isReadOnly && (
                <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2">
                  <Save size={16} /> Guardar
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
