import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { AppAlertService } from 'src/app/common/common-components/alert/app-alert.service';

import { DialogService, DynamicDialogRef } from 'primeng';
import { DefaultLanguageState } from 'src/app/base/default-language/default-language.state';
import { InvoiceDetailLainLain } from 'src/app/pg-resource/transaksi/invoice/model/invoice-detail-lainlain.model';
import { v4 as uuidv4 } from 'uuid';
import { DetailPembayaranInputComponent } from './input-detil-pembayaran/detail-pembayaran-input.component';
import { DetailPembayaran } from 'src/app/pg-resource/transaksi/invoice/model/detail-pembayaran.model';

@Component({
  selector: 'app-tabel-detail-pembayaran',
  templateUrl: './tabel-detail-pembayaran.component.html',
  styleUrls: ['./tabel-detail-pembayaran.component.scss'],
  providers: [DialogService],
  encapsulation : ViewEncapsulation.None
})

export class TabelDetailPembayaranComponent implements OnInit, OnDestroy, AfterViewChecked {

  @Input() dataTables: DetailPembayaran[];
  @Input() totalRecordsDataTables: number;
  @Input() isLoadingResultsDataTables: false;  
  @Input() expandedRowsDataTables: {};  
  @Input() dataTablesWidth: number;

  @Output() dataTablesChange = new EventEmitter<DetailPembayaran[]>();

  bsModalInputDetilLainLain: DynamicDialogRef;

  public tab1Index = 0;
  public firstSearch = 0;

  private ngUnsubscribe: Subject<boolean> = new Subject();

  public numberOfRowsDataTables = 5;

  public colsDataTables: any[];

  // default sort untuk datatables
  public multiSortMeta = [];

  constructor(
    private appAlertService: AppAlertService,
    private translateService: TranslateService,
    public defaultLanguageState: DefaultLanguageState,
    private cdRef: ChangeDetectorRef,
    private dialogService: DialogService,
  ) {
  }

  public ngOnInit() {
    this.initColsDataTables();
    this.initDefaultMultiSort();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public initColsDataTables() {
    this.colsDataTables = [
      { field: 'nourut', header: 'NoUrut', rtl: true, type: 'string', width: '30px' },
      { field: 'jenispembayaran', header: 'JenisPembayaran', rtl: true, type: 'string', width: '100px' },
      { field: 'nilairupiah', header: 'NilaiRupiah', rtl: false, type: 'string', width: '100px' },
      { field: 'jumlahpoint', header: 'JumlahPoint', rtl: true, type: 'string', width: '100px' },
    ];
  }

  public initDefaultMultiSort() {
    this.multiSortMeta.push({field: 'jenispembayaran', order: 1});
  }

  public deleteSelectorDataTables(event: any) {

    this.dataTables.map((item) => {
      item.isSelect = event.checked;
    });
    this.dataTables.slice();

    this.dataTablesChange.emit(this.dataTables);
  }

  public deleteRowDataTables(row: any) {

    this.dataTablesChange.emit(this.dataTables);
  }

  public editDataTables(inData: DetailPembayaran) {


    this.bsModalInputDetilLainLain = this.dialogService.open(DetailPembayaranInputComponent, {
      width: '55%',
      contentStyle: {'max-height': 'auto', overflow: 'auto'},
      baseZIndex: 10000,
      data: {
        mode: 'edit',
        selectedData: inData,
      }
    });

    const sub = this.bsModalInputDetilLainLain.onClose.subscribe((data: any) => {

      const returnedData = data.selectedData;
      const mode = data.mode;

      if (returnedData) {
        if (mode === 'edit') {

          const updateItem = this.dataTables.find((item) => item.nourut === returnedData.nourut);

          const index = this.dataTables.indexOf(updateItem);

          this.dataTables[index] = returnedData;

          this.dataTablesChange.emit(this.dataTables);
        }
      }
      sub.unsubscribe();
    },
    () => {
    });
  }

  public addDataTables() {

    // cari nilai nomor urut terakhir untuk masing-masing data tables
    let noUrut = 0;
    this.dataTables.map(item => { 
      if (item.nourut > noUrut) {
        noUrut = item.nourut;
      }
    });
    noUrut = noUrut + 1;

    const newData = new DetailPembayaran();
    newData.nourut = noUrut;

    this.bsModalInputDetilLainLain = this.dialogService.open(DetailPembayaranInputComponent, {
      width: '55%',
      contentStyle: {'max-height': 'auto', overflow: 'auto'},
      baseZIndex: 10000,
      data: {
        mode: 'add',
        selectedData: newData,
      }
    });

    const sub = this.bsModalInputDetilLainLain.onClose.subscribe((data: any) => {

      const returnedData = data.selectedData;
      const mode = data.mode;

      if (returnedData) {
        if (mode === 'add') {
          returnedData.keyIn = uuidv4(); 
          this.dataTables.push(returnedData);
          this.dataTablesChange.emit(this.dataTables);
        }
      }
      sub.unsubscribe();
    },
    () => {
    });
  }
}
