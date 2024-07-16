import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect, describe, beforeEach, it } from '@jest/globals';

import { ObservationInfoModalComponent } from './observation-info-modal.component';

describe('ObservationInfoModalComponent', () => {
  let component: ObservationInfoModalComponent;
  let fixture: ComponentFixture<ObservationInfoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ObservationInfoModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ObservationInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
