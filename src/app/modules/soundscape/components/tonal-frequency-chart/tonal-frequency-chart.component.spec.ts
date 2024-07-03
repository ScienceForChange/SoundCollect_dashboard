import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TonalFrequencyChartComponent } from './tonal-frequency-chart.component';

describe('TonalFrequencyChartComponent', () => {
  let component: TonalFrequencyChartComponent;
  let fixture: ComponentFixture<TonalFrequencyChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TonalFrequencyChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TonalFrequencyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
