import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect, describe, beforeEach, it } from '@jest/globals';

import { MapToolBarComponent } from './tool-bar.component';

describe('ToolBarComponent', () => {
  let component: MapToolBarComponent;
  let fixture: ComponentFixture<MapToolBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapToolBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapToolBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
