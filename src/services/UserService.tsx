// src/services/UserService.tsx
import axios from 'axios';
import { User } from '../types/Users';

const API_URL = 'http://localhost:8080/api/usuario';

// Configure axios to include the token in all requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('tokenUser');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const getAllUsers = async (): Promise<User[]> => {
  try {
    console.log('Fazendo request para getAllUsers...');
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
};

export const registerUser = async (user: User): Promise<void> => {
  try {
    console.log('Tentando cadastrar usuário:', user);
    
    // Preparar payload com todos os campos obrigatórios
    const payload = {
      id: user.id.toString(),
      nome: user.nome,
      email: user.email || '',
      telefone: user.telefone || '',
      funcao: user.funcao || '',
      password: user.password,
      role: user.role
    };
    
    console.log('Payload para registro:', payload);
    const response = await axios.post('http://localhost:8080/auth/register', payload);
    console.log('Usuário cadastrado com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    console.log('Deletando usuário:', id);
    await axios.delete(`${API_URL}/deletar/${id}`);
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
};

export const updateUser = async (id: number, user: User): Promise<void> => {
  try {
    console.log('Atualizando usuário:', id, user);
    // Preparar payload sem password
    const payload = {
      id: user.id,
      nome: user.nome,
      email: user.email || '',
      telefone: user.telefone || '',
      funcao: user.funcao || '',
      role: user.role
    };
    await axios.put(`${API_URL}/atualizar/${id}`, payload);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};