import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RecommendationModule } from './modules/recommendation.module';
import { ScraperModule } from './modules/scraper.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RecommendationModule,
    ScraperModule,
  ],
})
export class AppModule {} 