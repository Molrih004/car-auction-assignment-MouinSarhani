<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { getCars, type CarFilter } from '$lib/api/cars';
  import { getAuctions } from '$lib/api/auctions';
  import { ApiError } from '$lib/api/client';
  import type { Auction, AuctionStatus, Car, Condition, Listing } from '$lib/api/types';
  import { createNow } from '$lib/utils/now.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import CarCard from '$lib/components/CarCard.svelte';
  import MessageBox from '$lib/components/MessageBox.svelte';

  const now = createNow();

  let allCars = $state<Car[]>([]);
  let cars = $state<Car[]>([]);
  let auctions = $state<Auction[]>([]);
  let loading = $state(true);
  // Two errors, because the car service and the auction service can each be down on their own (NFR-10)
  let carsError = $state<string | null>(null);
  let auctionsError = $state<string | null>(null);
  const error = $derived(carsError ?? auctionsError);
  const errorMessage = (e: unknown) => (e instanceof ApiError ? e.message : 'Something went wrong.');

  /**
   * BRW-03: the filters live in the URL (?make=Citroën,Peugeot&yearTo=1979&condition=GOOD).
   * When Tom opens a car and goes back, the browser restores the URL and so the filters.
   */
  const list = (value: string | null) => (value ? value.split(',') : []);
  const filter = $derived<CarFilter>({
    makes: list(page.url.searchParams.get('make')),
    conditions: list(page.url.searchParams.get('condition')) as Condition[],
    yearFrom: Number(page.url.searchParams.get('yearFrom')) || undefined,
    yearTo: Number(page.url.searchParams.get('yearTo')) || undefined,
  });

  function setFilter(next: CarFilter) {
    const query = new URLSearchParams();
    if (next.makes.length) query.set('make', next.makes.join(','));
    if (next.conditions.length) query.set('condition', next.conditions.join(','));
    if (next.yearFrom) query.set('yearFrom', String(next.yearFrom));
    if (next.yearTo) query.set('yearTo', String(next.yearTo));
    const qs = query.toString();
    goto(qs ? `?${qs}` : '/', { replaceState: true, keepFocus: true, noScroll: true });
  }

  const makes = $derived([...new Set(allCars.map((car) => car.make))].sort());
  // Every year from the oldest to the newest car, plus the year in the URL (a link can hold any year)
  const years = $derived.by(() => {
    const all = allCars.map((car) => car.year);
    if (!all.length) return [];
    const from = Math.min(...all, filter.yearFrom ?? Infinity, filter.yearTo ?? Infinity);
    const to = Math.max(...all, filter.yearFrom ?? -Infinity, filter.yearTo ?? -Infinity);
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  });

  // A car can have had more than one auction: show the one that matters most for a buyer
  const PRIORITY: AuctionStatus[] = ['ACTIVE', 'PENDING', 'ENDED'];
  const listings = $derived<Listing[]>(
    cars
      .map((car) => {
        const auction = auctions
          .filter((a) => a.carId === car.id && a.status !== 'CANCELLED')
          .sort((a, b) => PRIORITY.indexOf(a.status) - PRIORITY.indexOf(b.status))[0];
        return auction ? { car, auction } : null;
      })
      .filter((listing): listing is Listing => listing !== null)
      .sort((a, b) => PRIORITY.indexOf(a.auction.status) - PRIORITY.indexOf(b.auction.status)
        || new Date(a.auction.endAt).getTime() - new Date(b.auction.endAt).getTime()),
  );

  async function loadCars(current: CarFilter) {
    try {
      cars = await getCars(current);
      carsError = null;
    } catch (e) {
      // NFR-10: a message instead of a blank page when a service is down
      carsError = errorMessage(e);
    }
    loading = false;
  }

  // Once: all cars (for the filter chips) and all auctions. allSettled: one service down doesn't stop the other.
  $effect(() => {
    Promise.allSettled([getCars(), getAuctions()]).then(([allCarsResult, auctionsResult]) => {
      if (allCarsResult.status === 'fulfilled') allCars = allCarsResult.value;
      if (auctionsResult.status === 'fulfilled') auctions = auctionsResult.value;
      else auctionsError = errorMessage(auctionsResult.reason);
    });
  });

  // Every time the filters in the URL change, ask the car service again
  $effect(() => {
    loadCars(filter);
  });
</script>

<main class="page">
  <h1>Cars at auction</h1>
  <FilterBar {makes} {years} {filter} onchange={setFilter} />

  {#if error}
    <MessageBox kind="error" title="We can't show the cars right now.">{error}</MessageBox>
  {:else if loading}
    <p class="muted">Loading cars...</p>
  {:else}
    <p class="muted small" aria-live="polite">
      {listings.length} {listings.length === 1 ? 'car matches' : 'cars match'} your filters
    </p>
    {#each listings as listing (listing.auction.id)}
      <CarCard {listing} now={now.value} />
    {/each}
    {#if !listings.length}
      <p class="card">No cars match these filters. Try fewer filters, or clear them.</p>
    {/if}
  {/if}
</main>
