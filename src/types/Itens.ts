// src/types/Itens.ts
export interface Itens {
  nPatrimonio: string;
  nAntigo: string;
  descricao: string;
  conservacao: string;
  valorBem: number;
  state?: string;
  foto: string;
  salaRegistrada: string;
  salaAtual: string;
  comentario?: string; // Novo campo adicionado
}