import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { QuoteService } from '../../core/services/quote.service';
import { Book, Quote } from '../../core/models';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="quotes-page">

      <!-- Loading -->
      <div class="loading-center" *ngIf="loading">
        <div class="loading-dot" *ngFor="let d of [1,2,3]"></div>
      </div>

      <ng-container *ngIf="!loading && book">
        <!-- Header -->
        <div class="quotes-header">
          <div class="lh-bg"></div>
          <div class="lh-overlay"></div>
          <div class="lh-content container">
            <a routerLink="/music" class="back-link" id="back-to-music">← All Music</a>
            <h1 class="lh-title">{{ book.title }}</h1>
            <p class="lh-sub"><span class="band-name">Presently Reading</span> · {{ book.releaseYear }}</p>
            <div class="lh-actions">
              <a *ngIf="book.purchaseUrl" [href]="book.purchaseUrl" target="_blank" rel="noopener"
                 class="lh-btn spotify" id="spotify-header-btn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                Listen on Spotify
              </a>
            </div>
          </div>
        </div>

        <!-- Quotes layout -->
        <div class="quotes-layout container" *ngIf="quotes.length > 0">

          <!-- Sidebar -->
          <aside class="quotes-sidebar">
            <img [src]="book.imageUrl || 'assets/images/album_art.png'" [alt]="book.title + ' artwork'" class="sidebar-art" />
            <div class="sidebar-card">
              <h3 class="sidebar-title">{{ book.title }}</h3>
              <p class="sidebar-author"><span class="band-name">Presently Reading</span></p>
              <p class="sidebar-genre" *ngIf="book.genre">{{ book.genre }}</p>
              <a *ngIf="book.purchaseUrl" [href]="book.purchaseUrl" target="_blank" rel="noopener"
                 class="sidebar-spotify" id="sidebar-spotify-btn">
                Listen on Spotify ↗
              </a>
            </div>
          </aside>

          <!-- Quote blocks -->
          <div class="quotes-body">
            <div class="quote-block"
                 *ngFor="let quote of quotes"
                 [class]="'quote-block type-' + quote.sectionType.toLowerCase()"
                 [id]="'quote-' + quote.id">
              <span class="quote-label">{{ quote.sectionLabel }}</span>
              <p class="quote-text" [innerHTML]="formatQuote(quote.content)"></p>
            </div>
          </div>

        </div>

        <!-- No quotes yet -->
        <div class="no-quotes container" *ngIf="quotes.length === 0">
          <p>Quotes coming soon… 🌿</p>
        </div>
      </ng-container>

      <!-- Not found -->
      <div class="not-found container" *ngIf="!loading && !book">
        <h2>Book not found</h2>
        <a routerLink="/music" class="btn-primary">← Back to Music</a>
      </div>

    </div>
  `,
  styles: [`
    .quotes-page { background: var(--cream); min-height: 100vh; padding-bottom: 100px; }

    /* Loading */
    .loading-center {
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 120px;
    }
    .loading-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: var(--amber);
      animation: dotPulse 1.2s ease-in-out infinite;
    }
    .loading-dot:nth-child(2) { animation-delay: 0.2s; }
    .loading-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dotPulse {
      0%,80%,100% { transform: scale(0.7); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Header */
    .quotes-header {
      position: relative;
      min-height: 45vh;
      display: flex;
      align-items: flex-end;
      padding-bottom: 48px;
    }
    .lh-bg {
      position: absolute; inset: 0;
      background-image: url('/assets/images/hero_background.png');
      background-size: cover;
      background-position: center 60%;
    }
    .lh-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(20,14,8,0.3) 0%, rgba(20,14,8,0.8) 70%, rgba(245,237,216,1) 100%);
    }
    .lh-content {
      position: relative;
      z-index: 1;
      padding-top: 100px;
    }
    .back-link {
      display: inline-block;
      font-family: var(--font-sans);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(245,237,216,0.6);
      margin-bottom: 20px;
      transition: color 0.2s;
    }
    .back-link:hover { color: var(--amber-light); }
    .lh-title {
      font-family: var(--font-script);
      font-size: clamp(2.5rem, 6vw, 5rem);
      color: var(--cream);
      line-height: 1;
      margin-bottom: 8px;
      text-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .lh-sub {
      font-family: var(--font-sans);
      font-size: 0.82rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(245,237,216,0.6);
      margin-bottom: 20px;
    }
    .lh-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .lh-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 10px 20px;
      border-radius: 3px;
      font-family: var(--font-sans);
      font-size: 0.8rem;
      font-weight: 700;
      transition: transform 0.2s var(--ease-bounce), opacity 0.2s;
    }
    .lh-btn:hover { transform: translateY(-2px); opacity: 0.85; }
    .lh-btn svg { width: 16px; height: 16px; }
    .lh-btn.spotify { background: #1DB954; color: #fff; }

    /* Layout */
    .quotes-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 60px;
      align-items: start;
      padding-top: 60px;
    }

    /* Sidebar */
    .quotes-sidebar { position: sticky; top: 100px; }
    .sidebar-art {
      width: 100%;
      border-radius: 4px;
      box-shadow: 0 16px 50px rgba(0,0,0,0.15);
      margin-bottom: 20px;
    }
    .sidebar-card {
      background: var(--pine);
      padding: 20px;
      border-radius: 4px;
      color: var(--cream);
    }
    .sidebar-title {
      font-family: var(--font-serif);
      font-size: 1rem;
      margin-bottom: 4px;
    }
    .sidebar-author {
      font-family: var(--font-sans);
      font-size: 0.75rem;
      color: var(--cream-dark);
      opacity: 0.65;
      margin-bottom: 6px;
    }
    .sidebar-genre {
      font-family: var(--font-sans);
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--amber-light);
      margin-bottom: 16px;
    }
    .sidebar-spotify {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      background: #1DB954;
      color: #fff;
      border-radius: 3px;
      font-family: var(--font-sans);
      font-size: 0.75rem;
      font-weight: 700;
      transition: opacity 0.2s, transform 0.2s var(--ease-bounce);
    }
    .sidebar-spotify:hover { opacity: 0.85; transform: translateY(-1px); }

    /* Quote blocks */
    .quote-block {
      margin-bottom: 32px;
      animation: fadeUp 0.5s ease both;
    }
    .quote-label {
      display: inline-block;
      font-family: var(--font-sans);
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--amber);
      margin-bottom: 10px;
      padding: 3px 10px;
      background: rgba(212,134,58,0.1);
      border-radius: 2px;
    }
    .quote-text {
      font-family: var(--font-serif);
      font-size: 1.05rem;
      line-height: 2;
      color: var(--text-mid);
    }

    /* Section type styles */
    .type-chorus {
      background: rgba(212,134,58,0.06);
      border-left: 3px solid var(--amber);
      padding: 20px 24px;
      border-radius: 0 4px 4px 0;
    }
    .type-chorus .quote-text { color: var(--text-dark); }

    .type-bridge {
      background: rgba(107,124,94,0.08);
      border-left: 3px solid var(--sage);
      padding: 20px 24px;
      border-radius: 0 4px 4px 0;
    }

    .type-outro .quote-text {
      font-style: italic;
      color: var(--text-light);
      font-size: 1.1rem;
    }

    .no-quotes, .not-found {
      padding: 80px 0;
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 1.2rem;
      color: var(--text-light);
      text-align: center;
    }

    @media (max-width: 900px) {
      .quotes-layout { grid-template-columns: 1fr; }
      .quotes-sidebar {
        position: static;
        display: flex;
        gap: 20px;
        align-items: flex-start;
      }
      .sidebar-art { width: 140px; flex-shrink: 0; }
      .sidebar-card { flex: 1; }
    }
  `]
})
export class QuotesComponent implements OnInit, AfterViewInit {
  book: Book | null = null;
  quotes: Quote[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private quoteService: QuoteService,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookService.getBookById(id).subscribe({
      next: book => {
        this.book = book;
        // Set SEO meta for this specific book
        this.seo.set({
          title: `${book.title} Quotes | Presently Reading`,
          description: `Read the full quotes for "${book.title}" by Presently Reading. ${book.description ?? ''}`.trim(),
          url: `https://presentlyreading.com/quotes/${id}`,
          type: 'music.book',
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "MusicRecording",
            "name": book.title,
            "url": `https://presentlyreading.com/quotes/${id}`,
            "byAuthor": {
              "@type": "MusicGroup",
              "name": "Presently Reading"
            },
            "inAlbum": {
              "@type": "MusicAlbum",
              "name": "Presently Reading"
            }
          }
        });
        this.quoteService.getQuotesByBook(id).subscribe({
          next: quotes => { this.quotes = quotes; this.loading = false; },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit(): void {}

  /** Convert newlines in quote content to <br> tags safely. */
  formatQuote(content: string): string {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }
}
