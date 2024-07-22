import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapFiltersComponent } from './filters.component';
import { expect, describe, beforeEach, it } from '@jest/globals';

describe('FiltersComponent', () => {
  let component: MapFiltersComponent;
  let fixture: ComponentFixture<MapFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapFiltersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
