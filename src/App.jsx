import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  // Intentamos obtener el token del localStorage al cargar la app
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Si no hay token, mostramos la pantalla de Login
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Login setToken={setToken} />
      </div>
    );
  }

  // Si hay token, mostramos el Dashboard principal
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Eliminamos el div absoluto del botón flotante */}
      <Dashboard onLogout={handleLogout} />
    </div>
  );
}

export default App;