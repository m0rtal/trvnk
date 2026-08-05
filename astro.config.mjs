// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // The canonical site URL. Used for absolute links in
  // sitemap, RSS, Open Graph tags, JSON-LD, and canonical URLs.
  // Update this when deploying to a real domain.
  site: 'https://trvnk.ru',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
