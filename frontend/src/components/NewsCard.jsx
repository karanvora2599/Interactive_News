
export default function NewsCard({ article }) {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric'
        });
    };

    const getArticleTheme = (article) => {
        const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();

        // Keywords for themes
        const natureKeywords = ['climate', 'environment', 'forest', 'park', 'wild', 'mountain', 'river', 'ocean', 'planet', 'animal', 'storm', 'weather', 'green'];
        const govtKeywords = ['election', 'vote', 'congress', 'senate', 'law', 'tax', 'economy', 'market', 'stock', 'trade', 'president', 'minister', 'policy', 'govt'];
        const negativeKeywords = ['dead', 'kill', 'crash', 'war', 'conflict', 'crisis', 'disaster', 'attack', 'murder', 'died', 'fail', 'risk', 'warning'];
        const positiveKeywords = ['win', 'success', 'record', 'grow', 'safe', 'peace', 'award', 'best', 'happy', 'celebrate', 'breakthrough', 'launch'];

        if (natureKeywords.some(k => text.includes(k))) return 'nature';
        if (govtKeywords.some(k => text.includes(k))) return 'govt';
        if (negativeKeywords.some(k => text.includes(k))) return 'negative';
        if (positiveKeywords.some(k => text.includes(k))) return 'positive';

        return 'default';
    };

    const theme = getArticleTheme(article);

    return (
        <div className={`news-card news-card--${theme}`}>
            <div className="news-card__content">
                <div className="news-card__header">
                    <span className={`news-card__badge news-card__badge--source news-card__badge--${theme}`}>{article.source}</span>
                    <span className="news-card__badge news-card__badge--live">
                        {formatDate(article.publishedAt)}
                    </span>
                </div>

                <h3 className="news-card__title">{article.title}</h3>

                {article.description && (
                    <p className="news-card__description">{article.description}</p>
                )}

                <div className="news-card__footer">
                    {article.url && (
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className={`news-card__action news-card__action--${theme}`}>
                            Read Article
                            <svg className="news-card__arrow" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
