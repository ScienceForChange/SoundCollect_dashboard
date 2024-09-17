import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserShowComponent } from './admin-user-show.component';

describe('AdminUserShowComponent', () => {
  let component: AdminUserShowComponent;
  let fixture: ComponentFixture<AdminUserShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminUserShowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminUserShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
