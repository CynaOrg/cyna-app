import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../interfaces/product.interface';

interface ApiResponse<T> {
  data: T;
  meta?: { timestamp: string; requestId: string };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}/${path}`, {
        params: this.buildParams(params),
      })
      .pipe(map((response) => response.data));
  }

  getList<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): Observable<T[]> {
    return this.http
      .get<ApiResponse<T[]>>(`${this.baseUrl}/${path}`, {
        params: this.buildParams(params),
      })
      .pipe(map((response) => response.data));
  }

  getPaginated<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): Observable<PaginatedResponse<T>> {
    return this.http.get<PaginatedResponse<T>>(`${this.baseUrl}/${path}`, {
      params: this.buildParams(params),
    });
  }

  post<TBody, TResponse>(path: string, body: TBody): Observable<TResponse> {
    return this.http
      .post<ApiResponse<TResponse>>(`${this.baseUrl}/${path}`, body)
      .pipe(map((response) => response.data));
  }

  put<TBody, TResponse>(path: string, body: TBody): Observable<TResponse> {
    return this.http
      .put<ApiResponse<TResponse>>(`${this.baseUrl}/${path}`, body)
      .pipe(map((response) => response.data));
  }

  patch<TBody, TResponse>(path: string, body: TBody): Observable<TResponse> {
    return this.http
      .patch<ApiResponse<TResponse>>(`${this.baseUrl}/${path}`, body)
      .pipe(map((response) => response.data));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.baseUrl}/${path}`)
      .pipe(map((response) => response.data));
  }

  private buildParams(
    params?: Record<string, string | number | boolean>,
  ): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    }
    return httpParams;
  }
}
