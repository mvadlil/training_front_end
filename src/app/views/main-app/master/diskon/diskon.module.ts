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
import { DiskonService } from 'src/app/pg-resource/master/diskon/diskon.service';
import { DiskonBrowseComponent } from './browse/diskon-browse.component';
import { DiskonInputComponent } from './input/diskon-input.component';
import { DiskonRoutingModule } from './diskon.routing';

@NgModule({
  declarations: [
    DiskonBrowseComponent,
    DiskonInputComponent,
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
    DiskonRoutingModule,
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
    DiskonInputComponent,
  ],
  providers: [
    // TranslateMessageService,
    GlComboConstantService,
    FEComboConstantService,
    DiskonService,
    ComboConstantsService,
    DialogService,
  ]})
export class DiskonModule { }
