import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyZoneDialogComponent } from './study-zone-dialog.component';

describe('StudyZoneDialogComponent', () => {
  let component: StudyZoneDialogComponent;
  let fixture: ComponentFixture<StudyZoneDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudyZoneDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudyZoneDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
