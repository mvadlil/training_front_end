import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject} from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ConfirmationService } from 'primeng/api';
import { UiBlockService } from 'src/app/common/common-services/ui-block.service';
import { StdPagingRequest } from 'src/app/common/common-model/standar-api-request.model';
import { AppAlertService } from 'src/app/common/common-components/alert/app-alert.service';

import { DialogService } from 'primeng';
import { ResizedEvent } from 'angular-resize-event';
import { SessionHelper } from 'src/app/helper/session-helper';
import { LZStringService } from 'ng-lz-string';
import { DomSanitizer } from '@angular/platform-browser';
import { BreadCrumbService } from 'src/app/common/common-components/breadcrumb/breadcrumb.service';
import { DefaultLanguageState } from 'src/app/base/default-language/default-language.state';
import { TranslateMessageService } from 'src/app/common/common-services/translate.message.service';
import { ComboConstantsService } from 'src/app/pg-resource/master/common/combo-constants/combo.constants.service';
import { FEComboConstantService } from 'src/app/common/common-services/fe.combo.constants.service';
import { Customer } from 'src/app/pg-resource/master/customer/model/customer.model';
import { CustomerService } from 'src/app/pg-resource/master/customer/customer.service';
import { MembershipService } from 'src/app/pg-resource/master/membership/membership.service';
import { Membership } from 'src/app/pg-resource/master/membership/model/membership.model';

@Component({
  selector: 'app-membership-input',
  templateUrl: './membership-input.component.html',
  styleUrls: ['./membership-input.component.scss'],
  providers: [DialogService],
  encapsulation : ViewEncapsulation.None
})

export class MembershipInputComponent implements OnInit, OnDestroy, AfterViewChecked {

  public tab1Index = 0;
  public firstSearch = 0;
  public pagingSearch: StdPagingRequest = null;
  public searchParamsSearch: any;
  public sortSearch: any;

  private ngUnsubscribe: Subject<boolean> = new Subject();

  public title = 'MembershipCustomerInput';

  public inputForm: FormGroup;

  public radioButtonAktif: any[];
  public radioButtonFlmainva: any[];

  public mode: string;

  public selectedData: Membership = null;

  // width dari dataTables (untuk kemudian di set di bawah (di onDivDataTableResized) secara dinamis)
  public dataTablesWidth = '0px';

  // untuk enable/disable button-button
  public isViewOnly = false;

  // url asal yang membuka layar ini
  public previousUrl = '';

  constructor(
    private fb: FormBuilder,
    private appAlertService: AppAlertService,
    private confirmationService: ConfirmationService,
    private uiBlockService: UiBlockService,
    private translateService: TranslateService,
    private customerService: CustomerService,
    private membershipService: MembershipService,
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private lzStringService: LZStringService,
    private domSanitizer: DomSanitizer,
    private breadCrumbService: BreadCrumbService,
    public defaultLanguageState: DefaultLanguageState,
    private cdRef: ChangeDetectorRef,
    private translateMessageService: TranslateMessageService,
    private comboConstantsService: ComboConstantsService,
    private feComboConstantService: FEComboConstantService,
  ) {
  }

  public ngOnInit() {
    this.breadCrumbService.sendReloadInfo('reload');
    this.initInputForm();

    this.dataBridging();

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  private initInputForm() {
    this.inputForm = this.fb.group({
      namaMembership: [{value: '', disabled: this.isViewOnly}, Validators.required],
      kodeMembership: [{value: '', disabled: this.isViewOnly}],
    });
  }

  public initRadioButtonAktif() {

    this.uiBlockService.showUiBlock();
    this.feComboConstantService
    .getAktifNonAktif()
    .pipe(
      takeUntil(this.ngUnsubscribe)
    )
    .subscribe(
      (result) => {
        this.uiBlockService.hideUiBlock();

        this.radioButtonAktif = result.data.map(
            item => new Object({name: item.deskripsi, key: item.kode })
          );

        this.inputForm.controls.flakt.patchValue(this.radioButtonAktif[0].key);  

      },
      (error) => {
        this.uiBlockService.hideUiBlock();
      },
      () => {
        this.uiBlockService.hideUiBlock();
      }
    );
  }

  public initRadioButtonFlmainva() {

    this.uiBlockService.showUiBlock();
    this.feComboConstantService
    .getYaTidak()
    .pipe(
      takeUntil(this.ngUnsubscribe)
    )
    .subscribe(
      (result) => {
        this.uiBlockService.hideUiBlock();

        this.radioButtonFlmainva = result.data.map(
            item => new Object({name: item.deskripsi, key: item.kode })
          );

        this.inputForm.controls.flmainva.patchValue(this.radioButtonFlmainva[0].key);  

      },
      (error) => {
        this.uiBlockService.hideUiBlock();
      },
      () => {
        this.uiBlockService.hideUiBlock();
      }
    );
  }

  private patchValue() {
    if (this.selectedData) {

      this.inputForm.patchValue({
        namaMembership: (this.selectedData.namaMembership == null ? '' : this.selectedData.namaMembership),
        kodeMembership: (this.selectedData.kodeMembership == null ? '' : this.selectedData.kodeMembership),
      });
    }
  }

  public doGet(data: Membership) {
    this.uiBlockService.showUiBlock();

    this.membershipService.get(data)
    .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (result) => {
        this.uiBlockService.hideUiBlock();

        // set ke mode edit, dan set data dari hasil balikan
        this.mode = 'edit';
        const sessionData = { data: result.data, mode: 'edit', prevTabName: '', prevTab: 0, tableFirst: 0, tableNumberOfRows: 0 };
        SessionHelper.setItem('MCUSTOMER-H', sessionData, this.lzStringService);

        this.selectedData = sessionData.data;
        
        this.patchValue();

        // this.inputForm.controls.nama.disable();

      },
      (error) => {
        this.uiBlockService.hideUiBlock();
        this.appAlertService.error(error.errors);
      },
    );
 }

  private fillModel() {

    this.selectedData.namaMembership = this.inputForm.controls.namaMembership.value;
    this.selectedData.kodeMembership = this.inputForm.controls.kodeMembership.value;

  }

  public doSaveSave() {
    // this.uiBlockService.showUiBlock();

    this.fillModel();

    const newObject = new Membership();
    newObject.namaMembership = this.inputForm.controls.namaMembership.value;
    newObject.kodeMembership = this.inputForm.controls.kodeMembership.value;

    this.membershipService
    .add(newObject)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      (result) => {
        this.uiBlockService.hideUiBlock();

        this.translateService.get('TambahBerhasil')
          .subscribe((translation) => {
            this.appAlertService.instantInfo(translation);
          }
        );

        this.doGet(result);

      },
      (error) => {
        this.uiBlockService.hideUiBlock();
        this.appAlertService.error(error.errors);

      },
    );
  }

  public doEditSave() {
    this.uiBlockService.showUiBlock();

    this.fillModel();

    const editedObject = this.selectedData;

    this.membershipService
    .edit(editedObject)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      (result) => {
        this.uiBlockService.hideUiBlock();

        this.translateService.get('EditBerhasil')
          .subscribe((translation) => {
            this.appAlertService.instantInfo(translation);
          }
        );

        this.doGet(result);

      },
      (error) => {
        this.uiBlockService.hideUiBlock();
        this.appAlertService.error(error.errors);

      },
    );
  }

  private displayInstantError(errorCode: string) {
    const errorMsg = {
      code: errorCode,
      desc: '',
      // args: [ this.datePipe.transform(param.tglawal,'dd/MM/yyyy'),
      //         this.datePipe.transform(param.tglakhir,'dd/MM/yyyy'),
      //       ],
      args: [],
    };

    errorMsg.desc = this.translateMessageService.translateGeneralMessage(errorMsg);
    this.appAlertService.error(errorMsg); 
  }

  private valDataBillTerisiSalahSatuSaja(): boolean {
    let result = true;

    let milikSendiri = this.inputForm.controls.billnama.value +
                       this.inputForm.controls.billrole.value +
                       this.inputForm.controls.billnumber.value +
                       this.inputForm.controls.billemail.value +
                       this.inputForm.controls.billalamat.value;

    let pihakKetiga = this.inputForm.controls.billnama2.value +
                       this.inputForm.controls.billrole2.value +
                       this.inputForm.controls.billnumber2.value +
                       this.inputForm.controls.billemail2.value +
                       this.inputForm.controls.billalamat2.value;
                       
    if (milikSendiri !== '' && pihakKetiga != '') {
      this.displayInstantError('error.customer.fe.0001');
      result = false;
    }

    return result;
  }

  public Save() {
    // if (this.valDataBillTerisiSalahSatuSaja()) {
      console.log(this.mode)
      if (this.mode === 'add') {
        this.doSaveSave();
      } else {
        this.doEditSave();
      }    
    // }
  }

  private doDeleteDelete() {
    this.uiBlockService.showUiBlock();
    this.membershipService
      .delete(this.selectedData)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (result) => {
          this.inputForm.reset();
          this.selectedData = null;

          this.uiBlockService.hideUiBlock();
          this.translateService.get('HapusBerhasil')
            .subscribe((translation) => {
              this.appAlertService.instantInfo(translation);
            }
          );

          // Bersihkan session storage dan ubah ke mode add
          const transaksiJurnalComplete = new Membership();
    
          const sessionData = { data: transaksiJurnalComplete, mode: 'add', prevTabName: '', prevTab: 0, tableFirst: 0, tableNumberOfRows: 0 };
          SessionHelper.setItem('MCUSTOMER-H', sessionData, this.lzStringService);
      
          this.mode = 'add';
          // this.initInputForm();
          this.inputForm.controls.nama.enable();

          this.selectedData = sessionData.data;
          // ===============================================
        },
        (error: any) => {
          this.appAlertService.error(error.errors);
        },
          () => { this.uiBlockService.hideUiBlock(); }
      );
  }

  public delete() {
    this.translateService.get('HapusTransaksiNomor')
      .subscribe((translation) => {

      this.confirmationService.confirm({
        message: translation + this.inputForm.controls.nama.value + ' ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
              this.doDeleteDelete();
        },
        reject: () => {
        }
      });

      }
    );
  }

  // Dipanggil saat terjadi resize terhadap div yang menampung data table, agar width dari data table
  // dapat di set
  onDivDataTableResized(event: ResizedEvent) {
    const width = event.newWidth - 52; // 14 ini padding kiri kanan dari area content
    this.dataTablesWidth = width + 'px';
  }

  public back() {

    if (this.previousUrl === '/master/customer') {
      const sessionData = SessionHelper.getItem('MCUSTOMER-BROWSE-SCR', this.lzStringService);

      // agar layar sebelumnya tahu bahwa ada aksi kembali dari detail
      // ini untuk membedakan antara layar sebelumnya dibuka via menu dan dibuka via back dari detail
      sessionData.fromDetail = true; 
      SessionHelper.setItem('MCUSTOMER-BROWSE-SCR', sessionData, this.lzStringService);
  
      this.router.navigate(['../../../'], { relativeTo: this.route });  
    } else {
      this.router.navigate([this.previousUrl]);
    }
  }

  private dataBridging() {

    const sessionData = SessionHelper.getItem('MMEMBERSHIP-H', this.lzStringService);
    this.previousUrl = sessionData.urlAsal;

    if (sessionData.mode === 'edit') {
      this.selectedData = sessionData.data;
      this.mode = 'edit';
      this.initInputForm();

    } else {
      this.selectedData = sessionData.data;
      this.mode = 'add';

    }

    this.patchValue();

    if (sessionData.prevTabName === 'tab1Index') {
      if (sessionData.prevTab !== undefined && sessionData.prevTab > 0) {
        this.tab1Index = sessionData.prevTab - 1;
      }
    }
  }

}
