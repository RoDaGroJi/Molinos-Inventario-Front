import React, { useState, useEffect } from 'react';
import {
  Package, Search, RefreshCw, PlusCircle, Edit3, Eye,
  Trash2, ShieldCheck, X, Save, Laptop, AlertTriangle, CheckCircle
} from 'lucide-react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';
// const API_BASE_URL = 'http://localhost:8000';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export default function ProductosView() {
  /* =========================
     STATES
  ========================== */
  const [productos, setProductos] = useState([]);
  const [catalogs, setCatalogs] = useState({ tipos: [] });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [formData, setFormData] = useState({
    tipo_producto_id: '',
    marca: '',
    referencia: '',
    ram: '',
    procesador: '',
    disco_duro: '',
    serial: ''
  });

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const [messageModal, setMessageModal] = useState({
    open: false,
    type: 'success', // success | error
    message: ''
  });

  /* =========================
     EFFECTS
  ========================== */
  useEffect(() => {
    fetchProductos();
    fetchCatalogs();
  }, []);

  /* =========================
     DATA
  ========================== */
  const fetchCatalogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/equipo_tipos/`, {
        headers: authHeaders()
      });
      if (res.ok) setCatalogs({ tipos: await res.json() });
    } catch {
      showMessage('error', 'Error cargando tipos de equipo');
    }
  };

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/productos/`, {
        headers: authHeaders()
      });
      if (res.ok) setProductos(await res.json());
    } catch {
      showMessage('error', 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HELPERS
  ========================== */
  const resetForm = () => {
    setFormData({
      tipo_producto_id: '',
      marca: '',
      referencia: '',
      ram: '',
      procesador: '',
      disco_duro: '',
      serial: ''
    });
  };

  const showMessage = (type, message) => {
    setMessageModal({ open: true, type, message });
  };

  /* =========================
     FILTER
  ========================== */
  const filteredProductos = productos.filter(p => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.marca?.toLowerCase().includes(q) ||
      p.serial?.toLowerCase().includes(q) ||
      p.tipo_producto?.nombre?.toLowerCase().includes(q)
    );
  });

  /* =========================
     CRUD
  ========================== */
  const handleSave = async (e) => {
    e.preventDefault();

    const url = editingProducto
      ? `${API_BASE_URL}/productos/${editingProducto.id}`
      : `${API_BASE_URL}/productos/`;

    const method = editingProducto ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({
          tipo_producto_id: Number(formData.tipo_producto_id),
          marca: formData.marca,
          referencia: formData.referencia || null,
          ram: formData.ram || null,
          procesador: formData.procesador || null,
          disco_duro: formData.disco_duro || null,
          serial: formData.serial
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al guardar');
      }

      showMessage('success',
        editingProducto ? 'Producto actualizado correctamente' : 'Producto creado correctamente'
      );

      setIsModalOpen(false);
      setEditingProducto(null);
      resetForm();
      fetchProductos();

    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const confirmRetirar = (id) => {
    setConfirmModal({
      open: true,
      title: 'Retirar producto',
      message: '¿Está seguro de retirar este producto del inventario?',
      onConfirm: async () => {
        await fetch(`${API_BASE_URL}/productos/${id}/retirar`, {
          method: 'PATCH',
          headers: authHeaders()
        });
        fetchProductos();
        setConfirmModal({ open: false });
      }
    });
  };

  const confirmActivar = (id) => {
    setConfirmModal({
      open: true,
      title: 'Activar producto',
      message: '¿Desea activar nuevamente este producto?',
      onConfirm: async () => {
        await fetch(`${API_BASE_URL}/productos/${id}/activar`, {
          method: 'PATCH',
          headers: authHeaders()
        });
        fetchProductos();
        setConfirmModal({ open: false });
      }
    });
  };

  /* =========================
     MODAL CONTROL
  ========================== */
  const openModal = (producto = null, readOnly = false) => {
    if (producto) {
      setFormData({
        tipo_producto_id: producto.tipo_producto?.id || '',
        marca: producto.marca || '',
        referencia: producto.referencia || '',
        ram: producto.ram || '',
        procesador: producto.procesador || '',
        disco_duro: producto.disco_duro || '',
        serial: producto.serial || ''
      });
      setEditingProducto(producto);
    } else {
      resetForm();
      setEditingProducto(null);
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
        <h2 className="text-3xl font-black">Productos</h2>
        <div className="flex gap-3">
          <input
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-2"
          />
          <button onClick={fetchProductos}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            <PlusCircle /> Nuevo
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-slate-400">
            <th>Producto</th>
            <th>Especificaciones</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProductos.map(p => {
            const inactive = p.is_active === false;
            return (
              <tr key={p.id} className={inactive ? 'bg-red-50' : 'hover:bg-slate-50'}>
                <td className="py-3">
                  <strong>{p.tipo_producto?.nombre}</strong>
                  <div className="text-xs">{p.marca}</div>
                  <div className="text-xs">Serial: {p.serial}</div>
                </td>
                <td className="text-sm">
                  {p.ram && `RAM: ${p.ram} `}
                  {p.procesador && `CPU: ${p.procesador}`}
                </td>
                <td className="text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openModal(p, true)}><Eye /></button>
                    {inactive ? (
                      <button onClick={() => confirmActivar(p.id)}><ShieldCheck /></button>
                    ) : (
                      <>
                        <button onClick={() => openModal(p)}><Edit3 /></button>
                        <button onClick={() => confirmRetirar(p.id)}><Trash2 /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-3xl">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-black">
                {isReadOnly ? 'Detalle' : editingProducto ? 'Editar' : 'Nuevo'} Producto
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <select
                required
                disabled={isReadOnly}
                value={formData.tipo_producto_id}
                onChange={e => setFormData({ ...formData, tipo_producto_id: e.target.value })}
              >
                <option value="">Tipo</option>
                {catalogs.tipos.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>

              <input
                required
                disabled={isReadOnly}
                placeholder="Marca"
                value={formData.marca}
                onChange={e => setFormData({ ...formData, marca: e.target.value })}
              />

              <input
                required
                disabled={isReadOnly}
                placeholder="Serial"
                value={formData.serial}
                onChange={e => setFormData({ ...formData, serial: e.target.value })}
              />

              <input
                disabled={isReadOnly}
                placeholder="Referencia"
                value={formData.referencia}
                onChange={e => setFormData({ ...formData, referencia: e.target.value })}
              />

              {!isReadOnly && (
                <div className="col-span-2 flex justify-end gap-3 mt-4">
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

      {/* CONFIRM MODAL */}
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

      {/* MESSAGE MODAL */}
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
