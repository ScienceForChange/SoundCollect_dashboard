import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhychoacusticsComponent } from './phychoacustics.component';

describe('PhychoacusticsComponent', () => {
  let component: PhychoacusticsComponent;
  let fixture: ComponentFixture<PhychoacusticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhychoacusticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PhychoacusticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
