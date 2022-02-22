import { StdFieldMappingHint } from "src/app/common/common-class/standar-api-mapper";
import { Diskon } from "../../diskon/model/diskon.model";

export class DaftarBuku {

  public static readonly fieldMappingHints: StdFieldMappingHint[] = [
    { model: 'tglcrt', dataType: 'date' },
    { model: 'tglupd', dataType: 'date' },
  ];

  public kodeBuku: string = null;
  public namaBuku: string = null;
  public dataGenre: Diskon = null;
  public hargaBuku: number = null;
  public stockBuku: number = null;
  public active: boolean = null;

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

  constructor(initial?: Partial<DaftarBuku>) {
    Object.assign(this, initial);
  }
}

