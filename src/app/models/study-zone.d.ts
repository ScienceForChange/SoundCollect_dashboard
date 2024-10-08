export interface StudyZoneForm {
  id?: number;
  boundaries?: Boundaries;
  collaborators: CollaboratorsStudyZone[];
  documents: DocumentsStudyZones[];
  conclusion: string;
  description: string;
  name: string;
  user_id: string;
  start_end_dates: Date[];
}

export interface CollaboratorsStudyZone {
  collaborator_name: string;
  collaborator_web: null | string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  logo?: string;
  logo_data?: string;
  id: number;
  updated_at: Date;
  created_at: Date;
  study_zone_id: number;
}

export interface DocumentsStudyZones {
  name: string;
  file?: string;
  file_data?: string;
  id: number;
}

export interface StudyZone {
  id: number;
  user_id: string;
  name: string;
  description: string;
  conclusion: string;
  is_visible: boolean;
  boundaries: Boundaries;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
  relationships?: StudyZoneRelationships;
}

export interface Boundaries {
  type: string;
  coordinates: Array<Array<number[]>>;
}

export interface StudyZoneRelationships {
  user: User;
  documents: DocumentsStudyZones[];
  collaborators: CollaboratorsStudyZone[];
}

export interface User {
  id: string;
  profile_id: number;
  profile_type: string;
  avatar_id: string;
  email: string;
  email_verified_at: null;
  deleted_at: null;
  created_at: Date;
  updated_at: Date;
  autocalibration: number;
  is_expert: number;
  calibration_method_id: null;
  profile: Profile;
}

export interface Profile {
  id: number;
  gender: string;
  birth_year: number;
  deleted_because: null;
  created_at: Date;
  updated_at: Date;
}
