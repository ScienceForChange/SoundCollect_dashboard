import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationMapModalComponent } from './observation-map-modal.component';

describe('ObservationMapModalComponent', () => {
  let component: ObservationMapModalComponent;
  let fixture: ComponentFixture<ObservationMapModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ObservationMapModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ObservationMapModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
