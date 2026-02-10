import React, { useState, useEffect } from 'react';
import { X, Save, Search, UserPlus, Box, Trash2, Plus } from 'lucide-react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';
//const API_BASE_URL = 'http://localhost:8000';

export default function InventoryModal({ isOpen, onClose, onSave, initialData, readOnly }) {
  const [formData, setFormData] = useState({
    empleado_id: '',
    producto_id: '',
    sede_id: '',
    quien_entrega: '',
    observacion: ''
  });

  const [ciudades, setCiudades] = useState([]);

  const [empleadoSearch, setEmpleadoSearch] = useState('');
  const [empleados, setEmpleados] = useState([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [productoSearch, setProductoSearch] = useState('');
  const [productos, setProductos] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState([]);

  // Cargar ciudades para sede
  useEffect(() => {
    if (isOpen) {
      const fetchCiudades = async () => {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        try {
          const res = await fetch(`${API_BASE_URL}/ciudades/`, { headers });
          if (res.ok) {
            const data = await res.json();
            setCiudades(data);
          }
        } catch (error) {
          console.error("Error cargando ciudades:", error);
        }
      };
      fetchCiudades();
    }
  }, [isOpen]);

  // Buscar empleados cuando cambia el término de búsqueda
  useEffect(() => {
    // Solo buscar si hay texto Y no coincide con el empleado seleccionado
    const shouldSearch = empleadoSearch &&
      empleadoSearch.length >= 2 &&
      !readOnly &&
      (!selectedEmpleado || empleadoSearch !== selectedEmpleado.nombre);

    if (isOpen && shouldSearch) {
      const searchEmpleados = async () => {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        try {
          const res = await fetch(`${API_BASE_URL}/empleados/?search=${encodeURIComponent(empleadoSearch)}`, { headers });
          if (res.ok) {
            const data = await res.json();
            setEmpleados(data);
          }
        } catch (error) {
          console.error("Error buscando empleados:", error);
        }
      };
      const timeoutId = setTimeout(searchEmpleados, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setEmpleados([]);
    }
  }, [empleadoSearch, isOpen, readOnly, selectedEmpleado]);

  // Buscar productos cuando cambia el término de búsqueda
  useEffect(() => {
    if (isOpen && productoSearch.length >= 2 && !readOnly) {
      const searchProductos = async () => {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        try {
          const res = await fetch(`${API_BASE_URL}/productos/?search=${encodeURIComponent(productoSearch)}`, { headers });
          if (res.ok) {
            const data = await res.json();
            setProductos(data);
          }
        } catch (error) {
          console.error("Error buscando productos:", error);
        }
      };
      const timeoutId = setTimeout(searchProductos, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setProductos([]);
    }
  }, [productoSearch, isOpen, readOnly]);


  // Cargar datos cuando es edición o detalle
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        empleado_id: initialData.empleado_id || initialData.empleado?.id || '',
        producto_id: initialData.producto_id || initialData.producto?.id || '',
        sede_id: initialData.sede_id || initialData.sede?.id || initialData.empleado?.ciudad_id || '',
        quien_entrega: initialData.quien_entrega || '',
        observacion: initialData.observacion || ''
      });

      if (initialData.empleado) {
        setSelectedEmpleado(initialData.empleado);
        setEmpleadoSearch(initialData.empleado.nombre || '');
      }

      if (initialData.producto) {
        setSelectedProductos([initialData.producto]);
        setProductoSearch(
          `${initialData.producto.marca} ${initialData.producto.referencia || ''} ${initialData.producto.serial ? `[S/N: ${initialData.producto.serial}]` : ''}`.trim()
        );
      }
    } else if (isOpen && !initialData) {
      // Limpiar formulario (Modo Nuevo)
      setFormData({
        empleado_id: '',
        producto_id: '',
        sede_id: '',
        quien_entrega: '',
        observacion: ''
      });
      setSelectedEmpleado(null);
      setEmpleadoSearch('');
      setSelectedProductos([]);
      setProductoSearch('');
      setProductos([]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleEmpleadoSelect = (empleado) => {
    setSelectedEmpleado(empleado);
    setEmpleadoSearch(empleado.nombre);
    setEmpleados([]);
    // Limpiar selección de productos cuando cambia el empleado (solo si no estamos editando)
    if (!initialData) {
      setSelectedProductos([]);
      setProductoSearch('');
    }
    setFormData(prev => ({
      ...prev,
      empleado_id: empleado.id,
      producto_id: prev.producto_id || '', // Mantener producto_id si estamos editando
      sede_id: empleado.ciudad_id || prev.sede_id
    }));
  };

  const handleProductoSelect = (producto) => {
    // Agregar producto a la lista si no está ya seleccionado
    if (!selectedProductos.find(p => p.id === producto.id)) {
      setSelectedProductos([...selectedProductos, producto]);
    }
    setProductoSearch('');
    setProductos([]);
  };

  const handleRemoveProducto = (productoId) => {
    setSelectedProductos(selectedProductos.filter(p => p.id !== productoId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (readOnly) return;
    if (!formData.empleado_id || selectedProductos.length === 0) return;

    const headers = {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    };

    try {
      /* ================= MULTIPLE PRODUCTOS ================= */
      if (selectedProductos.length > 1 || !initialData) {
        for (const prod of selectedProductos) {
          const body = {
            empleado_id: parseInt(formData.empleado_id),
            producto_id: parseInt(prod.id),
            sede_id: formData.sede_id ? parseInt(formData.sede_id) : null,
            quien_entrega: formData.quien_entrega || null,
            observacion: formData.observacion || null,
          };

          const res = await fetch(`${API_BASE_URL}/inventory/`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            onSave(false, err.detail || "Error guardando inventario");
            return;
          }
        }

        onSave(true);
        return;
      }

      /* ================= EDICIÓN SIMPLE ================= */
      const body = {
        empleado_id: parseInt(formData.empleado_id),
        producto_id: parseInt(selectedProductos[0].id),
        sede_id: formData.sede_id ? parseInt(formData.sede_id) : null,
        quien_entrega: formData.quien_entrega || null,
        observacion: formData.observacion || null,
      };

      const res = await fetch(`${API_BASE_URL}/inventory/${initialData.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        onSave(false, err.detail || "Error actualizando inventario");
        return;
      }

      onSave(true);

    } catch (error) {
      onSave(false, "Error de conexión con el servidor");
    }
  };

  const inputClass = `w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${readOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
    }`;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">

        {/* HEADER */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
              {readOnly ? 'Detalle del Activo' : initialData ? 'Editar Activo' : 'Nuevo Activo'}
            </h2>
            <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">
              Molinos del Atlántico
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-400 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* CUERPO */}
        <form id="inventory-form" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>

          <div className="space-y-2 sm:space-y-3">
            <h3 className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1.5">
              <UserPlus size={12} className="text-blue-500" /> Buscar Empleado
            </h3>
            <div className="relative">
              <label className="block text-[9px] font-bold text-slate-500 mb-1 ml-1 uppercase">Empleado</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  disabled={readOnly}
                  className={`${inputClass} pl-9 ${readOnly ? '' : 'cursor-pointer'}`}
                  value={empleadoSearch}
                  placeholder={selectedEmpleado ? selectedEmpleado.nombre : "Buscar empleado por nombre..."}
                  onChange={e => {
                    const newValue = e.target.value;
                    setEmpleadoSearch(newValue);
                    // Solo limpiar selección si el usuario borra completamente el texto Y no estamos en modo edición
                    if (!newValue && !initialData) {
                      setSelectedEmpleado(null);
                      setFormData(prev => ({ ...prev, empleado_id: '', producto_id: '' }));
                      setSelectedProductos([]);
                    } else if (!newValue && initialData) {
                      // Si estamos editando y se borra el texto, restaurar el empleado original
                      if (initialData.empleado) {
                        setEmpleadoSearch(initialData.empleado.nombre || '');
                        setSelectedEmpleado(initialData.empleado);
                      }
                    }
                  }}
                />
              </div>

              {/* Dropdown de resultados de búsqueda */}
              {!readOnly && empleados.length > 0 && empleadoSearch && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {empleados.map(emp => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => handleEmpleadoSelect(emp)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-slate-800">{emp.nombre}</div>
                      <div className="text-xs text-slate-500">
                        {emp.cargo?.nombre} - {emp.area?.nombre} - {emp.empresa?.nombre}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Información del empleado seleccionado */}
              {selectedEmpleado && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs">
                  <div className="font-bold text-blue-900">{selectedEmpleado.nombre}</div>
                  <div className="text-blue-700 mt-1">
                    <span>{selectedEmpleado.cargo?.nombre || 'Sin cargo'}</span>
                    {' · '}
                    <span>{selectedEmpleado.area?.nombre || 'Sin área'}</span>
                    {' · '}
                    <span>{selectedEmpleado.empresa?.nombre || 'Sin empresa'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h3 className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1.5">
              <Box size={12} className="text-blue-500" /> Buscar Producto
            </h3>
            <div className="relative">
              <label className="block text-[9px] font-bold text-slate-500 mb-1 ml-1 uppercase">Producto</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  disabled={readOnly}
                  className={`${inputClass} pl-9 ${readOnly ? '' : 'cursor-pointer'}`}
                  value={productoSearch}
                  placeholder="Buscar producto por marca, referencia o serial..."
                  onChange={e => {
                    setProductoSearch(e.target.value);
                    if (!e.target.value) {
                      setProductos([]);
                    }
                  }}
                />
              </div>

              {/* Dropdown de resultados de búsqueda */}
              {!readOnly && productos.length > 0 && productoSearch && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {productos.map(prod => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleProductoSelect(prod)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-slate-800">
                        {prod.marca} {prod.referencia ? `- ${prod.referencia}` : ''}
                      </div>
                      <div className="text-xs text-slate-500">
                        {prod.serial && `S/N: ${prod.serial}`}
                        {prod.serial && prod.tipo?.nombre && ' · '}
                        {prod.tipo?.nombre && `Tipo: ${prod.tipo.nombre}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}


              {/* Lista de productos seleccionados */}
              {selectedProductos.length > 0 && (
                <div className="mt-3 space-y-2">
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 ml-1 uppercase">
                    Productos Seleccionados ({selectedProductos.length})
                  </label>
                  {selectedProductos.map(prod => (
                    <div key={prod.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold text-blue-900">{prod.marca} {prod.referencia}</div>
                        <div className="text-blue-700 mt-1 space-y-0.5">
                          {prod.serial && <div>Serial: {prod.serial}</div>}
                          {prod.memoria_ram && <div>RAM: {prod.memoria_ram}</div>}
                          {prod.disco_duro && <div>Disco: {prod.disco_duro}</div>}
                          {prod.tipo?.nombre && <div>Tipo: {prod.tipo.nombre}</div>}
                        </div>
                      </div>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProducto(prod.id)}
                          className="ml-2 p-1.5 hover:bg-red-100 text-red-500 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h3 className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1.5">
              Información Adicional
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1 ml-1 uppercase">Sede</label>
                <select
                  className={inputClass}
                  value={formData.sede_id}
                  onChange={e => setFormData({ ...formData, sede_id: e.target.value })}
                  disabled={readOnly}
                >
                  <option value="">Seleccione sede...</option>
                  {ciudades.map(city => <option key={city.id} value={city.id}>{city.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1 ml-1 uppercase">Quién Entrega</label>
                <input
                  type="text"
                  disabled={readOnly}
                  className={inputClass}
                  value={formData.quien_entrega}
                  placeholder="Nombre de quien entrega..."
                  onChange={e => setFormData({ ...formData, quien_entrega: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 mb-1 ml-1 uppercase">Observación</label>
              <textarea
                disabled={readOnly}
                className={inputClass}
                value={formData.observacion}
                placeholder="Notas, serial, estado, accesorios, etc."
                onChange={e => setFormData({ ...formData, observacion: e.target.value })}
              ></textarea>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-white flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 font-bold hover:bg-slate-50 transition-all text-[10px] uppercase cursor-pointer">
            {readOnly ? 'Cerrar' : 'Cancelar'}
          </button>
          {!readOnly && (
            <button
              type="submit"
              form="inventory-form"
              disabled={!formData.empleado_id || selectedProductos.length === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-black shadow-lg transition-all text-[10px] uppercase ${!formData.empleado_id || selectedProductos.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                }`}
            >
              <Save size={14} /> {initialData ? 'Actualizar' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
