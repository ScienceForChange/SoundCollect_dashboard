import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect, describe, beforeEach, it } from '@jest/globals';

import { MapLayersComponent } from './map-study-zone-layers.component';

describe('MapLayersComponent', () => {
  let component: MapLayersComponent;
  let fixture: ComponentFixture<MapLayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapLayersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapLayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
