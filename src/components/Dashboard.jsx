import React, { useEffect, useState } from 'react';
import { X, Save, Eye } from 'lucide-react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';

export default function InventoryModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  readOnly = false
}) {
  const [empleados, setEmpleados] = useState([]);
  const [productos, setProductos] = useState([]);
  const [sedes, setSedes] = useState([]);

  const [formData, setFormData] = useState({
    empleado_id: '',
    producto_id: '',
    sede_id: '',
    quien_entrega: '',
    observacion: ''
  });

  /* ===================== CARGA DE CATÁLOGOS ===================== */
  useEffect(() => {
    if (!isOpen) return;

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    Promise.all([
      fetch(`${API_BASE_URL}/empleados/`, { headers }).then(r => r.json()),
      fetch(`${API_BASE_URL}/productos/`, { headers }).then(r => r.json()),
      fetch(`${API_BASE_URL}/sedes/`, { headers }).then(r => r.json())
    ]).then(([emp, prod, sed]) => {
      setEmpleados(emp);
      setProductos(prod);
      setSedes(sed);
    });
  }, [isOpen]);

  /* ===================== MAPEO CORRECTO BACKEND → FORM ===================== */
  useEffect(() => {
    if (!initialData) {
      setFormData({
        empleado_id: '',
        producto_id: '',
        sede_id: '',
        quien_entrega: '',
        observacion: ''
      });
      return;
    }

    setFormData({
      empleado_id: initialData.empleado?.id || '',
      producto_id: initialData.producto?.id || '',
      sede_id: initialData.sede?.id || '',
      quien_entrega: initialData.quien_entrega || '',
      observacion: initialData.observacion || ''
    });
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    onSave(formData);
  };

  const Detail = ({ label, value }) => (
    <div>
      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </div>
      <div className="text-slate-800 font-bold text-sm">
        {value || '—'}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {readOnly ? 'Detalle del Inventario' : initialData ? 'Editar Asignación' : 'Nueva Asignación'}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Inventario · Molinos
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
            <X />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          {readOnly && initialData && (
            <div className="grid grid-cols-2 gap-6">
              <Detail label="Empleado" value={initialData.empleado?.nombre} />
              <Detail label="Cargo" value={initialData.empleado?.cargo?.nombre} />
              <Detail label="Área" value={initialData.empleado?.area?.nombre} />
              <Detail label="Empresa" value={initialData.empleado?.empresa?.nombre} />
              <Detail label="Ciudad" value={initialData.empleado?.ciudad?.nombre} />
              <Detail label="Equipo" value={`${initialData.producto?.marca} ${initialData.producto?.referencia}`} />
              <Detail label="Tipo Equipo" value={initialData.producto?.tipo?.nombre} />
              <Detail label="Serial" value={initialData.producto?.serial} />
              <Detail label="Sede" value={initialData.sede?.nombre} />
              <Detail label="Asignado por" value={initialData.creator?.full_name} />
              <Detail label="Quien entrega" value={initialData.quien_entrega} />
              <Detail label="Observación" value={initialData.observacion} />
            </div>
          )}

          {!readOnly && (
            <div className="grid grid-cols-2 gap-6">
              <select
                value={formData.empleado_id}
                onChange={e => setFormData({ ...formData, empleado_id: e.target.value })}
                className="input"
                required
              >
                <option value="">Seleccione empleado</option>
                {empleados.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>

              <select
                value={formData.producto_id}
                onChange={e => setFormData({ ...formData, producto_id: e.target.value })}
                className="input"
                required
              >
                <option value="">Seleccione producto</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.marca} {p.referencia} ({p.serial})
                  </option>
                ))}
              </select>

              <select
                value={formData.sede_id}
                onChange={e => setFormData({ ...formData, sede_id: e.target.value })}
                className="input"
              >
                <option value="">Seleccione sede</option>
                {sedes.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Quien entrega"
                value={formData.quien_entrega}
                onChange={e => setFormData({ ...formData, quien_entrega: e.target.value })}
                className="input"
              />

              <textarea
                placeholder="Observaciones"
                value={formData.observacion}
                onChange={e => setFormData({ ...formData, observacion: e.target.value })}
                className="input col-span-2 resize-none"
                rows={3}
              />
            </div>
          )}

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-slate-100 font-bold"
            >
              Cerrar
            </button>
            {!readOnly && (
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-black flex items-center gap-2"
              >
                <Save size={18} /> Guardar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
