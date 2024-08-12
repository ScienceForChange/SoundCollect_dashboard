import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';


import { StudyZoneComponent } from './study-zone/study-zone.component';
import { StudyZoneMapComponent } from './components/map/study-zone-map.component';
import { SharedComponentsModule } from '../../../shared/shared.module';
@NgModule({
  declarations: [StudyZoneComponent, StudyZoneMapComponent],
  imports: [
    CommonModule,
    ButtonModule,
    SidebarModule,
    RadioButtonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedComponentsModule,
    TooltipModule
  ],
})
export class StudyZoneModule {}
