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
import { DaftarBuku } from './model/daftarbuku.model';


@Injectable()
export class DaftarBukuService extends BaseService {

  private apiUrl = StdConstants.API_ADDRESS + '/api/buku';

  private singleKey = 'item';
  private multiKey = 'items';
  private apiMessages = '';

  private mapperDaftarBuku:
    StdModelMapper<DaftarBuku> = new StdModelMapper<DaftarBuku>(DaftarBuku);

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
    searchParams?: DaftarBukuSearchParams,
    sorts?: DaftarBukuSorts,
    paging?: StdPagingRequest): Observable<StdResponse<DaftarBuku[]>> {

    return this.http.get<StdResponse<DaftarBuku[]>>(this.requestUrl('search'), {
        params: this.mapperDaftarBuku.toSearchParams(searchParams, sorts, paging) 
      }).pipe(
        map(res => this.convertResponse(res, this.mapperDaftarBuku, true)),
        catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
        );
  }

  // public search(): Observable<DaftarBuku[]> {

  //   return this.http.get<DaftarBuku[]>(this.apiUrl).pipe(
  //       map(res => this.convertResponse(res, this.mapperDaftarBuku, true)),
  //       catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
  //       );
  // }


  private requestUrl(extraUri?: string): string {
    return this.apiUrl + (extraUri ? '/' + extraUri : '');
  }

  public add(model: DaftarBuku): Observable<DaftarBuku> {
    return this.http.post<StdResponse<DaftarBuku>>(this.apiUrl,
      this.mapperDaftarBuku.toJson(model, 0))
      .pipe(
        map((res: StdResponse<DaftarBuku>) => {
          return this.convertResponse(res, this.mapperDaftarBuku).data;
        }),
        catchError((res: StdResponse<DaftarBuku>) => {
          return this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator);
        })
      );
  }

  public edit(model: DaftarBuku): Observable<DaftarBuku> {
    return this.http.put<StdResponse<DaftarBuku>>(this.apiUrl,
      this.mapperDaftarBuku.toJson(model, 0))
      .pipe(
        map((res: StdResponse<DaftarBuku>) => {
          return this.convertResponse(res, this.mapperDaftarBuku).data;
        }),
        catchError((res: StdResponse<DaftarBuku>) => {
          return this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator);
        })
      );
  }

  public delete(model: DaftarBuku): Observable<boolean> {

    return this.http.delete<StdResponse<string>>(this.apiUrl, {
      params: (new HttpParams()).set('id', model.id)
                                .set('version', model.version.toString())
    }).pipe(
      map(res => {return true;}),
      catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
    );
  }

  public get(model: DaftarBuku): Observable<StdResponse<DaftarBuku>> {

    return this.http.get<StdResponse<DaftarBuku>>(this.apiUrl, {
      params: (new HttpParams()).set('nama', model.namaBuku)
    }).pipe(
      map((res: StdResponse<DaftarBuku>) => {
        let tmp = this.convertResponse(res, this.mapperDaftarBuku);
        return tmp;
      }),
      catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
    );
  }

  public getByNama(nama: string): Observable<StdResponse<DaftarBuku>> {

    return this.http.get<StdResponse<DaftarBuku>>(this.requestUrl(), {
      params: (new HttpParams()).set('nama', nama)
    }).pipe(
      map((res: StdResponse<DaftarBuku>) => {
        const tmp = this.convertResponse(res, this.mapperDaftarBuku);

        return tmp;
      }),
      catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
    );
  }

}
export interface DaftarBukuSearchParams {
  kodeBuku?: string;
  namaBuku?: string;
  dataGenre?: string;
  hargaBuku?: number;
  stockBuku?: number;
  active?: boolean;
}

export interface DaftarBukuSorts {
  kodeBuku?: SortMode;
  namaBuku?: SortMode;
  dataGenre?: SortMode;
  hargaBuku?: SortMode;
  stockBuku?: SortMode;
  active?: SortMode;
}

