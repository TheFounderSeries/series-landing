/**
 * API utilities for making requests to the backend
 */

// Get the API base URL from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Utility function to construct a full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  // If the endpoint already starts with http, assume it's a full URL
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // If the endpoint already starts with a slash, don't add another one
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${API_BASE_URL}${formattedEndpoint}`;
};

/**
 * API utility functions for common request patterns
 */
export const api = {
  /**
   * Make a GET request to the API
   */
  get: async (endpoint: string) => {
    const response = await fetch(getApiUrl(endpoint), {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Make a POST request with JSON data to the API
   */
  post: async (endpoint: string, data: any) => {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Make a POST request with FormData to the API
   */
  postFormData: async (endpoint: string, formData: FormData) => {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
};

export default api;
