import { IsString, IsArray, IsOptional } from 'class-validator';

export class RecommendationRequestDto {
  @IsArray()
  @IsOptional()
  genres?: string[];

  @IsArray()
  @IsOptional()
  authors?: string[];

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  preferences?: string;
  
  @IsArray()
  @IsOptional()
  readBooks?: string[];
}

export class BookRecommendation {
  title: string;
  author: string;
  description: string;
  reasonToRecommend: string;
}

export class RecommendationResponseDto {
  recommendations: BookRecommendation[];
} 