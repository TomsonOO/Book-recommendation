import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookRecommendationRequest } from '../services/apiClient';

const genreOptions = [
  'Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Romance', 
  'Historical Fiction', 'Non-fiction', 'Biography', 'Self-help',
  'Horror', 'Adventure', 'Classics', 'Young Adult', 'Children'
];

const languageOptions = [
  'English', 'Spanish', 'French', 'German', 'Italian',
  'Russian', 'Chinese', 'Japanese', 'Korean'
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<BookRecommendationRequest>({
    genres: [],
    authors: [],
    language: 'English',
    preferences: '',
    readBooks: []
  });
  
  const [authorInput, setAuthorInput] = useState('');
  const [bookInput, setBookInput] = useState('');
  
  const handleGenreChange = (genre: string) => {
    setForm(prev => ({
      ...prev,
      genres: prev.genres?.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...(prev.genres || []), genre]
    }));
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({
      ...prev,
      language: e.target.value
    }));
  };
  
  const handlePreferencesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm(prev => ({
      ...prev,
      preferences: e.target.value
    }));
  };
  
  const handleAddAuthor = () => {
    if (authorInput.trim()) {
      setForm(prev => ({
        ...prev,
        authors: [...(prev.authors || []), authorInput.trim()]
      }));
      setAuthorInput('');
    }
  };
  
  const handleRemoveAuthor = (author: string) => {
    setForm(prev => ({
      ...prev,
      authors: prev.authors?.filter(a => a !== author)
    }));
  };
  
  const handleAddBook = () => {
    if (bookInput.trim()) {
      setForm(prev => ({
        ...prev,
        readBooks: [...(prev.readBooks || []), bookInput.trim()]
      }));
      setBookInput('');
    }
  };
  
  const handleRemoveBook = (book: string) => {
    setForm(prev => ({
      ...prev,
      readBooks: prev.readBooks?.filter(b => b !== book)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/recommendations', { state: { request: form } });
  };
  
  return (
    <div className="home-page">
      <header className="header">
        <h1>Book Recommendation App</h1>
        <p>Find your next favorite book based on your preferences</p>
      </header>
      
      <form className="recommendation-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Genres</h2>
          <div className="genre-options">
            {genreOptions.map(genre => (
              <label key={genre} className="genre-option">
                <input
                  type="checkbox"
                  checked={form.genres?.includes(genre) || false}
                  onChange={() => handleGenreChange(genre)}
                />
                {genre}
              </label>
            ))}
          </div>
        </div>
        
        <div className="form-section">
          <h2>Authors You Like</h2>
          <div className="input-with-button">
            <input
              type="text"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              placeholder="Enter author name"
            />
            <button type="button" onClick={handleAddAuthor}>Add</button>
          </div>
          
          {form.authors && form.authors.length > 0 && (
            <div className="tags">
              {form.authors.map(author => (
                <div key={author} className="tag">
                  {author}
                  <button type="button" onClick={() => handleRemoveAuthor(author)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h2>Books You've Read & Enjoyed</h2>
          <div className="input-with-button">
            <input
              type="text"
              value={bookInput}
              onChange={(e) => setBookInput(e.target.value)}
              placeholder="Enter book title"
            />
            <button type="button" onClick={handleAddBook}>Add</button>
          </div>
          
          {form.readBooks && form.readBooks.length > 0 && (
            <div className="tags">
              {form.readBooks.map(book => (
                <div key={book} className="tag">
                  {book}
                  <button type="button" onClick={() => handleRemoveBook(book)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h2>Language</h2>
          <select value={form.language} onChange={handleLanguageChange}>
            {languageOptions.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        
        <div className="form-section">
          <h2>Any Other Preferences</h2>
          <textarea
            value={form.preferences}
            onChange={handlePreferencesChange}
            placeholder="Describe what you're looking for in a book..."
            rows={4}
          />
        </div>
        
        <button type="submit" className="submit-button">Get Recommendations</button>
      </form>
    </div>
  );
};

export default HomePage; 