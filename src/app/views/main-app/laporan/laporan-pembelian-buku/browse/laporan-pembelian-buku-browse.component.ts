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
import { Customer } from 'src/app/pg-resource/master/customer/model/customer.model';
import { Membership } from 'src/app/pg-resource/master/membership/model/membership.model';
import { MembershipService } from 'src/app/pg-resource/master/membership/membership.service';
import { LaporanPenjualanBukuService } from 'src/app/pg-resource/laporan/laporan-penjualan-buku.service';
import { LaporanPenjualanBuku } from 'src/app/pg-resource/laporan/model/laporan-penjualan-buku.model';

@Component({
  selector: 'app-laporan-pembelian-buku-browse',
  templateUrl: './laporan-pembelian-buku-browse.component.html',
  providers: [DialogService],
  encapsulation : ViewEncapsulation.None
})

export class LaporanPembelianBrowseComponent implements OnInit, OnDestroy, AfterViewChecked {

  private ngUnsubscribe: Subject<boolean> = new Subject();

  public title = 'LaporanPembelianBuku';

  public userForm: FormGroup;

  bsModalSelectTemplate: DynamicDialogRef;

  public radioButtonStatusKonfirmasi: any[];

  public dataTables: LaporanPenjualanBuku[] = [];
  public numberOfRowsDataTables = 5;
  public isLoadingResultsDataTables = false;
  public totalRecordsDataTables = 0;
  public colsUserDataTables: any[];

  public pagingSearch: StdPagingRequest = null;
  public firstSearch = 0;
  public searchParamsSearch: any;
  public sortSearch: any;

  // width dari dataTables (untuk kemudian di set di bawah (di onDivDataTableResized) secara dinamis)
  public dataTablesWidth = '0px';

  public radioButtonAktif: any[];

  constructor(
    private fb: FormBuilder,
    private appAlertService: AppAlertService,
    private confirmationService: ConfirmationService,
    private uiBlockService: UiBlockService,
    private translateService: TranslateService,
    private laporanPenjualanBukuService: LaporanPenjualanBukuService,
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
      bulan: 'asc'
    };
    this.searchParamsSearch = {
      bulan: null
    };
  }

  public ngOnInit() {
    this.breadCrumbService.sendReloadInfo('reload');
    this.initUserForm();
    this.initColsUserDataTables();
    this.dataBridging();
    this.search();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  private initUserForm() {

    this.userForm = this.fb.group({
      bulan: [''],
      totalQtyPenjulanBuku: [''],
      totalNominalPenjulanBuku: ['']
    });

    let bulan = null;
    let totalQtyPenjulanBuku = null;

    if (this.userForm.value.bulan) {
      bulan = this.userForm.value.bulan;
    }

    if (this.userForm.value.totalQtyPenjulanBuku) {
      totalQtyPenjulanBuku = this.userForm.value.totalQtyPenjulanBuku;
    }

    this.searchParamsSearch = {
      bulan: bulan,
      totalQtyPenjulanBuku: totalQtyPenjulanBuku,
    };

  }

  public search() {

    this.isLoadingResultsDataTables = false;
    this.uiBlockService.showUiBlock();

    let bulan = null;

    if (this.userForm.value.bulan) {
      bulan = this.userForm.value.bulan;
    }

    this.searchParamsSearch = {
      bulan: bulan,
    };

    this.laporanPenjualanBukuService
    .search(
      this.searchParamsSearch, 
      this.sortSearch, 
      this.pagingSearch
      )
    .pipe(
      takeUntil(this.ngUnsubscribe)
    )
    .subscribe(
      (result: StdResponse<LaporanPenjualanBuku[]>) => {
        this.isLoadingResultsDataTables = false;
        this.uiBlockService.hideUiBlock();
        this.dataTables = result.data;
        this.totalRecordsDataTables = result.meta.pagination.dataCount;
        // this.totalRecordsDataTables = result.data.length;

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

      pagination.searchParams = this.searchParamsSearch;

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
      this.laporanPenjualanBukuService
      .search(pagination.searchParams, pagination.sorts, pagination.paging)
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (result: StdResponse<LaporanPenjualanBuku[]>) => {
          this.isLoadingResultsDataTables = false;
          this.uiBlockService.hideUiBlock();
          this.dataTables = result.data;
          this.totalRecordsDataTables = result.meta.pagination.dataCount;
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
  }

  public refreshDataDataTables() {
    this.search();
  }

  public initColsUserDataTables() {
    this.colsUserDataTables = [
      { field: 'bulan', header: 'Bulan', rtl: false, type: 'string', width: '150px' },
      { field: 'totalQtyPenjulanBuku', header: 'TotalQtyPenjulanBuku', rtl: false, type: 'string', width: '250px' },
      { field: 'totalNominalPenjulanBuku', header: 'TotalNominalPenjulanBuku', rtl: false, type: 'string', width: '250px' },
    ];
  }

 

 

  onDivDataTableResized(event: ResizedEvent) {
    const width = event.newWidth - 52; // 14 ini padding kiri kanan dari area content
    this.dataTablesWidth = width + 'px';
  }

  private dataBridging() {

    const browseScreenData = SessionHelper.getItem('MMEMBERSHIP-BROWSE-SCR', this.lzStringService);

    if (!ObjectHelper.isEmpty(browseScreenData)) {

      if (browseScreenData.fromDetail) {

        // karena layar ini dapat dipanggil dari program lain, maka harus diperiksa
        // bila ini dari program lain, maka isi filter diisi default semua
    
        this.userForm.patchValue({
          namaMembership: browseScreenData.namaMembership ? browseScreenData.namaMembership: '',
          kodeMembership: browseScreenData.kodeMembership ? browseScreenData.kodeMembership: '',
        });
  
        if (browseScreenData.firstSearch) {
          this.firstSearch = browseScreenData.firstSearch;
        }

        this.searchParamsSearch = {
          namaMembership: this.userForm.controls.namaMembership.value,
          kodeMembership: this.userForm.controls.kodeMembership.value,
        };
            
      }

      SessionHelper.destroy('MMEMBERSHIP-BROWSE-SCR');

    }
  }

  

 

}
