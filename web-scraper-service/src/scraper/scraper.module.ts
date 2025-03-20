import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { ReviewsRepository } from '../storage/reviews.repository';

@Module({
  imports: [HttpModule],
  controllers: [ScraperController],
  providers: [ScraperService, ReviewsRepository],
  exports: [ScraperService],
})
export class ScraperModule {} 