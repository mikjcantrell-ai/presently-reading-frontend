import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating" 
         [class.interactive]="interactive" 
         (mouseleave)="resetHover()">
      <div 
        *ngFor="let star of stars; let i = index" 
        class="star-wrapper"
        (mouseenter)="setHover(i + 1)"
        (click)="rate(i + 1)">
        
        <!-- Empty Star Base -->
        <svg class="star empty" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>

        <!-- Filled Star Foreground -->
        <svg class="star filled" viewBox="0 0 24 24" 
             [style.clip-path]="getClipPath(i)">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>

      </div>
      <span *ngIf="count !== undefined && count !== null" class="rating-count">({{ count }})</span>
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    .star-wrapper {
      position: relative;
      width: 18px;
      height: 18px;
      cursor: default;
    }
    .interactive .star-wrapper {
      cursor: pointer;
    }
    .star {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      fill: #b5b5b5; /* Darker base color */
      transition: transform 0.2s;
    }
    .star.filled {
      fill: #f5c518; /* A slightly richer gold like IMDb */
    }
    .interactive .star-wrapper:hover .star {
      transform: scale(1.1);
    }
    .rating-count {
      margin-left: 6px;
      font-size: 0.85rem;
      color: var(--text-muted, #888);
    }
  `]
})
export class StarRatingComponent implements OnChanges {
  @Input() rating: number = 0;
  @Input() max: number = 5;
  @Input() count?: number;
  @Input() interactive: boolean = false;
  
  @Output() ratingClicked = new EventEmitter<number>();

  stars: number[] = [];
  hoverRating: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['max'] || changes['rating']) {
      this.stars = Array(this.max).fill(0);
    }
  }

  get currentDisplayRating(): number {
    return this.hoverRating !== null ? this.hoverRating : (this.rating || 0);
  }

  getClipPath(index: number): string {
    const value = this.currentDisplayRating - index;
    if (value >= 1) return 'inset(0 0 0 0)';
    if (value <= 0) return 'inset(0 100% 0 0)';
    // Partial fill (e.g., 0.5)
    const percentage = (1 - value) * 100;
    return `inset(0 ${percentage}% 0 0)`;
  }

  setHover(rating: number) {
    if (this.interactive) {
      this.hoverRating = rating;
    }
  }

  resetHover() {
    if (this.interactive) {
      this.hoverRating = null;
    }
  }

  rate(rating: number) {
    if (this.interactive) {
      this.ratingClicked.emit(rating);
    }
  }
}
