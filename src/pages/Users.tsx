// src/pages/Users.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Users.css';
import { getAllUsers, deleteUser, registerUser, updateUser } from '../services/UserService';
import { User, UserRoles } from '../types/Users';

const Users: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Form state - ATUALIZADO para incluir os novos campos
  const [formData, setFormData] = useState<Partial<User>>({
    id: 0,
    nome: '',
    email: '',
    telefone: '',
    funcao: '',
    role: UserRoles.USER,
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) { 
      setError('Erro ao carregar usuários. Verifique se você tem permissão de administrador.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
      try {
        await deleteUser(id);
        setSuccess('Usuário excluído com sucesso!');
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Erro ao excluir usuário. Verifique suas permissões.');
        console.error('Error deleting user:', err);
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'id' ? parseInt(value) : value
    });
  };

  const handleInsertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.password || formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      
      await registerUser(formData as User);
      setSuccess('Usuário cadastrado com sucesso!');
      fetchUsers();
      setSelectedAction(null);
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao cadastrar usuário. Verifique os dados e tente novamente.');
      console.error('Error creating user:', err);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.password && formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      
      // Se a senha estiver vazia, removê-la do objeto para não alterar
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await updateUser(formData.id!, updateData as User);
      setSuccess('Usuário atualizado com sucesso!');
      fetchUsers();
      setSelectedAction(null);
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao atualizar usuário. Verifique os dados e tente novamente.');
      console.error('Error updating user:', err);
      setTimeout(() => setError(null), 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      nome: '',
      email: '',
      telefone: '',
      funcao: '',
      role: UserRoles.USER,
      password: ''
    });
    setCurrentUser(null);
  };

  const handleActionSelect = (action: string) => {
    if (selectedAction === action) {
      setSelectedAction(null);
      resetForm();
    } else {
      setSelectedAction(action);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSelectUser = (user: User) => {
    if (selectedAction === 'update') {
      setCurrentUser(user);
      setFormData({
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        funcao: user.funcao,
        role: user.role,
        password: '' // Não preenchemos a senha atual por segurança
      });
    } else if (selectedAction === 'delete') {
      handleDelete(user.id, user.nome);
    }
  };

  const getStats = () => {
    const adminCount = users.filter(user => user.role === UserRoles.ADMIN).length;
    const userCount = users.filter(user => user.role === UserRoles.USER).length;
    return { total: users.length, admins: adminCount, regularUsers: userCount };
  };

  const stats = getStats();

  const renderActionForm = () => {
    switch (selectedAction) {
      case 'create':
        return (
          <div className="action-form">
            <h3>Cadastrar Novo Usuário</h3>
            <form onSubmit={handleInsertSubmit}>
              <div className="form-group">
                <label>ID:</label>
                <input 
                  type="number" 
                  name="id" 
                  value={formData.id} 
                  onChange={handleInputChange}
                  required 
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Nome:</label>
                <input 
                  type="text" 
                  name="nome" 
                  value={formData.nome} 
                  onChange={handleInputChange} 
                  required 
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div className="form-group">
                <label>Telefone:</label>
                <input 
                  type="tel" 
                  name="telefone" 
                  value={formData.telefone} 
                  onChange={handleInputChange} 
                  placeholder="(31) 99999-9999"
                />
              </div>
              <div className="form-group">
                <label>Função:</label>
                <input 
                  type="text" 
                  name="funcao" 
                  value={formData.funcao} 
                  onChange={handleInputChange} 
                  placeholder="Ex: Funcionário, Técnico, etc."
                />
              </div>
              <div className="form-group">
                <label>Tipo de Usuário:</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleInputChange}
                  required
                >
                  <option value={UserRoles.USER}>Usuário</option>
                  <option value={UserRoles.ADMIN}>Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label>Senha:</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  required 
                  minLength={6}
                />
                <div className="password-hint">A senha deve ter pelo menos 6 caracteres</div>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-submit">Cadastrar</button>
                <button type="button" className="btn-cancel" onClick={() => setSelectedAction(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        );
      
      case 'update':
        if (!currentUser) {
          return (
            <div className="action-form">
              <h3>Atualizar Usuário</h3>
              <p>Selecione um usuário da tabela para atualizar.</p>
              <div className="form-buttons">
                <button type="button" className="btn-cancel" onClick={() => setSelectedAction(null)}>Cancelar</button>
              </div>
            </div>
          );
        }
        return (
          <div className="action-form">
            <h3>Atualizar Usuário</h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label>ID:</label>
                <input 
                  type="number" 
                  name="id" 
                  value={formData.id} 
                  readOnly
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </div>
              <div className="form-group">
                <label>Nome:</label>
                <input 
                  type="text" 
                  name="nome" 
                  value={formData.nome} 
                  onChange={handleInputChange} 
                  required 
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div className="form-group">
                <label>Telefone:</label>
                <input 
                  type="tel" 
                  name="telefone" 
                  value={formData.telefone} 
                  onChange={handleInputChange} 
                  placeholder="(31) 99999-9999"
                />
              </div>
              <div className="form-group">
                <label>Função:</label>
                <input 
                  type="text" 
                  name="funcao" 
                  value={formData.funcao} 
                  onChange={handleInputChange} 
                  placeholder="Ex: Funcionário, Técnico, etc."
                />
              </div>
              <div className="form-group">
                <label>Tipo de Usuário:</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleInputChange}
                  required
                >
                  <option value={UserRoles.USER}>Usuário</option>
                  <option value={UserRoles.ADMIN}>Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nova Senha (opcional):</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  minLength={6}
                />
                <div className="password-hint">Deixe em branco para manter a senha atual</div>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-submit">Atualizar</button>
                <button type="button" className="btn-cancel" onClick={() => {
                  setSelectedAction(null);
                  resetForm();
                }}>Cancelar</button>
              </div>
            </form>
          </div>
        );
      
      case 'delete':
        return (
          <div className="action-form">
            <h3>Excluir Usuário</h3>
            <p>Selecione um usuário da tabela para excluir.</p>
            <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>⚠️ Esta ação não pode ser desfeita!</p>
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
    <div className="users-container">
      <div className="sidebar">
        <h2>Gerenciar Usuários</h2>
        <button 
          onClick={() => handleActionSelect('create')}
          className={selectedAction === 'create' ? 'active' : ''}
        >
          Cadastrar Usuário
        </button>
        <button 
          onClick={() => handleActionSelect('update')}
          className={selectedAction === 'update' ? 'active' : ''}
        >
          Atualizar Usuário
        </button>
        <button 
          onClick={() => handleActionSelect('delete')}
          className={selectedAction === 'delete' ? 'active' : ''}
        >
          Excluir Usuário
        </button>
        
        <button 
          onClick={() => navigate('/items')}
          className="nav-button"
        >
          ← Voltar para Itens
        </button>
        
        <div className="info-section">
          <hr />
          <p><strong>Dicas:</strong></p>
          <p>• Clique em uma ação no sidebar para ativá-la</p>
          <p>• Selecione um usuário da tabela após escolher uma ação</p>
          <p>• Apenas administradores podem gerenciar usuários</p>
        </div>
      </div>
      
      <div className="content">
        <h1>Gerenciamento de Usuários</h1>
        
        {/* Estatísticas */}
        <div className="stats-card">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total de Usuários</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.admins}</div>
              <div className="stat-label">Administradores</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.regularUsers}</div>
              <div className="stat-label">Usuários Regulares</div>
            </div>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {selectedAction && renderActionForm()}
        
        {loading ? (
          <div className="loading">Carregando usuários...</div>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Função</th>
                  <th>Tipo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr 
                      key={user.id} 
                      onClick={() => handleSelectUser(user)}
                      className={currentUser?.id === user.id ? 'selected' : ''}
                      title={selectedAction ? `Clique para ${selectedAction === 'update' ? 'atualizar' : selectedAction === 'delete' ? 'excluir' : 'selecionar'} este usuário` : ''}
                    >
                      <td>{user.id}</td>
                      <td>{user.nome}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>{user.telefone || 'N/A'}</td>
                      <td>{user.funcao || 'N/A'}</td>
                      <td>
                        <span className={`role-badge ${user.role === UserRoles.ADMIN ? 'role-admin' : 'role-user'}`}>
                          {user.role === UserRoles.ADMIN ? 'Admin' : 'Usuário'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAction('update');
                              handleSelectUser(user);
                            }}
                            title="Editar usuário"
                          >
                            Editar
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(user.id, user.nome);
                            }}
                            title="Excluir usuário"
                          >
                            Excluir
                          </button>
                        </div>
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

export default Users;