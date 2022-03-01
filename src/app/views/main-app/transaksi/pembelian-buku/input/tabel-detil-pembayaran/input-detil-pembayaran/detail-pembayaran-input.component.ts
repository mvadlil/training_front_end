import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject} from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Location } from '@angular/common';

import { ConfirmationService } from 'primeng/api';
import { UiBlockService } from 'src/app/common/common-services/ui-block.service';
import { AppAlertService } from 'src/app/common/common-components/alert/app-alert.service';
import { StdResponse } from 'src/app/common/common-model/standar-api-response.model';
import { DefaultLanguageState } from 'src/app/base/default-language/default-language.state';
import { InvoiceDetailLainLain } from 'src/app/pg-resource/transaksi/invoice/model/invoice-detail-lainlain.model';
import { DaftarBuku } from 'src/app/pg-resource/master/daftarbuku/model/daftarbuku.model';
import { DaftarBukuService } from 'src/app/pg-resource/master/daftarbuku/daftarbuku.service';
import { DialogService, SplitButton } from 'primeng';
import { InfoCustomerComponent } from 'src/app/views/main-app/info/customer/info.customer.component';
import { DetailPembayaran } from 'src/app/pg-resource/transaksi/invoice/model/detail-pembayaran.model';

@Component({
  selector: 'app-input-detail-pembayaran',
  templateUrl: './detail-pembayaran-input.component.html',
  encapsulation : ViewEncapsulation.None
})

export class DetailPembayaranInputComponent implements OnInit, OnDestroy {

  bsModalInfoCustomer: DynamicDialogRef;

  private ngUnsubscribe: Subject<boolean> = new Subject();

  public title = 'DetailPembayaran';

  public inputForm: FormGroup;

  public selectedData: DetailPembayaran;
  public mode: string;

  public filteredTraining: any[];

  public jenisPembayaran: any = [
    {value:'Tunai', label:'Tunai'},
    {value:'Point', label:'Point'},
    {value:'Kas Titipan', label:'Kas Titipan'},
    {value:'Transfer', label:'Transfer'},
  ];

  // terkait autocomplete
  public filteredBuku: any[];

  constructor(
    private fb: FormBuilder,
    private appAlertService: AppAlertService,
    private confirmationService: ConfirmationService,
    private uiBlockService: UiBlockService,
    private translateService: TranslateService,
    public defaultLanguageState: DefaultLanguageState,
    private bsModalRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private dialogService: DialogService,
  ) {
    this.translateService.get(this.title)
      .subscribe((translation) => {
        this.title = translation;
        this.config.header = this.title;
      }
    );

  }

  public ngOnInit() {
    this.selectedData = this.config.data.selectedData;
    this.mode = this.config.data.mode;
    this.initInputForm();
    this.patchValue();

   this.initCombo();
   
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  private initInputForm() {
    this.inputForm = this.fb.group({
      nourut: [{value: 0, disabled: true}, Validators.required],
      jenisPembayaran: [{value: '', disabled: false}, Validators.required],
      nilaiRupiah: [{value: 0, disabled: false}],
      nilaiPoint: [{value: 0, disabled: false}],
    });
  }

  private patchValue() {
    if (this.selectedData) {
      this.inputForm.patchValue({
        nourut: (this.selectedData.nourut == null ? '0' : this.selectedData.nourut),
        jenisPembayaran: (this.selectedData.jenisPembayaran == null ? '' : this.selectedData.jenisPembayaran),
        nilaiRupiah: (this.selectedData.nilaiRupiah == null ? 0 : this.selectedData.nilaiRupiah),
        nilaiPoint: (this.selectedData.nilaiPoint == null ? 0 : this.selectedData.nilaiPoint),
      });
    }
  }

  private fillModel() {
    this.selectedData.nourut = this.inputForm.controls.nourut.value;
    this.selectedData.jenisPembayaran = this.inputForm.controls.jenisPembayaran.value;
    this.selectedData.nilaiRupiah = this.inputForm.controls.nilaiRupiah.value;
    this.selectedData.nilaiPoint = this.inputForm.controls.nilaiPoint.value;
  }


  public initCombo(){
    this.jenisPembayaran.push( 
      {value:'', label:''},
      );
  }

  public doSave() {
    this.uiBlockService.showUiBlock();

    this.selectedData = new DetailPembayaran();
    
    this.fillModel();

    this.uiBlockService.hideUiBlock();
    this.bsModalRef.close({selectedData: this.selectedData, mode: this.mode});
  }

  public doEdit() {
    this.uiBlockService.showUiBlock();

    this.fillModel();

    this.uiBlockService.hideUiBlock();
    this.bsModalRef.close({selectedData: this.selectedData, mode: this.mode});
  }

  public Save1() {
    if (this.mode === 'add') {
      this.doSave();
    } else {
      this.doEdit();
    }
  }

  public backBack1() {
    this.bsModalRef.close({selectedData: null, mode: this.mode});
  }


}
