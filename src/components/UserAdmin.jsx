import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Eye,
  Pencil,
  Power,
  X,
  CheckCircle,
  AlertTriangle,
  User,
} from 'lucide-react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

export default function UserAdmin() {
  /* ===================== STATE ===================== */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    mode: 'create', // create | view | edit
    user: null,
  });

  const [form, setForm] = useState({
    username: '',
    full_name: '',
    password: '',
    is_active: true,
  });

  const [message, setMessage] = useState(null);

  /* ===================== EFFECTS ===================== */
  useEffect(() => {
    loadUsers();
  }, []);

  /* ===================== DATA ===================== */
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/`, {
        headers: authHeaders(),
      });
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  };

  /* ===================== HELPERS ===================== */
  const openModal = (mode, user = null) => {
    setModal({ open: true, mode, user });
    setForm({
      username: user?.username || '',
      full_name: user?.full_name || '',
      password: '',
      is_active: user?.is_active ?? true,
    });
  };

  const closeModal = () => {
    setModal({ open: false, mode: 'create', user: null });
    setForm({
      username: '',
      full_name: '',
      password: '',
      is_active: true,
    });
  };

  const showMessage = (type, text) => setMessage({ type, text });

  /* ===================== ACTIONS ===================== */
  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        username: form.username,
        full_name: form.full_name,
        password: form.password,
      }),
    });

    if (res.ok) {
      showMessage('success', 'Usuario creado correctamente');
      closeModal();
      loadUsers();
    } else {
      showMessage('error', 'Error al crear usuario');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      username: form.username,
      full_name: form.full_name,
      is_active: form.is_active,
    };

    if (form.password) payload.password = form.password;

    const res = await fetch(
      `${API_BASE_URL}/users/${modal.user.id}`,
      {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      showMessage('success', 'Usuario actualizado');
      closeModal();
      loadUsers();
    } else {
      showMessage('error', 'Error al actualizar');
    }
  };

  const toggleStatus = async (user) => {
    const res = await fetch(
      `${API_BASE_URL}/users/${user.id}`,
      {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          username: user.username,
          full_name: user.full_name,
          is_active: !user.is_active,
        }),
      }
    );
    if (res.ok) loadUsers();
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <ShieldCheck />
          </div>
          <div>
            <h2 className="text-3xl font-black">Usuarios</h2>
            <p className="text-xs uppercase text-slate-400 font-bold">
              Administración de accesos
            </p>
          </div>
        </div>
        <button
          onClick={() => openModal('create')}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className={`flex justify-between items-center p-4 rounded-2xl border ${
              u.is_active ? 'bg-white' : 'bg-slate-50 opacity-60'
            }`}
          >
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={18} />
              </div>
              <div>
                <p className="font-bold">{u.full_name}</p>
                <p className="text-xs text-slate-400">@{u.username}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => openModal('view', u)}>
                <Eye />
              </button>
              <button onClick={() => openModal('edit', u)}>
                <Pencil />
              </button>
              <button onClick={() => toggleStatus(u)}>
                <Power
                  className={
                    u.is_active ? 'text-red-500' : 'text-green-500'
                  }
                />
              </button>
            </div>
          </div>
        ))}

        {!loading && users.length === 0 && (
          <p className="text-center text-slate-400 py-8">
            No hay usuarios registrados
          </p>
        )}
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-black capitalize">
                {modal.mode} usuario
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
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                placeholder="Usuario"
                className="w-full bg-slate-50 rounded-xl p-3"
                required
              />

              <input
                disabled={modal.mode === 'view'}
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                placeholder="Nombre completo"
                className="w-full bg-slate-50 rounded-xl p-3"
                required
              />

              {modal.mode !== 'view' && (
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Contraseña (opcional)"
                  className="w-full bg-slate-50 rounded-xl p-3"
                />
              )}

              {modal.mode !== 'create' && (
                <label className="flex items-center gap-3 font-bold">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    disabled={modal.mode === 'view'}
                    onChange={() =>
                      setForm({
                        ...form,
                        is_active: !form.is_active,
                      })
                    }
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
