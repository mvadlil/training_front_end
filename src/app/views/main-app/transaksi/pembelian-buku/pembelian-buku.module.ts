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
import { InvoiceManualRoutingModule } from './pembelian-buku.routing';
import { InvoiceManualService } from 'src/app/pg-resource/transaksi/invoice/invoice-manual.service';
import { PembelianBukuBrowseComponent } from './browse/pembelian-buku-browse.component';
import { PembelianBukuInputComponent } from './input/pembelian-buku-input.component';
import { TabelDetilLainLainComponent } from './input/tabel-detil-lain-lain/tabel-detil-lain-lain.component';
import { DetilLainLainInputComponent } from './input/tabel-detil-lain-lain/input-detil-lain-lain/detil-lain-lain-input.component';
import { CustomerService } from 'src/app/pg-resource/master/customer/customer.service';
import { TranslateMessageService } from 'src/app/common/common-services/translate.message.service';
import { ComboConstantsService } from 'src/app/pg-resource/master/common/combo-constants/combo.constants.service';
import { InfoCustomerComponent } from '../../info/customer/info.customer.component';
import { InfoCustomerModule } from '../../info/customer/info.customer.module';
import {InputSwitchModule} from 'primeng/inputswitch';
import { MembershipService } from 'src/app/pg-resource/master/membership/membership.service';
import { DaftarBukuService } from 'src/app/pg-resource/master/daftarbuku/daftarbuku.service';

@NgModule({
  declarations: [
    PembelianBukuBrowseComponent,
    PembelianBukuInputComponent,
    TabelDetilLainLainComponent,
    DetilLainLainInputComponent,
  ],
  entryComponents: [
    DetilLainLainInputComponent,
    InfoCustomerComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    AccordionModule,
    TableModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    InvoiceManualRoutingModule,
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
    InfoCustomerModule, 
    InputSwitchModule,
  ],
  exports: [
    PembelianBukuInputComponent,
  ],
  providers: [
    TranslateMessageService,
    CustomerService,
    GlComboConstantService,
    FEComboConstantService,
    ComboConstantsService,
    InvoiceManualService,
    DialogService,
    MembershipService,
    DaftarBukuService,
  ]})
export class PembelianBukuModule { }
