// src/services/ItemsService.ts
import axios from 'axios';
import { Itens } from '../types/Itens';

const API_URL = 'http://localhost:8080/api/itens';

// Configure axios to include the token in all requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('tokenUser');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token sendo enviado:', token);
      console.log('Headers da request:', config.headers);
    } else {
      console.error('Token não encontrado no localStorage');
    }
    return config;
  },
  error => {
    console.error('Erro no interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas (para debug)
axios.interceptors.response.use(
  response => {
    console.log('Resposta recebida:', response.status, response.data);
    return response;
  },
  error => {
    console.error('Erro na resposta:', error.response?.status, error.response?.data);
    if (error.response?.status === 403) {
      console.error('Erro de autorização - verificar role do usuário');
    }
    return Promise.reject(error);
  }
);

export const getAllItems = async (): Promise<Itens[]> => {
  try {
    console.log('Fazendo request para getAllItems...');
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    throw error;
  }
};

export const registerItem = async (item: Itens): Promise<void> => {
  try {
    console.log('Tentando cadastrar item:', item);
    console.log('Token atual:', localStorage.getItem('tokenUser'));
    
    const response = await axios.post(`${API_URL}/cadastrar`, item);
    console.log('Item cadastrado com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao cadastrar item:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Headers:', error.response?.headers);
    }
    
    throw error;
  }
};

export const updateItem = async (nPatrimonio: string, item: Itens): Promise<void> => {
  try {
    console.log('Atualizando item:', nPatrimonio, item);
    await axios.put(`${API_URL}/atualizar/${nPatrimonio}`, item);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    throw error;
  }
};

export const deleteItem = async (nPatrimonio: string): Promise<void> => {
  try {
    console.log('Deletando item:', nPatrimonio);
    await axios.delete(`${API_URL}/deletar/${nPatrimonio}`);
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    throw error;
  }
};

export const moveItem = async (nPatrimonio: string, data: { salaAtual: string }): Promise<void> => {
  try {
    console.log('Movendo item:', nPatrimonio, data);
    await axios.put(`${API_URL}/movimentacao/${nPatrimonio}`, data);
  } catch (error) {
    console.error('Erro ao mover item:', error);
    throw error;
  }
};

export const searchItems = async (tipoBusca: string, busca: string): Promise<Itens[]> => {
  try {
    console.log('Buscando itens:', tipoBusca, busca);
    const response = await axios.get(`${API_URL}/buscar`, {
      data: { tipoBusca, busca }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    throw error;
  }
};