export const env = {
  port: process.env.PORT || 4000,
  recommendationServiceUrl: process.env.RECOMMENDATION_SERVICE_URL || 'http://book-recommendation-service:3000',
  scraperServiceUrl: process.env.SCRAPER_SERVICE_URL || 'http://web-scraper-service:5000',
}; 