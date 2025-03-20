import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' ? '/api' : (process.env.REACT_APP_API_URL || 'http://localhost:4000');

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface BookRecommendationRequest {
  genres?: string[];
  authors?: string[];
  language?: string;
  preferences?: string;
  readBooks?: string[];
}

export interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  description: string;
  genres: string[];
  coverImage?: string;
  publishedYear?: number;
  pageCount?: number;
}

export interface ReviewItem {
  source: string;
  rating: number;
  text: string;
  author?: string;
  date?: string;
}

export const getRecommendations = async (request: BookRecommendationRequest) => {
  try {
    console.log('Sending request to API:', request);
    const response = await apiClient.post('/recommendations', request);
    console.log('Raw API response:', response.data);
    
    if (!response.data) {
      return { recommendations: [] };
    }

    if (response.data.recommendations && Array.isArray(response.data.recommendations)) {
      return { 
        recommendations: response.data.recommendations.map((book: any) => ({
          id: book.id || `book-${Math.random().toString(36).substr(2, 9)}`,
          title: book.title || 'Untitled',
          author: book.author || 'Unknown Author',
          description: book.description || 'No description available',
          genres: Array.isArray(book.genres) ? book.genres : [],
          ...book
        }))
      };
    }

    if (Array.isArray(response.data)) {
      return { 
        recommendations: response.data.map((book: any) => ({
          id: book.id || `book-${Math.random().toString(36).substr(2, 9)}`,
          title: book.title || 'Untitled',
          author: book.author || 'Unknown Author',
          description: book.description || 'No description available',
          genres: Array.isArray(book.genres) ? book.genres : [],
          ...book
        }))
      };
    }

    return { 
      recommendations: [{ 
        id: `book-${Math.random().toString(36).substr(2, 9)}`, 
        title: 'Sample Book',
        author: 'Sample Author',
        description: 'This is a sample book because no valid recommendations were found.',
        genres: ['Fiction']
      }]
    };
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    return { recommendations: [] };
  }
};

export const getReviewsForBook = async (title: string) => {
  try {
    const encodedTitle = encodeURIComponent(title);
    const response = await apiClient.get(`/recommendations/reviews/${encodedTitle}`);
    return response.data && response.data.reviews 
      ? response.data 
      : { reviews: [] };
  } catch (error) {
    console.error(`Error fetching reviews for "${title}":`, error);
    return { reviews: [] };
  }
};

export const getBookDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`/recommendations/${id}`);
    return response.data || { id, title: 'Unknown Book', author: 'Unknown Author', description: 'No details available', genres: [] };
  } catch (error) {
    console.error(`Error fetching book details for ID ${id}:`, error);
    return { id, title: 'Unknown Book', author: 'Unknown Author', description: 'Error fetching details', genres: [] };
  }
};

export const searchBooks = async (query: string) => {
  try {
    const response = await apiClient.get(`/recommendations/search?query=${encodeURIComponent(query)}`);
    return response.data || { results: [] };
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    return { results: [] };
  }
};

export default apiClient; 