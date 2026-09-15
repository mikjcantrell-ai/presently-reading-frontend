import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quote } from '../models';
import { API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class QuoteService {

  constructor(private http: HttpClient) {}

  /** Fetch all quote blocks for a book, ordered by displayOrder. */
  getQuotesByBook(bookId: number): Observable<Quote[]> {
    return this.http.get<Quote[]>(`${API_BASE}/api/books/${bookId}/quotes`);
  }
}
