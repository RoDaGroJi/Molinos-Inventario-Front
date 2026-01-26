import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  PlusCircle,
  Edit3,
  Eye,
  Trash2,
  ShieldCheck,
  X,
  Save
} from 'lucide-react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export default function EmpleadosView() {
  /* =========================
     STATE
  ========================== */
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [catalogs, setCatalogs] = useState({
    cargos: [],
    areas: [],
    empresas: [],
    ciudades: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    cargo_id: '',
    area_id: '',
    empresa_id: '',
    ciudad_id: '',
  });

  /* =========================
     EFFECTS
  ========================== */
  useEffect(() => {
    fetchEmpleados();
    fetchCatalogs();
  }, []);

  /* =========================
     DATA FETCH
  ========================== */
  const fetchCatalogs = async () => {
    try {
      const headers = authHeaders();
      const [cargos, areas, empresas, ciudades] = await Promise.all([
        fetch(`${API_BASE_URL}/cargos/`, { headers }),
        fetch(`${API_BASE_URL}/areas/`, { headers }),
        fetch(`${API_BASE_URL}/empresas/`, { headers }),
        fetch(`${API_BASE_URL}/ciudades/`, { headers }),
      ]);

      setCatalogs({
        cargos: cargos.ok ? await cargos.json() : [],
        areas: areas.ok ? await areas.json() : [],
        empresas: empresas.ok ? await empresas.json() : [],
        ciudades: ciudades.ok ? await ciudades.json() : [],
      });
    } catch (error) {
      console.error('Error cargando catálogos', error);
    }
  };

  const fetchEmpleados = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/empleados/`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        setEmpleados(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FILTER
  ========================== */
  const filteredEmpleados = empleados.filter((e) => {
    const q = search.toLowerCase();
    return (
      !q ||
      e.nombre?.toLowerCase().includes(q) ||
      e.cargo?.nombre?.toLowerCase().includes(q) ||
      e.area?.nombre?.toLowerCase().includes(q)
    );
  });

  /* =========================
     CRUD
  ========================== */
  const handleSave = async (e) => {
    e.preventDefault();

    const url = editingEmpleado
      ? `${API_BASE_URL}/empleados/${editingEmpleado.id}`
      : `${API_BASE_URL}/empleados/`;

    const method = editingEmpleado ? 'PUT' : 'POST';

    const payload = {
      nombre: formData.nombre,
      cargo_id: Number(formData.cargo_id),
      area_id: formData.area_id ? Number(formData.area_id) : null,
      empresa_id: formData.empresa_id ? Number(formData.empresa_id) : null,
      ciudad_id: Number(formData.ciudad_id),
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setIsModalOpen(false);
      setEditingEmpleado(null);
      resetForm();
      fetchEmpleados();
    } else {
      const err = await res.json();
      alert(err.detail || 'Error al guardar');
    }
  };

  const handleRetirar = async (id) => {
    if (!window.confirm('¿Desea retirar este empleado?')) return;
    await fetch(`${API_BASE_URL}/empleados/${id}/retirar`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    fetchEmpleados();
  };

  const handleActivar = async (id) => {
    await fetch(`${API_BASE_URL}/empleados/${id}/activar`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    fetchEmpleados();
  };

  /* =========================
     MODAL CONTROL
  ========================== */
  const resetForm = () => {
    setFormData({
      nombre: '',
      cargo_id: '',
      area_id: '',
      empresa_id: '',
      ciudad_id: '',
    });
  };

  const openModal = (empleado = null, readOnly = false) => {
    if (empleado) {
      setFormData({
        nombre: empleado.nombre || '',
        cargo_id: empleado.cargo?.id || empleado.cargo_id || '',
        area_id: empleado.area?.id || empleado.area_id || '',
        empresa_id: empleado.empresa?.id || empleado.empresa_id || '',
        ciudad_id: empleado.ciudad?.id || empleado.ciudad_id || '',
      });
      setEditingEmpleado(empleado);
    } else {
      resetForm();
      setEditingEmpleado(null);
    }
    setIsReadOnly(readOnly);
    setIsModalOpen(true);
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="p-6 bg-white rounded-3xl shadow-xl">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-3xl font-black">Empleados</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="border rounded-xl pl-9 pr-4 py-2"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchEmpleados}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <PlusCircle size={18} /> Nuevo
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full">
        <thead>
          <tr className="text-xs text-slate-400 text-left">
            <th>Empleado</th>
            <th>Cargo / Área</th>
            <th>Empresa / Sede</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmpleados.map((e) => {
            const inactive = e.is_active === false;
            return (
              <tr key={e.id} className={inactive ? 'bg-red-50' : 'hover:bg-slate-50'}>
                <td className="py-3 font-bold">{e.nombre}</td>
                <td>
                  <div>{e.cargo?.nombre || '-'}</div>
                  <div className="text-xs text-slate-400">{e.area?.nombre || 'Sin área'}</div>
                </td>
                <td>
                  <div>{e.empresa?.nombre || '-'}</div>
                  <div className="text-xs text-slate-400">{e.ciudad?.nombre || '-'}</div>
                </td>
                <td className="text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openModal(e, true)}><Eye /></button>
                    {inactive ? (
                      <button onClick={() => handleActivar(e.id)}><ShieldCheck /></button>
                    ) : (
                      <>
                        <button onClick={() => openModal(e)}><Edit3 /></button>
                        <button onClick={() => handleRetirar(e.id)}><Trash2 /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-black">
                {isReadOnly ? 'Detalle del Empleado' : editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <input
                disabled={isReadOnly}
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />

              <select
                disabled={isReadOnly}
                value={formData.cargo_id}
                onChange={(e) => setFormData({ ...formData, cargo_id: e.target.value })}
                required
              >
                <option value="">Cargo</option>
                {catalogs.cargos.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>

              <select
                disabled={isReadOnly}
                value={formData.area_id}
                onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
              >
                <option value="">Área</option>
                {catalogs.areas.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>

              <select
                disabled={isReadOnly}
                value={formData.empresa_id}
                onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
              >
                <option value="">Empresa</option>
                {catalogs.empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                ))}
              </select>

              <select
                disabled={isReadOnly}
                value={formData.ciudad_id}
                onChange={(e) => setFormData({ ...formData, ciudad_id: e.target.value })}
                required
              >
                <option value="">Sede</option>
                {catalogs.ciudades.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>

              {!isReadOnly && (
                <div className="col-span-2 flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl flex gap-2">
                    <Save /> Guardar
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
