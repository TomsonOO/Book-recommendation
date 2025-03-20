import { Injectable } from '@nestjs/common';
import { OpenaiService } from '../openai/openai.service';
import { 
  RecommendationRequestDto, 
  RecommendationResponseDto, 
  BookRecommendation 
} from './recommendation.dto';

@Injectable()
export class RecommendationService {
  constructor(private readonly openaiService: OpenaiService) {}

  async getBookRecommendations(
    request: RecommendationRequestDto,
  ): Promise<RecommendationResponseDto> {
    const prompt = this.buildPrompt(request);
    const aiResponse = await this.openaiService.getRecommendations(prompt);
    const recommendations = this.parseResponse(aiResponse);
    
    return { recommendations };
  }

  private buildPrompt(request: RecommendationRequestDto): string {
    let prompt = 'Please recommend books based on the following criteria:\n';
    
    if (request.genres?.length) {
      prompt += `Genres: ${request.genres.join(', ')}\n`;
    }
    
    if (request.authors?.length) {
      prompt += `Similar to authors: ${request.authors.join(', ')}\n`;
    }
    
    if (request.language) {
      prompt += `Language: ${request.language}\n`;
    }
    
    if (request.preferences) {
      prompt += `Additional preferences: ${request.preferences}\n`;
    }
    
    if (request.readBooks?.length) {
      prompt += `Already read: ${request.readBooks.join(', ')}\n`;
    }
    
    prompt += 'Please provide 5 book recommendations. For each book include: title, author, short description, and reason for recommendation. Format the response as JSON.';
    
    return prompt;
  }

  private parseResponse(aiResponse: string): BookRecommendation[] {
    try {
      const parsed = JSON.parse(aiResponse);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
        return parsed.recommendations;
      }
      if (parsed.books && Array.isArray(parsed.books)) {
        return parsed.books;
      }
      
      return this.fallbackParsing(aiResponse);
    } catch (e) {
      return this.fallbackParsing(aiResponse);
    }
  }

  private fallbackParsing(aiResponse: string): BookRecommendation[] {
    const recommendations: BookRecommendation[] = [];
    
    const bookSections = aiResponse.split(/\d+\.\s+/);
    
    for (const section of bookSections) {
      if (!section.trim()) continue;
      
      const titleMatch = section.match(/Title:\s*(.*?)(?:\n|$)/i);
      const authorMatch = section.match(/Author:\s*(.*?)(?:\n|$)/i);
      const descMatch = section.match(/Description:\s*(.*?)(?:\n|$)/i) || 
                        section.match(/Summary:\s*(.*?)(?:\n|$)/i);
      const reasonMatch = section.match(/Reason:\s*(.*?)(?:\n|$)/i) || 
                          section.match(/Why:\s*(.*?)(?:\n|$)/i);
      
      if (titleMatch) {
        recommendations.push({
          title: titleMatch[1].trim(),
          author: authorMatch ? authorMatch[1].trim() : 'Unknown',
          description: descMatch ? descMatch[1].trim() : '',
          reasonToRecommend: reasonMatch ? reasonMatch[1].trim() : '',
        });
      }
    }
    
    return recommendations;
  }
} 