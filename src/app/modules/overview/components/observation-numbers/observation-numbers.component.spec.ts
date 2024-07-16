import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect, describe, beforeEach, it } from '@jest/globals';

import { ObservationNumbersComponent } from './observation-numbers.component';

describe('ObservationNumbersComponent', () => {
  let component: ObservationNumbersComponent;
  let fixture: ComponentFixture<ObservationNumbersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ObservationNumbersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ObservationNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
