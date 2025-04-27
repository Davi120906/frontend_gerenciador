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
  const [viewingItem, setViewingItem] = useState<Itens | null>(null);
  
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
      console.log(data[0].foto); 
      console.log("aaaa");
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
      setSelectedAction(null);
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

  const handleActionSelect = (action: string) => {
    if (selectedAction === action) {
      // Toggle off if already selected
      setSelectedAction(null);
    } else {
      setSelectedAction(action);
      setViewingItem(null); // Close view if open
    }
  };

  const handleSelectItem = (item: Itens) => {
    if (selectedAction === 'view') {
      setViewingItem(item);
    } else if (selectedAction === 'update') {
      setCurrentItem(item);
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
    } else if (selectedAction === 'move') {
      setCurrentItem(item);
      setMoveFormData({
        nPatrimonio: item.nPatrimonio,
        salaAtual: ''
      });
    } else if (selectedAction === 'remove') {
      if (window.confirm(`Tem certeza que deseja remover o item ${item.nPatrimonio}?`)) {
        handleDelete(item.nPatrimonio);
      }
    }
  };

  const renderViewItemDetails = () => {
    if (!viewingItem) return null;
    
    return (
      <div className="action-form">
        <h3>Detalhes do Item</h3>
        <div className="form-group">
          <label>Patrimônio Nº:</label>
          <input type="text" value={viewingItem.nPatrimonio} readOnly />
        </div>
        <div className="form-group">
          <label>Nº Antigo:</label>
          <input type="text" value={viewingItem.nAntigo} readOnly />
        </div>
        <div className="form-group">
          <label>Descrição:</label>
          <input type="text" value={viewingItem.descricao} readOnly />
        </div>
        <div className="form-group">
          <label>Conservação:</label>
          <input type="text" value={viewingItem.conservacao} readOnly />
        </div>
        <div className="form-group">
          <label>Valor:</label>
          <input type="text" value={`R$ ${viewingItem.valorBem.toFixed(2)}`} readOnly />
        </div>
        {viewingItem.foto && (
          <div className="form-group">
            <label>Foto:</label>
            <div>
              <img src={viewingItem.foto} alt="Item" style={{ maxWidth: '100%', maxHeight: '300px' }} />
            </div>
          </div>
        )}
        <div className="form-group">
          <label>Sala Registrada:</label>
          <input type="text" value={viewingItem.salaRegistrada} readOnly />
        </div>
        <div className="form-group">
          <label>Sala Atual:</label>
          <input type="text" value={viewingItem.salaAtual} readOnly />
        </div>
        <div className="form-group">
          <label>Estado:</label>
          <input type="text" value={viewingItem.state || 'N/A'} readOnly />
        </div>
        <div className="form-buttons">
          <button type="button" className="btn-cancel" onClick={() => setViewingItem(null)}>Fechar</button>
        </div>
      </div>
    );
  };

  const renderActionForm = () => {
    switch (selectedAction) {
      case 'insert':
        return (
          <div className="action-form">
            <h3>Inserir Novo Item</h3>
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
                <button type="submit" className="btn-submit">Cadastrar</button>
                <button type="button" className="btn-cancel" onClick={() => setSelectedAction(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        );
      
      case 'update':
        if (!currentItem) {
          return (
            <div className="action-form">
              <h3>Atualizar Item</h3>
              <p>Selecione um item da tabela para atualizar.</p>
              <div className="form-buttons">
                <button type="button" className="btn-cancel" onClick={() => setSelectedAction(null)}>Cancelar</button>
              </div>
            </div>
          );
        }
        return (
          <div className="action-form">
            <h3>Atualizar Item</h3>
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
              {formData.foto && (
                <div className="form-group">
                  <label>Prévia da Imagem:</label>
                  <div>
                    <img src={formData.foto} alt="Item Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                  </div>
                </div>
              )}
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
                <button type="submit" className="btn-submit">Atualizar</button>
                <button type="button" className="btn-cancel" onClick={() => {
                  setSelectedAction(null);
                  setCurrentItem(null);
                }}>Cancelar</button>
              </div>
            </form>
          </div>
        );
      
      case 'move':
        if (!currentItem) {
          return (
            <div className="action-form">
              <h3>Mover Item</h3>
              <p>Selecione um item da tabela para mover.</p>
              <div className="form-buttons">
                <button type="button" className="btn-cancel" onClick={() => setSelectedAction(null)}>Cancelar</button>
              </div>
            </div>
          );
        }
        return (
          <div className="action-form">
            <h3>Mover Item</h3>
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
                <button type="submit" className="btn-submit">Mover</button>
                <button type="button" className="btn-cancel" onClick={() => {
                  setSelectedAction(null);
                  setCurrentItem(null);
                }}>Cancelar</button>
              </div>
            </form>
          </div>
        );
      
      case 'remove':
        return (
          <div className="action-form">
            <h3>Remover Item</h3>
            <p>Selecione um item da tabela para remover.</p>
            <div className="form-buttons">
              <button type="button" className="btn-cancel" onClick={() => setSelectedAction(null)}>Cancelar</button>
            </div>
          </div>
        );

      case 'view':
        return (
          <div className="action-form">
            <h3>Visualizar Item</h3>
            <p>Selecione um item da tabela para visualizar os detalhes.</p>
            <div className="form-buttons">
              <button type="button" className="btn-cancel" onClick={() => setSelectedAction(null)}>Cancelar</button>
            </div>
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
        <button onClick={() => handleActionSelect('update')}>Atualizar</button>
        <button onClick={() => handleActionSelect('move')}>Mover</button>
        <button onClick={() => handleActionSelect('view')}>Visualizar</button>
        <button onClick={() => handleActionSelect('remove')}>Remover</button>
      </div>
      
      <div className="content">
        <h1>Gerenciador de Patrimônio</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {selectedAction && renderActionForm()}
        {viewingItem && renderViewItemDetails()}
        
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
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8}>Nenhum item encontrado</td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr 
                      key={item.nPatrimonio} 
                      onClick={() => handleSelectItem(item)}
                      style={{ 
                        cursor: selectedAction ? 'pointer' : 'default',
                        backgroundColor: (currentItem?.nPatrimonio === item.nPatrimonio || viewingItem?.nPatrimonio === item.nPatrimonio) ? '#e0f7fa' : ''
                      }}
                    >
                      <td>{item.nPatrimonio}</td>
                      <td>{item.nAntigo}</td>
                      <td>{item.descricao}</td>
                      <td>{item.conservacao}</td>
                      <td>R$ {item.valorBem.toFixed(2)}</td>
                      <td>{item.state || 'N/A'}</td>
                      <td>{item.salaRegistrada}</td>
                      <td>{item.salaAtual}</td>
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