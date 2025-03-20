import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookRecommendation, BookRecommendationRequest, getRecommendations } from '../services/apiClient';
import BookCard from '../components/BookCard';

const RecommendationsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const request = location.state?.request as BookRecommendationRequest;
      
      if (!request) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        
        const response = await getRecommendations(request);
        console.log('Response in RecommendationsPage:', response);
        
        if (response && response.recommendations) {
          setBooks(Array.isArray(response.recommendations) ? response.recommendations : []);
        } else {
          setBooks([]);
        }
      } catch (err) {
        console.error('Error in RecommendationsPage:', err);
        setError('Failed to fetch recommendations. Please try again.');
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [location.state, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/')} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <header className="header">
        <h1>Your Book Recommendations</h1>
        <button onClick={() => navigate('/')} className="new-search-button">
          Start New Search
        </button>
      </header>

      {!Array.isArray(books) || books.length === 0 ? (
        <div className="no-results">
          <p>No recommendations found. Try adjusting your preferences.</p>
          <button onClick={() => navigate('/')} className="adjust-preferences-button">
            Adjust Preferences
          </button>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book, index) => (
            <BookCard key={book.id || book.title || index} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage; 