  export interface AdminUser {
    id:            string;
    attributes:    Attributes;
  }

  export interface Attributes {
    name: string;
    avatar_id: number;
    created_at: Date;
    updated_at: Date;
    permissions_list: string[];
    roles_list: Role[] | string[];
  }

  export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[] | string[];
  }

  export interface Permission {
    id: number;
    name: string;
    guard_name: string;
  }

