import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RecommendationController } from '../controllers/recommendation.controller';
import { RecommendationGatewayService } from '../services/recommendationGateway.service';
import { ScraperGatewayService } from '../services/scraperGateway.service';

@Module({
  imports: [HttpModule],
  controllers: [RecommendationController],
  providers: [RecommendationGatewayService, ScraperGatewayService],
  exports: [RecommendationGatewayService],
})
export class RecommendationModule {} 