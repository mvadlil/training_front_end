
import { Membership } from 'src/app/pg-resource/master/membership/model/membership.model'

export class PembelianBukuCompleteModel {



    public namaPembeli: string = null;
    public discountHeader: number = null;
    public listBuku : any = null;
    public listPembayaran : any;
    public keterangan: string = null;
    public dataMembership: Membership = null;

    // harus ada di setiap model
    public id: string = null;
    public version: number = null;

  constructor(initial?: Partial<PembelianBukuCompleteModel>) {
    Object.assign(this, initial);
  }
}

