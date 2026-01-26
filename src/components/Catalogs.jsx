import React, { useEffect, useState } from 'react';
import {
  Plus,
  Building2,
  MapPin,
  Briefcase,
  Laptop,
  X,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const CATALOGS = {
  areas: {
    label: 'Áreas',
    icon: MapPin,
    endpoint: 'areas',
  },
  empresas: {
    label: 'Empresas',
    icon: Building2,
    endpoint: 'empresas',
  },
  cargos: {
    label: 'Cargos',
    icon: Briefcase,
    endpoint: 'cargos',
  },
  equipo_tipos: {
    label: 'Tipos de Equipo',
    icon: Laptop,
    endpoint: 'equipo_tipos',
  },
};

export default function Catalogs() {
  /* =========================
     STATE
  ========================== */
  const [tipo, setTipo] = useState('areas');
  const [nombre, setNombre] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageModal, setMessageModal] = useState({
    open: false,
    type: 'success',
    message: '',
  });

  /* =========================
     EFFECTS
  ========================== */
  useEffect(() => {
    fetchItems();
  }, [tipo]);

  /* =========================
     DATA
  ========================== */
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/${CATALOGS[tipo].endpoint}/`, {
        headers: authHeaders(),
      });
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HELPERS
  ========================== */
  const showMessage = (type, message) => {
    setMessageModal({ open: true, type, message });
  };

  /* =========================
     CRUD
  ========================== */
  const handleSave = async (e) => {
    e.preventDefault();

    const res = await fetch(
      `${API_BASE_URL}/${CATALOGS[tipo].endpoint}/`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ nombre }),
      }
    );

    if (res.ok) {
      showMessage('success', `${CATALOGS[tipo].label} creado correctamente`);
      setNombre('');
      setIsModalOpen(false);
      fetchItems();
    } else {
      const err = await res.json();
      showMessage('error', err.detail || 'Error al guardar');
    }
  };

  const Icon = CATALOGS[tipo].icon;

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="p-6 bg-white rounded-3xl shadow-xl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900">
            Catálogos
          </h2>
          <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
            Configuración del sistema
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      {/* SELECTOR */}
      <div className="flex gap-3 mb-6">
        {Object.entries(CATALOGS).map(([key, cfg]) => {
          const BtnIcon = cfg.icon;
          const active = tipo === key;
          return (
            <button
              key={key}
              onClick={() => setTipo(key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <BtnIcon size={18} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Icon size={18} />
            </div>
            <div className="font-bold text-slate-700">
              {item.nombre}
            </div>
          </div>
        ))}

        {!loading && items.length === 0 && (
          <div className="col-span-full text-center text-slate-400 font-bold py-10">
            No hay registros
          </div>
        )}
      </div>

      {/* MODAL CREATE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-black">
                Nuevo {CATALOGS[tipo].label}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-slate-400 font-bold"
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
            </form>
          </div>
        </div>
      )}

      {/* MESSAGE MODAL */}
      {messageModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm text-center">
            {messageModal.type === 'success' ? (
              <CheckCircle className="mx-auto text-green-500" size={40} />
            ) : (
              <AlertTriangle className="mx-auto text-red-500" size={40} />
            )}
            <p className="mt-4 font-medium">
              {messageModal.message}
            </p>
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
