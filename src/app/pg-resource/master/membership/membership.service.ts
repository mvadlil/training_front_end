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
import { Membership } from './model/membership.model';


@Injectable()
export class MembershipService extends BaseService {

  private apiUrl = StdConstants.API_ADDRESS + '/api/membership';

  private singleKey = 'item';
  private multiKey = 'items';
  private apiMessages = '';

  private mapperMembership:
    StdModelMapper<Membership> = new StdModelMapper<Membership>(Membership);

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
    searchParams?: MembershipSearchParams,
    sorts?: MembershipSorts,
    paging?: StdPagingRequest): Observable<StdResponse<Membership[]>> {

    return this.http.get<StdResponse<Membership[]>>(this.requestUrl('search'), {
        params: this.mapperMembership.toSearchParams(searchParams, sorts, paging) 
      }).pipe(
        map(res => this.convertResponse(res, this.mapperMembership, true)),
        catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
        );
  }

  private requestUrl(extraUri?: string): string {
    return this.apiUrl + (extraUri ? '/' + extraUri : '');
  }

  public add(model: Membership): Observable<Membership> {
    return this.http.post<StdResponse<Membership>>(this.apiUrl,
      this.mapperMembership.toJson(model, 0))
      .pipe(
        map((res: StdResponse<Membership>) => {
          return this.convertResponse(res, this.mapperMembership).data;
        }),
        catchError((res: StdResponse<Membership>) => {
          return this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator);
        })
      );
  }

  public edit(model: Membership): Observable<Membership> {
    return this.http.put<StdResponse<Membership>>(this.apiUrl,
      this.mapperMembership.toJson(model, 0))
      .pipe(
        map((res: StdResponse<Membership>) => {
          return this.convertResponse(res, this.mapperMembership).data;
        }),
        catchError((res: StdResponse<Membership>) => {
          return this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator);
        })
      );
  }

  public delete(model: Membership): Observable<boolean> {

    return this.http.delete<StdResponse<string>>(this.apiUrl, {
      params: (new HttpParams()).set('id', model.id)
                                .set('version', model.version.toString())
    }).pipe(
      map(res => {return true;}),
      catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
    );
  }

  public get(model: Membership): Observable<StdResponse<Membership>> {

    return this.http.get<StdResponse<Membership>>(this.apiUrl, {
      params: (new HttpParams()).set('nama', model.namaMembership)
    }).pipe(
      map((res: StdResponse<Membership>) => {
        let tmp = this.convertResponse(res, this.mapperMembership);
        return tmp;
      }),
      catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
    );
  }

  public getByNama(namaMember: string): Observable<StdResponse<Membership>> {

    return this.http.get<StdResponse<Membership>>(this.requestUrl(), {
      params: (new HttpParams()).set('nama', namaMember)
    }).pipe(
      map((res: StdResponse<Membership>) => {
        const tmp = this.convertResponse(res, this.mapperMembership);

        return tmp;
      }),
      catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
    );
  }

}
export interface MembershipSearchParams {
  namaMembership?: string;
  kodeMembership?: string;
}

export interface MembershipSorts {
  namaMembership?: SortMode;
  kodeMembership?: SortMode;
}

// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Router } from '@angular/router';
// import { Observable } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import { DefaultLanguageState } from 'src/app/base/default-language/default-language.state';
// import { BaseService } from 'src/app/common/common-class/base-service';
// import { StdModelMapper } from 'src/app/common/common-class/standar-api-mapper';
// import { StdConstants } from 'src/app/common/common-class/standar-api.constants';
// import { AppAlertService } from 'src/app/common/common-components/alert/app-alert.service';
// import { SortMode, StdPagingRequest } from 'src/app/common/common-model/standar-api-request.model';
// import { StdResponse } from 'src/app/common/common-model/standar-api-response.model';
// import { StdMessageTranslator } from 'src/app/common/common-services/standar-api-message-translator';
// import { Membership } from './model/membership.model';


// @Injectable()
// export class MembershipService extends BaseService {

//   private apiUrl = StdConstants.API_ADDRESS + '/membership';

//   private singleKey = 'item';
//   private multiKey = 'items';
//   private apiMessages = '';

//   private mapperCustomer:
//     StdModelMapper<Membership> = new StdModelMapper<Membership>(Membership);

//   constructor(private http: HttpClient, 
//               private messageTranslator: StdMessageTranslator,
//               private defaultLanguageState: DefaultLanguageState,
//               private router: Router,
//               private appAlertService: AppAlertService) {

//     super();

//   }

//   private convertResponse(responseBody: any, mapper: any, isMulti: boolean = false): any {

//     // responseBody.data = isMulti
//     //   ? mapper.toModelArray(responseBody.data[this.multiKey])
//     //   : mapper.toModel(responseBody.data[this.singleKey]);
    
//     responseBody.data = isMulti
//     ? mapper.toModelArray(responseBody)
//     : mapper.toModel(responseBody);

//     // this.messageTranslator.translateApiResponse(responseBody, this.apiMessages);

//     return responseBody;
//   }

//   // public search(
//   //   searchParams?: CustomerSearchParams,
//   //   sorts?: CustomerSorts,
//   //   paging?: StdPagingRequest): Observable<StdResponse<Membership[]>> {

//   //   return this.http.get<StdResponse<Membership[]>>(this.requestUrl('search'), {
//   //       params: this.mapperCustomer.toSearchParams(searchParams, sorts, paging) 
//   //     }).pipe(
//   //       map(res => this.convertResponse(res, this.mapperCustomer, true)),
//   //       catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
//   //       );
//   // }

//   public search(): Observable<Membership[]> {

//     return this.http.get<Membership[]>(this.apiUrl).pipe(
//         map(res => this.convertResponse(res, this.mapperCustomer, true)),
//         catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
//         );
//   }

//   private requestUrl(extraUri?: string): string {
//     return this.apiUrl + (extraUri ? '/' + extraUri : '');
//   }

//   public add(model: Membership): Observable<Membership> {
//     return this.http.post<StdResponse<Membership>>(this.apiUrl,
//       this.mapperCustomer.toJson(model, 0))
//       .pipe(
//         map((res: StdResponse<Membership>) => {
//           return this.convertResponse(res, this.mapperCustomer).data;
//         }),
//         catchError((res: StdResponse<Membership>) => {
//           return this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator);
//         })
//       );
//   }

//   public edit(model: Membership): Observable<Membership> {
//     return this.http.put<StdResponse<Membership>>(this.apiUrl,
//       this.mapperCustomer.toJson(model, 0))
//       .pipe(
//         map((res: StdResponse<Membership>) => {
//           return this.convertResponse(res, this.mapperCustomer).data;
//         }),
//         catchError((res: StdResponse<Membership>) => {
//           return this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator);
//         })
//       );
//   }

//   public delete(model: Membership): Observable<boolean> {

//     return this.http.delete<StdResponse<string>>(this.apiUrl, {
//       params: (new HttpParams()).set('id', model.id)
//                                 .set('version', model.version.toString())
//     }).pipe(
//       map(res => {return true;}),
//       catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
//     );
//   }

//   public get(model: Membership): Observable<StdResponse<Membership>> {

//     return this.http.get<StdResponse<Membership>>(this.apiUrl, {
//       params: (new HttpParams()).set('nama', model.namaMember)
//     }).pipe(
//       map((res: StdResponse<Membership>) => {
//         let tmp = this.convertResponse(res, this.mapperCustomer);
//         return tmp;
//       }),
//       catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
//     );
//   }

//   public getByNama(nama: string): Observable<StdResponse<Membership>> {

//     return this.http.get<StdResponse<Membership>>(this.requestUrl('get-by-nama'), {
//       params: (new HttpParams()).set('nama', nama)
//     }).pipe(
//       map((res: StdResponse<Membership>) => {
//         const tmp = this.convertResponse(res, this.mapperCustomer);

//         return tmp;
//       }),
//       catchError(res => this.handleError(res, this.appAlertService, this.defaultLanguageState, this.router, this.messageTranslator))
//     );
//   }

// }
// export interface CustomerSearchParams {
//   nama?: string;
//   picnama?: string;
//   picalamat?: string;
//   picemail?: string;
//   billnama?: string;
//   billalamat?: string;
//   billemail?: string;
//   billcust2?: string;
//   billnama2?: string;
//   flakt?: string;
// }

// export interface CustomerSorts {
//   nama?: SortMode;
//   picnama?: SortMode;
//   picalamat?: SortMode;
//   picemail?: SortMode;
//   billnama?: SortMode;
//   billalamat?: SortMode;
//   billemail?: SortMode;
//   billcust2?: SortMode;
//   billnama2?: SortMode;
// }


