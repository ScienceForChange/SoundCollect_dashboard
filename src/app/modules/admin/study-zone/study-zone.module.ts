import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';

import { StudyZoneComponent } from './study-zone/study-zone.component';
import { StudyZoneMapComponent } from './components/map/study-zone-map.component';
import { SharedComponentsModule } from '../../../shared/shared.module';
import { StudyZoneFormComponent } from './components/study-zone-form/study-zone-form.component';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';

@NgModule({
  declarations: [
    StudyZoneComponent,
    StudyZoneMapComponent,
    StudyZoneFormComponent,
  ],
  imports: [
    CommonModule,
    ButtonModule,
    SidebarModule,
    RadioButtonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedComponentsModule,
    TooltipModule,
    DialogModule,
    CalendarModule,
    InputTextModule,
    InputTextareaModule,
    FileUploadModule,
    DividerModule
  ],
})
export class StudyZoneModule {}
