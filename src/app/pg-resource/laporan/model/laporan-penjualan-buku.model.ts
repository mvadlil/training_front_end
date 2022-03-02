import { StdFieldMappingHint } from "src/app/common/common-class/standar-api-mapper";

export class LaporanPenjualanBuku {

  public bulan: number = null;
  public TotalQtyPenjualanBuku: number = null;
  public TotalNominalPenjualanBuku: number = null;

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

  constructor(initial?: Partial<LaporanPenjualanBuku>) {
    Object.assign(this, initial);
  }
}

