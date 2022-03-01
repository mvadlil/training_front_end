import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Subject } from 'rxjs';
import { isEmpty, takeUntil } from 'rxjs/operators';
import { AppAlertService } from 'src/app/common/common-components/alert/app-alert.service';
import { StdPagingRequest } from 'src/app/common/common-model/standar-api-request.model';
import { StdResponse } from 'src/app/common/common-model/standar-api-response.model';
import { FEComboConstantService } from 'src/app/common/common-services/fe.combo.constants.service';
import { UiBlockService } from 'src/app/common/common-services/ui-block.service';
import { PagingHelper } from 'src/app/helper/paging-helper';
import { SessionHelper } from 'src/app/helper/session-helper';
import { LZStringService } from 'ng-lz-string';
import { ResizedEvent } from 'angular-resize-event';
import { BreadCrumbService } from 'src/app/common/common-components/breadcrumb/breadcrumb.service';
import { DefaultLanguageState } from 'src/app/base/default-language/default-language.state';
import { ObjectHelper } from 'src/app/helper/object-helper';
import { DialogService, DynamicDialogRef } from 'primeng';
import { v4 as uuidv4 } from 'uuid';
import { ComboConstantsService } from 'src/app/pg-resource/master/common/combo-constants/combo.constants.service';
import { ComboConstants } from 'src/app/pg-resource/master/common/combo-constants/model/combo.constants.model';
import { InvoiceHeader } from 'src/app/pg-resource/transaksi/invoice/model/invoice-header.model';
import { InvoiceManualService } from 'src/app/pg-resource/transaksi/invoice/invoice-manual.service';
import { InvoiceManualComplete } from 'src/app/pg-resource/transaksi/invoice/model/invoice-manual-complete.model';

import { PembelianBukuService, PembelianBukuSorts, PembelianBukuSearchParams} from 'src/app/pg-resource/transaksi/pembelian-buku/pembelian-buku.service';
import { PembelianBukuBrowseModel } from 'src/app/pg-resource/transaksi/pembelian-buku/model/pembelian-buku-browse.model'


@Component({
  selector: 'app-pembelian-buku-browse',
  templateUrl: './pembelian-buku-browse.component.html',
  providers: [DialogService],
  encapsulation : ViewEncapsulation.None
})

export class PembelianBukuBrowseComponent implements OnInit, OnDestroy, AfterViewChecked {

  private ngUnsubscribe: Subject<boolean> = new Subject();

  public title = 'PembelianBuku';

  public inputForm: FormGroup;

  public dataTables: PembelianBukuBrowseModel[] = [];
  public numberOfRowsDataTables = 5;
  public isLoadingResultsDataTables = false;
  public totalRecordsDataTables = 0;
  public column: any[];

  public pagingSearch: StdPagingRequest = null;
  public firstSearch = 0;
  public paramsSearch: PembelianBukuSearchParams;
  public sortSearch: PembelianBukuSorts = null;

  // width dari dataTables (untuk kemudian di set di bawah (di onDivDataTableResized) secara dinamis)
  public dataTablesWidth = '0px';

  public radioButtonDeposit: any[];
  comboStatus: object[];

  constructor(
    private fb: FormBuilder,
    private appAlertService: AppAlertService,
    private confirmationService: ConfirmationService,
    private uiBlockService: UiBlockService,
    private translateService: TranslateService,
    private invoiceManualService: InvoiceManualService,
    private pembelianBukuService: PembelianBukuService,
    private feComboConstantService: FEComboConstantService,
    private comboConstantsService: ComboConstantsService,
    private route: ActivatedRoute,
    private router: Router,
    private lzStringService: LZStringService,
    private cdRef: ChangeDetectorRef,
    private breadCrumbService: BreadCrumbService,
    public defaultLanguageState: DefaultLanguageState,
    private dialogService: DialogService,
  ) {
    this.pagingSearch = {
      page: 1,
      perPage: this.numberOfRowsDataTables
    };
    this.sortSearch = {
      nomorBon: 'asc',
      // tgtrn: 'asc',
      // nama: 'asc',
      // status: 'asc',
      // dpp: 'asc',
      // ppn: 'asc',
    };
    this.paramsSearch = {
      // nomor: null,
      // nama: null,
      // status: null,
      // fltodep: null,
    };
  }

  public ngOnInit() {
    this.breadCrumbService.sendReloadInfo('reload');
    this.initinputForm();
    this.initRadioButtonDeposit();
    this.dataBridging();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  private initinputForm() {

    this.inputForm = this.fb.group({
      nomorBon: [''],
      tanggalAwal: [''],
      tanggalAkhir: [''],
    });

    this.paramsSearch = {
      // nomor: this.inputForm.controls.nomor.value,
      // nama: this.inputForm.controls.nama.value,
      // status: this.inputForm.controls.status.value,
      // fltodep: this.inputForm.controls.fltodep.value,
    };

  }

  public initRadioButtonDeposit() {

    this.uiBlockService.showUiBlock();
    this.feComboConstantService
    .getFilterAktif()
    .pipe(
      takeUntil(this.ngUnsubscribe)
    )
    .subscribe(
      (result) => {
        this.uiBlockService.hideUiBlock();

        this.radioButtonDeposit = result.data.map(
            item => new Object({name: item.deskripsi, key: item.kode })
          );

      },
      (error) => {
        this.uiBlockService.hideUiBlock();
      },
      () => {
        this.uiBlockService.hideUiBlock();
      }
    );
  }


  public search() {

    this.isLoadingResultsDataTables = false;
    this.uiBlockService.showUiBlock();  

    if (this.inputForm.value.nomorBon) {
      this.paramsSearch.nomorBon = this.inputForm.value.nomorBon;
    }

    if (this.inputForm.value.tanggalAwal) {
      this.paramsSearch.tanggalAwal = this.inputForm.value.tanggalAwal;
    }

    if (this.inputForm.value.tanggalAkhir) {
      this.paramsSearch.tanggalAkhir = this.inputForm.value.tanggalAkhir;
    }


    this.pembelianBukuService
    .search(this.paramsSearch)
    .pipe(
      takeUntil(this.ngUnsubscribe)
    )
    .subscribe(
      (result: StdResponse<PembelianBukuBrowseModel[]>) => {
        this.isLoadingResultsDataTables = false;
        this.uiBlockService.hideUiBlock();
        this.dataTables = result.data;

        this.dataTables.forEach(element => {
          
        });

        console.log('dataTables ===>', this.dataTables);
        
        this.totalRecordsDataTables = result?.meta?.pagination?.dataCount;

      },
      (error) => {
        this.isLoadingResultsDataTables = false;
        this.uiBlockService.hideUiBlock();

        this.appAlertService.error(error.errors);
      },
      () => {
        this.isLoadingResultsDataTables = false;
        this.uiBlockService.hideUiBlock();
      }
    );
  }

  public doInstantFilterSearch(event?: any) {
    if (event) {
      const pagination = PagingHelper.getPaging(event);

      pagination.searchParams = this.paramsSearch;

      if (pagination.sorts === null) {
        pagination.sorts = this.sortSearch;
      } else {
        this.sortSearch = pagination.sorts;
      }

      if (pagination.paging === null) {
        pagination.paging = this.pagingSearch;
      } else {
        this.pagingSearch = pagination.paging;
      }
      this.firstSearch = event.first;

      this.isLoadingResultsDataTables = true;
      this.uiBlockService.showUiBlock();
      this.pembelianBukuService
      .search(pagination.searchParams, pagination.sorts, pagination.paging)
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (result: StdResponse<PembelianBukuBrowseModel[]>) => {
          this.isLoadingResultsDataTables = false;
          this.uiBlockService.hideUiBlock();
          this.dataTables = result.data;
          this.totalRecordsDataTables = result?.meta?.pagination?.dataCount;
        },
        (error) => {
          this.isLoadingResultsDataTables = false;
          this.uiBlockService.hideUiBlock();

          this.appAlertService.error(error.errors);
        },
        () => {
          this.uiBlockService.hideUiBlock();
        }
      );
    }
  }

  public refreshDataDataTables() {
    this.search();
  }

  public editDataTables(data: InvoiceHeader) {
    this.uiBlockService.showUiBlock();

    this.invoiceManualService.get(data)
    .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (result) => {
        this.uiBlockService.hideUiBlock();

        this.router.navigate(['./input'], { relativeTo: this.route });

        // simpan data transaksi yang dipilih untuk di edit ini ke session storage
        const trxScreenData = {
          data: result.data,
          mode: 'edit',
          prevTabName: '',
          prevTab: 0,
          tableFirst: 0,
          tableNumberOfRows: 0,
          urlAsal: this.router.url, // ini berisi : '/transaksi/invoice-manual'
        };
        SessionHelper.setItem('TINVMANUAL-H', trxScreenData, this.lzStringService);

        // simpan data layar browse saat ini agar nanti sewaktu kembali ke layar browse,
        // layar browse dapat menampilkan data yang sama sebelum ke layar transaksi      
        const browseScreenData = { 
          nomor: this.inputForm.controls.nomor.value,
          nama: this.inputForm.controls.nama.value,
          status: this.inputForm.controls.status.value,
          fltodep: this.inputForm.controls.fltodep.value,

          firstSearch: this.firstSearch,
          fromDetail: false };

        SessionHelper.setItem('TINVMANUAL-BROWSE-SCR', browseScreenData, this.lzStringService);

      },
      (error) => {
        this.uiBlockService.hideUiBlock();
        this.appAlertService.error(error.errors);
      },
    );
 }

  public addDataTables() {

    const transaksiJurnalComplete = new InvoiceManualComplete();
    transaksiJurnalComplete.header.status = 'NOSENT';
    transaksiJurnalComplete.header.fltodep = false;
    transaksiJurnalComplete.header.tgtrn = new Date();
    transaksiJurnalComplete.header.tgjtemp = new Date();
    
    const sessionData = {
      data: transaksiJurnalComplete,
      mode: 'add',
      prevTabName: '',
      prevTab: 0,
      tableFirst: 0,
      tableNumberOfRows: 0,
      urlAsal: this.router.url, // ini berisi : '/transaksi/invoice-manual'
    };
    SessionHelper.setItem('TINVMANUAL-H', sessionData, this.lzStringService);

    // simpan data layar browse saat ini agar nanti sewaktu kembali ke layar browse,
    // layar browse dapat menampilkan data yang sama sebelum ke layar transaksi      
    const browseScreenData = { 
      // nomorBon: this.inputForm.controls.nomorBon.value,
      // nama: this.inputForm.controls.nama.value,
      // status: this.inputForm.controls.status.value,
      // fltodep: this.inputForm.controls.fltodep.value,

      // firstSearch: this.firstSearch,
      // fromDetail: false 
    };

    SessionHelper.setItem('TINVMANUAL-BROWSE-SCR', browseScreenData, this.lzStringService);

    this.router.navigate(['./input'], { relativeTo: this.route });

  }

  onDivDataTableResized(event: ResizedEvent) {
    const width = event.newWidth - 52; // 14 ini padding kiri kanan dari area content
    this.dataTablesWidth = width + 'px';
  }

  private dataBridging() {

    const browseScreenData = SessionHelper.getItem('TINVMANUAL-BROWSE-SCR', this.lzStringService);

    if (!ObjectHelper.isEmpty(browseScreenData)) {

      if (browseScreenData.fromDetail) {

        // karena layar ini dapat dipanggil dari master jadwal perulangan, maka harus diperiksa
        // bila ini dari master jadwal perulangan, maka isi filter diisi default semua

        this.inputForm.patchValue({
          nomor: browseScreenData.nomor ? browseScreenData.nomor: '',
          nama: browseScreenData.nama ? browseScreenData.nama: '',
          status: browseScreenData.status ? browseScreenData.status: '',
          fltodep: browseScreenData.fltodep ? browseScreenData.fltodep : '',
        });
  
        if (browseScreenData.firstSearch) {
          this.firstSearch = browseScreenData.firstSearch;
        }

        this.paramsSearch = {
          // nomor: this.inputForm.controls.nomor.value,
          // nama: this.inputForm.controls.nama.value,
          // status: this.inputForm.controls.status.value,
          // fltodep: this.inputForm.controls.fltodep.value,
        };
    
      }

      SessionHelper.destroy('TINVMANUAL-BROWSE-SCR');

    }
  }

  private doDeleteDelete(data: InvoiceHeader) {
    this.uiBlockService.showUiBlock();
    this.invoiceManualService
      .delete(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (result) => {

          this.uiBlockService.hideUiBlock();
          this.translateService.get('HapusBerhasil')
            .subscribe((translation) => {
              this.appAlertService.instantInfo(translation);
            }
          );

          this.refreshDataDataTables();

        },
        (error: any) => {
          this.appAlertService.error(error.errors);
        },
          () => { this.uiBlockService.hideUiBlock(); }
      );
  }

  public delete(data: InvoiceHeader) {
    this.translateService.get('HapusData')
      .subscribe((translation) => {

      this.confirmationService.confirm({
        message: translation + ' ' + data.nomor + ' ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
              this.doDeleteDelete(data);
        },
        reject: () => {
        }
      });

      }
    );
  }

}
