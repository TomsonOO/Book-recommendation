import React, { useState } from 'react';
import { BookRecommendation, ReviewItem, getReviewsForBook } from '../../services/apiClient';

interface BookCardProps {
  book: BookRecommendation;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  if (!book || typeof book !== 'object') {
    return null;
  }

  const safeBook = {
    id: book.id || `book-${Math.random().toString(36).substr(2, 9)}`,
    title: book.title || 'Untitled Book',
    author: book.author || 'Unknown Author',
    description: book.description || 'No description available',
    genres: Array.isArray(book.genres) ? book.genres : [],
    coverImage: book.coverImage,
    publishedYear: book.publishedYear,
    pageCount: book.pageCount
  };

  const handleGetReviews = async () => {
    if (!showReviews && safeBook.title) {
      setLoading(true);
      try {
        const response = await getReviewsForBook(safeBook.title);
        setReviews(Array.isArray(response.reviews) ? response.reviews : []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    setShowReviews(!showReviews);
  };

  const placeholderImageUrl = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22150%22%20height%3D%22200%22%20viewBox%3D%220%200%20150%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_text%7Bfill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20Arial%2C%20sans-serif%3Bfont-size%3A12px%7D%20%23holder_rect%7Bfill%3A%23EFEFEF%3B%7D%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%3E%3Crect%20width%3D%22150%22%20height%3D%22200%22%20id%3D%22holder_rect%22%2F%3E%3Cg%3E%3Ctext%20x%3D%2250%22%20y%3D%22100%22%20id%3D%22holder_text%22%3ENo%20Cover%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

  const stripScriptContent = (text: string): string => {
    if (!text) return '';
    
    // Remove JavaScript/function content
    const cleanText = text.replace(/\(function\(\)\s*\{[\s\S]*?\}\)\(\);?/g, '')
      // Remove CSS-like content
      .replace(/\.[a-zA-Z-]+:[a-zA-Z-]+\s*\{[\s\S]*?\}/g, '')
      // Clean up any extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
      
    return cleanText || 'No text available';
  };

  return (
    <div className="book-card">
      <div className="book-card-content">
        <div className="book-card-image">
          <div style={{
            width: '150px',
            height: '200px',
            backgroundColor: '#efefef',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#999',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center'
          }}>
            {safeBook.title || 'No Cover'}
          </div>
        </div>
        <div className="book-card-info">
          <h3 className="book-title">{safeBook.title}</h3>
          <p className="book-author">by {safeBook.author}</p>
          {safeBook.publishedYear && <p className="book-year">Published: {safeBook.publishedYear}</p>}
          {safeBook.pageCount && <p className="book-pages">Pages: {safeBook.pageCount}</p>}
          <div className="book-genres">
            {safeBook.genres.length > 0 ? (
              safeBook.genres.map((genre, index) => (
                <span key={index} className="genre-tag">{genre}</span>
              ))
            ) : (
              <span className="genre-tag">General</span>
            )}
          </div>
          <p className="book-description">{safeBook.description}</p>
          <button 
            className="reviews-button" 
            onClick={handleGetReviews}
            disabled={loading}
          >
            {loading ? 'Loading...' : showReviews ? 'Hide Reviews' : 'Show Reviews'}
          </button>
        </div>
      </div>
      {showReviews && (
        <div className="book-reviews">
          <h4>Reviews</h4>
          {reviews.length === 0 ? (
            <p>No reviews available for this book.</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review, index) => {
                const safeReview = {
                  source: review?.source || 'Unknown Source',
                  rating: review?.rating || 'N/A',
                  text: review?.text ? stripScriptContent(review.text) : 'No text available',
                  author: review?.author,
                  date: review?.date
                };
                
                return (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <span className="review-source">{safeReview.source}</span>
                      <span className="review-rating">Rating: {safeReview.rating}/5</span>
                      {safeReview.author && <span className="review-author">by {safeReview.author}</span>}
                    </div>
                    <p className="review-text">{safeReview.text}</p>
                    {safeReview.date && (
                      <p className="review-date">
                        Date: {new Date(safeReview.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookCard; 