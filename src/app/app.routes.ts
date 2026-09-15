import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Presently Reading | Indie · Industrial Static · Moody Pop · Rock'
  },
  {
    path: 'library',
    loadComponent: () => import('./features/books/books.component').then(m => m.BooksComponent),
    title: 'Library | Presently Reading'
  },
  {
    path: 'review/:id',
    loadComponent: () => import('./features/books/book-review.component').then(m => m.BookReviewComponent),
    title: 'Review | Presently Reading'
  },
  {
    path: 'news',
    loadComponent: () => import('./features/news/news.component').then(m => m.NewsComponent),
    title: 'News | Presently Reading'
  },
  {
    path: 'quotes/:id',
    loadComponent: () => import('./features/quotes/quotes.component').then(m => m.QuotesComponent),
    title: 'Quotes | Presently Reading'
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
    title: 'Our Story | Presently Reading'
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Connect | Presently Reading'
  },

  // ── Hidden admin area (not in nav) ───────────────────────────────────────
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/admin-login.component').then(m => m.AdminLoginComponent),
    title: 'Admin | Presently Reading'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard],
    title: 'Admin | Presently Reading'
  },

  { path: '**', redirectTo: '' }
];
