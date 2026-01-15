import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';

export default function UserAdmin() {
  const [userForm, setUserForm] = useState({ username: '', full_name: '', password: '' });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(userForm)
    });
    if (response.ok) {
      alert("Usuario creado con éxito");
      setUserForm({ username: '', full_name: '', password: '' });
    }
  };

  return (
    <div className="max-w-2xl bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><ShieldCheck /></div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Registro de Usuarios</h2>
      </div>
      <form onSubmit={handleCreateUser} className="space-y-4">
        <input 
          type="text" placeholder="Nombre de usuario (ej: jpererz)" 
          className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setUserForm({...userForm, username: e.target.value})}
          value={userForm.username} required
        />
        <input 
          type="text" placeholder="Nombre completo" 
          className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setUserForm({...userForm, full_name: e.target.value})}
          value={userForm.full_name} required
        />
        <input 
          type="password" placeholder="Contraseña inicial" 
          className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setUserForm({...userForm, password: e.target.value})}
          value={userForm.password} required
        />
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">
          CREAR ACCESO
        </button>
      </form>
    </div>
  );
}