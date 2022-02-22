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
import { DaftarBuku } from 'src/app/pg-resource/master/daftarbuku/model/daftarbuku.model';
import { DaftarBukuService } from 'src/app/pg-resource/master/daftarbuku/daftarbuku.service';
import { Diskon } from 'src/app/pg-resource/master/diskon/model/diskon.model';
import { DiskonService } from 'src/app/pg-resource/master/diskon/diskon.service';
import { StdResponse } from 'src/app/common/common-model/standar-api-response.model';

@Component({
  selector: 'app-daftarbuku-input',
  templateUrl: './daftarbuku-input.component.html',
  styleUrls: ['./daftarbuku-input.component.scss'],
  providers: [DialogService],
  encapsulation : ViewEncapsulation.None
})

export class DaftarbukuInputComponent implements OnInit, OnDestroy, AfterViewChecked {

  public tab1Index = 0;
  public firstSearch = 0;
  public pagingSearch: StdPagingRequest = null;
  public searchParamsSearch: any;
  public sortSearch: any;

  private ngUnsubscribe: Subject<boolean> = new Subject();

  public title = 'DaftarBukuInput';

  public inputForm: FormGroup;

  public radioButtonAktif: any[];

  public mode: string;

  public selectedData: DaftarBuku = null;

  // width dari dataTables (untuk kemudian di set di bawah (di onDivDataTableResized) secara dinamis)
  public dataTablesWidth = '0px';

  // untuk enable/disable button-button
  public isViewOnly = false;

  // url asal yang membuka layar ini
  public previousUrl = '';

  comboStatus: object[];

  constructor(
    private fb: FormBuilder,
    private appAlertService: AppAlertService,
    private confirmationService: ConfirmationService,
    private uiBlockService: UiBlockService,
    private translateService: TranslateService,
    private daftarBukuService: DaftarBukuService,
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
    private diskonService: DiskonService,
  ) {
  }

  public ngOnInit() {
    this.breadCrumbService.sendReloadInfo('reload');
    this.initInputForm();
    this.initRadioButtonAktif();
    this.initComboStatus();
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
      kodeBuku: [{value: '', disabled: this.isViewOnly}, Validators.required],
      namaBuku: [{value: '', disabled: this.isViewOnly}, Validators.required],
      dataGenre: [{value: new Diskon, disabled: this.isViewOnly}, Validators.required],
      hargaBuku: [{value: 0, disabled: this.isViewOnly}, Validators.required],
      stockBuku: [{value: 0, disabled: this.isViewOnly}, Validators.required],
      active: [{value: '', disabled: this.isViewOnly}],
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

        this.inputForm.controls.active.patchValue(this.radioButtonAktif[0].key);  

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
        kodeBuku: (this.selectedData.kodeBuku == null ? '' : this.selectedData.kodeBuku),
        namaBuku: (this.selectedData.namaBuku == null ? '' : this.selectedData.namaBuku),
        dataGenre: (this.selectedData.dataGenre == null ? '' : this.selectedData.dataGenre),
        hargaBuku: (this.selectedData.hargaBuku == null ? 0 : this.selectedData.hargaBuku),
        stockBuku: (this.selectedData.stockBuku == null ? 0 : this.selectedData.stockBuku),
        active: (this.selectedData.active == null ? false : this.selectedData.active),
      });
    }
  }

  public doGet(data: DaftarBuku) {
    this.uiBlockService.showUiBlock();

    this.daftarBukuService.get(data)
    .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (result) => {
        this.uiBlockService.hideUiBlock();

        // set ke mode edit, dan set data dari hasil balikan
        this.mode = 'edit';
        const sessionData = { data: result.data, mode: 'edit', prevTabName: '', prevTab: 0, tableFirst: 0, tableNumberOfRows: 0 };
        SessionHelper.setItem('MDAFTARBUKU-H', sessionData, this.lzStringService);

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

  private fillModel(mode: String) {

    this.selectedData.kodeBuku = this.inputForm.controls.kodeBuku.value;
    this.selectedData.namaBuku = this.inputForm.controls.namaBuku.value;
    if (mode == 'save') {
      let newGenre = new Diskon();
      newGenre.id = this.inputForm.controls.dataGenre.value;
      this.selectedData.dataGenre = newGenre;
    } else {
      this.selectedData.dataGenre = this.inputForm.controls.dataGenre.value;
    }
    this.selectedData.hargaBuku = this.inputForm.controls.hargaBuku.value;
    this.selectedData.stockBuku = this.inputForm.controls.stockBuku.value;
    if (this.inputForm.controls.active.value == 'Y') {
      this.selectedData.active = true;
    } else {
      this.selectedData.active = false;
    }
    // this.selectedData.active = this.inputForm.controls.active.value;
  }

  public doSaveSave() {
    this.uiBlockService.showUiBlock();

    this.fillModel('save');

    const newObject = this.selectedData;

    this.daftarBukuService
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

    this.fillModel('edit');

    const editedObject = this.selectedData;

    this.daftarBukuService
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

  public Save() {
    // if (this.valDataBillTerisiSalahSatuSaja()) {
      if (this.mode === 'add') {
        this.doSaveSave();
      } else {
        this.doEditSave();
      }    
    // }
  }

  private doDeleteDelete() {
    this.uiBlockService.showUiBlock();
    this.daftarBukuService
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
          const transaksiJurnalComplete = new DaftarBuku();
    
          const sessionData = { data: transaksiJurnalComplete, mode: 'add', prevTabName: '', prevTab: 0, tableFirst: 0, tableNumberOfRows: 0 };
          SessionHelper.setItem('MDAFTARBUKU-H', sessionData, this.lzStringService);
      
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

    if (this.previousUrl === '/master/daftarBuku') {
      const sessionData = SessionHelper.getItem('MDAFTARBUKU-BROWSE-SCR', this.lzStringService);

      // agar layar sebelumnya tahu bahwa ada aksi kembali dari detail
      // ini untuk membedakan antara layar sebelumnya dibuka via menu dan dibuka via back dari detail
      sessionData.fromDetail = true; 
      SessionHelper.setItem('MDAFTARBUKU-BROWSE-SCR', sessionData, this.lzStringService);
  
      this.router.navigate(['../../../'], { relativeTo: this.route });  
    } else {
      this.router.navigate([this.previousUrl]);
    }
  }

  private dataBridging() {

    const sessionData = SessionHelper.getItem('MDAFTARBUKU-H', this.lzStringService);
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

  private initComboStatus() {
    this.uiBlockService.showUiBlock();

    const searchParams = {
      rectyp: 'INVSTAT',
    };
    const sort: any = {
      rectxt: 'asc',
    };

    this.diskonService
      .search()
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .toPromise()
      .then(
        (result: StdResponse<Diskon[]>) => {
          this.uiBlockService.hideUiBlock();

          this.comboStatus = result.data.map(
            item => new Object({label: item.namaGenre, value: item.id })
          );
          this.comboStatus.push(new Object({label: '', value: '' }));
  
        },
        (error) => {
          this.uiBlockService.hideUiBlock();
        },
      );
  }


}
