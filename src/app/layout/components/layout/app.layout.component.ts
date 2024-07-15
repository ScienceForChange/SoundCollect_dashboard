import {
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

import { MapService } from '../../../modules/map/service/map.service';
import { ObservationsService } from '../../../services/observations/observations.service';

@Component({
  selector: 'app-layout',
  templateUrl: './app.layout.component.html',
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  mapService = inject(MapService);
  observationService = inject(ObservationsService);

  loading: boolean = false;

  ngOnInit(): void {
    this.observationService.loading$.subscribe((value) => {
      this.loading = value;
    });
  }

  ngOnDestroy(): void {}
}
