// src/pages/Items.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Item.css';
import { getAllItems, deleteItem, updateItem, moveItem, registerItem, searchItems } from '../services/ItemsService';
import { Itens } from '../types/Itens';
import jsPDF from 'jspdf';

const Items: React.FC = () => {
  // ...existing code...
  const navigate = useNavigate();
  const [items, setItems] = useState<Itens[]>([]);
  const [buscaFeita, setBuscaFeita] = useState(false);
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
    salaAtual: '',
    state: '',
    responsavel: '' // <-- Adicione esta linha
  });

  // Novo: estados selecionados para o campo state no inserir
  const [insertStates, setInsertStates] = useState<string[]>([]);

  // Form state for move operation
  const [moveFormData, setMoveFormData] = useState({
    nPatrimonio: '',
    salaAtual: ''
  }); 

  // Novo sistema de busca: formulário igual ao de inserção
  const [searchFormData, setSearchFormData] = useState({
    nPatrimonio: '',
    nAntigo: '',
    descricao: '',
    conservacao: '',
    valorBem: '',
    foto: '',
    salaRegistrada: '',
    salaAtual: '',
    responsavel: '',
    state: '' // string separada por vírgula
  });
  const role = localStorage.getItem('userRole');
  const isAdmin = role === 'admin';

  // Estados para o campo state no update
  const stateOptions = ['ocioso', 'quebrado', 'nao encontrado', 'sem plaqueta'];
  const [updateStates, setUpdateStates] = useState<string[]>([]);

  // Atualiza updateStates quando currentItem muda
  useEffect(() => {
    if (selectedAction === 'update' && currentItem) {
      const itemStates = currentItem.state ? currentItem.state.split(',').map(s => s.trim()) : [];
      // Mantém ordem fixa
      setUpdateStates(stateOptions.filter(opt => itemStates.includes(opt)));
    }
  }, [selectedAction, currentItem]);

  // Handle para as caixinhas de estado no update
  const handleUpdateStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    let newStates = [...updateStates];
    if (checked) {
      if (!newStates.includes(value)) newStates.push(value);
    } else {
      newStates = newStates.filter(s => s !== value);
    }
    // Mantém ordem fixa
    setUpdateStates(stateOptions.filter(opt => newStates.includes(opt)));
    // Atualiza formData.state
    setFormData({
      ...formData,
      state: stateOptions.filter(opt => newStates.includes(opt)).join(',')
    });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getAllItems();
      
      // Normalize the data structure if needed
      const normalizedData = data.map((item: any) => ({
        nPatrimonio: item.npatrimonio || item.nPatrimonio || '',
        nAntigo: item.nantigo || item.nAntigo || '',
        descricao: item.descricao || '',
        conservacao: item.conservacao || '',
        valorBem: item.valorBem || item.valorBem || 0,
        foto: item.foto || '',
        salaRegistrada: item.salaRegistrada || item.salaregistrada || '',
        salaAtual: item.salaAtual || item.salaatual || '',
        state: item.state || '',
        responsavel: item.responsavel || ''
      }));
      
      setItems(normalizedData);
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

  // Novo: handle para todos os campos do formulário de busca
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFormData({
      ...searchFormData,
      [name]: name === 'valorBem' ? value.replace(/[^\d.]/g, '') : value
    });
  };

  // Novo: handle para os quadradinhos de estado (busca)
  const handleSearchStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    let newState = searchFormData.state ? searchFormData.state.split(',').map(s => s.trim()) : [];
    if (checked) {
      if (!newState.includes(value)) newState.push(value);
    } else {
      newState = newState.filter(s => s !== value);
    }
    setSearchFormData({
      ...searchFormData,
      state: newState.join(',')
    });
  };

  // Novo: handle para o campo state do inserir
  const handleInsertStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setInsertStates(prev => [...prev, value]);
    } else {
      setInsertStates(prev => prev.filter(state => state !== value));
    }
  };

  const handleInsertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Novo: monta o campo state como string separada por vírgula
      const stateString = insertStates.length > 0 ? insertStates.join(',') : '';
      await registerItem({ ...formData, state: stateString } as Itens);
      fetchItems();
      setSelectedAction(null);
      resetForm();
      setInsertStates([]); // limpa seleção dos estados
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

  // Novo: busca por múltiplos critérios (AND)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const allItems = await getAllItems();
      // Filtra por todos os campos preenchidos
      const normalizedAll = allItems.map((item: any) => ({
        nPatrimonio: item.npatrimonio || item.nPatrimonio || '',
        nAntigo: item.nantigo || item.nAntigo || '',
        descricao: item.descricao || '',
        conservacao: item.conservacao || '',
        valorBem: item.valorBem || item.valorBem || 0,
        foto: item.foto || '',
        salaRegistrada: item.salaRegistrada || item.salaregistrada || '',
        salaAtual: item.salaAtual || item.salaatual || '',
        responsavel: item.responsavel || '',
        state: item.state || ''
      }));
      const filtered = normalizedAll.filter((normalized) => {
        for (const key in searchFormData) {
          const value = searchFormData[key as keyof typeof searchFormData];
          if (value && value !== '') {
            if (key === 'valorBem') {
              if (value && normalized.valorBem !== parseFloat(value)) return false;
            } else if (key === 'state') {
              const searchStates = value.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
              const itemStates = normalized.state.split(',').map((s: string) => s.trim().toLowerCase());
              if (searchStates.length > 0 && !searchStates.every((s: string) => itemStates.includes(s))) return false;
            } else {
              const fieldValue = normalized[key as keyof typeof normalized];
              if (typeof fieldValue === 'string') {
                if (!fieldValue.toLowerCase().includes((value as string).toLowerCase())) return false;
              }
            }
          }
        }
        return true;
      });
      setItems(filtered);
      setError(null);
      setBuscaFeita(true);
    } catch (err) {
      setError('Failed to search items. Please try again.');
      console.error('Error searching items:', err);
    } finally {
      setLoading(false);
    }
  };
  const gerarPDF = () => {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const startY = 30;
  const rowHeight = 8;

  doc.setFontSize(14);
  doc.text('Relação de Bens para Inventário do Exercício de 2024', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, margin, 20);

  // Cabeçalhos da tabela
  const headers = [
    "Nº Patrimônio",
    "Nº Antigo",
    "Descrição",
    "Conservação",
    "Valor (R$)",
    "Sala Atual",
    "Sala Registrada"  // <- nova coluna
  ];

  // Larguras relativas de cada coluna
  const colWidths = [35, 30, 90, 30, 25, 40, 40];

  let y = startY;

  // Cabeçalho
  doc.setFont('helvetica', 'bold');
  let x = margin;
  headers.forEach((header, i) => {
    doc.text(header, x, y);
    x += colWidths[i];
  });

  // Conteúdo
  doc.setFont('helvetica', 'normal');
  y += rowHeight;

  items.forEach((item) => {
    if (y > 190) {
      doc.addPage();
      y = startY;

      // Reinsere cabeçalho
  doc.setFont('helvetica', 'bold');
      x = margin;
      headers.forEach((header, i) => {
        doc.text(header, x, y);
        x += colWidths[i];
      });
  doc.setFont('helvetica', 'normal');
      y += rowHeight;
    }

    x = margin;
    const row = [
      item.nPatrimonio,
      item.nAntigo || "-",
      item.descricao.slice(0,50),
      item.conservacao,
      item.valorBem.toFixed(2),
      item.salaAtual,
      item.salaRegistrada || "-"
    ];

    row.forEach((cell, i) => {
      doc.text(String(cell), x, y);
      x += colWidths[i];
    });

    y += rowHeight;
  });

  doc.save('relatorio_inventario.pdf');
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
      salaAtual: '',
      responsavel: '' // <-- Adicione esta linha
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
    } else {
      // Se nenhuma ação estiver selecionada, navegar para a página de detalhes
      navigate(`/item/${item.nPatrimonio}`);
    }
  };

  // Function to open image in new tab
  const openImageInNewTab = (e: React.MouseEvent<HTMLImageElement>, imageUrl: string) => {
    e.stopPropagation(); // Prevent the row click event from triggering
    window.open(imageUrl, '_blank');
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
            <div className="image-container">
              <img 
                src={viewingItem.foto} 
                alt="Item" 
                className="clickable-image"
                onClick={(e) => openImageInNewTab(e, viewingItem.foto)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://via.placeholder.com/300?text=Imagem+não+disponível';
                }}
              />
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
              <div className="form-group">
                <label>Estado:</label>
                <div className="checkbox-group horizontal-checkboxes">
                  <label>
                    <input 
                      type="checkbox" 
                      value="ocioso" 
                      checked={insertStates.includes('ocioso')}
                      onChange={handleInsertStateChange}
                    />
                    Ocioso
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      value="quebrado" 
                      checked={insertStates.includes('quebrado')}
                      onChange={handleInsertStateChange}
                    />
                    Quebrado
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      value="nao encontrado" 
                      checked={insertStates.includes('nao encontrado')}
                      onChange={handleInsertStateChange}
                    />
                    Não encontrado
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      value="sem plaqueta" 
                      checked={insertStates.includes('sem plaqueta')}
                      onChange={handleInsertStateChange}
                    />
                    Sem plaqueta
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Responsável:</label>
                <input 
                  type="text" 
                  name="responsavel" 
                  value={formData.responsavel} 
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
                  <div className="image-container">
                    <img 
                      src={formData.foto} 
                      alt="Item Preview" 
                      className="clickable-image"
                      onClick={(e) => openImageInNewTab(e, formData.foto!)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://via.placeholder.com/300?text=Imagem+não+disponível';
                      }}
                    />
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
              <div className="form-group">
                <label>Estado:</label>
                <div className="checkbox-group horizontal-checkboxes">
                  {stateOptions.map(opt => (
                    <label key={opt}>
                      <input
                        type="checkbox"
                        value={opt}
                        checked={updateStates.includes(opt)}
                        onChange={handleUpdateStateChange}
                      />
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </label>
                  ))}
                </div>
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

      case 'search':
        return (
          <div className="action-form">
            <h3>Buscar Itens</h3>
            <form onSubmit={handleSearchSubmit}>
              <div className="form-group">
                <label>Patrimônio Nº:</label>
                <input 
                  type="text" 
                  name="nPatrimonio" 
                  value={searchFormData.nPatrimonio}
                  onChange={handleSearchInputChange}
                  placeholder="Ex: 12345678-9"
                />
              </div>
              <div className="form-group">
                <label>Nº Antigo:</label>
                <input 
                  type="text" 
                  name="nAntigo" 
                  value={searchFormData.nAntigo}
                  onChange={handleSearchInputChange}
                />
              </div>
              <div className="form-group">
                <label>Descrição:</label>
                <input 
                  type="text" 
                  name="descricao" 
                  value={searchFormData.descricao}
                  onChange={handleSearchInputChange}
                />
              </div>
              <div className="form-group">
                <label>Conservação:</label>
                <input 
                  type="text" 
                  name="conservacao" 
                  value={searchFormData.conservacao}
                  onChange={handleSearchInputChange}
                />
              </div>
              <div className="form-group">
                <label>Valor:</label>
                <input 
                  type="number" 
                  name="valorBem" 
                  value={searchFormData.valorBem}
                  onChange={handleSearchInputChange}
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Foto URL:</label>
                <input 
                  type="text" 
                  name="foto" 
                  value={searchFormData.foto}
                  onChange={handleSearchInputChange}
                />
              </div>
              <div className="form-group">
                <label>Sala Registrada:</label>
                <input 
                  type="text" 
                  name="salaRegistrada" 
                  value={searchFormData.salaRegistrada}
                  onChange={handleSearchInputChange}
                />
              </div>
              <div className="form-group">
                <label>Sala Atual:</label>
                <input 
                  type="text" 
                  name="salaAtual" 
                  value={searchFormData.salaAtual}
                  onChange={handleSearchInputChange}
                />
              </div>
              <div className="form-group">
                <label>Responsável:</label>
                <input 
                  type="text" 
                  name="responsavel" 
                  value={searchFormData.responsavel}
                  onChange={handleSearchInputChange}
                />
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <div className="checkbox-group horizontal-checkboxes">
                  <label>
                    <input 
                      type="checkbox" 
                      value="ocioso" 
                      checked={searchFormData.state.split(',').map(s => s.trim()).includes('ocioso')}
                      onChange={handleSearchStateChange}
                    />
                    Ocioso
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      value="quebrado" 
                      checked={searchFormData.state.split(',').map(s => s.trim()).includes('quebrado')}
                      onChange={handleSearchStateChange}
                    />
                    Quebrado
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      value="nao encontrado" 
                      checked={searchFormData.state.split(',').map(s => s.trim()).includes('nao encontrado')}
                      onChange={handleSearchStateChange}
                    />
                    Não encontrado
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      value="sem plaqueta" 
                      checked={searchFormData.state.split(',').map(s => s.trim()).includes('sem plaqueta')}
                      onChange={handleSearchStateChange}
                    />
                    Sem plaqueta
                  </label>
                </div>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-submit">Buscar</button>
                <button type="button" className="btn-cancel" onClick={() => {
                  setSelectedAction(null);
                  fetchItems();
                }}>Cancelar</button>
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
        {isAdmin && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 1000 
        }}>
          <button 
            onClick={() =>  navigate("/users")}
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              fontSize: '14px'
            }}
          >
            Usuários
          </button>
        </div>
      )}

      <div className="sidebar">
        <h2>Ações</h2>
        <button onClick={() => handleActionSelect('insert')}>Inserir</button>
        <button onClick={() => handleActionSelect('update')}>Atualizar</button>
        <button onClick={() => handleActionSelect('move')}>Mover</button>
        <button onClick={() => handleActionSelect('search')}>Buscar</button>
        <button onClick={() => handleActionSelect('remove')}>Remover</button>
        
        <div className="info-section">
          <hr />
          <p><strong>Dica:</strong></p>
          <p>• Clique em uma ação no sidebar para ativá-la</p>
          <p>• Clique em um item da tabela sem ação selecionada para ver detalhes completos</p>
          <p>• Clique nas imagens para ampliar</p>
        </div>
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
                  <th>Imagem</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9}>Nenhum item encontrado</td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr 
                      key={item.nPatrimonio} 
                      onClick={() => handleSelectItem(item)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: (currentItem?.nPatrimonio === item.nPatrimonio || viewingItem?.nPatrimonio === item.nPatrimonio) ? '#e0f7fa' : ''
                      }}
                      title={selectedAction ? `Clique para ${selectedAction === 'update' ? 'atualizar' : selectedAction === 'move' ? 'mover' : selectedAction === 'remove' ? 'remover' : 'selecionar'} este item` : 'Clique para ver detalhes completos'}
                    >
                      <td>{item.nPatrimonio}</td>
                      <td>{item.nAntigo}</td>
                      <td>{item.descricao}</td>
                      <td>{item.conservacao}</td>
                      <td>R$ {item.valorBem.toFixed(2)}</td>
                      <td>{item.state || 'N/A'}</td>
                      <td>{item.salaRegistrada}</td>
                      <td>{item.salaAtual}</td>
                      <td>
                        {item.foto ? (
                          <img 
                            src={item.foto}
                            alt="Item thumbnail"
                            className="clickable-image"
                            onClick={(e) => openImageInNewTab(e, item.foto)}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://via.placeholder.com/80?text=N/A';
                            }}
                          />
                        ) : 'Sem imagem'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {selectedAction === 'search' && buscaFeita && items.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <button onClick={gerarPDF} className="btn-submit">
              Gerar PDF do Resultado
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Items;