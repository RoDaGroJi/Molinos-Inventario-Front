import React, { useState } from 'react';

export default function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center font-sans">
      <div className="bg-white p-10 rounded-xl shadow-xl border border-gray-200 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark">SGI</h1>
          <p className="text-gray-500">Sistema de Gestión de Inventarios</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input type="text" onChange={(e) => setUsername(e.target.value)} className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none transition" />
          </div>
          <button type="submit" className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}