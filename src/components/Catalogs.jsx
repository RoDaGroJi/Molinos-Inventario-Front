import React, { useEffect, useState } from 'react';
import {
  Plus,
  X,
  Eye,
  Pencil,
  Power,
  Building2,
  MapPin,
  Briefcase,
  Laptop,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const CATALOGS = {
  areas: { label: 'Áreas', icon: MapPin },
  empresas: { label: 'Empresas', icon: Building2 },
  cargos: { label: 'Cargos', icon: Briefcase },
  equipo_tipos: { label: 'Tipos de Equipo', icon: Laptop },
};

export default function Catalogs() {
  /* ===================== STATE ===================== */
  const [tipo, setTipo] = useState('areas');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    mode: 'create', // create | view | edit
    item: null,
  });

  const [nombre, setNombre] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [message, setMessage] = useState(null);

  /* ===================== EFFECTS ===================== */
  useEffect(() => {
    loadItems();
  }, [tipo]);

  /* ===================== DATA ===================== */
  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/${tipo}/`, {
        headers: authHeaders(),
      });
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  /* ===================== HELPERS ===================== */
  const openModal = (mode, item = null) => {
    setModal({ open: true, mode, item });
    setNombre(item?.nombre || '');
    setIsActive(item?.is_active ?? true);
  };

  const closeModal = () => {
    setModal({ open: false, mode: 'create', item: null });
    setNombre('');
    setIsActive(true);
  };

  const showMessage = (type, text) =>
    setMessage({ type, text });

  /* ===================== ACTIONS ===================== */
  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/${tipo}/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ nombre }),
    });

    if (res.ok) {
      showMessage('success', 'Registro creado correctamente');
      closeModal();
      loadItems();
    } else {
      showMessage('error', 'Error al crear');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch(
      `${API_BASE_URL}/${tipo}/${modal.item.id}`,
      {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ nombre, is_active: isActive }),
      }
    );

    if (res.ok) {
      showMessage('success', 'Registro actualizado');
      closeModal();
      loadItems();
    } else {
      showMessage('error', 'Error al actualizar');
    }
  };

  const toggleStatus = async (item) => {
    const res = await fetch(
      `${API_BASE_URL}/${tipo}/${item.id}`,
      {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          nombre: item.nombre,
          is_active: !item.is_active,
        }),
      }
    );

    if (res.ok) loadItems();
  };

  const Icon = CATALOGS[tipo].icon;

  /* ===================== RENDER ===================== */
  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black">Catálogos</h2>
          <p className="text-xs uppercase text-slate-400 font-bold">
            Configuración general
          </p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      {/* SELECTOR */}
      <div className="flex gap-3 mb-6">
        {Object.entries(CATALOGS).map(([key, cfg]) => {
          const BtnIcon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setTipo(key)}
              className={`px-4 py-3 rounded-2xl font-black flex gap-2 items-center ${
                tipo === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <BtnIcon size={18} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex justify-between items-center p-4 rounded-2xl border ${
              item.is_active
                ? 'bg-white'
                : 'bg-slate-50 opacity-60'
            }`}
          >
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Icon size={18} />
              </div>
              <div>
                <p className="font-bold">{item.nombre}</p>
                <p className="text-xs text-slate-400">
                  {item.is_active ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => openModal('view', item)}>
                <Eye />
              </button>
              <button onClick={() => openModal('edit', item)}>
                <Pencil />
              </button>
              <button onClick={() => toggleStatus(item)}>
                <Power
                  className={
                    item.is_active
                      ? 'text-red-500'
                      : 'text-green-500'
                  }
                />
              </button>
            </div>
          </div>
        ))}

        {!loading && items.length === 0 && (
          <p className="text-center text-slate-400 py-8">
            No hay registros
          </p>
        )}
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-black capitalize">
                {modal.mode} {CATALOGS[tipo].label}
              </h3>
              <button onClick={closeModal}>
                <X />
              </button>
            </div>

            <form
              onSubmit={
                modal.mode === 'edit'
                  ? handleUpdate
                  : handleCreate
              }
              className="space-y-4"
            >
              <input
                disabled={modal.mode === 'view'}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-slate-50 rounded-xl p-3"
                required
              />

              {modal.mode !== 'create' && (
                <label className="flex items-center gap-3 font-bold">
                  <input
                    type="checkbox"
                    checked={isActive}
                    disabled={modal.mode === 'view'}
                    onChange={() => setIsActive(!isActive)}
                  />
                  Activo
                </label>
              )}

              {modal.mode !== 'view' && (
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="font-bold text-slate-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black"
                  >
                    Guardar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MESSAGE */}
      {message && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl text-center">
            {message.type === 'success' ? (
              <CheckCircle className="mx-auto text-green-500" size={40} />
            ) : (
              <AlertTriangle className="mx-auto text-red-500" size={40} />
            )}
            <p className="mt-4">{message.text}</p>
            <button
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-xl"
              onClick={() => setMessage(null)}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
