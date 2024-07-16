import {
  Component,
  Input,
  OnInit,
  WritableSignal,
  inject,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { FormFilterValues } from '../../../../models/forms';
import { MapService } from '../../service/map.service';

@Component({
  selector: 'app-map-filters',
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
})
export class MapFiltersComponent implements OnInit {
  mapService = inject(MapService);
  private translate = inject(TranslateService);

  @Input() showFilters?: WritableSignal<boolean>;
  @Input() isFilterActive: boolean = false;

  private debounceTimer?: NodeJS.Timeout;

  public typesFilter: { id: number; value: string }[] = [
    { id: 1, value: this.translate.instant('map.filters.naturals') },
    { id: 2, value: this.translate.instant('map.filters.people') },
    { id: 3, value: this.translate.instant('map.filters.traffic') },
    { id: 4, value: this.translate.instant('map.filters.others') },
  ];
  public typesUsers: {
    id: number;
    value: string;
    min: number;
    max?: number;
  }[] = [
    { id: 1, value: this.translate.instant('map.filters.contributor'), min: 0, max: 2 },
    { id: 2, value: this.translate.instant('map.filters.citizen'), min: 3, max: 6 },
    { id: 3, value: this.translate.instant('map.filters.explorer'), min: 7, max: 12 },
    { id: 4, value: this.translate.instant('map.filters.traveler'), min: 13, max: 20 },
    { id: 5, value: this.translate.instant('map.filters.informer'), min: 21, max: 100 },
  ];

  public filtersForm: FormGroup = new FormGroup({
    type: new FormControl(false, []),
    typeFilter: new FormGroup({}),
    typeUser: new FormControl(false, []),
    typeUsers: new FormGroup([]),
    soundPressure: new FormControl(false, []),
    soundPressureFilter: new FormControl([35, 80], []),
    days: new FormControl(false, []),
    daysFilter: new FormControl([new Date(), new Date()], []),
    hours: new FormControl(false, []),
    hoursFilter: new FormControl([0, 23], []),
  });

  ngOnInit(): void {
    //Create an object {1: true,... } for each type of filter
    this.typesFilter.forEach((type) => {
      (this.filtersForm.get('typeFilter') as FormGroup).addControl(
        String(type.id),
        new FormControl(true, [])
      );
    });
    //Create an object {1: true,... } for each type of user of filter
    this.typesUsers.forEach((type) => {
      (this.filtersForm.get('typeUsers') as FormGroup).addControl(
        String(type.id),
        new FormControl(true, [])
      );
    });
    this.filtersForm.valueChanges.subscribe((values: FormFilterValues) => {
      //Check if any value of form is setted to toggle the showFilters button
      if (values.type || values.soundPressure || values.days || values.hours) {
        this.mapService.isFilterActive.next(true);
      } else {
        this.mapService.isFilterActive.next(false);
      }
      //Get users selected
      const users = Object.entries(values.typeUsers)
        .filter((value) => value[1])
        .map((value) => this.typesUsers[parseInt(value[0]) - 1]);
      values.typeUsers = users;

      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.filterData(values);
      }, 500);
    });
  }

  //Podría llamar a un servicio que lo que hace es encargarse de filtrar los datos.
  private filterData(values: FormFilterValues): void {
    this.mapService.filterMapObservations(values);
  }
}
