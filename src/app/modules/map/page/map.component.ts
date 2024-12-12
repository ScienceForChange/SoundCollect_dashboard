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
import { ObservationsService } from '../../../services/observations/observations.service';

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
  public isFilterBtnDisbaled:boolean = true;
  private language: string = localStorage.getItem('locale') || 'ca';

  private subscriptions = new Subscription();
  public observationSelected!: Observations;
  public studyZoneSelected!: StudyZone;

  public legendData: {dba: string, color: string }[] = [
    {dba: '< 35 dBA',    color: '#B7CE8E'},
    {dba: '35 - 40 dBA', color: '#1D8435'},
    {dba: '40 - 45 dBA', color: '#0E4C3C'},
    {dba: '45 - 50 dBA', color: '#ECD721'},
    {dba: '50 - 55 dBA', color: '#9F6F2C'},
    {dba: '55 - 60 dBA', color: '#EF7926'},
    {dba: '60 - 65 dBA', color: '#C71932'},
    {dba: '65 - 70 dBA', color: '#8D1A27'},
    {dba: '70 - 75 dBA', color: '#88497B'},
    {dba: '75 - 80 dBA', color: '#18558C'}
  ];
  
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
    this.subscriptions.add(
      this.mapService.isFilterBtnDisbaled.subscribe((value) => {
        this.isFilterBtnDisbaled = value;
      })
    )
  }

  public toggleActiveFilters(): void {
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
      language: this.language,
      limit: 5,
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
    this.mapService.map.remove();
    this.mapService.studyZoneDialogVisible$.next(false);
  }
}
