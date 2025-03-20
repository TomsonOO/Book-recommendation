import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { env } from '../config/env';

@Injectable()
export class RecommendationGatewayService {
  private readonly logger = new Logger(RecommendationGatewayService.name);

  constructor(private readonly httpService: HttpService) {}

  async getRecommendations(request: any) {
    try {
      const response = await lastValueFrom<AxiosResponse>(
        this.httpService.post(`${env.recommendationServiceUrl}/recommendations`, request)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error calling recommendation service: ${error.message}`);
      throw new Error('Failed to get book recommendations');
    }
  }

  async searchBooks(query: string) {
    try {
      const response = await lastValueFrom<AxiosResponse>(
        this.httpService.get(`${env.recommendationServiceUrl}/recommendations/search?query=${encodeURIComponent(query)}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error searching books: ${error.message}`);
      throw new Error('Failed to search for books');
    }
  }

  async getBookDetails(id: string) {
    try {
      const response = await lastValueFrom<AxiosResponse>(
        this.httpService.get(`${env.recommendationServiceUrl}/recommendations/${id}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error getting book details: ${error.message}`);
      throw new Error('Failed to get book details');
    }
  }
} 