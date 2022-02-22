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
import { DaftarBuku } from 'src/app/pg-resource/master/daftarbuku/model/daftarbuku.model';
import { DaftarBukuService } from 'src/app/pg-resource/master/daftarbuku/daftarbuku.service';

@Component({
  selector: 'app-daftarbuku-browse',
  templateUrl: './daftarbuku-browse.component.html',
  providers: [DialogService],
  encapsulation : ViewEncapsulation.None
})

export class DaftarBukuBrowseComponent implements OnInit, OnDestroy, AfterViewChecked {

  private ngUnsubscribe: Subject<boolean> = new Subject();

  public title = 'DaftarBuku';

  public userForm: FormGroup;

  bsModalSelectTemplate: DynamicDialogRef;

  public radioButtonStatusKonfirmasi: any[];

  public dataTables: DaftarBuku[] = [];
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
    private daftarBukuService: DaftarBukuService,
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
      kodeBuku: 'asc',
      namaBuku: 'asc',
    };
    this.searchParamsSearch = {
      kodeBuku: null,
      namaBuku: null,
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
      kodeBuku: [''],
      namaBuku: [''],
      dataGenre: [''],
    });

    this.searchParamsSearch = {
      kodeBuku: this.userForm.controls.kodeBuku.value,
      namaBuku: this.userForm.controls.namaBuku.value,
    };

  }

  public search() {

    this.isLoadingResultsDataTables = false;
    this.uiBlockService.showUiBlock();

    let kodeBukuFilter = null;
    let namaBukuFilter = null;

    this.firstSearch = 1;

    if (this.userForm.value.kodeBuku) {
      kodeBukuFilter = this.userForm.value.kodeBuku;
    }

    if (this.userForm.value.namaBuku) {
      namaBukuFilter = this.userForm.value.namaBuku;
    }

    this.searchParamsSearch = {
      kodeBuku: kodeBukuFilter,
      namaBuku: namaBukuFilter,
    };

    this.pagingSearch = {
      page: 1,
      perPage: this.numberOfRowsDataTables
    };

    this.daftarBukuService
    .search(
      this.searchParamsSearch, 
      this.sortSearch, 
      this.pagingSearch
      )
    .pipe(
      takeUntil(this.ngUnsubscribe)
    )
    .subscribe(
      (result: StdResponse<DaftarBuku[]>) => {
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

  // public search() {

  //   this.isLoadingResultsDataTables = false;

  //   this.daftarBukuService
  //   .search()
  //   .pipe(
  //     takeUntil(this.ngUnsubscribe)
  //   )
  //   .subscribe(
  //     (result: StdResponse<DaftarBuku[]>) => {
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

      console.log('a');
      this.isLoadingResultsDataTables = true;
      this.uiBlockService.showUiBlock();
      this.daftarBukuService
      .search(
        this.searchParamsSearch, 
        this.sortSearch, 
        this.pagingSearch
      )
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (result: StdResponse<DaftarBuku[]>) => {
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
      { field: 'hapus', header: 'Delete', rtl: false, type: 'string', width: '50px' },
      { field: 'kodeBuku', header: 'KodeBuku', rtl: false, type: 'string', width: '250px' },
      { field: 'namaBuku', header: 'NamaBuku', rtl: false, type: 'string', width: '250px' },
      { field: 'genreBuku', header: 'GenreBuku', rtl: false, type: 'string', width: '250px' },
      { field: 'diskon', header: 'Diskon', rtl: false, type: 'string', width: '250px' },
      { field: 'hargaJual', header: 'HargaJual', rtl: false, type: 'string', width: '250px' },
    ];
  }

  public editDataTables(data: DaftarBuku) {
    this.uiBlockService.showUiBlock();

    this.daftarBukuService.get(data)
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
        SessionHelper.setItem('MDAFTARBUKU-H', trxScreenData, this.lzStringService);

        // simpan data layar browse saat ini agar nanti sewaktu kembali ke layar browse,
        // layar browse dapat menampilkan data yang sama sebelum ke layar transaksi      
        const browseScreenData = { 
          kodeBuku: this.userForm.controls.kodeBuku.value,
          namaBuku: this.userForm.controls.namaBuku.value,
          dataGenre: this.userForm.controls.dataGenre.value,
          hargaBuku: this.userForm.controls.hargaBuku.value,
          stockBuku: this.userForm.controls.stockBuku.value,
          active: this.userForm.controls.active.value,

          firstSearch: this.firstSearch,
          fromDetail: false };

        SessionHelper.setItem('MDAFTARBUKU-BROWSE-SCR', browseScreenData, this.lzStringService);

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

    const newObject = new DaftarBuku();
    
    const sessionData = {
      data: newObject,
      mode: 'add',
      prevTabName: '',
      prevTab: 0,
      tableFirst: 0,
      tableNumberOfRows: 0,
      urlAsal: this.router.url, 
    };
    SessionHelper.setItem('MDAFTARBUKU-H', sessionData, this.lzStringService);

    // simpan data layar browse saat ini agar nanti sewaktu kembali ke layar browse,
    // layar browse dapat menampilkan data yang sama sebelum ke layar transaksi      
    const browseScreenData = { 
      kodeBuku: this.userForm.controls.kodeBuku.value,
      namaBuku: this.userForm.controls.namaBuku.value,

      firstSearch: this.firstSearch,
      fromDetail: false };

    SessionHelper.setItem('MDAFTARBUKU-BROWSE-SCR', browseScreenData, this.lzStringService);

    this.router.navigate(['./input'], { relativeTo: this.route });

  }

  onDivDataTableResized(event: ResizedEvent) {
    const width = event.newWidth - 52; // 14 ini padding kiri kanan dari area content
    this.dataTablesWidth = width + 'px';
  }

  private dataBridging() {

    const browseScreenData = SessionHelper.getItem('MDAFTARBUKU-BROWSE-SCR', this.lzStringService);

    if (!ObjectHelper.isEmpty(browseScreenData)) {

      if (browseScreenData.fromDetail) {

        // karena layar ini dapat dipanggil dari program lain, maka harus diperiksa
        // bila ini dari program lain, maka isi filter diisi default semua
    
        this.userForm.patchValue({
          kodeBuku: browseScreenData.kodeBuku ? browseScreenData.kodeBuku: '',
          namaBuku: browseScreenData.namaBuku ? browseScreenData.namaBuku: '',
          dataGenre: browseScreenData.dataGenre ? browseScreenData.dataGenre: '',
          hargaBuku: browseScreenData.hargaBuku ? browseScreenData.hargaBuku: '',
          stockBuku: browseScreenData.stockBuku ? browseScreenData.stockBuku: '',
          active: browseScreenData.active ? browseScreenData.active: '',
          flakt: browseScreenData.flakt ? browseScreenData.flakt : '',
        });
  
        if (browseScreenData.firstSearch) {
          this.firstSearch = browseScreenData.firstSearch;
        }

        this.searchParamsSearch = {
          kodeBuku: this.userForm.controls.kodeBuku.value,
          namaBuku: this.userForm.controls.namaBuku.value,
        };
            
      }

      SessionHelper.destroy('MDAFTARBUKU-BROWSE-SCR');

    }
  }

  private doDeleteDelete(data: DaftarBuku) {
    this.uiBlockService.showUiBlock();
    this.daftarBukuService
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

  public delete(data: DaftarBuku) {
    this.translateService.get('HapusTransaksiNomor')
      .subscribe((translation) => {

      this.confirmationService.confirm({
        message: translation + ' ' + data.kodeBuku + ' ?',
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
