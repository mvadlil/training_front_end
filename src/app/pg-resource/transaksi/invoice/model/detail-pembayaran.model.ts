import { InvoiceHeader } from './invoice-header.model';

export class DetailPembayaran {

  public header: InvoiceHeader = new InvoiceHeader();

  public nourut: number = 0;
  public jenisPembayaran: string = null;
  public nilaiRupiah: number = 0;
  public nilaiPoint: number = 0;

  // untuk input di grid
  public keyIn: string = null;
  public isEdit: string = 'N';
  public isError: string = 'N';
  public errorMsg: string = null;
  public editMode: string = null;
  public isDeleted: boolean = false;
  public isSelect: boolean = false;

  // harus ada di setiap model
  public id: string = null;
  public version: number = null;
  public usrcrt: string = null;
  public tglcrt: Date = null;
  public jamcrt: string = null;
  public usrupd: string = null;
  public tglupd: Date = null;
  public jamupd: string = null;

  constructor(initial?: Partial<DetailPembayaran>) {
    Object.assign(this, initial);
  }
}

