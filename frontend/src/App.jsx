import { useState, useCallback } from 'react';
import WorldMap from './components/WorldMap';
import NewsPopup from './components/NewsPopup';
import './index.css';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentView, setCurrentView] = useState('world'); // 'world' or 'state'
  const [currentCountry, setCurrentCountry] = useState(null);

  const handleLocationClick = useCallback((location) => {
    // location = { type: 'country' | 'region', name: string, country?: string }
    setSelectedLocation(location);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  const handleViewChange = useCallback((view, country) => {
    setCurrentView(view);
    setCurrentCountry(country);
  }, []);

  // Get display name for popup
  const getLocationDisplay = () => {
    if (!selectedLocation) return '';
    if (selectedLocation.type === 'region' || selectedLocation.type === 'state') {
      return `${selectedLocation.name}, ${selectedLocation.country}`;
    }
    return selectedLocation.name;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header__logo">
          <div className="header__icon">🌍</div>
          <div>
            <h1 className="header__title">Global News Explorer</h1>
            <p className="header__subtitle">
              {currentView === 'world'
                ? 'Click on a country to explore its states'
                : `Exploring ${currentCountry}`}
            </p>
          </div>
        </div>
        <div className="header__status">
          <span className="header__status-dot" />
          <span className="header__status-text">Live</span>
        </div>
      </header>

      <WorldMap
        onLocationClick={handleLocationClick}
        selectedLocation={selectedLocation}
        onViewChange={handleViewChange}
        onClosePopup={handleClosePopup}
      />

      {selectedLocation && (
        <NewsPopup
          location={getLocationDisplay()}
          locationType={selectedLocation.type}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}

export default App;
