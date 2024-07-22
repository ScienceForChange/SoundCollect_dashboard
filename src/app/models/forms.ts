export interface FormFilterValues {
  type: boolean;
  typeFilter: { 1: boolean; 2: boolean; 3: boolean; 4: boolean };
  soundPressure: boolean;
  soundPressureFilter: [number, number];
  days: boolean;
  daysFilter: [Date, Date | null];
  hours: boolean;
  hoursFilter: [number, number];
  typeUser: boolean;
  typeUsers: { id: number; value: string; min: number; max?: number }[];
  positivePlace: boolean;
  positivePlaces: { id: number; value: string }[];
}
