import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScraperGatewayService } from '../services/scraperGateway.service';

@Module({
  imports: [HttpModule],
  providers: [ScraperGatewayService],
  exports: [ScraperGatewayService],
})
export class ScraperModule {} 