import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Book } from '../../core/models';
import { BookService } from '../../core/services/book.service';
import { StarRatingComponent } from '../../shared/star-rating.component';

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StarRatingComponent],
  template: `
    <div class="music-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-bg"></div>
        <div class="page-header-overlay"></div>
        <div class="page-header-content container">
          <span class="section-label">Library</span>
          <h1 class="section-title">My <em>Books</em></h1>
          <p class="section-desc">My latest literary adventures, reviewed and curated for your TBR pile.</p>
        </div>
      </div>

      <!-- Controls Section -->
      <div class="container" style="padding-top: 40px;">
        <div class="table-controls">
          <div class="filter-group">
            <button class="filter-btn" [class.active]="statusFilter === 'ALL'" (click)="statusFilter = 'ALL'">All</button>
            <button class="filter-btn" [class.active]="statusFilter === 'READ'" (click)="statusFilter = 'READ'">Read</button>
            <button class="filter-btn" [class.active]="statusFilter === 'CURRENTLY_READING'" (click)="statusFilter = 'CURRENTLY_READING'">Reading</button>
            <button class="filter-btn" [class.active]="statusFilter === 'TBR'" (click)="statusFilter = 'TBR'">To Be Read</button>
          </div>
          <div class="search-group">
            <span class="sort-label">Sort by:</span>
            <select class="sort-select" [(ngModel)]="sortColumn" (change)="setSort(sortColumn)">
              <option value="displayOrder">Custom Order</option>
              <option value="title">Title</option>
              <option value="authorName">Author</option>
              <option value="genre">Genre</option>
              <option value="releaseYear">Year</option>
            </select>
            <button class="filter-btn" (click)="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </button>
            <input type="text" class="search-input" placeholder="Search books..." [(ngModel)]="searchQuery" />
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="books-section container">
        <div class="books-list">
          <div class="book-row" *ngFor="let book of filteredAndSortedBooks; let i = index">

            <!-- Left: Artwork + number -->
            <div class="book-left">
              <span class="book-num">{{ formatNum(i + 1) }}</span>
              <div class="book-art">
                <img [src]="book.imageUrl || 'assets/images/book_cover_placeholder.jpg'" [alt]="book.title + ' cover'" />
              </div>
            </div>

            <!-- Middle: Info -->
            <div class="book-middle">
              <h2 class="book-title">{{ book.title }}</h2>
              <p class="book-genre">{{ book.authorName }} &middot; {{ book.genre }} <span *ngIf="book.releaseYear">&middot; {{ book.releaseYear }}</span></p>
              <p class="book-status" style="font-size: 0.75rem; font-weight: 700; color: var(--accent); text-transform: uppercase; margin-bottom: 8px;">
                {{ book.readingStatus === 'CURRENTLY_READING' ? 'Currently Reading' : book.readingStatus === 'READ' ? 'Read' : 'To Be Read' }}
              </p>
              
              <ng-container *ngIf="book.readingStatus !== 'TBR'">
                <div class="book-ratings" style="margin-bottom: 12px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-dark); text-transform: uppercase;">My Rating:</span>
                    <app-star-rating [rating]="book.adminRating || 0" [max]="5"></app-star-rating>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-dark);">Reader's Rating:</span>
                    <app-star-rating 
                      [rating]="getReaderRating(book)" 
                      [count]="book.readerRatingCount || 0"
                      [interactive]="true"
                      (ratingClicked)="rateBook(book, $event)">
                    </app-star-rating>
                  </div>
                </div>
              </ng-container>
              
              <p class="book-desc">{{ book.description }}</p>
            </div>

            <!-- Right: Actions -->
            <div class="book-right">
              <ng-container *ngIf="book.readingStatus === 'READ' || book.readingStatus === 'CURRENTLY_READING'">
                <a [href]="book.purchaseUrl" target="_blank" class="action-btn spotify" *ngIf="book.purchaseUrl">
                  Buy Book
                </a>
                <a [routerLink]="['/quotes']" class="action-btn quotes">
                  Favorite Quotes
                </a>
                <a *ngIf="book.fullReview" [routerLink]="['/review', book.id]" class="action-btn" style="background-color: var(--accent); color: white; border-color: var(--accent);">
                  Read Review
                </a>
                <span *ngIf="!book.fullReview && !book.purchaseUrl" class="coming-pill">Review coming soon...</span>
              </ng-container>
              <ng-container *ngIf="book.readingStatus === 'TBR'">
                 <span class="coming-pill">To Be Read</span>
              </ng-container>
            </div>

          </div>
          
          <div *ngIf="filteredAndSortedBooks.length === 0" style="padding: 40px; text-align: center; color: var(--text-mid); font-style: italic;">
            No books found matching your criteria.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .music-page { background: var(--cream); min-height: 100vh; padding-bottom: 80px; }

    /* Page Header */
    .page-header {
      position: relative;
      height: 50vh;
      min-height: 360px;
      display: flex;
      align-items: center;
    }
    .page-header-bg {
      position: absolute; inset: 0;
      background-image: url('/assets/images/book_about.jpg');
      background-size: cover;
      background-position: center 30%;
    }
    .page-header-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(235, 226, 212, 0.95) 0%, rgba(220, 208, 192, 0.92) 100%);
    }
    .page-header-content {
      position: relative; z-index: 1;
      padding-top: 80px;
    }
    .page-header-content .section-title {
      font-family: var(--font-serif);
      font-size: clamp(2.5rem, 5vw, 4rem);
      color: var(--text-dark);
      margin-bottom: 12px;
    }
    .page-header-content .section-desc { 
      max-width: 500px; 
      color: var(--text-mid);
      font-size: 1.1rem;
    }

    /* Books Section */
    .books-section { padding: 60px 0; }

    .table-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .filter-group {
      display: flex;
      gap: 8px;
    }
    .filter-btn {
      padding: 8px 16px;
      border: 1px solid var(--taupe);
      background: var(--white);
      color: var(--text-dark);
      border-radius: 4px;
      font-family: var(--font-sans);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover { background: var(--cream); }
    .filter-btn.active {
      background: var(--accent);
      color: var(--white);
      border-color: var(--accent);
    }

    .search-group {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .sort-label {
      font-family: var(--font-sans);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-mid);
    }
    .sort-select, .search-input {
      padding: 8px 12px;
      border: 1px solid var(--taupe);
      border-radius: 4px;
      font-family: var(--font-sans);
      font-size: 0.8rem;
      background: var(--white);
    }
    .search-input { width: 200px; }

    .books-list { display: flex; flex-direction: column; gap: 0; }

    .book-row {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 24px;
      padding: 24px 0;
      border-bottom: 1px solid var(--taupe);
      align-items: center;
      transition: background 0.2s;
    }
    .book-row:hover { background: var(--cream-dark); border-radius: 8px; padding-left: 12px; padding-right: 12px;}

    .book-left {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 80px;
    }
    .book-num {
      font-family: var(--font-sans);
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--accent);
      width: 24px;
      text-align: center;
    }
    .book-art {
      width: 70px; height: 100px;
      border-radius: 4px;
      overflow: hidden;
      background: var(--taupe);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .book-art img { width: 100%; height: 100%; object-fit: cover; }
    .placeholder-emoji { font-size: 2rem; opacity: 0.5; }

    .book-middle { flex: 1; min-width: 0; }
    .book-title {
      font-family: var(--font-serif);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 3px;
    }
    .book-genre {
      font-family: var(--font-sans);
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--accent-dark);
      margin-bottom: 8px;
    }
    .book-desc {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 0.95rem;
      color: var(--text-mid);
      line-height: 1.6;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .book-meta {
      display: flex;
      gap: 12px;
      font-family: var(--font-sans);
      font-size: 0.85rem;
    }

    .book-right { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      border-radius: 4px;
      font-family: var(--font-sans);
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      transition: transform 0.2s var(--ease-bounce), opacity 0.2s, box-shadow 0.2s;
    }
    .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .action-btn.spotify { background: var(--accent); color: var(--white); }
    .action-btn.quotes {
      background: var(--white);
      border: 1px solid var(--taupe);
      color: var(--accent-dark);
    }
    .coming-pill {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 0.9rem;
      color: var(--text-light);
    }


    @media (max-width: 640px) {
      .book-row { grid-template-columns: auto 1fr; gap: 16px; }
      .book-right { grid-column: 1 / -1; padding-left: 56px; }
      .album-banner-inner { gap: 20px; }
      .album-spotify-btn { width: 100%; justify-content: center; }
      .book-art { width: 60px; height: 90px; }
    }
  `]
})
export class BooksComponent implements OnInit {
  books: Book[] = [];

  sortColumn: keyof Book = 'displayOrder';
  sortDirection: 'asc' | 'desc' = 'asc';
  statusFilter: 'ALL' | 'READ' | 'CURRENTLY_READING' | 'TBR' = 'ALL';
  searchQuery: string = '';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.getAllBooks().subscribe(books => {
      this.books = books.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    });
  }

  get filteredAndSortedBooks(): Book[] {
    let result = [...this.books];
    if (this.statusFilter !== 'ALL') {
      result = result.filter(b => b.readingStatus === this.statusFilter);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) || 
        (b.authorName || '').toLowerCase().includes(q) || 
        (b.genre || '').toLowerCase().includes(q) ||
        (b.releaseYear || '').toString().includes(q)
      );
    }
    result.sort((a, b) => {
      let valA = a[this.sortColumn] || '';
      let valB = b[this.sortColumn] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }

  setSort(col: keyof Book): void {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  formatNum(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  getReaderRating(book: Book): number {
    if (!book.readerRatingCount || book.readerRatingCount === 0) return 0;
    return book.readerRatingSum! / book.readerRatingCount;
  }

  rateBook(book: Book, score: number) {
    const key = `rated_book_${book.id}`;
    if (localStorage.getItem(key)) {
      alert("You have already rated this book!");
      return;
    }
    
    this.bookService.rateBook(book.id, score).subscribe({
      next: (updatedBook) => {
        book.readerRatingSum = updatedBook.readerRatingSum;
        book.readerRatingCount = updatedBook.readerRatingCount;
        localStorage.setItem(key, 'true');
      },
      error: () => {
        alert("Failed to submit rating.");
      }
    });
  }
}
