import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book } from '../../core/models';
import { BookService } from '../../core/services/book.service';

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="music-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-bg"></div>
        <div class="page-header-overlay"></div>
        <div class="page-header-content container">
          <span class="section-label">Library</span>
          <h1 class="section-title">Recent <em>Reads</em></h1>
          <p class="section-desc">My latest literary adventures, reviewed and curated for your TBR pile.</p>
        </div>
      </div>

      <!-- Featured Banner (Currently Reading) -->
      <div class="album-banner" *ngIf="currentRead">
        <div class="album-banner-inner container">
          <div class="album-art-thumb">
            <img [src]="currentRead.imageUrl || 'assets/images/book_cover_placeholder.jpg'" [alt]="currentRead.title + ' Cover'" />
          </div>
          <div class="album-info">
            <span class="album-eyebrow">Currently Reading</span>
            <h2 class="album-name">{{ currentRead.title }}</h2>
            <div class="album-meta">
              <span>{{ currentRead.authorName }}</span>
              <span class="meta-dot">&bull;</span>
              <span>{{ currentRead.genre }}</span>
            </div>
          </div>
          <a *ngIf="currentRead.goodreadsUrl" [href]="currentRead.goodreadsUrl" target="_blank" class="album-spotify-btn">
            <span class="btn-icon">🔖</span>
            Follow Updates on Goodreads
          </a>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="books-section container">
        <div class="books-list">
          <div class="book-row" *ngFor="let book of books; let i = index">

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
              <p class="book-genre">{{ book.authorName }} &middot; {{ book.genre }}</p>
              <p class="book-desc">{{ book.description }}</p>
            </div>

            <!-- Right: Actions -->
            <div class="book-right">
              <ng-container *ngIf="!book.featuredStatus; else comingSoon">
                <a [href]="book.purchaseUrl" target="_blank" class="action-btn spotify" *ngIf="book.purchaseUrl">
                  Buy Book
                </a>
                <a [routerLink]="['/quotes']" class="action-btn quotes">
                  Favorite Quotes
                </a>
                <a *ngIf="book.fullReview" [routerLink]="['/review', book.id]" class="action-btn" style="background-color: var(--accent); color: white; border-color: var(--accent);">
                  Read Review
                </a>
              </ng-container>
              <ng-template #comingSoon>
                <span class="coming-pill">Review coming soon...</span>
              </ng-template>
            </div>

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

    /* Featured Banner (Currently Reading) */
    .album-banner {
      background: var(--cream-dark);
      border-bottom: 1px solid var(--taupe);
      border-top: 1px solid var(--taupe);
    }
    .album-banner-inner {
      display: flex;
      align-items: center;
      gap: 28px;
      padding: 32px 0;
      flex-wrap: wrap;
    }
    .album-art-thumb {
      width: 100px;
      height: 140px;
      border-radius: 6px;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    .album-art-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .album-info { flex: 1; min-width: 0; }
    .album-eyebrow {
      display: block;
      font-family: var(--font-sans);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 6px;
    }
    .album-name {
      font-family: var(--font-script);
      font-size: 2rem;
      color: var(--text-dark);
      margin-bottom: 8px;
    }
    .album-meta {
      display: flex;
      gap: 10px;
      align-items: center;
      font-family: var(--font-sans);
      font-size: 0.85rem;
      color: var(--text-mid);
      font-weight: 600;
    }
    .meta-dot { opacity: 0.5; }
    .album-spotify-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--accent);
      color: var(--white);
      border-radius: 4px;
      font-family: var(--font-sans);
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      transition: opacity 0.2s, transform 0.2s var(--ease-bounce), box-shadow 0.2s;
      white-space: nowrap;
    }
    .album-spotify-btn:hover { box-shadow: 0 6px 16px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .btn-icon { font-size: 1.1rem; line-height: 1; }

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
  currentRead: Book | null = null;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.getAllBooks().subscribe(books => {
      this.books = books;
      this.currentRead = books.find(b => b.featuredStatus) || null;
    });
  }

  formatNum(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }
}
