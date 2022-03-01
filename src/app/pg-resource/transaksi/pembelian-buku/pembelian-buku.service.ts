import { Injectable } from '@angular/core';
import { map, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

import { BaseService } from 'src/app/common/common-class/base-service';
import { SortMode, StdPagingRequest } from 'src/app/common/common-model/standar-api-request.model';
import { StdResponse } from 'src/app/common/common-model/standar-api-response.model';
import { StdConstants } from 'src/app/common/common-class/standar-api.constants';
import { StdModelMapper } from 'src/app/common/common-class/standar-api-mapper';
import { StdMessageTranslator } from 'src/app/common/common-services/standar-api-message-translator';
import { AppAlertService } from 'src/app/common/common-components/alert/app-alert.service';
import { DefaultLanguageState } from 'src/app/base/default-language/default-language.state';
import { LanguageTypes } from 'src/app/base/default-language/language';
import { IndonesiaMessageDictionary } from 'src/app/base/internationalization/i18n/indonesia-message.translation';
import { EnglishMessageDictionary } from 'src/app/base/internationalization/i18n/english-message.translation';
import { Router } from '@angular/router';

import { v4 as uuidv4 } from 'uuid';
import { InvoiceHeader } from 'src/app/pg-resource/transaksi/invoice/model/invoice-header.model';
import { InvoiceManualComplete } from 'src/app/pg-resource/transaksi/invoice/model/invoice-manual-complete.model';
import { InvoiceDetailLainLain } from 'src/app/pg-resource/transaksi/invoice/model/invoice-detail-lainlain.model';
import { PembelianBukuBrowseModel } from 'src/app/pg-resource/transaksi/pembelian-buku/model/pembelian-buku-browse.model'
import { PotensiPromo} from 'src/app/pg-resource/transaksi/pembelian-buku/model/potensi-promo.model';
import { Membership } from 'src/app/pg-resource/master/membership/model/membership.model';


import { PembelianBukuCompleteModel } from 'src/app/pg-resource/transaksi/pembelian-buku/model/pembelian-buku-complete.model';


@Injectable()
export class PembelianBukuService extends BaseService {

  private apiUrl = StdConstants.API_ADDRESS + '/api/beli-buku';

  private singleKey = 'item';
  private multiKey = 'items';
  private apiMessages = '';

  private mapperInvoiceHeader:
    StdModelMapper<InvoiceHeader> = new StdModelMapper<InvoiceHeader>(InvoiceHeader);

  private mapperInvoiceManualComplete:
    StdModelMapper<InvoiceManualComplete> = new StdModelMapper<InvoiceManualComplete>(InvoiceManualComplete);

  private mapperInvoiceDetailLainLain:
    StdModelMapper<InvoiceDetailLainLain> = new StdModelMapper<InvoiceDetailLainLain>(InvoiceDetailLainLain);

  private mapperPembelianBukuBrowse:
  StdModelMapper<PembelianBukuBrowseModel> = new StdModelMapper<PembelianBukuBrowseModel>(PembelianBukuBrowseModel);

  private mapperPotensiPromo: StdModelMapper<PotensiPromo> = new StdModelMapper<PotensiPromo>(PotensiPromo);
  private mapperPembelianBukuComplete: StdModelMapper<PembelianBukuCompleteModel> = new StdModelMapper<PembelianBukuCompleteModel>(PembelianBukuCompleteModel);


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

  public search(
    searchParams?: PembelianBukuSearchParams,
    sorts?: PembelianBukuSorts,
    paging?: StdPagingRequest): Observable<StdResponse<PembelianBukuBrowseModel[]>> {

    return this.http.get<StdResponse<PembelianBukuBrowseModel[]>>(this.requestUrl('search'), {
        params: this.mapperPembelianBukuBrowse.toSearchParams(searchParams, sorts, paging) 
      }).pipe(
        map(res => this.convertResponse(res, this.mapperPembelianBukuBrowse, true)),
        catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
        );
  }

  private requestUrl(extraUri?: string): string {
    return this.apiUrl + (extraUri ? '/' + extraUri : '');
  }




  public checkPotensiPromo(model: Membership): Observable<StdResponse<PotensiPromo>> {

    return this.http.get<StdResponse<PotensiPromo>>(this.apiUrl + '/check-lima-pembeli-pertama', {
      params: (new HttpParams()).set('idMembership', model.id)
    }).pipe(
      map((res: StdResponse<PotensiPromo>) => {
        let tmp = this.convertResponse(res, this.mapperPotensiPromo);
        return tmp;
      }),
      catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
    );
  }

  
  public simpan(model: PembelianBukuCompleteModel): Observable<PembelianBukuCompleteModel> {
    return this.http.post<StdResponse<PembelianBukuCompleteModel>>(this.apiUrl,
      this.mapperPembelianBukuComplete.toJson(model, 2))
      .pipe(
        map((res: StdResponse<PembelianBukuCompleteModel>) => {
          return this.convertResponse(res, this.mapperPembelianBukuComplete).data;
        }),
        catchError((res: StdResponse<PembelianBukuCompleteModel>) => {
          return this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator);
        })
      );
  }















  public invoiceBelumLunas(idMi010: string): Observable<StdResponse<InvoiceHeader[]>> {

    return this.http.get<StdResponse<InvoiceHeader[]>>(this.requestUrl('belum-lunas'), {
        params: (new HttpParams()).set('idMi010', idMi010)
      }).pipe(
        map(res => this.convertResponse(res, this.mapperInvoiceHeader, true)),
        catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
        );
  }

  public invoiceBelumLunasByNomor(idMi010: string, nomor: string): Observable<StdResponse<InvoiceHeader[]>> {

    return this.http.get<StdResponse<InvoiceHeader[]>>(this.requestUrl('belum-lunas-nomor'), {
        params: (new HttpParams()).set('idMi010', idMi010)
                                  .set('nomor', nomor)
      }).pipe(
        map(res => this.convertResponse(res, this.mapperInvoiceHeader, true)),
        catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
        );
  }

  public delete(model: InvoiceHeader): Observable<boolean> {

    return this.http.delete<StdResponse<string>>(this.apiUrl, {
      params: (new HttpParams()).set('id', model.id)
                                .set('version', model.version.toString())
    }).pipe(
      map(res => {return true;}),
      catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
    );
  }

  public get(model: InvoiceHeader): Observable<StdResponse<InvoiceManualComplete>> {

    return this.http.get<StdResponse<InvoiceManualComplete>>(this.apiUrl, {
      params: (new HttpParams()).set('nomor', model.nomor)
    }).pipe(
      map((res: StdResponse<InvoiceManualComplete>) => {
        let tmp = this.convertResponse(res, this.mapperInvoiceManualComplete);

        if (tmp.data.detailLainLain !== undefined) {
          tmp.data.detailLainLain = this.mapperInvoiceDetailLainLain.toModelArray(tmp.data.detailLainLain);

          for (let item of tmp.data.detailLainLain) {
            item.keyIn = uuidv4(); 
          }
        }

        return tmp;
      }),
      catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
    );
  }

  public add(model: InvoiceManualComplete): Observable<InvoiceManualComplete> {
    return this.http.post<StdResponse<InvoiceManualComplete>>(this.apiUrl,
      this.mapperInvoiceManualComplete.toJson(model, 2))
      .pipe(
        map((res: StdResponse<InvoiceManualComplete>) => {
          return this.convertResponse(res, this.mapperInvoiceManualComplete).data;
        }),
        catchError((res: StdResponse<InvoiceManualComplete>) => {
          return this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator);
        })
      );
  }

  public edit(model: InvoiceManualComplete): Observable<InvoiceManualComplete> {
    return this.http.put<StdResponse<InvoiceManualComplete>>(this.apiUrl,
      this.mapperInvoiceManualComplete.toJson(model, 2))
      .pipe(
        map((res: StdResponse<InvoiceManualComplete>) => {
          return this.convertResponse(res, this.mapperInvoiceManualComplete).data;
        }),
        catchError((res: StdResponse<InvoiceManualComplete>) => {
          return this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator);
        })
      );
  }

  public convertResponseInvoiceManualComplete(responseBody: StdResponse<any>): StdResponse<any> {

    responseBody.data = this.mapperInvoiceManualComplete.toModel(responseBody.data[this.singleKey]);

    if (responseBody.data) {
      if (responseBody.data.detailLainLain !== undefined) {
        responseBody.data.detailLainLain = this.mapperInvoiceDetailLainLain.toModelArray(responseBody.data.detailLainLain);  
      }

    }

    return responseBody;
  }

  public translateInGridError(data: any) {
    if (data) {
      for (const itemdetails of data.detailLainLain) {
        if (itemdetails.errorMsg) {
          for (const errorMsg of itemdetails.errorMsg) {
            this.errorGridMessageTranslation(errorMsg);
          }
        }
      }
    }    
  }

  private errorGridMessageTranslation(errorMsg: any) {
    if (this.defaultLanguageState.getDefaultLanguage().value === LanguageTypes.indonesia.value) {
      errorMsg.desc = this.messageTranslator.translateLooseMessage(errorMsg, IndonesiaMessageDictionary.getValues());
    } else if (this.defaultLanguageState.getDefaultLanguage().value === LanguageTypes.english.value) {
      errorMsg.desc = this.messageTranslator.translateLooseMessage(errorMsg, EnglishMessageDictionary.getValues());
    }
  }

}

export interface PembelianBukuSearchParams {
  nomorBon?: string;
  tanggalAwal?: Date;
  tanggalAkhir?: Date;
}

export interface PembelianBukuSorts {
  nomorBon?: SortMode;
  // nama?: SortMode;
  // alamat?: SortMode;
  // email?: SortMode;
  // customer?: SortMode;
  // status?: SortMode;
  // fltodep?: SortMode;
  // tgtrn?: SortMode;
}
