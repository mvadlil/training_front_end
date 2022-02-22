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
import { Diskon } from './model/diskon.model';


@Injectable()
export class DiskonService extends BaseService {

  private apiUrl = StdConstants.API_ADDRESS + '/api/genre';

  private singleKey = 'item';
  private multiKey = 'items';
  private apiMessages = '';

  private mapperDiskon:
    StdModelMapper<Diskon> = new StdModelMapper<Diskon>(Diskon);

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
    searchParams?: DiskonSearchParams,
    sorts?: DiskonSorts,
    paging?: StdPagingRequest): Observable<StdResponse<Diskon[]>> {

    return this.http.get<StdResponse<Diskon[]>>(this.requestUrl('search'), {
        params: this.mapperDiskon.toSearchParams(searchParams, sorts, paging) 
      }).pipe(
        map(res => this.convertResponse(res, this.mapperDiskon, true)),
        catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
        );
  }

  private requestUrl(extraUri?: string): string {
    return this.apiUrl + (extraUri ? '/' + extraUri : '');
  }

  public add(model: Diskon): Observable<Diskon> {
    return this.http.post<StdResponse<Diskon>>(this.apiUrl,
      this.mapperDiskon.toJson(model, 0))
      .pipe(
        map((res: StdResponse<Diskon>) => {
          return this.convertResponse(res, this.mapperDiskon).data;
        }),
        catchError((res: StdResponse<Diskon>) => {
          return this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator);
        })
      );
  }

  public edit(model: Diskon): Observable<Diskon> {
    return this.http.put<StdResponse<Diskon>>(this.apiUrl,
      this.mapperDiskon.toJson(model, 0))
      .pipe(
        map((res: StdResponse<Diskon>) => {
          return this.convertResponse(res, this.mapperDiskon).data;
        }),
        catchError((res: StdResponse<Diskon>) => {
          return this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator);
        })
      );
  }

  public delete(model: Diskon): Observable<boolean> {

    return this.http.delete<StdResponse<string>>(this.apiUrl, {
      params: (new HttpParams()).set('id', model.id)
                                .set('version', model.version.toString())
    }).pipe(
      map(res => {return true;}),
      catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
    );
  }

  public get(model: Diskon): Observable<StdResponse<Diskon>> {

    return this.http.get<StdResponse<Diskon>>(this.apiUrl, {
      params: (new HttpParams()).set('nama', model.kodeGenre)
    }).pipe(
      map((res: StdResponse<Diskon>) => {
        let tmp = this.convertResponse(res, this.mapperDiskon);
        return tmp;
      }),
      catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
    );
  }

  public getByGenre(genreBuku: string): Observable<StdResponse<Diskon>> {

    return this.http.get<StdResponse<Diskon>>(this.requestUrl('get-by-nama'), {
      params: (new HttpParams()).set('genreBuku', genreBuku)
    }).pipe(
      map((res: StdResponse<Diskon>) => {
        const tmp = this.convertResponse(res, this.mapperDiskon);

        return tmp;
      }),
      catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
    );
  }

}
export interface DiskonSearchParams {
  genreBuku?: string;
  diskonPerGenre?: number;
}

export interface DiskonSorts {
  genreBuku?: SortMode;
  diskonPerGenre?: SortMode;
}

