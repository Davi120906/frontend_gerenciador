// App.tsx - Exemplo de como configurar as rotas
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Items from './pages/Items';
import ItemDetails from './pages/ItemDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota principal - redireciona para /items */}
          <Route path="/" element={<Navigate to="/items" replace />} />
          
          {/* Rota para a lista de itens */}
          <Route path="/items" element={<Items />} />
          
          {/* Rota para detalhes de um item específico */}
          <Route path="/item/:nPatrimonio" element={<ItemDetails />} />
          
          {/* Rota para casos não encontrados */}
          <Route path="*" element={<Navigate to="/items" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;