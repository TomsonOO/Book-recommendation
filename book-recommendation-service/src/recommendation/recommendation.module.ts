import { Module } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { OpenaiModule } from './../openai/openai.module';

@Module({
  imports: [OpenaiModule],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {} 