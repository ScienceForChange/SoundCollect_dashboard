import { Component, OnInit, inject } from '@angular/core';

import { ObservationsService } from '../../../../services/observations/observations.service';

@Component({
  selector: 'app-observation-numbers',
  templateUrl: './observation-numbers.component.html',
  styleUrl: './observation-numbers.component.scss',
})
export class ObservationNumbersComponent implements OnInit {
  private observationService: ObservationsService = inject(ObservationsService);
  dataGenre!: { genre: string; value: number }[];
  dataAge!: { age: string; value: number }[];
  averageObsPerUser!: number;
  totalUsers!: number;
  totalObs!:number;

  ngOnInit(): void {
    this.observationService.getAllObservationsNumbers().subscribe((data) => {
      this.dataGenre = data.observationsByGender
      this.dataAge = data.observationsByAge
      this.averageObsPerUser = data.averageObservationsPerUserPerMonth.toFixed(2)
      this.totalUsers = data.numberOfDifferentUsers
      this.totalObs = data.totalObservations
    });
  }

}
