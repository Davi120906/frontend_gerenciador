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
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const getAllItems = async (): Promise<Itens[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const registerItem = async (item: Itens): Promise<void> => {
  await axios.post(`${API_URL}/cadastrar`, item);
};

export const updateItem = async (nPatrimonio: string, item: Itens): Promise<void> => {
  await axios.put(`${API_URL}/atualizar/${nPatrimonio}`, item);
};

export const deleteItem = async (nPatrimonio: string): Promise<void> => {
  await axios.delete(`${API_URL}/deletar/${nPatrimonio}`);
};

export const moveItem = async (nPatrimonio: string, data: { salaAtual: string }): Promise<void> => {
  await axios.put(`${API_URL}/movimentacao/${nPatrimonio}`, data);
};

export const searchItems = async (tipoBusca: string, busca: string): Promise<Itens[]> => {
  const response = await axios.get(`${API_URL}/buscar`, {
    data: { tipoBusca, busca }
  });
  return response.data;
};