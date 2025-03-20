import { Controller, Post, Body } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationRequestDto, RecommendationResponseDto } from './recommendation.dto';

@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post()
  async getRecommendations(
    @Body() requestDto: RecommendationRequestDto,
  ): Promise<RecommendationResponseDto> {
    return this.recommendationService.getBookRecommendations(requestDto);
  }
} 