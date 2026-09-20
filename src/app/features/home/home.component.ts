import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NewsletterService } from '../../core/services/newsletter.service';
import { BookService } from '../../core/services/book.service';
import { API_BASE } from '../../core/config/api.config';
import { Book } from '../../core/models';
import { StarRatingComponent } from '../../shared/star-rating.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StarRatingComponent],
  template: `
    <!-- HERO -->
    <section id="home" class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-content-inner">
          <p class="hero-eyebrow">{{ c('hero_eyebrow') }}</p>
          <h1 class="hero-title">
            <span class="title-script">Presently</span>
            <span class="title-serif">Reading</span>
          </h1>
          <p class="hero-tagline">{{ c('hero_tagline') }}</p>
          <p class="hero-sub">{{ c('hero_sub') }}</p>
          <div class="hero-cta">
            <a routerLink="/library" class="btn-primary" id="listen-now-btn">Explore Reads</a>
            <a routerLink="/about" class="btn-ghost" id="our-story-btn">Meet Melody</a>
          </div>
        </div>
      </div>
      <div class="hero-scroll-hint">
        <span>Scroll</span>
        <div class="scroll-arrow"></div>
      </div>
    </section>

    <!-- ABOUT -->
    <section id="about" class="about">
      <div class="about-image-col">
        <div class="about-image-wrap">
          <img src="assets/images/book_about.jpg" alt="Aesthetic flatlay of an open vintage book, stylish reading glasses, dusty rose flowers, and a poured latte on a rustic wooden table" class="about-img" />
          <div class="about-image-badge">
            <span>Est.</span>
            <span class="badge-year">2024</span>
          </div>
        </div>
      </div>
      <div class="about-content">
        <span class="section-label">About Melody</span>
        <h2 class="section-title">Getting Lost in <em>Beautiful Stories</em> & Coffee Cups</h2>
        <p class="about-text" [innerHTML]="c('about_text_1')"></p>
        <p class="about-text" [innerHTML]="c('about_text_2')"></p>
        <div class="about-tags">
          <span class="tag">☕ Cozy Vibes</span>
          <span class="tag">✨ Fantasy</span>
          <span class="tag">💕 Romance</span>
          <span class="tag">📚 Literary Fiction</span>
          <span class="tag">🌧️ Rainy Days</span>
        </div>
        <div class="about-quote">
          <blockquote>"{{ c('about_quote') }}"</blockquote>
          <cite>— {{ c('about_quote_src') }}</cite>
        </div>
        <div class="about-cta" style="margin-top: 24px;">
            <a routerLink="/about" class="btn-primary">Read More</a>
        </div>
      </div>
    </section>

    <!-- RECENT READS -->
    <section id="recent-reads" class="music" *ngIf="readBooks.length > 0">
      <div class="music-inner">
        <div class="section-header center">
          <span class="section-label">Reviews</span>
          <h2 class="section-title">Recent <em>Reads</em></h2>
          <p class="section-desc">My latest literary adventures, reviewed and curated for your TBR pile.</p>
        </div>

        <div class="tracks-grid">
          <div *ngFor="let book of readBooks" class="track-card">
            <div class="track-artwork">
              <img [src]="book.imageUrl || 'assets/images/book_cover.jpg'" [alt]="book.title" />
            </div>
            <div class="track-info">
              <div *ngIf="book.adminRating" style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 0.7rem; font-weight: 700; color: var(--accent); text-transform: uppercase;">Admin Rating:</span>
                <app-star-rating [rating]="book.adminRating" [max]="5"></app-star-rating>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 0.7rem; font-weight: 700; color: var(--accent); text-transform: uppercase;">Reader's Rating:</span>
                <app-star-rating 
                  [rating]="getReaderRating(book)" 
                  [count]="book.readerRatingCount || 0"
                  [interactive]="true"
                  (ratingClicked)="rateBook(book, $event)">
                </app-star-rating>
              </div>
              <h3 class="track-title">{{ book.title }}</h3>
              <p class="track-meta">{{ book.authorName }} · {{ book.genre }}</p>
              <p class="track-desc">{{ book.description }}</p>
              <div class="track-links">
                <a *ngIf="book.fullReview" [routerLink]="['/review', book.id]" class="stream-btn">Read Full Review</a>
                <a *ngIf="!book.fullReview" routerLink="/library" class="stream-btn">View in Library</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CURRENTLY READING -->
    <section id="currently-reading" class="music" style="background: var(--surface);" *ngIf="currentlyReadingBooks.length > 0">
      <div class="music-inner">
        <div class="section-header center">
          <span class="section-label">On The Nightstand</span>
          <h2 class="section-title">Currently <em>Reading</em></h2>
        </div>

        <div class="tracks-grid">
          <div *ngFor="let book of currentlyReadingBooks" class="track-card coming-soon">
            <div class="track-artwork placeholder-art">
              <img *ngIf="book.imageUrl" [src]="book.imageUrl" [alt]="book.title" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.5;" />
              <div *ngIf="!book.imageUrl" class="placeholder-icon">📖</div>
              <div class="coming-soon-badge" style="position: relative; z-index: 1;">Currently Reading</div>
            </div>
            <div class="track-info">
              <span class="track-number">READING</span>
              <h3 class="track-title">{{ book.title }}</h3>
              <p class="track-meta">{{ book.authorName }} · {{ book.genre }}</p>
              <p class="track-desc">{{ book.description }}</p>
              <div class="track-links">
                <a *ngIf="book.fullReview" [routerLink]="['/review', book.id]" class="stream-btn">Read Full Review</a>
                <span *ngIf="!book.fullReview" class="coming-soon-text">Review coming soon...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TBR PILE -->
    <section id="tbr-pile" class="music" *ngIf="tbrBooks.length > 0">
      <div class="music-inner">
        <div class="section-header center">
          <span class="section-label">Up Next</span>
          <h2 class="section-title">To Be <em>Read</em></h2>
          <p class="section-desc">The ever-growing pile of books I can't wait to dive into.</p>
        </div>

        <div class="tracks-grid">
          <div *ngFor="let book of tbrBooks" class="track-card coming-soon">
            <div class="track-artwork placeholder-art">
              <img *ngIf="book.imageUrl" [src]="book.imageUrl" [alt]="book.title" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.5;" />
              <div *ngIf="!book.imageUrl" class="placeholder-icon">📚</div>
              <div class="coming-soon-badge" style="position: relative; z-index: 1;">TBR</div>
            </div>
            <div class="track-info">
              <span class="track-number">TBR</span>
              <h3 class="track-title">{{ book.title }}</h3>
              <p class="track-meta">{{ book.authorName }} · {{ book.genre }}</p>
              <p class="track-desc">{{ book.description }}</p>
              <div class="track-links">
                <a *ngIf="book.fullReview" [routerLink]="['/review', book.id]" class="stream-btn">Read Full Review</a>
                <span *ngIf="!book.fullReview" class="coming-soon-text">Review coming soon...</span>
              </div>
            </div>
          </div>
        </div><!-- /.tracks-grid -->
        
        <div style="text-align: center; margin-top: 40px;">
           <a routerLink="/library" class="btn-ghost">View All Reviews</a>
        </div>
      </div><!-- /.music-inner -->
    </section>

    <!-- NEWSLETTER -->
    <section id="contact" class="contact">
      <div class="contact-inner">
        <div class="section-header center">
          <span class="section-label">Connect</span>
          <h2 class="section-title">Join the <em>Book Club</em></h2>
          <p class="section-desc">Follow along as I share more book reviews, reading updates, and cozy aesthetics.</p>
        </div>

        <div class="newsletter">
          <h3 class="newsletter-title">Get notified when new reviews drop</h3>
          
          <form class="newsletter-form" (ngSubmit)="subscribe()" *ngIf="!nlSuccess">
            <input type="email" [(ngModel)]="nlEmail" name="email"
                   placeholder="your@email.com" required
                   class="newsletter-input" id="nl-email-input" />
            <button type="submit" class="newsletter-btn" id="nl-submit-btn"
                    [disabled]="nlLoading">
              {{ nlLoading ? 'Sending…' : 'Subscribe' }}
            </button>
          </form>

          <div class="nl-success" *ngIf="nlSuccess" style="margin-bottom: 16px;">
            <p style="font-family: var(--font-serif); font-style: italic; color: var(--accent);">
              🌿 {{ nlMessage }}
            </p>
          </div>

          <p class="newsletter-note">{{ c('nl_desc') }}</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ══════════════════════════════════════════════════
       HERO
    ══════════════════════════════════════════════════ */
    .hero {
      position: relative;
      height: 100vh;
      min-height: 650px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      background-image: url('/assets/images/book_hero.jpg');
      background-size: cover;
      background-position: center;
      transform: scale(1.05);
      animation: heroPan 20s ease-in-out infinite alternate;
    }
    @keyframes heroPan {
      from { background-position: center 25%; }
      to   { background-position: center 40%; }
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to right,
        rgba(251, 249, 246, 0.9) 0%,
        rgba(251, 249, 246, 0.6) 50%,
        rgba(251, 249, 246, 0.2) 100%
      );
    }
    .hero-content {
      position: relative;
      z-index: 2;
      text-align: left;
      padding: 0 var(--gutter);
      max-width: 1200px;
      width: 100%;
    }
    .hero-content-inner {
      max-width: 600px;
    }
    .hero-eyebrow {
      font-family: var(--font-sans);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 20px;
    }
    .hero-title {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.0;
      margin-bottom: 24px;
    }
    .title-script {
      font-family: var(--font-script);
      font-size: clamp(4rem, 8vw, 7rem);
      color: var(--accent);
      line-height: 1;
    }
    .title-serif {
      font-family: var(--font-serif);
      font-size: clamp(1.8rem, 4vw, 3.5rem);
      font-weight: 400;
      font-style: italic;
      color: var(--text-dark);
      letter-spacing: 0.05em;
      margin-top: 10px;
    }
    .hero-tagline {
      font-family: var(--font-sans);
      font-size: 0.9rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--text-mid);
      margin-bottom: 16px;
    }
    .hero-sub {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: clamp(1rem, 2.2vw, 1.25rem);
      color: var(--text-mid);
      max-width: 540px;
      margin-bottom: 36px;
      line-height: 1.6;
    }
    .hero-cta {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    /* Scroll hint */
    .hero-scroll-hint {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .hero-scroll-hint span {
      font-family: var(--font-sans);
      font-size: 0.65rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--text-mid);
    }
    .scroll-arrow {
      width: 1px;
      height: 40px;
      background: linear-gradient(to bottom, var(--accent), transparent);
      animation: scrollPulse 2s ease-in-out infinite;
    }
    @keyframes scrollPulse {
      0%, 100% { opacity: 0.4; transform: scaleY(1); }
      50% { opacity: 1; transform: scaleY(1.2); transform-origin: top; }
    }

    /* ══════════════════════════════════════════════════
       ABOUT PREVIEW
    ══════════════════════════════════════════════════ */
    .about {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
      align-items: center;
    }
    .about-image-col {
      position: relative;
      height: 100%;
      min-height: 600px;
      overflow: hidden;
      background: var(--cream-dark);
    }
    .about-image-wrap {
      position: relative;
      height: 100%;
    }
    .about-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 8s linear;
    }
    .about-image-col:hover .about-img { transform: scale(1.04); }
    .about-image-badge {
      position: absolute;
      bottom: 40px; right: -20px;
      background: var(--cream);
      color: var(--text-dark);
      width: 110px; height: 110px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: var(--font-sans);
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
      border: 1px solid var(--taupe);
    }
    .badge-year {
      font-family: var(--font-serif);
      font-size: 1.4rem;
      font-weight: 700;
      display: block;
      line-height: 1;
      color: var(--accent);
      margin-top: 4px;
    }
    .about-content {
      padding: var(--section-pad) var(--gutter) var(--section-pad) clamp(40px, 6vw, 80px);
      background: var(--cream);
    }
    .about-text {
      font-size: 1.05rem;
      color: var(--text-mid);
      line-height: 1.8;
      margin-bottom: 16px;
    }
    .about-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 28px 0;
    }
    .tag {
      padding: 8px 18px;
      background: var(--white);
      border: 1px solid var(--taupe);
      border-radius: 20px;
      font-family: var(--font-sans);
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--accent-dark);
      letter-spacing: 0.05em;
      transition: background 0.2s, border-color 0.2s, transform 0.2s var(--ease-bounce);
    }
    .tag:hover {
      background: var(--cream-dark);
      border-color: var(--accent);
      transform: translateY(-2px);
    }
    .about-quote {
      margin-top: 32px;
      padding-left: 24px;
      border-left: 3px solid var(--accent);
    }
    .about-quote blockquote {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 1.1rem;
      color: var(--text-dark);
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .about-quote cite {
      font-family: var(--font-sans);
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--accent);
    }

    /* ══════════════════════════════════════════════════
       RECENT READS
    ══════════════════════════════════════════════════ */
    .music {
      position: relative;
      padding: var(--section-pad) var(--gutter);
      background: var(--cream-dark);
      overflow: hidden;
    }
    .music-inner {
      position: relative;
      z-index: 1;
      max-width: var(--container);
      margin: 0 auto;
    }
    .tracks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 28px;
    }
    .track-card {
      background: var(--white);
      border: 1px solid var(--taupe);
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.3s var(--ease), border-color 0.3s, box-shadow 0.3s;
    }
    .track-card:hover {
      transform: translateY(-6px);
      border-color: var(--accent);
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
    }
    .track-artwork {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      background: var(--cream-dark);
    }
    .track-artwork img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s var(--ease);
    }
    .track-card:hover .track-artwork img {
      transform: scale(1.04);
    }
    .placeholder-art {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: linear-gradient(135deg, var(--cream-dark) 0%, var(--taupe) 100%);
    }
    .placeholder-icon {
      font-size: 4rem;
      opacity: 0.4;
    }
    .coming-soon-badge {
      padding: 6px 16px;
      background: var(--white);
      border: 1px solid var(--taupe);
      border-radius: 20px;
      font-family: var(--font-sans);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .track-info {
      padding: 24px;
    }
    .track-number {
      font-family: var(--font-sans);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: var(--accent);
      display: block;
      margin-bottom: 6px;
    }
    .track-title {
      font-family: var(--font-serif);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .track-meta {
      font-family: var(--font-sans);
      font-size: 0.8rem;
      color: var(--text-light);
      margin-bottom: 12px;
    }
    .track-desc {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 0.95rem;
      color: var(--text-mid);
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .track-links {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .stream-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: 4px;
      font-family: var(--font-sans);
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      transition: transform 0.2s var(--ease-bounce), opacity 0.2s;
      background: var(--accent);
      color: var(--white);
    }
    .stream-btn:hover {
      transform: translateY(-2px);
      opacity: 0.9;
    }
    .coming-soon-text {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 0.9rem;
      color: var(--text-light);
    }

    /* ══════════════════════════════════════════════════
       NEWSLETTER
    ══════════════════════════════════════════════════ */
    .contact {
      position: relative;
      padding: var(--section-pad) var(--gutter);
      background: var(--cream-dark);
      overflow: hidden;
    }
    .contact-inner {
      position: relative;
      z-index: 1;
      max-width: var(--container);
      margin: 0 auto;
    }
    .newsletter {
      max-width: 560px;
      margin: 0 auto;
      text-align: center;
      background: var(--white);
      padding: 40px;
      border-radius: 8px;
      border: 1px solid var(--taupe);
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
    }
    .newsletter-title {
      font-family: var(--font-serif);
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 24px;
    }
    .newsletter-form {
      display: flex;
      gap: 0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 16px;
      border: 1px solid var(--taupe);
    }
    .newsletter-input {
      flex: 1;
      padding: 16px 20px;
      background: var(--white);
      border: none;
      border-right: 1px solid var(--taupe);
      color: var(--text-dark);
      font-family: var(--font-sans);
      font-size: 0.95rem;
      outline: none;
      transition: background 0.2s;
    }
    .newsletter-input::placeholder {
      color: var(--text-light);
    }
    .newsletter-input:focus {
      background: var(--cream);
    }
    .newsletter-btn {
      padding: 16px 30px;
      background: var(--accent);
      border: none;
      color: var(--white);
      font-family: var(--font-sans);
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.2s;
    }
    .newsletter-btn:hover {
      background: var(--accent-dark);
    }
    .newsletter-note {
      font-family: var(--font-sans);
      font-size: 0.8rem;
      color: var(--text-mid);
      letter-spacing: 0.05em;
    }

    /* ══════════════════════════════════════════════════
       RESPONSIVE
    ══════════════════════════════════════════════════ */
    @media (max-width: 900px) {
      .about { grid-template-columns: 1fr; }
      .about-image-col { min-height: 360px; }
      .about-content { padding: 60px var(--gutter); }
      .about-image-badge { right: 20px; }
    }
    @media (max-width: 520px) {
      .newsletter-form { flex-direction: column; border: none; }
      .newsletter-input { border: 1px solid var(--taupe); border-bottom: none; border-radius: 4px 4px 0 0; }
      .newsletter-btn { border-radius: 0 0 4px 4px; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  nlEmail = '';
  nlLoading = false;
  nlSuccess = false;
  nlMessage = '';
  readBooks: Book[] = [];
  currentlyReadingBooks: Book[] = [];
  tbrBooks: Book[] = [];

  /** Editable site content loaded from API */
  private content: Record<string, string> = {
    hero_eyebrow:   'A Cozy Corner for Book Lovers',
    hero_tagline:   'Books. Coffee. Aesthetic.',
    hero_sub:       'Where beautiful stories meet warm lattes, and every turn of the page feels like coming home.',
    about_text_1:   'Presently Reading is a cozy corner of the internet dedicated to the love of books. I\'m Melody, and I created this space to share the stories that move me, the characters I fall in love with, and the beautiful aesthetics of the reading life.',
    about_text_2:   'Whether it\'s a sweeping fantasy epic, a heartwarming romance, or a quiet literary fiction novel, you\'ll find it here alongside warm lattes, soft blankets, and rainy afternoon recommendations.',
    about_quote:    'A reader lives a thousand lives before he dies. The man who never reads lives only one.',
    about_quote_src:'George R.R. Martin',
    nl_desc:        'No spam. Just beautiful books and cozy aesthetics.',
  };

  /** Helper used in template: {{ c('key') }} */
  c(key: string): string {
    return this.content[key] ?? '';
  }

  constructor(
    private newsletterService: NewsletterService,
    private bookService: BookService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Fetch books to display in Recent Reads
    this.bookService.getAllBooks().subscribe(books => {
      // Sort by display order
      const sortedBooks = books.sort((a, b) => a.displayOrder - b.displayOrder);
      this.readBooks = sortedBooks.filter(b => b.readingStatus === 'READ').slice(0, 3);
      this.currentlyReadingBooks = sortedBooks.filter(b => b.readingStatus === 'CURRENTLY_READING').slice(0, 3);
      this.tbrBooks = sortedBooks.filter(b => b.readingStatus === 'TBR');
    });
  }

  ngOnDestroy(): void {}

  subscribe(): void {
    if (!this.nlEmail) return;
    this.nlLoading = true;
    this.newsletterService.subscribe(this.nlEmail).subscribe({
      next: (res) => {
        this.nlLoading = false;
        this.nlSuccess = true;
        this.nlMessage = res.message;
      },
      error: () => {
        this.nlLoading = false;
        this.nlSuccess = true;
        this.nlMessage = "You're in! We'll be in touch soon.";
      }
    });
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
