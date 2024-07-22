import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect, describe, beforeEach, it } from '@jest/globals';

import { CatalunyaMapComponent } from './catalunya-map.component';

describe('CatalunyaMapComponent', () => {
  let component: CatalunyaMapComponent;
  let fixture: ComponentFixture<CatalunyaMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CatalunyaMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CatalunyaMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
