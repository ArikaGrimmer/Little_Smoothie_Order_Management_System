// shared/types/user.ts
// will be expanded with email (OIDC) and role
export interface Customer {
  id: string;
  username: string;
  displayName: string;
  phone?: string;
}

export interface Operator {
  id: string;
  username: string;
  displayName: string;
}
