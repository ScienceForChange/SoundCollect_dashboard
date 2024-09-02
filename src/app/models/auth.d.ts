export interface UserLoginResponse {
    status: string;
    data:   UserData;
  }
  
  export interface UserData {
    user:  User;
    token: string;
  }
  
  export interface User {
    type:          string;
    uuid:          string;
    attributes:    Attributes;
    relationships?: {};
  }
  
  export interface Attributes {
    avatar_id: number;
    profile:   Profile;
  }
  
  export interface Profile {
    gender:    string;
    birthYear: Date;
  }