import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { load } from 'cheerio';
import { ReviewsRepository, BookReview, Review } from '../storage/reviews.repository';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private isScrapingInProgress = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly reviewsRepository: ReviewsRepository,
  ) {}

  @Cron('0 0 */12 * * *')
  async scheduledScraping() {
    if (this.isScrapingInProgress) {
      this.logger.log('Scraping is already in progress, skipping scheduled run');
      return;
    }
    
    const allReviews = await this.reviewsRepository.getAllReviews();
    const titlesToUpdate = [];
    
    for (const review of allReviews) {
      if (await this.reviewsRepository.needsUpdate(review.title)) {
        titlesToUpdate.push(review.title);
      }
    }
    
    if (titlesToUpdate.length > 0) {
      this.logger.log(`Scheduled scraping for ${titlesToUpdate.length} books`);
      await this.scrapeMultipleBooks(titlesToUpdate);
    } else {
      this.logger.log('No books need updating');
    }
  }

  async getReviewsByTitle(title: string): Promise<BookReview | null> {
    if (!title) {
      return null;
    }

    const review = await this.reviewsRepository.getReviewsByTitle(title);
    
    if (!review || await this.reviewsRepository.needsUpdate(title)) {
      const reviews = await this.scrapeReviews(title);
      if (reviews.length > 0) {
        const bookReview: BookReview = {
          title,
          reviews,
          lastUpdated: new Date(),
        };
        await this.reviewsRepository.saveReview(bookReview);
        return bookReview;
      }
    }
    
    return review;
  }

  private async scrapeReviews(title: string): Promise<Review[]> {
    const [goodreadsReviews, amazonReviews] = await Promise.all([
      this.scrapeGoodreadsReviews(title),
      this.scrapeAmazonReviews(title)
    ]);
    
    return [...goodreadsReviews, ...amazonReviews];
  }

  async getReviewsByTitles(titles: string[]): Promise<BookReview[]> {
    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return [];
    }
    
    const results: BookReview[] = [];
    
    for (const title of titles) {
      if (!title || typeof title !== 'string') continue;
      
      const review = await this.getReviewsByTitle(title);
      if (review) {
        results.push(review);
      }
    }
    
    return results;
  }
  
  async getReviewsByAuthor(author: string): Promise<BookReview[]> {
    return this.reviewsRepository.getReviewsByAuthor(author);
  }

  async scrapeNow(titles: string[]): Promise<BookReview[]> {
    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return [];
    }
    
    return this.scrapeMultipleBooks(titles);
  }

  private async scrapeMultipleBooks(titles: string[]): Promise<BookReview[]> {
    this.isScrapingInProgress = true;
    const results: BookReview[] = [];
    
    try {
      for (const title of titles) {
        try {
          const review = await this.scrapeBookReviews(title);
          if (review) {
            results.push(review);
          }
        } catch (error) {
          this.logger.error(`Error scraping ${title}: ${error.message}`);
        }
      }
    } finally {
      this.isScrapingInProgress = false;
    }
    
    return results;
  }

  private async scrapeBookReviews(title: string): Promise<BookReview | null> {
    this.logger.log(`Scraping reviews for: ${title}`);
    
    try {
      const goodreadsReviews = await this.scrapeGoodreadsReviews(title);
      const amazonReviews = await this.scrapeAmazonReviews(title);
      
      const bookReview: BookReview = {
        title,
        reviews: [...goodreadsReviews, ...amazonReviews],
        lastUpdated: new Date(),
      };
      
      if (bookReview.reviews.length === 0) {
        this.logger.warn(`No reviews found for: ${title}`);
        return null;
      }
      
      await this.reviewsRepository.saveReview(bookReview);
      this.logger.log(`Saved ${bookReview.reviews.length} reviews for: ${title}`);
      
      return bookReview;
    } catch (error) {
      this.logger.error(`Error scraping reviews for ${title}: ${error.message}`);
      return null;
    }
  }

  private async scrapeGoodreadsReviews(title: string): Promise<Review[]> {
    try {
      const searchUrl = `https://www.goodreads.com/search?q=${encodeURIComponent(title)}`;
      const searchResponse = await lastValueFrom<AxiosResponse>(this.httpService.get(searchUrl));
      
      if (!searchResponse?.data) {
        return [];
      }
      
      const $ = load(searchResponse.data.toString());
      
      const bookUrl = $('.bookTitle').first().attr('href');
      if (!bookUrl) {
        return [];
      }
      
      const fullBookUrl = `https://www.goodreads.com${bookUrl}`;
      const bookResponse = await lastValueFrom<AxiosResponse>(this.httpService.get(fullBookUrl));
      
      if (!bookResponse?.data) {
        return [];
      }
      
      const $book = load(bookResponse.data.toString());
      
      const reviews: Review[] = [];
      
      $book('.reviewText').each((i, elem) => {
        if (i >= 5) return;
        
        const text = $book(elem).text().trim();
        const ratingElem = $book(elem).closest('.review').find('.staticStars');
        const rating = this.parseRating(ratingElem.text().trim());
        const author = $book(elem).closest('.review').find('.userReview').text().trim();
        const dateText = $book(elem).closest('.review').find('.reviewDate').text().trim();
        
        reviews.push({
          source: 'Goodreads',
          rating,
          text: text.substring(0, 500),
          author,
          date: dateText ? new Date(dateText) : undefined,
        });
      });
      
      return reviews;
    } catch (error) {
      this.logger.error(`Error scraping Goodreads: ${error.message}`);
      return [];
    }
  }

  private async scrapeAmazonReviews(title: string): Promise<Review[]> {
    try {
      const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(title)}+book`;
      const searchResponse = await lastValueFrom<AxiosResponse>(this.httpService.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      }));
      
      if (!searchResponse?.data) {
        return [];
      }
      
      const $ = load(searchResponse.data.toString());
      
      const bookUrl = $('.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal').first().attr('href');
      if (!bookUrl) {
        return [];
      }
      
      const fullBookUrl = `https://www.amazon.com${bookUrl}`;
      const bookResponse = await lastValueFrom<AxiosResponse>(this.httpService.get(fullBookUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      }));
      
      if (!bookResponse?.data) {
        return [];
      }
      
      const $book = load(bookResponse.data.toString());
      
      const reviews: Review[] = [];
      
      $book('.review').each((i, elem) => {
        if (i >= 5) return;
        
        const text = $book(elem).find('.review-text').text().trim();
        const ratingText = $book(elem).find('.a-icon-alt').text().trim();
        const rating = this.parseRating(ratingText);
        const author = $book(elem).find('.a-profile-name').text().trim();
        const dateText = $book(elem).find('.review-date').text().trim();
        
        reviews.push({
          source: 'Amazon',
          rating,
          text: text.substring(0, 500),
          author,
          date: dateText ? new Date(dateText) : undefined,
        });
      });
      
      return reviews;
    } catch (error) {
      this.logger.error(`Error scraping Amazon: ${error.message}`);
      return [];
    }
  }

  private parseRating(ratingText: string): number {
    if (!ratingText) return 0;
    
    const starsMatch = ratingText.match(/(\d+(\.\d+)?)/);
    if (starsMatch) {
      return parseFloat(starsMatch[1]);
    }
    
    const starsCount = (ratingText.match(/★/g) || []).length;
    if (starsCount > 0) {
      return starsCount;
    }
    
    return 0;
  }
} 