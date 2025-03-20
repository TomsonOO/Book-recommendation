import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(OpenaiService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.error('OpenAI API key is missing in environment variables');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async getRecommendations(prompt: string): Promise<string> {
    try {
      this.logger.log(`Sending request to OpenAI with prompt: ${prompt.substring(0, 50)}...`);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a book recommendation assistant. Provide detailed book recommendations with title, author, description, and reason for recommendation. Format your response as JSON array of book objects.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      this.logger.log('Response received from OpenAI');
      
      if (!response.choices || !response.choices.length) {
        this.logger.error('No choices returned in the OpenAI response');
        throw new Error('Invalid response from OpenAI API');
      }
      
      const content = response.choices[0].message.content;
      
      if (!content) {
        this.logger.error('Empty content in the OpenAI response');
        throw new Error('Empty response from OpenAI API');
      }
      
      return content;
    } catch (error) {
      this.logger.error(`Error calling OpenAI API: ${error.message}`);
      throw new Error(`Failed to get recommendations from AI: ${error.message}`);
    }
  }
}  