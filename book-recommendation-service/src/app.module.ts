import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RecommendationModule } from './recommendation/recommendation.module';
import { OpenaiModule } from './openai/openai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RecommendationModule,
    OpenaiModule,
  ],
})
export class AppModule {}
