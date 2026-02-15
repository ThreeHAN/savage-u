import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'waq8cp43',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2025-02-15',
  useCdn: false,
});
