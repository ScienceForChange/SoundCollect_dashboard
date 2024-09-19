import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LAeqTChartComponent } from './laeq-tchart.component';
import { expect, describe, beforeEach, it } from '@jest/globals';

describe('LAeqTChartComponent', () => {
  let component: LAeqTChartComponent;
  let fixture: ComponentFixture<LAeqTChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LAeqTChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LAeqTChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
