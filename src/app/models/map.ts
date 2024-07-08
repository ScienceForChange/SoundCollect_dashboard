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
  path: Segment[];
  user_level: number;
}

// export interface Geometry {
//   type: string;
//   coordinates: number[];
// }

// export interface Feature {
//   id: number;
//   type: "Feature";
//   properties: Properties;
//   geometry: Geometry;
// }

// export interface ObservationGeoJSON {
//   type: 'FeatureCollection';
//   features: Feature[];
// }

// export interface FeatureCollection {
//   type: "FeatureCollection";
//   features: readonly Feature[];
// }
