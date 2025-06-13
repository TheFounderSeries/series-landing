/**
 * Utility functions for handling images in the frontend
 */
import { getApiUrl } from './api';

/**
 * Convert a permanent GCS URL to a proxied URL that can be accessed by the frontend
 * 
 * @param url The permanent GCS URL (https://storage.googleapis.com/{bucket}/{blob})
 * @returns A proxied URL that can be accessed by the frontend
 */
export const getProxiedImageUrl = (url: string): string => {
  if (!url) {
    return '';
  }
  
  // If it's not a GCS URL, return as is
  if (!url.startsWith('https://storage.googleapis.com/')) {
    return url;
  }
  
  try {
    // Extract bucket and blob from the URL
    // Format: https://storage.googleapis.com/{bucket_name}/{blob_name}
    const gcsPrefix = 'https://storage.googleapis.com/';
    const path = url.substring(gcsPrefix.length);
    
    // Handle case where the URL might have query parameters
    const [pathWithoutParams] = path.split('?');
    
    // Split into parts
    const parts = pathWithoutParams.split('/');
    const bucket = parts[0];
    // We don't need to use the blob variable directly since we're using parts.slice(1) below
    
    // URL encode the bucket and blob to handle special characters and slashes
    const encodedBucket = encodeURIComponent(bucket);
    const encodedBlob = parts.slice(1).map(encodeURIComponent).join('/');
    
    // Return the proxied URL
    const proxiedUrl = `${getApiUrl(`users/profile-image/${encodedBucket}/${encodedBlob}`)}`;
    return proxiedUrl;
  } catch (error) {
    console.error('Error converting GCS URL to proxied URL:', error);
    return url; // Return original URL as fallback
  }
};

/**
 * Get absolute URL for profile image, handling both relative and absolute URLs
 * 
 * @param profilePic The profile picture URL
 * @returns An absolute URL for the profile picture
 */
export const getAbsoluteImageUrl = (profilePic?: string): string => {
  if (!profilePic) {
    const defaultUrl = `${window.location.origin}/default-avatar.png`;
    return defaultUrl;
  }
  
  // If the profile pic is already an absolute URL, proxy it if it's a GCS URL
  if (profilePic.startsWith('http')) {
    const result = getProxiedImageUrl(profilePic);
    return result;
  }
  
  // Otherwise, make it absolute
  const absoluteUrl = `${window.location.origin}${profilePic}`;
  return absoluteUrl;
};
