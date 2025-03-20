import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { BookReview } from '../storage/reviews.repository';

@Controller('reviews')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get()
  async getAllReviews(): Promise<BookReview[]> {
    return this.scraperService.getReviewsByTitles([]);
  }
  
  @Get('author/:author')
  async getReviewsByAuthor(@Param('author') author: string): Promise<BookReview[]> {
    return this.scraperService.getReviewsByAuthor(decodeURIComponent(author));
  }

  @Get(':title')
  async getReviewsByTitle(@Param('title') title: string): Promise<BookReview | null> {
    return this.scraperService.getReviewsByTitle(decodeURIComponent(title));
  }

  @Post()
  async getReviewsByTitles(@Body() request: any): Promise<BookReview[]> {
    let titles = [];  
    
    if (request && request.titles) {
      titles = Array.isArray(request.titles) ? request.titles : [request.titles];
    }
    
    return this.scraperService.getReviewsByTitles(titles);
  }

  @Post('scrape')
  async triggerScrape(@Body() request: any): Promise<BookReview[]> {
    let titles = [];
    
    if (request && request.titles) {
      titles = Array.isArray(request.titles) ? request.titles : [request.titles];
    }
    
    return this.scraperService.scrapeNow(titles);
  }
} 