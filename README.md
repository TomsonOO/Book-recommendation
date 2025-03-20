# Book Recommendation Application

Web app that provides book titles based on the provided data

## Tech Stack

### Frontend
- React (TypeScript)

### Backend
- Node.js with NestJS framework
- Dockerized microservices architecture

### Services
1. **API Gateway** - Routes requests to appropriate services
2. **Book Recommendation Service** - Generates personalized book recommendations using OpenAI
3. **Web Scraper Service** - Retrieves book reviews from various online sources

## Architecture

The application follows a microservices architecture:
- Frontend communicates with the Gateway service
- Gateway routes requests to the appropriate backend service
- Services operate independently and communicate via HTTP 