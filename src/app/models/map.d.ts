import { Geometry } from '@turf/turf';
import { Segment } from './observations';

export interface MapObservation {
  id: string;
  user_id: string;
  latitude: string;
  longitude: string;
  created_at?: Date;
  types?: (string | number)[];
  Leq?: string;
  userType?: string;
  quiet?: string;
  influence?:number;
  path: Segment[];
  user_level: number;
}

interface MapLayer {
  id: number;
  name: string;
  slug: string;
  color: string;
  features: Feature<Geometry, { [name: string]: any; }>[];
}