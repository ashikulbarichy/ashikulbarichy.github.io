import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Sanity project configuration from environment variables
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03';
const token = import.meta.env.VITE_SANITY_API_TOKEN;

// Determine if Sanity is configured (projectId presence)
export const isSanityConfigured = !!projectId;

// Use CDN = false for real‑time freshness (preview mode).
// In production you may switch back to true for faster reads.
export const client = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    })
  : null;

// Image URL builder – only when client exists
const builder = client ? imageUrlBuilder(client) : null;

export function urlFor(source: any) {
  if (!builder || !source) return '';
  return builder.image(source).url();
}

