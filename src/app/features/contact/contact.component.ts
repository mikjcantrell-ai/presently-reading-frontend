import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { NewsletterService } from '../../core/services/newsletter.service';
import { ContactRequest } from '../../core/models';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/config/api.config';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contact-page">

      <!-- Header -->
      <div class="contact-hero">
        <div class="ch-bg"></div>
        <div class="ch-overlay"></div>
        <div class="ch-content container">
          <span class="section-label light">Get in Touch</span>
          <h1 class="section-title light">Stay in the <em>Dream</em></h1>
          <p class="section-desc light">Follow along as <span class="band-name">Presently Reading</span> continues writing books from the red clay roads and starlit porches of the American South.</p>
        </div>
      </div>

      <div class="contact-body container">

        <!-- Social Grid -->
        <div class="social-section">
          <span class="section-label">Find Us</span>
          <h2 class="section-title">Stream & <em>Follow</em></h2>
          <div class="social-grid">
            <a [href]="authorProfile?.spotifyUrl || '#'" target="_blank"
               rel="noopener" class="social-card" id="social-spotify" [style.opacity]="authorProfile?.spotifyUrl ? '1' : '0.5'">
              <div class="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </div>
              <span class="social-name">Spotify</span>
              <span class="social-handle">{{ authorProfile?.spotifyUrl ? 'Listen Now' : 'Coming Soon' }}</span>
            </a>

            <a [href]="authorProfile?.instagramUrl || '#'" target="_blank" rel="noopener" class="social-card" id="social-instagram" [style.opacity]="authorProfile?.instagramUrl ? '1' : '0.5'">
              <div class="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
              <span class="social-name">Instagram</span>
              <span class="social-handle">{{ authorProfile?.instagramUrl ? 'Follow Us' : 'Coming Soon' }}</span>
            </a>

            <a [href]="authorProfile?.youtubeUrl || '#'" target="_blank" rel="noopener" class="social-card" id="social-youtube" [style.opacity]="authorProfile?.youtubeUrl ? '1' : '0.5'">
              <div class="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
              </div>
              <span class="social-name">YouTube</span>
              <span class="social-handle">{{ authorProfile?.youtubeUrl ? 'Watch Now ▶' : 'Coming Soon' }}</span>
            </a>

            <a [href]="authorProfile?.contactEmail ? 'mailto:' + authorProfile.contactEmail : '#'" class="social-card" id="social-email" [style.opacity]="authorProfile?.contactEmail ? '1' : '0.5'">
              <div class="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </div>
              <span class="social-name">Email</span>
              <span class="social-handle">{{ authorProfile?.contactEmail || 'Contact Us' }}</span>
            </a>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="form-section">
          <div class="form-col">
            <span class="section-label">Send a Message</span>
            <h2 class="section-title">Say <em>Hello</em></h2>
            <p class="form-sub">Got a question, a collaboration idea, or just want to share how a book made you feel? We'd love to hear from you.</p>

            <form class="contact-form" (ngSubmit)="sendMessage()" *ngIf="!msgSuccess">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="contact-name">Name</label>
                  <input type="text" id="contact-name" [(ngModel)]="form.senderName" name="senderName"
                         placeholder="Your name" required class="form-input dark-input" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="contact-email">Email</label>
                  <input type="email" id="contact-email" [(ngModel)]="form.senderEmail" name="senderEmail"
                         placeholder="your@email.com" required class="form-input dark-input" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="contact-subject">Subject</label>
                <input type="text" id="contact-subject" [(ngModel)]="form.subject" name="subject"
                       placeholder="What's on your mind?" required class="form-input dark-input" />
              </div>
              <div class="form-group">
                <label class="form-label" for="contact-message">Message</label>
                <textarea id="contact-message" [(ngModel)]="form.messageBody" name="messageBody"
                          placeholder="Tell us something…" rows="5" required
                          class="form-input dark-input textarea"></textarea>
              </div>
              <button type="submit" class="btn-primary submit-btn" id="contact-submit-btn"
                      [disabled]="msgLoading">
                {{ msgLoading ? 'Sending…' : 'Send Message 🌿' }}
              </button>
            </form>

            <div class="success-msg" *ngIf="msgSuccess">
              <span class="success-icon">🌿</span>
              <h3>Message Sent!</h3>
              <p>{{ msgResponse }}</p>
            </div>
          </div>

          <!-- Newsletter -->
          <div class="nl-col">
            <div class="nl-card">
              <span class="nl-icon">🌾</span>
              <h3 class="nl-title">Get Notified</h3>
              <p class="nl-desc">Be the first to hear when new music drops — no spam, just books.</p>

              <form class="nl-form" (ngSubmit)="subscribe()" *ngIf="!nlSuccess">
                <input type="email" [(ngModel)]="nlEmail" name="nlEmail"
                       placeholder="your@email.com" required
                       class="form-input nl-input" id="contact-nl-input" />
                <button type="submit" class="btn-primary nl-btn" id="contact-nl-btn"
                        [disabled]="nlLoading">
                  {{ nlLoading ? '…' : 'Subscribe' }}
                </button>
              </form>
              <p class="nl-success-msg" *ngIf="nlSuccess">{{ nlMessage }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .contact-page { background: var(--cream); min-height: 100vh; padding-bottom: 100px; }

    /* Hero */
    .contact-hero {
      position: relative;
      height: 48vh;
      min-height: 340px;
      display: flex;
      align-items: center;
    }
    .ch-bg {
      position: absolute; inset: 0;
      background-image: url('/assets/images/music_bg.png');
      background-size: cover;
      background-position: center;
    }
    .ch-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(26,46,38,0.92) 0%, rgba(28,35,64,0.9) 100%);
    }
    .ch-content {
      position: relative; z-index: 1;
      padding-top: 80px;
      animation: fadeUp 0.8s ease both;
    }
    .ch-content .section-desc.light { max-width: 560px; }

    .contact-body { padding-top: 72px; }

    /* Social Grid */
    .social-section { margin-bottom: 72px; }
    .social-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-top: 28px;
    }
    .social-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 32px 20px;
      background: var(--white);
      border: 1px solid rgba(74,56,40,0.1);
      border-radius: 6px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      transition: transform 0.3s var(--ease), border-color 0.3s, box-shadow 0.3s;
      cursor: pointer;
    }
    .social-card:hover {
      transform: translateY(-6px);
      border-color: rgba(212,134,58,0.4);
      box-shadow: 0 16px 40px rgba(0,0,0,0.12);
    }
    .social-icon {
      width: 48px; height: 48px;
      border-radius: 50%;
      background: rgba(212,134,58,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s;
    }
    .social-card:hover .social-icon { background: rgba(212,134,58,0.2); }
    .social-icon svg { width: 24px; height: 24px; color: var(--amber); }
    .social-name {
      font-family: var(--font-sans);
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-dark);
    }
    .social-handle {
      font-family: var(--font-sans);
      font-size: 0.72rem;
      color: var(--text-light);
    }

    /* Form + NL layout */
    .form-section {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 48px;
      align-items: start;
    }
    .form-col {}
    .form-sub {
      font-family: var(--font-sans);
      font-size: 0.95rem;
      color: var(--text-light);
      line-height: 1.7;
      margin-bottom: 28px;
    }
    .contact-form { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-label {
      font-family: var(--font-sans);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-mid);
    }
    .dark-input {
      background: rgba(42,30,20,0.05);
      border: 1px solid rgba(74,56,40,0.2);
      color: var(--text-dark);
    }
    .dark-input::placeholder { color: rgba(74,56,40,0.35); }
    .dark-input:focus { border-color: var(--amber); background: rgba(212,134,58,0.04); }
    .textarea { resize: vertical; min-height: 130px; }
    .submit-btn { align-self: flex-start; }

    .success-msg {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 32px;
      background: rgba(212,134,58,0.08);
      border: 1px solid rgba(212,134,58,0.25);
      border-radius: 6px;
    }
    .success-icon { font-size: 2rem; }
    .success-msg h3 {
      font-family: var(--font-serif);
      font-size: 1.2rem;
      color: var(--text-dark);
    }
    .success-msg p {
      font-family: var(--font-sans);
      font-size: 0.9rem;
      color: var(--text-mid);
    }

    /* Newsletter Card */
    .nl-card {
      background: var(--pine);
      padding: 36px 28px;
      border-radius: 6px;
      color: var(--cream);
    }
    .nl-icon { font-size: 2rem; display: block; margin-bottom: 12px; }
    .nl-title {
      font-family: var(--font-serif);
      font-size: 1.3rem;
      margin-bottom: 10px;
    }
    .nl-desc {
      font-family: var(--font-sans);
      font-size: 0.88rem;
      color: var(--cream-dark);
      opacity: 0.75;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .nl-form { display: flex; flex-direction: column; gap: 10px; }
    .nl-input { border-radius: 3px; }
    .nl-btn { width: 100%; justify-content: center; }
    .nl-success-msg {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 0.95rem;
      color: var(--cream-dark);
      line-height: 1.6;
    }

    @media (max-width: 900px) {
      .form-section { grid-template-columns: 1fr; }
    }
    @media (max-width: 560px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ContactComponent implements OnInit {
  authorProfile: any = null;

  form: ContactRequest = {
    senderName: '',
    senderEmail: '',
    subject: '',
    messageBody: ''
  };
  msgLoading = false;
  msgSuccess = false;
  msgResponse = '';

  nlEmail = '';
  nlLoading = false;
  nlSuccess = false;
  nlMessage = '';

  constructor(
    private contactService: ContactService,
    private newsletterService: NewsletterService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.http.get<any>(`${API_BASE}/api/author`).subscribe({
      next: (profile) => this.authorProfile = profile,
      error: (err) => console.error('Error loading author profile', err)
    });
  }

  sendMessage(): void {
    if (!this.form.senderName || !this.form.senderEmail || !this.form.messageBody) return;
    this.msgLoading = true;
    this.contactService.sendInquiry(this.form).subscribe({
      next: (res) => {
        this.msgLoading = false;
        this.msgSuccess = true;
        this.msgResponse = res.message;
      },
      error: () => {
        this.msgLoading = false;
        this.msgSuccess = true;
        this.msgResponse = "Thanks for reaching out! We'll get back to you soon. 🌿";
      }
    });
  }

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
        this.nlMessage = "You're on the list! 🌿";
      }
    });
  }
}
