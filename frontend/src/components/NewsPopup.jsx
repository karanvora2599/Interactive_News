import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function NewsPopup({ location, locationType, onClose }) {
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!location) return;

        const fetchNews = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_BASE_URL}/api/news/${encodeURIComponent(location)}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to fetch news');
                }

                const data = await response.json();
                setNews(data);
            } catch (err) {
                console.error('Error fetching news:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [location]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (!location) return null;

    return (
        <div className="news-popup">
            <div className="news-popup__header">
                <div className="news-popup__state">
                    <div className="news-popup__state-icon">
                        {locationType === 'region' || locationType === 'state' ? '📍' : '🌍'}
                    </div>
                    <div className="news-popup__state-info">
                        <span className="news-popup__state-name">{location}</span>
                        <span className="news-popup__state-type">
                            {locationType === 'region' || locationType === 'state' ? 'State/Province' : 'Country'}
                        </span>
                    </div>
                </div>
                <button className="news-popup__close" onClick={onClose} aria-label="Close">
                    ✕
                </button>
            </div>

            <div className="news-popup__content">
                {loading && (
                    <div className="news-popup__loading">
                        <div className="news-popup__spinner" />
                        <span>Searching news for {location}...</span>
                    </div>
                )}

                {error && (
                    <div className="news-popup__error">
                        <div className="news-popup__error-icon">⚠️</div>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && news && (
                    <>
                        {news.articles && news.articles.length > 0 ? (
                            news.articles.map((article, index) => (
                                <div key={index} className="article-card">
                                    {article.imageUrl ? (
                                        <div className="article-card__image-container">
                                            <img
                                                src={article.imageUrl}
                                                alt={article.title}
                                                className="article-card__image"
                                                onError={(e) => {
                                                    e.target.parentElement.innerHTML = '<div class="article-card__image article-card__image--placeholder">📰</div>';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="article-card__image article-card__image--placeholder">
                                            📰
                                        </div>
                                    )}

                                    <div className="article-card__body">
                                        <span className="article-card__source">
                                            📌 {article.source}
                                        </span>

                                        <h3 className="article-card__title">{article.title}</h3>

                                        {article.description && (
                                            <p className="article-card__description">{article.description}</p>
                                        )}

                                        <div className="article-card__footer">
                                            <span className="article-card__date">
                                                🗓️ {formatDate(article.publishedAt)}
                                            </span>

                                            {article.url && (
                                                <a
                                                    href={article.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="article-card__link"
                                                >
                                                    Read more →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="news-popup__error">
                                <div className="news-popup__error-icon">📭</div>
                                <p>{news.message || `No news found for ${location}`}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default NewsPopup;
