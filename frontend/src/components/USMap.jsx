import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// You need to set your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';

// GeoJSON source for US states
const US_STATES_SOURCE = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';

function USMap({ onStateClick, selectedState }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [hoveredState, setHoveredState] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (map.current) return; // Initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [-98.5795, 39.8283], // Center of USA
            zoom: 3.5,
            minZoom: 2,
            maxZoom: 8,
            pitch: 0,
            bearing: 0,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        map.current.on('load', () => {
            // Add US states source
            map.current.addSource('states', {
                type: 'geojson',
                data: US_STATES_SOURCE,
                generateId: true,
            });

            // Add states fill layer
            map.current.addLayer({
                id: 'states-fill',
                type: 'fill',
                source: 'states',
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        '#3b82f6', // Selected state color
                        ['boolean', ['feature-state', 'hover'], false],
                        '#1e40af', // Hover color
                        '#1e293b', // Default color
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        0.8,
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
                        ['boolean', ['feature-state', 'selected'], false],
                        '#60a5fa',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#3b82f6',
                        '#334155',
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        3,
                        ['boolean', ['feature-state', 'hover'], false],
                        2,
                        1,
                    ],
                },
            });

            setMapLoaded(true);
        });

        // Handle mouse move for hover effect
        let hoveredStateId = null;

        map.current.on('mousemove', 'states-fill', (e) => {
            if (e.features.length > 0) {
                if (hoveredStateId !== null) {
                    map.current.setFeatureState(
                        { source: 'states', id: hoveredStateId },
                        { hover: false }
                    );
                }
                hoveredStateId = e.features[0].id;
                map.current.setFeatureState(
                    { source: 'states', id: hoveredStateId },
                    { hover: true }
                );

                const stateName = e.features[0].properties.name;
                setHoveredState(stateName);
                map.current.getCanvas().style.cursor = 'pointer';
            }
        });

        map.current.on('mouseleave', 'states-fill', () => {
            if (hoveredStateId !== null) {
                map.current.setFeatureState(
                    { source: 'states', id: hoveredStateId },
                    { hover: false }
                );
            }
            hoveredStateId = null;
            setHoveredState(null);
            map.current.getCanvas().style.cursor = '';
        });

        // Handle click on state
        map.current.on('click', 'states-fill', (e) => {
            if (e.features.length > 0) {
                const stateName = e.features[0].properties.name;
                onStateClick(stateName);
            }
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [onStateClick]);

    // Update selected state highlighting
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        const source = map.current.getSource('states');
        if (!source) return;

        // Clear all selected states
        const features = map.current.querySourceFeatures('states');
        features.forEach((feature) => {
            map.current.setFeatureState(
                { source: 'states', id: feature.id },
                { selected: false }
            );
        });

        // Set selected state
        if (selectedState) {
            const selectedFeature = features.find(
                (f) => f.properties.name === selectedState
            );
            if (selectedFeature) {
                map.current.setFeatureState(
                    { source: 'states', id: selectedFeature.id },
                    { selected: true }
                );
            }
        }
    }, [selectedState, mapLoaded]);

    return (
        <div className="map-container">
            <div ref={mapContainer} className="map" />

            {hoveredState && (
                <div className="state-badge">
                    <span className="state-badge__icon" />
                    <span className="state-badge__text">
                        Hovering: <span className="state-badge__name">{hoveredState}</span>
                    </span>
                </div>
            )}

            {!selectedState && (
                <div className="instructions">
                    <span className="instructions__icon">👆</span>
                    <span className="instructions__text">
                        Click on any state to view news
                    </span>
                </div>
            )}
        </div>
    );
}

export default USMap;
