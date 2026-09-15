/**
 * Shared TypeScript interfaces mirroring the Spring Boot entity shapes.
 * These are the canonical data contracts between the Angular SPA and the API.
 */

// ── Book (mirrors com.presentlyreading.model.Book) ─────────────────────────────
export interface Book {
  id: number;
  title: string;
  purchaseUrl?: string;
  goodreadsUrl?: string;
  imageUrl?: string;
  genre?: string;
  releaseYear?: number;
  authorName?: string;
  featuredStatus: boolean;
  displayOrder: number;
  description?: string;
  fullReview?: string;
}

// ── Quote (mirrors com.presentlyreading.model.Quote) ───────────────────────────
export interface Quote {
  id: number;
  book: { id: number };
  sectionLabel: string;
  sectionType: 'VERSE' | 'PRE_CHORUS' | 'CHORUS' | 'BRIDGE' | 'OUTRO';
  content: string;
  displayOrder: number;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────
export interface NewsletterRequest {
  email: string;
}

export interface NewsletterResponse {
  success: boolean;
  alreadySubscribed: boolean;
  message: string;
}

export interface ContactRequest {
  senderName: string;
  senderEmail: string;
  subject: string;
  messageBody: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}
