import { type Permission, PERMISSIONS } from './Permission';

export type Role = 'customer' | 'admin';

// MVP: admin acessa tudo. Quando existirem cargos (financeiro, gerente…), as permissões do admin passam a vir do banco.
// Customer não tem permissão de painel: o acesso aos próprios dados é pelo accountId, igual para todo cliente.
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: PERMISSIONS,
  customer: [],
};
