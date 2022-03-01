import { DaftarBuku } from 'src/app/pg-resource/master/daftarbuku/model/daftarbuku.model';
export class ListBukuModel {

  public qty: number;
  public dataBuku : DaftarBuku;
  public persenDiscBuku:10;


  public nourut: number = 0;
  public keterangan: string = null;
  public harga: number = 0;
  public pctdisc: number = 0;
  public nilpctdisc: number = 0;
  public nildisc: number = 0;
  public netto: number = 0;

  public id: string;
  public version: number;

  // untuk expandable rows
  public keyIn: string = null;

  // untuk checkbox bahwa jurnal ini dipilih untuk dibuatkan jurnal rutin
  public isSelect: boolean = false;

  constructor(initial?: Partial<ListBukuModel>) {
    Object.assign(this, initial);
  }
}

