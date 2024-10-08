import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxPermissionsModule } from 'ngx-permissions';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';


import { StudyZoneComponent } from './page/study-zone.component';
import { StudyZoneMapComponent } from './components/map/study-zone-map.component';
import { SharedComponentsModule } from '../../../shared/shared.module';
import { StudyZoneFormComponent } from './components/study-zone-form/study-zone-form.component';
import { StudyZoneListComponent } from './components/study-zone-list/study-zone-list.component';
import { MenubarModule } from 'primeng/menubar';

@NgModule({
  declarations: [
    StudyZoneComponent,
    StudyZoneMapComponent,
    StudyZoneFormComponent,
    StudyZoneListComponent,
  ],
  imports: [
    CommonModule,
    ConfirmPopupModule,
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
    DividerModule,
    TableModule,
    ToastModule,
    MenubarModule,
    NgxPermissionsModule
  ],
})
export class StudyZoneModule {}
