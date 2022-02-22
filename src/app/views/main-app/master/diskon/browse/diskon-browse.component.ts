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
import { Diskon } from 'src/app/pg-resource/master/diskon/model/diskon.model';
import { DiskonService } from 'src/app/pg-resource/master/diskon/diskon.service';

@Component({
  selector: 'app-customer-browse',
  templateUrl: './diskon-browse.component.html',
  providers: [DialogService],
  encapsulation : ViewEncapsulation.None
})

export class DiskonBrowseComponent implements OnInit, OnDestroy, AfterViewChecked {

  private ngUnsubscribe: Subject<boolean> = new Subject();

  public title = 'MasterDiskon';

  public userForm: FormGroup;

  bsModalSelectTemplate: DynamicDialogRef;

  public radioButtonStatusKonfirmasi: any[];

  public dataTables: Diskon[] = [];
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
    private diskonService: DiskonService,
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
      genreBuku: 'asc',
      diskonPerGenre: 'asc',
    };
    this.searchParamsSearch = {
      genreBuku: null,
      diskonPerGenre: null,
    };
  }

  public ngOnInit() {
    this.breadCrumbService.sendReloadInfo('reload');
    this.initUserForm();
    this.initColsUserDataTables();
    this.dataBridging();
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
      kodeGenre: [''],
      namaGenre: [''],
      diskonGenre: [0],
    });

    let kodeGenre = null;
    let namaGenre = null;
    let diskonGenre = null;

    if (this.userForm.value.kodeGenre) {
      kodeGenre = this.userForm.value.kodeGenre;
    }

    if (this.userForm.value.namaGenre) {
      namaGenre = this.userForm.value.namaGenre;
    }

    if (this.userForm.value.diskonGenre) {
      diskonGenre = this.userForm.value.diskonGenre;
    }

    this.searchParamsSearch = {
      kodeGenre: kodeGenre,
      namaGenre: namaGenre,
      diskonGenre: diskonGenre,
    };

  }

  public search() {

    this.isLoadingResultsDataTables = false;
    this.uiBlockService.showUiBlock();

    let kodeGenre = null;
    let namaGenre = null;
    let diskonGenre = null;

    if (this.userForm.value.kodeGenre) {
      kodeGenre = this.userForm.value.kodeGenre;
    }

    if (this.userForm.value.namaGenre) {
      namaGenre = this.userForm.value.namaGenre;
    }

    if (this.userForm.value.diskonGenre) {
      diskonGenre = this.userForm.value.diskonGenre;
    }

    this.searchParamsSearch = {
      kodeGenre: kodeGenre,
      namaGenre: namaGenre,
      diskonGenre: diskonGenre,
    };

    this.diskonService
    .search(
      this.searchParamsSearch, 
      // this.sortSearch, 
      // this.pagingSearch
      )
    .pipe(
      takeUntil(this.ngUnsubscribe)
    )
    .subscribe(
      (result: StdResponse<Diskon[]>) => {
        this.isLoadingResultsDataTables = false;
        this.uiBlockService.hideUiBlock();
        this.dataTables = result.data;
        this.totalRecordsDataTables = result.data.length;

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

  // public search() {

  //   this.isLoadingResultsDataTables = false;
  //   this.uiBlockService.showUiBlock();

  //   let genreBuku = null;
  //   let diskonPerGenre = null;

  //   if (this.userForm.value.genreBuku) {
  //     genreBuku = this.userForm.value.genreBuku;
  //   }

  //   if (this.userForm.value.diskonPerGenre) {
  //     diskonPerGenre = this.userForm.value.diskonPerGenre;
  //   }

  //   this.searchParamsSearch = {
  //     genreBuku: genreBuku,
  //     diskonPerGenre: diskonPerGenre,
  //   };

  //   this.diskonService
  //   .search()
  //   .pipe(
  //     takeUntil(this.ngUnsubscribe)
  //   )
  //   .subscribe(
  //     (result: StdResponse<Diskon[]>) => {
  //       this.isLoadingResultsDataTables = false;
  //       this.uiBlockService.hideUiBlock();
  //       this.dataTables = result.data;
  //       this.totalRecordsDataTables = result.data.length;

  //     },
  //     (error) => {
  //       this.isLoadingResultsDataTables = false;
  //       this.uiBlockService.hideUiBlock();

  //       this.appAlertService.error(error.errors);
  //     },
  //     () => {
  //       this.isLoadingResultsDataTables = false;
  //       this.uiBlockService.hideUiBlock();
  //     }
  //   );
  // }

  // public doInstantFilterSearch(event?: any) {
  //   if (event) {
  //     const pagination = PagingHelper.getPaging(event);

  //     pagination.searchParams = this.searchParamsSearch;

  //     if (pagination.sorts === null) {
  //       pagination.sorts = this.sortSearch;
  //     } else {
  //       this.sortSearch = pagination.sorts;
  //     }

  //     if (pagination.paging === null) {
  //       pagination.paging = this.pagingSearch;
  //     } else {
  //       this.pagingSearch = pagination.paging;
  //     }
  //     this.firstSearch = event.first;

  //     this.isLoadingResultsDataTables = true;
  //     this.uiBlockService.showUiBlock();
  //     this.diskonService
  //     .search(pagination.searchParams, pagination.sorts, pagination.paging)
  //     .pipe(
  //       takeUntil(this.ngUnsubscribe)
  //     )
  //     .subscribe(
  //       (result: StdResponse<Diskon[]>) => {
  //         this.isLoadingResultsDataTables = false;
  //         this.uiBlockService.hideUiBlock();
  //         this.dataTables = result.data;
  //         this.totalRecordsDataTables = result.meta.pagination.dataCount;
  //       },
  //       (error) => {
  //         this.isLoadingResultsDataTables = false;
  //         this.uiBlockService.hideUiBlock();

  //         this.appAlertService.error(error.errors);
  //       },
  //       () => {
  //         this.isLoadingResultsDataTables = false;
  //         this.uiBlockService.hideUiBlock();
  //       }
  //     );
  //   }
  // }

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
      this.diskonService
      .search()
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (result: StdResponse<Diskon[]>) => {
          this.isLoadingResultsDataTables = false;
          this.uiBlockService.hideUiBlock();
          this.dataTables = result.data;
          this.totalRecordsDataTables = result.data.length;
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
      { field: 'hapus', header: 'Delete', rtl: false, type: 'string', width: '50px' },
      { field: 'kodeGenre', header: 'kodeGenre', rtl: false, type: 'string', width: '250px' },
      { field: 'namaGenre', header: 'namaGenre', rtl: false, type: 'string', width: '250px' },
      { field: 'diskonGenre', header: 'diskonGenre', rtl: false, type: 'string', width: '250px' },
    ];
  }

  public editDataTables(data: Diskon) {
    this.uiBlockService.showUiBlock();

    this.diskonService.get(data)
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
          urlAsal: this.router.url, // ini berisi : '/master/customer'
        };
        SessionHelper.setItem('MDISKON-H', trxScreenData, this.lzStringService);

        // simpan data layar browse saat ini agar nanti sewaktu kembali ke layar browse,
        // layar browse dapat menampilkan data yang sama sebelum ke layar transaksi      
        const browseScreenData = { 
          kodeGenre: this.userForm.controls.kodeGenre.value,
          namaGenre: this.userForm.controls.namaGenre.value,
          diskonGenre: this.userForm.controls.diskonGenre.value,

          firstSearch: this.firstSearch,
          fromDetail: false };

        SessionHelper.setItem('MDISKON-BROWSE-SCR', browseScreenData, this.lzStringService);

      },
      (error) => {
        this.uiBlockService.hideUiBlock();
        this.appAlertService.error(error.errors);
      },
      () => {
        this.uiBlockService.hideUiBlock();
      }
    );
 }

  public addDataTables() {

    const diskon = new Diskon();
    
    const sessionData = {
      data: diskon,
      mode: 'add',
      prevTabName: '',
      prevTab: 0,
      tableFirst: 0,
      tableNumberOfRows: 0,
      urlAsal: this.router.url,
    };
    SessionHelper.setItem('MDISKON-H', sessionData, this.lzStringService);

    // simpan data layar browse saat ini agar nanti sewaktu kembali ke layar browse,
    // layar browse dapat menampilkan data yang sama sebelum ke layar transaksi      
    const browseScreenData = { 
      kodeGenre: this.userForm.controls.kodeGenre.value,
      namaGenre: this.userForm.controls.namaGenre.value,
      diskonGenre: this.userForm.controls.diskonGenre.value,

      firstSearch: this.firstSearch,
      fromDetail: false };

    SessionHelper.setItem('MDISKON-BROWSE-SCR', browseScreenData, this.lzStringService);

    this.router.navigate(['./input'], { relativeTo: this.route });

  }

  onDivDataTableResized(event: ResizedEvent) {
    const width = event.newWidth - 52; // 14 ini padding kiri kanan dari area content
    this.dataTablesWidth = width + 'px';
  }

  private dataBridging() {

    const browseScreenData = SessionHelper.getItem('MDISKON-BROWSE-SCR', this.lzStringService);

    if (!ObjectHelper.isEmpty(browseScreenData)) {

      if (browseScreenData.fromDetail) {

        // karena layar ini dapat dipanggil dari program lain, maka harus diperiksa
        // bila ini dari program lain, maka isi filter diisi default semua
    
        this.userForm.patchValue({
          kodeGenre: browseScreenData.kodeGenre ? browseScreenData.kodeGenre: '',
          namaGenre: browseScreenData.namaGenre ? browseScreenData.namaGenre: '',
          diskonGenre: browseScreenData.diskonGenre ? browseScreenData.diskonGenre: '',
        });
  
        if (browseScreenData.firstSearch) {
          this.firstSearch = browseScreenData.firstSearch;
        }

        this.searchParamsSearch = {
          kodeGenre: this.userForm.controls.kodeGenre.value,
          namaGenre: this.userForm.controls.namaGenre.value,
          diskonGenre: this.userForm.controls.diskonGenre.value,
        };
            
      }

      SessionHelper.destroy('MDISKON-BROWSE-SCR');

    }
  }

  private doDeleteDelete(data: Diskon) {
    this.uiBlockService.showUiBlock();
    this.diskonService
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

  public delete(data: Diskon) {
    this.translateService.get('HapusTransaksiNomor')
      .subscribe((translation) => {

      this.confirmationService.confirm({
        message: translation + ' ' + data.namaGenre + ' ?',
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
