import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PlusCircle, Eye, Trash2, ShieldCheck,
  FileText, AlertTriangle, CheckCircle
} from 'lucide-react';

import InventoryModal from './InventoryModal';
import UserAdmin from './UserAdmin';
import Catalogs from './Catalogs';
import EmpleadosView from './EmpleadosView';
import ProductosView from './ProductosView';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

/* ===================== MODALES ===================== */
const MessageModal = ({ type, message, onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full">
      {type === 'success'
        ? <CheckCircle className="mx-auto text-green-500" size={40} />
        : <AlertTriangle className="mx-auto text-red-500" size={40} />
      }
      <p className="mt-4 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-xl font-black"
      >
        Aceptar
      </button>
    </div>
  </div>
);

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
      <AlertTriangle className="mx-auto text-amber-500" size={40} />
      <h3 className="font-black mt-3">{title}</h3>
      <p className="text-sm mt-2">{message}</p>
      <div className="flex justify-center gap-4 mt-6">
        <button onClick={onCancel} className="font-bold text-slate-400">
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-600 text-white px-4 py-2 rounded-xl font-black"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
);

/* ===================== DASHBOARD ===================== */
export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [messageModal, setMessageModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const isAdmin = currentUser?.is_admin;

  /* ===================== DATA ===================== */
  const fetchInventory = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/inventory/`, {
      headers: authHeaders(),
    });
    if (res.ok) setInventory(await res.json());
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/users/me`, { headers: authHeaders() })
      .then(r => r.ok && r.json())
      .then(setCurrentUser);
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  /* ===================== FILTER ===================== */
  const filteredInventory = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return inventory.filter(i =>
      i.is_active !== false &&
      (
        i.empleado?.nombre?.toLowerCase().includes(q) ||
        i.producto?.serial?.toLowerCase().includes(q) ||
        i.producto?.marca?.toLowerCase().includes(q)
      )
    );
  }, [inventory, searchTerm]);

  /* ===================== ACTIONS ===================== */
  const handleRetirar = (id) => {
    setConfirmModal({
      title: 'Retirar activo',
      message: '¿Está seguro de retirar este activo?',
      onConfirm: async () => {
        await fetch(`${API_BASE_URL}/inventory/${id}/retirar`, {
          method: 'PATCH',
          headers: authHeaders(),
        });
        setConfirmModal(null);
        fetchInventory();
        setMessageModal({ type: 'success', message: 'Activo retirado correctamente' });
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const handleActivar = async (id) => {
    await fetch(`${API_BASE_URL}/inventory/${id}/activar`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    fetchInventory();
    setMessageModal({ type: 'success', message: 'Activo reactivado correctamente' });
  };

  const handleDownloadPDF = async (id, tipo) => {
    const endpoint =
      tipo === 'asignacion'
        ? `${API_BASE_URL}/inventory/${id}/pdf-asignacion`
        : `${API_BASE_URL}/inventory/${id}/pdf-retiro`;

    const res = await fetch(endpoint, { headers: authHeaders() });
    if (!res.ok) {
      setMessageModal({ type: 'error', message: 'Error al generar PDF' });
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Acta_${tipo}_${id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">
        <input
          placeholder="Buscar..."
          className="bg-white rounded-xl px-4 py-3 shadow-sm w-96"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => {
            setEditingItem(null);
            setIsReadOnly(false);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black flex gap-2"
        >
          <PlusCircle /> Nuevo
        </button>
      </div>

      <table className="w-full bg-white rounded-2xl shadow">
        <tbody>
          {filteredInventory.map(item => (
            <tr key={item.id} className="border-b">
              <td className="p-4 font-bold">{item.empleado?.nombre}</td>
              <td className="p-4">{item.producto?.marca}</td>
              <td className="p-4 flex gap-2">
                <button onClick={() => handleDownloadPDF(item.id, 'asignacion')}><FileText /></button>
                <button onClick={() => { setEditingItem(item); setIsReadOnly(true); setIsModalOpen(true); }}><Eye /></button>
                {isAdmin && (
                  item.is_active === false ? (
                    <button onClick={() => handleActivar(item.id)}><ShieldCheck /></button>
                  ) : (
                    <button onClick={() => handleRetirar(item.id)}><Trash2 /></button>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingItem}
        readOnly={isReadOnly}
        onSave={() => {
          fetchInventory();
          setIsModalOpen(false);
        }}
      />

      {messageModal && <MessageModal {...messageModal} onClose={() => setMessageModal(null)} />}
      {confirmModal && <ConfirmModal {...confirmModal} />}
    </div>
  );
}
