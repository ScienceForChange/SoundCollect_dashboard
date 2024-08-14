import { TestBed } from '@angular/core/testing';

import { StudyZoneService } from './study-zone.service';

describe('StudyZoneService', () => {
  let service: StudyZoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyZoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
