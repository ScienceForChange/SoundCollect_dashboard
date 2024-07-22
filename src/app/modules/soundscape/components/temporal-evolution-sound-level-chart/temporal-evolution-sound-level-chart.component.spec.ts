import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect, describe, beforeEach, it } from '@jest/globals';

import { TemporalEvolutionSoundLevelChartComponent } from './temporal-evolution-sound-level-chart.component';

describe('TemporalEvolutionSoundLevelChartComponent', () => {
  let component: TemporalEvolutionSoundLevelChartComponent;
  let fixture: ComponentFixture<TemporalEvolutionSoundLevelChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TemporalEvolutionSoundLevelChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TemporalEvolutionSoundLevelChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
