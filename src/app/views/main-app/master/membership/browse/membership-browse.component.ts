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

@Component({
  selector: 'app-customer-browse',
  templateUrl: './membership-browse.component.html',
  providers: [DialogService],
  encapsulation : ViewEncapsulation.None
})

export class MembershipBrowseComponent implements OnInit, OnDestroy, AfterViewChecked {

  private ngUnsubscribe: Subject<boolean> = new Subject();

  public title = 'MasterMembership';

  public userForm: FormGroup;

  bsModalSelectTemplate: DynamicDialogRef;

  public radioButtonStatusKonfirmasi: any[];

  public dataTables: Membership[] = [];
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
    private membershipService: MembershipService,
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
      namaMembership: 'asc',
      kodeMembership: 'asc',
    };
    this.searchParamsSearch = {
      namaMembership: null,
      kodeMembership: null,
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
      namaMembership: [''],
      kodeMembership: [''],
    });

    let namaMembership = null;
    let kodeMembership = null;

    if (this.userForm.value.namaMembership) {
      namaMembership = this.userForm.value.namaMembership;
    }

    if (this.userForm.value.kodeMembership) {
      kodeMembership = this.userForm.value.kodeMembership;
    }

    this.searchParamsSearch = {
      namaMembership: namaMembership,
      kodeMembership: kodeMembership,
    };

  }

  public search() {

    this.isLoadingResultsDataTables = false;
    this.uiBlockService.showUiBlock();

    let namaMembership = null;
    let kodeMembership = null;

    if (this.userForm.value.namaMembership) {
      namaMembership = this.userForm.value.namaMembership;
    }

    if (this.userForm.value.kodeMembership) {
      kodeMembership = this.userForm.value.kodeMembership;
    }

    this.searchParamsSearch = {
      namaMembership: namaMembership,
      kodeMembership: kodeMembership,
    };

    this.membershipService
    .search(
      this.searchParamsSearch, 
      this.sortSearch, 
      this.pagingSearch
      )
    .pipe(
      takeUntil(this.ngUnsubscribe)
    )
    .subscribe(
      (result: StdResponse<Membership[]>) => {
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
      this.membershipService
      .search(pagination.searchParams, pagination.sorts, pagination.paging)
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (result: StdResponse<Membership[]>) => {
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
      { field: 'namaMembership', header: 'namaMembership', rtl: false, type: 'string', width: '250px' },
      { field: 'kodeMembership', header: 'kodeMembership', rtl: false, type: 'string', width: '250px' },
    ];
  }

  public editDataTables(data: Membership) {
    this.uiBlockService.showUiBlock();

    this.membershipService.get(data)
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
        SessionHelper.setItem('MMEMBERSHIP-H', trxScreenData, this.lzStringService);

        // simpan data layar browse saat ini agar nanti sewaktu kembali ke layar browse,
        // layar browse dapat menampilkan data yang sama sebelum ke layar transaksi      
        const browseScreenData = { 
          namaMembership: this.userForm.controls.namaMembership.value,
          kodeMembership: this.userForm.controls.kodeMembership.value,

          firstSearch: this.firstSearch,
          fromDetail: false };

        SessionHelper.setItem('MMEMBERSHIP-BROWSE-SCR', browseScreenData, this.lzStringService);

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

    const transaksiJurnalComplete = new Customer();
    transaksiJurnalComplete.flakt = true;
    
    const sessionData = {
      data: transaksiJurnalComplete,
      mode: 'add',
      prevTabName: '',
      prevTab: 0,
      tableFirst: 0,
      tableNumberOfRows: 0,
      urlAsal: this.router.url, // ini berisi : '/transaksi/transaksi-jurnal'
    };
    SessionHelper.setItem('MMEMBERSHIP-H', sessionData, this.lzStringService);

    // simpan data layar browse saat ini agar nanti sewaktu kembali ke layar browse,
    // layar browse dapat menampilkan data yang sama sebelum ke layar transaksi      
    const browseScreenData = { 
      namaMembership: this.userForm.controls.namaMembership.value,
      kodeMembership: this.userForm.controls.kodeMembership.value,

      firstSearch: this.firstSearch,
      fromDetail: false };

    SessionHelper.setItem('MMEMBERSHIP-BROWSE-SCR', browseScreenData, this.lzStringService);

    this.router.navigate(['./input'], { relativeTo: this.route });

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

  private doDeleteDelete(data: Membership) {
    this.uiBlockService.showUiBlock();
    this.membershipService
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

  public delete(data: Membership) {
    this.translateService.get('HapusTransaksiNomor')
      .subscribe((translation) => {

      this.confirmationService.confirm({
        message: translation + ' ' + data.namaMembership + ' ?',
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

// import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
// import * as moment from 'moment';
// import { ConfirmationService, MenuItem } from 'primeng/api';
// import { Subject } from 'rxjs';
// import { isEmpty, takeUntil } from 'rxjs/operators';
// import { AppAlertService } from 'src/app/common/common-components/alert/app-alert.service';
// import { StdPagingRequest } from 'src/app/common/common-model/standar-api-request.model';
// import { StdResponse } from 'src/app/common/common-model/standar-api-response.model';
// import { FEComboConstantService } from 'src/app/common/common-services/fe.combo.constants.service';
// import { UiBlockService } from 'src/app/common/common-services/ui-block.service';
// import { PagingHelper } from 'src/app/helper/paging-helper';
// import { SessionHelper } from 'src/app/helper/session-helper';
// import { LZStringService } from 'ng-lz-string';
// import { ResizedEvent } from 'angular-resize-event';
// import { BreadCrumbService } from 'src/app/common/common-components/breadcrumb/breadcrumb.service';
// import { DefaultLanguageState } from 'src/app/base/default-language/default-language.state';
// import { ObjectHelper } from 'src/app/helper/object-helper';
// import { DialogService, DynamicDialogRef } from 'primeng';
// import { v4 as uuidv4 } from 'uuid';
// import { ComboConstantsService } from 'src/app/pg-resource/master/common/combo-constants/combo.constants.service';
// import { ComboConstants } from 'src/app/pg-resource/master/common/combo-constants/model/combo.constants.model';
// import { Customer } from 'src/app/pg-resource/master/customer/model/customer.model';
// import { Membership } from 'src/app/pg-resource/master/membership/model/membership.model';
// import { CustomerService } from 'src/app/pg-resource/master/customer/customer.service';
// import { MembershipService } from 'src/app/pg-resource/master/membership/membership.service';

// @Component({
//   selector: 'app-customer-browse',
//   templateUrl: './membership-browse.component.html',
//   providers: [DialogService],
//   encapsulation : ViewEncapsulation.None
// })

// export class MembershipBrowseComponent implements OnInit, OnDestroy, AfterViewChecked {

//   private ngUnsubscribe: Subject<boolean> = new Subject();

//   public title = 'MasterMembership';

//   public userForm: FormGroup;

//   bsModalSelectTemplate: DynamicDialogRef;

//   public radioButtonStatusKonfirmasi: any[];

//   public dataTables: Membership[] = [];
//   public numberOfRowsDataTables = 5;
//   public isLoadingResultsDataTables = false;
//   public totalRecordsDataTables = 0;
//   public colsUserDataTables: any[];

//   public pagingSearch: StdPagingRequest = null;
//   public firstSearch = 0;
//   public searchParamsSearch: any;
//   public sortSearch: any;

//   // width dari dataTables (untuk kemudian di set di bawah (di onDivDataTableResized) secara dinamis)
//   public dataTablesWidth = '0px';

//   public radioButtonAktif: any[];

//   constructor(
//     private fb: FormBuilder,
//     private appAlertService: AppAlertService,
//     private confirmationService: ConfirmationService,
//     private uiBlockService: UiBlockService,
//     private translateService: TranslateService,
//     private customerService: CustomerService,
//     private membershipService: MembershipService,
//     private feComboConstantService: FEComboConstantService,
//     private comboConstantsService: ComboConstantsService,
//     private route: ActivatedRoute,
//     private router: Router,
//     private lzStringService: LZStringService,
//     private cdRef: ChangeDetectorRef,
//     private breadCrumbService: BreadCrumbService,
//     public defaultLanguageState: DefaultLanguageState,
//     private dialogService: DialogService,
//   ) {
//     this.pagingSearch = {
//       page: 1,
//       perPage: this.numberOfRowsDataTables
//     };
//     this.sortSearch = {
//       nama: 'asc',
//       picnama: 'asc',
//       picalamat: 'asc',
//       picemail: 'asc',
//       billnama: 'asc',
//       billalamat: 'asc',
//       billemail: 'asc',
//     };
//     this.searchParamsSearch = {
//       nama: null,
//       picnama: null,
//       picalamat: null,
//       picemail: null,
//       billnama: null,
//       billalamat: null,
//       billemail: null,
//       flakt: null,
//     };
//   }

//   public ngOnInit() {
//     this.breadCrumbService.sendReloadInfo('reload');
//     this.initUserForm();
//     this.initRadioButtonAktif();
//     this.initColsUserDataTables();
//     this.dataBridging();
//   }

//   ngOnDestroy() {
//     this.ngUnsubscribe.next(true);
//     this.ngUnsubscribe.complete();
//   }

//   ngAfterViewChecked() {
//     this.cdRef.detectChanges();
//   }

//   private initUserForm() {
//     // form group, untuk input form control name
//     this.userForm = this.fb.group({
//       namaMember: [''],
//       nomorTelepon: [''],
//     });

//     this.searchParamsSearch = {
//       nama: this.userForm.controls.namaMember.value,
//       picnama: this.userForm.controls.nomorTelepon.value,
//     };

//   }

//   public initRadioButtonAktif() {

//     this.uiBlockService.showUiBlock();
//     this.feComboConstantService
//     .getFilterAktif()
//     .pipe(
//       takeUntil(this.ngUnsubscribe)
//     )
//     .subscribe(
//       (result) => {
//         this.uiBlockService.hideUiBlock();

//         this.radioButtonAktif = result.data.map(
//             item => new Object({name: item.deskripsi, key: item.kode })
//           );

//       },
//       (error) => {
//         this.uiBlockService.hideUiBlock();
//       },
//       () => {
//         this.uiBlockService.hideUiBlock();
//       }
//     );
//   }

//   // public search() {

//   //   this.isLoadingResultsDataTables = false;
//   //   this.uiBlockService.showUiBlock();

//   //   let namaFilter = null;
//   //   let picnamaFilter = null;
//   //   let picalamatFilter = null;
//   //   let picemailFilter = null;
//   //   let billnamaFilter = null;
//   //   let billalamatFilter = null;
//   //   let billemailFilter = null;
//   //   let flaktFilter = null;

//   //   if (this.userForm.value.nama) {
//   //     namaFilter = this.userForm.value.nama;
//   //   }

//   //   if (this.userForm.value.picnama) {
//   //     picnamaFilter = this.userForm.value.picnama;
//   //   }

//   //   if (this.userForm.value.picalamat) {
//   //     picalamatFilter = this.userForm.value.picalamat;
//   //   }

//   //   if (this.userForm.value.picemail) {
//   //     picemailFilter = this.userForm.value.picemail;
//   //   }

//   //   if (this.userForm.value.billnama) {
//   //     billnamaFilter = this.userForm.value.billnama;
//   //   }

//   //   if (this.userForm.value.billalamat) {
//   //     billalamatFilter = this.userForm.value.billalamat;
//   //   }

//   //   if (this.userForm.value.billemail) {
//   //     billemailFilter = this.userForm.value.billemail;
//   //   }

//   //   if (this.userForm.value.flakt) {
//   //     flaktFilter = this.userForm.value.flakt;
//   //   }

//   //   this.searchParamsSearch = {
//   //     nama: namaFilter,
//   //     picnama: picnamaFilter,
//   //     picalamat: picalamatFilter,
//   //     picemail: picemailFilter,
//   //     billnama: billnamaFilter,
//   //     billalamat: billalamatFilter,
//   //     billemail: billemailFilter,
//   //     flakt: flaktFilter,
//   //   };

//   //   this.customerService
//   //   .search(this.searchParamsSearch, this.sortSearch, this.pagingSearch)
//   //   .pipe(
//   //     takeUntil(this.ngUnsubscribe)
//   //   )
//   //   .subscribe(
//   //     (result: StdResponse<Customer[]>) => {
//   //       this.isLoadingResultsDataTables = false;
//   //       this.uiBlockService.hideUiBlock();
//   //       this.dataTables = result.data;
//   //       this.totalRecordsDataTables = result.meta.pagination.dataCount;

//   //     },
//   //     (error) => {
//   //       this.isLoadingResultsDataTables = false;
//   //       this.uiBlockService.hideUiBlock();

//   //       this.appAlertService.error(error.errors);
//   //     },
//   //     () => {
//   //       this.isLoadingResultsDataTables = false;
//   //       this.uiBlockService.hideUiBlock();
//   //     }
//   //   );
//   // }

//   public search() {

//     this.isLoadingResultsDataTables = false;
//     this.uiBlockService.showUiBlock();

//     this.membershipService
//     .search()
//     .pipe(
//       takeUntil(this.ngUnsubscribe)
//     )
//     .subscribe(
//       (result: Membership[]) => {
//         this.isLoadingResultsDataTables = false;
//         this.uiBlockService.hideUiBlock();
//         this.dataTables = result;
//         this.totalRecordsDataTables = this.dataTables.length;

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

//   // public doInstantFilterSearch(event?: any) {
//   //   if (event) {
//   //     const pagination = PagingHelper.getPaging(event);

//   //     pagination.searchParams = this.searchParamsSearch;

//   //     if (pagination.sorts === null) {
//   //       pagination.sorts = this.sortSearch;
//   //     } else {
//   //       this.sortSearch = pagination.sorts;
//   //     }

//   //     if (pagination.paging === null) {
//   //       pagination.paging = this.pagingSearch;
//   //     } else {
//   //       this.pagingSearch = pagination.paging;
//   //     }
//   //     this.firstSearch = event.first;

//   //     console.log('a');
//   //     this.isLoadingResultsDataTables = true;
//   //     this.uiBlockService.showUiBlock();
//   //     this.customerService
//   //     .search(pagination.searchParams, pagination.sorts, pagination.paging)
//   //     .pipe(
//   //       takeUntil(this.ngUnsubscribe)
//   //     )
//   //     .subscribe(
//   //       (result: StdResponse<Customer[]>) => {
//   //         this.isLoadingResultsDataTables = false;
//   //         this.uiBlockService.hideUiBlock();
//   //         this.dataTables = result.data;
//   //         this.totalRecordsDataTables = result.meta.pagination.dataCount;
//   //       },
//   //       (error) => {
//   //         this.isLoadingResultsDataTables = false;
//   //         this.uiBlockService.hideUiBlock();

//   //         this.appAlertService.error(error.errors);
//   //       },
//   //       () => {
//   //         this.isLoadingResultsDataTables = false;
//   //         this.uiBlockService.hideUiBlock();
//   //       }
//   //     );
//   //   }
//   // }

//   public refreshDataDataTables() {
//     this.search();
//   }

//   public initColsUserDataTables() {
//     this.colsUserDataTables = [
//       { field: 'hapus', header: 'Delete', rtl: false, type: 'string', width: '50px' },
//       { field: 'namaMember', header: 'Nama', rtl: false, type: 'string', width: '250px' },
//       { field: 'nomorTelepon', header: 'PicNama', rtl: false, type: 'string', width: '250px' },
//     ];
//   }

//   public editDataTables(data: Customer) {
//     this.uiBlockService.showUiBlock();

//     this.customerService.get(data)
//     .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
//       (result) => {
//         this.uiBlockService.hideUiBlock();

//         this.router.navigate(['./input'], { relativeTo: this.route });

//         // simpan data transaksi yang dipilih untuk di edit ini ke session storage
//         const trxScreenData = {
//           data: result.data,
//           mode: 'edit',
//           prevTabName: '',
//           prevTab: 0,
//           tableFirst: 0,
//           tableNumberOfRows: 0,
//           urlAsal: this.router.url, // ini berisi : '/master/customer'
//         };
//         SessionHelper.setItem('MCUSTOMER-H', trxScreenData, this.lzStringService);

//         // simpan data layar browse saat ini agar nanti sewaktu kembali ke layar browse,
//         // layar browse dapat menampilkan data yang sama sebelum ke layar transaksi      
//         const browseScreenData = { 
//           nama: this.userForm.controls.nama.value,
//           picnama: this.userForm.controls.picnama.value,
//           picalamat: this.userForm.controls.picalamat.value,
//           picemail: this.userForm.controls.picemail.value,
//           billnama: this.userForm.controls.billnama.value,
//           billalamat: this.userForm.controls.billalamat.value,
//           billemail: this.userForm.controls.billemail.value,
//           flakt: this.userForm.controls.flakt.value,

//           firstSearch: this.firstSearch,
//           fromDetail: false };

//         SessionHelper.setItem('MCUSTOMER-BROWSE-SCR', browseScreenData, this.lzStringService);

//       },
//       (error) => {
//         this.uiBlockService.hideUiBlock();
//         this.appAlertService.error(error.errors);
//       },
//       () => {
//         this.uiBlockService.hideUiBlock();
//       }
//     );
//  }

//   public addDataTables() {

//     const transaksiJurnalComplete = new Membership();
    
//     const sessionData = {
//       data: transaksiJurnalComplete,
//       mode: 'add',
//       prevTabName: '',
//       prevTab: 0,
//       tableFirst: 0,
//       tableNumberOfRows: 0,
//       urlAsal: this.router.url, // ini berisi : '/transaksi/transaksi-jurnal'
//     };
//     SessionHelper.setItem('MMEMBERSHIP-H', sessionData, this.lzStringService);

//     // simpan data layar browse saat ini agar nanti sewaktu kembali ke layar browse,
//     // layar browse dapat menampilkan data yang sama sebelum ke layar transaksi      
//     const browseScreenData = { 
//       namaMember: this.userForm.controls.namaMember.value,
//       nomorTelepon: this.userForm.controls.nomorTelepon.value,

//       firstSearch: this.firstSearch,
//       fromDetail: false };

//     SessionHelper.setItem('MMEMBERSHIP-BROWSE-SCR', browseScreenData, this.lzStringService);

//     this.router.navigate(['./input'], { relativeTo: this.route });

//   }

//   onDivDataTableResized(event: ResizedEvent) {
//     const width = event.newWidth - 52; // 14 ini padding kiri kanan dari area content
//     this.dataTablesWidth = width + 'px';
//   }

//   private dataBridging() {

//     const browseScreenData = SessionHelper.getItem('MCUSTOMER-BROWSE-SCR', this.lzStringService);

//     if (!ObjectHelper.isEmpty(browseScreenData)) {

//       if (browseScreenData.fromDetail) {

//         // karena layar ini dapat dipanggil dari program lain, maka harus diperiksa
//         // bila ini dari program lain, maka isi filter diisi default semua
    
//         this.userForm.patchValue({
//           nama: browseScreenData.nama ? browseScreenData.nama: '',
//           picnama: browseScreenData.picnama ? browseScreenData.picnama: '',
//           picalamat: browseScreenData.picalamat ? browseScreenData.picalamat: '',
//           picemail: browseScreenData.picemail ? browseScreenData.picemail: '',
//           billnama: browseScreenData.billnama ? browseScreenData.billnama: '',
//           billalamat: browseScreenData.billalamat ? browseScreenData.billalamat: '',
//           billemail: browseScreenData.billemail ? browseScreenData.billemail: '',
//           flakt: browseScreenData.flakt ? browseScreenData.flakt : '',
//         });
  
//         if (browseScreenData.firstSearch) {
//           this.firstSearch = browseScreenData.firstSearch;
//         }

//         this.searchParamsSearch = {
//           nama: this.userForm.controls.nama.value,
//           picnama: this.userForm.controls.picnama.value,
//           picalamat: this.userForm.controls.picalamat.value,
//           picemail: this.userForm.controls.picemail.value,
//           billnama: this.userForm.controls.billnama.value,
//           billalamat: this.userForm.controls.billalamat.value,
//           billemail: this.userForm.controls.billemail.value,
//           flakt: this.userForm.controls.flakt.value,
//         };
            
//       }

//       SessionHelper.destroy('MCUSTOMER-BROWSE-SCR');

//     }
//   }

//   private doDeleteDelete(data: Membership) {
//     this.uiBlockService.showUiBlock();
//     console.log(data)
//     this.membershipService
//       .delete(data)
//       .pipe(takeUntil(this.ngUnsubscribe))
//       .subscribe(
//         (result) => {

//           this.uiBlockService.hideUiBlock();
//           this.translateService.get('HapusBerhasil')
//             .subscribe((translation) => {
//               this.appAlertService.instantInfo(translation);
//             }
//           );

//           this.refreshDataDataTables();

//         },
//         (error: any) => {
//           this.appAlertService.error(error.errors);
//         },
//           () => { this.uiBlockService.hideUiBlock(); }
//       );
//   }

//   public delete(data: Membership) {
//     this.translateService.get('HapusTransaksiNomor')
//       .subscribe((translation) => {

//       this.confirmationService.confirm({
//         message: translation + ' ' + data.namaMember + ' ?',
//         header: 'Confirmation',
//         icon: 'pi pi-exclamation-triangle',
//         accept: () => {
//               this.doDeleteDelete(data);
//         },
//         reject: () => {
//         }
//       });

//       }
//     );
//   }

// }

