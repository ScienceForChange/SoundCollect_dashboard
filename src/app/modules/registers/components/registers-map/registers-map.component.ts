import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuService } from '../../../../layout/components/menu/app.menu.service';
import { MapComponent } from 'ngx-mapbox-gl';
import { StudyZoneService } from '../../../../services/study-zone.service';
import { StudyZone } from '../../../../models/study-zone';
import { Point } from 'chart.js';
import { Observation } from '../../../../models/observation';
import { Polygon } from '../../../../models/polygon';
import { HttpClient } from '@angular/common/http';
import { GeoJSONSourceComponent } from "ngx-mapbox-gl";

@Component({
  selector: 'app-registers-map',
  templateUrl: './registers-map.component.html',
  styleUrl: './registers-map.component.scss'
})
export class RegistersMapComponent implements OnInit, AfterViewInit, OnDestroy{

  @ViewChild('map') map!: MapComponent;

  private sidebarMenuIsOpen$! : Subscription;
  private studyZone$! : Subscription;

  public studyZone!: StudyZone;
  public points!: Point[];
  public intialPoint: Point = {x: 0, y: 0};
  public APGEMOpoints: Point[] = [];
  public APGEMOpolygon: Polygon[] = [];
  public APGEMOpolygonStyle: {} =
    {
      'fill-outline-color': '#363c69',
      'fill-color': '#348ac7',
      'fill-opacity': 0.8
    };

  public observations: Observation[] = [];
  public restObservations: Observation[] = [];

  public geoJsonObservation: any;
  public geoJsonRestObservation: any;

  public earthquakes: any;

  public heatmapLayer:boolean = false;
  public filters:boolean = false;


  constructor(
    private studyZoneService: StudyZoneService,
    private menuService: MenuService,
    ) {

      this.sidebarMenuIsOpen$ = this.menuService.sidebarMenuIsOpen.subscribe((isOpen) => {
        setTimeout(() => {
          this.map.mapInstance.resize();
        },300);
      });
      this.studyZone$ = this.studyZoneService.studyZone.subscribe((studyZone) => {
        if (studyZone) {

          this.studyZone = studyZone;
          this.studyZone.episodes.forEach(episode => this.observations = this.observations.concat(episode.observations));
          this.observations.forEach(observation => {
            this.intialPoint.x += observation.longitude/this.observations.length;
            this.intialPoint.y += observation.latitude/this.observations.length;
          });

          this.points = this.observations.map(observation => {
            return {
              x: observation.longitude,
              y: observation.latitude
            };
          });


          studyZone.APGEMO.forEach(point => {
            if (Array.isArray(point)) {
              let polygon:Polygon = {
                geometry: {
                  type: 'Polygon',
                  coordinates: [point.map(pt => [pt.x, pt.y])]
                }
              };

              this.APGEMOpolygon.push(polygon);

            }
            else {
              this.APGEMOpoints.push(point);
            }
          });

          this.points = this.points.concat(this.APGEMOpoints);

          this.restObservations = this.studyZone.restObservations;

          this.geoJsonObservation = this.passToGeoJsonPoints(this.observations);
          this.geoJsonRestObservation = this.passToGeoJsonPoints(this.restObservations);


        }
      });


      setTimeout(() => {
        if(this.points){
          const bbox = this.getBboxFromPoints();
          this.map.mapInstance.fitBounds(bbox, {
            padding: {top: 100, bottom:50, left: 50, right: 50}
          });
        }
      });
    }

  ngOnInit() {
  this.earthquakes = this.updateCluster(10); // { features: [], type: "FeatureCollection" };
    let index = 20;
    setInterval(() => {
      index++;
      this.earthquakes = this.updateCluster(index);
    }, 1000);
  }

  ngAfterViewInit() {

  }

  private getBboxFromPoints(): [[number,number], [number, number]] {
    let points = this.points;

    let minX:number = 0, maxX:number = 0, minY:number = 0, maxY:number = 0;

    points.forEach((p, i) => {
      if (i === 0) {
        minX = maxX = p.x;
        minY = maxY = p.y;
      } else {
        minX = Math.min(p.x, minX);
        minY = Math.min(p.y, minY);
        maxX = Math.max(p.x, maxX);
        maxY = Math.max(p.y, maxY);
      }
    });

    return [[minX, minY], [maxX, maxY]];

  }

  ngOnDestroy() {
    this.sidebarMenuIsOpen$.unsubscribe();
    this.studyZone$.unsubscribe();
  }

  private passToGeoJsonPoints(observations: Observation[]): any {

    let features = observations.map((observation, index) => {
      return {
        type: "Feature",
        id: observation.id,
        properties: {
          id: observation.id,
          color: observation.color? observation.color : 0,
        },
        geometry: {
          type: "Point",
          coordinates: [observation.longitude, observation.latitude]
        }
      };
    });

    return { features: features, type: "FeatureCollection" };
  }

  public toggleHeatmapLayer(status: boolean | undefined = undefined) {
    this.heatmapLayer = status===undefined? !this.heatmapLayer : status;
  }

  public toggleFilters(status: boolean | undefined = undefined) {
    this.filters = status===undefined? !this.filters : status;
  }

  private updateCluster(index: number) {
    let center = [-103.59179687498357, 40.66995747013945];
    let features = [];
    for (let i = 0; i < index; i++) {
      features.push({
        type: "Point",
        id: i,
        properties: {
          id: i,
          "Secondary ID": "Secondary ID",
          "Primary ID": "Primary ID"
        },
        geometry: {
          coordinates: [center[0] + i / 1000.0, center[1]]
        }
      });
    }
    return { features: features, type: "FeatureCollection" };
  }
}