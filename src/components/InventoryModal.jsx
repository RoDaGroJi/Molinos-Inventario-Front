import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, Box, MapPin, Building2, ClipboardList } from 'lucide-react';

export default function InventoryModal({ isOpen, onClose, onSave, initialData, readOnly }) {
  const [formData, setFormData] = useState({
    empleado_nombre: '',
    cargo_id: '',
    area_id: '',
    empresa_id: '',
    equipo_id: '',
    ciudad_id: '',
    quien_entrega: '',
    cantidad: 1,
    marca: '',
    caracteristicas: '',
    observacion: ''
  });

  const [catalogs, setCatalogs] = useState({
    areas: [],
    empresas: [],
    equipos: [],
    cargos: [],
    ciudades: []
  });

  const [loading, setLoading] = useState(false);

  // 1. Cargar Catálogos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const fetchCatalogs = async () => {
        setLoading(true);
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        try {
          const resAreas = await fetch('http://localhost:8000/areas/', { headers });
          const resEmpresas = await fetch('http://localhost:8000/empresas/', { headers });
          const resEquipos = await fetch('http://localhost:8000/equipo_tipos/', { headers });
          const resCargos = await fetch('http://localhost:8000/cargos/', { headers });
          const resCiudades = await fetch('http://localhost:8000/ciudades/', { headers });

          setCatalogs({
            areas: resAreas.ok ? await resAreas.json() : [],
            empresas: resEmpresas.ok ? await resEmpresas.json() : [],
            equipos: resEquipos.ok ? await resEquipos.json() : [],
            cargos: resCargos.ok ? await resCargos.json() : [],
            ciudades: resCiudades.ok ? await resCiudades.json() : []
          });
        } catch (error) {
          console.error("Error cargando catálogos:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCatalogs();
    }
  }, [isOpen]);

  // 2. CARGAR INFORMACIÓN CUANDO ES EDICIÓN O DETALLE
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        ...initialData,
        // Mapeamos los IDs porque el backend suele devolver objetos completos en los detalles
        cargo_id: initialData.cargo?.id || initialData.cargo_id || '',
        area_id: initialData.area?.id || initialData.area_id || '',
        empresa_id: initialData.empresa?.id || initialData.empresa_id || '',
        equipo_id: initialData.equipo?.id || initialData.equipo_id || '',
        ciudad_id: initialData.ciudad?.id || initialData.ciudad_id || '',
        cantidad: initialData.cantidad || 1,
        marca: initialData.marca || '',
        caracteristicas: initialData.caracteristicas || '',
        observacion: initialData.observacion || '',
        quien_entrega: initialData.quien_entrega || '',
        empleado_nombre: initialData.empleado_nombre || ''
      });
    } else if (isOpen && !initialData) {
      // Si no hay datos iniciales, limpiar el formulario (Modo Nuevo)
      setFormData({
        empleado_nombre: '', cargo_id: '', area_id: '', empresa_id: '',
        equipo_id: '', ciudad_id: '', quien_entrega: '', cantidad: 1,
        marca: '', caracteristicas: '', observacion: ''
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!readOnly) onSave(formData);
  };

  // Clase dinámica para los inputs dependiendo de si es Solo Lectura
  const inputClass = `w-full bg-slate-50 border border-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all ${
    readOnly ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'text-slate-700'
  }`;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {readOnly ? 'Detalle del Activo' : initialData ? 'Editar Activo' : 'Nuevo Activo'}
            </h2>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">
              Molinos del Atlántico
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* CUERPO */}
        <form id="inventory-form" className="flex-1 overflow-y-auto p-8 space-y-8" onSubmit={handleSubmit}>
          
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
              <UserPlus size={16} className="text-blue-500" /> Información del Responsable
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Nombre Empleado</label>
                <input required type="text" disabled={readOnly} className={inputClass} value={formData.empleado_nombre}
                  placeholder="Ej: Juan Pérez" onChange={e => setFormData({...formData, empleado_nombre: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Cargo</label>
                <select required disabled={readOnly} className={inputClass} value={formData.cargo_id}
                  onChange={e => setFormData({...formData, cargo_id: e.target.value})}>
                  <option value="">Seleccione Cargo...</option>
                  {catalogs.cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
              <MapPin size={16} className="text-blue-500" /> Ubicación Logística
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Área</label>
                <select required disabled={readOnly} className={inputClass} value={formData.area_id}
                  onChange={e => setFormData({...formData, area_id: e.target.value})}>
                  <option value="">Seleccione...</option>
                  {catalogs.areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Empresa</label>
                <select required disabled={readOnly} className={inputClass} value={formData.empresa_id}
                  onChange={e => setFormData({...formData, empresa_id: e.target.value})}>
                  <option value="">Seleccione...</option>
                  {catalogs.empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Ciudad</label>
                <select required disabled={readOnly} className={inputClass} value={formData.ciudad_id}
                  onChange={e => setFormData({...formData, ciudad_id: e.target.value})}>
                  <option value="">Seleccione...</option>
                  {catalogs.ciudades.map(city => <option key={city.id} value={city.id}>{city.nombre}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
              <Box size={16} className="text-blue-500" /> Especificaciones del Equipo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Tipo</label>
                <select required disabled={readOnly} className={inputClass} value={formData.equipo_id}
                  onChange={e => setFormData({...formData, equipo_id: e.target.value})}>
                  <option value="">Seleccione...</option>
                  {catalogs.equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Marca</label>
                <input required type="text" disabled={readOnly} className={inputClass} value={formData.marca}
                  placeholder="HP, Dell..." onChange={e => setFormData({...formData, marca: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Cant.</label>
                <input required type="number" disabled={readOnly} className={inputClass} value={formData.cantidad}
                  onChange={e => setFormData({...formData, cantidad: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Quién Entrega</label>
                <input required type="text" disabled={readOnly} className={inputClass} value={formData.quien_entrega}
                  onChange={e => setFormData({...formData, quien_entrega: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Características</label>
                <textarea disabled={readOnly} className={inputClass} value={formData.caracteristicas}
                  onChange={e => setFormData({...formData, caracteristicas: e.target.value})}></textarea>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Observación</label>
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
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-slate-400 font-bold hover:bg-slate-50 transition-all text-[11px] uppercase">
            {readOnly ? 'Cerrar' : 'Cancelar'}
          </button>
          {!readOnly && (
            <button type="submit" form="inventory-form" className="flex items-center gap-2 px-10 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl transition-all text-[11px] uppercase">
              <Save size={18} /> {initialData ? 'Actualizar Activo' : 'Guardar Activo'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}