import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

export interface PageSeoConfig {
  title: string;
  description: string;
  /** Absolute URL of the page (e.g. https://presentlyreading.com/music) */
  url?: string;
  /** Absolute URL of an image for social cards */
  image?: string;
  /** 'website' | 'music.album' | 'article' — defaults to 'website' */
  type?: string;
  /** JSON-LD structured data schema */
  jsonLd?: any;
}

const SITE_NAME   = 'Presently Reading';
const BASE_URL    = 'https://presentlyreading.com';
const DEFAULT_IMG = `${BASE_URL}/assets/images/og_image.png`;

const DEFAULT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": "Presently Reading",
  "url": "https://presentlyreading.com",
  "logo": "https://presentlyreading.com/assets/images/favicon-192.png",
  "image": "https://presentlyreading.com/assets/images/og_image.png",
  "description": "An AI-crafted musical project steeped in the sights, sounds, and soul of the American South. Indie, industrial static, moody pop, and rock.",
  "genre": ["Indie", "Industrial Static", "Moody Pop", "Rock"],
  "foundingLocation": {
    "@type": "Place",
    "name": "American South"
  },
  "sameAs": [
    "https://open.spotify.com/album/0BB8BawGzPa6yNdyf9vGBb",
    "https://www.youtube.com/@presentlyreading"
  ],
  "album": {
    "@type": "MusicAlbum",
    "name": "Presently Reading",
    "url": "https://open.spotify.com/album/0BB8BawGzPa6yNdyf9vGBb",
    "numTracks": 13,
    "datePublished": "2026"
  }
};

/** Default meta per route path */
const ROUTE_META: Record<string, PageSeoConfig> = {
  '/': {
    title: 'Presently Reading | Indie · Industrial Static · Moody Pop · Rock',
    description:
      'Presently Reading — an AI-crafted indie, industrial static, moody pop, and rock band born from the red clay roads and honeysuckle summers of the American South.',
    url: BASE_URL,
    type: 'website',
    jsonLd: DEFAULT_JSON_LD,
  },
  '/music': {
    title: 'Music | Presently Reading',
    description:
      'Stream the self-titled debut album by Presently Reading on Spotify. 13 books steeped in industrial static, atmospheric pop, and moody electronic soul.',
    url: `${BASE_URL}/music`,
    type: 'music.album',
    jsonLd: DEFAULT_JSON_LD,
  },
  '/about': {
    title: 'Our Story | Presently Reading',
    description:
      'Learn the story behind Presently Reading — an AI-crafted musical project born from red clay roads, honeysuckle summers, and the soul of the American South.',
    url: `${BASE_URL}/about`,
    type: 'website',
    jsonLd: DEFAULT_JSON_LD,
  },
  '/contact': {
    title: 'Connect | Presently Reading',
    description:
      'Reach out to Presently Reading for bookings, collaborations, press inquiries, or just to say hello. We love hearing from fans.',
    url: `${BASE_URL}/contact`,
    type: 'website',
    jsonLd: DEFAULT_JSON_LD,
  },
};

@Injectable({ providedIn: 'root' })
export class SeoService {

  constructor(
    private titleSvc: Title,
    private meta: Meta,
    private router: Router,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  /** Call once from AppComponent.ngOnInit to auto-set meta on every navigation */
  init(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        const path   = e.urlAfterRedirects.split('?')[0];
        const config = ROUTE_META[path];
        if (config) this.set(config);
      });
  }

  /** Manually set meta for a specific page (e.g. quotes/:id with book title) */
  set(cfg: PageSeoConfig): void {
    const title = cfg.title;
    const desc  = cfg.description;
    const url   = cfg.url  ?? BASE_URL;
    const img   = cfg.image ?? DEFAULT_IMG;
    const type  = cfg.type  ?? 'website';

    if (cfg.jsonLd) {
      this.setJsonLd(cfg.jsonLd);
    }

    // ── Basic ─────────────────────────────────────────────────────────────
    this.titleSvc.setTitle(title);
    this.upsert('description',        desc);
    this.upsert('robots',             'index, follow');
    this.upsert('author',             'Presently Reading');

    // ── Open Graph (Facebook, LinkedIn, WhatsApp, iMessage) ───────────────
    this.upsertProp('og:site_name',   SITE_NAME);
    this.upsertProp('og:type',        type);
    this.upsertProp('og:title',       title);
    this.upsertProp('og:description', desc);
    this.upsertProp('og:url',         url);
    this.upsertProp('og:image',       img);
    this.upsertProp('og:image:width',  '1200');
    this.upsertProp('og:image:height', '630');
    this.upsertProp('og:locale',      'en_US');

    // ── Twitter / X Card ──────────────────────────────────────────────────
    this.upsert('twitter:card',        'summary_large_image');
    this.upsert('twitter:site',        '@presentlyreading');
    this.upsert('twitter:title',       title);
    this.upsert('twitter:description', desc);
    this.upsert('twitter:image',       img);

    // ── Canonical ─────────────────────────────────────────────────────────
    this.setCanonical(url);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private upsert(name: string, content: string): void {
    if (this.meta.getTag(`name='${name}'`)) {
      this.meta.updateTag({ name, content });
    } else {
      this.meta.addTag({ name, content });
    }
  }

  private upsertProp(property: string, content: string): void {
    if (this.meta.getTag(`property='${property}'`)) {
      this.meta.updateTag({ property, content });
    } else {
      this.meta.addTag({ property, content });
    }
  }

  private setCanonical(url: string): void {
    const doc  = this.doc;
    let   link = doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  setJsonLd(schema: any): void {
    const doc = this.doc;
    let script = doc.querySelector<HTMLScriptElement>('#seo-jsonld');
    if (!script) {
      script = doc.createElement('script');
      script.id = 'seo-jsonld';
      script.type = 'application/ld+json';
      doc.head.appendChild(script);
    }
    script.text = JSON.stringify(schema);
  }
}
