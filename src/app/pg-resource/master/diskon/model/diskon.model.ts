import { StdFieldMappingHint } from "src/app/common/common-class/standar-api-mapper";

export class Diskon {

  public static readonly fieldMappingHints: StdFieldMappingHint[] = [
    { model: 'tglcrt', dataType: 'date' },
    { model: 'tglupd', dataType: 'date' },
  ];

  public kodeGenre: string = null;
  public namaGenre: string = null;
  public diskonGenre: number = null;

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

  constructor(initial?: Partial<Diskon>) {
    Object.assign(this, initial);
  }
}

