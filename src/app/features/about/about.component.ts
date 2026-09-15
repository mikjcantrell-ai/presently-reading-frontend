import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/config/api.config';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="about-page">

      <!-- Hero -->
      <div class="about-hero">
        <div class="ah-bg"></div>
        <div class="ah-overlay"></div>
        <div class="ah-content container">
          <span class="section-label">Meet the Reader</span>
          <h1 class="section-title">The Story Behind <br><em>Presently Reading</em></h1>
        </div>
      </div>

      <!-- Story -->
      <div class="story-section">
        <div class="story-image-col">
          <img src="assets/images/book_melody_portrait.jpg"
               alt="Aesthetic portrait of Melody in a cozy reading nook with a book and coffee"
               class="story-img" />
          <div class="story-badge">
            <span>Est.</span>
            <span class="badge-year">2024</span>
          </div>
        </div>
        
        <div class="story-content container-pad">
          <span class="section-label">My Journey</span>
          <h2 class="section-title">A Love Letter to <em>Beautiful Stories</em></h2>
          <p class="story-text">
            Hi, I'm Melody! I created <strong>Presently Reading</strong> because I believe that the magic of reading is meant to be shared. From the moment I picked up my first fantasy novel, I knew that getting lost in fictional worlds was my favorite place to be.
          </p>
          <p class="story-text">
            Whether I'm curled up on a rainy Sunday with a sweeping romantasy, sipping a warm latte while reading literary fiction, or staying up way too late to finish a thriller, books have always been my escape and my comfort.
          </p>
          <p class="story-text">
            I started this page to document my reading journey, share honest reviews, and connect with other book lovers who appreciate the cozy aesthetics of a reading life. I want this space to feel like your favorite neighborhood bookstore—warm, inviting, and full of stories waiting to be discovered.
          </p>

          <div class="genre-tags">
            <span class="tag">☕ Cozy Vibes</span>
            <span class="tag">✨ Fantasy</span>
            <span class="tag">💕 Romance</span>
            <span class="tag">📚 Literary Fiction</span>
            <span class="tag">🌧️ Rainy Days</span>
          </div>
        </div>
      </div>

      <!-- The Vibes / Favorites Grid -->
      <div class="sound-section container">
        <div class="section-header center">
          <span class="section-label">The Bookshelf</span>
          <h2 class="section-title">My Favorite <em>Tropes & Genres</em></h2>
        </div>
        
        <div class="sound-grid">
          <div class="sound-card">
            <span class="sound-icon">{{ c('genre_1_icon') }}</span>
            <h3>{{ c('genre_1_title') }}</h3>
            <p>{{ c('genre_1_desc') }}</p>
          </div>
          <div class="sound-card">
            <span class="sound-icon">{{ c('genre_2_icon') }}</span>
            <h3>{{ c('genre_2_title') }}</h3>
            <p>{{ c('genre_2_desc') }}</p>
          </div>
          <div class="sound-card">
            <span class="sound-icon">{{ c('genre_3_icon') }}</span>
            <h3>{{ c('genre_3_title') }}</h3>
            <p>{{ c('genre_3_desc') }}</p>
          </div>
          <div class="sound-card">
            <span class="sound-icon">{{ c('genre_4_icon') }}</span>
            <h3>{{ c('genre_4_title') }}</h3>
            <p>{{ c('genre_4_desc') }}</p>
          </div>
        </div>
      </div>

      <!-- Quote Banner -->
      <div class="quote-banner">
        <div class="qb-bg"></div>
        <div class="qb-overlay"></div>
        <div class="qb-inner container">
          <blockquote class="qb-text">
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </blockquote>
          <cite class="qb-cite">— George R.R. Martin</cite>
          <div class="qb-cta">
            <a routerLink="/music" class="btn-primary" id="hear-music-btn">Explore My Reviews</a>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .about-page { background: var(--cream); }

    /* Hero */
    .about-hero {
      position: relative;
      height: 55vh;
      min-height: 380px;
      display: flex;
      align-items: center;
    }
    .ah-bg {
      position: absolute; inset: 0;
      background-image: url('/assets/images/book_hero.jpg');
      background-size: cover;
      background-position: center 40%;
    }
    .ah-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to right, rgba(251, 249, 246, 0.9) 0%, rgba(251, 249, 246, 0.6) 100%);
    }
    .ah-content {
      position: relative; z-index: 1;
      padding-top: 80px;
      animation: fadeUp 0.8s ease both;
      text-align: left;
    }

    /* Story Section */
    .story-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      min-height: 70vh;
      background: var(--cream-dark);
    }
    .story-image-col {
      position: relative;
      height: 100%;
      min-height: 600px;
      overflow: hidden;
    }
    .story-img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 8s linear;
    }
    .story-image-col:hover .story-img { transform: scale(1.04); }
    .story-badge {
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
      line-height: 1;
      display: block;
      color: var(--accent);
      margin-top: 4px;
    }
    .container-pad {
      padding: var(--section-pad) var(--gutter) var(--section-pad) clamp(40px,6vw,80px);
      background: var(--cream);
    }
    .story-text {
      font-size: 1.05rem;
      color: var(--text-mid);
      line-height: 1.8;
      margin-bottom: 16px;
    }

    .genre-tags { 
      display: flex; 
      flex-wrap: wrap; 
      gap: 10px; 
      margin-top: 28px; 
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

    /* Sound/Genres Grid */
    .sound-section {
      padding: var(--section-pad) var(--gutter);
    }
    .sound-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
    }
    .sound-card {
      background: var(--white);
      border: 1px solid var(--taupe);
      border-radius: 8px;
      padding: 32px 24px;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      transition: transform 0.3s var(--ease), border-color 0.3s, box-shadow 0.3s;
    }
    .sound-card:hover { 
      transform: translateY(-6px); 
      border-color: var(--accent);
      box-shadow: 0 12px 30px rgba(0,0,0,0.08);
    }
    .sound-icon { font-size: 2.5rem; display: block; margin-bottom: 14px; }
    .sound-card h3 {
      font-family: var(--font-serif);
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 10px;
    }
    .sound-card p {
      font-family: var(--font-sans);
      font-size: 0.9rem;
      color: var(--text-mid);
      line-height: 1.6;
    }

    /* Quote Banner */
    .quote-banner {
      position: relative;
      padding: 100px var(--gutter);
      overflow: hidden;
    }
    .qb-bg {
      position: absolute; inset: 0;
      background-image: url('/assets/images/book_about.jpg');
      background-size: cover;
      background-position: center;
      opacity: 0.25;
    }
    .qb-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(235, 226, 212, 0.97) 0%, rgba(220, 208, 192, 0.95) 100%);
    }
    .qb-inner {
      position: relative; z-index: 1;
      text-align: center;
    }
    .qb-text {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: clamp(1.3rem, 3vw, 2rem);
      color: var(--text-dark);
      line-height: 1.7;
      margin-bottom: 20px;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }
    .qb-cite {
      display: block;
      font-family: var(--font-sans);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 36px;
    }
    .qb-cta {
      display: flex;
      justify-content: center;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      background: var(--accent);
      color: var(--white);
      font-family: var(--font-sans);
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.25s, transform 0.2s var(--ease-bounce), box-shadow 0.25s;
    }
    .btn-primary:hover {
      background: var(--accent-dark);
      transform: translateY(-2px);
    }

    @media (max-width: 900px) {
      .story-section { grid-template-columns: 1fr; }
      .story-image-col { min-height: 360px; }
      .container-pad { padding: 60px var(--gutter); }
      .story-badge { right: 20px; }
    }
  `]
})
export class AboutComponent implements OnInit {
  private content: Record<string, string> = {
    genre_1_icon: '🐉',
    genre_1_title: 'Fantasy',
    genre_1_desc: 'Epic world-building, magical systems, and high stakes. If there are dragons or hidden kingdoms, I\'m already hooked.',
    genre_2_icon: '💌',
    genre_2_title: 'Romance',
    genre_2_desc: 'From slow-burn enemies to lovers, to cozy small-town romances. I\'m a sucker for a beautiful love story with a guaranteed HEA.',
    genre_3_icon: '🖋️',
    genre_3_title: 'Dark Academia',
    genre_3_desc: 'Old libraries, mysterious boarding schools, and lyrical prose. The perfect aesthetic for a rainy autumn afternoon.',
    genre_4_icon: '🌿',
    genre_4_title: 'Literary Fiction',
    genre_4_desc: 'Character-driven stories that make you stop and reflect on life, relationships, and the beautifully mundane moments.'
  };

  c(key: string): string {
    return this.content[key] ?? '';
  }

  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.http.get<Record<string, string>>(`${API_BASE}/api/content/map`).subscribe({
      next: (map) => {
        this.content = { ...this.content, ...map };
      }
    });
  }
}
