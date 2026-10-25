<script lang="ts">
  import { page } from '$app/state';
</script>

<main class="page">
  <h1>{page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
  <p>{page.status === 404 ? 'This page doesn\'t exist.' : page.error?.message} <a href="/">Go to the cars at auction</a></p>
</main>
