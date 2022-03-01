import { StdFieldMappingHint } from 'src/app/common/common-class/standar-api-mapper';

import { Membership } from 'src/app/pg-resource/master/membership/model/membership.model'
export class PembelianBukuBrowseModel {

    public static readonly fieldMappingHints: StdFieldMappingHint[] = [
        { model: 'tglcrt', dataType: 'date' },
        { model: 'tglupd', dataType: 'date' },
        { model: 'tgjtemp', dataType: 'date' },
    ];


    public tanggalBon : Date = null;
    public nomorBon: string = null;
    public namaPembeli: string = null;
    public discountHeader: number = null;
    public nilaiKembalian: number = null;
    public totalPembayaran: number = null;
    public totalPembelianBuku: number = null;
    public nilaiDiskonHeader: number = null;
    public flagDapatPromo5Pertama: boolean = null;
    public flagKembalian: boolean = null;
    public PPN: number = null;
    public keterangan: string = null;
    public DPP: number = null;
    public dataMembership: Membership = null;
    public listBuku : any = null;
    public listPembayaran : any;
    public dataJenisTransaksi: any;


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
    

  constructor(initial?: Partial<PembelianBukuBrowseModel>) {
    Object.assign(this, initial);
  }
}

