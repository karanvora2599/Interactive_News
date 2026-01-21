/**
 * API service for the Global News Explorer
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetch all available countries
 */
export async function getCountries() {
    const response = await fetch(`${API_BASE_URL}/api/countries`);
    if (!response.ok) {
        throw new Error('Failed to fetch countries');
    }
    return response.json();
}

/**
 * Fetch regions (states/provinces) for a country
 */
export async function getRegionsForCountry(countryName) {
    const response = await fetch(
        `${API_BASE_URL}/api/countries/${encodeURIComponent(countryName)}/regions`
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch regions for ${countryName}`);
    }
    return response.json();
}

/**
 * Fetch news for a location
 */
export async function getNewsForLocation(location, count = 1) {
    const response = await fetch(
        `${API_BASE_URL}/api/news/${encodeURIComponent(location)}?count=${count}`
    );
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch news');
    }
    return response.json();
}
