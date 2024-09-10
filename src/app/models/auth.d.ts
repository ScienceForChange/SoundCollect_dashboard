export interface UserLoginResponse {
    status: string;
    data:   UserData;
  }
  
  export interface UserData {
    user:  User;
    token: string;
  }

  
  export interface User {
    type?:          string;
    id:             string;
    attributes:    Attributes;
    relationships?: {};
  }
  
  export interface Attributes {
    avatar_id: number;
    profile:   Profile;
    created_at: Date;
    updated_at: Date;
    permissions_list: string[];
    roles_list: string[];
  }
  
  export interface Profile {
    gender:    string;
    birthYear: Date;
  }