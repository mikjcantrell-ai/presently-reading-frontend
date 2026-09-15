import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models';
import { API_BASE } from '../config/api.config';

/**
 * Angular HTTP service wrapping the Spring Boot /api/books endpoints.
 * Spring Boot controller → BookController @ http://localhost:8082/api/books
 * CORS allows origin → http://localhost:4201 (CorsConfig.java)
 */
@Injectable({ providedIn: 'root' })
export class BookService {

  private readonly BASE = `${API_BASE}/api/books`;

  constructor(private http: HttpClient) {}

  /** Fetch all books ordered by displayOrder. */
  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.BASE);
  }

  /** Fetch books marked featuredStatus=true (home page). */
  getFeaturedBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.BASE}/featured`);
  }

  /** Fetch a single book by database ID. */
  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.BASE}/${id}`);
  }

  /** Filter books by genre. */
  getBooksByGenre(genre: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.BASE}/genre/${encodeURIComponent(genre)}`);
  }
}
