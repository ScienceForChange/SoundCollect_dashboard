export interface StudyZone {
  id: number;
  user_id: string;
  name: string;
  description: string;
  conclusion: string;
  start_date: Date;
  end_date: Date;
  deleted: 0 | 1;
  created_at: Date;
  updated_at: Date;
  relationships?: StudyZoneRelationships
}

export interface StudyZoneRelationships {
    documents: DocumentsStudyZones[]
    collaborators: CollaboratorsStudyZone[]
}

export interface DocumentsStudyZones{
    id:number;
    study_zone_id:number;
    name:string;
    type:string;
    created_at: Date;
    updated_at:Date;
}

export interface CollaboratorsStudyZone{
    id:number;
    study_zone_id:number;
    collaborator_name: string;
    logo:string;
    contact_name:string;
    contact_email:string;
    contact_phone:string;
    created_at:Date;
    updated_at:Date;
}

export interface StudyZoneForm {
    collaborators: CollaboratorsStudyZone[],
    documents: DocumentsStudyZones[],
    conclusion: string,
    description:string,
    name:string,
    user_id:string,
    start_end_dates: Date[]
  }
  