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

  public id: string;
  public version: number;


  constructor(initial?: Partial<DaftarBuku>) {
    Object.assign(this, initial);
  }
}

