import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// You need to set your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';

// GeoJSON source for world countries
const COUNTRIES_SOURCE = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

// GeoJSON sources for states/provinces of each country
const STATE_GEOJSON_SOURCES = {
    'United States': 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json',
    'India': 'https://raw.githubusercontent.com/Subhash9325/GeospatialData-India/master/Indian_States.json',
    'Australia': 'https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson',
    'Canada': 'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/canada-provinces.geojson',
    'Brazil': 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson',
    'Germany': 'https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/2_bundeslaender/4_niedrig.geo.json',
    'France': 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions.geojson',
    'Mexico': 'https://raw.githubusercontent.com/PhantomInsights/mexico-geojson/main/mexico.json',
    'Japan': 'https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson',
    'Italy': 'https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson',
    'Spain': 'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/spain-communities.geojson',
    'South Korea': 'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-geo.json',
};

// Property name for the state name in each GeoJSON source
const STATE_NAME_PROPERTY = {
    'United States': 'name',
    'India': 'NAME_1',
    'Australia': 'STATE_NAME',
    'Canada': 'name',
    'Brazil': 'name',
    'Germany': 'NAME_1',
    'France': 'nom',
    'Mexico': 'name',
    'Japan': 'nam',
    'Italy': 'reg_name',
    'Spain': 'name',
    'South Korea': 'name',
};

// Country centers and zoom levels
const COUNTRY_CENTERS = {
    'United States': { center: [-98.5795, 39.8283], zoom: 4 },
    'India': { center: [78.9629, 20.5937], zoom: 4 },
    'Australia': { center: [133.7751, -25.2744], zoom: 3.5 },
    'Canada': { center: [-106.3468, 56.1304], zoom: 3 },
    'Brazil': { center: [-51.9253, -14.2350], zoom: 3.5 },
    'Germany': { center: [10.4515, 51.1657], zoom: 5 },
    'France': { center: [2.2137, 46.2276], zoom: 5 },
    'Mexico': { center: [-102.5528, 23.6345], zoom: 4.5 },
    'Japan': { center: [138.2529, 36.2048], zoom: 5 },
    'Italy': { center: [12.5674, 41.8719], zoom: 5 },
    'Spain': { center: [-3.7038, 40.4168], zoom: 5 },
    'South Korea': { center: [127.7669, 35.9078], zoom: 6 },
};

// Map GeoJSON country names to our normalized names
const COUNTRY_NAME_MAP = {
    'United States of America': 'United States',
};

function WorldMap({ onLocationClick, selectedLocation, onViewChange, onClosePopup }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [currentCountry, setCurrentCountry] = useState(null);

    // Use ref for statesLoaded to avoid closure issues
    const statesLoadedRef = useRef(false);
    const currentCountryRef = useRef(null);
    const hoveredStateIdRef = useRef(null);
    const hoveredCountryIdRef = useRef(null);

    // Store callbacks in refs to avoid stale closures
    const onLocationClickRef = useRef(onLocationClick);
    onLocationClickRef.current = onLocationClick;

    // Normalize country name
    const normalizeCountryName = useCallback((name) => {
        return COUNTRY_NAME_MAP[name] || name;
    }, []);

    // Get state name from feature
    const getStateName = useCallback((feature, country) => {
        const prop = STATE_NAME_PROPERTY[country] || 'name';
        return feature.properties[prop] || feature.properties.name || feature.properties.NAME || 'Unknown';
    }, []);

    // Check if country has state data
    const hasStateData = useCallback((countryName) => {
        const normalized = normalizeCountryName(countryName);
        return !!STATE_GEOJSON_SOURCES[normalized];
    }, [normalizeCountryName]);

    // Remove states layer
    const removeStatesLayer = useCallback(() => {
        if (!map.current) return;

        try {
            if (map.current.getLayer('states-fill')) {
                map.current.removeLayer('states-fill');
            }
            if (map.current.getLayer('states-outline')) {
                map.current.removeLayer('states-outline');
            }
            if (map.current.getSource('states')) {
                map.current.removeSource('states');
            }
        } catch (e) {
            console.log('Layer removal error:', e);
        }

        hoveredStateIdRef.current = null;
        statesLoadedRef.current = false;
    }, []);

    // Load states GeoJSON for a country
    const loadStatesForCountry = useCallback(async (countryName) => {
        if (!map.current) return false;

        const normalized = normalizeCountryName(countryName);
        const geojsonUrl = STATE_GEOJSON_SOURCES[normalized];

        if (!geojsonUrl) {
            console.log('No GeoJSON available for', normalized);
            return false;
        }

        // First remove any existing states layer
        removeStatesLayer();

        try {
            console.log('Loading states for:', normalized, 'from:', geojsonUrl);

            // Add states source
            map.current.addSource('states', {
                type: 'geojson',
                data: geojsonUrl,
                generateId: true,
            });

            // Add states fill layer (ABOVE country layers)
            map.current.addLayer({
                id: 'states-fill',
                type: 'fill',
                source: 'states',
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#0ea5e9', // sky-500
                        '#1e293b', // slate-900
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        0.6,
                        0.4,
                    ],
                },
            });

            // Add states outline layer
            map.current.addLayer({
                id: 'states-outline',
                type: 'line',
                source: 'states',
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#7dd3fc', // sky-300
                        '#475569', // slate-600
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        2.5,
                        1,
                    ],
                },
            });

            // Set up state hover handlers
            map.current.on('mousemove', 'states-fill', (e) => {
                if (e.features.length > 0) {
                    if (hoveredStateIdRef.current !== null) {
                        map.current.setFeatureState(
                            { source: 'states', id: hoveredStateIdRef.current },
                            { hover: false }
                        );
                    }
                    hoveredStateIdRef.current = e.features[0].id;
                    map.current.setFeatureState(
                        { source: 'states', id: hoveredStateIdRef.current },
                        { hover: true }
                    );
                    const stateName = getStateName(e.features[0], currentCountryRef.current);
                    setHoveredItem({ type: 'state', name: stateName, country: currentCountryRef.current });
                    map.current.getCanvas().style.cursor = 'pointer';
                }
            });

            map.current.on('mouseleave', 'states-fill', () => {
                if (hoveredStateIdRef.current !== null) {
                    map.current.setFeatureState(
                        { source: 'states', id: hoveredStateIdRef.current },
                        { hover: false }
                    );
                }
                hoveredStateIdRef.current = null;
                setHoveredItem(null);
                map.current.getCanvas().style.cursor = '';
            });

            map.current.on('click', 'states-fill', (e) => {
                e.preventDefault();
                e.originalEvent.stopPropagation();

                if (e.features.length > 0) {
                    const stateName = getStateName(e.features[0], currentCountryRef.current);
                    console.log('State clicked:', stateName, 'Country:', currentCountryRef.current);

                    onLocationClickRef.current({
                        type: 'state',
                        name: stateName,
                        country: currentCountryRef.current
                    });
                }
            });

            statesLoadedRef.current = true;
            console.log('States loaded successfully for:', normalized);
            return true;
        } catch (error) {
            console.error('Error loading states GeoJSON:', error);
            return false;
        }
    }, [normalizeCountryName, getStateName, removeStatesLayer]);

    // Zoom to country and load states
    const zoomToCountry = useCallback(async (geoJsonCountryName) => {
        if (!map.current) return;

        const countryName = normalizeCountryName(geoJsonCountryName);
        const countryConfig = COUNTRY_CENTERS[countryName];

        if (countryConfig && hasStateData(countryName)) {
            // Fly to country
            map.current.flyTo({
                center: countryConfig.center,
                zoom: countryConfig.zoom,
                duration: 1500,
                essential: true,
            });

            // Update refs and state
            currentCountryRef.current = countryName;
            setCurrentCountry(countryName);

            // Load states after a short delay to let the map settle
            setTimeout(async () => {
                const loaded = await loadStatesForCountry(countryName);

                if (loaded) {
                    onViewChange('states', countryName);
                } else {
                    // No states available, show country news
                    onLocationClickRef.current({ type: 'country', name: countryName });
                }
            }, 500);
        } else {
            // No state data, show country news directly
            onLocationClickRef.current({ type: 'country', name: countryName });
        }
    }, [normalizeCountryName, hasStateData, loadStatesForCountry, onViewChange]);

    // Go back to world view
    const goBackToWorld = useCallback(() => {
        if (!map.current) return;

        removeStatesLayer();

        map.current.flyTo({
            center: [0, 20],
            zoom: 1.5,
            duration: 1500,
            essential: true,
        });

        currentCountryRef.current = null;
        setCurrentCountry(null);
        setHoveredItem(null);
        onViewChange('world', null);

        // Close the news popup when going back to world view
        if (onClosePopup) {
            onClosePopup();
        }
    }, [removeStatesLayer, onViewChange, onClosePopup]);

    // Initialize map
    useEffect(() => {
        if (map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/kav2599/cmko73nug001901ry1je1glzt',
            center: [0, 20],
            zoom: 1.5,
            minZoom: 1,
            maxZoom: 10,
            projection: 'mercator',
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        map.current.on('load', () => {
            // Add world countries source
            map.current.addSource('countries', {
                type: 'geojson',
                data: COUNTRIES_SOURCE,
                generateId: true,
            });

            // Add countries fill layer
            map.current.addLayer({
                id: 'countries-fill',
                type: 'fill',
                source: 'countries',
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#0ea5e9', // sky-500 (Cyan/Blue)
                        '#0f172a', // slate-900 (Dark background) or transparent
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        0.4,
                        0.0, // Transparent by default to let custom map show
                    ],
                },
            });

            // Add countries outline layer
            map.current.addLayer({
                id: 'countries-outline',
                type: 'line',
                source: 'countries',
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#38bdf8', // sky-400
                        '#334155', // slate-700
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        2,
                        0.5,
                    ],
                },
            });

            // Country hover handlers
            map.current.on('mousemove', 'countries-fill', (e) => {
                // Only handle country hover when NOT viewing states
                if (statesLoadedRef.current) return;

                if (e.features.length > 0) {
                    if (hoveredCountryIdRef.current !== null) {
                        map.current.setFeatureState(
                            { source: 'countries', id: hoveredCountryIdRef.current },
                            { hover: false }
                        );
                    }
                    hoveredCountryIdRef.current = e.features[0].id;
                    map.current.setFeatureState(
                        { source: 'countries', id: hoveredCountryIdRef.current },
                        { hover: true }
                    );
                    const geoJsonName = e.features[0].properties.ADMIN || e.features[0].properties.name;
                    const countryName = COUNTRY_NAME_MAP[geoJsonName] || geoJsonName;
                    setHoveredItem({
                        type: 'country',
                        name: countryName,
                        hasStates: !!STATE_GEOJSON_SOURCES[countryName]
                    });
                    map.current.getCanvas().style.cursor = 'pointer';
                }
            });

            map.current.on('mouseleave', 'countries-fill', () => {
                if (statesLoadedRef.current) return;

                if (hoveredCountryIdRef.current !== null) {
                    map.current.setFeatureState(
                        { source: 'countries', id: hoveredCountryIdRef.current },
                        { hover: false }
                    );
                }
                hoveredCountryIdRef.current = null;
                setHoveredItem(null);
                map.current.getCanvas().style.cursor = '';
            });

            // Country click handler
            map.current.on('click', 'countries-fill', (e) => {
                // Only handle country click when NOT viewing states
                if (statesLoadedRef.current) return;

                if (e.features.length > 0) {
                    const countryName = e.features[0].properties.ADMIN || e.features[0].properties.name;
                    zoomToCountry(countryName);
                }
            });

            setMapLoaded(true);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [zoomToCountry]);

    return (
        <div className="map-container">
            <div ref={mapContainer} className="map" />

            {/* Back button when viewing states */}
            {currentCountry && (
                <button className="back-button" onClick={goBackToWorld}>
                    ← Back to World
                </button>
            )}

            {/* Current country badge */}
            {currentCountry && (
                <div className="country-badge">
                    <span className="country-badge__icon">🌍</span>
                    <span className="country-badge__name">{currentCountry}</span>
                </div>
            )}

            {/* Hover indicator */}
            {hoveredItem && (
                <div className="state-badge">
                    <span className="state-badge__icon" />
                    <span className="state-badge__text">
                        <span className="state-badge__name">{hoveredItem.name}</span>
                        {hoveredItem.type === 'country' && hoveredItem.hasStates && (
                            <span className="state-badge__hint"> (click to explore states)</span>
                        )}
                        {hoveredItem.type === 'country' && !hoveredItem.hasStates && (
                            <span className="state-badge__hint"> (click for news)</span>
                        )}
                    </span>
                </div>
            )}

            {/* Instructions */}
            {!selectedLocation && !currentCountry && (
                <div className="instructions">
                    <span className="instructions__icon">🌍</span>
                    <span className="instructions__text">
                        Click on a country to explore its states
                    </span>
                </div>
            )}

            {currentCountry && !selectedLocation && (
                <div className="instructions">
                    <span className="instructions__icon">📍</span>
                    <span className="instructions__text">
                        Click on a state to view news
                    </span>
                </div>
            )}
        </div>
    );
}

export default WorldMap;
