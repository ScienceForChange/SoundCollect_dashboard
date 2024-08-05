// src/types/tokml.d.ts
declare module "@maphubs/tokml" {
    interface TokmlOptions {
      name: string,
      description: string
    }
  
    function tokml(geojson: GeoJSON.GeoJSON, options?: TokmlOptions): string;
  
    export = tokml;
  }