import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUserShowComponent } from './app-user-show.component';

describe('AppUserShowComponent', () => {
  let component: AppUserShowComponent;
  let fixture: ComponentFixture<AppUserShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppUserShowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppUserShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
