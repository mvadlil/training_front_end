import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DefaultLanguageState } from 'src/app/base/default-language/default-language.state';
import { BaseService } from 'src/app/common/common-class/base-service';
import { StdModelMapper } from 'src/app/common/common-class/standar-api-mapper';
import { StdConstants } from 'src/app/common/common-class/standar-api.constants';
import { AppAlertService } from 'src/app/common/common-components/alert/app-alert.service';
import { SortMode, StdPagingRequest } from 'src/app/common/common-model/standar-api-request.model';
import { StdResponse } from 'src/app/common/common-model/standar-api-response.model';
import { StdMessageTranslator } from 'src/app/common/common-services/standar-api-message-translator';
import { SaldoMember } from 'src/app/pg-resource/master/membership/model/saldo-member.model';
import { LaporanPenjualanBuku } from './model/laporan-penjualan-buku.model';

@Injectable()
export class LaporanPenjualanBukuService extends BaseService {

  private apiUrl = StdConstants.API_ADDRESS + '/api/laporan-penjualan-buku';

  private singleKey = 'item';
  private multiKey = 'items';
  private apiMessages = '';

  private mapperLaporanPenjualanBuku: StdModelMapper<LaporanPenjualanBuku> = new StdModelMapper<LaporanPenjualanBuku>(LaporanPenjualanBuku);
  

  constructor(private http: HttpClient, 
              private messageTranslator: StdMessageTranslator,
              private defaultLanguageState: DefaultLanguageState,
              private router: Router,
              private appAlertService: AppAlertService) {
    super();

  }

  private convertResponse(responseBody: StdResponse<any>, mapper: any, isMulti: boolean = false): StdResponse<any> {

    responseBody.data = isMulti
      ? mapper.toModelArray(responseBody.data[this.multiKey])
      : mapper.toModel(responseBody.data[this.singleKey]);

    this.messageTranslator.translateApiResponse(responseBody, this.apiMessages);

    return responseBody;
  }
  
  private requestUrl(extraUri?: string): string {
    return this.apiUrl + (extraUri ? '/' + extraUri : '');
  }


  public search(
    searchParams?: LaporanPenjualanBukuSearchParams,
    sorts?: LaporanPenjualanBukuSorts,
    paging?: StdPagingRequest): Observable<StdResponse<LaporanPenjualanBuku[]>> {

    return this.http.get<StdResponse<LaporanPenjualanBuku[]>>(this.requestUrl('search'), {
        params: this.mapperLaporanPenjualanBuku.toSearchParams(searchParams, sorts, paging) 
      }).pipe(
        map(res => this.convertResponse(res, this.mapperLaporanPenjualanBuku, true)),
        catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
        );
  }


}
export interface LaporanPenjualanBukuSearchParams {
  bulan?: number;
  TotalQtyPenjualanBuku?: number;
  TotalNominalPenjualanBuku?: number;
}

export interface LaporanPenjualanBukuSorts {
  bulan?: SortMode;
  TotalQtyPenjualanBuku?: SortMode;
  TotalNominalPenjualanBuku?: SortMode;
}


