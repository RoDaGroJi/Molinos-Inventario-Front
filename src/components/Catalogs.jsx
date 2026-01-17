import React, { useState } from 'react';
import { Plus, Building2, MapPin, Briefcase } from 'lucide-react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';
// const API_BASE_URL = 'http://localhost:8000';

export default function Catalogs() {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('areas'); // áreas, empresas, cargos, equipo_tipos

  const handleSave = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE_URL}/${tipo}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ nombre })
    });
    if (response.ok) {
      alert(`${tipo} guardado correctamente`);
      setNombre('');
    }
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 italic">Gestión de Catálogos</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">¿Qué desea registrar?</label>
          <select 
            value={tipo} 
            onChange={(e) => setTipo(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          >
            <option value="areas">Nueva Área</option>
            <option value="empresas">Nueva Empresa</option>
            <option value="cargos">Nuevo Cargo</option>
            <option value="equipo_tipos">Nuevo Tipo de Equipo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del elemento</label>
          <input 
            type="text" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Recursos Humanos, Laptop, Molinos S.A."
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg transition-all flex items-center justify-center gap-2">
          <Plus size={20} /> AGREGAR AL SISTEMA
        </button>
      </form>
    </div>
  );
}