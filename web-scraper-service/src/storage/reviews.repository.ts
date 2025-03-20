import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface BookReview {
  title: string;
  reviews: Review[];
  lastUpdated: Date;
}

export interface Review {
  source: string;
  rating: number;
  text: string;
  author?: string;
  date?: Date;
}

@Injectable()
export class ReviewsRepository {
  private readonly storageDir = path.join(process.cwd(), 'data');
  private readonly storageFile = path.join(this.storageDir, 'reviews.json');
  private reviews: Map<string, BookReview> = new Map();

  constructor() {
    this.ensureStorageDirExists();
    this.loadReviews();
  }

  private ensureStorageDirExists() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
    if (!fs.existsSync(this.storageFile)) {
      fs.writeFileSync(this.storageFile, JSON.stringify({}), 'utf8');
    }
  }

  private loadReviews() {
    try {
      const data = fs.readFileSync(this.storageFile, 'utf8');
      const reviewsObject = JSON.parse(data);
      
      Object.entries(reviewsObject).forEach(([title, review]) => {
        this.reviews.set(title.toLowerCase(), review as BookReview);
      });
    } catch (error) {
      this.reviews = new Map();
    }
  }

  private persistReviews() {
    const reviewsObject = {};
    this.reviews.forEach((review, title) => {
      reviewsObject[title] = review;
    });
    
    fs.writeFileSync(this.storageFile, JSON.stringify(reviewsObject, null, 2), 'utf8');
  }

  async getReviewsByTitle(title: string): Promise<BookReview | null> {
    return this.reviews.get(title.toLowerCase()) || null;
  }

  async getReviewsByTitles(titles: string[]): Promise<BookReview[]> {
    return titles
      .map(title => this.reviews.get(title.toLowerCase()))
      .filter(review => review !== undefined) as BookReview[];
  }

  async getReviewsByAuthor(author: string): Promise<BookReview[]> {
    const result: BookReview[] = [];
    this.reviews.forEach(review => {
      const hasAuthorReview = review.reviews.some(
        r => r.author && r.author.toLowerCase().includes(author.toLowerCase())
      );
      if (hasAuthorReview) {
        result.push(review);
      }
    });
    return result;
  }

  async getAllReviews(): Promise<BookReview[]> {
    return Array.from(this.reviews.values());
  }

  async saveReview(bookReview: BookReview): Promise<void> {
    this.reviews.set(bookReview.title.toLowerCase(), {
      ...bookReview,
      lastUpdated: new Date()
    });
    this.persistReviews();
  }

  async saveBulkReviews(bookReviews: BookReview[]): Promise<void> {
    for (const review of bookReviews) {
      await this.saveReview(review);
    }
  }

  async deleteReview(title: string): Promise<boolean> {
    const result = this.reviews.delete(title.toLowerCase());
    if (result) {
      this.persistReviews();
    }
    return result;
  }

  async needsUpdate(title: string, maxAgeDays = 7): Promise<boolean> {
    const review = this.reviews.get(title.toLowerCase());
    if (!review) return true;
    
    const lastUpdated = new Date(review.lastUpdated);
    const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceUpdate > maxAgeDays;
  }
} 