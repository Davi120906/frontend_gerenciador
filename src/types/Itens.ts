// src/types/Itens.ts
export interface Itens {
    nPatrimonio: string;
    nAntigo: string;
    descricao: string;
    conservacao: string;
    valorBem: number;
    state?: 'ocioso' | 'quebrado' | 'nao encontrado' | 'sem plaqueta';
    foto: string;
    salaRegistrada: string;
    salaAtual: string;
  }