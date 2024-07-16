import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect, describe, beforeEach, it } from '@jest/globals';

import { SliderStepComponent } from './slider-step.component';

describe('SliderStepComponent', () => {
  let component: SliderStepComponent;
  let fixture: ComponentFixture<SliderStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SliderStepComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SliderStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
