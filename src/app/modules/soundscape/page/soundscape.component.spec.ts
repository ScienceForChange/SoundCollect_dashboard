import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect, describe, beforeEach, it } from '@jest/globals';

import { SoundscapeComponent } from './soundscape.component';

describe('SoundscapeComponent', () => {
  let component: SoundscapeComponent;
  let fixture: ComponentFixture<SoundscapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SoundscapeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoundscapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
