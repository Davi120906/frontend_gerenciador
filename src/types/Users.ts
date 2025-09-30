// src/types/User.ts
export interface User {
  id: number;
  nome: string;
  role: UserRoles;
  password?: string; // Optional para updates onde não queremos alterar a senha
}

export enum UserRoles {
  ADMIN = 'ADMIN',
  USER = 'USER'
}