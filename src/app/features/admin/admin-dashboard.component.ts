import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_BASE } from '../../core/config/api.config';

interface Book {
  id?: number; title: string; purchaseUrl: string; goodreadsUrl: string;
  imageUrl: string; genre: string; releaseYear: number;
  authorName: string; featuredStatus: boolean; readingStatus?: string; displayOrder: number; description: string;
  fullReview?: string;
  selected?: boolean;
}
interface Quote {
  id?: number; sectionLabel: string; sectionType: string; content: string; displayOrder: number;
}
interface Inquiry {
  id: number; senderName: string; senderEmail: string; subject: string;
  messageBody: string; receivedDate: string;
  read: boolean; replied: boolean; replyText: string | null; repliedDate: string | null;
}
interface NewsPost {
  id?: number; title: string; content: string; imageUrl: string;
  createdAt?: string; published: boolean;
}

const SECTION_TYPES = ['VERSE','PRE_CHORUS','CHORUS','BRIDGE','OUTRO'];

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe, DragDropModule],
  template: `
    <div class="admin-shell">

      <!-- Topbar -->
      <header class="admin-bar">
        <div class="admin-brand">
          <span class="logo-script">Presently</span>
          <span class="logo-serif">Reading</span>
          <span class="admin-badge">Admin</span>
        </div>
        <div class="admin-bar-right">
          <a routerLink="/" class="bar-link" id="view-site-btn" style="color: var(--accent); font-weight: bold; font-size: 0.85rem; text-decoration: underline;">← Back to Site</a>
          <button class="bar-btn logout" (click)="logout()" id="logout-btn">Sign Out</button>
        </div>
      </header>

      <!-- Tabs -->
      <nav class="admin-tabs">
        <button class="admin-tab" [class.active]="tab==='books'" (click)="tab='books'" id="books-tab">
          🎵 Books
        </button>
        <button class="admin-tab" [class.active]="tab==='quotes'" (click)="tab='quotes'" id="quotes-tab">
          📝 Quotes
        </button>
        <button class="admin-tab" [class.active]="tab==='messages'" (click)="switchToMessages()" id="messages-tab">
          ✉️ Messages
          <span class="unread-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
        </button>
        <button class="admin-tab" [class.active]="tab==='content'" (click)="switchToContent()" id="content-tab">
          ✏️ Content
        </button>
        <button class="admin-tab" [class.active]="tab==='news'" (click)="switchToNews()" id="news-tab">
          📰 News
        </button>
        <button class="admin-tab" [class.active]="tab==='author'" (click)="switchToAuthor()" id="author-tab">
          🎵 Author Profile
        </button>
      </nav>

      <div class="admin-body">

        <!-- ── SONGS TAB ─────────────────────────────────────────────────── -->
        <div *ngIf="tab==='books'">
          <div class="section-head">
            <h2>Books</h2>
            <div style="display: flex; gap: 8px;">
              <button class="btn-import" (click)="bookImportOpen = true" id="import-btn">🔖 Import Books</button>
              <button class="btn-add" (click)="startNewBook()" id="add-book-btn">+ Add Book</button>
            </div>
          </div>

          <!-- Books import form -->
          <div class="inline-form" *ngIf="bookImportOpen">
            <h3>Import Books</h3>
            <div class="form-grid">
              <label class="full">Search Title, Author, or ISBN<input [(ngModel)]="bookImportSearch" (keydown.enter)="searchBooksApi()" placeholder="e.g. The Hobbit or 9780547928227" /></label>
            </div>
            <div class="form-actions">
              <button class="btn-save" (click)="searchBooksApi()" [disabled]="bookImportLoading" id="search-import-btn">{{ bookImportLoading ? 'Searching...' : 'Search' }}</button>
              <button class="btn-cancel" (click)="bookImportOpen = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="bookImportError">{{ bookImportError }}</div>
            
            <div *ngIf="bookImportResults.length > 0">
              <h4 style="margin-top: 16px; margin-bottom: 8px;">Search Results</h4>
              <div class="books-bulk-actions" style="margin-bottom: 12px; display: flex; gap: 16px; padding: 12px; background: #fff; border: 1px solid #e8e0d0; border-radius: 6px;">
                 <label class="checkbox-field" style="margin: 0; cursor: pointer;">
                   <input type="checkbox" [checked]="allImportSelected()" (change)="toggleAllImport($event)" style="transform: scale(1.2); margin-right: 8px;" /> Select All
                 </label>
                 <button class="btn-save" (click)="importSelectedBooks()" [disabled]="bookImportLoading" id="import-btn" *ngIf="getSelectedImportCount() > 0">
                   {{ bookImportLoading ? 'Importing...' : 'Import Selected (' + getSelectedImportCount() + ')' }}
                 </button>
              </div>
              <div class="search-results-table">
                <div class="result-row" *ngFor="let track of bookImportResults" style="display: flex; align-items: center; gap: 12px; padding: 8px; border-bottom: 1px solid #eee;">
                  <input type="checkbox" [(ngModel)]="track.selected" style="transform: scale(1.2); cursor: pointer;" />
                  <img [src]="track.imageUrl" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" *ngIf="track.imageUrl" />
                  <div style="flex-grow: 1;">
                    <div style="font-weight: bold; font-size: 14px; color: #2c3e50;">
                      {{ track.title }}
                      <span *ngIf="getExistingBook(track)" style="font-size: 11px; padding: 2px 6px; background: #e8f5e9; color: #2e7d32; border-radius: 4px; margin-left: 8px; vertical-align: middle;">In Database</span>
                    </div>
                    <div *ngIf="track.authorName" style="font-size: 13px; color: #666; cursor: pointer;" (click)="searchAuthor(track.authorName)">
                      {{ track.authorName }}
                    </div>
                  </div>
                  <a *ngIf="track.purchaseUrl" [href]="track.purchaseUrl" target="_blank" style="font-size: 12px; color: #2ecc71; text-decoration: none; font-weight: bold;">View Info</a>
                </div>
              </div>
            </div>
          </div>

          <!-- New book form -->
          <div class="inline-form" *ngIf="newBook">
            <h3>New Book</h3>
            <div class="form-grid">
              <label class="full">Cover Art
                <div class="image-upload-zone" [class.dragover]="isDragOver" 
                     (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" 
                     (drop)="onDrop($event, newBook)" (click)="fileInputNew.click()">
                  <img *ngIf="newBook.imageUrl" [src]="newBook.imageUrl" class="preview-img"/>
                  <span *ngIf="!newBook.imageUrl" class="upload-hint">Drag & Drop Cover Art or Click to Upload</span>
                  <input type="file" #fileInputNew hidden (change)="onFileSelected($event, newBook)" accept="image/*"/>
                  <div *ngIf="uploadingBookId === 'new'" class="upload-overlay">Uploading...</div>
                </div>
              </label>
              <label>Title *<input [(ngModel)]="newBook.title" placeholder="Book title" /></label>
              <label>Genre<input [(ngModel)]="newBook.genre" placeholder="Indie · Industrial Static · Moody Pop" /></label>
              <label>Release Year<input type="number" [(ngModel)]="newBook.releaseYear" /></label>
              <label>Purchase URL<input [(ngModel)]="newBook.purchaseUrl" placeholder="https://amazon.com/..." /></label>
              <label>Goodreads URL<input [(ngModel)]="newBook.goodreadsUrl" placeholder="https://goodreads.com/..." /></label>
              <label>Author<input [(ngModel)]="newBook.authorName" placeholder="Author name" /></label>
              <label class="full">Description<textarea [(ngModel)]="newBook.description" rows="2"></textarea></label>
              <label class="full">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span>Full Review (Markdown/HTML supported)</span>
                  <button type="button" class="action-btn" style="background: var(--accent); color: white; border: none; padding: 4px 12px; font-size: 0.8rem;" (click)="generateReview(newBook)" [disabled]="generatingReview">
                    {{ generatingReview ? 'Generating...' : '✨ Auto-Generate Draft' }}
                  </button>
                </div>
                <textarea [(ngModel)]="newBook.fullReview" rows="10" placeholder="Write your full book review here..."></textarea>
              </label>
              <label>Display Order<input type="number" [(ngModel)]="newBook.displayOrder" /></label>
              <label>
                Reading Status
                <select [(ngModel)]="newBook.readingStatus" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; font-family: var(--font-primary); font-size: 1rem; color: var(--text-dark);">
                  <option value="READ">Read (Published)</option>
                  <option value="CURRENTLY_READING">Currently Reading</option>
                  <option value="TBR">To Be Read (TBR)</option>
                </select>
              </label>
            </div>
            <div class="form-actions">
              <button class="btn-save" (click)="saveNewBook()" id="save-new-book-btn">Save Book</button>
              <button class="btn-cancel" (click)="newBook=null">Cancel</button>
            </div>
          </div>

          <div class="loading" *ngIf="booksLoading">Loading…</div>
          <div class="error-msg" *ngIf="booksError">{{ booksError }}</div>

          <!-- Books table -->
          <div class="books-list" *ngIf="!booksLoading" cdkDropList (cdkDropListDropped)="onBookDrop($event)">
            <div class="books-bulk-actions" *ngIf="books.length > 0" style="display: flex; gap: 16px; align-items: center; padding: 12px; background: #fff; border: 1px solid #e8e0d0; border-radius: 6px; margin-bottom: 8px;">
              <label class="checkbox-field" style="margin: 0; cursor: pointer;">
                <input type="checkbox" [checked]="allSelected()" (change)="toggleAllSelected($event)" style="transform: scale(1.2); margin-right: 8px;" /> Select All
              </label>
              <button class="btn-danger-sm" *ngIf="hasSelected()" (click)="deleteSelectedBooks()">Delete Selected ({{ getSelectedCount() }})</button>
            </div>
            
            <div class="book-row" *ngFor="let book of books" cdkDrag>
              <div class="book-row-header" (click)="toggleBookEdit(book)">
                <input type="checkbox" [(ngModel)]="book.selected" (click)="$event.stopPropagation()" style="margin-right: 12px; transform: scale(1.2);" />
                <span class="drag-handle" cdkDragHandle>☰</span>
                <span class="book-order">{{ book.displayOrder }}</span>
                <span class="book-title">{{ book.title }}</span>
                <span class="book-genre">{{ book.genre }}</span>
                <span class="book-year">{{ book.releaseYear }}</span>
                <span *ngIf="book.purchaseUrl" title="Has Purchase Link" style="font-size: 1rem; color: #1db954; margin-right: 4px;">🔖</span>
                <span class="status-badge" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); color: var(--text-muted); text-transform: uppercase; margin-right: 12px; min-width: 80px; text-align: center;">
                  {{ book.readingStatus === 'CURRENTLY_READING' ? 'Reading' : book.readingStatus === 'TBR' ? 'TBR' : 'Read' }}
                </span>
                <button class="btn-edit-sm">{{ editingBookId === book.id ? '▲ Close' : '✏ Edit' }}</button>
              </div>

              <div class="book-edit-form" *ngIf="editingBookId === book.id">
                <div class="form-grid">
                  <label class="full">Cover Art
                    <div class="image-upload-zone" [class.dragover]="isDragOver" 
                         (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" 
                         (drop)="onDrop($event, book)" (click)="fileInputEdit.click()">
                      <img *ngIf="book.imageUrl" [src]="book.imageUrl" class="preview-img"/>
                      <span *ngIf="!book.imageUrl" class="upload-hint">Drag & Drop Cover Art or Click to Upload</span>
                      <input type="file" #fileInputEdit hidden (change)="onFileSelected($event, book)" accept="image/*"/>
                      <div *ngIf="uploadingBookId === book.id" class="upload-overlay">Uploading...</div>
                    </div>
                  </label>
                  <label>Title *<input [(ngModel)]="book.title" /></label>
                  <label>Genre<input [(ngModel)]="book.genre" /></label>
                  <label>Release Year<input type="number" [(ngModel)]="book.releaseYear" /></label>
                  <label>Purchase URL<input [(ngModel)]="book.purchaseUrl" /></label>
                  <label>Goodreads URL<input [(ngModel)]="book.goodreadsUrl" /></label>
                  <label>Author<input [(ngModel)]="book.authorName" /></label>
                  <label class="full">Description<textarea [(ngModel)]="book.description" rows="2"></textarea></label>
                  <label class="full">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span>Full Review (Markdown/HTML supported)</span>
                      <button type="button" class="action-btn" style="background: var(--accent); color: white; border: none; padding: 4px 12px; font-size: 0.8rem;" (click)="generateReview(book)" [disabled]="generatingReview">
                        {{ generatingReview ? 'Generating...' : '✨ Auto-Generate Draft' }}
                      </button>
                    </div>
                    <textarea [(ngModel)]="book.fullReview" rows="10" placeholder="Write your full book review here..."></textarea>
                  </label>
                  <label>Display Order<input type="number" [(ngModel)]="book.displayOrder" /></label>
                  <label>
                    Reading Status
                    <select [(ngModel)]="book.readingStatus" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; font-family: var(--font-primary); font-size: 1rem; color: var(--text-dark);">
                      <option value="READ">Read (Published)</option>
                      <option value="CURRENTLY_READING">Currently Reading</option>
                      <option value="TBR">To Be Read (TBR)</option>
                    </select>
                  </label>
                </div>
                <div class="form-actions">
                  <button class="btn-import" (click)="fetchBookMetadata(book)" style="margin-right: auto;" [id]="'fetch-metadata-'+book.id">📖 Fetch Metadata</button>
                  <button class="btn-save" (click)="updateBook(book)" [id]="'save-book-'+book.id">Save</button>
                  <button class="btn-quotes" (click)="switchToQuotes(book.id!)" [id]="'edit-quotes-'+book.id">📝 Edit Quotes →</button>
                  <button class="btn-danger" (click)="deleteBook(book)" [id]="'delete-book-'+book.id">Delete</button>
                  <button class="btn-cancel" (click)="editingBookId=null">Cancel</button>
                </div>
                <div class="save-msg" *ngIf="bookSaveMsg[book.id!]">{{ bookSaveMsg[book.id!] }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── LYRICS TAB ─────────────────────────────────────────────────── -->
        <div *ngIf="tab==='quotes'">
          <div class="section-head">
            <h2>Quotes</h2>
            <button class="btn-save-all"
                    *ngIf="selectedBookId && quotes.length"
                    (click)="saveAllQuotes()"
                    [disabled]="saveAllInProgress"
                    id="save-all-quotes-btn">
              {{ saveAllInProgress ? 'Saving…' : '💾 Save All' }}
            </button>
          </div>

          <!-- Searchable book picker -->
          <div class="book-picker">
            <div class="picker-field">
              <label class="picker-label">Book</label>
              <div class="picker-wrap">
                <input
                  id="book-search"
                  class="picker-input"
                  type="text"
                  [(ngModel)]="bookSearch"
                  (input)="onBookSearch()"
                  (focus)="pickerOpen=true; pickerHighlight=-1"
                  (blur)="closePicker()"
                  (keydown)="onPickerKey($event)"
                  placeholder="Type to search books…"
                  autocomplete="off" />
                <div class="picker-dropdown" *ngIf="pickerOpen && filteredBooks.length">
                  <div class="picker-option"
                       *ngFor="let s of filteredBooks; let i = index"
                       (mousedown)="selectPickerBook(s)"
                       [class.selected]="i === pickerHighlight"
                       [id]="'picker-opt-' + i">
                    {{ s.title }}
                  </div>
                </div>
                <div class="picker-dropdown picker-empty" *ngIf="pickerOpen && bookSearch && !filteredBooks.length">
                  No books match
                </div>
              </div>
            </div>
            <button class="btn-add" *ngIf="selectedBookId" (click)="addQuoteBlock()" id="add-quote-btn">
              + Add Block
            </button>
            <button class="btn-paste-toggle" (click)="pasteOpen=!pasteOpen" *ngIf="selectedBookId" id="paste-toggle-btn">
              {{ pasteOpen ? '▲ Close Paste' : '📋 Paste Quotes' }}
            </button>
          </div>

          <!-- Smart paste panel -->
          <div class="paste-panel" *ngIf="pasteOpen && selectedBookId">
            <div class="paste-header">
              <strong>Paste &amp; Parse Quotes</strong>
              <span class="paste-hint">Label each section with <code>(Verse 1)</code>, <code>(Chorus)</code>, <code>(Bridge)</code>, etc. — the app will split and type them automatically.</span>
            </div>
            <textarea
              id="quotes-paste-box"
              class="paste-textarea"
              [(ngModel)]="rawQuotesPaste"
              rows="16"
              placeholder="(Verse 1)&#10;You held me close the day I took my first step,&#10;&#10;(Chorus)&#10;You gave me roots so I'd know who I am,&#10;"></textarea>
            <div class="paste-actions">
              <button class="btn-parse" (click)="parsePastedQuotes()" id="parse-quotes-btn">⚡ Parse into Blocks</button>
              <span class="paste-note">Existing blocks will be replaced. You can still edit each block before saving.</span>
            </div>
            <div class="parse-preview" *ngIf="parsedPreview.length">
              <div class="preview-title">Preview — {{ parsedPreview.length }} sections found:</div>
              <div class="preview-chip" *ngFor="let p of parsedPreview">
                <span class="chip-type">{{ p.sectionType }}</span> {{ p.sectionLabel }}
              </div>
              <button class="btn-apply" (click)="applyParsed()" id="apply-parsed-btn">✓ Apply &amp; Edit Blocks</button>
            </div>
          </div>

          <div class="loading" *ngIf="quotesLoading">Loading quotes…</div>
          <div class="error-msg" *ngIf="quotesError">{{ quotesError }}</div>

          <!-- Quote blocks -->
          <div class="quote-admin-list" *ngIf="selectedBookId && !quotesLoading">

            <!-- Sticky save bar -->
            <div class="sticky-save-bar" *ngIf="quotes.length">
              <span class="sticky-info">{{ quotes.length }} block{{ quotes.length === 1 ? '' : 's' }} — {{ selectedBookTitle }}</span>
              <div class="sticky-right">
                <span class="save-all-msg" *ngIf="saveAllMsg">{{ saveAllMsg }}</span>
                <button class="btn-save-all"
                        (click)="saveAllQuotes()"
                        [disabled]="saveAllInProgress"
                        id="save-all-quotes-sticky-btn">
                  {{ saveAllInProgress ? 'Saving…' : '💾 Save All' }}
                </button>
              </div>
            </div>

            <div class="quote-admin-block" *ngFor="let quote of quotes; let i = index" [id]="'quote-block-'+quote.id">
              <div class="quote-block-header">
                <div class="order-btns">
                  <button (click)="moveQuote(i, -1)" [disabled]="i===0" title="Move up">▲</button>
                  <span class="order-num">{{ quote.displayOrder }}</span>
                  <button (click)="moveQuote(i, 1)" [disabled]="i===quotes.length-1" title="Move down">▼</button>
                </div>
                <select [(ngModel)]="quote.sectionType" class="type-select" [id]="'type-'+quote.id">
                  <option *ngFor="let t of sectionTypes" [value]="t">{{ t }}</option>
                </select>
                <input [(ngModel)]="quote.sectionLabel" class="label-input" placeholder="e.g. Verse 1" [id]="'label-'+quote.id" />
                <button class="btn-danger-sm" (click)="deleteQuote(quote, i)" [id]="'delete-quote-'+quote.id">✕</button>
              </div>
              <textarea [(ngModel)]="quote.content" class="quote-content-area" rows="5"
                        [id]="'content-'+quote.id" placeholder="Quote text…"></textarea>
              <div class="quote-save-row">
                <button class="btn-save-sm" (click)="saveQuote(quote)" [id]="'save-quote-'+quote.id">
                  {{ quote.id ? 'Save Changes' : 'Create Block' }}
                </button>
                <span class="save-indicator" *ngIf="quoteSaveMsg[quote.id ?? -1]">{{ quoteSaveMsg[quote.id ?? -1] }}</span>
              </div>
            </div>

            <div class="no-quotes" *ngIf="quotes.length === 0">
              No quotes yet — paste some above or click "Add Block".
            </div>
          </div>
        </div>

        <!-- ── MESSAGES TAB ──────────────────────────────────────────────────── -->
        <div *ngIf="tab==='messages'">
          <div class="section-head">
            <h2>Messages <span *ngIf="unreadCount > 0" class="unread-pill">{{ unreadCount }} unread</span></h2>
            <button class="btn-add" (click)="loadMessages()" id="refresh-messages-btn">↻ Refresh</button>
          </div>

          <div class="loading" *ngIf="messagesLoading">Loading messages…</div>
          <div class="error-msg" *ngIf="messagesError">{{ messagesError }}</div>

          <div class="messages-list" *ngIf="!messagesLoading">

            <div class="no-messages" *ngIf="messages.length === 0">
              📭 No messages yet — the inbox is empty.
            </div>

            <div class="msg-row" *ngFor="let m of messages"
                 [class.unread]="!m.read"
                 [class.expanded]="expandedMsgId === m.id"
                 [id]="'msg-row-' + m.id">

              <!-- Message summary row -->
              <div class="msg-summary" (click)="toggleMessage(m)">
                <div class="msg-status-dot" [class.unread-dot]="!m.read" title="{{ m.read ? 'Read' : 'Unread' }}"></div>
                <div class="msg-from">
                  <span class="msg-name">{{ m.senderName }}</span>
                  <span class="msg-email">{{ m.senderEmail }}</span>
                </div>
                <div class="msg-subject">{{ m.subject }}</div>
                <div class="msg-date">{{ m.receivedDate | date:'MMM d, y · h:mm a' }}</div>
                <div class="msg-badges">
                  <span class="replied-badge" *ngIf="m.replied">Replied ✓</span>
                </div>
                <button class="btn-edit-sm">{{ expandedMsgId === m.id ? '▲' : '▼' }}</button>
              </div>

              <!-- Expanded detail -->
              <div class="msg-detail" *ngIf="expandedMsgId === m.id">
                <div class="msg-body-text">{{ m.messageBody }}</div>

                <!-- Previous reply (if any) -->
                <div class="prev-reply" *ngIf="m.replied && m.replyText">
                  <span class="prev-reply-label">Your previous reply ({{ m.repliedDate | date:'MMM d, y' }}):</span>
                  <div class="prev-reply-text">{{ m.replyText }}</div>
                </div>

                <!-- Reply form -->
                <div class="reply-form">
                  <label class="reply-label">Reply to {{ m.senderName }} &lt;{{ m.senderEmail }}&gt;</label>
                  <textarea class="reply-textarea"
                            [(ngModel)]="replyDrafts[m.id]"
                            rows="5"
                            [id]="'reply-' + m.id"
                            placeholder="Type your reply here…"></textarea>
                  <div class="reply-actions">
                    <button class="btn-save"
                            (click)="sendReply(m)"
                            [disabled]="replySending[m.id]"
                            [id]="'send-reply-' + m.id">
                      {{ replySending[m.id] ? 'Sending…' : '📨 Send Reply' }}
                    </button>
                    <span class="reply-status" *ngIf="replyStatus[m.id]"
                          [class.reply-ok]="replyStatus[m.id] === 'ok'"
                          [class.reply-err]="replyStatus[m.id] === 'err'">
                      {{ replyStatus[m.id] === 'ok' ? '✓ Sent!' : '✗ Send failed — check SMTP config' }}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- ── CONTENT TAB ────────────────────────────────────────────────── -->
        <div *ngIf="tab==='content'">
          <div class="section-head">
            <h2>Page Content</h2>
            <button class="btn-add" (click)="loadContent()" id="refresh-content-btn">↻ Refresh</button>
          </div>
          <p class="content-intro">Edit the text that appears on the home page. Changes save instantly and update the site immediately.</p>

          <div class="loading" *ngIf="contentLoading">Loading…</div>
          <div class="error-msg" *ngIf="contentError">{{ contentError }}</div>

          <ng-container *ngFor="let section of contentSections">
            <div class="content-section-group">
              <h3 class="content-section-label">{{ section }}</h3>
              <div class="content-fields">
                <div class="content-field" *ngFor="let item of contentBySection[section]"
                     [id]="'content-field-' + item.key">
                  <label class="cf-label">{{ item.label }}</label>
                  <textarea class="cf-textarea"
                            [(ngModel)]="item.value"
                            rows="3"
                            [id]="'cf-' + item.key"
                            (input)="contentDirty[item.key] = true"></textarea>
                  <div class="cf-actions">
                    <button class="btn-save"
                            (click)="saveContent(item)"
                            [disabled]="contentSaving[item.key] || !contentDirty[item.key]"
                            [id]="'save-cf-' + item.key">
                      {{ contentSaving[item.key] ? 'Saving…' : 'Save' }}
                    </button>
                    <span class="cf-status"
                          *ngIf="contentStatus[item.key]"
                          [class.cf-ok]="contentStatus[item.key] === 'ok'"
                          [class.cf-err]="contentStatus[item.key] === 'err'">
                      {{ contentStatus[item.key] === 'ok' ? '✓ Saved!' : '✗ Save failed' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- ── NEWS TAB ─────────────────────────────────────────────── -->
        <div *ngIf="tab==='news'">
          <div class="section-head">
            <h2>News & Updates</h2>
            <button class="btn-primary" (click)="startNewNewsPost()" id="add-news-btn">+ New Post</button>
          </div>

          <!-- New/Edit Post Form -->
          <div class="inline-form" *ngIf="editingNewsPost">
            <h3>{{ editingNewsPost.id ? 'Edit' : 'New' }} Post</h3>
            <div class="form-grid">
              <label class="full">Title *<input [(ngModel)]="editingNewsPost.title" id="news-title" /></label>
              <label class="full">Image URL (Optional)<input [(ngModel)]="editingNewsPost.imageUrl" id="news-image" /></label>
              <label class="full">Content<textarea [(ngModel)]="editingNewsPost.content" rows="6" id="news-content"></textarea></label>
              <label class="full"><input type="checkbox" [(ngModel)]="editingNewsPost.published" id="news-published" /> Published</label>
            </div>
            <div class="form-actions">
              <button class="btn-save" (click)="saveNewsPost()" id="save-news-btn">Save</button>
              <button class="btn-cancel" (click)="editingNewsPost = null" id="cancel-news-btn">Cancel</button>
            </div>
          </div>

          <!-- News List -->
          <div class="book-list">
            <div class="list-header">
              <div class="col-main">Title</div>
              <div class="col-small">Status</div>
              <div class="col-small">Date</div>
              <div class="col-small">Actions</div>
            </div>
            <div class="list-row" *ngFor="let post of newsPosts">
              <div class="col-main"><strong>{{ post.title }}</strong></div>
              <div class="col-small">
                <span class="status-badge" [class.published]="post.published">{{ post.published ? 'Published' : 'Draft' }}</span>
              </div>
              <div class="col-small">{{ post.createdAt | date:'MMM d, y' }}</div>
              <div class="col-small actions">
                <button class="btn-icon" (click)="editNewsPost(post)" title="Edit">✏️</button>
                <button class="btn-icon" (click)="copyNewsPost(post)" title="Duplicate">📋</button>
                <button class="btn-icon delete" (click)="deleteNewsPost(post)" title="Delete">🗑</button>
              </div>
            </div>
            <div *ngIf="newsPosts.length === 0" class="empty-state">No news posts found.</div>
          </div>
        </div>

        <!-- ── ARTIST PROFILE TAB ─────────────────────────────────────────────── -->
        <div *ngIf="tab==='author'">
          <div class="section-head">
            <h2>Author Profile</h2>
          </div>
          <p class="content-intro">These details appear on the About page and Music page. Leave any field blank to hide it on the site.</p>

          <div class="loading" *ngIf="authorLoading">Loading…</div>
          <div class="error-msg" *ngIf="authorError">{{ authorError }}</div>

          <div class="author-form" *ngIf="!authorLoading && authorProfile">
            <div class="af-group">
              <label class="af-label">Author / Project Name</label>
              <input class="af-input" [(ngModel)]="authorProfile.name" id="af-name" placeholder="Presently Reading" />
            </div>
            <div class="af-group">
              <label class="af-label">Website URL</label>
              <input class="af-input" [(ngModel)]="authorProfile.websiteUrl" id="af-website"
                     placeholder="https://mikstermedia.com" />
              <span class="af-hint">Shows as a “Visit Website” button on the Music page and About page.</span>
            </div>
            <div class="af-group">
              <label class="af-label">Contact / Booking Email</label>
              <input class="af-input" type="email" [(ngModel)]="authorProfile.contactEmail" id="af-email"
                     placeholder="hello@presentlyreading.com" />
            </div>
            <div class="af-group">
              <label class="af-label">Tagline</label>
              <input class="af-input" [(ngModel)]="authorProfile.tagline" id="af-tagline"
                     placeholder="Indie · Industrial Static · Moody Pop · Rock" />
            </div>
            <div class="af-group">
              <label class="af-label">Purchase URL</label>
              <input class="af-input" [(ngModel)]="authorProfile.purchaseUrl" id="af-spotify"
                     placeholder="https://open.spotify.com/album/…" />
            </div>
            <div class="af-group">
              <label class="af-label">Instagram URL</label>
              <input class="af-input" [(ngModel)]="authorProfile.instagramUrl" id="af-instagram"
                     placeholder="https://instagram.com/presentlyreading" />
            </div>
            <div class="af-group">
              <label class="af-label">Facebook URL</label>
              <input class="af-input" [(ngModel)]="authorProfile.facebookUrl" id="af-facebook"
                     placeholder="https://facebook.com/presentlyreading" />
            </div>
            <div class="af-actions">
              <button class="btn-save" (click)="saveAuthorProfile()" [disabled]="authorSaving" id="save-author-btn">
                {{ authorSaving ? 'Saving…' : '💾 Save Author Profile' }}
              </button>
              <span class="af-status" *ngIf="authorStatus"
                    [class.af-ok]="authorStatus === 'ok'"
                    [class.af-err]="authorStatus === 'err'">
                {{ authorStatus === 'ok' ? '✓ Saved! Changes are live.' : '✗ Save failed — check connection.' }}
              </span>
            </div>
          </div>
        </div>

      </div><!-- /.admin-body -->
    </div><!-- /.admin-shell -->
  `,
  styles: [`
    /* ── Shell ───────────────────────────────────────────────────────────── */
    .admin-shell {
      min-height: 100vh;
      background: var(--cream-dark);
      font-family: var(--font-sans);
    }

    /* ── Top bar ─────────────────────────────────────────────────────────── */
    .admin-bar {
      background: var(--taupe);
      padding: 0 32px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    }
    .admin-brand { display: flex; align-items: baseline; gap: 6px; }
    .logo-script { font-family: var(--font-script); font-size: 1.4rem; color: var(--accent); }
    .logo-serif  { font-family: var(--font-serif); font-size: 1rem; color: var(--text-dark); font-weight: 600; }
    .admin-badge {
      font-size: 0.58rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
      color: var(--accent); border: 1px solid var(--accent); padding: 2px 8px; border-radius: 10px;
      margin-left: 4px;
    }
    .admin-bar-right { display: flex; align-items: center; gap: 16px; }
    .bar-link {
      font-size: 0.78rem; font-weight: 600; color: var(--text-mid);
      letter-spacing: 0.05em; transition: color 0.2s;
    }
    .bar-link:hover { color: var(--accent); }
    .bar-btn {
      padding: 7px 18px; border: none; border-radius: 3px; font-size: 0.78rem;
      font-weight: 700; cursor: pointer; transition: opacity 0.2s;
    }
    .bar-btn.logout { background: rgba(220,80,80,0.2); color: #e07070; }
    .bar-btn.logout:hover { opacity: 0.8; }

    /* ── Tabs ────────────────────────────────────────────────────────────── */
    .admin-tabs {
      background: #fff;
      border-bottom: 2px solid #e8e0d0;
      display: flex;
      padding: 0 32px;
    }
    .admin-tab {
      padding: 14px 24px; border: none; border-bottom: 3px solid transparent;
      background: none; font-family: var(--font-sans); font-size: 0.85rem; font-weight: 700;
      color: var(--text-mid); cursor: pointer; margin-bottom: -2px; transition: color 0.2s, border-color 0.2s;
      display: flex; align-items: center; gap: 7px;
    }
    .admin-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
    .admin-tab:hover { color: var(--accent); }
    .unread-badge {
      background: #e74c3c; color: #fff; font-size: 0.62rem; font-weight: 800;
      padding: 1px 6px; border-radius: 10px; line-height: 1.6;
    }

    /* ── Body ────────────────────────────────────────────────────────────── */
    .admin-body { padding: 32px; max-width: 1100px; margin: 0 auto; }
    .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .section-head h2 { font-family: var(--font-serif); font-size: 1.5rem; color: #2a2017; }
    .loading { color: #888; padding: 40px; text-align: center; }
    .error-msg { color: #c0392b; background: #fdf0ef; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px; }

    /* ── Buttons ─────────────────────────────────────────────────────────── */
    .btn-add {
      padding: 9px 20px; background: #2a2017; color: #fff; border: none; border-radius: 4px;
      font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: background 0.2s;
    }
    .btn-add:hover { background: #1a1007; }
    .btn-import {
      padding: 9px 20px; background: #1db954; color: #fff; border: none; border-radius: 4px;
      font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: background 0.2s;
    }
    .btn-import:hover { background: #1ed760; }
    .btn-save {
      padding: 9px 22px; background: #2ecc71; color: #fff; border: none; border-radius: 4px;
      font-size: 0.82rem; font-weight: 700; cursor: pointer;
    }
    .btn-cancel {
      padding: 9px 20px; background: #eee; color: #555; border: none; border-radius: 4px;
      font-size: 0.82rem; font-weight: 700; cursor: pointer;
    }
    .btn-danger {
      padding: 9px 20px; background: rgba(220,80,80,0.1); color: #c0392b; border: 1px solid rgba(220,80,80,0.3);
      border-radius: 4px; font-size: 0.82rem; font-weight: 700; cursor: pointer;
    }
    .btn-danger:hover { background: rgba(220,80,80,0.2); }
    .btn-quotes {
      padding: 9px 20px; background: var(--white); color: var(--accent);
      border: 1px solid var(--taupe); border-radius: 4px;
      font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: background 0.2s;
    }
    .btn-quotes:hover { background: var(--cream-dark); }
    .btn-edit-sm {
      margin-left: auto; padding: 5px 12px; background: var(--white); color: var(--accent);
      border: 1px solid var(--taupe); border-radius: 3px; font-size: 0.75rem; font-weight: 700; cursor: pointer;
    }
    .btn-save-sm {
      padding: 7px 18px; background: #2ecc71; color: #fff; border: none; border-radius: 3px;
      font-size: 0.78rem; font-weight: 700; cursor: pointer;
    }
    .btn-danger-sm {
      padding: 5px 10px; background: rgba(220,80,80,0.1); color: #c0392b;
      border: 1px solid rgba(220,80,80,0.3); border-radius: 3px; font-size: 0.8rem; cursor: pointer;
    }

    /* ── Inline form ─────────────────────────────────────────────────────── */
    .inline-form {
      background: #fff; border: 1px solid #e8e0d0; border-radius: 6px;
      padding: 24px; margin-bottom: 24px;
    }
    .inline-form h3 { font-family: var(--font-serif); font-size: 1.1rem; color: #2a2017; margin-bottom: 18px; }
    /* Responsive */
    @media (max-width: 900px) {
      .story-section { grid-template-columns: 1fr; }
    }

    /* ── Image Upload Zone ───────────────────────────────────────────────── */
    .image-upload-zone {
      border: 2px dashed #ddd; border-radius: 6px; padding: 20px; text-align: center;
      cursor: pointer; position: relative; overflow: hidden; background: #faf9f5;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 120px; transition: all 0.2s;
    }
    .image-upload-zone:hover, .image-upload-zone.dragover { border-color: var(--accent); background: #fff; }
    .image-upload-zone img.preview-img { max-height: 100px; border-radius: 4px; }
    .upload-hint { font-size: 0.8rem; color: #888; font-weight: normal; text-transform: none; letter-spacing: normal; margin-top: 8px; }
    .upload-overlay {
      position: absolute; inset: 0; background: rgba(255,255,255,0.8);
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; color: var(--accent);
    }

    /* ── Messages (Inbox) ────────────────────────────────────────────────── */
    .unread-pill {
      display: inline-block;
      background: #e74c3c;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 10px;
      margin-left: 8px;
      vertical-align: middle;
    }
    .messages-list { display: flex; flex-direction: column; gap: 8px; }
    .no-messages {
      text-align: center; padding: 60px; color: #aaa;
      font-style: italic; font-family: var(--font-serif); font-size: 1.1rem;
    }
    .msg-row {
      background: #fff;
      border: 1px solid #e8e0d0;
      border-radius: 6px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .msg-row.unread { border-left: 3px solid var(--amber); background: #fffdf7; }
    .msg-row.expanded { border-color: rgba(212,134,58,0.4); }
    .msg-summary {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .msg-summary:hover { background: #faf7f0; }
    .msg-status-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #ddd; flex-shrink: 0;
    }
    .msg-status-dot.unread-dot { background: var(--amber); }
    .msg-from { display: flex; flex-direction: column; min-width: 160px; }
    .msg-name { font-weight: 700; color: #2a2017; font-size: 0.88rem; }
    .msg-email { font-size: 0.72rem; color: #999; }
    .msg-subject { flex: 1; font-size: 0.88rem; color: #4a3828; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .msg-date { font-size: 0.72rem; color: #aaa; white-space: nowrap; }
    .msg-badges { min-width: 70px; }
    .replied-badge {
      font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #2ecc71; background: rgba(46,204,113,0.1);
      padding: 2px 8px; border-radius: 10px;
    }

    /* Expanded detail */
    .msg-detail {
      padding: 0 20px 20px 44px;
      border-top: 1px solid #f0ebe0;
      background: #faf9f5;
    }
    .msg-body-text {
      font-family: var(--font-serif);
      font-size: 0.95rem;
      color: #2a2017;
      line-height: 1.8;
      white-space: pre-wrap;
      padding: 20px 0;
      border-bottom: 1px solid #ede8df;
      margin-bottom: 20px;
    }
    .prev-reply {
      background: rgba(212,134,58,0.06);
      border-left: 3px solid var(--amber);
      padding: 12px 16px;
      border-radius: 0 4px 4px 0;
      margin-bottom: 20px;
    }
    .prev-reply-label {
      display: block;
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--amber); margin-bottom: 6px;
    }
    .prev-reply-text {
      font-family: var(--font-serif); font-size: 0.9rem;
      color: #5a4020; line-height: 1.7; white-space: pre-wrap;
    }

    /* Reply form */
    .reply-form { display: flex; flex-direction: column; gap: 10px; }
    .reply-label {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #888;
    }
    .reply-textarea {
      width: 100%; box-sizing: border-box;
      padding: 12px; border: 1px solid #ddd; border-radius: 4px;
      font-family: var(--font-serif); font-size: 0.95rem; line-height: 1.7;
      color: #2a2017; resize: vertical; outline: none; background: #fff;
      transition: border-color 0.2s;
    }
    .reply-textarea:focus { border-color: var(--amber); }
    .reply-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
    .reply-status { font-size: 0.82rem; font-weight: 700; }
    .reply-ok { color: #2ecc71; }
    .reply-err { color: #e74c3c; }

    /* ── Content Editor ──────────────────────────────────────────────────── */
    .content-intro {
      font-size: 0.9rem; color: #888; margin-bottom: 28px;
      font-family: var(--font-sans);
    }
    .content-section-group {
      margin-bottom: 32px;
      background: #fff;
      border: 1px solid #e8e0d0;
      border-radius: 6px;
      overflow: hidden;
    }
    .content-section-label {
      font-family: var(--font-sans);
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #fff;
      background: var(--pine);
      padding: 10px 18px;
      margin: 0;
    }
    .content-fields { padding: 16px 18px; display: flex; flex-direction: column; gap: 20px; }
    .content-field { display: flex; flex-direction: column; gap: 6px; }
    .cf-label {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #888;
    }
    .cf-textarea {
      width: 100%; box-sizing: border-box;
      padding: 10px 12px;
      border: 1px solid #ddd; border-radius: 4px;
      font-family: var(--font-serif); font-size: 0.95rem;
      line-height: 1.6; color: #2a2017;
      resize: vertical; outline: none;
      transition: border-color 0.2s;
    }
    .cf-textarea:focus { border-color: var(--amber); }
    .cf-actions { display: flex; align-items: center; gap: 12px; }
    .cf-status { font-size: 0.8rem; font-weight: 700; }
    .cf-ok { color: #2ecc71; }
    .cf-err { color: #e74c3c; }

    /* ── Author Profile form ─────────────────────────────────────────────── */
    .author-form {
      background: #fff; border: 1px solid #e8e0d0; border-radius: 6px;
      padding: 28px; max-width: 680px; display: flex; flex-direction: column; gap: 20px;
    }
    .af-group { display: flex; flex-direction: column; gap: 6px; }
    .af-label {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #888;
    }
    .af-input {
      padding: 10px 14px; border: 1px solid #ddd; border-radius: 4px;
      font-size: 0.92rem; font-family: var(--font-sans); color: #2a2017;
      background: #fafaf8; outline: none; transition: border-color 0.2s;
    }
    .af-input:focus { border-color: var(--amber); }
    .af-hint { font-size: 0.75rem; color: #aaa; line-height: 1.5; }
    .af-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding-top: 4px; }
    .af-status { font-size: 0.82rem; font-weight: 700; }
    .af-ok { color: #2ecc71; }
    .af-err { color: #e74c3c; }

    .btn-toggle-reading {
      padding: 4px 10px; border-radius: 12px; font-size: 0.65rem; font-weight: 700;
      text-transform: uppercase; cursor: pointer; border: 1px solid var(--taupe);
      background: var(--white); color: var(--text-mid); transition: all 0.2s;
      margin-right: 8px; white-space: nowrap;
    }
    .btn-toggle-reading:hover { border-color: var(--accent); color: var(--accent); }
    .btn-toggle-reading.on {
      background: var(--accent); color: var(--white); border-color: var(--accent);
    }

    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;
    }
    .form-grid label {
      display: flex; flex-direction: column; font-size: 0.72rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em; color: #888; gap: 5px;
    }
    .form-grid label.full { grid-column: 1 / -1; }
    .form-grid label.checkbox-field { flex-direction: row; align-items: center; gap: 10px; }
    .form-grid input, .form-grid textarea, .form-grid select {
      padding: 9px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;
      font-family: var(--font-sans); color: #2a2017; background: #fafaf8; outline: none;
      transition: border-color 0.2s;
    }
    .form-grid input:focus, .form-grid textarea:focus, .form-grid select:focus {
      border-color: var(--amber);
    }
    .form-actions { display: flex; gap: 10px; }
    .save-msg { margin-top: 8px; font-size: 0.78rem; color: #2ecc71; font-weight: 600; }

    /* ── Books list ──────────────────────────────────────────────────────── */
    .books-list { display: flex; flex-direction: column; gap: 8px; }
    .book-row {
      background: #fff; border: 1px solid #e8e0d0; border-radius: 6px; overflow: hidden;
    }
    .book-row-header {
      display: flex; align-items: center; gap: 14px; padding: 14px 18px; cursor: pointer;
      transition: background 0.15s;
    }
    .book-row-header:hover { background: #faf7f0; }
    .drag-handle { padding-right: 8px; color: #bbb; cursor: grab; }
    .book-order { font-size: 0.7rem; color: #bbb; font-weight: 700; width: 20px; text-align: center; }
    .book-title { font-weight: 700; color: #2a2017; flex: 1; }
    .book-genre { font-size: 0.78rem; color: #888; }
    .book-year  { font-size: 0.78rem; color: #aaa; width: 36px; }
    .featured-dot { font-size: 1rem; color: #ccc; cursor: pointer; transition: transform 0.1s; }
    .featured-dot:hover { transform: scale(1.3); }
    .featured-dot.on { color: var(--amber); }
    .book-edit-form { padding: 20px; border-top: 1px solid #f0ebe0; background: #faf9f5; }

    /* ── Generic Data List (News) ────────────────────────────────────────── */
    .book-list { display: flex; flex-direction: column; gap: 8px; }
    .list-header {
      display: flex; gap: 14px; padding: 0 18px 8px;
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #888; border-bottom: 2px solid #e8e0d0;
      margin-bottom: 8px;
    }
    .list-row {
      background: #fff; border: 1px solid #e8e0d0; border-radius: 6px;
      display: flex; align-items: center; gap: 14px; padding: 14px 18px;
      color: #2a2017;
    }
    .col-main { flex: 1; }
    .col-small { width: 100px; font-size: 0.85rem; color: #666; }
    .col-small.actions { display: flex; gap: 8px; }
    .btn-icon {
      background: transparent; border: none; font-size: 1.1rem;
      cursor: pointer; opacity: 0.6; transition: opacity 0.2s;
    }
    .btn-icon:hover { opacity: 1; }
    .btn-icon.delete:hover { color: #e74c3c; opacity: 1; filter: grayscale(0) hue-rotate(-20deg); }
    .status-badge {
      font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 12px;
      background: #eee; color: #888;
    }
    .status-badge.published { background: #d5f5e3; color: #2ecc71; }
    .empty-state { text-align: center; padding: 40px; color: #aaa; font-style: italic; }

    /* ── Quotes tab ──────────────────────────────────────────────────────── */
    /* Searchable picker */
    .book-picker {
      display: flex; align-items: flex-end; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
    }
    .picker-field { display: flex; flex-direction: column; gap: 5px; }
    .picker-label {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #888;
    }
    .picker-wrap { position: relative; }
    .picker-input {
      padding: 10px 14px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;
      min-width: 300px; background: #fff; color: #2a2017; outline: none; transition: border-color 0.2s;
    }
    .picker-input:focus { border-color: var(--amber); }
    .picker-dropdown {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 100;
      background: #fff; border: 1px solid #ddd; border-radius: 4px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12); max-height: 240px; overflow-y: auto;
    }
    .picker-option {
      padding: 10px 14px; cursor: pointer; font-size: 0.9rem; color: #2a2017;
      transition: background 0.12s;
    }
    .picker-option:hover, .picker-option.selected { background: #faf3e8; color: var(--amber); }
    .picker-empty { padding: 12px 14px; font-size: 0.85rem; color: #aaa; font-style: italic; }
    .btn-paste-toggle {
      padding: 9px 18px; background: #f0ebe0; color: #7a6a4a;
      border: 1px solid #ddd; border-radius: 4px; font-size: 0.82rem; font-weight: 700;
      cursor: pointer; transition: background 0.2s;
    }
    .btn-paste-toggle:hover { background: #e8dfc8; }

    /* Paste panel */
    .paste-panel {
      background: #fff8ef; border: 1px solid rgba(212,134,58,0.25);
      border-radius: 6px; padding: 20px; margin-bottom: 24px;
    }
    .paste-header { margin-bottom: 12px; }
    .paste-header strong { font-size: 0.95rem; color: #2a2017; }
    .paste-hint {
      display: block; margin-top: 4px; font-size: 0.8rem; color: #888; line-height: 1.5;
    }
    .paste-hint code {
      background: #f0e8d4; padding: 1px 5px; border-radius: 3px;
      font-family: monospace; font-size: 0.78rem; color: var(--amber);
    }
    .paste-textarea {
      width: 100%; box-sizing: border-box; padding: 14px; border: 1px solid #ddd;
      border-radius: 4px; font-family: var(--font-serif); font-size: 0.93rem;
      line-height: 1.8; color: #2a2017; resize: vertical; outline: none;
      background: #fff; transition: border-color 0.2s;
    }
    .paste-textarea:focus { border-color: var(--amber); }
    .paste-actions { display: flex; align-items: center; gap: 14px; margin-top: 12px; flex-wrap: wrap; }
    .btn-parse {
      padding: 9px 22px; background: var(--amber); color: #fff;
      border: none; border-radius: 4px; font-size: 0.85rem; font-weight: 700; cursor: pointer;
      transition: background 0.2s;
    }
    .btn-parse:hover { background: var(--amber-light); }
    .paste-note { font-size: 0.78rem; color: #999; }
    .parse-preview { margin-top: 16px; padding-top: 14px; border-top: 1px solid #f0e8d4; }
    .preview-title { font-size: 0.8rem; font-weight: 700; color: #888; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
    .preview-chip {
      display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px;
      background: #f5ede0; border-radius: 20px; font-size: 0.8rem; color: #5a4020;
      margin: 3px 4px;
    }
    .chip-type { font-weight: 700; font-size: 0.68rem; text-transform: uppercase; color: var(--amber); }
    .btn-apply {
      display: block; margin-top: 14px; padding: 10px 24px;
      background: #2ecc71; color: #fff; border: none; border-radius: 4px;
      font-size: 0.85rem; font-weight: 700; cursor: pointer;
    }

    .quote-admin-list { display: flex; flex-direction: column; gap: 12px; }

    /* Sticky save bar */
    .sticky-save-bar {
      position: sticky;
      top: 60px; /* below the fixed admin topbar */
      z-index: 50;
      background: #fff;
      border: 1px solid #e8e0d0;
      border-radius: 6px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      margin-bottom: 4px;
    }
    .sticky-info {
      font-size: 0.82rem;
      color: #888;
      font-weight: 600;
    }
    .sticky-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .save-all-msg {
      font-size: 0.82rem;
      font-weight: 700;
      color: #2ecc71;
    }
    .btn-save-all {
      padding: 9px 22px;
      background: #2ecc71;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, opacity 0.2s;
    }
    .btn-save-all:hover:not(:disabled) { background: #27ae60; }
    .btn-save-all:disabled { opacity: 0.55; cursor: not-allowed; }

    .quote-admin-block {
      background: #fff; border: 1px solid #e8e0d0; border-radius: 6px; padding: 16px;
    }
    .quote-block-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .order-btns { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .order-btns button {
      padding: 2px 6px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 2px;
      cursor: pointer; font-size: 0.65rem; line-height: 1;
    }
    .order-btns button:disabled { opacity: 0.3; cursor: default; }
    .order-num { font-size: 0.65rem; color: #bbb; }
    .type-select {
      padding: 7px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.78rem;
      font-weight: 700; background: #fafaf8; color: #555; min-width: 110px;
    }
    .label-input {
      flex: 1; padding: 7px 10px; border: 1px solid #ddd; border-radius: 4px;
      font-size: 0.88rem; background: #fafaf8; color: #2a2017; outline: none;
    }
    .label-input:focus { border-color: var(--amber); }
    .quote-content-area {
      width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid #ddd;
      border-radius: 4px; font-family: var(--font-serif); font-size: 0.95rem;
      line-height: 1.8; color: #2a2017; resize: vertical; outline: none;
      transition: border-color 0.2s;
    }
    .quote-content-area:focus { border-color: var(--amber); }
    .quote-save-row { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
    .save-indicator { font-size: 0.78rem; color: #2ecc71; font-weight: 600; }
    .no-quotes { color: #aaa; font-style: italic; text-align: center; padding: 40px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  tab: 'books' | 'quotes' | 'messages' | 'content' | 'news' | 'author' = 'books';

  books: Book[] = [];
  booksLoading = false;
  booksError   = '';
  editingBookId: number | null = null;
  importing = false;
  generatingReview = false;
  newBook: Book | null = null;
  bookSaveMsg: Record<number, string> = {};

  quotes: Quote[] = [];
  quotesLoading = false;
  quotesError   = '';
  selectedBookId: number | null = null;
  selectedBookTitle = '';
  quoteSaveMsg: Record<number, string> = {};
  saveAllMsg = '';
  saveAllInProgress = false;

  // Searchable picker state
  bookSearch     = '';
  filteredBooks: Book[] = [];
  pickerOpen     = false;
  pickerHighlight = -1;

  // Smart paste state
  pasteOpen      = false;
  rawQuotesPaste = '';
  parsedPreview: Quote[] = [];

  // ── Messages state ────────────────────────────────────────────────────────
  messages: Inquiry[] = [];
  messagesLoading = false;
  messagesError   = '';
  unreadCount     = 0;
  expandedMsgId: number | null = null;
  replyDrafts: Record<number, string>  = {};
  replySending: Record<number, boolean> = {};
  replyStatus: Record<number, 'ok' | 'err'> = {};

  // ── News state ────────────────────────────────────────────────────────────
  newsPosts: NewsPost[] = [];
  editingNewsPost: NewsPost | null = null;

  bookImportOpen = false;
  bookImportSearch = '';
  bookImportLoading = false;
  bookImportError = '';
  bookImportResults: any[] = [];

  sectionTypes = SECTION_TYPES;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadBooks();
    this.loadUnreadCount();
  }

  // ── Auth helpers ──────────────────────────────────────────────────────────

  private get headers(): HttpHeaders {
    let creds = '';
    if (isPlatformBrowser(this.platformId)) {
      creds = sessionStorage.getItem('md_admin_creds') ?? '';
    }
    return new HttpHeaders({ Authorization: `Basic ${creds}`, 'Content-Type': 'application/json' });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('md_admin_creds');
    }
    this.router.navigate(['/admin/login']);
  }

  // ── Books ─────────────────────────────────────────────────────────────────

  loadBooks(): void {
    this.booksLoading = true;
    this.booksError   = '';
    this.http.get<Book[]>(`${API_BASE}/api/books`).subscribe({
      next: s => { this.books = s; this.booksLoading = false; },
      error: () => { this.booksError = 'Failed to load books.'; this.booksLoading = false; }
    });
  }

  onBookDrop(event: CdkDragDrop<Book[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    
    moveItemInArray(this.books, event.previousIndex, event.currentIndex);
    
    // Update display orders based on new position
    this.books.forEach((book, index) => {
      const newOrder = index + 1;
      if (book.displayOrder !== newOrder) {
        book.displayOrder = newOrder;
        this.http.put(`${API_BASE}/api/admin/books/${book.id}`, book, { headers: this.headers }).subscribe();
      }
    });
  }

  toggleBookEdit(book: Book): void {
    this.editingBookId = this.editingBookId === book.id ? null : book.id!;
  }

  /** Jump to Quotes tab with this book pre-selected and loaded. */
  switchToQuotes(bookId: number): void {
    this.tab = 'quotes';
    this.editingBookId = null;
    this.selectPickerBook(this.books.find(s => s.id === bookId)!);
  }

  // ── Searchable picker ─────────────────────────────────────────────────────

  onBookSearch(): void {
    const q = this.bookSearch.toLowerCase();
    this.filteredBooks = this.books.filter(s => s.title.toLowerCase().includes(q));
    this.pickerOpen = true;
    this.pickerHighlight = -1;
  }

  onPickerKey(event: KeyboardEvent): void {
    if (!this.pickerOpen || !this.filteredBooks.length) {
      if (event.key === 'ArrowDown') { this.pickerOpen = true; this.pickerHighlight = 0; event.preventDefault(); }
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.pickerHighlight = Math.min(this.pickerHighlight + 1, this.filteredBooks.length - 1);
        this.scrollOptionIntoView();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.pickerHighlight = Math.max(this.pickerHighlight - 1, 0);
        this.scrollOptionIntoView();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.pickerHighlight >= 0 && this.pickerHighlight < this.filteredBooks.length) {
          this.selectPickerBook(this.filteredBooks[this.pickerHighlight]);
        }
        break;
      case 'Escape':
        this.pickerOpen = false;
        this.pickerHighlight = -1;
        break;
    }
  }

  private scrollOptionIntoView(): void {
    setTimeout(() => {
      const el = document.getElementById('picker-opt-' + this.pickerHighlight);
      el?.scrollIntoView({ block: 'nearest' });
    });
  }

  selectPickerBook(book: Book): void {
    this.bookSearch       = book.title;
    this.selectedBookId   = book.id!;
    this.selectedBookTitle = book.title;
    this.pickerOpen       = false;
    this.pasteOpen        = false;
    this.parsedPreview    = [];
    this.saveAllMsg       = '';
    this.loadQuotes(book.id!);
  }

  closePicker(): void {
    // Delay to allow mousedown on options to fire first
    setTimeout(() => this.pickerOpen = false, 150);
  }

  // ── Smart paste & parse ───────────────────────────────────────────────────

  /**
   * Parses raw pasted quotes into Quote blocks.
   * Recognises headers like: (Verse 1)  **(Chorus)**  [Bridge]  Verse 2:  etc.
   */
  parsePastedQuotes(): void {
    const headerRe = /^[*(\[]*\*{0,2}\s*((Verse|Pre-Chorus|Chorus|Bridge|Outro|Final Chorus|Intro)[^)\]\n*]*?)\*{0,2}[)\]]*\s*:?$/im;
    const lines = this.rawQuotesPaste.split('\n');
    const blocks: Quote[] = [];
    let currentLabel  = '';
    let currentType   = 'VERSE';
    let currentLines: string[] = [];

    const flush = () => {
      const text = currentLines.join('\n').trim();
      if (text && currentLabel) {
        blocks.push({ sectionLabel: currentLabel, sectionType: currentType, content: text, displayOrder: blocks.length + 1 });
      }
      currentLines = [];
    };

    for (const raw of lines) {
      const line = raw.trim();
      // Strip markdown bold/italic wrappers and parens/brackets to test if it's a header
      const stripped = line.replace(/^\*{1,2}/, '').replace(/\*{1,2}$/, '')
                            .replace(/^\(/, '').replace(/\)$/, '')
                            .replace(/^\[/, '').replace(/\]$/, '').trim();
      const matched  = headerRe.exec(stripped);
      if (matched || this.looksLikeHeader(stripped)) {
        flush();
        currentLabel = stripped.replace(/^\(|\)$/g, '').replace(/\[|\]/g, '').trim();
        currentType  = this.inferType(currentLabel);
      } else {
        currentLines.push(raw);
      }
    }
    flush();
    this.parsedPreview = blocks;
  }

  /** Heuristic: short line, no lowercase start, looks like a section name */
  private looksLikeHeader(s: string): boolean {
    if (!s || s.length > 60) return false;
    return /^(verse|pre-?chorus|chorus|bridge|outro|final chorus|intro)/i.test(s);
  }

  /** Map a label string to the nearest SectionType enum value */
  private inferType(label: string): string {
    const l = label.toLowerCase();
    if (/pre.?chorus/.test(l))  return 'PRE_CHORUS';
    if (/chorus/.test(l))       return 'CHORUS';
    if (/bridge/.test(l))       return 'BRIDGE';
    if (/outro/.test(l))        return 'OUTRO';
    if (/intro/.test(l))        return 'VERSE';
    return 'VERSE';
  }

  /** Replace working quotes list with parsed preview so user can edit before saving */
  applyParsed(): void {
    this.quotes    = [...this.parsedPreview];
    this.parsedPreview = [];
    this.pasteOpen = false;
    this.rawQuotesPaste = '';
  }

  startNewBook(): void {
    this.newBook = {
      title: '', purchaseUrl: '', goodreadsUrl: '', imageUrl: '', genre: '',
      releaseYear: new Date().getFullYear(), authorName: '',
      featuredStatus: true, readingStatus: 'READ', displayOrder: this.books.length + 1, description: '', fullReview: ''
    };
  }

  saveNewBook(): void {
    if (!this.newBook?.title) return;
    this.http.post<Book>(`${API_BASE}/api/books`, this.newBook, { headers: this.headers }).subscribe({
      next: s => { this.books.push(s); this.newBook = null; },
      error: e => alert('Failed to create book')
    });
  }

  toggleFeatured(book: Book, event: Event): void {
    event.stopPropagation();
    book.featuredStatus = !book.featuredStatus;
    this.http.put<Book>(`${API_BASE}/api/books/${book.id}`, book, { headers: this.headers }).subscribe({
      next: () => {},
      error: () => {
        book.featuredStatus = !book.featuredStatus;
        alert('Failed to save featured status.');
      }
    });
  }

  updateBook(book: Book): void {
    this.http.put<Book>(`${API_BASE}/api/books/${book.id}`, book, { headers: this.headers }).subscribe({
      next: updated => {
        const idx = this.books.findIndex(s => s.id === book.id);
        if (idx !== -1) this.books[idx] = updated;
        this.bookSaveMsg[book.id!] = '✓ Saved';
        setTimeout(() => delete this.bookSaveMsg[book.id!], 2500);
      },
      error: () => { this.bookSaveMsg[book.id!] = '✗ Save failed'; }
    });
  }

  deleteBook(book: Book): void {
    if (!confirm(`Delete "${book.title}"? This will also remove all its quotes.`)) return;
    this.http.delete(`${API_BASE}/api/books/${book.id}`, { headers: this.headers }).subscribe({
      next: () => { this.books = this.books.filter(s => s.id !== book.id); this.editingBookId = null; },
      error: () => alert('Delete failed.')
    });
  }

  allSelected(): boolean {
    return this.books.length > 0 && this.books.every(s => s.selected);
  }

  hasSelected(): boolean {
    return this.books.some(s => s.selected);
  }

  getSelectedCount(): number {
    return this.books.filter(s => s.selected).length;
  }

  toggleAllSelected(event: any): void {
    const checked = event.target.checked;
    this.books.forEach(s => s.selected = checked);
  }

  deleteSelectedBooks(): void {
    const selected = this.books.filter(s => s.selected);
    if (selected.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selected.length} books?`)) return;

    const ids = selected.map(s => s.id);
    this.http.post(`${API_BASE}/api/books/batch-delete`, ids, { headers: this.headers }).subscribe({
      next: () => {
        this.books = this.books.filter(s => !ids.includes(s.id));
        if (this.editingBookId && ids.includes(this.editingBookId)) {
          this.editingBookId = null;
        }
      },
      error: () => alert('Failed to delete selected books. Check backend connection.')
    });
  }

  // ── Import API ───────────────────────────────────────────────────────────────

  searchAuthor(authorName: string) {
    if (!authorName) return;
    this.bookImportSearch = authorName;
    this.searchBooksApi();
  }

  searchBooksApi(): void {
    if (!this.bookImportSearch) return;
    this.bookImportLoading = true;
    this.bookImportError = '';
    this.bookImportResults = [];
    
    this.http.get<any[]>(`${API_BASE}/api/import/books?query=${encodeURIComponent(this.bookImportSearch)}`, { headers: this.headers }).subscribe({
      next: (results) => {
        this.bookImportResults = results.map(r => ({...r, selected: false}));
        this.bookImportLoading = false;
        if (this.bookImportResults.length === 0) {
          this.bookImportError = 'No results found or all matching books are already in the database.';
        }
      },
      error: () => {
        this.bookImportError = 'Failed to search the Books Database.';
        this.bookImportLoading = false;
      }
    });
  }

  fetchBookMetadata(book: Book): void {
    const query = `${book.title} ${book.authorName || ''}`;
    this.http.get<any[]>(`${API_BASE}/api/import/books?query=${encodeURIComponent(query)}`, { headers: this.headers }).subscribe({
      next: (results) => {
        if (results && results.length > 0) {
          const track = results[0];
          book.purchaseUrl = track.purchaseUrl || book.purchaseUrl;
          book.goodreadsUrl = track.goodreadsUrl || book.goodreadsUrl;
          book.imageUrl = track.imageUrl || book.imageUrl;
          book.releaseYear = track.releaseYear || book.releaseYear;
          book.authorName = track.authorName || book.authorName;
          book.description = track.description || book.description;
          this.bookSaveMsg[book.id!] = 'Fetched metadata successfully. Don\'t forget to save!';
        } else {
          this.bookSaveMsg[book.id!] = 'No matching books found.';
        }
        setTimeout(() => delete this.bookSaveMsg[book.id!], 4000);
      },
      error: () => {
        this.bookSaveMsg[book.id!] = 'Error fetching metadata.';
        setTimeout(() => delete this.bookSaveMsg[book.id!], 4000);
      }
    });
  }

  allImportSelected(): boolean {
    return this.bookImportResults.length > 0 && this.bookImportResults.every(t => t.selected);
  }

  toggleAllImport(event: any): void {
    const checked = event.target.checked;
    this.bookImportResults.forEach(t => t.selected = checked);
  }

  getSelectedImportCount(): number {
    return this.bookImportResults.filter(t => t.selected).length;
  }

  getExistingBook(track: any): Book | undefined {
    return this.books.find(s => 
      (s.purchaseUrl && s.purchaseUrl === track.purchaseUrl) || 
      (s.title && s.title.toLowerCase() === track.title.toLowerCase())
    );
  }

  importSelectedBooks(): void {
    const selected = this.bookImportResults.filter(t => t.selected);
    if (selected.length === 0) return;
    
    this.bookImportLoading = true;
    this.bookImportError = '';
    
    let count = 0;
    const errors: string[] = [];
    
    selected.forEach(track => {
      const existing = this.getExistingBook(track);
      
      if (existing) {
        // Update existing book
        const updatedBook: Book = {
          ...existing,
          title: track.title,
          purchaseUrl: track.purchaseUrl,
          goodreadsUrl: track.goodreadsUrl,
          imageUrl: track.imageUrl || existing.imageUrl || '',
          genre: track.genre || existing.genre || '',
          releaseYear: track.releaseYear || existing.releaseYear || new Date().getFullYear(),
          authorName: track.authorName || existing.authorName || '',
        };
        
        this.http.put<Book>(`${API_BASE}/api/books/${existing.id}`, updatedBook, { headers: this.headers }).subscribe({
          next: (saved) => {
            const idx = this.books.findIndex(s => s.id === saved.id);
            if (idx > -1) this.books[idx] = saved;
            count++;
            if (count === selected.length) {
              this.bookImportLoading = false;
              this.bookImportOpen = false;
            }
          },
          error: () => {
            errors.push(track.title);
            count++;
            if (count === selected.length) {
              this.bookImportLoading = false;
              this.bookImportError = 'Failed to import/update some books: ' + errors.join(', ');
            }
          }
        });
      } else {
        // Insert new book
        const newBook: Book = {
          title: track.title,
          purchaseUrl: track.purchaseUrl,
          goodreadsUrl: track.goodreadsUrl,
          imageUrl: track.imageUrl || '',
          genre: track.genre || '',
          releaseYear: track.releaseYear || new Date().getFullYear(),
          authorName: track.authorName || '',
          featuredStatus: false,
          readingStatus: 'READ',
          displayOrder: this.books.length + 1,
          description: track.description || '',
          fullReview: ''
        };
        
        this.http.post<Book>(`${API_BASE}/api/books`, newBook, { headers: this.headers }).subscribe({
          next: (saved) => {
            this.books.push(saved);
            count++;
            if (count === selected.length) {
              this.bookImportLoading = false;
              this.bookImportOpen = false;
            }
          },
          error: () => {
            errors.push(track.title);
            count++;
            if (count === selected.length) {
              this.bookImportLoading = false;
              this.bookImportError = 'Failed to import/update some books: ' + errors.join(', ');
            }
          }
        });
      }
    });
  }

  // --- Image Upload Logic ---
  isDragOver = false;
  uploadingBookId: string | number | null = null;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }
  
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }
  
  onDrop(event: DragEvent, targetBook: Book) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.uploadFile(event.dataTransfer.files[0], targetBook);
    }
  }
  
  onFileSelected(event: any, targetBook: Book) {
    if (event.target.files && event.target.files.length > 0) {
      this.uploadFile(event.target.files[0], targetBook);
    }
  }
  
  uploadFile(file: File, targetBook: Book) {
    this.uploadingBookId = targetBook.id || 'new';
    const formData = new FormData();
    formData.append('file', file);
    
    // Headers must explicitly exclude Content-Type so browser sets boundary for multipart
    let uploadHeaders = new HttpHeaders();
    if (this.headers.has('Authorization')) {
      uploadHeaders = uploadHeaders.set('Authorization', this.headers.get('Authorization')!);
    }
    
    this.http.post<{url: string}>(`${API_BASE}/api/admin/upload`, formData, { headers: uploadHeaders }).subscribe({
      next: (res) => {
        let baseUrl = API_BASE;
        if (baseUrl.endsWith('/api')) {
          baseUrl = baseUrl.substring(0, baseUrl.length - 4);
        }
        targetBook.imageUrl = baseUrl + res.url;
        this.uploadingBookId = null;
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('Image upload failed. Ensure the server is running and upload directory is writable.');
        this.uploadingBookId = null;
      }
    });
  }

  // ── Quotes ────────────────────────────────────────────────────────────────

  loadQuotes(bookId: number | null): void {
    if (!bookId) { this.quotes = []; return; }
    this.quotesLoading = true;
    this.quotesError   = '';
    this.http.get<Quote[]>(`${API_BASE}/api/books/${bookId}/quotes`).subscribe({
      next: l => { this.quotes = l; this.quotesLoading = false; },
      error: () => { this.quotesError = 'Failed to load quotes.'; this.quotesLoading = false; }
    });
  }

  addQuoteBlock(): void {
    const maxOrder = this.quotes.reduce((m, l) => Math.max(m, l.displayOrder), 0);
    this.quotes.push({ sectionLabel: 'Verse', sectionType: 'VERSE', content: '', displayOrder: maxOrder + 1 });
  }

  saveQuote(quote: Quote): void {
    if (quote.id) {
      // Update existing
      this.http.put<Quote>(`${API_BASE}/api/quotes/${quote.id}`, quote, { headers: this.headers }).subscribe({
        next: updated => {
          Object.assign(quote, updated);
          this.quoteSaveMsg[quote.id!] = '✓ Saved';
          setTimeout(() => delete this.quoteSaveMsg[quote.id!], 2500);
        },
        error: () => { this.quoteSaveMsg[quote.id!] = '✗ Failed'; }
      });
    } else {
      // Create new
      this.http.post<Quote>(`${API_BASE}/api/books/${this.selectedBookId}/quotes`, quote, { headers: this.headers }).subscribe({
        next: created => {
          Object.assign(quote, created);
          this.quoteSaveMsg[quote.id!] = '✓ Created';
          setTimeout(() => delete this.quoteSaveMsg[quote.id!], 2500);
        },
        error: () => { alert('Create failed.'); }
      });
    }
  }

  deleteQuote(quote: Quote, index: number): void {
    if (!confirm(`Delete "${quote.sectionLabel}"?`)) return;
    if (!quote.id) { this.quotes.splice(index, 1); return; }
    this.http.delete(`${API_BASE}/api/quotes/${quote.id}`, { headers: this.headers }).subscribe({
      next: () => this.quotes.splice(index, 1),
      error: () => alert('Delete failed.')
    });
  }

  moveQuote(index: number, dir: -1 | 1): void {
    const target = index + dir;
    if (target < 0 || target >= this.quotes.length) return;
    [this.quotes[index], this.quotes[target]] = [this.quotes[target], this.quotes[index]];
    // Reassign display orders
    this.quotes.forEach((l, i) => l.displayOrder = i + 1);
    // Persist reorder for any block that already has an ID
    const orderMap: Record<number, number> = {};
    this.quotes.filter(l => l.id).forEach(l => orderMap[l.id!] = l.displayOrder);
    if (Object.keys(orderMap).length > 0) {
      this.http.put(`${API_BASE}/api/books/${this.selectedBookId}/quotes/reorder`,
                    orderMap, { headers: this.headers }).subscribe();
    }
  }

  /** Save every quote block sequentially — new blocks (no id) are created, existing ones updated. */
  saveAllQuotes(): void {
    if (!this.selectedBookId || this.quotes.length === 0) return;
    this.saveAllInProgress = true;
    this.saveAllMsg = '';

    const pending = [...this.quotes];
    let saved = 0;
    let failed = 0;

    const saveNext = (i: number) => {
      if (i >= pending.length) {
        this.saveAllInProgress = false;
        this.saveAllMsg = failed === 0
          ? `✓ All ${saved} block${saved !== 1 ? 's' : ''} saved`
          : `⚠ ${saved} saved, ${failed} failed`;
        setTimeout(() => this.saveAllMsg = '', 4000);
        return;
      }
      const quote = pending[i];
      if (quote.id) {
        this.http.put<Quote>(`${API_BASE}/api/quotes/${quote.id}`, quote, { headers: this.headers })
          .subscribe({
            next: updated => { Object.assign(quote, updated); saved++; saveNext(i + 1); },
            error: ()      => { failed++; saveNext(i + 1); }
          });
      } else {
        this.http.post<Quote>(`${API_BASE}/api/books/${this.selectedBookId}/quotes`, quote, { headers: this.headers })
          .subscribe({
            next: created => { Object.assign(quote, created); saved++; saveNext(i + 1); },
            error: ()     => { failed++; saveNext(i + 1); }
          });
      }
    };

    saveNext(0);
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  /** Fetch unread count for the tab badge (called on init) */
  loadUnreadCount(): void {
    this.http.get<{ count: number }>(`${API_BASE}/api/contact/admin/unread`)
      .subscribe({ next: r => this.unreadCount = r.count, error: () => {} });
  }

  /** Switch to messages tab and load inbox */
  switchToMessages(): void {
    this.tab = 'messages';
    this.loadMessages();
  }

  /** Load all contact inquiries */
  loadMessages(): void {
    this.messagesLoading = true;
    this.messagesError   = '';
    this.http.get<Inquiry[]>(`${API_BASE}/api/contact/admin`, { headers: this.headers })
      .subscribe({
        next: msgs => {
          this.messages = msgs;
          this.messagesLoading = false;
          this.unreadCount = msgs.filter(m => !m.read).length;
        },
        error: () => {
          this.messagesError = 'Failed to load messages.';
          this.messagesLoading = false;
        }
      });
  }

  /** Expand/collapse a message and mark it read */
  toggleMessage(m: Inquiry): void {
    if (this.expandedMsgId === m.id) {
      this.expandedMsgId = null;
      return;
    }
    this.expandedMsgId = m.id;
    if (!m.read) {
      this.http.put<Inquiry>(`${API_BASE}/api/contact/admin/${m.id}/read`, {}, { headers: this.headers })
        .subscribe({ next: updated => { Object.assign(m, updated); this.unreadCount = Math.max(0, this.unreadCount - 1); }, error: () => {} });
    }
  }

  /** Send reply email */
  sendReply(m: Inquiry): void {
    const text = this.replyDrafts[m.id]?.trim();
    if (!text) return;
    this.replySending[m.id] = true;
    this.http.post<{ success: boolean; message: string }>(
      `${API_BASE}/api/contact/admin/${m.id}/reply`,
      { replyText: text },
      { headers: this.headers }
    ).subscribe({
      next: res => {
        this.replySending[m.id] = false;
        if (res.success) {
          this.replyStatus[m.id] = 'ok';
          m.replied = true;
          m.replyText = text;
          this.replyDrafts[m.id] = '';
        } else {
          this.replyStatus[m.id] = 'err';
        }
        setTimeout(() => delete this.replyStatus[m.id], 5000);
      },
      error: () => {
        this.replySending[m.id] = false;
        this.replyStatus[m.id] = 'err';
        setTimeout(() => delete this.replyStatus[m.id], 5000);
      }
    });
  }

  // ── Content Editor ───────────────────────────────────────────────────
  contentItems: { key: string; label: string; section: string; value: string }[] = [];
  contentBySection: Record<string, { key: string; label: string; section: string; value: string }[]> = {};
  contentSections: string[] = [];
  contentLoading = false;
  contentError   = '';
  contentDirty:  Record<string, boolean> = {};
  contentSaving: Record<string, boolean> = {};
  contentStatus: Record<string, 'ok' | 'err'> = {};

  switchToContent(): void {
    this.tab = 'content';
    if (this.contentItems.length === 0) this.loadContent();
  }

  loadContent(): void {
    this.contentLoading = true;
    this.contentError   = '';
    this.http.get<{ key: string; label: string; section: string; value: string }[]>(
      `${API_BASE}/api/content`, { headers: this.headers }
    ).subscribe({
      next: items => {
        this.contentItems = items;
        // group by section
        this.contentBySection = {};
        this.contentSections  = [];
        for (const item of items) {
          if (!this.contentBySection[item.section]) {
            this.contentBySection[item.section] = [];
            this.contentSections.push(item.section);
          }
          this.contentBySection[item.section].push(item);
        }
        this.contentLoading = false;
      },
      error: () => {
        this.contentError   = 'Failed to load content.';
        this.contentLoading = false;
      }
    });
  }

  saveContent(item: { key: string; value: string }): void {
    this.contentSaving[item.key] = true;
    this.http.put(
      `${API_BASE}/api/content/${item.key}`,
      { value: item.value },
      { headers: this.headers }
    ).subscribe({
      next: () => {
        this.contentSaving[item.key] = false;
        this.contentDirty[item.key]  = false;
        this.contentStatus[item.key] = 'ok';
        setTimeout(() => delete this.contentStatus[item.key], 3000);
      },
      error: () => {
        this.contentSaving[item.key] = false;
        this.contentStatus[item.key] = 'err';
        setTimeout(() => delete this.contentStatus[item.key], 4000);
      }
    });
  }

  // ── Author Profile ─────────────────────────────────────────────────────────
  authorProfile: {
    name: string; websiteUrl: string; contactEmail: string; tagline: string;
    purchaseUrl: string; instagramUrl: string; facebookUrl: string;
  } | null = null;
  authorLoading = false;
  authorError   = '';
  authorSaving  = false;
  authorStatus: 'ok' | 'err' | '' = '';

  switchToAuthor(): void {
    this.tab = 'author';
    if (!this.authorProfile) this.loadAuthorProfile();
  }

  loadAuthorProfile(): void {
    this.authorLoading = true;
    this.authorError   = '';
    this.http.get<any>(`${API_BASE}/api/author`).subscribe({
      next: p => {
        this.authorProfile = {
          name:         p.name         ?? '',
          websiteUrl:   p.websiteUrl   ?? '',
          contactEmail: p.contactEmail ?? '',
          tagline:      p.tagline      ?? '',
          purchaseUrl:   p.purchaseUrl   ?? '',
          instagramUrl: p.instagramUrl ?? '',
          facebookUrl:  p.facebookUrl  ?? '',
        };
        this.authorLoading = false;
      },
      error: () => {
        this.authorError   = 'Failed to load author profile.';
        this.authorLoading = false;
      }
    });
  }

  saveAuthorProfile(): void {
    if (!this.authorProfile) return;
    this.authorSaving = true;
    this.authorStatus = '';
    this.http.put<any>(`${API_BASE}/api/author`, this.authorProfile, { headers: this.headers })
      .subscribe({
        next: updated => {
          this.authorProfile = {
            name:         updated.name         ?? '',
            websiteUrl:   updated.websiteUrl   ?? '',
            contactEmail: updated.contactEmail ?? '',
            tagline:      updated.tagline      ?? '',
            purchaseUrl:   updated.purchaseUrl   ?? '',
            instagramUrl: updated.instagramUrl ?? '',
            facebookUrl:  updated.facebookUrl  ?? '',
          };
          this.authorSaving = false;
          this.authorStatus = 'ok';
          setTimeout(() => this.authorStatus = '', 4000);
        },
        error: () => {
          this.authorSaving = false;
          this.authorStatus = 'err';
          setTimeout(() => this.authorStatus = '', 4000);
        }
      });
  }

  // ── News Logic ────────────────────────────────────────────────────────────

  switchToNews(): void {
    this.tab = 'news';
    this.loadNewsPosts();
  }

  loadNewsPosts(): void {
    this.http.get<NewsPost[]>(`${API_BASE}/api/news/admin`, { headers: this.headers }).subscribe({
      next: n => this.newsPosts = n,
      error: () => alert('Failed to load news posts')
    });
  }

  startNewNewsPost(): void {
    this.editingNewsPost = { title: '', content: '', imageUrl: '', published: true };
  }

  editNewsPost(post: NewsPost): void {
    this.editingNewsPost = { ...post };
  }

  copyNewsPost(post: NewsPost): void {
    // Copy the contents but omit the ID so it saves as a new post
    this.editingNewsPost = { 
      title: `${post.title} (Copy)`, 
      content: post.content, 
      imageUrl: post.imageUrl, 
      published: false 
    };
  }

  saveNewsPost(): void {
    if (!this.editingNewsPost?.title) return;
    const post = this.editingNewsPost;
    if (post.id) {
      this.http.put<NewsPost>(`${API_BASE}/api/news/${post.id}`, post, { headers: this.headers }).subscribe({
        next: updated => {
          const idx = this.newsPosts.findIndex(n => n.id === updated.id);
          if (idx !== -1) this.newsPosts[idx] = updated;
          this.editingNewsPost = null;
        },
        error: () => alert('Failed to update news post')
      });
    } else {
      this.http.post<NewsPost>(`${API_BASE}/api/news`, post, { headers: this.headers }).subscribe({
        next: created => {
          this.newsPosts.unshift(created);
          this.editingNewsPost = null;
        },
        error: () => alert('Failed to create news post')
      });
    }
  }

  deleteNewsPost(post: NewsPost): void {
    if (confirm(`Delete news post "${post.title}"?`)) {
      this.http.delete(`${API_BASE}/api/news/${post.id}`, { headers: this.headers }).subscribe({
        next: () => this.newsPosts = this.newsPosts.filter(n => n.id !== post.id),
        error: () => alert('Failed to delete news post')
      });
    }
  }

  generateReview(book: Book) {
    if (!book.title || !book.authorName) {
      alert('Please fill in the Title and Author first!');
      return;
    }
    this.generatingReview = true;
    const payload = {
      title: book.title,
      author: book.authorName,
      genre: book.genre || 'General Fiction',
      existingReview: book.fullReview || ''
    };
    
    this.http.post<{generatedReview: string}>(`${API_BASE}/api/admin/ai/review`, payload, { headers: this.headers })
      .subscribe({
        next: (res) => {
          book.fullReview = res.generatedReview;
          this.generatingReview = false;
        },
        error: (err) => {
          console.error('Error generating review:', err);
          alert('Failed to generate review. Check the backend logs.');
          this.generatingReview = false;
        }
      });
  }
}
