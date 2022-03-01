
import { Membership } from 'src/app/pg-resource/master/membership/model/membership.model'
import { ListBukuModel } from 'src/app/pg-resource/transaksi/pembelian-buku/model/list-buku.model'
import { InvoiceDetailLainLain } from 'src/app/pg-resource/transaksi/invoice/model/invoice-detail-lainlain.model';

export class PembelianBukuCompleteModel {



    public namaPembeli: string = null;
    public discountHeader: number = null;
    public listBuku : InvoiceDetailLainLain[] = [];
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

