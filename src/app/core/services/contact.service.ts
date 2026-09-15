import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactRequest, ApiResponse } from '../models';
import { API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class ContactService {

  constructor(private http: HttpClient) {}

  sendInquiry(request: ContactRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${API_BASE}/api/contact`,
      request
    );
  }
}
