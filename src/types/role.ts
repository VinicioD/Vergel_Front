export interface Role {
  id: number;
  name: string;
  description?: string | null;
  active?: boolean;
  users_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RolePayload {
  name: string;
  description?: string;
  active: boolean;
}