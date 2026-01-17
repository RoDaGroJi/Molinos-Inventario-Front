import React, { useState } from 'react';

const API_BASE_URL = 'https://molinos-inventario-back.onrender.com';
// const API_BASE_URL = 'http://localhost:8000';

export default function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // OAuth2PasswordRequestForm espera application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Error de conexión' }));
        alert(errorData.detail || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error('Error en login:', error);
      alert("Error de conexión. Verifique que el servidor esté funcionando.");
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
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none transition" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none transition" 
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg cursor-pointer"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}