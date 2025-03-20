import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { RecommendationGatewayService } from '../services/recommendationGateway.service';
import { ScraperGatewayService } from '../services/scraperGateway.service';
import { Logger } from '@nestjs/common';

interface BookRecommendationRequest {
  genres?: string[];
  authors?: string[];
  language?: string;
  preferences?: string;
  readBooks?: string[];
}

@Controller('recommendations')
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(
    private readonly recommendationService: RecommendationGatewayService,
    private readonly scraperService: ScraperGatewayService,
  ) {}

  @Post()
  async getRecommendations(@Body() request: BookRecommendationRequest) {
    const recommendations = await this.recommendationService.getRecommendations(request);
    return recommendations;
  }
  
  @Get('search')
  async searchBooks(@Query('query') query: string) {
    return this.recommendationService.searchBooks(query);
  }
  
  @Get('reviews/:title')
  async getReviewsForTitle(@Param('title') title: string) {
    try {
      if (!title) {
        return { reviews: [] };
      }
      
      const decodedTitle = decodeURIComponent(title);
      const reviews = await this.scraperService.getReviews([decodedTitle]);
      
      if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
        return { reviews: [] };
      }
      
      return { reviews: reviews[0]?.reviews || [] };
    } catch (error) {
      this.logger.error(`Error getting reviews for title ${title}: ${error.message}`);
      return { reviews: [] };
    }
  }
  
  @Get(':id/reviews')
  async getBookReviews(@Param('id') id: string) {
    try {
      const book = await this.recommendationService.getBookDetails(id);
      
      if (!book || !book.title) {
        return { reviews: [] };
      }
      
      const reviews = await this.scraperService.getReviews([book.title]);
      
      if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
        return { reviews: [] };
      }
      
      return { reviews: reviews[0]?.reviews || [] };
    } catch (error) {
      this.logger.error(`Error getting reviews for book ${id}: ${error.message}`);
      return { reviews: [] };
    }
  }
  
  @Get(':id')
  async getBookDetails(@Param('id') id: string) {
    const book = await this.recommendationService.getBookDetails(id);
    return book;
  }
} 