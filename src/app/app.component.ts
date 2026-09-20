import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- ── Global Navigation Bar ──────────────────────────────────────────── -->
    <nav class="navbar" [class.scrolled]="scrolled" [class.dark-hero]="isDarkHeroPage" *ngIf="!isAdminRoute()">
      <div class="navbar-inner">

        <!-- Brand / Logo -->
        <a routerLink="/" class="navbar-brand" (click)="menuOpen=false">
          <span class="logo-script">Presently</span>
          <span class="logo-serif">Reading</span>
        </a>

        <!-- Navigation Links -->
        <ul class="navbar-links" [class.open]="menuOpen">
          <li>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"
               (click)="menuOpen=false">Home</a>
          </li>
          <li>
            <a routerLink="/about" routerLinkActive="active"
               (click)="menuOpen=false">About Melody</a>
          </li>
          <li>
            <a routerLink="/library" routerLinkActive="active"
               (click)="menuOpen=false">Recent Reads</a>
          </li>
          <li>
            <a routerLink="/quotes" routerLinkActive="active"
               (click)="menuOpen=false">Favorite Quotes</a>
          </li>
          <li>
            <a routerLink="/contact" routerLinkActive="active"
               (click)="menuOpen=false">Connect</a>
          </li>
        </ul>

        <!-- Mobile hamburger -->
        <button class="hamburger" (click)="menuOpen = !menuOpen" aria-label="Toggle menu"
                [class.open]="menuOpen">
          <span></span><span></span><span></span>
        </button>

      </div>
    </nav>

    <!-- ── Page Content ────────────────────────────────────────────────────── -->
    <main>
      <router-outlet></router-outlet>
    </main>

    <!-- ── Footer ─────────────────────────────────────────────────────────── -->
    <footer class="footer" *ngIf="!isAdminRoute()">
      <div class="footer-inner">
        <a routerLink="/" class="nav-brand" style="display:flex; align-items: baseline; gap: 6px;">
          <span class="logo-script" style="font-size: 1.5rem">Presently</span>
          <span class="logo-serif" style="font-size: 1rem">Reading</span>
        </a>
        <p class="footer-tagline">Books · Coffee · Aesthetic</p>
        <div class="footer-links">
          <a routerLink="/">Home</a>
          <a routerLink="/about">About Melody</a>
          <a routerLink="/library">Recent Reads</a>
          <a routerLink="/contact">Connect</a>
          <a href="https://www.instagram.com/presentlyreading_/" target="_blank" rel="noopener">Instagram</a>
        </div>
        <p class="footer-copy">© 2024 Presently Reading. Curating cozy reading moments.</p>
      </div>
    </footer>
  `,
  styles: [`
    /* ── Navbar ─────────────────────────────────────────────────────────── */
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      padding: 20px var(--gutter);
      transition: background 0.4s ease, padding 0.4s ease, box-shadow 0.4s;
    }
    .navbar.scrolled {
      background: rgba(251, 249, 246, 0.95);
      backdrop-filter: blur(12px);
      padding: 12px var(--gutter);
      box-shadow: 0 2px 20px rgba(0,0,0,0.05);
    }
    .navbar-inner {
      width: 100%;
      max-width: var(--container);
      margin: 0 auto;
      display: flex;
      align-items: center;
    }
    .navbar-brand {
      display: flex;
      align-items: baseline;
      gap: 6px;
      cursor: pointer;
    }
    .logo-script {
      font-family: var(--font-script);
      font-size: 1.8rem;
      color: var(--accent);
      line-height: 1;
    }
    .logo-serif {
      font-family: var(--font-serif);
      font-size: 1.1rem;
      font-weight: 400;
      color: var(--text-dark);
      letter-spacing: 0.05em;
    }
    .navbar.scrolled .logo-serif {
      color: var(--text-dark);
    }
    .navbar-links {
      display: flex;
      list-style: none;
      gap: 36px;
      margin-left: auto;
    }
    .navbar-links a {
      font-family: var(--font-sans);
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-dark);
      position: relative;
      transition: color 0.25s;
      padding: 4px 0;
      text-shadow: none;
    }
    .navbar.dark-hero:not(.scrolled) .navbar-links a {
      color: var(--white);
      text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    }
    .navbar.dark-hero:not(.scrolled) .logo-serif {
      color: var(--white);
      text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    }
    .navbar.scrolled .navbar-links a {
      color: var(--text-mid);
      text-shadow: none;
    }
    .navbar-links a::after {
      content: '';
      position: absolute;
      bottom: -2px; left: 0;
      width: 0; height: 1px;
      background: var(--accent);
      transition: width 0.3s ease;
    }
    .navbar-links a:hover,
    .navbar-links a.active { color: var(--accent); }
    .navbar.dark-hero:not(.scrolled) .navbar-links a:hover,
    .navbar.dark-hero:not(.scrolled) .navbar-links a.active { color: var(--white); }
    
    .navbar-links a:hover::after,
    .navbar-links a.active::after { width: 100%; }

    /* ── Hamburger ──────────────────────────────────────────────────────── */
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      margin-left: auto;
    }
    .hamburger span {
      display: block;
      width: 24px; height: 2px;
      background: var(--text-dark);
      border-radius: 2px;
      transition: transform 0.3s ease, opacity 0.3s;
    }
    .navbar.scrolled .hamburger span {
      background: var(--text-dark);
    }
    .navbar.dark-hero:not(.scrolled) .hamburger span {
      background: var(--white);
    }
    .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* ── Footer ─────────────────────────────────────────────────────────── */
    .footer {
      background: var(--white);
      padding: 50px var(--gutter);
      border-top: 1px solid var(--taupe);
    }
    .footer-inner {
      max-width: var(--container);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      text-align: center;
    }
    .logo-script {
      color: var(--accent);
    }
    .footer-inner .logo-serif {
      color: var(--text-dark);
    }
    .footer-tagline {
      font-family: var(--font-sans);
      font-size: 0.75rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--text-light);
    }
    .footer-links {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .footer-links a {
      font-family: var(--font-sans);
      font-size: 0.78rem;
      color: var(--text-mid);
      transition: color 0.2s;
    }
    .footer-links a:hover { color: var(--accent); }
    .footer-copy {
      font-family: var(--font-sans);
      font-size: 0.8rem;
      color: var(--text-light);
    }

    /* ── Main / Router outlet ────────────────────────────────────────────── */
    main { min-height: 80vh; }

    /* ── Responsive ─────────────────────────────────────────────────────── */
    @media (max-width: 680px) {
      .hamburger { display: flex; }
      .navbar-links {
        position: fixed;
        top: 0; right: 0;
        width: 260px; height: 100vh;
        background: rgba(251, 249, 246, 0.98);
        backdrop-filter: blur(12px);
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 32px;
        padding: 60px 0;
        transform: translateX(100%);
        transition: transform 0.4s ease;
      }
      .navbar-links.open { transform: translateX(0); }
      .navbar-links a { font-size: 1rem; color: var(--text-dark); text-shadow: none; }
    }
  `]
})
export class AppComponent implements OnInit {
  scrolled = false;
  menuOpen = false;

  constructor(private seo: SeoService, private router: Router) {}

  get isDarkHeroPage(): boolean {
    return this.router.url.startsWith('/contact');
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 40;
  }

  ngOnInit(): void {
    this.seo.init();
  }
}
