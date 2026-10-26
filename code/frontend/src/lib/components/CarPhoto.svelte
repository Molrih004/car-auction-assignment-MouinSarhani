<script lang="ts">
  /**
   * The demo photo of a car, from static/cars/<car id>.jpg (see static/cars/CREDITS.md).
   * A car without a photo gets the grey placeholder, so the layout stays the same.
   * Uploading photos (CAR-03) is not part of my 2 requirements.
   */
  let { carId, alt, class: className = '' }: { carId: string; alt: string; class?: string } = $props();

  let failed = $state(false);
</script>

{#if failed}
  <div class="photo {className}" aria-hidden="true">photo</div>
{:else}
  <img src="/cars/{carId}.jpg" {alt} class="photo {className}" loading="lazy" onerror={() => (failed = true)} />
{/if}
