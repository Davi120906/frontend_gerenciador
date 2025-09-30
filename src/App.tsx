// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Items from './pages/Items';
import ItemDetails from './pages/ItemDetails';
import LoginPage from './pages/Login'; // certifique-se que o componente existe
import Users from './pages/Users';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota principal - redireciona para /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Rota para página de login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rota para a lista de itens */}
          <Route path="/items" element={<Items />} />
          
          <Route path="/users" element={<Users />} />
          {/* Rota para detalhes de um item específico */}
          <Route path="/item/:nPatrimonio" element={<ItemDetails />} />
          
          {/* Rota para casos não encontrados */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
