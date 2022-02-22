import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteModule, CalendarModule, CardModule, CheckboxModule, DialogService, DropdownModule, FieldsetModule, InputNumberModule, InputTextareaModule, RadioButtonModule, TabViewModule } from 'primeng';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FEComboConstantService } from 'src/app/common/common-services/fe.combo.constants.service';
import { AngularResizedEventModule } from 'angular-resize-event';
import { TooltipModule } from 'primeng/tooltip';
import { SplitButtonModule } from 'primeng/splitbutton';
import { GlComboConstantService } from 'src/app/pg-resource/constants/combo.constants.service';
import { CarouselModule } from 'primeng/carousel';
import { PipeModule } from 'src/app/base/pipe/pipe.module';
import { ComboConstantsService } from 'src/app/pg-resource/master/common/combo-constants/combo.constants.service';
import { DaftarBukuService } from 'src/app/pg-resource/master/daftarbuku/daftarbuku.service';
import { DaftarBukuBrowseComponent } from './browse/daftarbuku-browse.component';
import { DaftarbukuInputComponent } from './input/daftarbuku-input.component';
import { CustomerRoutingModule } from './daftarbuku.routing';
import { DiskonService } from 'src/app/pg-resource/master/diskon/diskon.service';

@NgModule({
  declarations: [
    DaftarBukuBrowseComponent,
    DaftarbukuInputComponent,
  ],  entryComponents: [
  ],  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    AccordionModule,
    TableModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    CustomerRoutingModule,
    RadioButtonModule,
    TabViewModule,
    DropdownModule,
    InputNumberModule,
    CheckboxModule,
    InputTextareaModule,
    CardModule,
    AutoCompleteModule,
    AngularResizedEventModule,
    TooltipModule,
    SplitButtonModule,
    CarouselModule,
    PipeModule,
    FieldsetModule,
  ],
  exports: [
    DaftarbukuInputComponent,
  ],
  providers: [
    // TranslateMessageService,
    GlComboConstantService,
    FEComboConstantService,
    DaftarBukuService,
    DiskonService,
    ComboConstantsService,
    DialogService,
  ]})
export class DaftarbukuModule { }
