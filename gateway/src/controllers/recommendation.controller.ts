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

  private sanitizeReviewText(text: string): string {
    if (!text) return '';
    
    // Remove JavaScript/function content
    const cleanText = text.replace(/\(function\(\)\s*\{[\s\S]*?\}\)\(\);?/g, '')
      // Remove CSS-like content
      .replace(/\.[a-zA-Z-]+:[a-zA-Z-]+\s*\{[\s\S]*?\}/g, '')
      // Clean up any extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
      
    return cleanText || 'No text available';
  }

  @Post()
  async getRecommendations(@Body() request: BookRecommendationRequest) {
    try {
      this.logger.log(`Received recommendation request: ${JSON.stringify(request)}`);
      const recommendations = await this.recommendationService.getRecommendations(request);
      this.logger.log(`Got response from recommendation service`);
      
      if (!recommendations) {
        this.logger.warn('Received null/undefined response from recommendation service');
        return { recommendations: [] };
      }
      
      if (typeof recommendations !== 'object') {
        this.logger.warn(`Unexpected response type: ${typeof recommendations}`);
        return { recommendations: [] };
      }
      
      let result = { recommendations: [] };
      
      if (recommendations.recommendations && Array.isArray(recommendations.recommendations)) {
        result.recommendations = recommendations.recommendations.map(book => ({
          id: book.id || `book-${Math.random().toString(36).substr(2, 9)}`,
          title: book.title || 'Untitled Book',
          author: book.author || 'Unknown Author',
          description: book.description || 'No description available',
          genres: Array.isArray(book.genres) ? book.genres : [],
          ...book
        }));
      } else if (Array.isArray(recommendations)) {
        result.recommendations = recommendations.map(book => ({
          id: book.id || `book-${Math.random().toString(36).substr(2, 9)}`,
          title: book.title || 'Untitled Book',
          author: book.author || 'Unknown Author',
          description: book.description || 'No description available',
          genres: Array.isArray(book.genres) ? book.genres : [],
          ...book
        }));
      } else {
        result.recommendations = [
          {
            id: `book-${Math.random().toString(36).substr(2, 9)}`,
            title: recommendations.title || 'Untitled Book',
            author: recommendations.author || 'Unknown Author',
            description: recommendations.description || 'No description available',
            genres: Array.isArray(recommendations.genres) ? recommendations.genres : [],
            ...recommendations
          }
        ];
      }
      
      this.logger.log(`Returning ${result.recommendations.length} recommendations`);
      return result;
    } catch (error) {
      this.logger.error(`Error in getRecommendations: ${error.message}`);
      return { recommendations: [] };
    }
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
      
      // Sanitize review text
      const sanitizedReviews = reviews[0]?.reviews.map(review => ({
        ...review,
        text: this.sanitizeReviewText(review.text)
      })) || [];
      
      return { reviews: sanitizedReviews };
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
      
      // Sanitize review text
      const sanitizedReviews = reviews[0]?.reviews.map(review => ({
        ...review,
        text: this.sanitizeReviewText(review.text)
      })) || [];
      
      return { reviews: sanitizedReviews };
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

  @Get('health')
  async healthCheck() {
    return { 
      status: 'ok', 
      message: 'Gateway API is running', 
      timestamp: new Date().toISOString() 
    };
  }
} 