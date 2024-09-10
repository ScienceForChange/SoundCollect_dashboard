import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import mapboxgl, { Map } from 'mapbox-gl';

import { Subscription } from 'rxjs';

import { MapService } from '../service/map.service';
import { Observations } from '../../../models/observations';
import { StudyZone } from '../../../models/study-zone';
import { StudyZoneService } from '../../../services/study-zone/study-zone.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapDiv') mapDivElement!: ElementRef;
  private mapService = inject(MapService);
  private studyZoneService = inject(StudyZoneService);


  public showFilters: WritableSignal<boolean> = signal<boolean>(false);
  public showMapLayers: WritableSignal<boolean> = signal<boolean>(false);
  public showMapStudyZonesLayers: WritableSignal<boolean> =
    signal<boolean>(false);

  public activeFilters: boolean = false;
  public isOpenObservationInfoModal: boolean = false;
  public isSZModalVisible: boolean = false;
  public isStudyZonesBtnDisbaled: boolean = false;

  private subscriptions = new Subscription();
  public observationSelected!: Observations;
  public studyZoneSelected!: StudyZone;

  constructor() {
    this.subscriptions.add(
      this.mapService.isFilterActive.subscribe((value) => {
        this.activeFilters = value;
      })
    );
    this.subscriptions.add(
      this.mapService.studyZoneDialogVisible$.subscribe((value) => {
        this.isSZModalVisible = value;
      })
    );
    this.subscriptions.add(
      this.mapService.studyZoneSelected$.subscribe((value) => {
        this.studyZoneSelected = value;
      })
    );
    this.subscriptions.add(
      this.studyZoneService.studyZones$.subscribe((studyZones) => {
        this.isStudyZonesBtnDisbaled = studyZones.length === 0;
      })
    )
  }

  public toogleActiveFilters(): void {
    this.mapService.isFilterActive.next(!this.activeFilters);
  }

  public toggleSZModal(): void {
    this.mapService.studyZoneDialogVisible$.next(!this.isSZModalVisible);
  }

  public hideModal(): void {
    this.mapService.isOpenObservationInfoModal.next(false);
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(
      this.mapService.isOpenObservationInfoModal.subscribe((isOpen) => {
        this.isOpenObservationInfoModal = isOpen;
        this.observationSelected = this.mapService.observationSelected;
      })
    );

    const map = new Map({
      container: this.mapDivElement.nativeElement, // container ID
      style: this.mapService.mapSettings.mapStyle, // style URL
      center: this.mapService.mapSettings.centerMapLocation, // starting position [lng, lat]
      zoom: this.mapService.mapSettings.zoom, // starting zoom
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      language: 'ca',
      limit: 5,
      // mapboxgl: mapboxgl,
      marker: false,
      zoom: 17,
    });

    map.addControl(geocoder, 'top-left');

    this.mapService.setMap(map);

    //Build all the layers and add the sources empty
    this.mapService.initializeMap();

    //Update the data of the sources added.
    this.mapService.getAllMapObservations();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.mapService.map = null;
    this.mapService.studyZoneDialogVisible$.next(false);
  }
}
