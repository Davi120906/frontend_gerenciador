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

    const payload = {
      npatrimonio: item.nPatrimonio,
      nantigo: item.nAntigo,
      descricao: item.descricao,
      conservacao: item.conservacao,
      valorBem: item.valorBem,
      foto: item.foto,
      salaRegistrada: item.salaRegistrada,
      salaAtual: item.salaAtual,
      state: item.state || "ocioso", // usa o estado ou padrão
      responsavel: item.responsavel // novo campo
    };
console.log('item.salaRegistrada:', item.salaRegistrada);
console.log('Payload final:', payload);



    const response = await axios.post(`${API_URL}/cadastrar`, payload);
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
    console.log('Tentando atualizar item:', nPatrimonio, item);
    
    const payload = {
      npatrimonio: item.nPatrimonio,
      nantigo: item.nAntigo,
      descricao: item.descricao,
      conservacao: item.conservacao,
      valorBem: item.valorBem,
      foto: item.foto,
      salaRegistrada: item.salaRegistrada,
      salaAtual: item.salaAtual,
      state: item.state || 'ocioso',
      responsavel: item.responsavel // novo campo
    };

    console.log('Payload de atualização:', payload);
    const response = await axios.put(`${API_URL}/atualizar/${nPatrimonio}`, payload);
    console.log('Item atualizado com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    throw error;
  }
};


export const deleteItem = async (nPatrimonio: string): Promise<void> => {
  try {
    console.log('Tentando deletar item:', nPatrimonio);
    const response = await axios.delete(`${API_URL}/deletar/${nPatrimonio}`);
    console.log('Item deletado com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    throw error;
  }
};

export const moveItem = async (nPatrimonio: string, moveData: { salaAtual: string }): Promise<void> => {
  try {
    console.log('Tentando mover item:', nPatrimonio, 'para sala:', moveData.salaAtual);
    
    const payload = {
      salaAtual: moveData.salaAtual
    };

    console.log('Payload de movimento:', payload);
    const response = await axios.put(`${API_URL}/movimentacao/${nPatrimonio}`, payload);
    console.log('Item movido com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao mover item:', error);
    throw error;
  }
};

export const searchItems = async (tipoBusca: string, termoBusca: string): Promise<Itens[]> => {
  try {
    console.log('Fazendo busca no frontend:', tipoBusca, 'termo:', termoBusca);
    
    // Primeiro, buscar todos os itens
    const allItems = await getAllItems();
    
    // Filtrar os itens baseado no tipo de busca
    const filteredItems = allItems.filter(item => {
      const termo = termoBusca.toLowerCase().trim();
      
      switch (tipoBusca) {
        case 'npatrimonio':
          return item.nPatrimonio.toLowerCase().includes(termo);
        case 'salaAtual':
          return item.salaAtual.toLowerCase().includes(termo);
        case 'salaRegistrada':
          return item.salaRegistrada.toLowerCase().includes(termo);

        case 'valor':
          return item.valorBem.toString().includes(termo);
        case 'descricao':
          return item.descricao.toLowerCase().includes(termo);
        default:
          return false;
      }
    });
    
    console.log('Resultados da busca:', filteredItems);
    return filteredItems;
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    throw error;
  }
};

// Função auxiliar para buscar um item específico por número de patrimônio
export const getItemByPatrimonio = async (nPatrimonio: string): Promise<Itens> => {
  try {
    console.log('Buscando item por patrimônio:', nPatrimonio);
    const allItems = await getAllItems();
    const item = allItems.find(item => item.nPatrimonio === nPatrimonio);
    
    if (!item) {
      throw new Error(`Item com patrimônio ${nPatrimonio} não encontrado`);
    }
    
    console.log('Item encontrado:', item);
    return item;
  } catch (error) {
    console.error('Erro ao buscar item por patrimônio:', error);
    throw error;
  }
};

// Função auxiliar para buscar itens por sala
export const getItemsBySala = async (sala: string): Promise<Itens[]> => {
  try {
    console.log('Buscando itens da sala:', sala);
    const allItems = await getAllItems();
    const filteredItems = allItems.filter(item => 
      item.salaAtual.toLowerCase().includes(sala.toLowerCase()) || 
      item.salaRegistrada.toLowerCase().includes(sala.toLowerCase())
    );
    
    console.log('Itens da sala encontrados:', filteredItems);
    return filteredItems;
  } catch (error) {
    console.error('Erro ao buscar itens da sala:', error);
    throw error;
  }
};

// Função auxiliar para buscar itens por faixa de valor
export const getItemsByValorRange = async (valorMin: number, valorMax: number): Promise<Itens[]> => {
  try {
    console.log('Buscando itens por faixa de valor:', valorMin, 'até', valorMax);
    const allItems = await getAllItems();
    const filteredItems = allItems.filter(item => 
      item.valorBem >= valorMin && item.valorBem <= valorMax
    );
    
    console.log('Itens por valor encontrados:', filteredItems);
    return filteredItems;
  } catch (error) {
    console.error('Erro ao buscar itens por valor:', error);
    throw error;
  }
};

// Função auxiliar para buscar itens por estado de conservação
export const getItemsByConservacao = async (conservacao: string): Promise<Itens[]> => {
  try {
    console.log('Buscando itens por conservação:', conservacao);
    const allItems = await getAllItems();
    const filteredItems = allItems.filter(item => 
      item.conservacao.toLowerCase().includes(conservacao.toLowerCase())
    );
    
    console.log('Itens por conservação encontrados:', filteredItems);
    return filteredItems;
  } catch (error) {
    console.error('Erro ao buscar itens por conservação:', error);
    throw error;
  }
};

// Função para busca avançada com múltiplos critérios
export const advancedSearch = async (criteria: {
  npatrimonio?: string;
  descricao?: string;
  sala?: string;
  conservacao?: string;
  valorMin?: number;
  valorMax?: number;
  state?: string;
}): Promise<Itens[]> => {
  try {
    console.log('Fazendo busca avançada com critérios:', criteria);
    
    const allItems = await getAllItems();
    
    const filteredItems = allItems.filter(item => {
      // Verificar cada critério se foi fornecido
      if (criteria.npatrimonio && !item.nPatrimonio.toLowerCase().includes(criteria.npatrimonio.toLowerCase())) {
        return false;
      }
      
      if (criteria.descricao && !item.descricao.toLowerCase().includes(criteria.descricao.toLowerCase())) {
        return false;
      }
      
      if (criteria.sala && 
          !(item.salaAtual.toLowerCase().includes(criteria.sala.toLowerCase()) || 
            item.salaRegistrada.toLowerCase().includes(criteria.sala.toLowerCase()))) {
        return false;
      }
      
      if (criteria.conservacao && !item.conservacao.toLowerCase().includes(criteria.conservacao.toLowerCase())) {
        return false;
      }
      
      if (criteria.valorMin !== undefined && item.valorBem < criteria.valorMin) {
        return false;
      }
      
      if (criteria.valorMax !== undefined && item.valorBem > criteria.valorMax) {
        return false;
      }
      
      if (criteria.state && item.state && !item.state.toLowerCase().includes(criteria.state.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    console.log('Resultados da busca avançada:', filteredItems);
    return filteredItems;
  } catch (error) {
    console.error('Erro na busca avançada:', error);
    throw error;
  }
};