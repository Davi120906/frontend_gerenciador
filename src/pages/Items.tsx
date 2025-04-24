// src/pages/Items.tsx
import React, { useEffect, useState } from 'react';
import './Item.css';
import { getAllItems, deleteItem, updateItem, moveItem, registerItem } from '../services/ItemsService';
import { Itens } from '../types/Itens';

const Items: React.FC = () => {
  const [items, setItems] = useState<Itens[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<Itens | null>(null);
  
  // Form state for insert/update operations
  const [formData, setFormData] = useState<Partial<Itens>>({
    nPatrimonio: '',
    nAntigo: '',
    descricao: '',
    conservacao: '',
    valorBem: 0,
    foto: '',
    salaRegistrada: '',
    salaAtual: ''
  });

  // Form state for move operation
  const [moveFormData, setMoveFormData] = useState({
    nPatrimonio: '',
    salaAtual: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getAllItems();
      
      setItems(data);
      setError(null);
    } catch (err) { 
      setError('Failed to fetch items. Please try again later.');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (nPatrimonio: string) => {
    try {
      await deleteItem(nPatrimonio);
      // Refresh items list after delete
      fetchItems();
    } catch (err) {
      setError('Failed to delete item. Please try again.');
      console.error('Error deleting item:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'valorBem' ? parseFloat(value) : value
    });
  };

  const handleMoveInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMoveFormData({
      ...moveFormData,
      [name]: value
    });
  };

  const handleInsertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerItem(formData as Itens);
      fetchItems();
      setSelectedAction(null);
      resetForm();
    } catch (err) {
      setError('Failed to insert item. Please check the data and try again.');
      console.error('Error inserting item:', err);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateItem(formData.nPatrimonio!, formData as Itens);
      fetchItems();
      setSelectedAction(null);
      resetForm();
    } catch (err) {
      setError('Failed to update item. Please check the data and try again.');
      console.error('Error updating item:', err);
    }
  };

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await moveItem(moveFormData.nPatrimonio, { salaAtual: moveFormData.salaAtual });
      fetchItems();
      setSelectedAction(null);
      setMoveFormData({ nPatrimonio: '', salaAtual: '' });
    } catch (err) {
      setError('Failed to move item. Please check the data and try again.');
      console.error('Error moving item:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      nPatrimonio: '',
      nAntigo: '',
      descricao: '',
      conservacao: '',
      valorBem: 0,
      foto: '',
      salaRegistrada: '',
      salaAtual: ''
    });
  };

  const handleActionSelect = (action: string, item?: Itens) => {
    setSelectedAction(action);
    if (item && (action === 'update' || action === 'move')) {
      setCurrentItem(item);
      if (action === 'update') {
        setFormData({
          nPatrimonio: item.nPatrimonio,
          nAntigo: item.nAntigo,
          descricao: item.descricao,
          conservacao: item.conservacao,
          valorBem: item.valorBem,
          foto: item.foto,
          salaRegistrada: item.salaRegistrada,
          salaAtual: item.salaAtual
        });
      } else if (action === 'move') {
        setMoveFormData({
          nPatrimonio: item.nPatrimonio,
          salaAtual: ''
        });
      }
    }
  };

  const renderActionForm = () => {
    switch (selectedAction) {
      case 'insert':
        return (
          <div className="action-form">
            <h3>Insert New Item</h3>
            <form onSubmit={handleInsertSubmit}>
              <div className="form-group">
                <label>Patrimônio Nº:</label>
                <input 
                  type="text" 
                  name="nPatrimonio" 
                  value={formData.nPatrimonio} 
                  onChange={handleInputChange}
                  placeholder="Format: 12345678-9"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Nº Antigo:</label>
                <input 
                  type="text" 
                  name="nAntigo" 
                  value={formData.nAntigo} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label>Descrição:</label>
                <input 
                  type="text" 
                  name="descricao" 
                  value={formData.descricao} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Conservação:</label>
                <input 
                  type="text" 
                  name="conservacao" 
                  value={formData.conservacao} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Valor:</label>
                <input 
                  type="number" 
                  name="valorBem" 
                  value={formData.valorBem} 
                  onChange={handleInputChange} 
                  step="0.01"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Foto URL:</label>
                <input 
                  type="text" 
                  name="foto" 
                  value={formData.foto} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label>Sala Registrada:</label>
                <input 
                  type="text" 
                  name="salaRegistrada" 
                  value={formData.salaRegistrada} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Sala Atual:</label>
                <input 
                  type="text" 
                  name="salaAtual" 
                  value={formData.salaAtual} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-submit">Submit</button>
                <button type="button" className="btn-cancel" onClick={() => setSelectedAction(null)}>Cancel</button>
              </div>
            </form>
          </div>
        );
      
      case 'update':
        return (
          <div className="action-form">
            <h3>Update Item</h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label>Patrimônio Nº:</label>
                <input 
                  type="text" 
                  name="nPatrimonio" 
                  value={formData.nPatrimonio} 
                  readOnly 
                />
              </div>
              <div className="form-group">
                <label>Nº Antigo:</label>
                <input 
                  type="text" 
                  name="nAntigo" 
                  value={formData.nAntigo} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label>Descrição:</label>
                <input 
                  type="text" 
                  name="descricao" 
                  value={formData.descricao} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Conservação:</label>
                <input 
                  type="text" 
                  name="conservacao" 
                  value={formData.conservacao} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Valor:</label>
                <input 
                  type="number" 
                  name="valorBem" 
                  value={formData.valorBem} 
                  onChange={handleInputChange} 
                  step="0.01"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Foto URL:</label>
                <input 
                  type="text" 
                  name="foto" 
                  value={formData.foto} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label>Sala Registrada:</label>
                <input 
                  type="text" 
                  name="salaRegistrada" 
                  value={formData.salaRegistrada} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Sala Atual:</label>
                <input 
                  type="text" 
                  name="salaAtual" 
                  value={formData.salaAtual} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-submit">Update</button>
                <button type="button" className="btn-cancel" onClick={() => setSelectedAction(null)}>Cancel</button>
              </div>
            </form>
          </div>
        );
      
      case 'move':
        return (
          <div className="action-form">
            <h3>Move Item</h3>
            <form onSubmit={handleMoveSubmit}>
              <div className="form-group">
                <label>Patrimônio Nº:</label>
                <input 
                  type="text" 
                  name="nPatrimonio" 
                  value={moveFormData.nPatrimonio} 
                  readOnly 
                />
              </div>
              <div className="form-group">
                <label>Nova Sala Atual:</label>
                <input 
                  type="text" 
                  name="salaAtual" 
                  value={moveFormData.salaAtual} 
                  onChange={handleMoveInputChange} 
                  required 
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-submit">Move</button>
                <button type="button" className="btn-cancel" onClick={() => setSelectedAction(null)}>Cancel</button>
              </div>
            </form>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="items-container">
      <div className="sidebar">
        <h2>Ações</h2>
        <button onClick={() => handleActionSelect('insert')}>Inserir</button>
        <button onClick={() => selectedAction !== 'update' ? setSelectedAction('update') : setSelectedAction(null)}>
          Atualizar
        </button>
        <button onClick={() => selectedAction !== 'move' ? setSelectedAction('move') : setSelectedAction(null)}>
          Mover
        </button>
        <button onClick={() => selectedAction !== 'remove' ? setSelectedAction('remove') : setSelectedAction(null)}>
          Remover
        </button>
      </div>
      
      <div className="content">
        <h1>Gerenciador de Patrimônio</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {selectedAction && renderActionForm()}
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Patrimônio Nº</th>
                  <th>Nº Antigo</th>
                  <th>Descrição</th>
                  <th>Conservação</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th>Sala Registrada</th>
                  <th>Sala Atual</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9}>Nenhum item encontrado</td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.nPatrimonio}>
                      <td>{item.nPatrimonio}</td>
                      <td>{item.nAntigo}</td>
                      <td>{item.descricao}</td>
                      <td>{item.conservacao}</td>
                      <td>R$ {item.valorBem.toFixed(2)}</td>
                      <td>{item.state || 'N/A'}</td>
                      <td>{item.salaRegistrada}</td>
                      <td>{item.salaAtual}</td>
                      <td className="action-buttons">
                        <button onClick={() => handleActionSelect('update', item)}>Edit</button>
                        <button onClick={() => handleActionSelect('move', item)}>Move</button>
                        {selectedAction === 'remove' && (
                          <button className="delete-btn" onClick={() => handleDelete(item.nPatrimonio)}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;