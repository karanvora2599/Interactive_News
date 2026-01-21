
import { useEffect, useState, useRef } from 'react';
import NewsCard from './NewsCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function NewsPopup({ location, locationType, onClose }) {
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Wave Animation Effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let time = 0;
        let animId;

        const waveData = Array.from({ length: 8 }).map(() => ({
            value: Math.random() * 0.5 + 0.1,
            targetValue: Math.random() * 0.5 + 0.1,
            speed: Math.random() * 0.02 + 0.01
        }));

        function resizeCanvas() {
            // Full screen canvas
            const width = window.innerWidth;
            const height = window.innerHeight;
            const dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            canvas.logicalWidth = width;
            canvas.logicalHeight = height;
        }

        function updateWaveData() {
            waveData.forEach(data => {
                if (Math.random() < 0.01) data.targetValue = Math.random() * 0.7 + 0.1;
                const diff = data.targetValue - data.value;
                data.value += diff * data.speed;
            });
        }

        function draw() {
            const width = canvas.logicalWidth || window.innerWidth;
            const height = canvas.logicalHeight || window.innerHeight;

            ctx.clearRect(0, 0, width, height);

            waveData.forEach((data, i) => {
                const freq = data.value * 7;
                ctx.beginPath();
                for (let x = 0; x < width; x++) {
                    const nx = (x / width) * 2 - 1;
                    const px = nx + i * 0.04 + freq * 0.03;
                    const py = Math.sin(px * 10 + time) * Math.cos(px * 2) * freq * 0.1 * ((i + 1) / 8);
                    const y = (py + 1) * height / 2;
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }

                const intensity = Math.min(1, freq * 0.3);
                const r = 79 + intensity * 100;
                const g = 70 + intensity * 130;
                const b = 229;

                ctx.lineWidth = 1 + i * 0.3;
                ctx.strokeStyle = `rgba(${r},${g},${b},0.6)`;
                ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
                ctx.shadowBlur = 5;
                ctx.stroke();
                ctx.shadowBlur = 0;
            });
        }

        function animate() {
            time += 0.02;
            updateWaveData();
            draw();
            animId = requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    // News Fetching logic
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

    if (!location) return null;

    return (
        <div className="news-popup-overlay">
            {/* Background Canvas */}
            <canvas ref={canvasRef} className="news-popup-canvas" />

            {/* Background Blur Layer */}
            <div className="news-popup-blur" />

            {/* Central Content Card */}
            <div className="news-popup-container">
                <div className="news-popup-card">
                    {/* Header */}
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

                    {/* Content Scroll Area */}
                    <div className="news-popup__content">
                        {loading && (
                            <div className="news-popup__loading">
                                <div className="news-popup__spinner" />
                                <span>Searching for stories...</span>
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
                                        <NewsCard key={index} article={article} />
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
            </div>
        </div>
    );
}

export default NewsPopup;
