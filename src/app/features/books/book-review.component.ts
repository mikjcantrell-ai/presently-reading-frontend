import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Book } from '../../core/models';
import { BookService } from '../../core/services/book.service';
import { StarRatingComponent } from '../../shared/star-rating.component';

@Component({
  selector: 'app-book-review',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent],
  template: `
    <div class="review-page" *ngIf="book">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-bg"></div>
        <div class="page-header-overlay"></div>
        <div class="page-header-content container">
          <a routerLink="/library" class="back-link">← Back to Library</a>
          <span class="section-label">Book Review</span>
          <h1 class="section-title">{{ book.title }}</h1>
          <p class="section-desc">By {{ book.authorName }}</p>
        </div>
      </div>

      <div class="review-container container">
        <div class="review-sidebar">
          <div class="book-art">
            <img [src]="book.imageUrl || 'assets/images/book_cover_placeholder.jpg'" [alt]="book.title + ' cover'" />
          </div>
          <div class="book-meta">
            <p><strong>Genre:</strong> {{ book.genre || 'TBD' }}</p>
            <p *ngIf="book.releaseYear"><strong>Published:</strong> {{ book.releaseYear }}</p>
            
            <div style="margin-top: 16px; margin-bottom: 8px;">
              <p style="margin-bottom: 4px; font-size: 0.8rem; font-weight: 700; color: var(--accent); text-transform: uppercase;">My Rating</p>
              <app-star-rating [rating]="book.adminRating || 0" [max]="5"></app-star-rating>
            </div>
            
            <div style="margin-top: 12px; margin-bottom: 16px;">
              <p style="margin-bottom: 4px; font-size: 0.8rem; font-weight: 700; color: var(--accent); text-transform: uppercase;">Reader's Rating</p>
              <app-star-rating 
                [rating]="getReaderRating(book)" 
                [count]="book.readerRatingCount || 0"
                [interactive]="true"
                (ratingClicked)="rateBook(book, $event)">
              </app-star-rating>
            </div>
            <a *ngIf="book.purchaseUrl" [href]="book.purchaseUrl" target="_blank" class="action-btn spotify" style="margin-top: 16px; width: 100%; text-align: center;">
              Buy Book
            </a>
            <a *ngIf="book.goodreadsUrl" [href]="book.goodreadsUrl" target="_blank" class="action-btn" style="margin-top: 8px; width: 100%; text-align: center; background: #ece5d3; color: var(--text-dark);">
              Goodreads
            </a>
          </div>
        </div>

        <div class="review-content">
          <h2 class="review-heading">My Review</h2>
          <div class="review-body" [innerHTML]="book.fullReview"></div>
          
          <div *ngIf="!book.fullReview" class="no-review">
            <p>I haven't posted my full review for this book yet. Check back soon!</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div class="review-page loading-page" *ngIf="!book && !error">
      <div class="container" style="padding-top: 120px; text-align: center;">
        <p>Loading review...</p>
      </div>
    </div>

    <!-- Error State -->
    <div class="review-page error-page" *ngIf="error">
      <div class="container" style="padding-top: 120px; text-align: center;">
        <h2>Book Not Found</h2>
        <p>We couldn't find the review you're looking for.</p>
        <a routerLink="/library" class="action-btn" style="margin-top: 24px; display: inline-block;">Back to Library</a>
      </div>
    </div>
  `,
  styles: [`
    .review-page { background: var(--cream); min-height: 100vh; padding-bottom: 80px; }

    /* Page Header */
    .page-header {
      position: relative;
      height: 40vh;
      min-height: 320px;
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
    .back-link {
      display: inline-block;
      margin-bottom: 24px;
      color: var(--accent);
      font-weight: 600;
      text-decoration: none;
      font-size: 0.9rem;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .back-link:hover { text-decoration: underline; }
    
    .page-header-content .section-title {
      font-family: var(--font-serif);
      font-size: clamp(2.5rem, 5vw, 4rem);
      color: var(--text-dark);
      margin-bottom: 12px;
      line-height: 1.1;
    }
    .page-header-content .section-desc { 
      color: var(--text-mid);
      font-size: 1.2rem;
      font-style: italic;
    }

    /* Review Layout */
    .review-container {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 60px;
      margin-top: 60px;
    }
    
    @media (max-width: 900px) {
      .review-container {
        grid-template-columns: 1fr;
        gap: 40px;
      }
      .review-sidebar {
        max-width: 300px;
        margin: 0 auto;
      }
    }

    /* Sidebar */
    .book-art {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      margin-bottom: 24px;
      aspect-ratio: 2/3;
    }
    .book-art img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .book-meta {
      background: rgba(255,255,255,0.5);
      padding: 24px;
      border-radius: 8px;
    }
    .book-meta p {
      margin: 0 0 8px 0;
      font-size: 0.95rem;
      color: var(--text-mid);
    }
    .book-meta strong {
      color: var(--text-dark);
    }

    /* Review Content */
    .review-heading {
      font-family: var(--font-serif);
      font-size: 2rem;
      color: var(--accent);
      margin-top: 0;
      margin-bottom: 30px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--taupe);
    }
    .review-body {
      font-size: 1.1rem;
      line-height: 1.8;
      color: var(--text-dark);
    }
    /* Simple styling for HTML content within the review */
    .review-body p { margin-bottom: 24px; }
    .review-body h3 { margin-top: 40px; margin-bottom: 16px; font-family: var(--font-serif); color: var(--accent); }
    .review-body blockquote { 
      border-left: 4px solid var(--accent);
      padding-left: 20px;
      margin-left: 0;
      font-style: italic;
      color: var(--text-mid);
    }
    
    .no-review {
      padding: 40px;
      background: rgba(255,255,255,0.5);
      border-radius: 8px;
      text-align: center;
      color: var(--text-mid);
      font-style: italic;
    }
  `]
})
export class BookReviewComponent implements OnInit {
  book: Book | null = null;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.bookService.getBookById(id).subscribe({
        next: (found) => {
          if (found) {
            this.book = found;
            // Preserve line breaks for plain text reviews
            if (found.fullReview && !found.fullReview.includes('<')) {
              found.fullReview = found.fullReview.replace(/\\n/g, '<br>');
            }
          } else {
            this.error = true;
          }
        },
        error: () => this.error = true
      });
    } else {
      this.error = true;
    }
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
