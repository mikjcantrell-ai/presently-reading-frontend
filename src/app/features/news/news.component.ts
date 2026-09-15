import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/config/api.config';
import { SafeHtmlPipe } from '../../core/pipes/safe-html.pipe';

interface NewsPost {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, DatePipe, SafeHtmlPipe],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css'
})
export class NewsComponent implements OnInit {
  newsPosts: NewsPost[] = [];
  loading = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<NewsPost[]>(`${API_BASE}/api/news`).subscribe({
      next: (data) => {
        this.newsPosts = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load news.';
        this.loading = false;
      }
    });
  }
}
