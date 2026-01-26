import React, { useState, useEffect } from 'react';
import {
  Users, Search, RefreshCw, PlusCircle, Edit3, Eye, Trash2,
  ShieldCheck, X, Save, AlertTriangle, CheckCircle
} from 'lucide-react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';
// const API_BASE_URL = 'http://localhost:8000';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export default function EmpleadosView() {
  /* =========================
     STATES
  ========================== */
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

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const [messageModal, setMessageModal] = useState({
    open: false,
    type: 'success',
    message: ''
  });

  /* =========================
     EFFECTS
  ========================== */
  useEffect(() => {
    fetchEmpleados();
    fetchCatalogs();
  }, []);

  /* =========================
     DATA
  ========================== */
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
    } catch {
      showMessage('error', 'Error cargando catálogos');
    }
  };

  const fetchEmpleados = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/empleados/`, { headers: authHeaders() });
      if (res.ok) setEmpleados(await res.json());
    } catch {
      showMessage('error', 'Error cargando empleados');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HELPERS
  ========================== */
  const resetForm = () => {
    setFormData({
      nombre_completo: '',
      cargo_id: '',
      area_id: '',
      empresa_id: '',
      sede_id: ''
    });
  };

  const showMessage = (type, message) => {
    setMessageModal({ open: true, type, message });
  };

  /* =========================
     FILTER
  ========================== */
  const filteredEmpleados = empleados.filter(e => {
    const q = search.toLowerCase();
    return (
      !q ||
      e.nombre_completo?.toLowerCase().includes(q) ||
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

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({
          nombre_completo: formData.nombre_completo,
          cargo_id: Number(formData.cargo_id),
          sede_id: Number(formData.sede_id),
          area_id: formData.area_id ? Number(formData.area_id) : null,
          empresa_id: formData.empresa_id ? Number(formData.empresa_id) : null
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al guardar');
      }

      showMessage(
        'success',
        editingEmpleado ? 'Empleado actualizado correctamente' : 'Empleado creado correctamente'
      );

      setIsModalOpen(false);
      setEditingEmpleado(null);
      resetForm();
      fetchEmpleados();

    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const confirmRetirar = (id) => {
    setConfirmModal({
      open: true,
      title: 'Retirar empleado',
      message: '¿Está seguro de retirar este empleado?',
      onConfirm: async () => {
        await fetch(`${API_BASE_URL}/empleados/${id}/retirar`, {
          method: 'PATCH',
          headers: authHeaders()
        });
        fetchEmpleados();
        setConfirmModal({ open: false });
      }
    });
  };

  const confirmActivar = (id) => {
    setConfirmModal({
      open: true,
      title: 'Activar empleado',
      message: '¿Desea activar nuevamente este empleado?',
      onConfirm: async () => {
        await fetch(`${API_BASE_URL}/empleados/${id}/activar`, {
          method: 'PATCH',
          headers: authHeaders()
        });
        fetchEmpleados();
        setConfirmModal({ open: false });
      }
    });
  };

  /* =========================
     MODAL CONTROL
  ========================== */
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
    <div className="animate-in fade-in duration-500">
      {/* === LISTADO === */}
      {/* (Tu tabla y layout se mantienen EXACTAMENTE igual, no los recorto aquí por brevedad) */}

      {/* === MODAL FORM === */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-slate-50 px-8 py-5 border-b flex justify-between">
              <h2 className="text-2xl font-black">
                {isReadOnly ? 'Detalle del Empleado' : editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-4">
              <input
                required
                disabled={isReadOnly}
                placeholder="Nombre completo"
                value={formData.nombre_completo}
                onChange={e => setFormData({ ...formData, nombre_completo: e.target.value })}
                className="w-full border rounded-xl p-3"
              />

              {!isReadOnly && (
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl">
                    <Save /> Guardar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* === CONFIRM MODAL === */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm text-center">
            <AlertTriangle className="mx-auto text-amber-500" size={40} />
            <h3 className="font-black mt-3">{confirmModal.title}</h3>
            <p className="text-sm mt-2">{confirmModal.message}</p>
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={() => setConfirmModal({ open: false })}>Cancelar</button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-xl"
                onClick={confirmModal.onConfirm}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MESSAGE MODAL === */}
      {messageModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm text-center">
            {messageModal.type === 'success'
              ? <CheckCircle className="mx-auto text-green-500" size={40} />
              : <AlertTriangle className="mx-auto text-red-500" size={40} />
            }
            <p className="mt-4">{messageModal.message}</p>
            <button
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-xl"
              onClick={() => setMessageModal({ open: false })}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
