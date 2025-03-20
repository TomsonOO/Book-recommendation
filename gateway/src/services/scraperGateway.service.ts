import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { env } from '../config/env';

@Injectable()
export class ScraperGatewayService {
  private readonly logger = new Logger(ScraperGatewayService.name);

  constructor(private readonly httpService: HttpService) {}

  async getReviews(bookTitles: string[]) {
    try {
      const titlesToFetch = Array.isArray(bookTitles) ? bookTitles.filter(Boolean) : [];
      
      const response = await lastValueFrom<AxiosResponse>(
        this.httpService.post(`${env.scraperServiceUrl}/reviews`, { titles: titlesToFetch })
      );
      return response.data || [];
    } catch (error) {
      this.logger.error(`Error calling scraper service: ${error.message}`);
      return [];
    }
  }

  async getReviewsByAuthor(author: string) {
    try {
      const response = await lastValueFrom<AxiosResponse>(
        this.httpService.get(`${env.scraperServiceUrl}/reviews/author/${encodeURIComponent(author)}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error getting reviews by author: ${error.message}`);
      throw new Error('Failed to get reviews by author');
    }
  }
} 