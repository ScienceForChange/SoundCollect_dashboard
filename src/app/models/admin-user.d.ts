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
    roles_list: string[];
  }

