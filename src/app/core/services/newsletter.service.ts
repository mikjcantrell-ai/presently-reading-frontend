import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewsletterRequest, NewsletterResponse } from '../models';
import { API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class NewsletterService {

  constructor(private http: HttpClient) {}

  subscribe(email: string): Observable<NewsletterResponse> {
    return this.http.post<NewsletterResponse>(
      `${API_BASE}/api/newsletter/subscribe`,
      { email }
    );
  }
}
