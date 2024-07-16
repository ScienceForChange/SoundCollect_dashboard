import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect, describe, beforeEach, it } from '@jest/globals';

import { OneThirdOctaveChartComponent } from './one-third-octave-chart.component';

describe('OneThirdOctaveChartComponent', () => {
  let component: OneThirdOctaveChartComponent;
  let fixture: ComponentFixture<OneThirdOctaveChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OneThirdOctaveChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OneThirdOctaveChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
