import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    // A static app: the pages run in the browser and get their data from the gateway with fetch (AJAX).
    // fallback = every path gets index.html, the SvelteKit router then shows the right page.
    adapter: adapter({ fallback: 'index.html' }),
  },
};
