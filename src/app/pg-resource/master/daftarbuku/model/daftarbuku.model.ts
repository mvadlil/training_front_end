import { StdFieldMappingHint } from "src/app/common/common-class/standar-api-mapper";
import { Diskon } from "../../diskon/model/diskon.model";

export class DaftarBuku {


  public kodeBuku: string = null;
  public namaBuku: string = null;
  public dataGenre: Diskon = null;
  public hargaBuku: number = null;
  public stockBuku: number = null;
  public active: boolean = null;

  public id: string = null;

  public version: number = null;


  constructor(initial?: Partial<DaftarBuku>) {
    Object.assign(this, initial);
  }
}

