import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { ObservationsService } from '../../../../services/observations/observations.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-observation-numbers',
  templateUrl: './observation-numbers.component.html',
  styleUrl: './observation-numbers.component.scss',
})
export class ObservationNumbersComponent implements OnInit, OnDestroy {
  private observationService: ObservationsService = inject(ObservationsService);
  private subscriptions = new Subscription();

  dataGenre!: { genre: string; value: number }[];
  dataAge!: { age: string; value: number }[];
  averageObsPerUser!: number;
  totalUsers!: number;
  totalObs!: number;

  ngOnInit(): void {
    this.subscriptions.add(
      this.observationService.getAllObservationsNumbers().subscribe((data) => {
        this.dataGenre = data.observationsByGender;
        this.dataAge = data.observationsByAge;
        this.averageObsPerUser =
          data.averageObservationsPerUserPerMonth.toFixed(2);
        this.totalUsers = data.numberOfDifferentUsers;
        this.totalObs = data.totalObservations;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
