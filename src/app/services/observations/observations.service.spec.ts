import { TestBed } from '@angular/core/testing';
import { expect, describe, beforeEach, it } from '@jest/globals';

import { ObservationsService } from './observations.service';

describe('ObservationsService', () => {
  let service: ObservationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObservationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
